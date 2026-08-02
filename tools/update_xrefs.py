#!/usr/bin/env python3
"""Build cross-reference JSON for the books currently represented in the study library.

The source is OpenBible.info Cross References (CC-BY), distributed as a ZIP at:
https://a.openbible.info/data/cross-references.zip

Usage:
    python tools/update_xrefs.py --write
    python tools/update_xrefs.py --check
    python tools/update_xrefs.py --write --source /path/to/cross_references.txt
"""
from __future__ import annotations

import argparse
import collections
import json
import tempfile
import urllib.request
import zipfile
from pathlib import Path
from typing import Iterable, TextIO

from build_xrefs import KO, ORDER, ko_ref

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "data" / "xrefs"
INDEX_PATH = OUT_DIR / "index.json"
MANIFEST_PATH = ROOT / "assets" / "data" / "bible" / "kor" / "manifest.json"
SOURCE_URL = "https://a.openbible.info/data/cross-references.zip"

# OpenBible OSIS code -> site data key / Korean Bible code / display name
TARGETS = {
    "Gen": ("gen", "GEN", "창세기"),
    "Neh": ("neh", "NEH", "느헤미야"),
    "Esth": ("est", "EST", "에스더"),
    "Ps": ("psa", "PSA", "시편"),
    "Hos": ("hos", "HOS", "호세아"),
    "Joel": ("jol", "JOL", "요엘"),
    "Hag": ("hag", "HAG", "학개"),
    "Acts": ("act", "ACT", "사도행전"),
    "Rom": ("rom", "ROM", "로마서"),
}


def source_lines(source: Path | None) -> Iterable[str]:
    if source:
        if source.suffix.lower() == ".zip":
            with zipfile.ZipFile(source) as archive:
                with archive.open("cross_references.txt") as handle:
                    for raw in handle:
                        yield raw.decode("utf-8")
            return
        with source.open(encoding="utf-8") as handle:
            yield from handle
        return

    request = urllib.request.Request(
        SOURCE_URL,
        headers={"User-Agent": "biblestudygyu-xref-builder/1.0"},
    )
    with urllib.request.urlopen(request, timeout=60) as response:
        payload = response.read()
    with tempfile.TemporaryDirectory() as temp_dir:
        archive_path = Path(temp_dir) / "cross-references.zip"
        archive_path.write_bytes(payload)
        with zipfile.ZipFile(archive_path) as archive:
            with archive.open("cross_references.txt") as handle:
                for raw in handle:
                    yield raw.decode("utf-8")


def build(lines: Iterable[str]) -> dict[str, dict[str, dict[str, list[dict[str, int | str]]]]]:
    data = collections.defaultdict(
        lambda: collections.defaultdict(lambda: collections.defaultdict(list))
    )

    iterator = iter(lines)
    next(iterator, None)  # header
    for line in iterator:
        parts = line.rstrip("\n").split("\t")
        if len(parts) < 3:
            continue
        from_ref, to_ref, votes_text = parts[0], parts[1], parts[2]
        from_parts = from_ref.split(".")
        if len(from_parts) != 3 or from_parts[0] not in TARGETS:
            continue
        try:
            chapter = int(from_parts[1])
            verse = int(from_parts[2])
            votes = int(votes_text)
        except ValueError:
            continue

        target_book = to_ref.split(".", 1)[0].split("-", 1)[0]
        data[from_parts[0]][chapter][verse].append(
            (ko_ref(to_ref), votes, ORDER.get(target_book, 999))
        )

    output: dict[str, dict[str, dict[str, list[dict[str, int | str]]]]] = {}
    for osis, (site_key, _, _) in TARGETS.items():
        book_out: dict[str, dict[str, list[dict[str, int | str]]]] = {}
        for chapter in sorted(data[osis]):
            chapter_out: dict[str, list[dict[str, int | str]]] = {}
            for verse in sorted(data[osis][chapter]):
                refs = sorted(data[osis][chapter][verse], key=lambda item: (-item[1], item[2]))
                chapter_out[str(verse)] = [{"r": ref, "v": votes} for ref, votes, _ in refs]
            book_out[str(chapter)] = chapter_out
        output[site_key] = book_out
    return output


