#!/usr/bin/env python3
from __future__ import annotations
import argparse, gzip, html, json, os, re, subprocess, sys, unicodedata
from collections import defaultdict
from pathlib import Path

BUCKET_SIZE = 250
GREEK_RE = re.compile(r'[\u0370-\u03ff\u1f00-\u1fff]+(?:[᾽’\']?[\u0370-\u03ff\u1f00-\u1fff]+)*')
HEBREW_RE = re.compile(r'[\u0590-\u05ff]+(?:[־\u05be]?[\u0590-\u05ff]+)*')

POS_MAP = {
    'V':'동사','N':'명사','A':'형용사','Adv':'부사','Art':'관사','Conj':'접속사','Prep':'전치사',
    'P':'대명사','PerP':'인칭대명사','RelP':'관계대명사','Part':'불변화사','Intj':'감탄사',
    'T':'관사','C':'접속사','R':'전치사','D':'부사','I':'감탄사'
}

def norm_space(s:str)->str:
    return re.sub(r'[ \t\u00a0]+',' ',s).strip()

def normalize_greek(s:str)->str:
    s=unicodedata.normalize('NFD', s.lower())
    s=''.join(ch for ch in s if unicodedata.category(ch)!='Mn')
    s=s.replace('ς','σ')
    return ''.join(ch for ch in s if ('α'<=ch<='ω') or ch=='σ')

def normalize_hebrew(s:str)->str:
    s=unicodedata.normalize('NFD',s)
    return ''.join(ch for ch in s if '\u05d0'<=ch<='\u05ea')

def clean_step_html(s:str)->str:
    if not s: return ''
    s=re.sub(r"<ref='[^']*'>",'',s)
    s=s.replace('</ref>','')
    s=re.sub(r'<br\s*/?>','\n',s,flags=re.I)
    s=re.sub(r'</?b>','',s,flags=re.I)
    s=re.sub(r'<[^>]+>','',s)
    return norm_space(html.unescape(s).replace('\n',' '))

def pos_label(code:str)->str:
    if not code: return ''
    # G:V, H:N-M, N:N-M-P
    tail=code.split(':',1)[-1]
    typ=tail.split('-',1)[0]
    if code.startswith('N:'): return '고유명사'
    return POS_MAP.get(typ, typ)

def find_step_files(step_root:Path):
    tbesg=next(step_root.rglob('TBESG*CC BY.txt'))
    tbesh=next(p for p in step_root.rglob('TBESH*CC BY.txt') if 'Older Formats' not in str(p))
    return tbesg,tbesh

def load_step(step_root:Path):
    tbesg,tbesh=find_step_files(step_root)
    greek={}; hebrew={}
    with tbesg.open(encoding='utf-8-sig',errors='replace') as f:
        for line in f:
            if not re.match(r'^G\d',line): continue
            c=line.rstrip('\n').split('\t')
            if len(c)<8: continue
            m=re.match(r'^G0*(\d+)([A-Z]*)$',c[0])
            if not m: continue
            n=int(m.group(1))
            if not (1<=n<=5624): continue
            key=f'G{n}'
            item={'extendedId':c[0],'lemma':c[3],'transliteration':c[4],'morph':c[5],
                  'pos':pos_label(c[5]),'glossEn':clean_step_html(c[6]),'definitionEn':clean_step_html(c[7]),
                  'source':'STEP TBESG (CC BY 4.0)'}
            # unsuffixed canonical first, otherwise retain first
            if key not in greek or c[0]==f'G{n:04d}': greek[key]=item
    with tbesh.open(encoding='utf-8-sig',errors='replace') as f:
        for line in f:
            if not re.match(r'^H\d',line): continue
            c=line.rstrip('\n').split('\t')
            if len(c)<8: continue
            m=re.match(r'^H0*(\d+)([A-Za-z]*)$',c[0])
            if not m: continue
            n=int(m.group(1))
            if not (1<=n<=8674): continue
            key=f'H{n}'
            item={'extendedId':c[0],'lemma':c[3],'transliteration':c[4],'morph':c[5],
                  'pos':pos_label(c[5]),'glossEn':clean_step_html(c[6]),'definitionEn':clean_step_html(c[7]),
                  'source':'STEP TBESH (CC BY 4.0)'}
            suffix=m.group(2).lower()
            priority = 2 if suffix=='' else (1 if suffix=='a' else 0)
            if key not in hebrew or priority > hebrew[key].get('_priority',-1):
                item['_priority']=priority
                hebrew[key]=item
    for d in (greek,hebrew):
        for v in d.values(): v.pop('_priority',None)
    return greek,hebrew

