#!/usr/bin/env python3
"""분할된 성경 데이터를 책별 JSON과 manifest로 빌드한다."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "assets" / "data" / "bible" / "kor"
PARTS_DIR = DATA_DIR / "parts"

BOOKS = {
    "NEH": "느헤미야",
    "HOS": "호세아",
    "HAG": "학개",
}


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, payload) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(payload, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )


def build_split_book(code: str, name: str) -> Path:
    part_paths = sorted(PARTS_DIR.glob(f"{code}.part*.json"))
    if not part_paths:
        raise SystemExit(f"분할 데이터 없음: {code}")

    chapters: dict[str, dict[str, str]] = {}
    for part_path in part_paths:
        part = load_json(part_path)
        if not isinstance(part, dict):
            raise SystemExit(f"잘못된 데이터 형식: {part_path}")
        overlap = set(chapters).intersection(part)
        if overlap:
            raise SystemExit(
                f"중복 장 발견: {part_path} ({', '.join(sorted(overlap, key=int))})"
            )
        chapters.update(part)

    ordered_chapters = {
        chapter: chapters[chapter] for chapter in sorted(chapters, key=int)
    }
    output = {
        "code": code,
        "name": name,
        "translation": "개역개정",
        "chapters": ordered_chapters,
    }
    output_path = DATA_DIR / f"{code}.json"
    write_json(output_path, output)
    return output_path


def validate_book(path: Path, expected_code: str, expected_name: str) -> dict:
    data = load_json(path)
    if data.get("code") != expected_code:
        raise SystemExit(f"책 코드 불일치: {path}")
    if data.get("name") != expected_name:
        raise SystemExit(f"책 이름 불일치: {path}")
    chapters = data.get("chapters")
    if not isinstance(chapters, dict) or not chapters:
        raise SystemExit(f"장 데이터 없음: {path}")

    verse_count = 0
    for chapter, verses in chapters.items():
        if not str(chapter).isdigit() or not isinstance(verses, dict) or not verses:
            raise SystemExit(f"잘못된 장 데이터: {path} {chapter}")
        for verse, text in verses.items():
            if not str(verse).isdigit() or not isinstance(text, str) or not text.strip():
                raise SystemExit(f"잘못된 절 데이터: {path} {chapter}:{verse}")
            verse_count += 1

    return {
        "code": expected_code,
        "name": expected_name,
        "translation": data.get("translation", "개역개정"),
        "chapters": len(chapters),
        "verses": verse_count,
        "path": f"{expected_code}.json",
    }


def main() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    build_split_book("NEH", BOOKS["NEH"])

    manifest_books = []
    for code, name in BOOKS.items():
        path = DATA_DIR / f"{code}.json"
        if not path.exists():
            raise SystemExit(f"책 데이터 없음: {path}")
        manifest_books.append(validate_book(path, code, name))

    manifest = {
        "translation": "개역개정",
        "purpose": "학업·학술용 허가 범위 내 사용",
        "books": manifest_books,
    }
    write_json(DATA_DIR / "manifest.json", manifest)

    print("성경 데이터 빌드 완료")
    for book in manifest_books:
        print(
            f"- {book['name']} ({book['code']}): "
            f"{book['chapters']}장, {book['verses']}절"
        )


if __name__ == "__main__":
    main()
