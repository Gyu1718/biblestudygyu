#!/usr/bin/env python3
"""누가복음 연구 서가 빌더.

nt/luke/research_data.py(장별 연구)와 overview_data.py(종합 개관)를 읽어
index.html, overview.html, chNN.html을 만든다. 원어 연구(parsing/)는
tools/interlinear/ 파이프라인으로 따로 생성한다.

  python3 tools/build_luke.py --write   # 페이지 생성
  python3 tools/build_luke.py --check   # 데이터 검증과 산출물 일치 확인
"""
from __future__ import annotations

import argparse
import gzip
import json
import re
import sys
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BOOK = ROOT / 'nt' / 'luke'
sys.path.insert(0, str(BOOK))
from research_data import CHAPTERS, SOURCES  # noqa: E402
try:
    from overview_data import OVERVIEW, INDEX_LEAD  # noqa: E402
except ImportError:  # 종합 개관이 아직 없을 때
    OVERVIEW, INDEX_LEAD = [], ''
try:
    from overview_data import OUTLINE, NT_USES, ISSUES, FURTHER_READING  # noqa: E402
except ImportError:
    OUTLINE, NT_USES, ISSUES, FURTHER_READING = [], [], [], []
try:
    from verse_exegesis import EXEGESIS  # noqa: E402
except ImportError:
    EXEGESIS = {}
try:
    from lexicon_data import LEXICON  # noqa: E402  (tools/build_luke_lexicon.py가 생성)
except ImportError:
    LEXICON = {}

ALL = range(1, 25)
REQUIRE_RICH = range(1, 25)  # 모든 장에 비교·난제·메시지를 요구
TITLE_GK = 'ΚΑΤΑ ΛΟΥΚΑΝ'


def kor_bible() -> dict:
    data = json.load(gzip.open(ROOT / 'assets/data/bible/kor/chunks/nt-gospels-acts.json.gz'))
    return data['LUK']['chapters']


def span(ref: str) -> tuple[int, int, int]:
    m = re.fullmatch(r'(\d+):(\d+)(?:[–-](\d+))?', ref)
    if not m:
        raise ValueError(f'절 범위 형식 오류: {ref}')
    return int(m[1]), int(m[2]), int(m[3] or m[2])


def chips(codes: str) -> str:
    return ''.join(f'<a class="chip" data-source="{c}" href="#src-{c}" title="{escape(SOURCES[c][0])}">{c}</a>' for c in codes.split())


def para(item: tuple[str, str]) -> str:
    codes, text = item
    return f'<p>{text} {chips(codes)}</p>'


def head(title: str, desc: str, kind: str, filename: str, chapter: int | None = None) -> str:
    url = f'https://gyu1718.github.io/biblestudygyu/nt/luke/{filename}'
    preview = 'https://gyu1718.github.io/biblestudygyu/assets/og/site-preview.png'
    chap = f' data-chapter="{chapter}"' if chapter else ''
    return f'''<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{escape(title)} — 성서 연구 서고</title><meta name="description" content="{escape(desc)}">
<meta property="og:type" content="website"><meta property="og:locale" content="ko_KR"><meta property="og:title" content="{escape(title)} — 성서 연구 서고"><meta property="og:description" content="{escape(desc)}"><meta property="og:url" content="{url}"><meta property="og:image" content="{preview}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{escape(title)} — 성서 연구 서고"><meta name="twitter:description" content="{escape(desc)}"><meta name="twitter:image" content="{preview}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;700&amp;family=Noto+Sans+KR:wght@400;500;700&amp;family=Noto+Serif:ital,wght@0,400;0,700;1,400&amp;display=swap" rel="stylesheet">
<link rel="stylesheet" href="study.css"><link rel="stylesheet" href="../../assets/css/bible-reader.css" data-bible-reader-css>
<link rel="stylesheet" href="../../assets/theme.css" data-site-theme><link rel="stylesheet" href="../../assets/app.css" data-site-app-css>
</head><body data-root="../../" data-book="luke" data-script="grc" data-kind="{kind}"{chap}><a class="skip-link" href="#top">본문으로 건너뛰기</a>'''


def close() -> str:
    return '<script src="../../assets/app.js"></script><script src="../../assets/js/bible-reader.js" defer data-bible-reader-js></script></body></html>\n'


