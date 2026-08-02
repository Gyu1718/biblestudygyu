#!/usr/bin/env python3
"""Maintain static-site crawlability, deployment hygiene, and cache consistency."""

from __future__ import annotations

import argparse
import re
import shutil
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[1]
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
LIVE_ROOTS = {"bible", "content", "lexicon", "nt", "ot", "search"}

OLD_NOSCRIPT = '<main id="shelves"><noscript><section class="shelf-sec"><div class="sec-head"><h2>구약 연구</h2></div><p><a href="ot/nehemiah/index.html">느헤미야 심층 연구 — 전 14권</a></p></section></noscript></main>'
NEW_NOSCRIPT = '''<main id="shelves"><noscript>
<section class="shelf-sec"><div class="sec-head"><h2>성경과 원어 도구</h2></div><p><a href="bible/original.html">성경읽기</a> · <a href="lexicon/index.html">히브리어·헬라어 스트롱 사전</a> · <a href="search/index.html">사이트 전체 검색</a></p></section>
<section class="shelf-sec"><div class="sec-head"><h2>구약 연구</h2></div><p><a href="ot/genesis/index.html">창세기</a> · <a href="ot/nehemiah/index.html">느헤미야</a> · <a href="ot/esther/index.html">에스더</a> · <a href="ot/psalms/index.html">시편</a> · <a href="ot/hosea/index.html">호세아</a> · <a href="ot/joel/index.html">요엘</a> · <a href="ot/haggai/index.html">학개</a></p></section>
<section class="shelf-sec"><div class="sec-head"><h2>신약 연구</h2></div><p><a href="nt/acts/index.html">사도행전</a> · <a href="nt/romans/index.html">로마서</a></p></section>
</noscript></main>'''


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
    for path in sorted(ROOT.rglob("*.html")):
        rel = path.relative_to(ROOT)
        if rel.parts[0].startswith(".") or any(part in EXCLUDED_PARTS for part in rel.parts):
            continue
        if len(rel.parts) > 1 and rel.parts[0] not in LIVE_ROOTS:
            continue
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
    normalize_cache_versions(check=args.check, problems=problems)
    maintain_sitemap(check=args.check, problems=problems)

    if problems:
        print("\n".join(problems))
        return 1
    print("site foundations are synchronized")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
