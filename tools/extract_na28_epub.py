#!/usr/bin/env python3
"""Convert the user-provided structured NA28 EPUB into lazy-loaded verse JSON chunks.

The script extracts the running Greek text only. It intentionally excludes the
critical apparatus, outer-margin references, Eusebian material, and bundled fonts.
"""
from __future__ import annotations

import argparse
import gzip
import hashlib
import json
import re
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

TEXT_FILE_RE = re.compile(r"^OEBPS/Text/(\d{2})Text(\d+)\.xhtml$")
VERSE_ID_RE = re.compile(r"^v(\d{2})(\d{3})(\d{3})$")

BOOKS = [
    ("MAT", "마태복음", 40), ("MRK", "마가복음", 41), ("LUK", "누가복음", 42),
    ("JHN", "요한복음", 43), ("ACT", "사도행전", 44), ("ROM", "로마서", 45),
    ("1CO", "고린도전서", 46), ("2CO", "고린도후서", 47), ("GAL", "갈라디아서", 48),
    ("EPH", "에베소서", 49), ("PHP", "빌립보서", 50), ("COL", "골로새서", 51),
    ("1TH", "데살로니가전서", 52), ("2TH", "데살로니가후서", 53),
    ("1TI", "디모데전서", 54), ("2TI", "디모데후서", 55), ("TIT", "디도서", 56),
    ("PHM", "빌레몬서", 57), ("HEB", "히브리서", 58), ("JAS", "야고보서", 59),
    ("1PE", "베드로전서", 60), ("2PE", "베드로후서", 61),
    ("1JN", "요한일서", 62), ("2JN", "요한이서", 63), ("3JN", "요한삼서", 64),
    ("JUD", "유다서", 65), ("REV", "요한계시록", 66),
]

NUMBER_TO_BOOK = {number: (code, name) for code, name, number in BOOKS}
CHUNKS = {
    "nt-gospels": [code for code, _, number in BOOKS if number <= 43],
    "nt-acts-paul": [code for code, _, number in BOOKS if 44 <= number <= 57],
    "nt-general": [code for code, _, number in BOOKS if 58 <= number <= 65],
    "nt-revelation": ["REV"],
}


def normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def classes(element: ET.Element) -> set[str]:
    return set((element.attrib.get("class") or "").split())


def extract(epub_path: Path) -> dict[str, dict]:
    books = {
        code: {"code": code, "name": name, "source": "NA28", "chapters": {}}
        for code, name, _ in BOOKS
    }

    with zipfile.ZipFile(epub_path) as archive:
        files: list[tuple[int, int, str]] = []
        for name in archive.namelist():
            match = TEXT_FILE_RE.match(name)
            if match:
                files.append((int(match.group(1)), int(match.group(2)), name))
        files.sort()

        current: tuple[str, int, int] | None = None
        previous_prefix: int | None = None

        for prefix, _part, name in files:
            if prefix != previous_prefix:
                current = None
                previous_prefix = prefix

            root = ET.fromstring(archive.read(name))
            for element in root.iter():
                element_id = element.attrib.get("id", "")
                verse_match = VERSE_ID_RE.match(element_id)
                element_classes = classes(element)

                if verse_match and ({"greek-verse-num", "greek-chapter-num"} & element_classes):
                    book_number, chapter, verse = map(int, verse_match.groups())
                    if book_number in NUMBER_TO_BOOK:
                        code, _ = NUMBER_TO_BOOK[book_number]
                        current = (code, chapter, verse)
                        books[code]["chapters"].setdefault(str(chapter), {}).setdefault(str(verse), "")

                if current and ({"greek-text", "greek-italics"} & element_classes):
                    code, chapter, verse = current
                    books[code]["chapters"][str(chapter)][str(verse)] += "".join(element.itertext())

    for book in books.values():
        normalized_chapters: dict[str, dict[str, str]] = {}
        for chapter, verses in sorted(book["chapters"].items(), key=lambda item: int(item[0])):
            normalized_verses = {
                verse: normalize(text)
                for verse, text in sorted(verses.items(), key=lambda item: int(item[0]))
                if normalize(text)
            }
            if normalized_verses:
                normalized_chapters[chapter] = normalized_verses
        book["chapters"] = normalized_chapters

    return books


def write_package(output: Path, books: dict[str, dict]) -> None:
    output.mkdir(parents=True, exist_ok=True)
    chunk_dir = output / "chunks"
    chunk_dir.mkdir(exist_ok=True)

    chapter_total = sum(len(book["chapters"]) for book in books.values())
    verse_total = sum(len(verses) for book in books.values() for verses in book["chapters"].values())
    if len(books) != 27 or chapter_total != 260 or verse_total != 7941:
        raise RuntimeError(
            f"NA28 validation failed: books={len(books)}, chapters={chapter_total}, verses={verse_total}"
        )

    manifest = {
        "source": "Nestle-Aland Novum Testamentum Graece, 28th Revised Edition (user-provided licensed EPUB)",
        "edition": "NA28",
        "books": {},
        "chunks": {},
        "validation": {"books": 27, "chapters": 260, "verse_markers": 7941},
        "notes": {
            "apparatus_included": False,
            "outer_margin_included": False,
            "versification": "NA28 verse markers; compare against Korean Bible with exception map",
        },
    }

    for chunk_name, codes in CHUNKS.items():
        path = chunk_dir / f"{chunk_name}.json.gz"
        payload = {"source": "NA28", "books": {code: books[code] for code in codes}}
        with gzip.open(path, "wt", encoding="utf-8", compresslevel=9) as handle:
            json.dump(payload, handle, ensure_ascii=False, separators=(",", ":"))
        manifest["chunks"][chunk_name] = {
            "path": f"chunks/{path.name}",
            "books": codes,
            "bytes": path.stat().st_size,
        }

    for code, name, number in BOOKS:
        book = books[code]
        verse_count = sum(len(verses) for verses in book["chapters"].values())
        chunk_name = next(name for name, codes in CHUNKS.items() if code in codes)
        manifest["books"][code] = {
            "name": name,
            "number": number,
            "chunk": chunk_name,
            "chapters": len(book["chapters"]),
            "verses": verse_count,
        }

    manifest_path = output / "manifest.json"
    manifest_path.write_text(
        json.dumps(manifest, ensure_ascii=False, separators=(",", ":")), encoding="utf-8"
    )

    package_files = [manifest_path, *sorted(chunk_dir.glob("*.json.gz"))]
    checksums = [
        f"{hashlib.sha256(path.read_bytes()).hexdigest()}  {path.relative_to(output)}"
        for path in package_files
    ]
    (output / "SHA256SUMS.txt").write_text("\n".join(checksums) + "\n", encoding="utf-8")

    print(f"NA28 package: 27 books, {chapter_total} chapters, {verse_total} verse markers")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("epub", type=Path, help="Path to the user-provided structured NA28 EPUB")
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("assets/data/bible/original/na28"),
        help="Output directory for manifest.json and compressed chunks",
    )
    args = parser.parse_args()

    if not args.epub.is_file():
        raise SystemExit(f"EPUB not found: {args.epub}")
    write_package(args.output, extract(args.epub))


if __name__ == "__main__":
    main()