def nav(title: str, anchors: list[tuple[str, str]], current: int | None = None) -> str:
    links = ('<a href="../../bible/original.html?book=LUK&amp;chapter=1">성경읽기</a>'
             + ('<a href="./overview.html">종합 개관</a>' if OVERVIEW else '')
             + '<a href="./index.html">누가복음 서가</a>'
             + f'<a href="./parsing/ch{current or 1:02d}.html">원어 연구</a><a href="../../index.html">서고 홈</a>')
    jumps = ''.join(
        (f'<a href="ch{i:02d}.html" aria-label="누가복음 {i}장 심층연구"' + (' aria-current="page"' if i == current else '') + f'>{i}</a>')
        if i in CHAPTERS else f'<span aria-disabled="true" title="준비 중">{i}</span>' for i in ALL)
    toc = ''.join(f'<a href="#{escape(a)}">{escape(b)}</a>' for a, b in anchors)
    return (f'<div class="layout"><nav class="toc" aria-label="누가복음 연구 목차"><div class="toplinks">{links}</div>'
            f'<div class="brand">{escape(title)}</div><div class="label">장별 심층 연구</div><div class="jump">{jumps}</div>'
            f'<div class="label">이 문서의 목차</div>{toc}</nav><main id="top" tabindex="-1">')


def legend(used: set[str]) -> str:
    items = ''.join(f'<span>{chips(c)} {escape(SOURCES[c][0])}, <em>{escape(SOURCES[c][1])}</em></span>' for c in SOURCES if c in used)
    return f'<div class="legend" aria-label="출처 칩">{items}</div>'


def sources(used: set[str]) -> str:
    rows = ''.join(f'<li id="src-{c}">{chips(c)} {escape(a)}, <em>{escape(t)}</em>, {escape(p)} · {escape(k)}</li>'
                   for c, (a, t, p, k) in SOURCES.items() if c in used)
    return ('<section class="part" id="sources"><h2>주석 출처</h2><ul class="sources">' + rows + '</ul>'
            '<p class="source-note">주석의 논지는 요약해 옮겼고 원문을 번역해 옮기지 않았습니다. 성경 인용은 개역개정을 따릅니다.</p></section>')


def foot(prev: str | None, nxt: str | None) -> str:
    out = '<nav class="page-nav" aria-label="연구 페이지 이동">'
    out += f'<a href="{prev}">← 이전</a>' if prev else '<span></span>'
    out += '<a href="index.html">누가복음 서가</a>'
    out += f'<a href="{nxt}">다음 →</a>' if nxt else '<span></span>'
    return out + ('</nav><footer>누가복음 연구 · 그린(NICNT)·에드워즈(PNTC)·갈런드(ZECNT)·포트너 대조 · 원문 데이터 STEPBible TAGNT (CC BY 4.0) · 성경읽기 LUK / 개역개정 · '
                  '주석 원문은 이 저장소에 배포하지 않습니다.</footer></main></div>') + close()


def used_codes(ch: dict, number: int | None = None) -> set[str]:
    items = [p for _, _, ps in ch['units'] for p in ps] + list(ch['message'])
    items += [p for _, ps in ch.get('debates', []) for p in ps]
    codes = set(' '.join(c for c, _ in items).split())
    codes |= {code for _, views in ch.get('compare', []) for code, _ in views}
    if ch.get('main'):
        codes.add('Ga')
    if number in EXEGESIS:
        codes |= set(' '.join(c for _, _, ps in EXEGESIS[number] for c, _ in ps).split())
    if number in LEXICON:
        codes |= set(' '.join(row['codes'] for row in LEXICON[number]).split())
    return codes


def exegesis_block(number: int, unit_range: str) -> str:
    _, first, last = span(unit_range)
    items = [item for item in EXEGESIS.get(number, []) if first <= span(item[0])[1] <= last]
    if not items:
        return ''
    parts = ['<div class="vx-wrap"><h3>절별 주해</h3>']
    for reference, title, paragraphs in items:
        parts.append(f'<div class="vx"><h4>{escape(reference)} · {escape(title)}</h4>' + ''.join(map(para, paragraphs)) + '</div>')
    parts.append('</div>')
    return ''.join(parts)


