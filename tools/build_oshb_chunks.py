#!/usr/bin/env python3
"""Build local, deterministic WLC/OSHB JSON gzip chunks.

The browser previously downloaded a complete MorphHB XML book from jsDelivr and
parsed it on the main thread every time a book was opened. This builder performs
that work once at build time and stores one compact gzip JSON file per OT book.

Default source: MorphHB 2.0.2, the same pinned version used by the former runtime
loader. A local ``wlc`` directory can be supplied for offline/reproducible builds.
"""
from __future__ import annotations

import argparse
import concurrent.futures
import gzip
import hashlib
import io
import json
import re
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT_ROOT = ROOT / "assets" / "data" / "bible" / "original" / "oshb"
CHUNK_DIR = OUT_ROOT / "chunks"
MANIFEST_PATH = OUT_ROOT / "manifest.json"
KOR_MANIFEST_PATH = ROOT / "assets" / "data" / "bible" / "kor" / "manifest.json"
SOURCE_VERSION = "2.0.2"
SOURCE_BASE = f"https://cdn.jsdelivr.net/npm/morphhb@{SOURCE_VERSION}/wlc/"
USER_AGENT = "biblestudygyu-oshb-builder/1.0"

# Site code, Korean name, OSIS book code, MorphHB XML filename.
BOOKS = (
    ("GEN", "창세기", "Gen", "Gen.xml"),
    ("EXO", "출애굽기", "Exod", "Exod.xml"),
    ("LEV", "레위기", "Lev", "Lev.xml"),
    ("NUM", "민수기", "Num", "Num.xml"),
    ("DEU", "신명기", "Deut", "Deut.xml"),
    ("JOS", "여호수아", "Josh", "Josh.xml"),
    ("JDG", "사사기", "Judg", "Judg.xml"),
    ("RUT", "룻기", "Ruth", "Ruth.xml"),
    ("1SA", "사무엘상", "1Sam", "1Sam.xml"),
    ("2SA", "사무엘하", "2Sam", "2Sam.xml"),
    ("1KI", "열왕기상", "1Kgs", "1Kgs.xml"),
    ("2KI", "열왕기하", "2Kgs", "2Kgs.xml"),
    ("1CH", "역대상", "1Chr", "1Chr.xml"),
    ("2CH", "역대하", "2Chr", "2Chr.xml"),
    ("EZR", "에스라", "Ezra", "Ezra.xml"),
    ("NEH", "느헤미야", "Neh", "Neh.xml"),
    ("EST", "에스더", "Esth", "Esth.xml"),
    ("JOB", "욥기", "Job", "Job.xml"),
    ("PSA", "시편", "Ps", "Ps.xml"),
    ("PRO", "잠언", "Prov", "Prov.xml"),
    ("ECC", "전도서", "Eccl", "Eccl.xml"),
    ("SNG", "아가", "Song", "Song.xml"),
    ("ISA", "이사야", "Isa", "Isa.xml"),
    ("JER", "예레미야", "Jer", "Jer.xml"),
    ("LAM", "예레미야애가", "Lam", "Lam.xml"),
    ("EZK", "에스겔", "Ezek", "Ezek.xml"),
    ("DAN", "다니엘", "Dan", "Dan.xml"),
    ("HOS", "호세아", "Hos", "Hos.xml"),
    ("JOL", "요엘", "Joel", "Joel.xml"),
    ("AMO", "아모스", "Amos", "Amos.xml"),
    ("OBA", "오바댜", "Obad", "Obad.xml"),
    ("JON", "요나", "Jonah", "Jonah.xml"),
    ("MIC", "미가", "Mic", "Mic.xml"),
    ("NAM", "나훔", "Nah", "Nah.xml"),
    ("HAB", "하박국", "Hab", "Hab.xml"),
    ("ZEP", "스바냐", "Zeph", "Zeph.xml"),
    ("HAG", "학개", "Hag", "Hag.xml"),
    ("ZEC", "스가랴", "Zech", "Zech.xml"),
    ("MAL", "말라기", "Mal", "Mal.xml"),
)


def local_name(tag: str) -> str:
    return tag.rsplit("}", 1)[-1]


