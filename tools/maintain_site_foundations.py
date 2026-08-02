#!/usr/bin/env python3
"""Maintain crawlability, deployment hygiene, cache consistency, and accessibility."""

from __future__ import annotations

import argparse
import re
import shutil
from pathlib import Path
from urllib.parse import quote

ROOT = Path.cwd().resolve()
SITE_BASE = "https://gyu1718.github.io/biblestudygyu/"
CACHE_VERSION = "20260802.1"
FORBIDDEN_ROOTS = (
    "repo_files",
    "auto_contrast_patch",
    "optional-assets",
    "package-info",
    "examples",
    "templates",
)
EXCLUDED_PARTS = {".git", ".github", "tools", *FORBIDDEN_ROOTS}
LIVE_ROOTS = {"bible", "content", "encyclopedia", "lexicon", "nt", "ot", "search"}

OLD_NOSCRIPT = '<main id="shelves"><noscript><section class="shelf-sec"><div class="sec-head"><h2>구약 연구</h2></div><p><a href="ot/nehemiah/index.html">느헤미야 심층 연구 — 전 14권</a></p></section></noscript></main>'
NEW_NOSCRIPT = '''<main id="shelves"><noscript>
<section class="shelf-sec"><div class="sec-head"><h2>성경과 원어 도구</h2></div><p><a href="bible/original.html">성경읽기</a> · <a href="lexicon/index.html">히브리어·헬라어 스트롱 사전</a> · <a href="search/index.html">사이트 전체 검색</a></p></section>
<section class="shelf-sec"><div class="sec-head"><h2>구약 연구</h2></div><p><a href="ot/genesis/index.html">창세기</a> · <a href="ot/nehemiah/index.html">느헤미야</a> · <a href="ot/esther/index.html">에스더</a> · <a href="ot/psalms/index.html">시편</a> · <a href="ot/hosea/index.html">호세아</a> · <a href="ot/joel/index.html">요엘</a> · <a href="ot/haggai/index.html">학개</a></p></section>
<section class="shelf-sec"><div class="sec-head"><h2>신약 연구</h2></div><p><a href="nt/acts/index.html">사도행전</a> · <a href="nt/romans/index.html">로마서</a></p></section>
</noscript></main>'''

SKIP_LINK_CSS_MARKER = "SCRIPTORIUM_SKIP_LINK_V1"
SKIP_LINK_CSS = '''\n/* SCRIPTORIUM_SKIP_LINK_V1: keyboard users can bypass repeated navigation. */
.skip-link{
  position:fixed; left:1rem; top:-5rem; z-index:10000;
  border-radius:6px; background:var(--lapis-deep); color:#fff;
  padding:.65rem .9rem; font-family:var(--sans); font-size:.75rem;
  font-weight:700; text-decoration:none; box-shadow:var(--shadow-md);
  transition:top .15s ease;
}
.skip-link:focus,.skip-link:focus-visible{top:1rem;outline:3px solid var(--ochre);outline-offset:2px}
@media print{.skip-link{display:none}}
'''

HEBREW_TAG_RE = re.compile(
    r'<[A-Za-z][^<>]*\blang\s*=\s*(["\'])he\1[^<>]*>', re.IGNORECASE
)
BODY_RE = re.compile(r'<body\b[^>]*>', re.IGNORECASE)
TARGET_PATTERNS = (
    re.compile(r'<main\b[^>]*>', re.IGNORECASE),
    re.compile(r'<article\b[^>]*>', re.IGNORECASE),
    re.compile(r'<div\b[^>]*\bid\s*=\s*(["\'])content\1[^>]*>', re.IGNORECASE),
    re.compile(r'<h1\b[^>]*>', re.IGNORECASE),
)


def public_html_files() -> list[Path]:
    files: list[Path] = []
    for path in sorted(ROOT.rglob("*.html")):
        rel = path.relative_to(ROOT)
        if rel.parts[0].startswith(".") or any(part in EXCLUDED_PARTS for part in rel.parts):
            continue
        if len(rel.parts) == 1 or rel.parts[0] in LIVE_ROOTS:
            files.append(path)
    return files


def update_text(path: Path, transform, *, check: bool, problems: list[str]) -> None:
    source = path.read_text(encoding="utf-8")
    updated = transform(source)
    if updated == source:
        return
    if check:
        problems.append(f"stale: {path.relative_to(ROOT)}")
    else:
        path.write_text(updated, encoding="utf-8")


def maintain_noscript(*, check: bool, problems: list[str]) -> None:
    path = ROOT / "index.html"

    def transform(source: str) -> str:
        if OLD_NOSCRIPT in source:
            return source.replace(OLD_NOSCRIPT, NEW_NOSCRIPT, 1)
        if NEW_NOSCRIPT in source:
            return source
        raise RuntimeError("Could not identify the homepage noscript block")

    update_text(path, transform, check=check, problems=problems)


