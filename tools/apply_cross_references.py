#!/usr/bin/env python3
"""Apply and validate the shared cross-reference UI.

This script keeps the generated-reader changes idempotent and reviewable. It:
- adds resilient xref loading to the original/Korean parallel reader;
- emits data-v attributes for every rendered verse row;
- adds native <details> panels for verse cross references;
- normalizes study-page book slugs in app.js;
- exposes a chapter-level cross-reference action in the research dock;
- documents the feature on bible/original.html.
"""
from __future__ import annotations

import argparse
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ORIGINAL_JS = ROOT / "assets" / "js" / "original-reader.js"
ORIGINAL_CSS = ROOT / "assets" / "css" / "original-reader.css"
APP_JS = ROOT / "assets" / "app.js"
DOCK_JS = ROOT / "assets" / "js" / "research-dock.js"
ORIGINAL_HTML = ROOT / "bible" / "original.html"

MARKER = "SCRIPTORIUM_XREFS_V1"


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if new in text:
        return text
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{label}: expected one replacement target, found {count}")
    return text.replace(old, new, 1)


def patch_original_reader(text: str) -> str:
    if MARKER in text:
        return text

    text = replace_once(
        text,
        '  var NA28_MANIFEST_URL = new URL("manifest.json", NA28_DATA_ROOT).href;\n',
        '  var NA28_MANIFEST_URL = new URL("manifest.json", NA28_DATA_ROOT).href;\n'
        '  var XREF_DATA_ROOT = new URL("data/xrefs/", siteRoot).href;\n'
        '  var XREF_SUPPORTED = { GEN:1, NEH:1, EST:1, PSA:1, HOS:1, JOL:1, HAG:1, ACT:1, ROM:1 }; // ' + MARKER + '\n',
        "original-reader roots",
    )
    text = replace_once(
        text,
        '  var originalCache = new Map();\n',
        '  var originalCache = new Map();\n  var xrefCache = new Map();\n',
        "original-reader cache",
    )

    load_json = '''  function loadJson(url, errorMessage) {
    return fetch(url, { credentials: "same-origin" }).then(function (response) {
      if (!response.ok) throw new Error(errorMessage);
      return response.json();
    });
  }
'''
    load_xrefs = load_json + '''
  function loadXrefs(code) {
    if (!XREF_SUPPORTED[code]) return Promise.resolve({});
    if (xrefCache.has(code)) return xrefCache.get(code);
    var url = new URL(code.toLowerCase() + ".json", XREF_DATA_ROOT).href;
    var promise = fetch(url, { credentials: "same-origin" }).then(function (response) {
      if (response.status === 404) return {};
      if (!response.ok) throw new Error("관주 데이터를 불러오지 못했습니다.");
      return response.json();
    }).catch(function () {
      return {};
    });
    xrefCache.set(code, promise);
    return promise;
  }
'''
    text = replace_once(text, load_json, load_xrefs, "original-reader xref loader")

    render_signature = '  function render(code, chapter, selected, end) {\n'
    xref_helpers = '''  function xrefMarkup(refs, chapter, verseNumber) {
    if (!refs || !refs.length) return "";
    var items = refs.map(function (item) {
      var vote = typeof item.v === "number" ? '<span class="or-xref-vote">+' + item.v + '</span>' : "";
      return '<li><span class="or-xref-ref">' + escapeHtml(item.r) + '</span>' + vote + '</li>';
    }).join("");
    return '<details class="or-xrefs" data-xref-count="' + refs.length + '">' +
      '<summary><span>관주</span><span class="or-xref-count">' + refs.length + '</span></summary>' +
      '<div class="or-xref-body"><p class="or-xref-label">' + chapter + ':' + verseNumber + '과 연결되는 본문</p>' +
      '<ul class="or-xref-list">' + items + '</ul></div></details>';
  }

'''
    text = replace_once(
        text,
        render_signature,
        xref_helpers + render_signature,
        "original-reader renderer helpers",
    )
    text = replace_once(
        text,
        '    Promise.all([loadKorean(code), loadOriginal(code)]).then(function (values) {\n',
        '    Promise.all([loadKorean(code), loadOriginal(code), loadXrefs(code)]).then(function (values) {\n',
        "original-reader promises",
    )
    text = replace_once(
        text,
        '      var original = values[1];\n',
        '      var original = values[1];\n      var xrefs = values[2] || {};\n',
        "original-reader xref result",
    )
    text = replace_once(
        text,
        '      versesBox.innerHTML = verseNumbers.map(function (verseNumber) {\n',
        '      var chapterXrefs = xrefs[String(chapter)] || {};\n      versesBox.innerHTML = verseNumbers.map(function (verseNumber) {\n',
        "original-reader chapter xrefs",
    )
    text = replace_once(
        text,
        "        return '<article class=\"or-verse-row' + (active ? ' is-selected' : '') + '\" id=\"verse-' + verseNumber + '\">' +\n",
        "        return '<article class=\"or-verse-row' + (active ? ' is-selected' : '') + '\" id=\"verse-' + verseNumber + '\" data-v=\"' + verseNumber + '\">' +\n",
        "original-reader data-v",
    )
    text = replace_once(
        text,
        '''          '<div class="or-cell or-korean">' +
            '<span class="or-num">' + verseNumber + '</span>' +
            (koreanText ? escapeHtml(koreanText) : '<span class="or-missing">개역개정 본문 없음</span>') +
          '</div>' +
        '</article>';
''',
        '''          '<div class="or-cell or-korean">' +
            '<span class="or-num">' + verseNumber + '</span>' +
            (koreanText ? escapeHtml(koreanText) : '<span class="or-missing">개역개정 본문 없음</span>') +
          '</div>' +
          xrefMarkup(chapterXrefs[String(verseNumber)] || [], chapter, verseNumber) +
        '</article>';
''',
        "original-reader xref markup",
    )
    return text


