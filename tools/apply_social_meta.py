#!/usr/bin/env python3
"""Add Open Graph and Twitter metadata to the homepage and book shelves."""
from __future__ import annotations

import argparse
import html
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SITE = "https://gyu1718.github.io/biblestudygyu/"
IMAGE = SITE + "assets/og/site-preview.png"
START = "<!-- SCRIPTORIUM_SOCIAL_META_V1 -->"
END = "<!-- /SCRIPTORIUM_SOCIAL_META_V1 -->"

PAGES = (
    "index.html",
    "ot/genesis/index.html",
    "ot/nehemiah/index.html",
    "ot/esther/index.html",
    "ot/psalms/index.html",
    "ot/hosea/index.html",
    "ot/joel/index.html",
    "ot/haggai/index.html",
    "nt/acts/index.html",
    "nt/romans/index.html",
)

TITLE_RE = re.compile(r"<title\b[^>]*>(.*?)</title>", re.IGNORECASE | re.DOTALL)
META_RE = re.compile(r"<meta\b[^>]*>", re.IGNORECASE)
ATTR_RE = re.compile(r"([:\w-]+)\s*=\s*([\"'])(.*?)\2", re.DOTALL)
BLOCK_RE = re.compile(re.escape(START) + r".*?" + re.escape(END), re.DOTALL)


def attrs(tag: str) -> dict[str, str]:
    return {name.lower(): html.unescape(value.strip()) for name, _, value in ATTR_RE.findall(tag)}


def page_title(text: str, path: Path) -> str:
    match = TITLE_RE.search(text)
    if not match:
        raise RuntimeError(f"{path.relative_to(ROOT)} has no title")
    return html.unescape(re.sub(r"\s+", " ", match.group(1))).strip()


def description_tag(text: str, path: Path) -> tuple[str, str]:
    for match in META_RE.finditer(text):
        tag = match.group(0)
        data = attrs(tag)
        if data.get("name", "").lower() == "description" and data.get("content"):
            return tag, data["content"]
    raise RuntimeError(f"{path.relative_to(ROOT)} has no meta description")


def absolute_url(relative: str) -> str:
    return SITE if relative == "index.html" else SITE + relative


def social_block(title: str, description: str, url: str) -> str:
    q = lambda value: html.escape(value, quote=True)
    return "\n".join(
        (
            START,
            '<meta property="og:type" content="website">',
            '<meta property="og:locale" content="ko_KR">',
            '<meta property="og:site_name" content="성서 연구 서고">',
            f'<meta property="og:title" content="{q(title)}">',
            f'<meta property="og:description" content="{q(description)}">',
            f'<meta property="og:url" content="{q(url)}">',
            f'<meta property="og:image" content="{q(IMAGE)}">',
            '<meta property="og:image:width" content="1200">',
            '<meta property="og:image:height" content="630">',
            '<meta property="og:image:type" content="image/png">',
            '<meta property="og:image:alt" content="성서 연구 서고 — 본문, 원어, 주석, 관주를 연결하는 연구 아카이브">',
            '<meta name="twitter:card" content="summary_large_image">',
            f'<meta name="twitter:title" content="{q(title)}">',
            f'<meta name="twitter:description" content="{q(description)}">',
            f'<meta name="twitter:image" content="{q(IMAGE)}">',
            '<meta name="twitter:image:alt" content="성서 연구 서고 공유 미리보기">',
            END,
        )
    )


def patch_page(path: Path, relative: str) -> str:
    text = path.read_text(encoding="utf-8")
    title = page_title(text, path)
    description_html, description = description_tag(text, path)
    block = social_block(title, description, absolute_url(relative))
    if START in text:
        patched, count = BLOCK_RE.subn(block, text, count=1)
        if count != 1:
            raise RuntimeError(f"{relative}: malformed social metadata block")
        return patched
    return text.replace(description_html, description_html + "\n" + block, 1)


def validate(files: dict[Path, str]) -> list[str]:
    errors: list[str] = []
    for relative in PAGES:
        path = ROOT / relative
        text = files[path]
        expected_url = absolute_url(relative)
        checks = (
            (text.count(START) == 1 and text.count(END) == 1, "metadata block count"),
            ('property="og:title"' in text, "og:title"),
            ('property="og:description"' in text, "og:description"),
            (f'property="og:url" content="{expected_url}"' in text, "og:url"),
            (f'property="og:image" content="{IMAGE}"' in text, "og:image"),
            ('name="twitter:card" content="summary_large_image"' in text, "twitter:card"),
            ('name="twitter:title"' in text, "twitter:title"),
            ('name="twitter:description"' in text, "twitter:description"),
            ('name="twitter:image"' in text, "twitter:image"),
        )
        for passed, label in checks:
            if not passed:
                errors.append(f"{relative}: missing or invalid {label}")
    return errors


def main() -> None:
    parser = argparse.ArgumentParser()
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--write", action="store_true")
    mode.add_argument("--check", action="store_true")
    args = parser.parse_args()

    files = {ROOT / relative: patch_page(ROOT / relative, relative) for relative in PAGES}
    errors = validate(files)
    if errors:
        raise SystemExit("\n".join(errors))

    if args.write:
        for path, text in files.items():
            path.write_text(text, encoding="utf-8")
    else:
        stale = [str(path.relative_to(ROOT)) for path, expected in files.items() if path.read_text(encoding="utf-8") != expected]
        if stale:
            raise SystemExit("social metadata is stale: " + ", ".join(stale))

    print(f"공유 메타 검증 완료: 홈 + 책 서가 {len(PAGES)}개")


if __name__ == "__main__":
    main()
