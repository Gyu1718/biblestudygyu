#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""STEPBible 원자료를 sparse checkout으로 내려받는다."""
from __future__ import annotations
import argparse, subprocess, sys
from pathlib import Path

REPO = "https://github.com/STEPBible/STEPBible-Data.git"
PATTERNS = [
    "Translators Amalgamated OT+NT/TAHOT*",
    "Translators Amalgamated OT+NT/TAGNT*",
    "Morphology codes/TEHMC*",
    "Morphology codes/TEGMC*",
    "Lexicons/TBESH*",
    "Lexicons/TBESG*",
]

def run(cmd: list[str]) -> None:
    print("$", " ".join(cmd)); subprocess.run(cmd, check=True)

def main() -> None:
    parser=argparse.ArgumentParser(); parser.add_argument("--dest",type=Path,default=Path("sources/STEPBible-Data")); parser.add_argument("--repo",default=REPO); args=parser.parse_args()
    dest=args.dest
    if dest.exists():
        if not (dest/".git").exists(): raise SystemExit(f"{dest}가 Git 저장소가 아닙니다.")
        run(["git","-C",str(dest),"pull","--ff-only"])
    else:
        dest.parent.mkdir(parents=True,exist_ok=True)
        run(["git","clone","--depth","1","--filter=blob:none","--sparse",args.repo,str(dest)])
    run(["git","-C",str(dest),"sparse-checkout","set","--no-cone",*PATTERNS])
    files=sorted(dest.rglob("*.txt")); print(f"내려받은 텍스트 파일: {len(files)}개")
    if not files: print("STEPBible 경로가 바뀌었을 수 있습니다.",file=sys.stderr); raise SystemExit(1)

if __name__=="__main__": main()
