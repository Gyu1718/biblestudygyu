#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""느헤미야형 레이아웃으로 신구약 인터라이너 HTML을 렌더링한다."""
from __future__ import annotations

import argparse
import html
import json
import os
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from morph_ko import load_table as load_heb_table
from morph_ko_gk import load_table as load_gk_table
from translit_ko import to_hangul as heb_hangul
from translit_gk_ko import to_hangul as gk_hangul


def one(root: Path, pattern: str) -> Path:
    matches = sorted(root.rglob(pattern))
    if not matches:
        raise FileNotFoundError(f"{pattern}을 찾지 못했습니다.")
    return matches[0]


def rel(output: Path, repo_root: Path, target: str) -> str:
    return Path(os.path.relpath(repo_root / target, output.parent)).as_posix()


def load_json(path: Path | None) -> dict:
    return json.loads(path.read_text(encoding="utf-8")) if path else {}


def meaning(word: dict, gloss: dict) -> tuple[str, bool]:
    if word.get("ko"):
        return str(word["ko"]), bool(word.get("draft", False))
    for strong in word.get("s", []):
        value = gloss.get(strong)
        if isinstance(value, str):
            return value, False
        if isinstance(value, dict) and (value.get("ko") or value.get("gloss")):
            return str(value.get("ko") or value.get("gloss")), bool(value.get("draft"))
    return str(word.get("en", "")), True


def language_tools(data: dict, source_root: Path):
    if data.get("lang") == "grc":
        return {
            "table": load_gk_table(one(source_root, "TEGMC*.txt")),
            "hangul": gk_hangul,
            "script": "grk",
            "direction": "ltr",
            "source_label": "TAGNT/TEGMC",
            "testament": "nt",
            "language_name": "헬라어",
        }
    return {
        "table": load_heb_table(one(source_root, "TEHMC*.txt")),
        "hangul": heb_hangul,
        "script": "heb",
        "direction": "rtl",
        "source_label": "TAHOT/TEHMC",
        "testament": "ot",
        "language_name": "히브리어·아람어",
    }


def chapter_links(chapter: int, count: int, file_prefix: str = "ch") -> str:
    links = []
    for number in range(1, count + 1):
        current = ' aria-current="page"' if number == chapter else ""
        links.append(f'<a href="{file_prefix}{number:02d}.html"{current}>{number}</a>')
    return "".join(links)


def verse_label(verse: dict, gloss: dict) -> str:
    pieces = []
    for word in verse.get("w", [])[:3]:
        text, _ = meaning(word, gloss)
        if text:
            pieces.append(text)
    label = " · ".join(pieces)
    return label or "전 단어 분석"


def original_title(data: dict) -> str:
    first = data.get("v", [{}])[0].get("w", [])[:3]
    return " ".join(str(word.get("t", "")) for word in first).strip()


def render_word_strip(word: dict, grammar: str, text: str, draft: bool, tools: dict) -> str:
    original = html.escape(str(word.get("t", "")))
    translit = html.escape(str(word.get("tr", "")))
    hangul = html.escape(tools["hangul"](str(word.get("tr", ""))))
    gloss_class = " draft" if draft else ""
    grammar_html = html.escape(grammar or "—")
    return (
        '<span class="il-iw">'
        f'<span class="il-ih" dir="{tools["direction"]}">{original}</span>'
        f'<span class="il-it">{translit}</span>'
        f'<span class="il-ig{gloss_class}">{html.escape(text)}</span>'
        f'<span class="il-ip">{grammar_html}</span>'
        f'<span class="il-ik">{hangul}</span>'
        '</span>'
    )


