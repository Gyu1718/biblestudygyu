#!/usr/bin/env python3
"""절↔연구 이동 지도 빌더.

기존 id="v5", id="v23" 규칙과 함께 data-verses="1,2,3" 또는
 data-verses="8-10"을 지원한다. 복수 절 연구 단락은 data-verses를 우선 사용한다.
"""
import sys, os, re, json
from html.parser import HTMLParser


def parse_verses(value):
    out = []
    for token in re.split(r'\s*,\s*', value or ''):
        if not token: continue
        m = re.fullmatch(r'(\d+)(?:\s*[-–—]\s*(\d+))?', token)
        if not m: continue
        a, b = int(m.group(1)), int(m.group(2) or m.group(1))
        if 1 <= a <= b <= 176:
            out.extend(range(a, b + 1))
    return list(dict.fromkeys(out))


def expand_anchor(aid):
    m = re.match(r'^v(\d+)([a-z]?)$', aid or '')
    if not m: return []
    digits, suffix = m.groups()
    if suffix: return [int(digits)]
    if len(digits) <= 2: return [int(digits)]
    candidates = []
    for i in range(1, len(digits)):
        a, b = int(digits[:i]), int(digits[i:])
        if 1 <= a <= b <= 176 and b - a <= 30:
            candidates.append((b-a, -a, a, b))
    if candidates:
        _, _, a, b = sorted(candidates)[0]
        return list(range(a, b + 1))
    return [int(digits)]


class AnchorParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.items = []
    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        aid = d.get('id', '')
        if not re.fullmatch(r'v\d+[a-z]?', aid): return
        verses = parse_verses(d.get('data-verses')) or expand_anchor(aid)
        if verses: self.items.append((aid, verses))


def scan(path):
    if not os.path.exists(path): return None
    parser = AnchorParser()
    parser.feed(open(path, encoding='utf-8').read())
    v2a = {}
    for aid, verses in parser.items:
        for v in verses: v2a.setdefault(v, aid)
    return v2a


def main():
    if len(sys.argv) < 3:
        print('usage: build_links.py <book_dir> <book_code>'); sys.exit(1)
    book_dir, book = sys.argv[1], sys.argv[2].lower()
    base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    book_dir = os.path.join(base, book_dir)
    kinds = {
        'study': os.path.join(book_dir, 'ch{:02d}.html'),
        'parsing': os.path.join(book_dir, 'parsing', 'ch{:02d}.html'),
        'interlinear': os.path.join(book_dir, 'interlinear', 'ch{:02d}.html'),
    }
    rel = {
        'study': '../ch{:02d}.html',
        'parsing': '../parsing/ch{:02d}.html',
        'interlinear': '../interlinear/ch{:02d}.html',
    }
    chapters, present = {}, {k: [] for k in kinds}
    for ch in range(1, 100):
        found_any, vmap = False, {}
        for kind, tmpl in kinds.items():
            v2a = scan(tmpl.format(ch))
            if v2a is None: continue
            found_any = True; present[kind].append(ch)
            for v, aid in v2a.items():
                vmap.setdefault(str(v), {})[kind] = {'href': rel[kind].format(ch), 'anchor': aid}
        if not found_any and ch > 16: break
        if vmap: chapters[str(ch)] = vmap
    out = {'book': book, 'folder': os.path.basename(book_dir.rstrip('/')), 'present': present, 'chapters': chapters}
    outdir = os.path.join(base, 'data', 'links'); os.makedirs(outdir, exist_ok=True)
    path = os.path.join(outdir, book + '.json')
    json.dump(out, open(path, 'w'), ensure_ascii=False, separators=(',', ':'))
    print(f'{book}: {len(chapters)}장 링크 지도 생성 → {os.path.relpath(path)}')

if __name__ == '__main__': main()
