#!/usr/bin/env python3
"""대한성서공회 웹 성경에서 개역개정 66권을 가져와 압축 묶음으로 만든다.

학업·학술용 사용 허가를 받은 저장소에서 일회성 데이터 구축에 사용한다.
"""
from __future__ import annotations

import argparse
import concurrent.futures
import gzip
import json
import random
import re
import threading
import time
from pathlib import Path

import requests
from bs4 import BeautifulSoup

BASE_URL = "https://www.bskorea.or.kr/bible/korbibReadpage.php"

BOOKS = [
    ("GEN","창세기","창","gen",50),("EXO","출애굽기","출","exo",40),("LEV","레위기","레","lev",27),("NUM","민수기","민","num",36),("DEU","신명기","신","deu",34),
    ("JOS","여호수아","수","jos",24),("JDG","사사기","삿","jdg",21),("RUT","룻기","룻","rut",4),("1SA","사무엘상","삼상","1sa",31),("2SA","사무엘하","삼하","2sa",24),
    ("1KI","열왕기상","왕상","1ki",22),("2KI","열왕기하","왕하","2ki",25),("1CH","역대상","대상","1ch",29),("2CH","역대하","대하","2ch",36),("EZR","에스라","스","ezr",10),
    ("NEH","느헤미야","느","neh",13),("EST","에스더","에","est",10),("JOB","욥기","욥","job",42),("PSA","시편","시","psa",150),("PRO","잠언","잠","pro",31),
    ("ECC","전도서","전","ecc",12),("SNG","아가","아","sng",8),("ISA","이사야","사","isa",66),("JER","예레미야","렘","jer",52),("LAM","예레미야애가","애","lam",5),
    ("EZK","에스겔","겔","ezk",48),("DAN","다니엘","단","dan",12),("HOS","호세아","호","hos",14),("JOL","요엘","욜","jol",3),("AMO","아모스","암","amo",9),
    ("OBA","오바댜","옵","oba",1),("JON","요나","욘","jon",4),("MIC","미가","미","mic",7),("NAM","나훔","나","nam",3),("HAB","하박국","합","hab",3),
    ("ZEP","스바냐","습","zep",3),("HAG","학개","학","hag",2),("ZEC","스가랴","슥","zec",14),("MAL","말라기","말","mal",4),("MAT","마태복음","마","mat",28),
    ("MRK","마가복음","막","mrk",16),("LUK","누가복음","눅","luk",24),("JHN","요한복음","요","jhn",21),("ACT","사도행전","행","act",28),("ROM","로마서","롬","rom",16),
    ("1CO","고린도전서","고전","1co",16),("2CO","고린도후서","고후","2co",13),("GAL","갈라디아서","갈","gal",6),("EPH","에베소서","엡","eph",6),("PHP","빌립보서","빌","php",4),
    ("COL","골로새서","골","col",4),("1TH","데살로니가전서","살전","1th",5),("2TH","데살로니가후서","살후","2th",3),("1TI","디모데전서","딤전","1ti",6),("2TI","디모데후서","딤후","2ti",4),
    ("TIT","디도서","딛","tit",3),("PHM","빌레몬서","몬","phm",1),("HEB","히브리서","히","heb",13),("JAS","야고보서","약","jas",5),("1PE","베드로전서","벧전","1pe",5),
    ("2PE","베드로후서","벧후","2pe",3),("1JN","요한일서","요일","1jn",5),("2JN","요한이서","요이","2jn",1),("3JN","요한삼서","요삼","3jn",1),("JUD","유다서","유","jud",1),("REV","요한계시록","계","rev",22),
]

CHUNKS = {
    "ot-pentateuch": [row[0] for row in BOOKS[:5]],
    "ot-history": [row[0] for row in BOOKS[5:17]],
    "ot-wisdom": [row[0] for row in BOOKS[17:22]],
    "ot-prophets": [row[0] for row in BOOKS[22:39]],
    "nt-gospels-acts": [row[0] for row in BOOKS[39:44]],
    "nt-paul": [row[0] for row in BOOKS[44:57]],
    "nt-general": [row[0] for row in BOOKS[57:65]],
    "nt-revelation": ["REV"],
}

_tls = threading.local()


def session() -> requests.Session:
    if not hasattr(_tls, "session"):
        s = requests.Session()
        s.headers.update({
            "User-Agent": "Mozilla/5.0 (compatible; BibleStudyGyuAcademic/1.0; +https://gyu1718.github.io/biblestudygyu/)",
            "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.5",
        })
        _tls.session = s
    return _tls.session


def normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def parse_verses(html: str) -> dict[str, str]:
    soup = BeautifulSoup(html, "html.parser")
    verses: dict[str, str] = {}
    for span in soup.find_all("span"):
        text = normalize(span.get_text(" ", strip=True))
        match = re.match(r"^(\d+)\s+(.+)$", text, flags=re.S)
        if not match:
            continue
        verse = int(match.group(1))
        body = re.sub(r"\d+\)", "", match.group(2)).strip()
        body = normalize(body.split("\n", 1)[0])
        if body and str(verse) not in verses:
            verses[str(verse)] = body
    return dict(sorted(verses.items(), key=lambda item: int(item[0])))


def fetch_chapter(task: tuple[str, str, int]) -> tuple[str, int, dict[str, str]]:
    code, api_code, chapter = task
    last_error: Exception | None = None
    for attempt in range(5):
        try:
            response = session().get(
                BASE_URL,
                params={"version": "GAE", "book": api_code, "chap": chapter},
                timeout=45,
            )
            response.raise_for_status()
            if not response.encoding or response.encoding.lower() == "iso-8859-1":
                response.encoding = response.apparent_encoding or "utf-8"
            verses = parse_verses(response.text)
            if not verses:
                raise RuntimeError("절을 찾지 못했습니다")
            time.sleep(0.08 + random.random() * 0.12)
            return code, chapter, verses
        except Exception as exc:
            last_error = exc
            time.sleep(min(20, 1.5 * (2**attempt)) + random.random())
    raise RuntimeError(f"{code} {chapter}장 가져오기 실패: {last_error}")


def write_data(output: Path, extracted: dict[str, dict]) -> None:
    chunk_dir = output / "chunks"
    chunk_dir.mkdir(parents=True, exist_ok=True)
    manifest = {
        "translation": "개역개정",
        "purpose": "학업·학술용 허가 범위 내 사용",
        "source": "대한성서공회 웹 성경",
        "chunks": {},
        "books": {},
    }
    for chunk_name, codes in CHUNKS.items():
        path = chunk_dir / f"{chunk_name}.json.gz"
        payload = {"books": {code: extracted[code] for code in codes}}
        with gzip.open(path, "wt", encoding="utf-8", compresslevel=9) as handle:
            json.dump(payload, handle, ensure_ascii=False, separators=(",", ":"))
        manifest["chunks"][chunk_name] = {
            "path": f"chunks/{path.name}",
            "books": codes,
            "bytes": path.stat().st_size,
        }

    total = 0
    for code, name, short, _api, expected_chapters in BOOKS:
        book = extracted[code]
        verses = sum(len(chapter) for chapter in book["chapters"].values())
        total += verses
        chunk_name = next(key for key, codes in CHUNKS.items() if code in codes)
        manifest["books"][code] = {
            "name": name,
            "short": short,
            "chunk": chunk_name,
            "chapters": expected_chapters,
            "verses": verses,
        }

    if total != 31102:
        raise RuntimeError(f"총 절 수가 예상과 다릅니다: {total:,} / 31,102")
    (output / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, separators=(",", ":")), encoding="utf-8"
    )
    print(f"개역개정 66권 {total:,}절을 {len(CHUNKS)}개 지연 로딩 묶음으로 생성했습니다.")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, default=Path("assets/data/bible/kor"))
    parser.add_argument("--workers", type=int, default=4)
    args = parser.parse_args()

    tasks = [(code, api, chapter) for code, _name, _short, api, count in BOOKS for chapter in range(1, count + 1)]
    extracted = {
        code: {"code": code, "name": name, "short": short, "translation": "개역개정", "chapters": {}}
        for code, name, short, _api, _count in BOOKS
    }
    with concurrent.futures.ThreadPoolExecutor(max_workers=max(1, args.workers)) as pool:
        futures = {pool.submit(fetch_chapter, task): task for task in tasks}
        done = 0
        for future in concurrent.futures.as_completed(futures):
            code, chapter, verses = future.result()
            extracted[code]["chapters"][str(chapter)] = verses
            done += 1
            if done % 50 == 0 or done == len(tasks):
                print(f"진행: {done}/{len(tasks)}장")

    for book in extracted.values():
        book["chapters"] = dict(sorted(book["chapters"].items(), key=lambda item: int(item[0])))
    args.output.mkdir(parents=True, exist_ok=True)
    write_data(args.output, extracted)


if __name__ == "__main__":
    main()
