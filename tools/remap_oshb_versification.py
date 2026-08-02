#!/usr/bin/env python3
"""Normalize WLC/OSHB chapter numbering to the site's Korean versification.

MorphHB follows Hebrew chapter numbering in two books that differ from the
Korean/English chapter layout used by this site:

- Joel 3:1-5 -> Joel 2:28-32; Hebrew Joel 4 -> Joel 3
- Malachi 3:19-24 -> Malachi 4:1-6
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


def load_book(manifest: dict, code: str) -> tuple[dict, dict, Path, dict]:
    book_info = manifest["books"][code]
    chunk_info = manifest["chunks"][book_info["chunk"]]
    chunk_path = OUT_ROOT / chunk_info["path"]
    payload = json.loads(gzip.decompress(chunk_path.read_bytes()).decode("utf-8"))
    return book_info, chunk_info, chunk_path, payload


def save_book(
    manifest: dict,
    code: str,
    book_info: dict,
    chunk_info: dict,
    chunk_path: Path,
    payload: dict,
) -> None:
    book = payload["books"][code]
    json_bytes = json.dumps(
        payload,
        ensure_ascii=False,
        separators=(",", ":"),
        sort_keys=True,
    ).encode("utf-8")
    compressed = deterministic_gzip(json_bytes)
    chunk_path.write_bytes(compressed)

    book_info["chapters"] = len(book["chapters"])
    book_info["verses"] = sum(len(verses) for verses in book["chapters"].values())
    book_info["jsonBytes"] = len(json_bytes)
    book_info["gzipBytes"] = len(compressed)
    chunk_info["bytes"] = len(compressed)
    chunk_info["sha256"] = hashlib.sha256(compressed).hexdigest()


def remap_joel(manifest: dict) -> bool:
    book_info, chunk_info, chunk_path, payload = load_book(manifest, "JOL")
    book = payload["books"]["JOL"]
    chapters = book["chapters"]

    if set(chapters) == {"1", "2", "3"} and all(
        str(verse) in chapters["2"] for verse in range(28, 33)
    ):
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
    save_book(manifest, "JOL", book_info, chunk_info, chunk_path, payload)
    return True


def remap_malachi(manifest: dict) -> bool:
    book_info, chunk_info, chunk_path, payload = load_book(manifest, "MAL")
    book = payload["books"]["MAL"]
    chapters = book["chapters"]

    if set(chapters) == {"1", "2", "3", "4"}:
        if sorted(map(int, chapters["4"])) != [1, 2, 3, 4, 5, 6]:
            raise SystemExit("unexpected Malachi 4 verse set")
        return False
    if set(chapters) != {"1", "2", "3"}:
        raise SystemExit(f"unexpected Malachi chapter set: {sorted(chapters)}")
    chapter_three_numbers = sorted(map(int, chapters["3"]))
    if chapter_three_numbers[-6:] != [19, 20, 21, 22, 23, 24]:
        raise SystemExit("unexpected Hebrew Malachi 3 ending")

    chapter_three = {
        verse: text
        for verse, text in chapters["3"].items()
        if int(verse) <= 18
    }
    chapter_four = {
        str(int(verse) - 18): text
        for verse, text in chapters["3"].items()
        if int(verse) >= 19
    }
    book["chapters"] = {
        "1": chapters["1"],
        "2": chapters["2"],
        "3": chapter_three,
        "4": chapter_four,
    }
    save_book(manifest, "MAL", book_info, chunk_info, chunk_path, payload)
    return True


def refresh_totals(manifest: dict) -> None:
    validation = manifest["validation"]
    validation["chapters"] = sum(
        int(info["chapters"]) for info in manifest["books"].values()
    )
    validation["verseMarkers"] = sum(
        int(info["verses"]) for info in manifest["books"].values()
    )
    validation["gzipBytes"] = sum(
        int(info["gzipBytes"]) for info in manifest["books"].values()
    )


def write_remaps() -> None:
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    joel_changed = remap_joel(manifest)
    malachi_changed = remap_malachi(manifest)
    refresh_totals(manifest)
    MANIFEST_PATH.write_text(
        json.dumps(manifest, ensure_ascii=False, separators=(",", ":")) + "\n",
        encoding="utf-8",
    )
    changed = [
        name
        for name, status in (("요엘", joel_changed), ("말라기", malachi_changed))
        if status
    ]
    print("절수 체계 변환 완료: " + (", ".join(changed) if changed else "이미 정규화됨"))


def validate() -> None:
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))

    _, _, _, joel_payload = load_book(manifest, "JOL")
    joel = joel_payload["books"]["JOL"]["chapters"]
    if set(joel) != {"1", "2", "3"}:
        raise SystemExit("Joel remap did not produce three chapters")
    if sorted(map(int, joel["2"]))[-5:] != [28, 29, 30, 31, 32]:
        raise SystemExit("Joel 2:28-32 bridge is missing")
    if len(joel["3"]) != 21:
        raise SystemExit("Joel 3 must contain 21 verses")

    _, _, _, malachi_payload = load_book(manifest, "MAL")
    malachi = malachi_payload["books"]["MAL"]["chapters"]
    if set(malachi) != {"1", "2", "3", "4"}:
        raise SystemExit("Malachi remap did not produce four chapters")
    if len(malachi["3"]) != 18 or len(malachi["4"]) != 6:
        raise SystemExit("Malachi 3/4 verse split is invalid")

    print("절수 체계 검증 완료: 요엘 3장 · 말라기 4장")


def main() -> None:
    parser = argparse.ArgumentParser()
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--write", action="store_true")
    mode.add_argument("--check", action="store_true")
    args = parser.parse_args()
    if args.write:
        write_remaps()
    validate()


if __name__ == "__main__":
    main()
