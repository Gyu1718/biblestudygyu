#!/usr/bin/env python3
"""
성경 관주(cross-reference) 빌더 — OpenBible.info 데이터를 책별 JSON으로 변환.

사용법:
    python3 tools/build_xrefs.py <cross_references.txt> [책코드 ...]

책코드를 생략하면 전체 성경을 처리한다. 특정 책만 갱신하려면:
    python3 tools/build_xrefs.py cross_references.txt Neh Gen Ps

출력: data/xrefs/<book>.json   (예: data/xrefs/neh.json)
      data/xrefs/index.json    (책별 관주 보유 현황)

데이터 출처: OpenBible.info Cross References (CC-BY). 원자료 라이선스를 함께 배포할 것.
"""
import sys, os, json, collections

# OSIS 약어 → 한국어 개역개정 약칭
KO = {
 'Gen':'창','Exod':'출','Lev':'레','Num':'민','Deut':'신','Josh':'수','Judg':'삿','Ruth':'룻',
 '1Sam':'삼상','2Sam':'삼하','1Kgs':'왕상','2Kgs':'왕하','1Chr':'대상','2Chr':'대하',
 'Ezra':'스','Neh':'느','Esth':'에','Job':'욥','Ps':'시','Prov':'잠','Eccl':'전','Song':'아',
 'Isa':'사','Jer':'렘','Lam':'애','Ezek':'겔','Dan':'단','Hos':'호','Joel':'욜','Amos':'암',
 'Obad':'옵','Jonah':'욘','Mic':'미','Nah':'나','Hab':'합','Zeph':'습','Hag':'학','Zech':'슥','Mal':'말',
 'Matt':'마','Mark':'막','Luke':'눅','John':'요','Acts':'행','Rom':'롬','1Cor':'고전','2Cor':'고후',
 'Gal':'갈','Eph':'엡','Phil':'빌','Col':'골','1Thess':'살전','2Thess':'살후','1Tim':'딤전','2Tim':'딤후',
 'Titus':'딛','Phlm':'몬','Heb':'히','Jas':'약','1Pet':'벧전','2Pet':'벧후',
 '1John':'요일','2John':'요이','3John':'요삼','Jude':'유','Rev':'계',
 'Tob':'토빗','Jdt':'유딧','Wis':'지혜서','Sir':'집회서','Bar':'바룩','1Macc':'마카비상','2Macc':'마카비하',
 '1Esd':'에스드라1','2Esd':'에스드라2','Sus':'수산나','Bel':'벨과용','PrAzar':'아자랴기도',
 'AddEsth':'에스더추가','EpJer':'예레미야편지','PrMan':'므낫세기도','AddDan':'다니엘추가',
}
ORDER = {b:i for i,b in enumerate(list(KO.keys()))}

def ko_ref(ref):
    """Neh.1.1 / Ps.137.5-Ps.137.6 → 한국어 표기"""
    if '-' in ref:
        a,b = ref.split('-',1)
        pa, pb = a.split('.'), b.split('.')
        bk = KO.get(pa[0], pa[0])
        if len(pa)>=3 and len(pb)>=3:
            if pa[0]==pb[0] and pa[1]==pb[1]: return f"{bk} {pa[1]}:{pa[2]}\u2013{pb[2]}"
            if pa[0]==pb[0]:                   return f"{bk} {pa[1]}:{pa[2]}\u2013{pb[1]}:{pb[2]}"
            return f"{bk} {pa[1]}:{pa[2]}\u2013{KO.get(pb[0],pb[0])} {pb[1]}:{pb[2]}"
        return f"{bk} {'.'.join(pa[1:])}"
    p = ref.split('.')
    bk = KO.get(p[0], p[0])
    if len(p)>=3: return f"{bk} {p[1]}:{p[2]}"
    if len(p)==2: return f"{bk} {p[1]}"
    return bk

def main():
    if len(sys.argv) < 2:
        print(__doc__); sys.exit(1)
    src = sys.argv[1]
    want = set(sys.argv[2:]) if len(sys.argv) > 2 else None
    outdir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'xrefs')
    os.makedirs(outdir, exist_ok=True)

    # {book: {chap: {verse: [(koref, votes, order)]}}}
    data = collections.defaultdict(lambda: collections.defaultdict(lambda: collections.defaultdict(list)))
    with open(src) as f:
        next(f)
        for line in f:
            parts = line.rstrip('\n').split('\t')
            if len(parts) < 3: continue
            fv, tv, votes = parts[0], parts[1], parts[2]
            fb = fv.split('.')[0]
            if want and fb not in want: continue
            try:
                _, ch, vs = fv.split('.'); ch, vs, votes = int(ch), int(vs), int(votes)
            except: continue
            tb = tv.split('.')[0].split('-')[0]
            data[fb][ch][vs].append((ko_ref(tv), votes, ORDER.get(tb, 999)))

    idx = {}
    for book in sorted(data, key=lambda b: ORDER.get(b, 999)):
        book_out = {}
        n = 0
        for ch in data[book]:
            book_out[str(ch)] = {}
            for vs in data[book][ch]:
                refs = sorted(data[book][ch][vs], key=lambda x: (-x[1], x[2]))
                book_out[str(ch)][str(vs)] = [{'r': r[0], 'v': r[1]} for r in refs]
                n += len(refs)
        path = os.path.join(outdir, f"{book.lower()}.json")
        json.dump(book_out, open(path, 'w'), ensure_ascii=False, separators=(',', ':'))
        idx[book.lower()] = {'ko': KO.get(book, book), 'chapters': len(book_out), 'refs': n}
        print(f"  {book:6s} → {os.path.relpath(path)}  ({n}개 관주, {len(book_out)}장)")

    # index.json 병합(기존 항목 유지)
    ipath = os.path.join(outdir, 'index.json')
    merged = {}
    if os.path.exists(ipath):
        merged = json.load(open(ipath))
    merged.update(idx)
    json.dump(merged, open(ipath, 'w'), ensure_ascii=False, indent=1)
    print(f"\nindex.json 갱신: {len(merged)}개 책 등록")

if __name__ == '__main__':
    main()
