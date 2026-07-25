#!/usr/bin/env python3
"""로마서 보완 패치 A–E 자동 적용·검증기."""
from __future__ import annotations
import argparse, base64, hashlib, html, re, shutil, subprocess, sys, tempfile, zipfile
from pathlib import Path
from urllib.parse import urlsplit

SHA = "54cf96d9288452d6904b84287d1f865500fcb8b88fd9bca5418574b5b0b2c260"
E = {
 "E-12a":(12,"12:1-2",["λογικὴν λατρείαν — 개역개정의 선택","제의 언어의 이주"]),
 "E-12b":(12,"12:3-8",["세 목록의 관계"]),
 "E-13a":(13,"13:1-5",['두 개의 "하나님의 사역자"','4절의 "칼"']),
 "E-14a":(14,"14:13-23",["14:23의 사정거리","옳은 쪽에게 요구되는 양보"]),
 "E-15a":(15,"15:14-21",["제사장 직분이라는 자기 이해","예루살렘 연보의 무게"]),
 "E-16a":(16,"16:1-2",["뵈뵈의 두 낱말","명단이 증명하는 것"]),
}
SOURCE = '''<section class="book-shelf-section" id="source-status"><div class="book-shelf-head"><div class="book-shelf-eyebrow">SOURCE STATUS</div><h2>연구 자료의 확인 상태</h2><p>자료 칩은 직접 확인 자료와 재인용 자료를 구분한다.</p></div><div class="book-paths"><div class="book-path"><span class="symbol">πηγή</span><span><h3>직접 확인 일곱 종</h3><p>Cranfield·Kruse·Stott의 주해와 Moo·Dunn·Gaventa·Barth의 독법을 직접 확인해 사용한다.</p></span><span class="go">C · K · S · M · D · G · B</span></div><div class="book-path"><span class="symbol">παράθεσις</span><span><h3>재인용 두 종</h3><p>Jewett과 Longenecker는 원본 미확보 상태이므로 직접 확인 자료가 인용한 범위에서만 사용한다.</p></span><span class="go">J · L</span></div></div></section>'''

def bundle(root: Path, out: Path) -> Path:
    parts=sorted((root/"tools/romans-patches").glob("payload.part*.b64"))
    if len(parts)!=7: raise RuntimeError(f"payload 7개가 필요합니다: {len(parts)}개")
    raw=base64.b64decode(re.sub(r"\s+","","".join(p.read_text() for p in parts)),validate=True)
    if hashlib.sha256(raw).hexdigest()!=SHA: raise RuntimeError("패치 ZIP 해시가 다릅니다")
    z=out/"patch.zip"; z.write_bytes(raw)
    with zipfile.ZipFile(z) as f:
        for x in f.infolist():
            q=(out/x.filename).resolve()
            if out.resolve() not in q.parents: raise RuntimeError("안전하지 않은 ZIP 경로")
        f.extractall(out)
    # Python zipfile이 한글 파일명을 CP437로 해석하는 환경에서도
    # 원본 패치 스크립트가 기대하는 고정 파일명으로 정규화한다.
    names = {
        "PATCH-A-*": "PATCH-A-스파인정합화.md",
        "PATCH-B-*": "PATCH-B-바르트.html",
        "PATCH-C-*": "PATCH-C-ch13-수용사.html",
        "PATCH-D1-*": "PATCH-D1-주석별독법-ch02-04-06-10.html",
        "PATCH-D2-*": "PATCH-D2-주석별독법-ch12-13-14-15-16.html",
        "PATCH-E-*": "PATCH-E-후반부증량.html",
        "README-*": "README-적용안내.md",
    }
    for pattern, wanted in names.items():
        target=out/wanted
        if target.exists(): continue
        matches=list(out.glob(pattern))
        if len(matches)!=1:
            raise RuntimeError(f"패치 파일을 식별하지 못했습니다: {pattern} ({len(matches)}개)")
        matches[0].rename(target)
    return out

def block(text:str, mark:str)->str:
    m=re.search(r"<!--(?:(?!-->).)*"+re.escape(mark)+r"(?:(?!-->).)*-->\s*(.*?)(?=\n<!--[^>]*E-|\Z)",text,re.S)
    if not m: raise RuntimeError(f"E 블록 없음: {mark}")
    return m.group(1).strip()+"\n"

def close_div(text:str,start:int)->int:
    depth=0
    for m in re.finditer(r"</?div\b[^>]*>",text[start:],re.I):
        token=m.group(); pos=start+m.start()
        if token.startswith("</"):
            depth-=1
            if depth==0:return pos
        else: depth+=1
    raise RuntimeError("div 닫힘을 찾지 못했습니다")

def norm(s:str)->str:
    return re.sub(r"\s+","",s.translate(str.maketrans({"–":"-","—":"-","−":"-"})))

def vs_end(text:str,target:str)->int:
    fallback=None; startref=target.split("-")[0]
    for m in re.finditer(r'<div\b[^>]*class=["\'][^"\']*\bvs\b[^"\']*["\'][^>]*>',text,re.I):
        end=close_div(text,m.start()); plain=norm(html.unescape(re.sub(r"<[^>]+>","",text[m.start():end])))
        if target in plain:return end
        if fallback is None and startref in plain:fallback=end
    if fallback is not None:return fallback
    raise RuntimeError(f"절 단락 없음: {target}")

