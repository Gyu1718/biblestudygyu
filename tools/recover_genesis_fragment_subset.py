#!/usr/bin/env python3
"""Find a valid order-preserving subset of Genesis payload fragments."""
from __future__ import annotations

import base64
import gzip
import itertools
import json
from datetime import datetime, timezone
from pathlib import Path

from recover_genesis_payloads import GENESIS, decode_html, load_payload, write_recovered

ROOT = Path(__file__).resolve().parents[1]
REPORT = ROOT / "tools" / "genesis-fragment-subset-report.json"


def html_from_bytes(raw: bytes) -> str | None:
    try:
        text = gzip.decompress(raw).decode("utf-8")
    except Exception:
        return None
    head = text[:1500].lower()
    if "<html" not in head and "<!doctype" not in head:
        return None
    return text


def try_continuous(selected: list[str]) -> tuple[str | None, str]:
    payload = "".join(selected)
    html = decode_html(payload)
    if html is not None:
        return html, "continuous_base64"

    normalized = [chunk.rstrip("=") if index < len(selected) - 1 else chunk for index, chunk in enumerate(selected)]
    payload = "".join(normalized).rstrip("=")
    payload += "=" * ((-len(payload)) % 4)
    html = decode_html(payload)
    if html is not None:
        return html, "continuous_base64_without_internal_padding"
    return None, ""


def try_independent(selected: list[str]) -> tuple[str | None, str]:
    decoded: list[bytes] = []
    for chunk in selected:
        try:
            decoded.append(base64.b64decode(chunk, validate=True))
        except Exception:
            return None, ""
    html = html_from_bytes(b"".join(decoded))
    return (html, "independent_base64_fragments") if html is not None else (None, "")


def recover(chapter: int) -> dict[str, object]:
    page, names, chunks = load_payload(chapter)
    details: dict[str, object] = {
        "files": names,
        "lengths": [len(chunk) for chunk in chunks],
        "tested_subsets": 0,
    }

    indices = range(len(chunks))
    # Prefer larger subsets, but require the gzip header fragment and final fragment.
    subsets: list[tuple[int, ...]] = []
    for size in range(len(chunks), 1, -1):
        for subset in itertools.combinations(indices, size):
            if subset[0] != 0 or subset[-1] != len(chunks) - 1:
                continue
            subsets.append(subset)

    for subset in subsets:
        selected = [chunks[index] for index in subset]
        details["tested_subsets"] = int(details["tested_subsets"]) + 1
        for strategy in (try_continuous, try_independent):
            html, method = strategy(selected)
            if html is None:
                continue
            write_recovered(page, names, html, True)
            details.update(
                {
                    "status": "recovered",
                    "method": method,
                    "included_fragments": [index + 1 for index in subset],
                    "excluded_fragments": [index + 1 for index in indices if index not in subset],
                }
            )
            return details

    details.update({"status": "unresolved"})
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