def patch_original_css(text: str) -> str:
    if MARKER in text:
        return text
    addition = '''
/* SCRIPTORIUM_XREFS_V1 */
.or-xrefs{grid-column:1/-1;margin:0;border-top:1px solid #e4e0d7;background:#f8f7f3;font-family:var(--sans)}
.or-xrefs summary{display:flex;align-items:center;gap:.45rem;width:max-content;max-width:100%;padding:.62rem 1.15rem;color:var(--lapis);font-size:.73rem;font-weight:700;cursor:pointer;list-style:none}
.or-xrefs summary::-webkit-details-marker{display:none}.or-xrefs summary:before{content:"▸";font-size:.7rem;transition:transform .15s}.or-xrefs[open] summary:before{transform:rotate(90deg)}
.or-xref-count{display:inline-flex;align-items:center;justify-content:center;min-width:1.35rem;height:1.35rem;padding:0 .35rem;border-radius:999px;background:#e0e8ef;color:var(--deep);font-size:.64rem}
.or-xref-body{padding:0 1.15rem .9rem}.or-xref-label{margin:0 0 .45rem;color:var(--soft);font-size:.66rem}
.or-xref-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(10rem,1fr));gap:.34rem .75rem;margin:0;padding:0;list-style:none}
.or-xref-list li{display:flex;align-items:baseline;justify-content:space-between;gap:.5rem;border-bottom:1px dotted #d6d1c6;padding:.28rem 0;font-size:.72rem}
.or-xref-ref{color:var(--ink)}.or-xref-vote{flex:none;color:var(--ochre);font-size:.61rem;font-weight:700}
@media(max-width:760px){.or-xrefs{margin:0}.or-xrefs summary{padding:.58rem 1rem}.or-xref-body{padding:0 1rem .8rem}.or-xref-list{grid-template-columns:1fr 1fr}}
@media(max-width:420px){.or-xref-list{grid-template-columns:1fr}}
'''
    return text.rstrip() + "\n" + addition


def patch_app_js(text: str) -> str:
    if MARKER in text:
        return text
    needle = '''  var BOOK = document.body ? document.body.getAttribute("data-book") : null;
  var CHAP = document.body ? document.body.getAttribute("data-chapter") : null;
'''
    replacement = needle + '''  var XREF_BOOK_KEY = { // SCRIPTORIUM_XREFS_V1
    genesis:"gen", gen:"gen", nehemiah:"neh", neh:"neh", esther:"est", est:"est",
    psalms:"psa", psalm:"psa", psa:"psa", hosea:"hos", hos:"hos", joel:"jol", jol:"jol",
    haggai:"hag", hag:"hag", acts:"act", act:"act", romans:"rom", rom:"rom"
  };
  function xrefBookKey() {
    var key = String(BOOK || "").toLowerCase();
    return XREF_BOOK_KEY[key] || key;
  }
'''
    text = replace_once(text, needle, replacement, "app.js book normalization")
    text = replace_once(
        text,
        '  function xrefUrl()  { return dataRoot() + "data/xrefs/" + BOOK + ".json"; }\n',
        '  function xrefUrl()  { return dataRoot() + "data/xrefs/" + xrefBookKey() + ".json"; }\n',
        "app.js xref URL",
    )
    return text


