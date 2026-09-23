#!/usr/bin/env python3
"""Build the source-attributed Ecclesiastes study as static HTML.

Usage: python3 tools/build_ecclesiastes.py --write|--check
"""
from __future__ import annotations

import argparse
import gzip
from html import escape
import json
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
BOOK = ROOT / "ot" / "ecclesiastes"
sys.path.insert(0, str(BOOK))
from research_data import CHAPTERS, SOURCES  # noqa: E402
from overview_data import INDEX_SUMMARY, OVERVIEW  # noqa: E402
from verse_notes import VERSE_NOTES  # noqa: E402
from deep_dive import DEEP_DIVE, H_PERSPECTIVES  # noqa: E402
from cross_references import CROSS_REFERENCES  # noqa: E402
from added_commentaries import NEW_SOURCES, OVERVIEW_ADDITIONS, QUESTION_ADDITIONS, UNIT_ADDITIONS  # noqa: E402
from lexicon_data import LEXICON  # noqa: E402
from chapter_supplements import CHAPTER_SUPPLEMENTS  # noqa: E402
import overview_supplements as OS  # noqa: E402
from verse_exegesis import EXEGESIS  # noqa: E402


def verse_span(reference: str) -> tuple[int, int, int]:
    match = re.fullmatch(r'(\d+):(\d+)(?:[–-](\d+))?', reference)
    if not match:
        raise ValueError(f'절 범위 형식 오류: {reference}')
    chapter, start = int(match[1]), int(match[2])
    return chapter, start, int(match[3] or start)


def exegesis_block(number: int, unit_range: str) -> str:
    _, first, last = verse_span(unit_range)
    items = [item for item in EXEGESIS.get(number, []) if first <= verse_span(item[0])[1] <= last]
    if not items:
        return ''
    parts = ['<div class="vx-wrap"><h3>절별 주해</h3>']
    for reference, title, paragraphs in items:
        parts.append(f'<div class="vx"><h4>{escape(reference)} · {escape(title)}</h4>' + ''.join(map(para, paragraphs)) + '</div>')
    parts.append('</div>')
    return ''.join(parts)


def merge_added_commentaries() -> None:
    """Attach the Longman/Bartholomew/Provan layer to the existing study data."""
    SOURCES.update(NEW_SOURCES)
    for number, additions in UNIT_ADDITIONS.items():
        units = {range_: paragraphs for range_, _, paragraphs in CHAPTERS[number][2]}
        for range_, paragraphs in additions.items():
            if range_ not in units:
                raise ValueError(f'{number}장에 없는 단락 범위입니다: {range_}')
            units[range_].extend(paragraphs)
    for number, paragraphs in QUESTION_ADDITIONS.items():
        CHAPTERS[number][3][0][1].extend(paragraphs)
    for index, paragraphs in OVERVIEW_ADDITIONS.items():
        OVERVIEW[index][1].extend(paragraphs)


merge_added_commentaries()


def chips(codes: str) -> str:
    return " ".join(
        f'<a class="chip" data-source="{code}" href="#src-{code}" '
        f'title="{escape(SOURCES[code][0])} — 출처로 이동" aria-label="{escape(SOURCES[code][0])} 주석 출처">{code}</a>'
        for code in codes.split()
    )


def para(item: tuple[str, str]) -> str:
    codes, text = item
    return f"<p>{text} {chips(codes)}</p>"


def sources(used: set[str], chapter: int | None = None) -> str:
    parts = ['<section class="part" id="sources"><h2>사용한 &lt;도서&gt; 자료와 칩</h2>',
             '<p class="source-note">각 문단과 절 범위 옆의 칩은 아래 자료의 해당 전도서 단락을 가리킵니다. 번역문을 길게 옮기지 않고 주석의 논지와 이견을 한국어로 요약했습니다. 한국어 PDF의 OCR은 낱말 손상이 있어 직접 인용에 사용하지 않았습니다. L·Ba·P 칩은 롱맨·바르톨로뮤·프로반 주석의 EPUB 판독본에서 해당 단락 주해와 신학적 함의·적용 부분을 확인해 요약한 층입니다. 원어 표기와 성경 전문은 별도 성경읽기에서 확인하세요.</p>',
             '<ol class="sources">']
    for code, (author, title, edition, kind) in SOURCES.items():
        if code not in used:
            continue
        loc = f"전도서 {chapter}장 해당 절 주해" if chapter else "서론, 구조, 관련 본문 주해"
        parts.append(f'<li id="src-{code}">{chips(code)} <strong>{escape(author)}</strong>, '
                     f'<cite>{escape(title)}</cite> ({escape(edition)}). '
                     f'{escape(kind)} · 참조: {escape(loc)}.</li>')
    parts.append("</ol></section>")
    return "".join(parts)


