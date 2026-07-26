#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""STEPBible TAHOT에서 구약 인터라이너 JSON을 생성한다."""
from __future__ import annotations
import argparse,json,re,sys,unicodedata
from pathlib import Path
from typing import Iterable
HERE=Path(__file__).resolve().parent
sys.path.insert(0,str(HERE))
from morph_ko import load_table
REF=re.compile(r"^([1-3]?[A-Za-z]+)\.(\d+)\.(\d+)#(\d+)(?:=(\S+))?")
def discover_one(root,pattern):
 m=sorted(root.rglob(pattern))
 if not m: raise FileNotFoundError(f"{root} 아래에서 {pattern}을 찾지 못했습니다.")
 return m[0]
def discover_tahot(root):
 m=sorted(root.rglob("TAHOT*.txt"))
 if not m: raise FileNotFoundError(f"{root} 아래에서 TAHOT*.txt를 찾지 못했습니다.")
 return m
def parse_tahot(paths:Iterable[Path],book:str,chapter:int|None=None):
 rows=[]; seen=set()
 for path in paths:
  with path.open(encoding="utf-8-sig") as f:
   for line in f:
    mt=REF.match(line)
    if not mt: continue
    bk,ch,vs,wi,_=mt.groups(); ch=int(ch); vs=int(vs); wi=int(wi)
    if bk!=book or chapter is not None and ch!=chapter: continue
    key=(bk,ch,vs,wi)
    if key in seen: continue
    seen.add(key); col=line.rstrip("\n").split("\t")
    if len(col)<6: continue
    heb=col[1].split("\\")[0]; tr=col[2].strip(); en=col[3].strip(); strong_raw=col[4].split("\\")[0]; morph_raw=col[5]; gloss_raw=col[11] if len(col)>11 else ""
    morph=[x for x in morph_raw.split("/") if x]
    lang=morph[0][0] if morph and morph[0][0] in "HA" else "H"
    if morph: morph=[morph[0],*[lang+x for x in morph[1:]]]
    strong=re.findall(r"\{?(H\d+[A-Za-z]?)\}?",strong_raw); lemma=""; lm=re.search(r"\{H\d+[A-Za-z]?=([^=]+)=",gloss_raw)
    if lm: lemma=lm.group(1).split(",")[0].strip()
    rows.append({"chapter":ch,"verse":vs,"i":wi,"t":unicodedata.normalize("NFC",heb),"tr":tr,"m":morph,"s":strong,"lem":unicodedata.normalize("NFC",lemma),"en":en})
 return rows
def build_chapter(rows,book,chapter):
 verses={}
 for r in rows:
  if r["chapter"]!=chapter: continue
  verses.setdefault(r["verse"],[]).append({k:r[k] for k in ("i","t","tr","m","s","lem","en")})
 return {"book":book,"chapter":chapter,"lang":"hbo","schema":2,"src":"STEPBible TAHOT (CC BY 4.0)","v":[{"n":n,"w":verses[n]} for n in sorted(verses)]}
def main():
 p=argparse.ArgumentParser(); p.add_argument("--source-root",type=Path,default=Path("sources/STEPBible-Data")); p.add_argument("--book",required=True); p.add_argument("--slug",required=True); g=p.add_mutually_exclusive_group(required=True); g.add_argument("--chapter",type=int); g.add_argument("--all-chapters",action="store_true"); p.add_argument("--output-root",type=Path,default=Path("data/interlinear")); p.add_argument("--pretty",action="store_true"); p.add_argument("--verify-morphology",action="store_true"); a=p.parse_args()
 tahot=discover_tahot(a.source_root); table=load_table(discover_one(a.source_root,"TEHMC*.txt")); rows=parse_tahot(tahot,a.book,a.chapter)
 if not rows: raise SystemExit("해당 책·장의 TAHOT 행이 없습니다.")
 unknown={c for r in rows for c in r["m"] if c not in table}
 if a.verify_morphology and unknown: raise SystemExit("TEHMC 미매핑: "+", ".join(sorted(unknown)))
 chapters=sorted({r["chapter"] for r in rows}) if a.all_chapters else [a.chapter]
 for ch in chapters:
  data=build_chapter(rows,a.book,int(ch)); out=a.output_root/a.slug/f"{int(ch):02d}.json"; out.parent.mkdir(parents=True,exist_ok=True); out.write_text(json.dumps(data,ensure_ascii=False,indent=2 if a.pretty else None,separators=None if a.pretty else (",",":"))+"\n",encoding="utf-8"); print(f"{out}: {len(data['v'])}절 · {sum(len(v['w']) for v in data['v'])}낱말")
if __name__=="__main__": main()