def lexicon_section(number: int) -> str:
    rows = []
    for row in LEXICON.get(number, []):
        gloss = row['label'].split(', ', 1)[1] if ', ' in row['label'] else row['label']
        freq = ', '.join(f'{strong} {n}회' for strong, n in zip(row['strongs'], row['freq']))
        rows.append(
            f'<tr><td><a href="./parsing/ch{number:02d}.html#v{row["verse"]}">{number}:{row["verse"]}</a></td>'
            f'<td><span class="lex-gk" lang="grc">{escape(row["greek"])}</span>'
            f'<span class="lex-tr">{escape(row["translit"])}</span>'
            f'<span class="lex-lemma">사전형 <span lang="grc">{escape(row["lemma"])}</span> · 누가복음 빈도 {escape(freq)}</span></td>'
            f'<td><strong>{gloss}</strong><br>{row["note"]} {chips(row["codes"])}</td></tr>')
    if not rows:
        return ''
    return ('<section class="part" id="lexicon"><h2>핵심 원어</h2>'
            f'<p>헬라어 표기와 사전형, 빈도는 STEPBible TAGNT(CC BY 4.0)에서 가져왔습니다. 절 번호를 누르면 <a href="./parsing/ch{number:02d}.html">원어 연구 {number}장</a>의 해당 절로 이동합니다.</p>'
            '<div class="table-scroll"><table class="lex-table"><thead><tr><th>절</th><th>원어</th><th>뜻과 쓰임</th></tr></thead><tbody>'
            + ''.join(rows) + '</tbody></table></div></section>')


def render_chapter(n: int) -> str:
    ch = CHAPTERS[n]
    used = used_codes(ch, n)
    anchors = [('structure', '단락의 짜임')] + ([('main', '갈런드의 중심 사상')] if ch.get('main') else []) \
        + [(f'u{i}', f'{r} {h}') for i, (r, h, _) in enumerate(ch['units'], 1)] \
        + ([('compare', '주석 간 해석 비교')] if ch.get('compare') else []) \
        + ([('debates', '신학적 난제와 논쟁점')] if ch.get('debates') else []) \
        + ([('lexicon', '핵심 원어')] if LEXICON.get(n) else []) \
        + [('message', '신학적 메시지'), ('xrefs', '상호 참조'), ('sources', '주석 출처')]
    title = f'누가복음 {n}장 · {ch["title"]}'
    prev = f'ch{n - 1:02d}.html' if n - 1 in CHAPTERS else ('overview.html' if OVERVIEW else None)
    nxt = f'ch{n + 1:02d}.html' if n + 1 in CHAPTERS else None
    out = [head(title, ch['desc'], 'study-chapter', f'ch{n:02d}.html', n), nav(f'누가복음 {n}장', anchors, n)]
    out.append(f'<header class="hero"><span class="grk" lang="grc">{TITLE_GK}</span><div class="eyebrow">CHAPTER {n:02d} · 복음서</div>'
               f'<h1>{escape(title)}</h1><p class="lead">{escape(ch["desc"])}</p>'
               f'<p class="meta"><a href="../../bible/original.html?book=LUK&amp;chapter={n}">원문·개역개정 성경읽기 ↗</a> · '
               f'<a href="./parsing/ch{n:02d}.html">원어 연구 {n}장 →</a> · {len(ch["units"])}개 단락 · 주석 {len(used)}종</p></header>')
    out.append(legend(used))
    rows = ''.join(f'<li><a href="#u{i}"><strong>{escape(r)}</strong> {escape(h)}</a></li>' for i, (r, h, _) in enumerate(ch['units'], 1))
    out.append(f'<section class="part" id="structure"><h2>단락의 짜임</h2><ol class="units">{rows}</ol></section>')
    if ch.get('main'):
        mrows = ''.join(f'<tr><td>{escape(r)}</td><td>{t}</td></tr>' for r, t in ch['main'])
        out.append('<section class="part" id="main"><h2>갈런드의 중심 사상</h2>'
                   f'<p class="source-note">{chips("Ga")} 이 서가는 갈런드(ZECNT)의 단락 구분과 중심 사상을 해석의 축으로 삼습니다. 아래는 갈런드가 각 단락에 제시하는 중심 사상을 요약한 것입니다.</p>'
                   f'<div class="table-scroll"><table><thead><tr><th>본문</th><th>중심 사상</th></tr></thead><tbody>{mrows}</tbody></table></div></section>')
    for i, (r, h, ps) in enumerate(ch['units'], 1):
        out.append(f'<section class="part" id="u{i}"><h2>{escape(r)} · {escape(h)}</h2>' + ''.join(map(para, ps)) + exegesis_block(n, r) + '</section>')
    if ch.get('compare'):
        parts = ['<section class="part" id="compare"><h2>주석 간 해석 비교</h2>'
                 '<p class="source-note">같은 본문을 두고 주석들이 서로 다르게 읽는 지점을 쟁점별로 나란히 놓았습니다.</p>']
        for topic, views in ch['compare']:
            vrows = ''.join(f'<tr><th scope="row">{chips(code)} {escape(SOURCES[code][0].split()[-1])}</th><td>{view}</td></tr>' for code, view in views)
            parts.append(f'<h3>{escape(topic)}</h3><div class="table-scroll"><table class="compare-table"><tbody>{vrows}</tbody></table></div>')
        out.append(''.join(parts) + '</section>')
    if ch.get('debates'):
        parts = ['<section class="part" id="debates"><h2>신학적 난제와 논쟁점</h2>']
        for title_d, ps in ch['debates']:
            parts.append(f'<h3>{escape(title_d)}</h3>' + ''.join(map(para, ps)))
        out.append(''.join(parts) + '</section>')
    out.append(lexicon_section(n))
    out.append('<section class="part" id="message"><h2>신학적 메시지</h2>' + ''.join(map(para, ch['message'])) + '</section>')
    xr = ''.join(f'<tr><td>{escape(a)}</td><td>{b}</td></tr>' for a, b in ch['xrefs'])
    out.append('<section class="part" id="xrefs"><h2>상호 참조</h2><div class="table-scroll"><table><thead><tr><th>본문</th><th>연결</th></tr></thead>'
               f'<tbody>{xr}</tbody></table></div></section>')
    out.append(sources(used))
    out.append(foot(prev, nxt))
    return ''.join(out)