def head(title: str, desc: str, page_type: str, chapter: int | None = None) -> str:
    chap = f' data-chapter="{chapter}"' if chapter else ""
    filename = f'ch{chapter:02d}.html' if chapter else ('index.html' if page_type == 'study-home' else 'overview.html')
    url = f'https://gyu1718.github.io/biblestudygyu/ot/ecclesiastes/{filename}'
    preview = 'https://gyu1718.github.io/biblestudygyu/assets/og/site-preview.png'
    return f'''<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{escape(title)} — 성서 연구 서고</title><meta name="description" content="{escape(desc)}">
<meta property="og:type" content="website"><meta property="og:locale" content="ko_KR"><meta property="og:title" content="{escape(title)} — 성서 연구 서고"><meta property="og:description" content="{escape(desc)}"><meta property="og:url" content="{url}"><meta property="og:image" content="{preview}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{escape(title)} — 성서 연구 서고"><meta name="twitter:description" content="{escape(desc)}"><meta name="twitter:image" content="{preview}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;700&amp;family=Noto+Sans+KR:wght@400;500;700&amp;family=Noto+Serif+Hebrew:wght@400;700&amp;display=swap" rel="stylesheet">
<link rel="stylesheet" href="study.css"><link rel="stylesheet" href="../../assets/css/bible-reader.css" data-bible-reader-css>
<link rel="stylesheet" href="../../assets/theme.css" data-site-theme><link rel="stylesheet" href="../../assets/app.css" data-site-app-css>
</head><body data-root="../../" data-book="ecclesiastes" data-script="heb" data-kind="{page_type}"{chap}><a class="skip-link" href="#top">본문으로 건너뛰기</a>'''


def close() -> str:
    return '<script src="../../assets/app.js"></script><script src="../../assets/js/bible-reader.js" defer data-bible-reader-js></script></body></html>\n'


def nav(title: str, anchors: list[tuple[str, str]], current: int | None = None) -> str:
    links = [('<a href="../../bible/original.html?book=ECC&amp;chapter=1">성경읽기</a>'),
             ('<a href="./overview.html">종합 개관</a>'),
             ('<a href="./index.html">전도서 서가</a>'),
             (f'<a href="./parsing/ch{current or 1:02d}.html">원어 연구</a>'),
             ('<a href="../../index.html">서고 홈</a>')]
    jumps = "".join(f'<a href="ch{i:02d}.html" aria-label="전도서 {i}장 심층연구"'
                    + (' aria-current="page"' if i == current else '') + f'>{i}</a>' for i in CHAPTERS)
    content = "".join(f'<a href="#{escape(ident)}">{escape(label)}</a>' for ident, label in anchors)
    return (f'<div class="layout"><nav class="toc" aria-label="전도서 연구 목차">'
            f'<div class="toplinks">{"".join(links)}</div><div class="brand">{escape(title)}</div>'
            f'<div class="label">장별 심층 연구</div><div class="jump">{jumps}</div>'
            f'<div class="label">이 문서의 목차</div>{content}</nav><main id="top" tabindex="-1">')


def legend(used: set[str]) -> str:
    return '<div class="legend"><strong>주석 칩</strong>' + "".join(
        f'<span>{chips(code)} {escape(SOURCES[code][0])}</span>'
        for code in SOURCES if code in used
    ) + '</div>'


def overview_sections() -> str:
    return "".join(f'<section class="part" id="o{i}"><h2>{i}. {escape(heading)}</h2>'
                   + "".join(map(para, paragraphs)) + '</section>'
                   for i, (heading, paragraphs) in enumerate(OVERVIEW, 1))


def numbered_section(ident: str, number: int, heading: str, body: str) -> str:
    return f'<section class="part" id="{ident}"><h2>{number}. {escape(heading)}</h2>{body}</section>'


