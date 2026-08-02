#!/usr/bin/env python3
"""Remap MorphHB's four-chapter Joel versification to the site's three chapters.

MorphHB/WLC follows the Hebrew chapter numbering: Joel 3:1-5 corresponds to
Joel 2:28-32 in Korean/English Bibles, and Hebrew Joel 4 corresponds to Joel 3.
"""
from __future__ import annotations

import argparse
import gzip
import hashlib
import io
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT_ROOT = ROOT / "assets" / "data" / "bible" / "original" / "oshb"
MANIFEST_PATH = OUT_ROOT / "manifest.json"


def deterministic_gzip(payload: bytes) -> bytes:
    output = io.BytesIO()
    with gzip.GzipFile(filename="", mode="wb", fileobj=output, mtime=0, compresslevel=9) as handle:
        handle.write(payload)
    return output.getvalue()


def remap() -> bool:
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    book_info = manifest["books"]["JOL"]
    chunk_info = manifest["chunks"][book_info["chunk"]]
    chunk_path = OUT_ROOT / chunk_info["path"]
    payload = json.loads(gzip.decompress(chunk_path.read_bytes()).decode("utf-8"))
    book = payload["books"]["JOL"]
    chapters = book["chapters"]

    if set(chapters) == {"1", "2", "3"} and "28" in chapters["2"] and "32" in chapters["2"]:
        return False
    if set(chapters) != {"1", "2", "3", "4"}:
        raise SystemExit(f"unexpected Joel chapter set: {sorted(chapters)}")
    if sorted(map(int, chapters["3"])) != [1, 2, 3, 4, 5]:
        raise SystemExit("unexpected Hebrew Joel 3 bridge verses")

    chapter_two = dict(chapters["2"])
    for verse, text in chapters["3"].items():
        chapter_two[str(int(verse) + 27)] = text
    chapter_two = dict(sorted(chapter_two.items(), key=lambda item: int(item[0])))

    book["chapters"] = {
        "1": chapters["1"],
        "2": chapter_two,
        "3": chapters["4"],
    }
    json_bytes = json.dumps(payload, ensure_ascii=False, separators=(",", ":"), sort_keys=True).encode("utf-8")
    compressed = deterministic_gzip(json_bytes)
    chunk_path.write_bytes(compressed)

    book_info["chapters"] = 3
    book_info["verses"] = sum(len(verses) for verses in book["chapters"].values())
    book_info["jsonBytes"] = len(json_bytes)
    book_info["gzipBytes"] = len(compressed)
    chunk_info["bytes"] = len(compressed)
    chunk_info["sha256"] = hashlib.sha256(compressed).hexdigest()

    validation = manifest["validation"]
    validation["chapters"] = sum(int(info["chapters"]) for info in manifest["books"].values())
    validation["verseMarkers"] = sum(int(info["verses"]) for info in manifest["books"].values())
    validation["gzipBytes"] = sum(int(info["gzipBytes"]) for info in manifest["books"].values())
    MANIFEST_PATH.write_text(
        json.dumps(manifest, ensure_ascii=False, separators=(",", ":")) + "\n",
        encoding="utf-8",
    )
    return True


def validate() -> None:
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    book_info = manifest["books"]["JOL"]
    chunk_path = OUT_ROOT / manifest["chunks"][book_info["chunk"]]["path"]
    payload = json.loads(gzip.decompress(chunk_path.read_bytes()).decode("utf-8"))
    chapters = payload["books"]["JOL"]["chapters"]
    if set(chapters) != {"1", "2", "3"}:
        raise SystemExit("Joel remap did not produce three chapters")
    if sorted(map(int, chapters["2"]))[-5:] != [28, 29, 30, 31, 32]:
        raise SystemExit("Joel 2:28-32 bridge is missing")
    if len(chapters["3"]) != 21:
        raise SystemExit("Joel 3 must contain 21 verses")
    print("요엘 절수 체계 검증 완료: MT 4장 → 개역개정 3장")


def main() -> None:
    parser = argparse.ArgumentParser()
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--write", action="store_true")
    mode.add_argument("--check", action="store_true")
    args = parser.parse_args()
    if args.write:
        changed = remap()
        print("요엘 절수 체계 변환 완료" if changed else "요엘 절수 체계는 이미 변환됨")
    validate()


if __name__ == "__main__":
    main()
