#!/usr/bin/env python3
"""신명기 연구 서가 빌더.

현재 단계: 서가(index.html)만 만든다. 성경읽기 34장과 원어 연구 34편을 연결하고,
종합 개관·장별 심층연구가 준비되면 이 스크립트를 전도서 빌더와 같은 구조로 확장한다.
원어 연구 페이지는 tools/interlinear/ 파이프라인으로 생성한다.
"""
from __future__ import annotations

import argparse
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BOOK = ROOT / 'ot' / 'deuteronomy'
CHAPTERS = range(1, 35)


def head(title: str, desc: str) -> str:
    url = 'https://gyu1718.github.io/biblestudygyu/ot/deuteronomy/index.html'
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
</head><body data-root="../../" data-book="deuteronomy" data-script="heb" data-kind="study-home"><a class="skip-link" href="#top">본문으로 건너뛰기</a>'''


def render_index() -> str:
    title = '신명기 연구 서가'
    desc = '신명기 34장 959절을 원문·개역개정 성경읽기와 STEPBible TAHOT 기반 원어 연구로 연결하는 연구 서가.'
    reader = ' '.join(f'<a href="../../bible/original.html?book=DEU&amp;chapter={i}">{i}장</a>' for i in CHAPTERS)
    parsing = ' '.join(f'<a href="parsing/ch{i:02d}.html">{i}장</a>' for i in CHAPTERS)
    links = ('<a href="../../bible/original.html?book=DEU&amp;chapter=1">성경읽기</a>'
             '<a href="./parsing/ch01.html">원어 연구</a><a href="../../index.html">서고 홈</a>')
    anchors = [('reading', '성경읽기'), ('parsing', '원어 연구'), ('status', '연구 진행 상황')]
    toc = ''.join(f'<a href="#{a}">{escape(b)}</a>' for a, b in anchors)
    out = [head(title, desc),
           f'<div class="layout"><nav class="toc" aria-label="신명기 연구 목차"><div class="toplinks">{links}</div>'
           f'<div class="brand">{title}</div><div class="label">이 문서의 목차</div>{toc}</nav><main id="top" tabindex="-1">',
           '<header class="hero"><span class="heb" lang="he" dir="rtl">דְּבָרִים</span><div class="eyebrow">DEUTERONOMY · 34 CHAPTERS</div>'
           f'<h1>{title}</h1><p class="lead">모압 평지에서 모세가 전한 세 편의 설교와 언약 갱신, 모세의 노래와 축복, 그의 죽음까지. '
           '신명기 34장 959절을 원문·개역개정 성경읽기와 장별 원어 연구로 먼저 연결했습니다.</p>'
           '<p class="meta">성경읽기 34장 · 원어 연구 34편(STEPBible TAHOT, 959절) · 종합 개관·장별 심층연구 준비 중</p></header>',
           f'<section class="part" id="reading"><h2>성경읽기</h2><p>원문과 개역개정을 절 단위로 대조하고 관주를 펼쳐 봅니다.</p><div class="reader-grid">{reader}</div></section>',
           '<section class="part" id="parsing"><h2>원어 연구</h2><p>STEPBible TAHOT/TEHMC(CC BY 4.0)에서 <code>tools/interlinear/</code> 파이프라인으로 생성한 인터라이너입니다. '
           '낱말마다 원형, Strong 번호, 형태 분석, 음역을 보여 주며, 장절은 한국어·영어 성경을 따릅니다. '
           '히브리어 성경과 장절이 다른 곳은 12:32(히브리어 13:1), 22:30(23:1), 29:1(28:69) 등입니다.</p>'
           f'<div class="reader-grid">{parsing}</div></section>',
           '<section class="part" id="status"><h2>연구 진행 상황</h2><p>종합 개관과 34장의 장별 심층연구는 주석 자료를 대조해 준비하고 있습니다. '
           '완성되는 대로 이 서가에 차례로 연결합니다.</p></section>',
           '<nav class="page-nav" aria-label="연구 페이지 이동"><span></span><a href="../../index.html">서고 홈</a><a href="parsing/ch01.html">원어 연구 1장 →</a></nav>'
           '<footer>신명기 연구 · 원문 데이터 STEPBible (CC BY 4.0) · 성경읽기 DEU / 개역개정</footer></main></div>'
           '<script src="../../assets/app.js"></script><script src="../../assets/js/bible-reader.js" defer data-bible-reader-js></script></body></html>\n']
    return ''.join(out)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('--write', action='store_true')
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    html = render_index()
    target = BOOK / 'index.html'
    if args.write:
        target.write_text(html, encoding='utf-8')
        print('Wrote ot/deuteronomy/index.html')
    if args.check:
        missing = [i for i in CHAPTERS if not (BOOK / 'parsing' / f'ch{i:02d}.html').exists()]
        if missing:
            raise SystemExit(f'원어 연구 페이지 누락: {missing}')
        if target.read_text(encoding='utf-8') != html:
            raise SystemExit('ot/deuteronomy/index.html 이 빌더 출력과 다릅니다. --write 로 다시 만드세요.')
        print('Checked Deuteronomy shelf.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
