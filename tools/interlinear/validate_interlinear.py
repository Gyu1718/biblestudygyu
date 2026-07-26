#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""인터라이너 JSON과 생성 HTML의 기본 무결성을 검사한다."""
import argparse,json,re
from pathlib import Path
TOP={"book","chapter","lang","schema","src","v"}; WORD={"i","t","tr","m","s","lem","en"}
def validate_json(path):
 e=[]
 try:d=json.loads(path.read_text(encoding="utf-8"))
 except Exception as x:return [f"JSON 파싱 실패: {x}"]
 if TOP-set(d):e.append("최상위 필드 누락: "+", ".join(sorted(TOP-set(d))))
 if d.get("schema")!=2:e.append(f"schema는 2여야 합니다: {d.get('schema')}")
 if "CC BY 4.0" not in str(d.get("src","")):e.append("CC BY 4.0 출처 누락")
 last=0; count=0
 for v in d.get("v",[]):
  n=v.get("n");
  if not isinstance(n,int) or n<=last:e.append(f"절 번호 순서 오류: {n}")
  if isinstance(n,int):last=n
  seen=set()
  for w in v.get("w",[]):
   count+=1; miss=WORD-set(w)
   if miss:e.append(f"{n}절 필드 누락: {sorted(miss)}")
   i=w.get("i")
   if i in seen:e.append(f"{n}절 낱말 번호 중복: {i}")
   seen.add(i)
   if not isinstance(w.get("m"),list) or not isinstance(w.get("s"),list):e.append(f"{n}절 {i}번 m/s 배열 오류")
 if not count:e.append("낱말이 없습니다.")
 return e
def validate_html(path):
 t=path.read_text(encoding="utf-8"); e=[]
 for s in ("interlinear-page","STEPBible.org","CC BY 4.0","assets/css/interlinear.css"):
  if s not in t:e.append(f"HTML 필수 문자열 누락: {s}")
 ids=re.findall(r'\bid="([^"]+)"',t)
 if len(ids)!=len(set(ids)):e.append("HTML id 중복")
 return e
def main():
 p=argparse.ArgumentParser(); p.add_argument("paths",nargs="+",type=Path); a=p.parse_args(); fail=False
 for path in a.paths:
  errors=validate_html(path) if path.suffix.lower()==".html" else validate_json(path)
  print(("FAIL " if errors else "OK   ")+str(path))
  for x in errors:print("-",x)
  fail|=bool(errors)
 raise SystemExit(1 if fail else 0)
if __name__=="__main__":main()
