#!/usr/bin/env python3
"""Build and validate the public GitHub Pages sitemap."""
from __future__ import annotations

import argparse
from pathlib import Path
from urllib.parse import quote
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "sitemap.xml"
SITE = "https://gyu1718.github.io/biblestudygyu/"
LIVE_DIRS = ("ot", "nt", "bible", "lexicon", "theology", "search")
EXCLUDED = {"404.html"}
NS = "http://www.sitemaps.org/schemas/sitemap/0.9"


def live_pages() -> list[Path]:
    pages = [path for path in ROOT.glob("*.html") if path.name not in EXCLUDED]
    for directory in LIVE_DIRS:
        base = ROOT / directory
        if base.exists():
            pages.extend(base.rglob("*.html"))
    return sorted(set(pages), key=lambda path: path.relative_to(ROOT).as_posix())


def page_url(path: Path) -> str:
    relative = path.relative_to(ROOT).as_posix()
    if relative == "index.html":
        return SITE
    if relative.endswith("/index.html"):
        relative = relative[: -len("index.html")]
    return SITE + quote(relative, safe="/-._~")


def build_xml() -> bytes:
    ET.register_namespace("", NS)
    root = ET.Element(f"{{{NS}}}urlset")
    for path in live_pages():
        url = ET.SubElement(root, f"{{{NS}}}url")
        ET.SubElement(url, f"{{{NS}}}loc").text = page_url(path)
    tree = ET.ElementTree(root)
    ET.indent(tree, space="  ")
    output = b'<?xml version="1.0" encoding="UTF-8"?>\n' + ET.tostring(root, encoding="utf-8") + b"\n"
    return output


def validate(payload: bytes) -> None:
    root = ET.fromstring(payload)
    locations = [node.text or "" for node in root.findall(f"{{{NS}}}url/{{{NS}}}loc")]
    expected = [page_url(path) for path in live_pages()]
    errors: list[str] = []
    if locations != expected:
        errors.append("sitemap URLs do not match live HTML pages")
    if len(locations) < 100:
        errors.append(f"unexpectedly small sitemap: {len(locations)} URLs")
    if len(locations) != len(set(locations)):
        errors.append("duplicate sitemap URLs")
    if SITE not in locations:
        errors.append("homepage URL missing")
    if SITE + "search/" not in locations:
        errors.append("search page URL missing")
    if any(location.endswith("404.html") for location in locations):
        errors.append("404 page must not appear in sitemap")
    if errors:
        raise SystemExit("\n".join(errors))
    print(f"사이트맵 검증 완료: {len(locations):,}개 공개 HTML URL")


def main() -> None:
    parser = argparse.ArgumentParser()
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--write", action="store_true")
    mode.add_argument("--check", action="store_true")
    args = parser.parse_args()

    payload = build_xml()
    validate(payload)
    if args.write:
        OUTPUT.write_bytes(payload)
    elif not OUTPUT.exists() or OUTPUT.read_bytes() != payload:
        raise SystemExit("sitemap.xml is missing or stale")


if __name__ == "__main__":
    main()