def render_overview() -> str:
    used = set(' '.join(c for _, ps in OVERVIEW for c, _ in ps).split()) | ({'C', 'T'} if ISSUES else set())
    anchors = ([('outline', '구조 개요')] if OUTLINE else []) + [(f'o{i}', h) for i, (h, _) in enumerate(OVERVIEW, 1)] \
        + ([('nt', '구약과 누가복음')] if NT_USES else []) + ([('issues', '주석들의 입장 비교')] if ISSUES else []) \
        + ([('reading-more', '더 읽을 문헌')] if FURTHER_READING else []) + [('sources', '주석 출처')]
    title = '누가복음 종합 개관'
    desc = '누가복음의 저자와 연대, 자료와 장르, 구조, 신학, 해석의 쟁점을 그린·에드워즈·갈런드의 주석과 포트너의 강해로 대조한다.'
    first = min(CHAPTERS) if CHAPTERS else None
    out = [head(title, desc, 'study-overview', 'overview.html'), nav(title, anchors)]
    out.append(f'<header class="hero"><span class="grk" lang="grc">{TITLE_GK}</span><div class="eyebrow">LUKE · OVERVIEW</div>'
               f'<h1>{title}</h1><p class="lead">{escape(desc)}</p></header>')
    out.append(legend(used))
    if OUTLINE:
        rows = ''.join(f'<tr><td>{escape(r)}</td><td>{escape(t)}</td><td>{escape(f)}</td></tr>' for r, t, f in OUTLINE)
        out.append('<section class="part" id="outline"><h2>구조 개요</h2><p>주석들이 제시하는 단락 구분을 대조해 누가복음의 짜임을 정리했습니다.</p>'
                   '<div class="table-scroll"><table><thead><tr><th>본문</th><th>단락</th><th>흐름</th></tr></thead>'
                   f'<tbody>{rows}</tbody></table></div></section>')
    for i, (h, ps) in enumerate(OVERVIEW, 1):
        out.append(f'<section class="part" id="o{i}"><h2>{i}. {escape(h)}</h2>' + ''.join(map(para, ps)) + '</section>')
    if NT_USES:
        rows = ''.join(f'<tr><td>{escape(d)}</td><td>{escape(n)}</td><td>{escape(t)}</td></tr>' for d, n, t in NT_USES)
        out.append('<section class="part" id="nt"><h2>구약과 누가복음</h2><p>누가복음이 인용하거나 되울리는 주요 구약 본문을 정리했습니다.</p>'
                   '<div class="table-scroll"><table><thead><tr><th>누가복음</th><th>구약</th><th>연결</th></tr></thead>'
                   f'<tbody>{rows}</tbody></table></div></section>')
    if ISSUES:
        rows = ''.join(f'<tr><th scope="row">{escape(i)}</th><td>{escape(c)}</td><td>{escape(t)}</td></tr>' for i, c, t in ISSUES)
        out.append('<section class="part" id="issues"><h2>주석들의 입장 비교</h2><p>주요 쟁점에 대한 세 주석의 입장을 짧게 대조합니다.</p>'
                   f'<div class="table-scroll"><table class="issue-table"><thead><tr><th>쟁점</th><th>{chips("G")} 그린</th><th>{chips("E")} 에드워즈</th><th>{chips("Ga")} 갈런드</th></tr></thead>'
                   f'<tbody>{rows}</tbody></table></div></section>')
    if FURTHER_READING:
        parts = ['<section class="part" id="reading-more"><h2>더 읽을 문헌</h2><p class="source-note">아래 문헌은 이 서가에서 직접 대조하지 않은 확장 연구용 목록입니다. 이 연구가 실제로 사용한 자료는 아래의 주석 출처에 있습니다.</p>']
        for group, items in FURTHER_READING:
            parts.append(f'<h3>{escape(group)}</h3><ul class="biblio">' + ''.join(f'<li>{item}</li>' for item in items) + '</ul>')
        out.append(''.join(parts) + '</section>')
    out.append(sources(used))
    out.append(foot('index.html', f'ch{first:02d}.html' if first else None))
    return ''.join(out)


