#!/usr/bin/env python3
"""
절↔연구 이동 지도 빌더 — 각 연구 문서의 절 앵커(id="vN")를 읽어
"이 절을 어느 연구의 어느 앵커로 보낼지"를 JSON으로 만든다.

원본 문서는 읽기만 하고 수정하지 않는다.

전제 폴더 구조(책마다 동일):
    ot/<book>/            심층 연구  chNN.html   (study)
    ot/<book>/parsing/    원어 파싱  chNN.html   (parsing)
    ot/<book>/interlinear/ 인터라이너 chNN.html  (interlinear)

앵커 해석: id="v5"→[5], id="v23"→[2,3], id="v67"→[6,7], id="v5b"→[5], id="v11b"→[11]
출력: data/links/<book>.json
    { "study": {존재 여부·경로}, "chapters": { "1": { "5": {"study":"v5", ...} } } }

사용법:
    python3 tools/build_links.py <book_dir> <book_code>
    예) python3 tools/build_links.py ot/nehemiah neh
"""
import sys, os, re, json, glob

def expand_anchor(aid):
    """v23 -> [2,3], v5b -> [5], v11 -> [11], v1 -> [1]"""
    m = re.match(r'^v(\d+)([a-z]?)$', aid)
    if not m: return []
    digits = m.group(1)
    # 두 자리 이상이면서 연속 절 결합(v23=2,3 / v67=6,7 / v89=8,9 / v1011=?) 처리
    # 규칙: 인접 절 결합 앵커는 각 자리를 개별 절로 본다(2자리 한정). 그 외는 전체를 한 절로.
    if len(digits) == 2 and digits[0] != '0':
        a, b = int(digits[0]), int(digits[1])
        if b == a + 1:            # 23,67,89 → 연속 두 절
            return [a, b]
    return [int(digits)]

def scan(path):
    """파일에서 id="v..." 앵커를 모아 verse→anchor 매핑 반환"""
    if not os.path.exists(path): return None
    html = open(path, encoding='utf-8').read()
    v2a = {}
    for aid in re.findall(r'id="(v\d+[a-z]?)"', html):
        for v in expand_anchor(aid):
            # 더 구체적인(짧은 범위) 앵커 우선: 이미 있으면 덮어쓰지 않음
            v2a.setdefault(v, aid)
    return v2a

def main():
    if len(sys.argv) < 3:
        print(__doc__); sys.exit(1)
    book_dir, book = sys.argv[1], sys.argv[2].lower()
    base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    book_dir = os.path.join(base, book_dir)

    kinds = {
        "study":       os.path.join(book_dir, "ch{:02d}.html"),
        "parsing":     os.path.join(book_dir, "parsing", "ch{:02d}.html"),
        "interlinear": os.path.join(book_dir, "interlinear", "ch{:02d}.html"),
    }
    # 상대 경로(허브 기준: ot/<book>/study/ 에서 볼 때)
    rel = {
        "study":       "../ch{:02d}.html",
        "parsing":     "../parsing/ch{:02d}.html",
        "interlinear": "../interlinear/ch{:02d}.html",
    }

    chapters = {}
    present = {k: [] for k in kinds}
    for ch in range(1, 100):
        found_any = False
        vmap = {}
        for kind, tmpl in kinds.items():
            p = tmpl.format(ch)
            v2a = scan(p)
            if v2a is None: continue
            found_any = True
            present[kind].append(ch)
            for v, aid in v2a.items():
                vmap.setdefault(str(v), {})[kind] = {
                    "href": rel[kind].format(ch),
                    "anchor": aid,
                }
        if not found_any and ch > 13:
            break
        if vmap:
            chapters[str(ch)] = vmap

    # 폴더명(예: nehemiah)을 함께 기록 — book 코드(neh)와 다를 수 있다.
    folder = os.path.basename(book_dir.rstrip("/"))
    out = {
        "book": book,
        "folder": folder,
        "present": {k: sorted(v) for k, v in present.items()},
        "chapters": chapters,
    }
    outdir = os.path.join(base, "data", "links")
    os.makedirs(outdir, exist_ok=True)
    path = os.path.join(outdir, f"{book}.json")
    json.dump(out, open(path, "w"), ensure_ascii=False, separators=(",", ":"))
    nch = len(chapters)
    print(f"{book}: {nch}장 링크 지도 생성 → {os.path.relpath(path)}")
    for k, chs in present.items():
        print(f"  {k:12s}: {len(chs)}장 ({chs[:3]}{'...' if len(chs)>3 else ''})")

if __name__ == "__main__":
    main()
