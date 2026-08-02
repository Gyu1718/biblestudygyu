#!/usr/bin/env python3
"""Remove invalid base64 padding from non-final Genesis payload fragments.

The recovered page is written only if the resulting continuous stream passes
base64 validation, complete gzip CRC/ISIZE validation, UTF-8 decoding, and HTML
recognition.
"""
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

from recover_genesis_payloads import GENESIS, decode_html, load_payload, write_recovered

ROOT = Path(__file__).resolve().parents[1]
REPORT = ROOT / "tools" / "genesis-internal-padding-report.json"


def recover(chapter: int) -> dict[str, object]:
    page, names, chunks = load_payload(chapter)
    details: dict[str, object] = {
        "files": names,
        "lengths": [len(chunk) for chunk in chunks],
        "padding_positions": [
            [index for index, char in enumerate(chunk) if char == "="]
            for chunk in chunks
        ],
        "heads": [chunk[:16] for chunk in chunks],
        "tails": [chunk[-16:] for chunk in chunks],
    }

    normalized = [chunk.rstrip("=") if index < len(chunks) - 1 else chunk for index, chunk in enumerate(chunks)]
    payload = "".join(normalized)
    payload = payload.rstrip("=")
    payload += "=" * ((-len(payload)) % 4)

    details["normalized_length"] = len(payload)
    details["normalized_mod4"] = len(payload) % 4
    details["removed_padding"] = [
        len(chunks[index]) - len(normalized[index])
        for index in range(len(chunks))
    ]

    html = decode_html(payload)
    if html is None:
        details.update({"status": "unresolved"})
        return details

    write_recovered(page, names, html, True)
    details.update({"status": "recovered", "method": "remove_nonfinal_padding"})
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