def render_index() -> str:
    title = '누가복음 연구 서가'
    done = sorted(CHAPTERS)
    desc = f'누가복음 24장 1151절을 성경읽기, 원어 연구 24편, 종합 개관과 장별 심층연구({len(done)}/24)로 연결하는 연구 서가.'
    reader = ' '.join(f'<a href="../../bible/original.html?book=LUK&amp;chapter={i}">{i}장</a>' for i in ALL)
    parsing = ' '.join(f'<a href="parsing/ch{i:02d}.html">{i}장</a>' for i in ALL)
    cards = ''.join(
        f'<a class="card" href="ch{i:02d}.html"><span class="num">{i}</span><strong>{escape(CHAPTERS[i]["title"])}</strong><span>{escape(CHAPTERS[i]["desc"])}</span></a>'
        if i in CHAPTERS else f'<div class="card pending"><span class="num">{i}</span><strong>준비 중</strong></div>' for i in ALL)
    anchors = ([('overview', '종합 개관')] if OVERVIEW else []) + [('chapters', '장별 심층연구'), ('reading', '성경읽기'), ('parsing', '원어 연구')]
    lead = INDEX_LEAD or '데오빌로에게 보낸 차례대로 쓴 이야기, 예수의 탄생에서 예루살렘 여정과 십자가와 부활과 승천까지 누가복음 24장을 연구합니다.'
    out = [head(title, desc, 'study-home', 'index.html'), nav(title, anchors)]
    out.append(f'<header class="hero"><span class="grk" lang="grc">{TITLE_GK}</span><div class="eyebrow">LUKE · 24 CHAPTERS</div>'
               f'<h1>{title}</h1><p class="lead">{escape(lead)}</p>'
               f'<p class="meta">장별 심층연구 {len(done)}/24 · 원어 연구 24편(STEPBible TAGNT) · 그린(NICNT)·에드워즈(PNTC)·갈런드(ZECNT)·포트너 대조</p></header>')
    if OVERVIEW:
        out.append('<section class="part" id="overview"><h2>종합 개관</h2><p><a href="overview.html">누가복음 종합 개관 →</a> '
                   + ' · '.join(escape(h) for h, _ in OVERVIEW) + '</p></section>')
    out.append(f'<section class="part" id="chapters"><h2>장별 심층연구</h2><div class="cards">{cards}</div></section>')
    out.append(f'<section class="part" id="reading"><h2>성경읽기</h2><div class="reader-grid">{reader}</div></section>')
    out.append('<section class="part" id="parsing"><h2>원어 연구</h2><p>STEPBible TAGNT(CC BY 4.0)의 NA/UBS 본문으로 생성한 인터라이너입니다. '
               '개역개정에서 ‘(없음)’으로 표시된 17:36과 23:17은 주요 사본에 없는 절이라 인터라이너에도 없습니다.</p>'
               f'<div class="reader-grid">{parsing}</div></section>')
    out.append(foot(None, 'overview.html' if OVERVIEW else (f'ch{done[0]:02d}.html' if done else None)))
    return ''.join(out)


