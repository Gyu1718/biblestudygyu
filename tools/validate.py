#!/usr/bin/env python3
"""사이트 무결성 검사 — 링크·데이터·앵커·카탈로그를 점검한다.
사용법:  python3 tools/validate.py"""
import os, re, json, glob, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
errs, warns = [], []

# 1) 내부 링크 무결성
html_files = [f for f in glob.glob("**/*.html", recursive=True) if not f.startswith("templates/")]
for fn in html_files:
    base = os.path.dirname(fn)
    html = open(fn, encoding="utf-8").read()
    for href in re.findall(r'href="([^"]+)"', html):
        if href.startswith(("#","http","data:","mailto:","//")): continue
        if "{" in href or "esc(" in href: continue  # JS 템플릿
        target = os.path.normpath(os.path.join(base, href.split("#")[0]))
        if not os.path.exists(target):
            errs.append(f"깨진 링크: {fn} → {href}")

# 2) 관주 JSON 유효성
for jf in glob.glob("data/xrefs/*.json"):
    if jf.endswith("index.json"): continue
    try:
        d = json.load(open(jf))
        assert isinstance(d, dict)
    except Exception as e:
        errs.append(f"관주 JSON 손상: {jf} ({e})")

# 3) 이동 지도 JSON 유효성 + 앵커 존재 확인
for jf in glob.glob("data/links/*.json"):
    try:
        d = json.load(open(jf))
    except Exception as e:
        errs.append(f"이동 지도 손상: {jf} ({e})"); continue
    book = d.get("book","?")
    folder = d.get("folder", book)  # 폴더명(book 코드와 다를 수 있음)
    # 책이 ot/ 아래인지 nt/ 아래인지 탐색
    book_dir = None
    for sec in ("ot","nt","theology"):
        cand = os.path.join(sec, folder)
        if os.path.isdir(cand): book_dir = cand; break
    for ch, verses in d.get("chapters",{}).items():
        for v, kinds in verses.items():
            for kind, t in kinds.items():
                if not book_dir:
                    warns.append(f"책 폴더 못 찾음: {folder}"); break
                # 허브(<book_dir>/study/) 기준 상대경로 → 실제 파일
                p = os.path.normpath(os.path.join(book_dir, "study", t["href"]))
                if not os.path.exists(p):
                    warns.append(f"이동 대상 없음: {book} {ch}:{v} {kind} → {t['href']}")
                else:
                    tgt = open(p, encoding="utf-8").read()
                    if f'id="{t["anchor"]}"' not in tgt:
                        warns.append(f"앵커 없음: {p} #{t['anchor']} ({book} {ch}:{v})")

# 4) 카탈로그 파싱
cat = open("catalog.js", encoding="utf-8").read()
if "SITE_CATALOG" not in cat:
    errs.append("catalog.js: SITE_CATALOG 없음")

# 결과
print(f"검사 파일: HTML {len(html_files)}개")
print(f"관주 책: {len(glob.glob('data/xrefs/*.json'))-1 if os.path.exists('data/xrefs/index.json') else len(glob.glob('data/xrefs/*.json'))}개")
if errs:
    print(f"\n✗ 오류 {len(errs)}건")
    for e in errs[:20]: print("  -", e)
else:
    print("\n✓ 오류 없음")
if warns:
    print(f"\n⚠ 경고 {len(warns)}건 (치명적 아님)")
    for w in warns[:10]: print("  -", w)
    if len(warns)>10: print(f"  … 외 {len(warns)-10}건")
sys.exit(1 if errs else 0)