def issue_table() -> str:
    codes = [code for code in SOURCES]
    head_cells = ''.join(f'<th>{chips(code)}</th>' for code in codes)
    rows = []
    for issue, cells in OS.ISSUE_TABLE:
        tds = ''.join(f'<td>{cells.get(code, "—")}</td>' for code in codes)
        rows.append(f'<tr><th scope="row">{escape(issue)}</th>{tds}</tr>')
    return ('<p>주석별 입장을 짧게 대조합니다. 빈칸(—)은 이 서가에서 해당 쟁점의 입장을 확인하지 않았다는 뜻입니다.</p>'
            f'<div class="table-scroll"><table class="issue-table"><thead><tr><th>쟁점</th>{head_cells}</tr></thead><tbody>'
            + ''.join(rows) + '</tbody></table></div>')


def further_reading() -> str:
    parts = ['<p class="source-note">아래 문헌은 이 서가에서 직접 대조하지 않은 확장 연구용 목록입니다. 이 연구가 실제로 사용한 자료는 바로 아래의 칩 목록에 있습니다.</p>']
    for group, items in OS.FURTHER_READING:
        parts.append(f'<h3>{escape(group)}</h3><ul class="biblio">' + ''.join(f'<li>{item}</li>' for item in items) + '</ul>')
    return ''.join(parts)


def gospel_body() -> str:
    parts = [para(OS.GOSPEL_INTRO)]
    for i, (heading, paragraphs) in enumerate(OS.GOSPEL, 1):
        parts.append(f'<h3>{i}. {escape(heading)}</h3>' + ''.join(map(para, paragraphs)))
    return ''.join(parts)


def lexicon_section(number: int) -> str:
    rows = []
    for row in LEXICON[number]:
        gloss = row['label'].split(', ', 1)[1] if ', ' in row['label'] else row['label']
        freq = ', '.join(f'{strong} {n}회' for strong, n in zip(row['strongs'], row['freq']))
        rows.append(
            f'<tr><td><a href="./parsing/ch{number:02d}.html#v{row["verse"]}">{number}:{row["verse"]}</a></td>'
            f'<td><span class="lex-he" lang="he" dir="rtl">{escape(row["hebrew"])}</span>'
            f'<span class="lex-tr">{escape(row["translit"])}</span>'
            f'<span class="lex-lemma">사전형 <span lang="he" dir="rtl">{escape(row["lemma"])}</span> · 전도서 빈도 {escape(freq)}</span></td>'
            f'<td><strong>{gloss}</strong><br>{row["note"]} {chips(row["codes"])}</td></tr>')
    return ('<section class="part" id="lexicon"><h2>핵심 원어와 문법</h2>'
            f'<p>히브리어 표기와 사전형, 빈도는 STEPBible TAHOT(CC BY 4.0)에서 가져왔습니다. 절 번호를 누르면 <a href="./parsing/ch{number:02d}.html">원어 연구 {number}장</a>의 해당 절로 이동합니다.</p>'
            '<div class="table-scroll"><table class="lex-table"><thead><tr><th>절</th><th>원어</th><th>뜻과 문법</th></tr></thead><tbody>'
            + ''.join(rows) + '</tbody></table></div></section>')


def teaching_section(number: int) -> str:
    t = CHAPTER_SUPPLEMENTS[number]['teaching']
    outline = ''.join(f'<li>{escape(point)}</li>' for point in t['outline'])
    questions = ''.join(f'<li>{escape(q)}</li>' for q in t['questions'])
    notes = ''.join(map(para, t['notes']))
    return ('<section class="part" id="teaching"><h2>설교·교육을 위한 메시지</h2>'
            '<p class="source-note">설교 개요와 나눔 질문은 주석의 논의를 바탕으로 이 서가가 구성한 교육용 제안입니다. 칩이 붙은 문단만 주석의 논지를 요약한 것입니다.</p>'
            f'<div class="callout"><h3>설교 개요 · {escape(t["title"])}</h3><ol class="outline">{outline}</ol></div>'
            f'<h3>나눔 질문</h3><ul class="questions">{questions}</ul>{notes}</section>')


def foot(prev: str | None = None, nxt: str | None = None) -> str:
    back = '<nav class="page-nav" aria-label="연구 페이지 이동">'
    back += f'<a href="{prev}">← 이전</a>' if prev else '<span></span>'
    back += '<a href="index.html">전도서 서가</a>'
    back += f'<a href="{nxt}">다음 →</a>' if nxt else '<span></span>'
    return back + '</nav><footer>전도서 연구 · 사용자 제공 &lt;도서&gt; 자료에 근거한 요약 및 대조 · 성경읽기 ECC / 개역개정 · 원문·주석 PDF는 이 저장소에 배포하지 않습니다.</footer></main></div>' + close()


