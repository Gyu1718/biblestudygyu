#!/usr/bin/env python3
"""content/encyclopedia/**/*.md frontmatter를 assets/data/encyclopedia/index.json으로 변환한다.

인물(person) 유형은 현재 사전 범위에서 제외한다. 다른 항목에 남아 있는
미게시 관계 ID는 경고 후 생성 인덱스에서 제외한다.
"""
from __future__ import annotations

import json
import pathlib
import sys

import frontmatter

ROOT = pathlib.Path(__file__).resolve().parents[1]
SRC = ROOT / "content" / "encyclopedia"
OUT = ROOT / "assets" / "data" / "encyclopedia" / "index.json"
TYPES = {"place", "people", "group", "institution", "object", "event", "concept", "text"}


def main() -> None:
    entries, errors, warnings, primary_map, seen = [], [], [], {}, set()
    for path in sorted(SRC.rglob("*.md")):
        post = frontmatter.load(path)
        meta = dict(post.metadata)
        meta["_path"] = str(path.relative_to(ROOT))
        if meta.get("status", "draft") != "published":
            continue
        if meta.get("type") == "person":
            warnings.append(f"[{meta['_path']}] person 유형 제외")
            continue
        entries.append(meta)

    ids = {entry.get("id") for entry in entries}
    for entry in entries:
        eid = entry.get("id")
        for field in ("id", "type", "name", "summary"):
            if not entry.get(field):
                errors.append(f"[{entry['_path']}] 필수 필드 누락: {field}")
        if entry.get("type") not in TYPES:
            errors.append(f"[{entry['_path']}] 알 수 없는 type: {entry.get('type')}")
        if eid in seen:
            errors.append(f"id 중복: {eid}")
        seen.add(eid)
        for term in (entry.get("match") or {}).get("primary", []):
            if term in primary_map and primary_map[term] != eid:
                errors.append(f"match.primary 충돌: '{term}' → {eid} vs {primary_map[term]}")
            primary_map[term] = eid
        for relation in entry.get("relations", []) or []:
            if relation not in ids:
                warnings.append(f"[{eid}] 미게시 관계 제외: {relation}")

    if errors:
        print("빌드 실패:")
        for error in errors:
            print("  -", error)
        sys.exit(1)

    output = []
    for entry in sorted(entries, key=lambda item: item["id"]):
        name = entry.get("name", {})
        output.append({
            "id": entry["id"],
            "type": entry["type"],
            "subtype": entry.get("subtype", ""),
            "level": entry.get("level", ""),
            "name": {key: name.get(key, "") for key in ("ko", "en", "original", "translit")},
            "match": {key: (entry.get("match") or {}).get(key, []) for key in ("primary", "contextual", "ignore", "search")},
            "line": entry["summary"]["line"],
            "hover": entry["summary"]["hover"],
            "refs": {key: (entry.get("refs") or {}).get(key, []) for key in ("primary", "key")},
            "relations": [relation for relation in (entry.get("relations", []) or []) if relation in ids],
            "sources": entry.get("sources", []) or [],
            "url": f"entry.html?id={entry['id']}",
        })

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8")
    if warnings:
        print("빌드 경고:")
        for warning in warnings:
            print("  -", warning)
    print(f"성서 지식사전 인덱스 생성: {len(output)}개")


if __name__ == "__main__":
    main()
