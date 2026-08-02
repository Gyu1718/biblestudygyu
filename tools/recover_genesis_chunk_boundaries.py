#!/usr/bin/env python3
"""Recover exact overlap/gap defects at Genesis payload fragment boundaries."""
from __future__ import annotations

import base64
import gzip
import itertools
import json
import string
from datetime import datetime, timezone
from pathlib import Path

from recover_genesis_payloads import GENESIS, decode_html, load_payload, write_recovered

ROOT = Path(__file__).resolve().parents[1]
REPORT = ROOT / "tools" / "genesis-boundary-recovery-report.json"
ALPHABET = string.ascii_uppercase + string.ascii_lowercase + string.digits + "+/"


def longest_overlap(left: str, right: str, limit: int = 3000) -> int:
    maximum = min(len(left), len(right), limit)
    for size in range(maximum, 0, -1):
        if left[-size:] == right[:size]:
            return size
    return 0


def collapse_exact_overlaps(chunks: list[str]) -> tuple[str, list[int]]:
    if not chunks:
        return "", []
    merged = chunks[0]
    overlaps: list[int] = []
    for chunk in chunks[1:]:
        overlap = longest_overlap(merged, chunk)
        overlaps.append(overlap)
        merged += chunk[overlap:]
    return merged, overlaps


def html_from_raw(raw: bytes) -> str | None:
    try:
        text = gzip.decompress(raw).decode("utf-8")
    except Exception:
        return None
    head = text[:1500].lower()
    if "<html" not in head and "<!doctype" not in head:
        return None
    return text


def decode_fragment(fragment: str) -> bytes | None:
    try:
        return base64.b64decode(fragment, validate=True)
    except Exception:
        return None


def recover_independent_fragments(chunks: list[str]) -> tuple[str, dict[str, object]] | None:
    broken = [index for index, chunk in enumerate(chunks) if len(chunk) % 4]
    if len(broken) != 1:
        return None

    broken_index = broken[0]
    decoded: list[bytes | None] = []
    for index, chunk in enumerate(chunks):
        decoded.append(None if index == broken_index else decode_fragment(chunk))
    if any(item is None for index, item in enumerate(decoded) if index != broken_index):
        return None

    fragment = chunks[broken_index]
    padding_start = fragment.find("=")
    anchors = [len(fragment)]
    if padding_start >= 0:
        anchors.insert(0, padding_start)

    # First test whether internal padding was merely inserted by mistake.
    stripped = fragment.rstrip("=")
    required = (-len(stripped)) % 4
    stripped_candidate = stripped + ("=" * required)
    broken_bytes = decode_fragment(stripped_candidate)
    if broken_bytes is not None:
        raw = b"".join(
            broken_bytes if index == broken_index else item  # type: ignore[arg-type]
            for index, item in enumerate(decoded)
        )
        html = html_from_raw(raw)
        if html is not None:
            return html, {
                "method": "strip_internal_fragment_padding",
                "fragment": broken_index + 1,
            }

    missing = (-len(fragment)) % 4
    if missing != 2:
        return None

    positions: list[int] = []
    for anchor in anchors:
        for offset in range(-2, 3):
            position = anchor + offset
            if 0 <= position <= len(fragment) and position not in positions:
                positions.append(position)

    for position in positions:
        left, right = fragment[:position], fragment[position:]
        for first, second in itertools.product(ALPHABET, repeat=2):
            candidate = left + first + second + right
            broken_bytes = decode_fragment(candidate)
            if broken_bytes is None:
                continue
            raw = b"".join(
                broken_bytes if index == broken_index else item  # type: ignore[arg-type]
                for index, item in enumerate(decoded)
            )
            html = html_from_raw(raw)
            if html is not None:
                return html, {
                    "method": "insert_two_chars_then_decode_fragments",
                    "fragment": broken_index + 1,
                    "position": position,
                    "inserted": first + second,
                }
    return None


def recover_chapter(chapter: int) -> dict[str, object]:
    page, names, chunks = load_payload(chapter)
    report: dict[str, object] = {
        "files": names,
        "lengths": [len(chunk) for chunk in chunks],
    }

    collapsed, overlaps = collapse_exact_overlaps(chunks)
    report["exact_overlaps"] = overlaps
    if any(overlaps):
        html = decode_html(collapsed)
        if html is not None:
            write_recovered(page, names, html, True)
            report.update(
                {
                    "status": "recovered",
                    "method": "remove_exact_fragment_overlap",
                    "overlaps": overlaps,
                }
            )
            return report

    independent = recover_independent_fragments(chunks)
    if independent is not None:
        html, details = independent
        write_recovered(page, names, html, True)
        report.update({"status": "recovered", **details})
        return report

    report.update({"status": "unresolved"})
    return report


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
            chapters[str(chapter)] = recover_chapter(chapter)
        except Exception as exc:
            chapters[str(chapter)] = {"status": "error", "error": repr(exc)}

    REPORT.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
