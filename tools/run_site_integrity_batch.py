#!/usr/bin/env python3
"""Run site-integrity repairs independently and persist a machine-readable report.

A corrupt chapter must not prevent healthy chapters or the encyclopedia index
from being repaired and committed. Strict validation remains a separate step.
This file is also the explicit pull-request trigger for an idempotent repair batch.
"""
from __future__ import annotations

import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

import repair_site_integrity as repair

REPORT_PATH = repair.ROOT / "tools" / "site-integrity-report.json"


def restore_chapter(page_path: str) -> dict[str, str]:
    page = repair.ROOT / page_path
    current = page.read_text(encoding="utf-8")
    chapter = Path(page_path).stem

    if "decompressionstream" not in current.lower() and not repair.payload_files(current):
        return {"status": "already_plain", "source": "current"}

    decoded, commit, source_type = repair.newest_decodable_version(page_path)
    page.write_text(decoded.rstrip() + "\n", encoding="utf-8")

    for fragment in sorted(page.parent.glob(f"{chapter}.*.b64")):
        fragment.unlink()

    return {
        "status": "restored",
        "source": commit,
        "source_type": source_type,
    }


def rebuild_encyclopedia() -> dict[str, object]:
    result = subprocess.run(
        [sys.executable, str(repair.ENCYCLOPEDIA_BUILDER)],
        cwd=repair.ROOT,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )
    payload: dict[str, object] = {
        "status": "rebuilt" if result.returncode == 0 else "failed",
        "returncode": result.returncode,
        "output": result.stdout.strip(),
    }
    if result.returncode == 0:
        entries = json.loads(repair.ENCYCLOPEDIA_INDEX.read_text(encoding="utf-8"))
        payload["entries"] = len(entries)
        payload["ids"] = sorted(str(entry["id"]) for entry in entries)
    return payload


def main() -> None:
    report: dict[str, object] = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "chapters": {},
    }

    chapters: dict[str, object] = report["chapters"]  # type: ignore[assignment]
    for page_path in repair.CHAPTER_PATHS:
        try:
            chapters[page_path] = restore_chapter(page_path)
        except Exception as exc:  # preserve progress from other chapters
            chapters[page_path] = {
                "status": "unresolved",
                "error": str(exc),
            }

    report["encyclopedia"] = rebuild_encyclopedia()
    REPORT_PATH.write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    for page_path, outcome in chapters.items():
        print(f"{page_path}: {outcome}")
    print(f"encyclopedia: {report['encyclopedia']}")
    print(f"report: {REPORT_PATH.relative_to(repair.ROOT)}")


if __name__ == "__main__":
    main()