def compact_text(element: ET.Element) -> str:
    return re.sub(r"\s+", " ", "".join(element.itertext())).strip()


def fetch_xml(filename: str, source_dir: Path | None) -> bytes:
    if source_dir:
        path = source_dir / filename
        if not path.exists():
            raise FileNotFoundError(path)
        return path.read_bytes()
    request = urllib.request.Request(SOURCE_BASE + filename, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=90) as response:
        payload = response.read()
    if len(payload) < 500:
        raise RuntimeError(f"unexpectedly small MorphHB source: {filename} ({len(payload)} bytes)")
    return payload


def parse_book(code: str, osis: str, xml_bytes: bytes) -> tuple[dict[str, dict[str, str]], int]:
    root = ET.fromstring(xml_bytes)
    chapters: dict[str, dict[str, str]] = {}
    verse_count = 0
    for element in root.iter():
        if local_name(element.tag) != "verse":
            continue
        osis_id = element.attrib.get("osisID", "")
        parts = osis_id.split(".")
        if len(parts) < 3:
            continue
        if parts[-3] != osis:
            raise ValueError(f"{code}: unexpected osisID {osis_id}")
        try:
            chapter = str(int(parts[-2]))
            verse = str(int(parts[-1]))
        except ValueError as exc:
            raise ValueError(f"{code}: invalid osisID {osis_id}") from exc
        text = compact_text(element)
        if not text:
            raise ValueError(f"{code} {chapter}:{verse}: empty verse text")
        if verse in chapters.setdefault(chapter, {}):
            raise ValueError(f"{code} {chapter}:{verse}: duplicate verse")
        chapters[chapter][verse] = text
        verse_count += 1
    if not chapters or not verse_count:
        raise ValueError(f"{code}: no verses parsed")
    return chapters, verse_count


def deterministic_gzip(payload: bytes) -> bytes:
    output = io.BytesIO()
    with gzip.GzipFile(filename="", mode="wb", fileobj=output, mtime=0, compresslevel=9) as handle:
        handle.write(payload)
    return output.getvalue()


def build_one(row: tuple[str, str, str, str], source_dir: Path | None) -> tuple[str, dict, bytes]:
    code, name, osis, filename = row
    xml_bytes = fetch_xml(filename, source_dir)
    chapters, verse_count = parse_book(code, osis, xml_bytes)
    chunk = {"books": {code: {"name": name, "chapters": chapters}}}
    json_bytes = json.dumps(chunk, ensure_ascii=False, separators=(",", ":"), sort_keys=True).encode("utf-8")
    compressed = deterministic_gzip(json_bytes)
    info = {
        "name": name,
        "number": next(index for index, item in enumerate(BOOKS, 1) if item[0] == code),
        "osis": osis,
        "sourceFile": filename,
        "chunk": code,
        "chapters": len(chapters),
        "verses": verse_count,
        "sourceBytes": len(xml_bytes),
        "sourceSha256": hashlib.sha256(xml_bytes).hexdigest(),
        "jsonBytes": len(json_bytes),
        "gzipBytes": len(compressed),
    }
    return code, info, compressed


def expected_chapters() -> dict[str, int]:
    payload = json.loads(KOR_MANIFEST_PATH.read_text(encoding="utf-8"))
    return {code: int(payload["books"][code]["chapters"]) for code, *_ in BOOKS}


