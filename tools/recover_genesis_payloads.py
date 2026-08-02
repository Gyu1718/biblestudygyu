#!/usr/bin/env python3
"""Forensically recover damaged Genesis gzip/base64 study payloads.

The recovery is deterministic: a candidate is accepted only when Python's gzip
reader validates the complete deflate stream, CRC32, and original size, and the
result is a UTF-8 HTML document.
"""
from __future__ import annotations

import argparse
import base64
import gzip
import itertools
import json
import re
import string
import subprocess
import zlib
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GENESIS = ROOT / "ot" / "genesis"
REPORT = ROOT / "tools" / "genesis-payload-recovery-report.json"
ALPHABET = string.ascii_uppercase + string.ascii_lowercase + string.digits + "+/"


def payload_names(wrapper: str) -> list[str]:
    return re.findall(r"['\"]([^'\"]+\.b64)['\"]", wrapper)


def load_payload(chapter: int) -> tuple[Path, list[str], list[str]]:
    page = GENESIS / f"ch{chapter:02d}.html"
    wrapper = page.read_text(encoding="utf-8")
    names = payload_names(wrapper)
    chunks = [re.sub(r"\s+", "", (GENESIS / name).read_text(encoding="utf-8")) for name in names]
    return page, names, chunks


def decode_html(payload: str) -> str | None:
    try:
        raw = base64.b64decode(payload, validate=True)
        text = gzip.decompress(raw).decode("utf-8")
    except (ValueError, UnicodeDecodeError, gzip.BadGzipFile, EOFError, zlib.error):
        return None
    head = text[:1500].lower()
    if "<html" not in head and "<!doctype" not in head:
        return None
    return text


def write_recovered(page: Path, names: list[str], html: str, write: bool) -> None:
    if not write:
        return
    page.write_text(html.rstrip() + "\n", encoding="utf-8")
    for name in names:
        (GENESIS / name).unlink(missing_ok=True)


def scan_plain_git_objects(chapter: int) -> tuple[str, str] | None:
    title = f"창세기 {chapter}장 심층 연구".encode("utf-8")
    listing = subprocess.run(
        ["git", "cat-file", "--batch-all-objects", "--batch-check=%(objectname) %(objecttype) %(objectsize)"],
        cwd=ROOT,
        text=True,
        stdout=subprocess.PIPE,
        check=True,
    ).stdout.splitlines()

    for line in listing:
        sha, object_type, size_text = line.split()
        if object_type != "blob" or int(size_text) < 5000 or int(size_text) > 2_000_000:
            continue
        blob = subprocess.run(
            ["git", "cat-file", "blob", sha],
            cwd=ROOT,
            stdout=subprocess.PIPE,
            check=True,
        ).stdout
        if title not in blob or b"DecompressionStream" in blob:
            continue
        try:
            text = blob.decode("utf-8")
        except UnicodeDecodeError:
            continue
        if "<html" in text[:1500].lower() or "<!doctype" in text[:1500].lower():
            return text, sha
    return None


def fragment_diagnostics(names: list[str], chunks: list[str]) -> dict[str, object]:
    lengths = [len(chunk) for chunk in chunks]
    boundaries = list(itertools.accumulate(lengths))[:-1]
    return {
        "files": names,
        "fragment_lengths": lengths,
        "fragment_mod4": [length % 4 for length in lengths],
        "combined_length": sum(lengths),
        "combined_mod4": sum(lengths) % 4,
        "boundaries": boundaries,
    }


def recover_two_missing_chars(payload: str, boundaries: list[int]) -> tuple[str, str, int] | None:
    positions = []
    for boundary in boundaries:
        for offset in range(-2, 3):
            position = boundary + offset
            if 0 <= position <= len(payload) and position not in positions:
                positions.append(position)
    positions.extend(position for position in (0, len(payload)) if position not in positions)

    for position in positions:
        left, right = payload[:position], payload[position:]
        for first in ALPHABET:
            prefix = left + first
            for second in ALPHABET:
                inserted = first + second
                candidate = prefix + second + right
                html = decode_html(candidate)
                if html is not None:
                    return html, inserted, position
    return None


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


