#!/usr/bin/env python3
"""Apply and validate homepage theme/flash fixes (issues 5–7)."""
from __future__ import annotations

import argparse
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"
CATALOG = ROOT / "catalog.js"
APP = ROOT / "assets" / "app.js"
MARKER = "SCRIPTORIUM_HOME_THEME_V1"


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if new in text:
        return text
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{label}: expected one target, found {count}")
    return text.replace(old, new, 1)


def patch_index(text: str) -> str:
    if MARKER in text:
        return text

    prepaint = '''<meta name="viewport" content="width=device-width, initial-scale=1.0">
<script>/* SCRIPTORIUM_HOME_THEME_V1 */(function(){try{var t=localStorage.getItem("scriptorium-theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t);else document.documentElement.removeAttribute("data-theme")}catch(e){}})();</script>'''
    text = replace_once(
        text,
        '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
        prepaint,
        "prepaint theme",
    )

    fonts = '''<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;500;600;700;900&family=Noto+Serif+Hebrew:wght@400;700&family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet">'''
    static_assets = fonts + '''
<link rel="stylesheet" href="assets/theme.css?v=20260802.1">
<link rel="stylesheet" href="assets/app.css?v=20260802.1">'''
    text = replace_once(text, fonts, static_assets, "static common CSS")

    # Remove the duplicated home palette. Keep only variables that are home-specific.
    text, count = re.subn(
        r':root\{\n  --ink:#202a35;--ink-soft:#4a5563;--paper:#f7f6f1;--panel:#ffffff;\n'
        r'  --lapis:#1f4e78;--lapis-deep:#16354f;--ochre:#a8823c;--ochre-soft:#c9b27a;\n'
        r'  --line:#d9d5c9;--board:#2b2119;\n'
        r'  --serif:"Noto Serif KR","Apple SD Gothic Neo",serif;\n'
        r'  --sans:"Noto Sans KR","Apple SD Gothic Neo",sans-serif;\n'
        r'  --heb:"Noto Serif Hebrew","SBL Hebrew",serif;\n\}',
        ':root{--panel:var(--card);--board:#2b2119}\n:root[data-theme="dark"]{--board:#0f1115}',
        text,
        count=1,
    )
    if count != 1:
        raise RuntimeError(f"inline palette: expected one block, found {count}")

    text = replace_once(
        text,
        '</style>\n</head>',
        '</style>\n<link rel="stylesheet" href="assets/css/home-compact.css?v=20260802.1">\n</head>',
        "static home compact CSS",
    )
    text = replace_once(
        text,
        '<script src="catalog.js?v=20260801.6"></script>',
        '<script src="catalog.js?v=20260802.1"></script>\n<script src="assets/js/research-dock-loader.js?v=20260802.1" defer></script>',
        "static research dock loader",
    )
    return text


def patch_catalog(text: str) -> str:
    if MARKER in text:
        return text
    home_loader = '(function(){if(typeof document==="undefined")return;if(!document.querySelector("link[data-home-compact-css]")){var l=document.createElement("link");l.rel="stylesheet";l.href="assets/css/home-compact.css";l.dataset.homeCompactCss="";document.head.appendChild(l)}})();\n'
    dock_loader = '(function(){if(typeof document==="undefined"||document.querySelector("script[data-rd-loader]"))return;var c=document.currentScript,s=c&&c.src?new URL("assets/js/research-dock-loader.js?v=20260801.5",c.src).href:"assets/js/research-dock-loader.js?v=20260801.5",n=document.createElement("script");n.src=s;n.dataset.rdLoader="";document.head.appendChild(n)})();\n'
    if home_loader not in text or dock_loader not in text:
        raise RuntimeError("catalog runtime loader blocks not found")
    text = text.replace(home_loader, "", 1).replace(dock_loader, "", 1)
    return text.rstrip() + "\n/* " + MARKER + ": homepage assets are linked statically by index.html. */\n"


def patch_app(text: str) -> str:
    if MARKER in text:
        return text
    mount = '''  function mountThemeToggle() {
    if (document.getElementById("theme-toggle")) return;
'''
    replacement = '''  function dockThemeControlExpected() { // SCRIPTORIUM_HOME_THEME_V1
    return Boolean(
      window.__SCRIPTORIUM_DOCK_LOADER__ ||
      document.querySelector('script[data-rd-loader],script[src*="research-dock-loader.js"]')
    );
  }

  function mountThemeToggle() {
    if (dockThemeControlExpected() || document.getElementById("theme-toggle")) return;
'''
    return replace_once(text, mount, replacement, "theme toggle guard")


def patched() -> dict[Path, str]:
    return {
        INDEX: patch_index(INDEX.read_text(encoding="utf-8")),
        CATALOG: patch_catalog(CATALOG.read_text(encoding="utf-8")),
        APP: patch_app(APP.read_text(encoding="utf-8")),
    }


def validate(files: dict[Path, str]) -> list[str]:
    errors: list[str] = []
    index = files[INDEX]
    catalog = files[CATALOG]
    app = files[APP]

    for required in (
        "assets/theme.css?v=20260802.1",
        "assets/app.css?v=20260802.1",
        "assets/css/home-compact.css?v=20260802.1",
        "assets/js/research-dock-loader.js?v=20260802.1",
        'localStorage.getItem("scriptorium-theme")',
    ):
        if required not in index:
            errors.append(f"index.html missing {required}")
    if "--ink:#202a35" in index or "--lapis:#1f4e78" in index:
        errors.append("index.html still contains duplicate palette variables")
    if "data-home-compact-css" in catalog or "data-rd-loader" in catalog:
        errors.append("catalog.js still injects homepage assets")
    if "dockThemeControlExpected" not in app:
        errors.append("app.js lacks dock-aware toggle guard")
    if '.set-card .cta' not in index:
        errors.append("home CTA rule unexpectedly missing")
    return errors


def main() -> None:
    parser = argparse.ArgumentParser()
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--write", action="store_true")
    mode.add_argument("--check", action="store_true")
    args = parser.parse_args()

    files = patched()
    errors = validate(files)
    if errors:
        raise SystemExit("\n".join(errors))

    if args.write:
        for path, text in files.items():
            path.write_text(text, encoding="utf-8")
    else:
        stale = [str(path.relative_to(ROOT)) for path, expected in files.items() if path.read_text(encoding="utf-8") != expected]
        if stale:
            raise SystemExit("homepage theme fixes are stale: " + ", ".join(stale))

    print("홈 테마 검증 완료: 정적 CSS, 첫 페인트 테마, 단일 토글")


if __name__ == "__main__":
    main()