def write_build(source_dir: Path | None, workers: int) -> None:
    results: dict[str, tuple[dict, bytes]] = {}
    with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as executor:
        futures = {executor.submit(build_one, row, source_dir): row[0] for row in BOOKS}
        for future in concurrent.futures.as_completed(futures):
            code, info, compressed = future.result()
            results[code] = (info, compressed)
            print(f"built {code}: {info['chapters']}장 {info['verses']:,}절, {len(compressed):,} bytes")

    CHUNK_DIR.mkdir(parents=True, exist_ok=True)
    for stale in CHUNK_DIR.glob("*.json.gz"):
        stale.unlink()

    books: dict[str, dict] = {}
    chunks: dict[str, dict] = {}
    for code, *_ in BOOKS:
        info, compressed = results[code]
        path = CHUNK_DIR / f"{code.lower()}.json.gz"
        path.write_bytes(compressed)
        books[code] = info
        chunks[code] = {
            "path": f"chunks/{path.name}",
            "books": [code],
            "bytes": len(compressed),
            "sha256": hashlib.sha256(compressed).hexdigest(),
        }

    manifest = {
        "source": "Open Scriptures Hebrew Bible (WLC/OSHB)",
        "sourceProject": "https://github.com/openscriptures/morphhb",
        "sourcePackage": f"morphhb@{SOURCE_VERSION}",
        "sourceRuntimeBaseFormerlyUsed": SOURCE_BASE,
        "edition": "WLC/OSHB",
        "license": "CC BY 4.0; attribute the Open Scriptures Hebrew Bible Project",
        "format": "one deterministic gzip JSON chunk per book",
        "books": books,
        "chunks": chunks,
        "validation": {
            "books": len(books),
            "chapters": sum(int(info["chapters"]) for info in books.values()),
            "verseMarkers": sum(int(info["verses"]) for info in books.values()),
            "sourceBytes": sum(int(info["sourceBytes"]) for info in books.values()),
            "gzipBytes": sum(int(info["gzipBytes"]) for info in books.values()),
        },
    }
    MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST_PATH.write_text(json.dumps(manifest, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")


def validate() -> None:
    if not MANIFEST_PATH.exists():
        raise SystemExit(f"missing manifest: {MANIFEST_PATH.relative_to(ROOT)}")
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    expected_codes = [code for code, *_ in BOOKS]
    if list(manifest.get("books", {})) != expected_codes:
        raise SystemExit("OSHB manifest book order/set mismatch")
    if set(manifest.get("chunks", {})) != set(expected_codes):
        raise SystemExit("OSHB manifest chunk set mismatch")

    chapter_expectation = expected_chapters()
    total_chapters = 0
    total_verses = 0
    total_bytes = 0
    for code in expected_codes:
        book_info = manifest["books"][code]
        chunk_info = manifest["chunks"][book_info["chunk"]]
        path = OUT_ROOT / chunk_info["path"]
        if not path.exists():
            raise SystemExit(f"{code}: missing chunk {path.relative_to(ROOT)}")
        compressed = path.read_bytes()
        if len(compressed) != int(chunk_info["bytes"]):
            raise SystemExit(f"{code}: byte count mismatch")
        if hashlib.sha256(compressed).hexdigest() != chunk_info["sha256"]:
            raise SystemExit(f"{code}: gzip checksum mismatch")
        payload = json.loads(gzip.decompress(compressed).decode("utf-8"))
        book = payload.get("books", {}).get(code)
        if not book or not isinstance(book.get("chapters"), dict):
            raise SystemExit(f"{code}: invalid chunk payload")
        chapters = book["chapters"]
        if len(chapters) != chapter_expectation[code]:
            raise SystemExit(f"{code}: chapter coverage {len(chapters)}/{chapter_expectation[code]}")
        verse_count = sum(len(verses) for verses in chapters.values())
        if verse_count != int(book_info["verses"]):
            raise SystemExit(f"{code}: verse count mismatch")
        total_chapters += len(chapters)
        total_verses += verse_count
        total_bytes += len(compressed)

    validation = manifest.get("validation", {})
    if total_chapters != int(validation.get("chapters", -1)):
        raise SystemExit("manifest total chapter count mismatch")
    if total_verses != int(validation.get("verseMarkers", -1)):
        raise SystemExit("manifest total verse count mismatch")
    if total_bytes != int(validation.get("gzipBytes", -1)):
        raise SystemExit("manifest total gzip byte count mismatch")
    print(f"OSHB 로컬 데이터 검증 완료: 39권, {total_chapters:,}장, {total_verses:,}절, {total_bytes:,} bytes")


def main() -> None:
    parser = argparse.ArgumentParser()
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--write", action="store_true")
    mode.add_argument("--check", action="store_true")
    parser.add_argument("--source-dir", type=Path, help="local MorphHB wlc directory")
    parser.add_argument("--workers", type=int, default=6)
    args = parser.parse_args()

    if args.write:
        write_build(args.source_dir, max(1, min(args.workers, 12)))
    validate()


if __name__ == "__main__":
    main()