def shelf() -> str:
    return '<div class="shelf" aria-label="전도서 열두 장 서가">' + "".join(
        f'<a class="spine" href="ch{i:02d}.html" aria-label="전도서 {i}장 {escape(info[0])}"><span>{i:02d}</span><strong>{escape(info[0].split(" ")[0])}</strong><span>전도서</span></a>'
        for i, info in CHAPTERS.items()) + '</div>'


def chapter_cards() -> str:
    return '<div class="chapter-grid">' + "".join(
        f'<a class="chapter-card" href="ch{i:02d}.html"><strong>{i}장 · {escape(info[0])}</strong>'
        f'<small>{escape(info[1])}</small><small>성경읽기 ↗ 본문 안에서 연결</small></a>'
        for i, info in CHAPTERS.items()) + '</div>'


def render_index() -> str:
    used = set(SOURCES)
    anchors = [('reading', '성경읽기와 연구 경로'), ('shelf', '열두 장의 서가'), ('summary', '책의 개관과 신학')] + [(f'o{i}', h) for i, (h, _) in enumerate(OVERVIEW, 1)] + [('sources', '주석 출처')]
    out = [head('전도서 연구 서가', '전도서의 구조·헤벨·시간·즐거움·정의·죽음과 열두 장 심층연구를 여덟 주석 자료로 대조한 종합 연구 서가.', 'study-home'), nav('전도서 · 책의 개관과 서가', anchors)]
    out += ['<header class="hero"><span class="heb" lang="he" dir="rtl">קֹהֶלֶת</span><div class="eyebrow">ECCLESIASTES · 12 CHAPTERS</div><h1>전도서 · 책의 개관과 정리</h1><p class="lead">수고의 남는 이익을 묻고, 억압과 죽음을 직시하며, 알 수 없는 내일 앞에서 나누고 일하고 주어진 기쁨을 누리라는 지혜. 여덟 주석의 공통점과 해석 차이를 출처별 칩으로 추적합니다.</p><p class="meta">종합 연구 · 12장 심층 주해 · Seow / Fox / Murphy / Brown / HOW / Longman / Bartholomew / Provan · 성경읽기 ECC 연결</p></header>', legend(used)]
    parsing_links = ' '.join(f'<a href="parsing/ch{i:02d}.html">{i}장</a>' for i in CHAPTERS)
    reader_links = ' '.join(f'<a href="../../bible/original.html?book=ECC&amp;chapter={i}">{i}장</a>' for i in CHAPTERS)
    out += ['<section class="part" id="reading"><h2>성경읽기와 연구 경로</h2><p>원문·개역개정 성경읽기에서 본문을 확인하고, 아래의 종합 개관과 장별 연구를 이어 읽습니다. 원어 연구는 STEPBible TAHOT 데이터로 생성한 열두 장의 인터라이너입니다. 5장은 한국어·영어 장절(5:1–20)을 따르며, 히브리어 성경에서는 4:17과 5:1–19에 해당합니다.</p>',
            f'<h3>성경읽기</h3><div class="reader-grid">{reader_links}</div><h3>원어 연구</h3><div class="reader-grid">{parsing_links}</div><p><a href="overview.html">종합 개관으로 가기 →</a></p></section>',
            '<section class="part" id="shelf"><h2>열두 장의 서가</h2>', shelf(), chapter_cards(), '</section>']
    out += ['<section class="part" id="summary"><h2>핵심 흐름과 신학적 질문</h2>']
    for h, t, codes in INDEX_SUMMARY:
        out.append(f'<h3>{escape(h)}</h3><p>{escape(t)} {chips(codes)}</p>')
    out.append('<p><a href="overview.html">종합 연구를 독립 문서로 읽기 →</a></p></section>')
    out += [overview_sections(), sources(used), foot(nxt='overview.html')]
    return "\n".join(out)


