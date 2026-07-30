#!/usr/bin/env python3
"""성서 지식사전 1차 확장 패키지의 형식과 관계 ID를 검증한다."""
from __future__ import annotations

import pathlib
import sys

try:
    import frontmatter
except ImportError:
    print("python-frontmatter가 필요합니다: pip install -r tools/requirements-encyclopedia.txt")
    raise

ROOT = pathlib.Path(__file__).resolve().parents[1]
SRC = ROOT / "content" / "encyclopedia"

EXPECTED = {
    "sheshbazzar",
    "susa",
    "yehud",
    "judeans",
    "levites",
    "high-priesthood",
    "second-temple",
    "jerusalem-wall-rebuilding",
}

VALID_TYPES = {
    "person", "place", "people", "group", "institution",
    "object", "event", "concept", "text",
}


def main() -> int:
    errors: list[str] = []
    entries: dict[str, tuple[pathlib.Path, dict]] = {}

    for path in sorted(SRC.rglob("*.md")):
        post = frontmatter.load(path)
        meta = dict(post.metadata)
        eid = meta.get("id")
        if eid:
            if eid in entries:
                errors.append(f"중복 ID: {eid}")
            entries[eid] = (path, meta)

    missing = sorted(EXPECTED - set(entries))
    if missing:
        errors.append("패키지 항목 누락: " + ", ".join(missing))

    for eid in sorted(EXPECTED & set(entries)):
        path, meta = entries[eid]
        for field in ("id", "type", "subtype", "level", "status", "name", "match", "summary", "refs"):
            if not meta.get(field):
                errors.append(f"[{path}] 필수 필드 누락: {field}")

        if meta.get("type") not in VALID_TYPES:
            errors.append(f"[{path}] 잘못된 type: {meta.get('type')}")

        if meta.get("status") != "published":
            errors.append(f"[{path}] status가 published가 아님")

        summary = meta.get("summary") or {}
        for field in ("line", "hover"):
            if not summary.get(field):
                errors.append(f"[{path}] summary.{field} 누락")

        match = meta.get("match") or {}
        for field in ("primary", "contextual", "ignore", "search"):
            if field not in match:
                errors.append(f"[{path}] match.{field} 누락")

        for relation in meta.get("relations", []) or []:
            if relation not in entries:
                errors.append(f"[{path}] 존재하지 않는 관계 ID: {relation}")

    if errors:
        print("검증 실패:")
        for error in errors:
            print(" -", error)
        return 1

    print(f"검증 통과: 패키지 8개 / 저장소 전체 {len(entries)}개 항목")
    return 0


if __name__ == "__main__":
    sys.exit(main())
