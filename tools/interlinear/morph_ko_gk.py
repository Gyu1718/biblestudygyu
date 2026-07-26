# -*- coding: utf-8 -*-
"""TEGMC 그리스어 형태 코드 -> 한국어 문법 라벨."""
import re

FUNCTION={
 "Verb":"동사","Noun":"명사","Adjective":"형용사","Adverb":"부사","Conjunction":"접속사","Preposition":"전치사","Definite article":"관사",
 "Personal pronoun":"인칭대명사","Possessive pronoun":"소유대명사","Reflexive pronoun":"재귀대명사","Demonstrative pronoun":"지시대명사",
 "Relative pronoun":"관계대명사","Interrogative pronoun":"의문대명사","Indefinite pronoun":"부정대명사","Correlative pronoun":"상관대명사",
 "Reciprocal pronoun":"상호대명사","Correlative or Interrogative pronoun":"상관·의문대명사","Demonstrative pronoun+Conjunction":"지시대명사+접속사",
 "Negative Particle":"부정 불변화사","Interrogative Particle":"의문 불변화사","Particle or Disjunctive":"불변화사·이접사","Interjection":"감탄사",
 "Indeclinable Proper Noun":"무변화 고유명사","Indeclinable Noun of Other type":"무변화 명사","Aramaic transliterated word":"아람어 음역어",
 "Adverb or adverb and particle combined":"부사(불변화사 결합)",
}
CASE={"Nominative":"주격","Genitive":"속격","Dative":"여격","Accusative":"대격","Vocative":"호격"}
NUMBER={"Singular":"단수","Plural":"복수"}; GENDER={"Masculine":"남성","Feminine":"여성","Neuter":"중성"}
PERSON={"1st":"1인칭","2nd":"2인칭","3rd":"3인칭","1st Person":"1인칭","2nd Person":"2인칭","2nd Singular":"2인칭 단수","2nd Plural":"2인칭 복수"}
TENSE={"Present":"현재","Imperfect":"미완료","Future":"미래","Aorist":"부정과거","Perfect":"완료","Pluperfect":"과거완료","2nd Aorist":"제2부정과거","2nd Perfect":"제2완료","2nd Pluperfect":"제2과거완료","2nd Future":"제2미래","2nd Present":"제2현재","indefinite tense":"시제 불명"}
VOICE={"Active":"능동","Passive":"수동","Middle":"중간","Middle Deponent":"중간 이태","Passive Deponent":"수동 이태","Middle or Passive Deponent":"중·수동 이태","Middle or Passive":"중·수동","indefinite voice":"태 불명","impersonal active":"비인칭 능동"}
MOOD={"Indicative":"직설법","Subjunctive":"가정법","Imperative":"명령법","Optative":"희구법"}; FORM={"Participle":"분사","Infinitive":"부정사"}
NAMET={"Individual":"인명","Location":"지명","Title":"칭호","Gentilic":"족속","Location Gentilic":"지명 족속","Person Gentilic":"인명 족속","Title Gentilic":"칭호 족속","Individual Gentilic":"인명 족속","Type":"유형"}
EXTRA={"Comparative":"비교급","Superlative":"최상급","Numeral":"수사","Negative":"부정","Contracted form":"축약형","Attic Greek form":"아티카형","Interrogative":"의문","Transitive":"타동","Abbreviated":"축약","Apocopated form":"어미탈락형","Aeolic":"아이올리스형","IRRegular or impure form":"불규칙형","Indeclinable Letter":"무변화 문자","Abbreviated Numeral":"축약 수사"}

def _f(key,s):
 m=re.search(re.escape(key)+r"=([^;]*)",s); return m.group(1).strip() if m else ""
def _all(key,s): return [x.strip() for x in re.findall(re.escape(key)+r"=([^;]*)",s) if x.strip()]
def to_korean(exp):
 fn=FUNCTION.get(_f("Function",exp),""); case=CASE.get(_f("Case",exp),""); num=NUMBER.get(_f("Number",exp),""); gen=GENDER.get(_f("Gender",exp),""); per=PERSON.get(_f("Person",exp),""); tense=TENSE.get(_f("Tense",exp),""); voice=VOICE.get(_f("Voice",exp),""); mood=MOOD.get(_f("Mood",exp),""); form=FORM.get(_f("Form",exp),""); ntype=NAMET.get(_f("Name type",exp),""); extras=list(dict.fromkeys(EXTRA[x] for x in _all("Extra",exp) if x in EXTRA))
 if fn=="동사":
  core=" ".join(x for x in (tense,voice,mood or form) if x); parts=["동사",core]
  if form=="분사": parts += [f"{gen} {num}".strip(),case]
  elif form!="부정사": parts.append(f"{per} {num}".strip())
 else:
  head=fn or "낱말"; head=f"{head}({ntype})" if ntype and fn else (ntype or head); parts=[head,per,f"{gen} {num}".strip() or num,case]
 if extras: parts.append("·".join(extras))
 return " · ".join(x for x in parts if x)
def load_table(path):
 table={}
 with open(path,encoding="utf-8-sig") as f:
  for line in f:
   if "\t" not in line: continue
   code,_,rest=line.partition("\t"); code=code.strip()
   if re.fullmatch(r"[A-Z][A-Z0-9-]*",code) and "Function=" in rest: table[code]=to_korean(rest)
 return table