def remove_deployment_debris(*, check: bool, problems: list[str]) -> None:
    for name in FORBIDDEN_ROOTS:
        path = ROOT / name
        if not path.exists():
            continue
        if check:
            problems.append(f"deployment-only path remains: {name}/")
        else:
            shutil.rmtree(path)

    delete_list = ROOT / "DELETE-FILES.txt"
    if delete_list.exists():
        if check:
            problems.append("obsolete file remains: DELETE-FILES.txt")
        else:
            delete_list.unlink()


def repair_acts_link(*, check: bool, problems: list[str]) -> None:
    path = ROOT / "nt/acts/commentary-addenda.html"
    update_text(
        path,
        lambda source: source.replace(
            'id="study" href="ch"', 'id="study" href="ch01.html"', 1
        ),
        check=check,
        problems=problems,
    )


def add_hebrew_direction(source: str) -> str:
    def replace(match: re.Match[str]) -> str:
        tag = match.group(0)
        if re.search(r"\bdir\s*=", tag, re.IGNORECASE):
            return tag
        return tag[:-1] + ' dir="rtl">'

    return HEBREW_TAG_RE.sub(replace, source)


def add_attribute(tag: str, name: str, value: str) -> str:
    if re.search(rf"\b{re.escape(name)}\s*=", tag, re.IGNORECASE):
        return tag
    return tag[:-1] + f' {name}="{value}">'


def add_skip_link(source: str) -> str:
    if re.search(r'class\s*=\s*(["\'])[^"\']*\bskip-link\b', source, re.IGNORECASE):
        return source

    body_match = BODY_RE.search(source)
    if not body_match:
        return source

    target_match = None
    for pattern in TARGET_PATTERNS:
        target_match = pattern.search(source, body_match.end())
        if target_match:
            break
    if not target_match:
        return source

    target_tag = target_match.group(0)
    id_match = re.search(r'\bid\s*=\s*(["\'])([^"\']+)\1', target_tag, re.IGNORECASE)
    target_id = id_match.group(2) if id_match else "main-content"
    updated_target = add_attribute(target_tag, "id", target_id)
    updated_target = add_attribute(updated_target, "tabindex", "-1")

    source = source[:target_match.start()] + updated_target + source[target_match.end():]
    body_match = BODY_RE.search(source)
    if not body_match:
        return source
    link = f'<a class="skip-link" href="#{target_id}">본문으로 건너뛰기</a>'
    return source[:body_match.end()] + link + source[body_match.end():]


def maintain_accessibility(*, check: bool, problems: list[str]) -> None:
    app_css = ROOT / "assets/app.css"

    def css_transform(source: str) -> str:
        if SKIP_LINK_CSS_MARKER in source:
            return source
        return source.rstrip() + "\n" + SKIP_LINK_CSS

    update_text(app_css, css_transform, check=check, problems=problems)

    for path in public_html_files():
        def transform(source: str) -> str:
            return add_skip_link(add_hebrew_direction(source))

        update_text(path, transform, check=check, problems=problems)


def normalize_cache_versions(*, check: bool, problems: list[str]) -> None:
    pattern = re.compile(r"\?v=\d{8}(?:\.\d+)?")
    for path in ROOT.rglob("*"):
        if not path.is_file() or path.suffix.lower() not in {".html", ".js", ".css"}:
            continue
        if any(part in EXCLUDED_PARTS for part in path.relative_to(ROOT).parts):
            continue
        update_text(
            path,
            lambda source, pattern=pattern: pattern.sub(f"?v={CACHE_VERSION}", source),
            check=check,
            problems=problems,
        )


def sitemap_content() -> str:
    urls: set[str] = set()
    for path in public_html_files():
        rel = path.relative_to(ROOT)
        source = path.read_text(encoding="utf-8", errors="ignore")
        if re.search(r'<meta\s+name=["\']robots["\'][^>]*noindex', source, re.I):
            continue
        posix = rel.as_posix()
        if posix == "index.html":
            url_path = ""
        elif posix.endswith("/index.html"):
            url_path = posix[:-10]
        else:
            url_path = posix
        encoded = "/".join(quote(segment) for segment in url_path.split("/"))
        urls.add(SITE_BASE + encoded)

    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    lines.extend(f"  <url><loc>{url}</loc></url>" for url in sorted(urls))
    lines.append("</urlset>")
    return "\n".join(lines) + "\n"


def maintain_sitemap(*, check: bool, problems: list[str]) -> None:
    path = ROOT / "sitemap.xml"
    expected = sitemap_content()
    current = path.read_text(encoding="utf-8") if path.exists() else ""
    if current == expected:
        return
    if check:
        problems.append("stale: sitemap.xml")
    else:
        path.write_text(expected, encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="report drift without writing")
    args = parser.parse_args()

    problems: list[str] = []
    maintain_noscript(check=args.check, problems=problems)
    remove_deployment_debris(check=args.check, problems=problems)
    repair_acts_link(check=args.check, problems=problems)
    maintain_accessibility(check=args.check, problems=problems)
    normalize_cache_versions(check=args.check, problems=problems)
    maintain_sitemap(check=args.check, problems=problems)

    if problems:
        print("\n".join(problems))
        return 1
    print("site foundations are synchronized")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
