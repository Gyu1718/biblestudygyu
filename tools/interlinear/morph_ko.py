# -*- coding: utf-8 -*-
"""TEHMC 형태 코드 -> 한국어 문법 라벨."""
import re
FUNCTION={"Verb":"동사","Noun":"명사","Adjective":"형용사","Pronoun":"대명사","Particle":"불변화사","Preposition":"전치사","Conjunction":"접속사","Adverb":"부사","Suffix":"접미사"}
STEM={"Qal":"칼","Niphal":"니팔","Piel":"피엘","Pual":"푸알","Hiphil":"히필","Hophal":"호팔","Hithpael":"히트파엘","Hishtaphel":"히쉬타펠","Polal":"폴랄","Nithpael":"니트파엘","Tiphil":"티필","Shaphel":"샤펠","Peal":"페알","Peil":"페일","Pael":"파엘","Haphel":"하펠","Aphel":"아펠","Hitpeel":"히트페엘","Hitpaal":"히트파알","Hitpael":"히트파엘","Hothpaal":"호트파알","Ishtaphel":"이쉬타펠"}
FORM_VERB={"Perfect":"완료","Imperfect":"미완료","Consecutive Imperfect":"바브연속 미완료","Consecutive Perfect":"바브연속 완료","Conjunction+Imperfect":"접속사+미완료","Imperative":"명령","Infinitive":"부정사","Participle":"분사","Participle passive":"수동분사"}
FORM_OTHER={"Common":"보통","Proper":"고유","Gentilic":"족속명","Title":"칭호","Numerical":"수사","Numerical position":"서수","Personal":"인칭","Directional":"방향(-헤)","Paragogic Hé":"파라고그 헤","Paragogic Nun":"파라고그 눈","Definite article (Hebrew)":"관사","Definite article (Aramaic)":"관사","Conditional":"조건","Interrogative":"의문","Interjection":"감탄사","Demonstrative":"지시","Negative":"부정","Object indicator":"목적격 표지","Relative":"관계사","Definite":"한정","Consecutive":"연속"}
PERSON={"First":"1인칭","Second":"2인칭","Third":"3인칭"}; GENDER={"Masculine":"남성","Feminine":"여성","Either gender":"공성","Title":"칭호","Location":"지명"}; NUMBER={"Singular":"단수","Plural":"복수","Dual":"쌍수"}; STATE={"Absolute":"절대형","Construct":"연계형","Definite":"한정형"}; MOOD={"Jussive":"기원","Cohortative":"청유"}
def _F(key,s):
 m=re.search(key+r"=([^;]+)",s)
 if not m:return ""
 v=m.group(1); i=v.find("(hence")
 return (v[:i] if i>=0 else v).strip()
def _mood(s):
 m=re.search(r"Mood=([^;)]+)",s)
 if not m:return ""
 return MOOD.get(m.group(1).strip(),"")
def to_korean(expansion):
 fn=FUNCTION.get(_F("Function",expansion),""); stem=STEM.get(_F("Stem",expansion),""); form=_F("Form",expansion); per=PERSON.get(_F("Person",expansion),""); gen=GENDER.get(_F("Gender",expansion),""); num=NUMBER.get(_F("Number",expansion),""); st=STATE.get(_F("State",expansion),""); mood=_mood(expansion); png=" ".join(x for x in (per,gen,num) if x)
 if fn=="동사":
  if form in ("Participle","Participle passive"): return " · ".join(x for x in (f"동사 · {stem} {FORM_VERB[form]}".rstrip(),f"{gen} {num}".strip(),st) if x)
  if form=="Infinitive": return " · ".join(x for x in (f"동사 · {stem} 부정사",st) if x)
  fk=FORM_VERB.get(form,form)
  if mood=="기원" and fk=="미완료": fk="단축 미완료(기원)"
  elif mood=="청유" and fk=="미완료": fk="미완료(청유)"
  elif mood: fk=f"{fk}({mood})" if fk else mood
  return " · ".join(x for x in ("동사",stem,fk,png) if x)
 if fn=="명사":
  if form=="Proper": return " · ".join(x for x in ("고유명사",f"{gen} {num}".strip() or gen) if x)
  if form=="Gentilic": return " · ".join(x for x in ("족속명사",f"{gen} {num}".strip(),st) if x)
  return " · ".join(x for x in ("명사",f"{gen} {num}".strip(),st) if x)
 if fn=="형용사": return " · ".join(x for x in ({"Numerical":"기수","Numerical position":"서수","Gentilic":"족속형용사"}.get(form,"형용사"),f"{gen} {num}".strip(),st) if x)
 if fn=="대명사": return " · ".join(x for x in ({"Personal":"인칭대명사","Demonstrative":"지시대명사","Interrogative":"의문대명사","Relative":"관계대명사"}.get(form,"대명사"),png) if x)
 if fn=="접미사": return f"{png} 접미" if form=="Personal" and png else ("인칭 접미" if form=="Personal" else FORM_OTHER.get(form,form)+" 접미")
 if fn=="불변화사": return FORM_OTHER.get(form,form) or "불변화사"
 if fn=="접속사" and form=="Consecutive": return "바브연속 접속사"
 if fn=="전치사" and form=="Definite": return "전치사 + 관사"
 return " · ".join(x for x in (fn,FORM_OTHER.get(form,""),png,st) if x) or expansion
def load_table(path):
 table={}
 with open(path,encoding="utf-8-sig") as f:
  for line in f:
   if "\t" not in line: continue
   code,_,rest=line.partition("\t"); code=code.strip()
   if re.fullmatch(r"[HA][A-Za-z0-9]*",code) and "Function=" in rest: table[code]=to_korean(rest)
 return table
