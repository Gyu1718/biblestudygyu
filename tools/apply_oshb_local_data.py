#!/usr/bin/env python3
"""Switch the parallel reader from runtime MorphHB XML parsing to local chunks."""
from __future__ import annotations

import argparse
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
READER = ROOT / "assets" / "js" / "original-reader.js"
PAGE = ROOT / "bible" / "original.html"
MARKER = "SCRIPTORIUM_LOCAL_OSHB_V1"


def function_span(text: str, name: str) -> tuple[int, int]:
    match = re.search(rf"(?m)^\s*function\s+{re.escape(name)}\s*\([^)]*\)\s*\{{", text)
    if not match:
        raise RuntimeError(f"function {name} not found")
    brace = text.find("{", match.start())
    depth = 0
    quote: str | None = None
    escaped = False
    line_comment = False
    block_comment = False
    index = brace
    while index < len(text):
        char = text[index]
        next_char = text[index + 1] if index + 1 < len(text) else ""
        if line_comment:
            if char == "\n":
                line_comment = False
        elif block_comment:
            if char == "*" and next_char == "/":
                block_comment = False
                index += 1
        elif quote:
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == quote:
                quote = None
        else:
            if char == "/" and next_char == "/":
                line_comment = True
                index += 1
            elif char == "/" and next_char == "*":
                block_comment = True
                index += 1
            elif char in ('"', "'", "`"):
                quote = char
            elif char == "{":
                depth += 1
            elif char == "}":
                depth -= 1
                if depth == 0:
                    end = index + 1
                    while end < len(text) and text[end] in "\r\n":
                        end += 1
                    return match.start(), end
        index += 1
    raise RuntimeError(f"unterminated function {name}")


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if new in text:
        return text
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{label}: expected one replacement target, found {count}")
    return text.replace(old, new, 1)


def patch_reader(text: str) -> str:
    if MARKER in text:
        return text

    text = replace_once(
        text,
        '  var NA28_MANIFEST_URL = new URL("manifest.json", NA28_DATA_ROOT).href;\n',
        '  var NA28_MANIFEST_URL = new URL("manifest.json", NA28_DATA_ROOT).href;\n'
        '  var OSHB_DATA_ROOT = new URL("assets/data/bible/original/oshb/", siteRoot).href; // ' + MARKER + '\n'
        '  var OSHB_MANIFEST_URL = new URL("manifest.json", OSHB_DATA_ROOT).href;\n',
        "OSHB data root",
    )
    text = replace_once(
        text,
        '  var na28ChunkCache = new Map();\n',
        '  var na28ChunkCache = new Map();\n'
        '  var oshbManifestPromise = null;\n'
        '  var oshbChunkCache = new Map();\n',
        "OSHB caches",
    )

    start, end = function_span(text, "loadNa28Manifest")
    load_oshb_manifest = '''
  function loadOshbManifest() {
    if (!oshbManifestPromise) {
      oshbManifestPromise = loadJson(OSHB_MANIFEST_URL, "WLC/OSHB 목록을 불러오지 못했습니다.");
    }
    return oshbManifestPromise;
  }

'''
    text = text[:end] + load_oshb_manifest + text[end:]

    start, end = function_span(text, "loadWlcOshb")
    load_oshb = '''  function loadOshb(code) {
    return loadOshbManifest().then(function (manifest) {
      var info = manifest.books[code];
      if (!info) throw new Error("WLC/OSHB 성경책 정보를 찾지 못했습니다.");
      var chunkInfo = manifest.chunks[info.chunk];
      if (!chunkInfo) throw new Error("WLC/OSHB 압축 묶음 정보를 찾지 못했습니다.");
      return loadChunk(oshbChunkCache, OSHB_DATA_ROOT, chunkInfo, "WLC/OSHB 본문을 불러오지 못했습니다.");
    }).then(function (chunk) {
      var data = (chunk.books || chunk)[code];
      if (!data || !data.chapters) throw new Error("WLC/OSHB 본문이 없습니다.");
      return data.chapters;
    });
  }

'''
    text = text[:start] + load_oshb + text[end:]
    text = replace_once(
        text,
        '    var promise = book.testament === "OT" ? loadWlcOshb(book) : loadNa28(code);\n',
        '    var promise = book.testament === "OT" ? loadOshb(code) : loadNa28(code);\n',
        "OT original loader",
    )
    return text


def patch_page(text: str) -> str:
    if MARKER in text:
        return text
    old = "구약은 WLC/OSHB, 신약은 사용자 제공 NA28 변환 데이터를 사용합니다."
    new = "구약은 MorphHB 2.0.2의 WLC/OSHB를 책별 로컬 gzip JSON으로 변환해 사용하고, 신약은 사용자 제공 NA28 변환 데이터를 사용합니다. <!-- " + MARKER + " -->"
    return replace_once(text, old, new, "reader source footer")


def patched_files() -> dict[Path, str]:
    return {
        READER: patch_reader(READER.read_text(encoding="utf-8")),
        PAGE: patch_page(PAGE.read_text(encoding="utf-8")),
    }


def validate(files: dict[Path, str]) -> list[str]:
    errors: list[str] = []
    reader = files[READER]
    page = files[PAGE]
    for needle in (
        "OSHB_MANIFEST_URL",
        "loadOshbManifest",
        "loadOshb(code)",
        "oshbChunkCache",
        "OSHB_DATA_ROOT",
    ):
        if needle not in reader:
            errors.append(f"original-reader.js missing {needle}")
    for needle in (
        "cdn.jsdelivr.net/npm/morphhb",
        "loadWlcOshb",
        "new DOMParser",
    ):
        if needle in reader:
            errors.append(f"original-reader.js still contains runtime dependency: {needle}")
    if MARKER not in reader or MARKER not in page:
        errors.append("local OSHB marker missing")
    return errors


def main() -> None:
    parser = argparse.ArgumentParser()
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--write", action="store_true")
    mode.add_argument("--check", action="store_true")
    args = parser.parse_args()

    files = patched_files()
    errors = validate(files)
    if errors:
        raise SystemExit("\n".join(errors))

    if args.write:
        for path, text in files.items():
            path.write_text(text, encoding="utf-8")
    else:
        stale = [
            str(path.relative_to(ROOT))
            for path, expected in files.items()
            if path.read_text(encoding="utf-8") != expected
        ]
        if stale:
            raise SystemExit("local OSHB loader is stale: " + ", ".join(stale))

    print("히브리어 로더 검증 완료: 로컬 manifest + 책별 gzip JSON, 런타임 XML 없음")


if __name__ == "__main__":
    main()
