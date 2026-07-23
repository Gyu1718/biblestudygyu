#!/usr/bin/env python3
"""연구 HTML에 공통 성경 리더 자산을 자동 삽입한다.

사용법:
  python3 tools/apply_bible_reader.py --write
  python3 tools/apply_bible_reader.py --check
"""
from __future__ import annotations

import argparse
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGET_ROOTS = ("ot", "nt", "theology")
SKIP_PARTS = {"templates", "assets", "bible"}
CSS_MARK = "data-bible-reader-css"
JS_MARK = "data-bible-reader-js"


def target_files():
    for root_name in TARGET_ROOTS:
        root = ROOT / root_name
        if not root.exists():
            continue
        for path in sorted(root.rglob("*.html")):
            if any(part in SKIP_PARTS for part in path.parts):
                continue
            yield path


def relative_asset(path: Path, asset: str) -> str:
    return Path(os.path.relpath(ROOT / asset, path.parent)).as_posix()


def patch_html(path: Path, text: str) -> tuple[str, list[str]]:
    changes: list[str] = []

    if CSS_MARK not in text:
        css = relative_asset(path, "assets/css/bible-reader.css")
        tag = f'<link rel="stylesheet" href="{css}" {CSS_MARK}>'
        if "</head>" not in text:
            raise ValueError("</head> 태그가 없습니다")
        text = text.replace("</head>", f"  {tag}\n</head>", 1)
        changes.append("css")

    if JS_MARK not in text:
        js = relative_asset(path, "assets/js/bible-reader.js")
        tag = f'<script src="{js}" defer {JS_MARK}></script>'
        if "</body>" not in text:
            raise ValueError("</body> 태그가 없습니다")
        text = text.replace("</body>", f"  {tag}\n</body>", 1)
        changes.append("js")

    return text, changes


def main() -> None:
    parser = argparse.ArgumentParser()
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--write", action="store_true", help="누락 자산을 실제로 삽입")
    mode.add_argument("--check", action="store_true", help="누락 여부만 검사")
    args = parser.parse_args()

    files = list(target_files())
    changed: list[tuple[Path, list[str]]] = []
    errors: list[str] = []

    for path in files:
        original = path.read_text(encoding="utf-8")
        try:
            updated, changes = patch_html(path, original)
        except ValueError as exc:
            errors.append(f"{path.relative_to(ROOT)}: {exc}")
            continue

        if not changes:
            continue
        changed.append((path, changes))
        if args.write:
            path.write_text(updated, encoding="utf-8")

    print(f"검사한 연구 HTML: {len(files)}개")
    if changed:
        action = "삽입" if args.write else "누락"
        print(f"성경 리더 자산 {action}: {len(changed)}개")
        for path, changes in changed[:30]:
            print(f"- {path.relative_to(ROOT)} ({', '.join(changes)})")
        if len(changed) > 30:
            print(f"- 외 {len(changed) - 30}개")
    else:
        print("모든 연구 HTML에 성경 리더가 연결되어 있습니다.")

    if errors:
        print("처리 오류:")
        for error in errors:
            print(f"- {error}")
        raise SystemExit(1)

    if args.check and changed:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
