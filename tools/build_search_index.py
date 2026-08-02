#!/usr/bin/env python3
"""Build a deterministic search index from live HTML pages.

The index intentionally stores title, description, headings, and only the first
6,000 visible body characters. This keeps the payload compact while making the
site's study documents searchable without a server or external search service.
"""
from __future__ import annotations

import argparse
import html
import json
import re
import unicodedata
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "assets" / "data" / "search-index.json"
LIVE_DIRS = ("ot", "nt", "bible", "lexicon", "theology")
MAX_BODY = 6000
SKIP_TAGS = {"script", "style", "noscript", "svg", "nav", "footer", "template"}
HEADING_TAGS = {"h1", "h2", "h3"}


def clean(value: str) -> str:
    value = unicodedata.normalize("NFKC", html.unescape(value))
    value = value.replace("\u200b", "").replace("\ufeff", "")
    return re.sub(r"\s+", " ", value).strip()


class PageExtractor(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.title_parts: list[str] = []
        self.description = ""
        self.headings: list[str] = []
        self.body_parts: list[str] = []
        self.in_title = False
        self.in_body = False
        self.heading_tag: str | None = None
        self.heading_parts: list[str] = []
        self.skip_depth = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        tag = tag.lower()
        data = {name.lower(): (value or "") for name, value in attrs}
        if tag == "title":
            self.in_title = True
        elif tag == "body":
            self.in_body = True
        elif tag == "meta" and data.get("name", "").lower() == "description":
            self.description = data.get("content", self.description)
        if tag in SKIP_TAGS:
            self.skip_depth += 1
        if tag in HEADING_TAGS and self.skip_depth == 0:
            self.heading_tag = tag
            self.heading_parts = []

    def handle_endtag(self, tag: str) -> None:
        tag = tag.lower()
        if tag == "title":
            self.in_title = False
        elif tag == "body":
            self.in_body = False
        if self.heading_tag == tag:
            heading = clean(" ".join(self.heading_parts))
            if heading and heading not in self.headings:
                self.headings.append(heading)
            self.heading_tag = None
            self.heading_parts = []
        if tag in SKIP_TAGS and self.skip_depth:
            self.skip_depth -= 1

    def handle_data(self, data: str) -> None:
        if self.in_title:
            self.title_parts.append(data)
        if self.heading_tag and self.skip_depth == 0:
            self.heading_parts.append(data)
        if self.in_body and self.skip_depth == 0:
            self.body_parts.append(data)

    def result(self) -> tuple[str, str, list[str], str]:
        title = clean(" ".join(self.title_parts))
        description = clean(self.description)
        headings = self.headings[:40]
        body = clean(" ".join(self.body_parts))[:MAX_BODY]
        return title, description, headings, body


def live_html_files() -> list[Path]:
    files = sorted(ROOT.glob("*.html"))
    for directory in LIVE_DIRS:
        base = ROOT / directory
        if base.exists():
            files.extend(sorted(base.rglob("*.html")))
    return files


def category(relative: Path) -> str:
    parts = relative.parts
    if not parts or len(parts) == 1:
        return "홈"
    return {
        "ot": "구약",
        "nt": "신약",
        "bible": "성경읽기",
        "lexicon": "원어사전",
        "theology": "조직신학",
    }.get(parts[0], "기타")


def book_label(relative: Path) -> str:
    parts = relative.parts
    if len(parts) < 2:
        return ""
    names = {
        "genesis": "창세기", "nehemiah": "느헤미야", "esther": "에스더",
        "psalms": "시편", "hosea": "호세아", "joel": "요엘", "haggai": "학개",
        "acts": "사도행전", "romans": "로마서",
    }
    return names.get(parts[1], "")


def extract(path: Path) -> dict[str, object] | None:
    relative = path.relative_to(ROOT)
    parser = PageExtractor()
    try:
        parser.feed(path.read_text(encoding="utf-8"))
    except (UnicodeDecodeError, OSError) as exc:
        raise RuntimeError(f"failed to parse {relative}: {exc}") from exc
    title, description, headings, body = parser.result()
    if not title:
        return None
    if not description:
        description = body[:220]
    return {
        "id": relative.as_posix(),
        "url": relative.as_posix(),
        "title": title,
        "description": description,
        "headings": headings,
        "text": body,
        "category": category(relative),
        "book": book_label(relative),
    }


def build() -> dict[str, object]:
    documents = []
    for path in live_html_files():
        document = extract(path)
        if document:
            documents.append(document)
    documents.sort(key=lambda item: str(item["url"]))
    return {
        "version": 1,
        "bodyLimit": MAX_BODY,
        "documents": documents,
    }


def validate(index: dict[str, object]) -> list[str]:
    errors: list[str] = []
    documents = index.get("documents")
    if not isinstance(documents, list) or len(documents) < 100:
        errors.append(f"unexpected document count: {len(documents) if isinstance(documents, list) else 'invalid'}")
        return errors
    ids = [str(document.get("id", "")) for document in documents if isinstance(document, dict)]
    if len(ids) != len(set(ids)):
        errors.append("duplicate document ids")
    for required in ("index.html", "ot/genesis/index.html", "nt/romans/index.html", "bible/original.html"):
        if required not in ids:
            errors.append(f"missing required page: {required}")
    for document in documents:
        if not isinstance(document, dict):
            errors.append("non-object document")
            continue
        for key in ("url", "title", "description", "headings", "text", "category"):
            if key not in document:
                errors.append(f"{document.get('id', '?')}: missing {key}")
        if len(str(document.get("text", ""))) > MAX_BODY:
            errors.append(f"{document.get('id', '?')}: body exceeds limit")
    return errors


def main() -> None:
    parser = argparse.ArgumentParser()
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--write", action="store_true")
    mode.add_argument("--check", action="store_true")
    args = parser.parse_args()

    index = build()
    errors = validate(index)
    if errors:
        raise SystemExit("\n".join(errors))
    serialized = json.dumps(index, ensure_ascii=False, separators=(",", ":")) + "\n"

    if args.write:
        OUTPUT.parent.mkdir(parents=True, exist_ok=True)
        OUTPUT.write_text(serialized, encoding="utf-8")
    else:
        if not OUTPUT.exists() or OUTPUT.read_text(encoding="utf-8") != serialized:
            raise SystemExit("search index is missing or stale")

    documents = index["documents"]
    body_chars = sum(len(str(document["text"])) for document in documents)  # type: ignore[index]
    print(f"검색 색인 검증 완료: {len(documents):,}문서, 본문 {body_chars:,}자")


if __name__ == "__main__":
    main()