def render_overview() -> str:
    used = set(SOURCES)
    plan = [
        ('names', OS.NAMES[0], ''.join(map(para, OS.NAMES[1]))),
        ('o1', OVERVIEW[0][0], ''.join(map(para, OVERVIEW[0][1]))),
        ('author', OS.AUTHOR[0], ''.join(map(para, OS.AUTHOR[1]))),
        ('o2', OVERVIEW[1][0], ''.join(map(para, OVERVIEW[1][1]))),
        ('text', OS.TEXT[0], ''.join(map(para, OS.TEXT[1]))),
        ('o3', OVERVIEW[2][0], ''.join(map(para, OVERVIEW[2][1]))),
        ('map', '장별 연구 지도', chapter_cards()),
    ] + [(f'o{i}', OVERVIEW[i - 1][0], ''.join(map(para, OVERVIEW[i - 1][1]))) for i in range(4, len(OVERVIEW) + 1)] + [
        ('xrefs', OS.XREFS[0], ''.join(map(para, OS.XREFS[1]))),
        ('gospel', '정경적·복음적 읽기', gospel_body()),
        ('history', OS.HISTORY[0], ''.join(map(para, OS.HISTORY[1]))),
        ('issue-table', '쟁점 대조표', issue_table()),
        ('further', '확장 연구용 문헌', further_reading()),
    ]
    anchors = [(ident, heading) for ident, heading, _ in plan] + [('sources', '주석 출처')]
    out = [head('전도서 종합 연구', '전도서의 저자·시대·구조와 헤벨, 시간, 하나님의 주권, 정의, 기쁨, 죽음, 후기의 신학적 대화를 여덟 주석 자료로 연구.', 'overview'), nav('전도서 · 종합 연구', anchors)]
    out += ['<header class="hero"><span class="heb" lang="he" dir="rtl">הֲבֵל הֲבָלִים</span><h1>전도서 · 종합 연구</h1><p class="lead">책을 감싸는 화자의 목소리, 사회 경제의 질문, 경쟁하는 구조 제안, 헤벨과 몫, 하나님의 때와 정의의 지연, 마지막 후기의 경외를 함께 살핍니다.</p></header>', legend(used)]
    out += [numbered_section(ident, i, heading, body) for i, (ident, heading, body) in enumerate(plan, 1)]
    out += [sources(used), foot(prev='index.html', nxt='ch01.html')]
    return "\n".join(out)


def used_codes(number: int, info: tuple, notes: list[tuple]) -> set[str]:
    _, _, units, questions, summary = info
    groups = [paragraph for _, _, paragraphs in units for paragraph in paragraphs]
    groups += [paragraph for _, paragraphs in questions for paragraph in paragraphs] + summary
    return (set(' '.join(item[0] for item in groups).split())
            | set(' '.join(note[1] for note in notes).split())
            | set(' '.join(p[0] for _, paragraphs in DEEP_DIVE[number] for p in paragraphs).split())
            | set(' '.join(row[4] for row in CROSS_REFERENCES[number]).split())
            | set(' '.join(row['codes'] for row in LEXICON[number]).split())
            | set(' '.join(p[0] for key in ('background', 'canon') for p in CHAPTER_SUPPLEMENTS[number][key]).split())
            | set(' '.join(p[0] for p in CHAPTER_SUPPLEMENTS[number]['teaching']['notes']).split())
            | set(' '.join(p[0] for _, _, paragraphs in EXEGESIS.get(number, []) for p in paragraphs).split())
            | {'H'})