def check() -> None:
    bible = kor_bible()
    for n, ch in CHAPTERS.items():
        verses = len(bible[str(n)])
        seen: list[int] = []
        for r, h, ps in ch['units']:
            c, a, b = span(r)
            if c != n or not ps:
                raise ValueError(f'{n}장 단락 범위 오류: {r}')
            seen += list(range(a, b + 1))
        if seen != list(range(1, verses + 1)):
            raise ValueError(f'{n}장 단락이 1–{verses}절을 순서대로 빠짐없이 덮지 않습니다')
        for code in used_codes(ch, n):
            if code not in SOURCES:
                raise ValueError(f'{n}장 알 수 없는 칩: {code}')
        if not ch['message'] or not ch['xrefs']:
            raise ValueError(f'{n}장 신학적 메시지 또는 상호 참조가 비어 있습니다')
        if n in REQUIRE_RICH and not (ch.get('main') and len(ch.get('compare', [])) >= 2 and ch.get('debates') and len(ch['message']) >= 2):
            raise ValueError(f'{n}장에 중심 사상·주석 비교(2개 이상)·신학적 난제·신학적 메시지(2문단 이상)가 모두 필요합니다')
        for topic, views in ch.get('compare', []):
            if len(views) < 2:
                raise ValueError(f'{n}장 주석 비교 ‘{topic}’에는 두 주석 이상의 견해가 필요합니다')
    for n, items in EXEGESIS.items():
        verses = len(bible[str(n)])
        units = [span(r) for r, _, _ in CHAPTERS[n]['units']]
        seen = []
        for ref, title, ps in items:
            c, a, z = span(ref)
            if c != n or not ps or not title:
                raise ValueError(f'{n}장 절별 주해 형식 오류: {ref}')
            if not any(ua <= a and z <= uz for _, ua, uz in units):
                raise ValueError(f'{n}장 절별 주해 {ref}가 단락 경계를 넘습니다')
            seen += list(range(a, z + 1))
        if seen != list(range(1, verses + 1)):
            raise ValueError(f'{n}장 절별 주해가 1–{verses}절을 순서대로 빠짐없이 덮지 않습니다')
    for i in ALL:
        if not (BOOK / 'parsing' / f'ch{i:02d}.html').exists():
            raise ValueError(f'원어 연구 {i}장 누락')


def pages() -> dict[Path, str]:
    out = {BOOK / 'index.html': render_index()}
    if OVERVIEW:
        out[BOOK / 'overview.html'] = render_overview()
    for n in CHAPTERS:
        out[BOOK / f'ch{n:02d}.html'] = render_chapter(n)
    return out


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('--write', action='store_true')
    ap.add_argument('--check', action='store_true')
    args = ap.parse_args()
    check()
    built = pages()
    if args.write:
        for path, html in built.items():
            path.write_text(html, encoding='utf-8')
        print(f'Wrote {len(built)} Luke pages.')
    if args.check:
        for path, html in built.items():
            if not path.exists() or path.read_text(encoding='utf-8') != html:
                raise SystemExit(f'{path.relative_to(ROOT)} 이 빌더 출력과 다릅니다. --write 로 다시 만드세요.')
        print(f'Checked {len(built)} Luke pages.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
