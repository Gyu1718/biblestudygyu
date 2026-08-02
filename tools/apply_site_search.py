#!/usr/bin/env python3
"""Expose site-wide search from the homepage and research dock."""
from __future__ import annotations

import argparse
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"
DOCK = ROOT / "assets" / "js" / "research-dock.js"
SEARCH_CSS = ROOT / "assets" / "css" / "site-search.css"
MARKER = "SCRIPTORIUM_SITE_SEARCH_V1"


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
    topbar = '<div class="topbar"><a class="mark" href="./"><span class="hb">ד</span>성서 연구 서고</a><span id="bookCount">책 0권 · 문서 0편</span></div>'
    replacement = '<div class="topbar"><a class="mark" href="./"><span class="hb">ד</span>성서 연구 서고</a><span class="topbar-actions"><a class="home-search-link" href="search/index.html">전체 검색</a><span id="bookCount">책 0권 · 문서 0편</span></span></div>'
    text = replace_once(text, topbar, replacement, "homepage search link")
    style_anchor = '.topbar .mark .hb{font-family:var(--heb);color:var(--ochre);margin-right:.4rem}\n'
    style = style_anchor + '.topbar-actions{display:flex;align-items:center;gap:.85rem}.home-search-link{color:var(--lapis);font-weight:700;text-decoration:none}.home-search-link:hover{text-decoration:underline;text-underline-offset:3px} /* ' + MARKER + ' */\n'
    return replace_once(text, style_anchor, style, "homepage search link styles")


def patch_dock(text: str) -> str:
    if MARKER in text:
        return text
    context_anchor = '    else if (/^lexicon\\/entry\\.html?$/i.test(rel)) type = "lexicon-entry";\n'
    context = context_anchor + '    else if (/^search\\/index\\.html?$/i.test(rel)) type = "site-search"; // ' + MARKER + '\n'
    text = replace_once(text, context_anchor, context, "search page context")

    action_anchor = '    if (ctx.type !== "original") actions.push({ id:"bible", label:"원어성경", icon:"bible", href:originalUrl(ctx) });\n'
    action = '    if (ctx.type !== "site-search") actions.push({ id:"site-search", label:"전체 검색", icon:"search", href:href("search/index.html") });\n' + action_anchor
    return replace_once(text, action_anchor, action, "dock search action")


def patch_search_css(text: str) -> str:
    if MARKER in text:
        return text
    utilities = '''/* SCRIPTORIUM_SITE_SEARCH_V1 */
.sr-only{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}
.skip-link{position:fixed;left:1rem;top:-5rem;z-index:10000;border-radius:6px;background:var(--lapis-deep);color:#fff;padding:.65rem .9rem;font:700 .75rem var(--sans);text-decoration:none;transition:top .15s}.skip-link:focus{top:1rem}
.search-hint kbd{border:1px solid var(--line);border-bottom-width:2px;border-radius:4px;background:var(--card);padding:.05rem .28rem;color:var(--ink-soft);font:600 .62rem var(--sans)}
'''
    return utilities + text


def patched_files() -> dict[Path, str]:
    return {
        INDEX: patch_index(INDEX.read_text(encoding="utf-8")),
        DOCK: patch_dock(DOCK.read_text(encoding="utf-8")),
        SEARCH_CSS: patch_search_css(SEARCH_CSS.read_text(encoding="utf-8")),
    }


def validate(files: dict[Path, str]) -> list[str]:
    errors: list[str] = []
    if 'href="search/index.html">전체 검색' not in files[INDEX]:
        errors.append("index.html: search link missing")
    if 'type = "site-search"' not in files[DOCK]:
        errors.append("research-dock.js: search context missing")
    if 'label:"전체 검색"' not in files[DOCK]:
        errors.append("research-dock.js: search action missing")
    for selector in (".sr-only{", ".skip-link{", ".search-hint kbd{"):
        if selector not in files[SEARCH_CSS]:
            errors.append(f"site-search.css: missing {selector}")
    return errors


def main() -> None:
    parser = argparse.ArgumentParser()
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--write", action="store_true")
    mode.add_argument("--check", action="store_true")
    args = parser.parse_args()

    files = patched_files()
    errors = validate(files)
    if errors:
        raise SystemExit("\n".join(errors))

    if args.write:
        for path, text in files.items():
            path.write_text(text, encoding="utf-8")
    else:
        stale = [str(path.relative_to(ROOT)) for path, expected in files.items() if path.read_text(encoding="utf-8") != expected]
        if stale:
            raise SystemExit("site search navigation is stale: " + ", ".join(stale))

    print("전체 검색 진입점 검증 완료: 홈 상단 + 연구 도크")


if __name__ == "__main__":
    main()