def expected_chapters() -> dict[str, int]:
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    return {
        site_key: int(manifest["books"][bible_code]["chapters"])
        for _, (site_key, bible_code, _) in TARGETS.items()
    }


def make_index(data: dict[str, dict]) -> dict[str, dict[str, int | str]]:
    expected = expected_chapters()
    index: dict[str, dict[str, int | str]] = {}
    by_site = {site_key: (osis, bible_code, name) for osis, (site_key, bible_code, name) in TARGETS.items()}
    for site_key in sorted(data):
        osis, bible_code, name = by_site[site_key]
        refs = sum(
            len(ref_list)
            for chapter in data[site_key].values()
            for ref_list in chapter.values()
        )
        verses = sum(len(chapter) for chapter in data[site_key].values())
        index[site_key] = {
            "ko": KO.get(osis, name),
            "name": name,
            "bibleCode": bible_code,
            "osis": osis,
            "chapters": len(data[site_key]),
            "expectedChapters": expected[site_key],
            "verses": verses,
            "refs": refs,
        }
    return index


def validate_payload(data: dict[str, dict], index: dict[str, dict]) -> list[str]:
    errors: list[str] = []
    expected = expected_chapters()
    required = {site_key for site_key, _, _ in TARGETS.values()}
    if set(data) != required:
        errors.append(f"book set mismatch: expected={sorted(required)} actual={sorted(data)}")
    if set(index) != required:
        errors.append(f"index set mismatch: expected={sorted(required)} actual={sorted(index)}")

    for site_key in sorted(required):
        chapters = data.get(site_key, {})
        if len(chapters) != expected[site_key]:
            errors.append(
                f"{site_key}: chapter coverage {len(chapters)}/{expected[site_key]}"
            )
        refs = sum(len(items) for chapter in chapters.values() for items in chapter.values())
        if refs <= 0:
            errors.append(f"{site_key}: no cross references")
        if index.get(site_key, {}).get("refs") != refs:
            errors.append(f"{site_key}: index ref count mismatch")
    return errors


def write_files(data: dict[str, dict], index: dict[str, dict]) -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for site_key, book_data in data.items():
        (OUT_DIR / f"{site_key}.json").write_text(
            json.dumps(book_data, ensure_ascii=False, separators=(",", ":")) + "\n",
            encoding="utf-8",
        )
    INDEX_PATH.write_text(
        json.dumps(index, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def load_existing() -> tuple[dict[str, dict], dict[str, dict]]:
    data: dict[str, dict] = {}
    for _, (site_key, _, _) in TARGETS.items():
        path = OUT_DIR / f"{site_key}.json"
        if path.exists():
            data[site_key] = json.loads(path.read_text(encoding="utf-8"))
    index = json.loads(INDEX_PATH.read_text(encoding="utf-8")) if INDEX_PATH.exists() else {}
    return data, index


def main() -> None:
    parser = argparse.ArgumentParser()
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--write", action="store_true")
    mode.add_argument("--check", action="store_true")
    parser.add_argument("--source", type=Path)
    args = parser.parse_args()

    if args.write:
        data = build(source_lines(args.source))
        index = make_index(data)
        errors = validate_payload(data, index)
        if errors:
            raise SystemExit("\n".join(errors))
        write_files(data, index)
    else:
        data, index = load_existing()
        errors = validate_payload(data, index)
        if errors:
            raise SystemExit("\n".join(errors))

    total_refs = sum(int(entry["refs"]) for entry in index.values())
    total_verses = sum(int(entry["verses"]) for entry in index.values())
    print(
        f"관주 데이터 검증 완료: {len(index)}권, {total_verses:,}절, {total_refs:,}개 연결"
    )
    for site_key, entry in index.items():
        print(
            f"  {site_key:4s} {entry['name']}: {entry['chapters']}장, "
            f"{entry['verses']:,}절, {entry['refs']:,}개"
        )


if __name__ == "__main__":
    main()
