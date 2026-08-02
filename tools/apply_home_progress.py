#!/usr/bin/env python3
"""Add structured progress badges to homepage study cards (issue 9)."""
from __future__ import annotations

import argparse
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "catalog.js"
INDEX = ROOT / "index.html"
CSS = ROOT / "assets" / "css" / "home-compact.css"
MARKER = "SCRIPTORIUM_HOME_PROGRESS_V1"


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if new in text:
        return text
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{label}: expected one target, found {count}")
    return text.replace(old, new, 1)


def patch_catalog(text: str) -> str:
    if MARKER in text:
        return text

    genesis_old = 'meta:"표준형 서가 — 성경읽기 50장 · 종합 개관 1편 · 장별 심층연구 25/50편 · 원어 연구 준비 중",desc:'
    genesis_new = 'meta:"표준형 서가 — 성경읽기 50장 · 종합 개관 1편 · 원어 연구 준비 중",progress:{label:"장별 심층연구",done:25,total:50},desc:'
    acts_old = 'meta:"표준형 서가 — 성경읽기 28장 · 종합 개관 1편 · 장별 심층연구 28/28편 완성 · 원어 연구 준비 중",desc:'
    acts_new = 'meta:"표준형 서가 — 성경읽기 28장 · 종합 개관 1편 · 원어 연구 준비 중",progress:{label:"장별 심층연구",done:28,total:28},desc:'

    text = replace_once(text, genesis_old, genesis_new, "Genesis progress")
    text = replace_once(text, acts_old, acts_new, "Acts progress")
    return text.rstrip() + f"\n/* {MARKER}: progress is structured data, not clipped meta copy. */\n"


def patch_index(text: str) -> str:
    if MARKER in text:
        return text

    anchor = '  var miniShelf = function (volumes) {var count = Math.min(Math.max(volumes || 4, 2), 6);var html = \'<span class="mini-shelf" aria-hidden="true">\';for (var i = 0; i < count; i++) {html += \'<i\' + (i === 0 ? \' class="g"\' : \'\') + \' style="height:\' + SPINE_H[i] + \'px"></i>\';}return html + "</span>";};\n'
    progress_fn = anchor + '''  var progressHTML = function (progress) { // SCRIPTORIUM_HOME_PROGRESS_V1
    if (!progress || !Number.isFinite(progress.done) || !Number.isFinite(progress.total) || progress.total <= 0) return "";
    var done = Math.max(0, Math.min(progress.done, progress.total));
    var percent = Math.round((done / progress.total) * 100);
    var state = done >= progress.total ? "완성" : "진행";
    var label = progress.label || "진행률";
    return '<div class="card-progress" role="progressbar" aria-label="' + esc(label + " " + done + "/" + progress.total + " " + state) + '" aria-valuemin="0" aria-valuemax="' + progress.total + '" aria-valuenow="' + done + '">' +
      '<span class="card-progress-head"><span>' + esc(label) + '</span><strong>' + done + '/' + progress.total + ' <em>' + state + '</em></strong></span>' +
      '<span class="card-progress-track" aria-hidden="true"><i style="width:' + percent + '%"></i></span>' +
    '</div>';
  };
'''
    text = replace_once(text, anchor, progress_fn, "progress renderer")

    card_old = '  var cardHTML = function (st) {return \'<a class="set-card" href="\' + esc(st.path) + \'">\' + miniShelf(st.volumes) + "<span>" + \'<span class="orig-line\' + origClass(st.script) + \'">\' + esc(st.original) + "</span>" + "<h3>" + esc(st.title) + "</h3>" + \'<div class="meta">\' + esc(st.meta) + "</div>" + \'<div class="desc">\' + esc(st.desc) + "</div>" + \'<span class="cta">서재 열기 →</span>\' + "</span></a>";};\n'
    card_new = '  var cardHTML = function (st) {return \'<a class="set-card" href="\' + esc(st.path) + \'">\' + miniShelf(st.volumes) + "<span>" + \'<span class="orig-line\' + origClass(st.script) + \'">\' + esc(st.original) + "</span>" + "<h3>" + esc(st.title) + "</h3>" + \'<div class="meta">\' + esc(st.meta) + "</div>" + progressHTML(st.progress) + \'<div class="desc">\' + esc(st.desc) + "</div>" + \'<span class="cta">서재 열기 →</span>\' + "</span></a>";};\n'
    return replace_once(text, card_old, card_new, "card progress insertion")


def patch_css(text: str) -> str:
    if MARKER in text:
        return text
    addition = '''
/* SCRIPTORIUM_HOME_PROGRESS_V1 */
.card-progress {
  display: grid;
  gap: .28rem;
  margin: .1rem 0 .46rem;
  font-family: var(--sans);
}
.card-progress-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .65rem;
  color: var(--ink-soft);
  font-size: .66rem;
  line-height: 1.25;
}
.card-progress-head strong {
  flex: none;
  color: var(--lapis-deep);
  font-size: .7rem;
}
.card-progress-head em {
  margin-left: .18rem;
  color: var(--ochre);
  font-size: .6rem;
  font-style: normal;
}
.card-progress-track {
  display: block;
  height: 4px;
  overflow: hidden;
  border-radius: 999px;
  background: var(--line);
}
.card-progress-track i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--ochre), var(--lapis));
}
'''
    return text.rstrip() + "\n" + addition


def patched_files() -> dict[Path, str]:
    return {
        CATALOG: patch_catalog(CATALOG.read_text(encoding="utf-8")),
        INDEX: patch_index(INDEX.read_text(encoding="utf-8")),
        CSS: patch_css(CSS.read_text(encoding="utf-8")),
    }


def validate(files: dict[Path, str]) -> list[str]:
    errors: list[str] = []
    catalog = files[CATALOG]
    index = files[INDEX]
    css = files[CSS]

    for needle in (
        'progress:{label:"장별 심층연구",done:25,total:50}',
        'progress:{label:"장별 심층연구",done:28,total:28}',
    ):
        if needle not in catalog:
            errors.append(f"catalog.js missing {needle}")
    if "장별 심층연구 25/50편" in catalog or "장별 심층연구 28/28편" in catalog:
        errors.append("progress remains embedded in meta copy")
    for needle in ("progressHTML", 'role="progressbar"', "card-progress-track"):
        if needle not in index:
            errors.append(f"index.html missing {needle}")
    for selector in (".card-progress {", ".card-progress-head {", ".card-progress-track {"):
        if selector not in css:
            errors.append(f"home-compact.css missing {selector}")
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
            raise SystemExit("homepage progress UI is stale: " + ", ".join(stale))

    print("홈 진행률 검증 완료: 창세기 25/50, 사도행전 28/28")


if __name__ == "__main__":
    main()
