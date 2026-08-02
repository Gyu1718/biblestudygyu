#!/usr/bin/env python3
"""Recover two missing base64 characters inside one independently decodable fragment."""
from __future__ import annotations

import base64
import gzip
import itertools
import json
import string
import zlib
from datetime import datetime, timezone
from pathlib import Path

from recover_genesis_payloads import GENESIS, load_payload, write_recovered

ROOT = Path(__file__).resolve().parents[1]
REPORT = ROOT / "tools" / "genesis-fragment-gap-report.json"
ALPHABET = string.ascii_uppercase + string.ascii_lowercase + string.digits + "+/"


def decode_fragment(fragment: str) -> bytes:
    return base64.b64decode(fragment, validate=True)


def html_from_raw(raw: bytes) -> str | None:
    try:
        text = gzip.decompress(raw).decode("utf-8")
    except Exception:
        return None
    head = text[:1500].lower()
    if "<html" not in head and "<!doctype" not in head:
        return None
    return text


def locate_deflate_error(raw: bytes) -> tuple[int | None, int]:
    stream = zlib.decompressobj(16 + zlib.MAX_WBITS)
    produced = 0
    for index, byte in enumerate(raw):
        try:
            produced += len(stream.decompress(bytes((byte,))))
        except zlib.error:
            return index, produced
    try:
        produced += len(stream.flush())
    except zlib.error:
        return len(raw), produced
    return None, produced


def recover(chapter: int) -> dict[str, object]:
    page, names, chunks = load_payload(chapter)
    details: dict[str, object] = {
        "files": names,
        "lengths": [len(chunk) for chunk in chunks],
        "mod4": [len(chunk) % 4 for chunk in chunks],
    }

    broken = [index for index, chunk in enumerate(chunks) if len(chunk) % 4]
    if len(broken) != 1:
        details.update({"status": "unresolved", "error": "expected one malformed fragment"})
        return details
    broken_index = broken[0]
    missing = (-len(chunks[broken_index])) % 4
    if missing != 2:
        details.update({"status": "unresolved", "error": f"expected two missing chars, got {missing}"})
        return details

    fixed_bytes: list[bytes | None] = []
    for index, chunk in enumerate(chunks):
        fixed_bytes.append(None if index == broken_index else decode_fragment(chunk))

    fragment = chunks[broken_index]
    padding_position = fragment.find("=")
    baseline_position = padding_position if padding_position >= 0 else len(fragment)
    baseline_fragment = fragment[:baseline_position] + ("A" * missing) + fragment[baseline_position:]
    baseline_bytes = decode_fragment(baseline_fragment)
    baseline_raw = b"".join(
        baseline_bytes if index == broken_index else item  # type: ignore[arg-type]
        for index, item in enumerate(fixed_bytes)
    )
    error_byte, output_prefix = locate_deflate_error(baseline_raw)
    raw_prefix_bytes = sum(len(item) for item in fixed_bytes[:broken_index] if item is not None)

    if error_byte is None:
        estimated_position = baseline_position
    else:
        local_error_byte = max(0, error_byte - raw_prefix_bytes)
        estimated_position = min(len(fragment), local_error_byte * 4 // 3)

    details.update(
        {
            "broken_fragment": broken_index + 1,
            "padding_position": padding_position,
            "baseline_insert_position": baseline_position,
            "deflate_error_byte": error_byte,
            "output_prefix_bytes": output_prefix,
            "raw_prefix_bytes": raw_prefix_bytes,
            "estimated_base64_position": estimated_position,
        }
    )

    positions: list[int] = []
    for radius in (64, 256, 1024):
        start = max(0, estimated_position - radius)
        end = min(len(fragment), estimated_position + radius + 1)
        for position in range(start, end):
            if position not in positions:
                positions.append(position)

    # Include exact chunk boundaries and the position immediately before padding.
    for position in (0, baseline_position, len(fragment)):
        if position not in positions:
            positions.append(position)

    tested = 0
    for position in positions:
        left, right = fragment[:position], fragment[position:]
        for chars in itertools.product(ALPHABET, repeat=missing):
            inserted = "".join(chars)
            candidate_fragment = left + inserted + right
            try:
                candidate_bytes = decode_fragment(candidate_fragment)
            except Exception:
                continue
            tested += 1
            raw = b"".join(
                candidate_bytes if index == broken_index else item  # type: ignore[arg-type]
                for index, item in enumerate(fixed_bytes)
            )
            html = html_from_raw(raw)
            if html is None:
                continue
            write_recovered(page, names, html, True)
            details.update(
                {
                    "status": "recovered",
                    "method": "insert_two_chars_inside_fragment",
                    "position": position,
                    "inserted": inserted,
                    "tested_candidates": tested,
                }
            )
            return details

    details.update(
        {
            "status": "unresolved",
            "error": "localized fragment candidates exhausted",
            "tested_candidates": tested,
            "tested_positions": len(positions),
            "position_min": min(positions),
            "position_max": max(positions),
        }
    )
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
