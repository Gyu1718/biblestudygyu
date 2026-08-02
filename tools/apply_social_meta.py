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

FALLBACK_DESCRIPTIONS = {
    "index.html": "본문, 원어, 주석, 관주를 연결해 성경과 신학 연구 자료를 책별 서가로 제공하는 아카이브.",
    "ot/genesis/index.html": "창세기 성경읽기, 종합 개관, 장별 심층연구와 원어 연구를 연결한 연구 서가.",
    "ot/nehemiah/index.html": "느헤미야 열세 장의 성경읽기, 종합 개관, 심층 주해와 원어 연구를 연결한 연구 서가.",
    "ot/esther/index.html": "에스더의 페르시아 궁정 배경, 문학 구조, 수용사와 열 장의 심층 주해를 모은 연구 서가.",
    "ot/psalms/index.html": "시편 150편을 다섯 권의 정경 구조로 읽는 전체 개관, 자료집과 권별 상세 연구.",
    "ot/hosea/index.html": "호세아의 혼인 서사, 심판과 회복, 열네 장의 절별 주해와 신학을 종합한 연구 노트.",
    "ot/joel/index.html": "요엘의 메뚜기 재앙, 여호와의 날, 회개, 영의 부어짐과 열방 심판을 다룬 연구 서가.",
    "ot/haggai/index.html": "학개의 네 신탁을 성경읽기, 종합 개관, 두 장의 심층연구와 원어 연구로 연결한 서가.",
    "nt/acts/index.html": "사도행전 스물여덟 장의 성경읽기, 종합 개관과 장별 심층 주해를 연결한 연구 서가.",
    "nt/romans/index.html": "로마서 열여섯 장의 성경읽기, 종합 개관, 장별 심층연구와 보완 자료를 연결한 연구 서가.",
}

TITLE_RE = re.compile(r"<title\b[^>]*>(.*?)</title>", re.IGNORECASE | re.DOTALL)
META_RE = re.compile(r"<meta\b[^>]*>", re.IGNORECASE)
ATTR_RE = re.compile(r"([:\w-]+)\s*=\s*([\"'])(.*?)\2", re.DOTALL)
BLOCK_RE = re.compile(re.escape(START) + r".*?" + re.escape(END), re.DOTALL)


def attrs(tag: str) -> dict[str, str]:
    return {name.lower(): html.unescape(value.strip()) for name, _, value in ATTR_RE.findall(tag)}


def title_tag(text: str, path: Path) -> tuple[str, str]:
    match = TITLE_RE.search(text)
    if not match:
        raise RuntimeError(f"{path.relative_to(ROOT)} has no title")
    title = html.unescape(re.sub(r"\s+", " ", match.group(1))).strip()
    return match.group(0), title


def description_tag(text: str, relative: str) -> tuple[str | None, str]:
    for match in META_RE.finditer(text):
        tag = match.group(0)
        data = attrs(tag)
        if data.get("name", "").lower() == "description" and data.get("content"):
            return tag, data["content"]
    fallback = FALLBACK_DESCRIPTIONS.get(relative)
    if not fallback:
        raise RuntimeError(f"{relative} has no meta description or fallback")
    return None, fallback


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
    title_html, title = title_tag(text, path)
    description_html, description = description_tag(text, relative)
    block = social_block(title, description, absolute_url(relative))

    if START in text:
        patched, count = BLOCK_RE.subn(block, text, count=1)
        if count != 1:
            raise RuntimeError(f"{relative}: malformed social metadata block")
        return patched

    if description_html:
        anchor = description_html
        insertion = description_html + "\n" + block
    else:
        q_description = html.escape(description, quote=True)
        anchor = title_html
        insertion = title_html + f'\n<meta name="description" content="{q_description}">\n' + block
    return text.replace(anchor, insertion, 1)


def validate(files: dict[Path, str]) -> list[str]:
    errors: list[str] = []
    for relative in PAGES:
        path = ROOT / relative
        text = files[path]
        expected_url = absolute_url(relative)
        checks = (
            (text.count(START) == 1 and text.count(END) == 1, "metadata block count"),
            ('name="description"' in text or "name='description'" in text, "meta description"),
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