def pdf_range(path:Path):
    m=re.search(r'(?:no\.)?\s*0*(\d{1,4})\s*[~\-]\s*0*(\d{1,4})',path.name,re.I)
    return (int(m.group(1)),int(m.group(2))) if m else None

def primary_pdfs(root:Path, lang:str):
    groups={}
    maxn=5624 if lang=='greek' else 8674
    for p in root.rglob('*.pdf'):
        rng=pdf_range(p)
        if not rng or rng==(1,maxn): continue
        a,b=rng
        if not (1<=a<=b<=maxn): continue
        score=0
        name=p.name
        if '충돌' in name or 'DESKTOP' in name: score-=20
        score+=p.stat().st_size/1e7
        if rng not in groups or score>groups[rng][0]: groups[rng]=(score,p)
    return [groups[k][1] for k in sorted(groups)]

def extract_pdf(path:Path, cache:Path):
    cache.mkdir(parents=True,exist_ok=True)
    out=cache/(re.sub(r'[^A-Za-z0-9_.-]+','_',path.stem)+'.txt')
    if not out.exists() or out.stat().st_mtime<path.stat().st_mtime:
        subprocess.run(['pdftotext','-layout',str(path),str(out)],check=True)
    return out.read_text(encoding='utf-8',errors='replace')

def clean_page(page:str,lang:str):
    lines=[]
    for line in page.splitlines():
        st=line.strip()
        if not st: lines.append(''); continue
        if 'Print to PDF without this message' in st or 'novaPDF' in st: continue
        if re.fullmatch(r'-?\s*\d+\s*-?',st): continue
        if st.startswith('https://www.dropbox.com/'): continue
        if ('스트롱사전' in st or 'Strong' in st) and ('no.' in st.lower() or '최종수정' in st or '전체 No.' in st):
            # retain genuine occurrence lines
            if not st.startswith('*Strong'): continue
        lines.append(line.rstrip())
    # collapse >2 blank lines
    text='\n'.join(lines)
    text=re.sub(r'\n{3,}','\n\n',text)
    return text.strip()

def plausible_entry_rest(rest:str, lang:str)->bool:
    r=rest.strip()
    if not r or re.match(r'^[\d:;,.()\[\]{}*—–-]',r): return False
    if re.match(r'^[Oo]\s*\.?\s*[Cc][Cc]\.?',r): return False
    head=r[:140]
    if '.Occ' in head or 'Occurrence' in head: return False
    if lang=='greek':
        return bool(GREEK_RE.search(head) or (re.search(r'[가-힣]',head) and '(' in head))
    return bool(HEBREW_RE.search(head) or 'Original Word:' in head or re.search(r'[가-힣]{2,}',head[:60]))

def segment_pdf(path:Path,lang:str,cache:Path):
    rng=pdf_range(path); assert rng
    start,end=rng
    text=extract_pdf(path,cache)
    pages=text.split('\f')
    cleaned=[clean_page(p,lang) for p in pages]
    joined='\n\f\n'.join(cleaned)
    offsets=[]; cur=0
    for p in cleaned:
        offsets.append(cur); cur+=len(p)+3
    starts=[]
    # Some source entries have no whitespace after the number (eg 1138Dabid/Δαυίδ).
    linepat=re.compile(r'^\s*(\d{1,4})\s*(\S.*)$',re.M)
    for pno,page in enumerate(cleaned,1):
        for m in linepat.finditer(page):
            n=int(m.group(1)); rest=m.group(2)
            if start<=n<=end and plausible_entry_rest(rest,lang):
                starts.append((offsets[pno-1]+m.start(),pno,n))
    # Ignore alphabet/introduction material before the first entry in this range.
    start_candidates=[x for x in starts if x[2]==start]
    if not start_candidates: return []
    begin=min(x[0] for x in start_candidates)
    # Pick the first plausible occurrence for every number after the range start.
    bynum={}
    for pos,pno,n in sorted(starts):
        if pos<begin: continue
        bynum.setdefault(n,(pos,pno,n))
    accepted=sorted(bynum.values())
    entries=[]
    for i,(pos,pno,n) in enumerate(accepted):
        stop=accepted[i+1][0] if i+1<len(accepted) else len(joined)
        raw=joined[pos:stop].replace('\n\f\n','\n').strip()
        raw=re.sub(r'\n{3,}','\n\n',raw)
        entries.append({'number':n,'raw':raw,'page':pno,'sourceFile':path.name})
    return entries

