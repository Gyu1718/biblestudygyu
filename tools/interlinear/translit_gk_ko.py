# -*- coding: utf-8 -*-
"""TAGNT 그리스어 음역을 한글 음역으로 변환한다."""
import re,unicodedata
CHO="ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ"; JUNG="ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ"; JONG="_ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ"
DIGRAPH=("th","ph","ch","ps","ks","ng","gg","gk","rh")
ONSET={"b":"ㅂ","g":"ㄱ","d":"ㄷ","z":"ㅈ","th":"ㅌ","k":"ㅋ","l":"ㄹ","m":"ㅁ","n":"ㄴ","p":"ㅍ","r":"ㄹ","s":"ㅅ","t":"ㅌ","ph":"ㅍ","ch":"ㅋ","h":"ㅎ","c":"ㅋ","f":"ㅍ","v":"ㅂ","j":"ㅈ","ng":"ㅇ","gg":"ㄱ","gk":"ㄱ","rh":"ㄹ"}
CODA={"n":"ㄴ","m":"ㅁ","ng":"ㅇ"}
TAIL={"b":"브","g":"그","d":"드","z":"즈","th":"트","k":"크","l":"ㄹ","p":"프","r":"르","s":"스","t":"트","ph":"프","ch":"크","ps":"프스","ks":"크스","x":"크스","h":"","c":"크","f":"프","v":"브"}
DIPH={"eu":"ㅠ","ēu":"ㅠ","ou":"ㅜ","ai":"ㅏ","ei":"ㅔ","oi":"ㅗ","ui":"ㅟ","au":"ㅏ","yi":"ㅟ"}; DIPH_TAIL={"ai":"이","ei":"이","oi":"이","au":"우"}
MONO={"a":"ㅏ","e":"ㅔ","ē":"ㅔ","i":"ㅣ","o":"ㅗ","ō":"ㅗ","u":"ㅜ","y":"ㅟ","ȳ":"ㅟ"}; VOWELS="aeiouēōyȳ"
def _compose(c,v,j="_"): return chr(0xAC00+(CHO.index(c)*21+JUNG.index(v))*28+JONG.index(j))
def _tokenize(word):
 w=unicodedata.normalize("NFC",word.lower()); w=re.sub(r"[^a-zēōȳ]","",w); toks=[]; i=0
 while i<len(w):
  two=w[i:i+2]
  if two in DIPH: toks.append(("V",two)); i+=2; continue
  if two in DIGRAPH: toks.append(("C",two)); i+=2; continue
  c=w[i]; toks.append(("V",c) if c in VOWELS else ("C",c)); i+=1
 out=[]
 for t in toks:
  if out and t==out[-1] and t[0]=="C" and t[1] not in ("l",): continue
  out.append(t)
 return out
def _add_coda(out,jamo):
 for k in range(len(out)-1,-1,-1):
  if not out[k]: continue
  ch=out[k][-1]
  if 0xAC00<=ord(ch)<=0xD7A3 and (ord(ch)-0xAC00)%28==0: out[k]=out[k][:-1]+chr(ord(ch)+JONG.index(jamo))
  return
def to_hangul(translit):
 if not translit:return ""
 toks=_tokenize(translit)
 if not toks:return ""
 out=[]; i=0
 while i<len(toks):
  kind,val=toks[i]
  if kind=="C":
   if i+1<len(toks) and toks[i+1][0]=="V":
    vow=toks[i+1][1]
    if val=="x": _add_coda(out,"ㄱ"); val="s"
    elif val=="ng": _add_coda(out,"ㅇ"); val="g"
    elif val in ("l","rh") and out: _add_coda(out,"ㄹ")
    jung=DIPH.get(vow) or MONO.get(vow,"ㅡ"); jong="_"; skip=2
    if i+2<len(toks) and toks[i+2][0]=="C" and toks[i+2][1] in CODA and not (i+3<len(toks) and toks[i+3][0]=="V"): jong=CODA[toks[i+2][1]]; skip=3
    out.append(_compose(ONSET.get(val,"ㅇ"),jung,jong)); out.append(DIPH_TAIL.get(vow,"")); i+=skip
   else:
    t=TAIL.get(val,"")
    if t=="ㄹ":
     if out and out[-1] and 0xAC00<=ord(out[-1][-1])<=0xD7A3 and (ord(out[-1][-1])-0xAC00)%28==0: out[-1]=out[-1][:-1]+chr(ord(out[-1][-1])+JONG.index("ㄹ"))
     else: out.append("르")
    else: out.append(t)
    i+=1
  else:
   jung=DIPH.get(val) or MONO.get(val,"ㅡ"); jong="_"; skip=1
   if i+1<len(toks) and toks[i+1][0]=="C" and toks[i+1][1] in CODA and not (i+2<len(toks) and toks[i+2][0]=="V"): jong=CODA[toks[i+1][1]]; skip=2
   out.append(_compose("ㅇ",jung,jong)); out.append(DIPH_TAIL.get(val,"")); i+=skip
 return "".join(out)
