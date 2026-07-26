#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""STEPBible TAGNT에서 신약 인터라이너 JSON을 생성한다."""
from __future__ import annotations
import argparse,json,re,sys,unicodedata
from pathlib import Path
from typing import Iterable
HERE=Path(__file__).resolve().parent; sys.path.insert(0,str(HERE))
from morph_ko_gk import load_table
REF=re.compile(r"^([1-3]?[A-Za-z]+)\.(\d+)\.(\d+)#(\d+)(?:=([NKO]+))?")
WORD=re.compile(r"^(\S+)\s*\(([^)]*)\)")
def discover_one(root,pattern):
 m=sorted(root.rglob(pattern))
 if not m: raise FileNotFoundError(f"{root} 아래에서 {pattern}을 찾지 못했습니다.")
 return m[0]
def discover_tagnt(root):
 m=sorted(root.rglob("TAGNT*.txt"))
 if not m: raise FileNotFoundError(f"{root} 아래에서 TAGNT*.txt를 찾지 못했습니다.")
 return m
def parse_tagnt(paths:Iterable[Path],book:str,chapter:int|None=None,text_filter:str|None="N"):
 rows=[]; seen=set()
 for path in paths:
  with path.open(encoding="utf-8-sig") as f:
   for line in f:
    mt=REF.match(line)
    if not mt: continue
    bk,ch,vs,wi,variant=mt.groups(); ch=int(ch); vs=int(vs); wi=int(wi); variant=variant or "NKO"
    if bk!=book or chapter is not None and ch!=chapter: continue
    if text_filter and text_filter not in variant: continue
    key=(bk,ch,vs,wi)
    if key in seen: continue
    seen.add(key); col=line.rstrip("\n").split("\t")
    if len(col)<5: continue
    wm=WORD.match(col[1].strip()); grk=wm.group(1) if wm else col[1].strip(); tr=wm.group(2) if wm else ""; en=col[2].strip()
    sm=re.match(r"(G\d+[A-Za-z]?)=(\S+)",col[3].strip()); strong=sm.group(1) if sm else ""; morph=sm.group(2) if sm else ""
    lemma=""; lgloss=""
    if "=" in col[4]: lemma,_,lgloss=col[4].strip().partition("=")
    rows.append({"chapter":ch,"verse":vs,"i":wi,"t":unicodedata.normalize("NFC",grk),"tr":tr,"m":[morph] if morph else [],"s":[strong] if strong else [],"lem":unicodedata.normalize("NFC",lemma),"en":en,"variant":variant,"lgloss":lgloss})
 return rows
def build_chapter(rows,book,chapter,text_label,include_variant=False):
 verses={}
 for r in rows:
  if r["chapter"]!=chapter: continue
  word={k:r[k] for k in ("i","t","tr","m","s","lem","en")}
  if include_variant: word["variant"]=r["variant"]
  verses.setdefault(r["verse"],[]).append(word)
 return {"book":book,"chapter":chapter,"lang":"grc","schema":2,"text":text_label,"src":"STEPBible TAGNT (CC BY 4.0)","v":[{"n":n,"w":verses[n]} for n in sorted(verses)]}
def main():
 p=argparse.ArgumentParser(); p.add_argument("--source-root",type=Path,default=Path("sources/STEPBible-Data")); p.add_argument("--book",required=True); p.add_argument("--slug",required=True); g=p.add_mutually_exclusive_group(required=True); g.add_argument("--chapter",type=int); g.add_argument("--all-chapters",action="store_true"); p.add_argument("--text",choices=("N","K","O","all"),default="N"); p.add_argument("--output-root",type=Path,default=Path("data/interlinear")); p.add_argument("--pretty",action="store_true"); p.add_argument("--verify-morphology",action="store_true"); a=p.parse_args()
 filt=None if a.text=="all" else a.text; label={"N":"NA28/SBL 계열 비평본문","K":"TR/Byz 계열","O":"기타 판본","all":"전체 이본"}[a.text]
 tagnt=discover_tagnt(a.source_root); table=load_table(discover_one(a.source_root,"TEGMC*.txt")); rows=parse_tagnt(tagnt,a.book,a.chapter,filt)
 if not rows: raise SystemExit("해당 책·장의 TAGNT 행이 없습니다.")
 unknown={c for r in rows for c in r["m"] if c not in table}
 if a.verify_morphology and unknown: raise SystemExit("TEGMC 미매핑: "+", ".join(sorted(unknown)))
 chapters=sorted({r["chapter"] for r in rows}) if a.all_chapters else [a.chapter]
 for ch in chapters:
  data=build_chapter(rows,a.book,int(ch),label,a.text=="all"); out=a.output_root/a.slug/f"{int(ch):02d}.json"; out.parent.mkdir(parents=True,exist_ok=True); out.write_text(json.dumps(data,ensure_ascii=False,indent=2 if a.pretty else None,separators=None if a.pretty else (",",":"))+"\n",encoding="utf-8"); print(f"{out}: {len(data['v'])}절 · {sum(len(v['w']) for v in data['v'])}낱말")
if __name__=="__main__": main()
