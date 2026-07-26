#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""인터라이너 JSON을 성서 연구 서고용 원어 연구 HTML로 렌더링한다."""
from __future__ import annotations
import argparse,html,json,os,sys
from pathlib import Path
HERE=Path(__file__).resolve().parent; sys.path.insert(0,str(HERE))
from morph_ko import load_table
from translit_ko import to_hangul

def one(root,pattern):
 m=sorted(root.rglob(pattern))
 if not m: raise FileNotFoundError(f"{pattern}을 찾지 못했습니다.")
 return m[0]
def rel(out,root,target): return Path(os.path.relpath(root/target,out.parent)).as_posix()
def load_gloss(path): return json.loads(path.read_text(encoding="utf-8")) if path else {}
def meaning(word,gloss):
 for s in word.get("s",[]):
  v=gloss.get(s)
  if isinstance(v,str): return v,False
  if isinstance(v,dict) and (v.get("ko") or v.get("gloss")): return v.get("ko") or v.get("gloss"),bool(v.get("draft"))
 return word.get("en",""),True
def render(data,out,repo,slug,title,source,gloss_path=None):
 table=load_table(one(source,"TEHMC*.txt")); gloss=load_gloss(gloss_path); ch=int(data["chapter"]); assets=rel(out,repo,"assets"); shelf=rel(out,repo,f"ot/{slug}/index.html"); reader=rel(out,repo,"bible/original.html"); home=rel(out,repo,"index.html"); sections=[]
 for verse in data["v"]:
  cards=[]
  for w in verse["w"]:
   gram=" + ".join(table.get(c,c) for c in w.get("m",[])); text,draft=meaning(w,gloss); strong=" · ".join(w.get("s",[])) or "—"; lemma=w.get("lem") or "—"
   cards.append(f'<article class="il-word"><div class="il-original" dir="rtl">{html.escape(w.get("t",""))}</div><div class="il-ko">{html.escape(to_hangul(w.get("tr","")))}</div><div class="il-translit">{html.escape(w.get("tr",""))}</div><dl><dt>표제어</dt><dd dir="rtl">{html.escape(lemma)}</dd><dt>뜻</dt><dd class="il-gloss{" draft" if draft else ""}">{html.escape(str(text))}</dd><dt>문법</dt><dd>{html.escape(gram or "—")}</dd><dt>Strong</dt><dd>{html.escape(strong)}</dd></dl></article>')
  sections.append(f'<section class="il-verse" id="v{verse["n"]}"><h2>{ch}:{verse["n"]}</h2><div class="il-words">{"".join(cards)}</div></section>')
 return f'''<!DOCTYPE html><html lang="ko" data-theme="auto"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{html.escape(title)} {ch}장 원어 연구 — 성서 연구 서고</title><link rel="stylesheet" href="{assets}/theme.css"><link rel="stylesheet" href="{assets}/app.css"><link rel="stylesheet" href="{assets}/css/bible-reader.css" data-bible-reader-css><link rel="stylesheet" href="{assets}/css/interlinear.css"></head><body class="interlinear-page" data-book="{html.escape(slug)}" data-chapter="{ch}" data-kind="parsing" data-root="{rel(out,repo,'.')}" data-script="heb"><header class="il-header"><div><p class="il-eyebrow">ORIGINAL LANGUAGE STUDY</p><h1>{html.escape(title)} {ch}장 원어 연구</h1><p>원어 · 한글 음역 · 표제어 · 형태론 · Strong 번호</p></div><nav><a href="{shelf}">← {html.escape(title)} 서가</a><a href="{reader}?book={html.escape(data['book'].upper())}&amp;chapter={ch}">성경읽기</a><a href="{home}">서고 홈</a></nav></header><main>{''.join(sections)}</main><footer class="il-footer">원어 데이터: STEPBible.org (CC BY 4.0), 원자료 Tyndale House Cambridge. 형태 분석 TAHOT/TEHMC.</footer><script src="{assets}/app.js"></script><script src="{assets}/js/bible-reader.js" defer data-bible-reader-js></script></body></html>'''
def main():
 p=argparse.ArgumentParser(); p.add_argument("--input",type=Path,required=True); p.add_argument("--output",type=Path,required=True); p.add_argument("--repo-root",type=Path,default=Path(".")); p.add_argument("--source-root",type=Path,default=Path("sources/STEPBible-Data")); p.add_argument("--book-slug",required=True); p.add_argument("--book-title",required=True); p.add_argument("--gloss",type=Path); a=p.parse_args(); data=json.loads(a.input.read_text(encoding="utf-8")); a.output.parent.mkdir(parents=True,exist_ok=True); a.output.write_text(render(data,a.output,a.repo_root.resolve(),a.book_slug,a.book_title,a.source_root,a.gloss),encoding="utf-8"); print(a.output)
if __name__=="__main__": main()
