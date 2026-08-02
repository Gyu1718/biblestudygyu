#!/usr/bin/env python3
"""Recover missing base64 characters at a padded non-final fragment boundary."""
from __future__ import annotations

import itertools
import json
import string
from datetime import datetime, timezone
from pathlib import Path

from recover_genesis_payloads import GENESIS, decode_html, load_payload, write_recovered

ROOT = Path(__file__).resolve().parents[1]
REPORT = ROOT / "tools" / "genesis-boundary-gap-report.json"
ALPHABET = string.ascii_uppercase + string.ascii_lowercase + string.digits + "+/"


def recover(chapter: int) -> dict[str, object]:
    page, names, chunks = load_payload(chapter)
    details: dict[str, object] = {
        "files": names,
        "lengths": [len(chunk) for chunk in chunks],
        "tails": [chunk[-16:] for chunk in chunks],
    }

    padded_nonfinal = [
        index for index, chunk in enumerate(chunks[:-1]) if chunk.endswith("=")
    ]
    details["padded_nonfinal_fragments"] = [index + 1 for index in padded_nonfinal]
    if len(padded_nonfinal) != 1:
        details.update({"status": "unresolved", "error": "expected one padded non-final fragment"})
        return details

    index = padded_nonfinal[0]
    stripped = chunks[index].rstrip("=")
    removed = len(chunks[index]) - len(stripped)
    prefix = "".join(chunks[:index]) + stripped
    suffix = "".join(chunks[index + 1 :])
    missing = (-(len(prefix) + len(suffix))) % 4
    details.update(
        {
            "fragment": index + 1,
            "removed_padding": removed,
            "boundary_position": len(prefix),
            "missing_characters": missing,
            "candidate_count": len(ALPHABET) ** missing,
        }
    )

    if missing < 1 or missing > 3:
        details.update({"status": "unresolved", "error": "unsupported gap size"})
        return details

    for candidate_tuple in itertools.product(ALPHABET, repeat=missing):
        inserted = "".join(candidate_tuple)
        payload = prefix + inserted + suffix
        html = decode_html(payload)
        if html is None:
            continue
        write_recovered(page, names, html, True)
        details.update(
            {
                "status": "recovered",
                "method": "replace_nonfinal_padding_with_missing_chars",
                "inserted": inserted,
            }
        )
        return details

    details.update({"status": "unresolved", "error": "all boundary candidates exhausted"})
    return details


def main() -> None:
    result: dict[str, object] = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "chapters": {},
    }
    chapters: dict[str, object] = result["chapters"]  # type: ignore[assignment]

    for chapter in (23, 24):
        page = GENESIS / f"ch{chapter:02d}.html"
        if "DecompressionStream" not in page.read_text(encoding="utf-8"):
            chapters[str(chapter)] = {"status": "already_plain"}
            continue
        try:
            chapters[str(chapter)] = recover(chapter)
        except Exception as exc:
            chapters[str(chapter)] = {"status": "error", "error": repr(exc)}

    REPORT.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
