#!/usr/bin/env python3
"""모든 연구 HTML에 공통 화면 설정·연구 도크 자산을 적용한다.

사용법:
  python3 tools/apply_study_tools.py --write
  python3 tools/apply_study_tools.py --check

기본 대상:
  ot/**/*.html
  nt/**/*.html
  theology/**/*.html

특정 문서에서 자동 적용을 피하려면 HTML에 data-no-study-tools 속성을 둔다.
"""
from __future__ import annotations

import argparse
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGET_ROOTS = ("ot", "nt", "theology")
SKIP_PARTS = {"templates", "assets", "bible"}
OPT_OUT_MARK = "data-no-study-tools"

THEME_ASSET = "assets/theme.css"
APP_CSS_ASSET = "assets/app.css"
APP_JS_ASSET = "assets/app.js"

THEME_MARK = "data-site-theme"
APP_CSS_MARK = "data-site-app-css"
APP_JS_MARK = "data-study-tools-js"


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


def has_asset(text: str, asset: str) -> bool:
    """상대경로와 쿼리 문자열에 관계없이 공통 자산 포함 여부를 확인한다."""
    return asset in text


def insert_before(text: str, closing_tag: str, tag: str) -> str:
    if closing_tag not in text:
        raise ValueError(f"{closing_tag} 태그가 없습니다")
    return text.replace(closing_tag, f"  {tag}\n{closing_tag}", 1)


def patch_html(path: Path, text: str) -> tuple[str, list[str]]:
    changes: list[str] = []

    if OPT_OUT_MARK in text:
        return text, changes

    if not has_asset(text, THEME_ASSET):
        href = relative_asset(path, THEME_ASSET)
        text = insert_before(
            text,
            "</head>",
            f'<link rel="stylesheet" href="{href}" {THEME_MARK}>',
        )
        changes.append("theme.css")

    if not has_asset(text, APP_CSS_ASSET):
        href = relative_asset(path, APP_CSS_ASSET)
        text = insert_before(
            text,
            "</head>",
            f'<link rel="stylesheet" href="{href}" {APP_CSS_MARK}>',
        )
        changes.append("app.css")

    if not has_asset(text, APP_JS_ASSET):
        src = relative_asset(path, APP_JS_ASSET)
        text = insert_before(
            text,
            "</body>",
            f'<script src="{src}" {APP_JS_MARK}></script>',
        )
        changes.append("app.js")

    return text, changes


def main() -> None:
    parser = argparse.ArgumentParser()
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--write", action="store_true", help="누락 자산을 실제 HTML에 삽입")
    mode.add_argument("--check", action="store_true", help="누락 여부만 검사")
    args = parser.parse_args()

    files = list(target_files())
    changed: list[tuple[Path, list[str]]] = []
    errors: list[str] = []
    opted_out: list[Path] = []

    for path in files:
        original = path.read_text(encoding="utf-8")
        if OPT_OUT_MARK in original:
            opted_out.append(path)
            continue
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
    if opted_out:
        print(f"자동 적용 제외: {len(opted_out)}개")

    if changed:
        action = "삽입" if args.write else "누락"
        print(f"공통 도구 자산 {action}: {len(changed)}개")
        for path, changes in changed[:50]:
            print(f"- {path.relative_to(ROOT)} ({', '.join(changes)})")
        if len(changed) > 50:
            print(f"- 외 {len(changed) - 50}개")
    else:
        print("모든 연구 HTML에 화면 설정·연구 도크 자산이 연결되어 있습니다.")

    if errors:
        print("처리 오류:")
        for error in errors:
            print(f"- {error}")
        raise SystemExit(1)

    if args.check and changed:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