def apply_e(rom:Path, patch:Path)->int:
    src=(patch/"PATCH-E-후반부증량.html").read_text()
    changed=0
    for mark,(ch,target,titles) in E.items():
        p=rom/f"ch{ch:02d}.html"; text=p.read_text()
        if all(t in text for t in titles):continue
        pos=vs_end(text,target); text=text[:pos]+"\n"+block(src,mark)+text[pos:]
        p.write_text(text); changed+=1
    return changed

def add_source(rom:Path)->bool:
    p=rom/"index.html"; text=p.read_text()
    if 'id="source-status"' in text:return False
    m=re.search(r"<footer\b",text,re.I)
    if not m:raise RuntimeError("로마서 서가 footer 없음")
    p.write_text(text[:m.start()]+SOURCE+"\n"+text[m.start():]); return True

def validate(root:Path)->None:
    rom=root/"nt/romans"; names=["index.html","overview.html"]+[f"ch{i:02d}.html" for i in range(1,17)]
    for n in names:
        if not (rom/n).exists():raise RuntimeError(f"누락: nt/romans/{n}")
    combined="\n".join((rom/f"ch{i:02d}.html").read_text() for i in range(1,17))
    for title in [x for _,_,xs in E.values() for x in xs]:
        if title not in combined:raise RuntimeError(f"E 누락: {title}")
    for ch in (1,3,5,7,8,9,11):
        if "바르트의 독법" not in (rom/f"ch{ch:02d}.html").read_text():raise RuntimeError(f"B 누락: ch{ch:02d}")
    for ch in (2,4,6,10,12,13,14,15,16):
        if 'id="sc"' not in (rom/f"ch{ch:02d}.html").read_text():raise RuntimeError(f"D 누락: ch{ch:02d}")
    if 'id="sr"' not in (rom/"ch13.html").read_text():raise RuntimeError("C 누락: ch13")
    if "자료 칩 · 직접 확인" not in combined:raise RuntimeError("A 범례 누락")
    if 'id="source-status"' not in (rom/"index.html").read_text():raise RuntimeError("A 서가 자료 상태 누락")
    for n in names:
        text=(rom/n).read_text(); ids=re.findall(r'\bid=["\']([^"\']+)',text); seen=set()
        dup={x for x in ids if x in seen or seen.add(x)}
        if dup:raise RuntimeError(f"{n} 중복 id: {sorted(dup)}")
        for a in re.findall(r'<a\b[^>]*class=["\'][^"\']*\blv1\b[^"\']*["\'][^>]*href=["\']#([^"\']+)',text,re.I):
            if a not in ids:raise RuntimeError(f"{n} 목차 앵커 누락: #{a}")
        if text.count("<section")!=text.count("</section>") or text.count("<div")!=text.count("</div>"):
            raise RuntimeError(f"{n} 태그 불균형")
        for href in re.findall(r'href=["\']([^"\']+)',text,re.I):
            u=urlsplit(html.unescape(href))
            if not u.path or u.scheme or u.netloc or href.startswith(("#","mailto:","javascript:","data:")):continue
            q=((rom/n).parent/u.path).resolve()
            if q.suffix.lower() in {".html",".css",".js",".json"} and not q.exists():raise RuntimeError(f"{n} 깨진 링크: {href}")
    counts={c:len(re.findall(rf'<span class=["\']c [^"\']*["\']>{c}</span>',combined)) for c in "BDMGCKS"}
    print("[검증] A–E 완료 · E 해설 박스 11개")
    print("[검증] 칩: "+" · ".join(f"{k} {v}" for k,v in counts.items()))

def complete(root:Path)->bool:
    try:validate(root);return True
    except RuntimeError as e:print(f"[미적용] {e}");return False

def main():
    ap=argparse.ArgumentParser(); ap.add_argument("--repo",default=".")
    g=ap.add_mutually_exclusive_group(required=True); g.add_argument("--write",action="store_true"); g.add_argument("--check",action="store_true")
    a=ap.parse_args(); root=Path(a.repo).resolve(); rom=root/"nt/romans"
    if a.check:
        if not complete(root):raise SystemExit(1)
        print("[완료] 로마서 보완 패치가 적용되어 있습니다.");return
    with tempfile.TemporaryDirectory(prefix="romans-patch-") as td:
        p=bundle(root,Path(td)); backups=[]
        try:
            subprocess.run([sys.executable,str(p/"apply_patches.py"),"--repo",str(root),"--write"],check=True)
            backups=list(rom.glob("_backup_*")); ecount=apply_e(rom,p); source=add_source(rom)
            validate(root)
            print(f"[완료] PATCH-E 대상 {ecount}개 파일 · 서가 자료 상태 {'추가' if source else '유지'}")
        finally:
            for b in backups:shutil.rmtree(b,ignore_errors=True)
if __name__=="__main__":main()