def render_chapter(number: int) -> str:
    title, desc, units, questions, summary = CHAPTERS[number]
    notes = VERSE_NOTES[number]
    used = used_codes(number, CHAPTERS[number], notes)
    short = {'H': 'HOW', 'L': 'Longman'}
    source_names = '·'.join(short.get(code, SOURCES[code][0].split()[-1]) for code in SOURCES if code in used)
    anchors = [('structure', '단락의 짜임')] + [(f'u{i}', f'{range_} · {heading}') for i, (range_, heading, _) in enumerate(units, 1)] + [('analysis', '주석 심화 논의'), ('verse-notes', '절 범위별 관찰'), ('lexicon', '핵심 원어와 문법'), ('background', '역사·문화적 배경'), ('cross-refs', '상호 참조'), ('canon', '정경적 연결'), ('issues', '주요 해석 논쟁'), ('message', '신학적 메시지'), ('teaching', '설교·교육 메시지'), ('sources', '주석 출처')]
    out = [head(f'전도서 {number}장 심층 연구 · {title}', f'전도서 {number}장 {desc} {source_names} 자료별 주석 칩과 절 범위별 주해.', 'study', number), nav(f'전도서 {number}장 심층 연구', anchors, number)]
    out += [f'<header class="hero"><span class="heb" lang="he" dir="rtl">קֹהֶלֶת</span><div class="eyebrow">CHAPTER {number:02d} · 구약 지혜문학</div><h1>전도서 {number}장 · {escape(title)}</h1><p class="lead">{escape(desc)}</p><p class="meta"><a href="../../bible/original.html?book=ECC&amp;chapter={number}">원문·개역개정 성경읽기 ↗</a> · <a href="./parsing/ch{number:02d}.html">원어 연구 {number}장 →</a> · {len(units)}개 단락 · {len(notes)}개 절 범위 관찰 · 주석 {len(used)}종</p></header>', legend(used)]
    out += ['<section class="part" id="structure"><h2>0. 단락의 짜임</h2><div class="table-scroll"><table><thead><tr><th>본문</th><th>연구 초점</th><th>주석 대조</th></tr></thead><tbody>']
    for i, (range_, heading, paragraphs) in enumerate(units, 1):
        codes = set(' '.join(x[0] for x in paragraphs).split())
        out.append(f'<tr><td><a href="#u{i}">{escape(range_)}</a></td><td>{escape(heading)}</td><td>{" ".join(chips(code) for code in SOURCES if code in codes)}</td></tr>')
    out += ['</tbody></table></div></section>']
    for i, (range_, heading, paragraphs) in enumerate(units, 1):
        out += [f'<section class="part" id="u{i}"><h2>{i}. {escape(heading)}</h2><span class="range">전도서 {escape(range_)} · <a href="../../bible/original.html?book=ECC&amp;chapter={number}">본문 읽기 ↗</a></span>']
        out += list(map(para, paragraphs))
        out.append(exegesis_block(number, range_))
        out.append('</section>')
    out += ['<section class="part" id="analysis"><h2>주석의 논증과 신학적 함의</h2>']
    for heading, paragraphs in DEEP_DIVE[number]:
        out.append(f'<h3>{escape(heading)}</h3>')
        out += list(map(para, paragraphs))
    out.append('<h3>HOW 본문 연구의 해석과 적용</h3>')
    out.append(para(H_PERSPECTIVES[number]))
    out.append('</section>')
    out += ['<section class="part" id="verse-notes"><h2>절 범위별 주해 관찰</h2><p>같은 장의 단락을 더 작은 절 범위로 확인합니다. 칩은 각 주석의 해당 절 논의를 가리킵니다.</p><ul class="units">']
    out += [f'<li><strong>{escape(ref)}</strong> · {text} {chips(codes)}</li>' for ref, codes, text in notes]
    supplement = CHAPTER_SUPPLEMENTS[number]
    out += ['</ul></section>', lexicon_section(number),
            '<section class="part" id="background"><h2>역사·문화적 배경</h2>'] + list(map(para, supplement['background'])) + ['</section>']
    out += ['<section class="part" id="cross-refs"><h2>주석에서 대조한 본문</h2><div class="table-scroll"><table><thead><tr><th>본문</th><th>연결되는 논의</th><th>자료</th></tr></thead><tbody>']
    for code, ch, ref, meaning, source in CROSS_REFERENCES[number]:
        out.append(f'<tr><td><a href="../../bible/original.html?book={code}&amp;chapter={ch}">{escape(ref)}</a></td><td>{escape(meaning)}</td><td>{chips(source)}</td></tr>')
    out += ['</tbody></table></div></section><section class="part" id="canon"><h2>정경적 연결</h2>'] + list(map(para, supplement['canon'])) + ['</section>']
    out += ['<section class="part" id="issues"><h2>핵심 난제와 주석가들의 논의</h2>']
    for heading, paragraphs in questions:
        out += [f'<div class="callout"><h3>{escape(heading)}</h3>'] + list(map(para, paragraphs)) + ['</div>']
    out += ['</section><section class="part" id="message"><h2>신학적 메시지와 다음 장의 질문</h2>'] + list(map(para, summary)) + ['</section>', teaching_section(number), sources(used, number)]
    prev = f'ch{number-1:02d}.html' if number > 1 else 'overview.html'
    nxt = f'ch{number+1:02d}.html' if number < 12 else None
    out.append(foot(prev, nxt))
    return "\n".join(out)