def extract_fields(entry,lang,step):
    n=entry['number']; id_=('G' if lang=='greek' else 'H')+str(n)
    raw=entry['raw']
    script_re=GREEK_RE if lang=='greek' else HEBREW_RE
    firstline=raw.split('\n',1)[0]
    lm=script_re.search(firstline) or script_re.search(raw[:1000])
    lemma=lm.group(0) if lm else ''
    supplement=step.get(id_,{})
    if not lemma or (lang=='hebrew' and len(normalize_hebrew(lemma))<1): lemma=supplement.get('lemma','')
    # Prefer supplement lemma when PDF extraction is evidently broken or entry 1 Greek heading uses A first.
    if supplement.get('lemma') and (not lemma or len(lemma)>80): lemma=supplement['lemma']
    translit=supplement.get('transliteration','')
    pronunciation=''
    if lm:
        tail=firstline[lm.end():]
        pm=re.match(r'\s*[,，]?[\s]*(?:ὁ|ἡ|τό|τὸ|οἱ|αἱ|τὰ|ες|ης|ου|ος|ον|α|η|ν|ῶν|[\u0370-\u03ff\u1f00-\u1fff, ]+)?\s*([가-힣][가-힣ㅎ퐈/~·\- ]{0,40})\s*\(',tail)
        if pm: pronunciation=norm_space(pm.group(1))
        else:
            km=re.search(r'([가-힣][가-힣ㅎ퐈/~·\- ]{0,30})\s*(?:Original Word:|\()',tail)
            if km: pronunciation=norm_space(km.group(1))
    occ=None
    om=re.search(rf"Strong's\s+{'Greek' if lang=='greek' else 'Hebrew'}\s+0*{n}\s*-\s*([\d,]+)\s+Occurrence",raw,re.I)
    if om:
        try: occ=int(om.group(1).replace(',',''))
        except: pass
    pos=supplement.get('pos','')
    if not pos:
        head=raw[:1600]
        for ko in ['고유명사','남성명사','여성명사','중성명사','동사','형용사','부사','전치사','접속사','대명사','관사','불변화사','감탄사','명사']:
            if ko in head: pos='명사' if ko.endswith('명사') and ko!='고유명사' else ko; break
    # Korean summary: header before occurrence/form inventory, retain source wording.
    summary=raw
    cut=len(summary)
    for marker in ["*Strong's Greek", "*Strong's Hebrew", '\n*Strong', '\n----------------------------------------------------------------']:
        x=summary.find(marker)
        if x>=0: cut=min(cut,x)
    summary=norm_space(summary[:cut])
    summary=re.sub(r'^\s*\d{1,4}\s+','',summary)
    if len(summary)>900: summary=summary[:897].rstrip()+'…'
    # forms for Greek surface matching, using occurrence inventory after Strong line
    forms=[]
    if lang=='greek':
        tail=raw[raw.find("*Strong's Greek"):] if "*Strong's Greek" in raw else ''
        for gm in GREEK_RE.finditer(tail):
            word=gm.group(0)
            key=normalize_greek(word)
            if len(key)>=1 and word not in forms: forms.append(word)
        if lemma and lemma not in forms: forms.insert(0,lemma)
    item={
        'id':id_,'language':lang,'number':n,'lemma':lemma,
        'lemmaNormalized':normalize_greek(lemma) if lang=='greek' else normalize_hebrew(lemma),
        'transliteration':translit,'pronunciationKo':pronunciation,'partOfSpeech':pos,
        'summaryKo':summary,'occurrences':occ,'rawKo':raw,
        'source':{'primary':'사용자 제공 한글 스트롱 사전','file':entry['sourceFile'],'page':entry['page']},
        'supplement':supplement or None,
        'forms':forms if lang=='greek' else None,
        'review':{'extracted':True,'needsReview':False}
    }
    if not lemma or not summary: item['review']['needsReview']=True
    return item

def write_gz(path:Path,obj):
    path.parent.mkdir(parents=True,exist_ok=True)
    data=json.dumps(obj,ensure_ascii=False,separators=(',',':')).encode('utf-8')
    with path.open('wb') as raw:
        with gzip.GzipFile(filename='',mode='wb',fileobj=raw,mtime=0,compresslevel=9) as f: f.write(data)

