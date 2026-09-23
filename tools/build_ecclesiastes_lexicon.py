#!/usr/bin/env python3
"""전도서 ‘핵심 원어와 문법’ 데이터를 만든다.

입력: ot/ecclesiastes/lexicon_spec.py (사람이 쓴 설명)
      data/interlinear/ecclesiastes/NN.json (tools/interlinear 파이프라인 결과)
출력: ot/ecclesiastes/lexicon_data.py

히브리어 표기와 음역은 STEPBible TAHOT(CC BY 4.0)에서 그대로 가져오고,
강세 부호만 지운다. 빈도는 Strong 번호 기준 전도서 전체 출현 횟수다.
"""
from __future__ import annotations

import json
import pprint
import re
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BOOK = ROOT / 'ot' / 'ecclesiastes'
DATA = ROOT / 'data' / 'interlinear' / 'ecclesiastes'
sys.path.insert(0, str(BOOK))
sys.path.insert(0, str(ROOT / 'tools' / 'interlinear'))

from lexicon_spec import LEXICON_SPEC  # noqa: E402
import translit_ko  # noqa: E402

ACCENTS = re.compile('[\u0591-\u05AF\u05BD\u05C0\u05C3]')


def plain(text: str) -> str:
    return ACCENTS.sub('', text.replace('/', ''))


def base(strong: str) -> str:
    return re.sub(r'[A-Za-z]$', '', strong)


def main() -> int:
    chapters = {}
    counts: Counter[str] = Counter()
    for number in range(1, 13):
        path = DATA / f'{number:02d}.json'
        if not path.exists():
            print(f'{path} 가 없습니다. build_interlinear.py를 먼저 실행하세요.', file=sys.stderr)
            return 1
        chapters[number] = json.loads(path.read_text(encoding='utf-8'))
        for verse in chapters[number]['v']:
            for word in verse['w']:
                for strong in set(base(s) for s in word['s']):
                    counts[strong] += 1

    out = {}
    for number, rows in LEXICON_SPEC.items():
        verses = {v['n']: v['w'] for v in chapters[number]['v']}
        built = []
        for verse, strongs, label, note, codes in rows:
            words = verses[verse]
            picked = []
            for strong in strongs:
                match = next((w for w in words if strong in {base(s) for s in w['s']} and w not in picked), None)
                if match is None:
                    raise SystemExit(f'{number}:{verse}에서 {strong}을 찾지 못했습니다.')
                picked.append(match)
            picked.sort(key=lambda w: w['i'])
            adjacent = all(b['i'] - a['i'] == 1 for a, b in zip(picked, picked[1:]))
            joiner = ' ' if adjacent else ' … '
            hebrew = joiner.join(plain(w['t']) for w in picked)
            lemma = ' · '.join(plain(w['lem']) for w in picked)
            translit = joiner.join(translit_ko.to_hangul(w['tr'].replace('/', '')) for w in picked)
            freq = [counts[s] for s in strongs]
            built.append({
                'verse': verse, 'strongs': strongs, 'hebrew': hebrew, 'lemma': lemma,
                'translit': translit, 'freq': freq, 'label': label, 'note': note, 'codes': codes,
            })
        out[number] = built

    target = BOOK / 'lexicon_data.py'
    target.write_text(
        '"""자동 생성 파일 — tools/build_ecclesiastes_lexicon.py가 lexicon_spec.py와 STEPBible TAHOT에서 만든다. 직접 고치지 않는다."""\n\n'
        'LEXICON = ' + pprint.pformat(out, width=110, sort_dicts=False) + '\n',
        encoding='utf-8',
    )
    print(f'{target.relative_to(ROOT)}: {sum(len(v) for v in out.values())}개 항목')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