def patch_dock_js(text: str) -> str:
    if MARKER in text:
        return text
    text = replace_once(
        text,
        '  var ICON = {\n',
        '  var XREF_BOOKS = { GEN:1, NEH:1, EST:1, PSA:1, HOS:1, JOL:1, HAG:1, ACT:1, ROM:1 }; // ' + MARKER + '\n\n  var ICON = {\n',
        "research dock xref books",
    )
    bible_action = '    if (ctx.type !== "original") actions.push({ id:"bible", label:"원어성경", icon:"bible", href:originalUrl(ctx) });\n'
    replacement = bible_action + '''    if (ctx.type !== "original" && ctx.book && ctx.chapter && XREF_BOOKS[ctx.book]) {
      actions.push({
        id:"xrefs",
        label:"절별 관주",
        icon:"toc",
        href:href("bible/original.html?book=" + encodeURIComponent(ctx.book) + "&chapter=" + ctx.chapter + "&view=xrefs")
      });
    }
'''
    text = replace_once(text, bible_action, replacement, "research dock xref action")
    return text


def patch_original_html(text: str) -> str:
    if MARKER in text:
        return text
    text = replace_once(
        text,
        '<title>성경읽기 — 원어·개역개정 병렬</title>',
        '<title>성경읽기 — 원어·개역개정·절별 관주</title>',
        "original page title",
    )
    text = replace_once(
        text,
        '<meta name="description" content="구약 WLC/OSHB 히브리어 본문과 신약 NA28 헬라어 본문을 개역개정과 절 단위로 나란히 읽는 성경읽기 페이지.">',
        '<meta name="description" content="구약 WLC/OSHB와 신약 NA28 원문을 개역개정과 나란히 읽고, 연구 중인 성경책의 절별 관주를 함께 확인하는 성경읽기 페이지.">',
        "original page description",
    )
    text = replace_once(
        text,
        '<p>원문과 개역개정을 절 단위로 나란히 읽고 대조합니다. 원어 단어에 마우스를 올리거나 터치하면 사전 풀이가 열립니다.</p>',
        '<p>원문과 개역개정을 절 단위로 대조하고 관주를 펼쳐 연결 본문을 확인합니다. 원어 단어에 마우스를 올리거나 터치하면 사전 풀이가 열립니다.</p>',
        "original page introduction",
    )
    text = replace_once(
        text,
        '<footer class="or-footer">구약은 WLC/OSHB 히브리어 본문을 사용하며, 신약은 사용자가 제공한 NA28 EPUB에서 변환한 헬라어 본문을 사용합니다. 사전 호버는 한글 스트롱 사전과 단어 연결 색인을 사용합니다.</footer>',
        '<footer class="or-footer">구약은 WLC/OSHB, 신약은 사용자 제공 NA28 변환 데이터를 사용합니다. 관주는 OpenBible.info Cross References(CC BY)를 한국어 약칭으로 변환한 참고 연결이며, 각 절 아래에서 펼쳐 볼 수 있습니다. <!-- ' + MARKER + ' --></footer>',
        "original page footer",
    )
    return text


def patched_files() -> dict[Path, str]:
    return {
        ORIGINAL_JS: patch_original_reader(ORIGINAL_JS.read_text(encoding="utf-8")),
        ORIGINAL_CSS: patch_original_css(ORIGINAL_CSS.read_text(encoding="utf-8")),
        APP_JS: patch_app_js(APP_JS.read_text(encoding="utf-8")),
        DOCK_JS: patch_dock_js(DOCK_JS.read_text(encoding="utf-8")),
        ORIGINAL_HTML: patch_original_html(ORIGINAL_HTML.read_text(encoding="utf-8")),
    }


def validate(files: dict[Path, str]) -> list[str]:
    errors: list[str] = []
    for path, text in files.items():
        if MARKER not in text:
            errors.append(f"{path.relative_to(ROOT)}: marker missing")
    original = files[ORIGINAL_JS]
    for required in (
        'data-v="',
        "loadXrefs(code)",
        "xrefMarkup(",
        'code.toLowerCase() + ".json"',
    ):
        if required not in original:
            errors.append(f"original-reader.js: missing {required}")
    if "xrefBookKey()" not in files[APP_JS]:
        errors.append("app.js: normalized xref key missing")
    if 'label:"절별 관주"' not in files[DOCK_JS]:
        errors.append("research-dock.js: xref action missing")
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
        stale = [
            str(path.relative_to(ROOT))
            for path, expected in files.items()
            if path.read_text(encoding="utf-8") != expected
        ]
        if stale:
            raise SystemExit("cross-reference UI is stale: " + ", ".join(stale))

    print("관주 UI 검증 완료: 원문 리더 절 표식·관주 패널·연구 도크 연결")


if __name__ == "__main__":
    main()