def build(args):
    out=Path(args.out); out.mkdir(parents=True,exist_ok=True)
    step_g,step_h=load_step(Path(args.step))
    all_items={}; reports={}
    for lang,root,step,maxn in [('greek',Path(args.greek),step_g,5624),('hebrew',Path(args.hebrew),step_h,8674)]:
        pdfs=primary_pdfs(root,lang)
        expected_ranges=24 if lang=='greek' else 22
        if len(pdfs)!=expected_ranges:
            print(f'WARNING {lang}: {len(pdfs)} primary PDFs (expected {expected_ranges})',file=sys.stderr)
        segmented=[]
        for i,p in enumerate(pdfs,1):
            print(f'[{lang} {i}/{len(pdfs)}] {p.name}',flush=True)
            segmented.extend(segment_pdf(p,lang,Path(args.cache)/lang))
        # dedupe by number, retaining first
        bynum={}
        for e in segmented: bynum.setdefault(e['number'],e)
        items=[extract_fields(bynum[n],lang,step) for n in sorted(bynum)]
        # STEP is a fallback only: create records when the Korean PDF item could not be extracted.
        for key,sup in step.items():
            n=int(key[1:])
            if n in bynum or not (1<=n<=maxn): continue
            items.append({
                'id':key,'language':lang,'number':n,'lemma':sup.get('lemma',''),
                'lemmaNormalized':normalize_greek(sup.get('lemma','')) if lang=='greek' else normalize_hebrew(sup.get('lemma','')),
                'transliteration':sup.get('transliteration',''),'pronunciationKo':'','partOfSpeech':sup.get('pos',''),
                'summaryKo':'','occurrences':None,'rawKo':'',
                'source':{'primary':None,'file':None,'page':None},'supplement':sup,
                'forms':[sup.get('lemma','')] if lang=='greek' and sup.get('lemma') else None,
                'review':{'extracted':False,'needsReview':True}
            })
        items.sort(key=lambda x:x['number'])
        for item in items: all_items[item['id']]=item
        missing=[n for n in range(1,maxn+1) if n not in bynum and (('G' if lang=='greek' else 'H')+str(n)) not in step]
        reports[lang]={'pdfs':len(pdfs),'entries':len(items),'missingNumbers':missing,'needsReview':sum(i['review']['needsReview'] for i in items)}
        # buckets
        buckets=defaultdict(dict)
        prefix='g' if lang=='greek' else 'h'
        for item in items:
            b=((item['number']-1)//BUCKET_SIZE)*BUCKET_SIZE+1
            e=min(b+BUCKET_SIZE-1,maxn)
            bucket_name=f'{prefix}{b:04d}-{e:04d}.json.gz'
            buckets[bucket_name][item['id']]=item
        for name,data in buckets.items(): write_gz(out/lang/name,data)
    # search index
    idx=[]
    for id_,x in sorted(all_items.items(),key=lambda kv:(kv[1]['language'],kv[1]['number'])):
        sup=x.get('supplement') or {}
        idx.append({'id':id_,'language':x['language'],'number':x['number'],'lemma':x['lemma'],
                    'lemmaNormalized':x['lemmaNormalized'],'transliteration':x['transliteration'],
                    'pronunciationKo':x['pronunciationKo'],'partOfSpeech':x['partOfSpeech'],
                    'summaryKo':x['summaryKo'][:420], 'glossEn':sup.get('glossEn',''),'occurrences':x['occurrences']})
    write_gz(out/'index.json.gz',idx)
    # Greek reverse form index, unique and ambiguous mappings retained
    fm=defaultdict(set)
    for x in all_items.values():
        if x['language']!='greek': continue
        for form in x.get('forms') or []:
            k=normalize_greek(form)
            if k: fm[k].add(x['id'])
    forms={k:(next(iter(v)) if len(v)==1 else sorted(v,key=lambda s:int(s[1:]))) for k,v in fm.items()}
    write_gz(out/'forms'/'greek.json.gz',forms)
    manifest={'version':'2026-07-24','bucketSize':BUCKET_SIZE,'counts':{'greek':reports['greek']['entries'],'hebrew':reports['hebrew']['entries']},
              'max':{'greek':5624,'hebrew':8674},'searchIndex':'index.json.gz','greekForms':'forms/greek.json.gz',
              'sourcePolicy':'한글 스트롱 사전을 주자료로 보존하고 STEP TBESG/TBESH는 누락 필드 보충에만 사용'}
    (out/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
    (out/'build-report.json').write_text(json.dumps(reports,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(reports,ensure_ascii=False,indent=2))

if __name__=='__main__':
    ap=argparse.ArgumentParser()
    ap.add_argument('--greek',required=True); ap.add_argument('--hebrew',required=True); ap.add_argument('--step',required=True)
    ap.add_argument('--out',required=True); ap.add_argument('--cache',default='.lexicon-cache')
    build(ap.parse_args())