def recover_single_base64_error(payload: str, error_byte: int) -> tuple[str, int, str, str] | None:
    center = max(0, min(len(payload) - 1, error_byte * 4 // 3))
    positions = range(max(0, center - 48), min(len(payload), center + 49))
    for position in positions:
        original = payload[position]
        if original not in ALPHABET:
            continue
        for replacement in ALPHABET:
            if replacement == original:
                continue
            candidate = payload[:position] + replacement + payload[position + 1 :]
            html = decode_html(candidate)
            if html is not None:
                return html, position, original, replacement
    return None


def recover_adjacent_swap(payload: str, error_byte: int) -> tuple[str, int] | None:
    center = max(0, min(len(payload) - 2, error_byte * 4 // 3))
    for position in range(max(0, center - 48), min(len(payload) - 1, center + 49)):
        if payload[position] == payload[position + 1]:
            continue
        candidate = (
            payload[:position]
            + payload[position + 1]
            + payload[position]
            + payload[position + 2 :]
        )
        html = decode_html(candidate)
        if html is not None:
            return html, position
    return None


def recover_chapter(chapter: int, write: bool) -> dict[str, object]:
    page, names, chunks = load_payload(chapter)
    details = fragment_diagnostics(names, chunks)
    payload = "".join(chunks)

    historical = scan_plain_git_objects(chapter)
    if historical is not None:
        html, sha = historical
        write_recovered(page, names, html, write)
        details.update({"status": "recovered", "method": "plain_git_blob", "blob": sha})
        return details

    html = decode_html(payload)
    if html is not None:
        write_recovered(page, names, html, write)
        details.update({"status": "recovered", "method": "payload_already_valid"})
        return details

    if len(payload) % 4 == 2:
        result = recover_two_missing_chars(payload, details["boundaries"])  # type: ignore[arg-type]
        if result is not None:
            html, inserted, position = result
            write_recovered(page, names, html, write)
            details.update(
                {
                    "status": "recovered",
                    "method": "insert_two_base64_chars",
                    "inserted": inserted,
                    "position": position,
                }
            )
            return details

    try:
        raw = base64.b64decode(payload, validate=True)
    except ValueError as exc:
        details.update({"status": "unresolved", "error": str(exc)})
        return details

    error_byte, output_prefix_bytes = locate_deflate_error(raw)
    details["deflate_error_byte"] = error_byte
    details["output_prefix_bytes"] = output_prefix_bytes

    if error_byte is not None:
        replacement = recover_single_base64_error(payload, error_byte)
        if replacement is not None:
            html, position, original, corrected = replacement
            write_recovered(page, names, html, write)
            details.update(
                {
                    "status": "recovered",
                    "method": "replace_single_base64_char",
                    "position": position,
                    "original": original,
                    "corrected": corrected,
                }
            )
            return details

        swapped = recover_adjacent_swap(payload, error_byte)
        if swapped is not None:
            html, position = swapped
            write_recovered(page, names, html, write)
            details.update(
                {
                    "status": "recovered",
                    "method": "swap_adjacent_base64_chars",
                    "position": position,
                }
            )
            return details

    details.update({"status": "unresolved", "error": "deterministic recovery candidates exhausted"})
    return details


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--write", action="store_true")
    args = parser.parse_args()

    report: dict[str, object] = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "chapters": {},
    }
    chapters: dict[str, object] = report["chapters"]  # type: ignore[assignment]

    for chapter in (23, 24):
        page = GENESIS / f"ch{chapter:02d}.html"
        if "DecompressionStream" not in page.read_text(encoding="utf-8"):
            chapters[str(chapter)] = {"status": "already_plain"}
            continue
        try:
            chapters[str(chapter)] = recover_chapter(chapter, args.write)
        except Exception as exc:
            chapters[str(chapter)] = {"status": "error", "error": repr(exc)}

    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