def check_research() -> None:
    """Compare passage coverage and reader links with the site's actual Bible data."""
    bible = json.loads(gzip.decompress((ROOT / 'assets/data/bible/kor/chunks/ot-wisdom.json.gz').read_bytes()))['ECC']['chapters']
    manifest = json.loads((ROOT / 'assets/data/bible/kor/manifest.json').read_text(encoding='utf-8'))['books']
    if set(CHAPTERS) != set(range(1, 13)) or set(CHAPTERS) != set(VERSE_NOTES) != set(DEEP_DIVE) != set(H_PERSPECTIVES) != set(CROSS_REFERENCES):
        raise ValueError('전도서 원고의 장 목록이 일치하지 않습니다')
    for number, (_, _, units, questions, summary) in CHAPTERS.items():
        expected = set(map(int, bible[str(number)]))
        covered: list[int] = []
        groups = [paragraph for _, _, paragraphs in units for paragraph in paragraphs]
        groups += [paragraph for _, paragraphs in questions for paragraph in paragraphs] + summary
        groups += [paragraph for _, paragraphs in DEEP_DIVE[number] for paragraph in paragraphs] + [H_PERSPECTIVES[number]]
        for reference, _, paragraphs in units:
            match = re.fullmatch(r'(\d+):(\d+)[–-](\d+)', reference)
            if not match or int(match[1]) != number or not paragraphs:
                raise ValueError(f'{number}장 단락 범위 오류: {reference}')
            covered += list(range(int(match[2]), int(match[3]) + 1))
        if set(covered) != expected or len(covered) != len(expected):
            raise ValueError(f'{number}장 본문 단락이 성경 {len(expected)}절을 빠짐없이 한 번씩 덮지 못합니다')
        for codes, _ in groups:
            if set(codes.split()) - set(SOURCES):
                raise ValueError(f'{number}장에 출처가 없는 주석 칩이 있습니다: {codes}')
        if number in EXEGESIS:
            seen: list[int] = []
            for reference, _, paragraphs in EXEGESIS[number]:
                chapter, first, last = verse_span(reference)
                if chapter != number or not paragraphs:
                    raise ValueError(f'{number}장 절별 주해 범위 오류: {reference}')
                seen += list(range(first, last + 1))
                for codes, _ in paragraphs:
                    if set(codes.split()) - set(SOURCES):
                        raise ValueError(f'{number}장 절별 주해에 출처가 없는 칩이 있습니다: {codes}')
            if sorted(seen) != sorted(expected) or len(seen) != len(expected):
                raise ValueError(f'{number}장 절별 주해가 {len(expected)}절을 빠짐없이 한 번씩 덮지 못합니다')
        supplement = CHAPTER_SUPPLEMENTS.get(number)
        if not supplement or not supplement['background'] or not supplement['canon'] or len(supplement['teaching']['outline']) < 3:
            raise ValueError(f'{number}장 보완층(배경·정경·설교)이 비어 있습니다')
        extra = supplement['background'] + supplement['canon'] + supplement['teaching']['notes']
        extra += [(row['codes'], row['note']) for row in LEXICON.get(number, [])]
        for codes, _ in extra:
            if set(codes.split()) - set(SOURCES):
                raise ValueError(f'{number}장 보완층에 출처가 없는 칩이 있습니다: {codes}')
        for row in LEXICON.get(number, []):
            if str(row['verse']) not in bible[str(number)]:
                raise ValueError(f'{number}장 원어 항목의 절 번호가 본문 범위를 벗어납니다: {row["verse"]}')
        for book, chapter, _, _, codes in CROSS_REFERENCES[number]:
            if book not in manifest or not 1 <= chapter <= manifest[book]['chapters'] or set(codes.split()) - set(SOURCES):
                raise ValueError(f'{number}장 상호 참조가 성경 리더 또는 출처를 벗어납니다: {book} {chapter}')


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument('--write', action='store_true')
    mode.add_argument('--check', action='store_true')
    args = parser.parse_args()
    check_research()
    pages = {BOOK / 'index.html': render_index(), BOOK / 'overview.html': render_overview()}
    pages.update({BOOK / f'ch{n:02d}.html': render_chapter(n) for n in CHAPTERS})
    differing = [str(p.relative_to(ROOT)) for p, html in pages.items() if not p.exists() or p.read_text(encoding='utf-8') != html]
    if args.write:
        BOOK.mkdir(parents=True, exist_ok=True)
        for path, html in pages.items():
            path.write_text(html, encoding='utf-8')
        print(f'Wrote {len(pages)} Ecclesiastes pages.')
        return 0
    if differing:
        print('Outdated pages: ' + ', '.join(differing))
        return 1
    print(f'Checked {len(pages)} Ecclesiastes pages.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
