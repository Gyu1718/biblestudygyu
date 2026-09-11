import re,json,sys,os
krv=json.load(open('/home/claude/src/krv_mrk.json'))['chapters'] if os.path.exists('/home/claude/src/krv_mrk.json') else None
files=[f'nt/mark/{n}' for n in sorted(os.listdir('nt/mark')) if n.endswith('.html')]
VOID={'meta','link','br','img','input','hr','source','col','area','base','wbr'}
fail=0
for path in files:
    h=open(path,encoding='utf-8').read()
    stack=[];errs=[]
    for m in re.finditer(r'<(/?)([a-zA-Z][a-zA-Z0-9]*)([^>]*?)(/?)>',h):
        close,tag,selfc=m.group(1),m.group(2).lower(),m.group(4)
        if tag in VOID or selfc or tag=='!doctype': continue
        if close:
            if stack and stack[-1]==tag: stack.pop()
            else: errs.append(tag)
        else: stack.append(tag)
    ids=set(re.findall(r'\bid="([^"]+)"',h))
    anch=[a for a in re.findall(r'href="#([^"]+)"',h) if a not in ids]
    tmis=[]
    for t in re.finditer(r'<table>(.*?)</table>',h,re.S):
        b=t.group(1); ths=len(re.findall(r'<th[ >]',b.split('</thead>')[0]))
        cs={len(re.findall(r'<td[ >]',r)) for r in re.findall(r'<tr>(.*?)</tr>',b.split('</thead>')[-1],re.S) if '<td' in r}
        if cs and {ths}!=cs: tmis.append((ths,cs))
    spaced=re.findall(r'</\w+\s+>',h)
    links=[l for l in set(re.findall(r'href="((?!http|data:|#|\.\./|mailto)[^"]+)"',h)) if not os.path.exists('nt/mark/'+l)]
    krvbad=0
    if krv:
        for a,b,txt in re.findall(r'<div class="krv"[^>]*><b>(\d+):(\d+)(?:[–-]\d+)?</b>',h) and []: pass
        for m in re.finditer(r'<div class="krv"[^>]*><b>(\d+):(\d+)(?:[–-](\d+))?</b>(.*?)</div>',h,re.S):
            ch,a,b,txt=m.group(1),int(m.group(2)),m.group(3),m.group(4)
            b=int(b) if b else a
            parts=[p.strip() for p in re.sub(r'<[^>]+>','',txt).split('/')]
            exp=[krv[ch][str(v)] for v in range(a,b+1)]
            if len(parts)!=len(exp): krvbad+=1; print(f'  KRV count {ch}:{a}-{b}'); continue
            for v,(p,e) in zip(range(a,b+1),zip(parts,exp)):
                if p.replace(' ','')!=e.replace(' ',''):
                    krvbad+=1; print(f'  KRV diff {ch}:{v}\n    got:{p}\n    exp:{e}')
    ok = not(stack or errs or anch or tmis or spaced or links or krvbad)
    fail += 0 if ok else 1
    print(f"{'OK ' if ok else 'FAIL'} {path}  ({len(h):,}B) tags={len(stack)+len(errs)} anchors={len(anch)} tables={len(tmis)} links={len(links)} krv={krvbad}")
print('\n'+('전체 통과 — 오류 0' if not fail else f'{fail}개 파일에 오류'))
sys.exit(1 if fail else 0)