def render_word_row(word: dict, grammar: str, text: str, draft: bool, tools: dict) -> str:
    strong = " · ".join(str(x) for x in word.get("s", [])) or "—"
    lemma = str(word.get("lem") or "—")
    root = str(word.get("root") or "")
    root_html = f' <span class="il-root">어근 {html.escape(root)}</span>' if root else ""
    variant = str(word.get("variant") or "")
    variant_html = f' <span class="il-variant">이본 {html.escape(variant)}</span>' if variant else ""
    function_text = str(word.get("fn") or word.get("function") or "—")
    draft_class = " draft" if draft else ""
    return (
        "<tr>"
        f'<td class="il-w-num">{html.escape(str(word.get("i", "")))}</td>'
        f'<td class="il-w-original" dir="{tools["direction"]}">{html.escape(str(word.get("t", "")))}</td>'
        f'<td class="il-w-tr">{html.escape(str(word.get("tr", "")))}'
        f'<span class="il-ko">{html.escape(tools["hangul"](str(word.get("tr", ""))))}</span></td>'
        f'<td class="il-w-parse">{html.escape(grammar or "—")}</td>'
        f'<td class="il-w-lex"><span class="il-lemma" dir="{tools["direction"]}">{html.escape(lemma)}</span>'
        f'{root_html}<span class="il-strong">{html.escape(strong)}</span>{variant_html}</td>'
        f'<td class="il-w-gloss{draft_class}">{html.escape(text)}</td>'
        f'<td class="il-w-fn">{html.escape(function_text)}</td>'
        "</tr>"
    )


def render_verse(verse: dict, chapter: int, gloss: dict, tools: dict, korean_verses: dict) -> str:
    strip = []
    rows = []
    draft_count = 0
    for word in verse.get("w", []):
        grammar = " + ".join(tools["table"].get(code, code) for code in word.get("m", []))
        text, draft = meaning(word, gloss)
        if draft:
            draft_count += 1
        strip.append(render_word_strip(word, grammar, text, draft, tools))
        rows.append(render_word_row(word, grammar, text, draft, tools))

    number = int(verse["n"])
    korean = (
        verse.get("krv")
        or korean_verses.get(str(number))
        or korean_verses.get(number)
        or "한국어 본문은 상단의 성경읽기에서 확인할 수 있습니다."
    )
    note = verse.get("note")
    if note:
        note_html = f'<div class="il-vnote"><b>절 해설.</b> {html.escape(str(note))}</div>'
    else:
        note_html = (
            '<div class="il-vnote"><b>자동 생성 안내.</b> '
            f'이 절은 {len(rows)}개 낱말을 분석했습니다. '
            f'뜻 항목 중 {draft_count}개는 한국어 감수 사전이 연결되기 전의 임시 표시입니다. '
            '구문 기능과 절 해설은 검수 자료가 제공될 때만 채웁니다.</div>'
        )

    return f'''
<section class="il-verse" id="v{number}">
  <div class="il-verse-head">
    <span class="il-vnum">{chapter}:{number}</span>
    <span class="il-vkrv">{html.escape(str(korean))}</span>
  </div>
  <div class="il-inter">{''.join(strip)}</div>
  <div class="il-table-wrap">
    <table class="il-words-table">
      <thead><tr><th class="il-center">#</th><th>{tools["language_name"]}</th><th class="il-left">음역</th><th class="il-left">문법 분석</th><th class="il-left">표제어 · Strong</th><th class="il-left">뜻</th><th class="il-left">문장 기능</th></tr></thead>
      <tbody>{''.join(rows)}</tbody>
    </table>
  </div>
  {note_html}
</section>'''


