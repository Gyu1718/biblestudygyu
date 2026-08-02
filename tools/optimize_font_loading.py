#!/usr/bin/env python3
"""Optimize Google Fonts loading for live HTML pages.

- Adds a crossorigin preconnect to fonts.gstatic.com whenever Google Fonts is used.
- Reduces Noto Serif KR requests to weights 400 and 700.
- Leaves source/reference directories outside the live site untouched.
"""
from __future__ import annotations

import argparse
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LIVE_DIRS = ("ot", "nt", "bible", "lexicon", "theology")
GSTATIC = '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
SERIF_RE = re.compile(r"Noto\+Serif\+KR:wght@([0-9;]+)")
GOOGLE_PRECONNECT_RE = re.compile(
    r'<link\s+rel=["\']preconnect["\']\s+href=["\']https://fonts\.googleapis\.com["\']\s*/?>',
    re.IGNORECASE,
)
FIRST_GOOGLE_RE = re.compile(r'<link\b[^>]+href=["\'][^"\']*fonts\.googleapis\.com[^"\']*["\'][^>]*>', re.IGNORECASE)


def live_html_files() -> list[Path]:
    files = sorted(ROOT.glob("*.html"))
    for directory in LIVE_DIRS:
        base = ROOT / directory
        if base.exists():
            files.extend(sorted(base.rglob("*.html")))
    return files


def patch_text(text: str) -> str:
    if "fonts.googleapis.com" not in text:
        return text

    text = SERIF_RE.sub("Noto+Serif+KR:wght@400;700", text)
    if "fonts.gstatic.com" in text:
        return text

    match = GOOGLE_PRECONNECT_RE.search(text)
    if match:
        return text[: match.end()] + "\n" + GSTATIC + text[match.end() :]

    match = FIRST_GOOGLE_RE.search(text)
    if match:
        return text[: match.start()] + GSTATIC + "\n" + text[match.start() :]

    head = re.search(r"<head[^>]*>", text, re.IGNORECASE)
    if head:
        return text[: head.end()] + "\n" + GSTATIC + text[head.end() :]
    raise RuntimeError("Google Fonts URL found without a <head> element")


def validate(files: dict[Path, str]) -> list[str]:
    errors: list[str] = []
    for path, text in files.items():
        if "fonts.googleapis.com" not in text:
            continue
        if "fonts.gstatic.com" not in text:
            errors.append(f"{path.relative_to(ROOT)}: fonts.gstatic.com preconnect missing")
        for weights in SERIF_RE.findall(text):
            if weights != "400;700":
                errors.append(f"{path.relative_to(ROOT)}: Noto Serif KR weights={weights}")
        if text.count("fonts.gstatic.com") != 1:
            errors.append(f"{path.relative_to(ROOT)}: duplicate gstatic preconnect")
    return errors


def main() -> None:
    parser = argparse.ArgumentParser()
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--write", action="store_true")
    mode.add_argument("--check", action="store_true")
    args = parser.parse_args()

    paths = live_html_files()
    original = {path: path.read_text(encoding="utf-8") for path in paths}
    patched = {path: patch_text(text) for path, text in original.items()}
    errors = validate(patched)
    if errors:
        raise SystemExit("\n".join(errors))

    changed = [path for path in paths if original[path] != patched[path]]
    if args.write:
        for path in changed:
            path.write_text(patched[path], encoding="utf-8")
    else:
        stale = [str(path.relative_to(ROOT)) for path in changed]
        if stale:
            raise SystemExit("font loading is stale:\n" + "\n".join(stale))

    users = sum("fonts.googleapis.com" in patched[path] for path in paths)
    print(f"폰트 로딩 검증 완료: Google Fonts 사용 {users}개, 변경 {len(changed)}개")


if __name__ == "__main__":
    main()
