# -*- coding: utf-8 -*-
"""STEPBible 음역을 한글 음역으로 변환한다."""
CHO="ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ"; JUNG="ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ"; JONG="_ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ"
ONSET={"'":"ㅇ","b":"ㅂ","v":"ㅂ","g":"ㄱ","d":"ㄷ","h":"ㅎ","z":"ㅈ","ch":"ㅎ","t":"ㅌ","k":"ㅋ","kh":"ㅋ","l":"ㄹ","m":"ㅁ","n":"ㄴ","s":"ㅅ","p":"ㅍ","f":"ㅍ","ts":"ㅊ","tz":"ㅊ","q":"ㅋ","r":"ㄹ","sh":"ㅅ","w":"ㅂ","y":"ㅇ","j":"ㅈ","c":"ㅋ"}
CODA={"m":"ㅁ","n":"ㄴ","l":"ㄹ","ng":"ㅇ","k":"ㄱ","kh":"ㄱ","q":"ㄱ"}
TAIL={"b":"브","v":"브","g":"그","d":"드","z":"즈","ch":"흐","t":"트","s":"스","p":"프","f":"프","ts":"츠","tz":"츠","r":"르","sh":"쉬","h":"","'":"","y":"이","w":"우","c":"크"}
VOWEL={"a":"ㅏ","e":"ㅔ","i":"ㅣ","o":"ㅗ","u":"ㅜ","ei":"ㅔ","ai":"ㅏ","ay":"ㅏ","au":"ㅗ","oi":"ㅚ","ou":"ㅗ"}; YVOWEL={"ㅏ":"ㅑ","ㅔ":"ㅖ","ㅗ":"ㅛ","ㅜ":"ㅠ","ㅣ":"ㅣ","ㅐ":"ㅒ"}; SHVOWEL={"ㅏ":"ㅑ","ㅔ":"ㅖ","ㅗ":"ㅛ","ㅜ":"ㅠ","ㅣ":"ㅟ"}; DIG=("ch","kh","sh","ts","tz","ng")
def _compose(c,v,j="_"): return chr(0xAC00+(CHO.index(c)*21+JUNG.index(v))*28+JONG.index(j))
def _split(syl):
 s=syl.lower(); i=0; onset=""
 if s[:2] in DIG: onset,i=s[:2],2
 elif s and s[0] in ONSET: onset,i=s[0],1
 vow=""
 while i<len(s) and s[i] in "aeiou": vow+=s[i]; i+=1
 return onset,vow,s[i:]
def syllable_to_hangul(syl):
 onset,vow,rest=_split(syl)
 if not vow: return "이" if onset=="y" else TAIL.get(onset,ONSET.get(onset,""))
 cho=ONSET.get(onset,"ㅇ"); jung=VOWEL.get(vow,VOWEL.get(vow[0],"ㅡ"))
 if onset=="y": cho,jung="ㅇ",YVOWEL.get(jung,jung)
 diph="이" if vow in ("ai","ay") else ""
 if onset=="sh": cho,jung="ㅅ",SHVOWEL.get(jung,jung)
 jong="_"
 if rest:
  c=rest[:2] if rest[:2] in DIG else rest[:1]
  if c in CODA and len(rest)==len(c): jong=CODA[c]; rest=""
 head=_compose(cho,jung,jong); tail=diph
 while rest:
  c=rest[:2] if rest[:2] in DIG else rest[:1]; rest=rest[len(c):]
  if not rest and c in CODA: head=_compose(cho,jung,CODA[c])
  else: tail+=TAIL.get(c,"")
 return head+tail
def to_hangul(translit):
 if not translit:return ""
 sylls=[x.strip().strip("-") for x in translit.strip().rstrip("-").replace("/",".").split(".") if x.strip().strip("-")]; out=[]
 for i,syl in enumerate(sylls):
  h=syllable_to_hangul(syl); o,v,r=_split(syl)
  if o=="l" and v and out and i>0:
   po,pv,pr=_split(sylls[i-1]); ch=out[-1][-1] if out[-1] else ""
   if pv and not pr and ch and 0xAC00<=ord(ch)<=0xD7A3 and (ord(ch)-0xAC00)%28==0: out[-1]=out[-1][:-1]+chr(ord(ch)+JONG.index("ㄹ"))
  out.append(h)
 return "".join(out)