def render(
    data: dict,
    output: Path,
    repo_root: Path,
    slug: str,
    title: str,
    source_root: Path,
    gloss_path: Path | None = None,
    testament: str | None = None,
    chapter_count: int | None = None,
    korean_path: Path | None = None,
) -> str:
    tools = language_tools(data, source_root)
    testament = testament or tools["testament"]
    gloss = load_json(gloss_path)
    korean_verses = load_json(korean_path)
    chapter = int(data["chapter"])
    chapter_count = chapter_count or int(data.get("chapter_count") or chapter)

    assets = rel(output, repo_root, "assets")
    shelf = rel(output, repo_root, f"{testament}/{slug}/index.html")
    reader = rel(output, repo_root, "bible/original.html")
    home = rel(output, repo_root, "index.html")
    original = html.escape(original_title(data))
    text_note = f' · {html.escape(str(data.get("text")))}' if data.get("text") else ""

    verse_nav = "".join(
        f'<a class="il-vl" href="#v{verse["n"]}"><span class="il-n">{chapter}:{verse["n"]}</span>{html.escape(verse_label(verse, gloss))}</a>'
        for verse in data.get("v", [])
    )
    sections = "".join(
        render_verse(verse, chapter, gloss, tools, korean_verses)
        for verse in data.get("v", [])
    )

    return f'''<!DOCTYPE html>
<html lang="ko" data-theme="auto">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{html.escape(title)} {chapter}장 인터라이너 — 성서 연구 서고</title>
<meta name="description" content="{html.escape(title)} {chapter}장 원어 축자 대역과 전 단어 형태론 분석">
<link rel="stylesheet" href="{assets}/theme.css" data-site-theme>
<link rel="stylesheet" href="{assets}/app.css" data-site-app-css>
<link rel="stylesheet" href="{assets}/css/bible-reader.css" data-bible-reader-css>
<link rel="stylesheet" href="{assets}/css/interlinear.css">
</head>
<body class="interlinear-page" data-book="{html.escape(slug)}" data-chapter="{chapter}" data-kind="parsing" data-root="{rel(output, repo_root, '.')}" data-script="{tools["script"]}">
<div class="il-frame">
<nav class="il-toc" aria-label="목차">
  <div class="il-site-nav"><a href="{shelf}">← {html.escape(title)} 서가</a><a href="{reader}?book={html.escape(str(data["book"]).upper())}&amp;chapter={chapter}">성경읽기</a><a href="{home}">서고 홈</a></div>
  <div class="il-brand">{html.escape(title)} {chapter}장 인터라이너</div>
  <div class="il-brand-sub">INTERLINEAR · FULL PARSING</div>
  <div class="il-toc-h">장 이동</div>
  <div class="il-chapter-jump">{chapter_links(chapter, chapter_count)}</div>
  <div class="il-toc-h">이 장의 절</div>
  {verse_nav}
</nav>
<main class="il-main">
<header class="il-hero" id="top"><div class="il-original-title" dir="{tools["direction"]}">{original}</div><h1>{html.escape(title)} {chapter}장 인터라이너</h1><div class="il-sub">절마다 원어 인터라이너 띠와 전 단어 분석표를 함께 제공합니다. 음역·한글 음역·표제어·형태론·Strong 번호를 한 화면에서 확인할 수 있습니다.</div><div class="il-meta">{tools["language_name"]} 원문 · 축자 대역 · 전 단어 파싱{text_note}</div></header>
<div class="il-legend"><p><b>읽는 법.</b> 각 절은 세 층으로 구성됩니다. ① <b>인터라이너 띠</b> — 원어 아래에 학술 음역, 뜻, 문법, 한글 음역을 표시합니다. ② <b>단어 분석표</b> — 모든 낱말의 형태론, 표제어, Strong 번호와 문장 기능을 정리합니다. ③ <b>절 해설</b> — 검수된 주석이 있을 때만 표시합니다. 표는 좁은 화면에서 좌우로 밀어 볼 수 있습니다.</p></div>
{sections}
<footer class="il-footer">원어 데이터: STEPBible.org (CC BY 4.0), 원자료 Tyndale House Cambridge. 형태 분석 {tools["source_label"]}. 자동 생성된 뜻과 음역은 공개 전 표본 검수가 필요합니다.</footer>
</main>
</div>
<script src="{assets}/app.js" data-study-tools-js></script>
<script src="{assets}/js/bible-reader.js" defer data-bible-reader-js></script>
</body>
</html>'''


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--repo-root", type=Path, default=Path("."))
    parser.add_argument("--source-root", type=Path, default=Path("sources/STEPBible-Data"))
    parser.add_argument("--book-slug", required=True)
    parser.add_argument("--book-title", required=True)
    parser.add_argument("--testament", choices=("ot", "nt"))
    parser.add_argument("--chapter-count", type=int)
    parser.add_argument("--gloss", type=Path)
    parser.add_argument("--korean-verses", type=Path)
    args = parser.parse_args()

    data = json.loads(args.input.read_text(encoding="utf-8"))
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        render(
            data=data,
            output=args.output,
            repo_root=args.repo_root.resolve(),
            slug=args.book_slug,
            title=args.book_title,
            source_root=args.source_root,
            gloss_path=args.gloss,
            testament=args.testament,
            chapter_count=args.chapter_count,
            korean_path=args.korean_verses,
        ),
        encoding="utf-8",
    )
    print(args.output)


if __name__ == "__main__":
    main()
