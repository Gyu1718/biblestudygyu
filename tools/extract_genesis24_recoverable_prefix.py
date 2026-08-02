#!/usr/bin/env python3
"""Extract the longest valid HTML prefix from the damaged Genesis 24 gzip stream."""
from __future__ import annotations

import base64
import json
import re
import zlib
from datetime import datetime, timezone
from pathlib import Path

from recover_genesis_payloads import ROOT, load_payload

OUTPUT = ROOT / "tools" / "genesis24-recoverable-prefix.html"
REPORT = ROOT / "tools" / "genesis24-prefix-report.json"


def decompress_prefix(raw: bytes) -> tuple[bytes, int | None, str | None]:
    stream = zlib.decompressobj(16 + zlib.MAX_WBITS)
    output = bytearray()
    for index, byte in enumerate(raw):
        try:
            output.extend(stream.decompress(bytes((byte,))))
        except zlib.error as exc:
            return bytes(output), index, str(exc)
    try:
        output.extend(stream.flush())
    except zlib.error as exc:
        return bytes(output), len(raw), str(exc)
    return bytes(output), None, None


def valid_utf8_prefix(data: bytes) -> str:
    while data:
        try:
            return data.decode("utf-8")
        except UnicodeDecodeError as exc:
            data = data[: exc.start]
    return ""


def assemble_baselines(chunks: list[str]) -> list[tuple[str, bytes]]:
    baselines: list[tuple[str, bytes]] = []

    # Decode each uploaded fragment independently, inserting neutral characters
    # only to make the malformed fourth fragment syntactically decodable.
    independent: list[bytes] = []
    for index, chunk in enumerate(chunks):
        candidate = chunk
        if len(candidate) % 4:
            padding = candidate.find("=")
            position = padding if padding >= 0 else len(candidate)
            candidate = candidate[:position] + ("A" * ((-len(candidate)) % 4)) + candidate[position:]
        independent.append(base64.b64decode(candidate, validate=True))
    baselines.append(("independent_with_neutral_gap", b"".join(independent)))

    # Treat the fragments as one continuous base64 stream after removing
    # non-final padding.
    normalized = [chunk.rstrip("=") if index < len(chunks) - 1 else chunk for index, chunk in enumerate(chunks)]
    payload = "".join(normalized).rstrip("=")
    payload += "=" * ((-len(payload)) % 4)
    try:
        baselines.append(("continuous_without_internal_padding", base64.b64decode(payload, validate=True)))
    except Exception:
        pass

    # Test each competing tail independently after the common first 3 chunks.
    for tail_index in (3, 4):
        payload = "".join(chunks[:3] + [chunks[tail_index]])
        try:
            baselines.append((f"common_prefix_plus_fragment_{tail_index + 1}", base64.b64decode(payload, validate=True)))
        except Exception:
            pass

    return baselines


def main() -> None:
    _, names, chunks = load_payload(24)
    candidates: list[dict[str, object]] = []
    best_text = ""
    best_name = ""

    for name, raw in assemble_baselines(chunks):
        prefix, error_byte, error = decompress_prefix(raw)
        text = valid_utf8_prefix(prefix)
        candidates.append(
            {
                "name": name,
                "compressed_bytes": len(raw),
                "output_bytes": len(prefix),
                "utf8_characters": len(text),
                "error_byte": error_byte,
                "error": error,
                "sections": len(re.findall(r"<section\\b", text, flags=re.IGNORECASE)),
                "articles": len(re.findall(r"<article\\b", text, flags=re.IGNORECASE)),
                "last_heading": (re.findall(r"<h[1-6][^>]*>.*?</h[1-6]>", text, flags=re.IGNORECASE | re.DOTALL) or [""])[-1][-500:],
                "tail": text[-3000:],
            }
        )
        if len(text) > len(best_text):
            best_text = text
            best_name = name

    OUTPUT.write_text(best_text, encoding="utf-8")
    report = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "files": names,
        "best_candidate": best_name,
        "best_characters": len(best_text),
        "candidates": candidates,
    }
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
