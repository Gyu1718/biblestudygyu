#!/usr/bin/env python3
"""Switch the parallel reader from runtime MorphHB XML parsing to local chunks."""
from __future__ import annotations

import argparse
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
READER = ROOT / "assets" / "js" / "original-reader.js"
PAGE = ROOT / "bible" / "original.html"
MARKER = "SCRIPTORIUM_LOCAL_OSHB_V1"


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
        '  var WLC_ROOT = "https://cdn.jsdelivr.net/npm/morphhb@2.0.2/wlc/";\n',
        '  var OSHB_DATA_ROOT = new URL("assets/data/bible/original/oshb/", siteRoot).href; // ' + MARKER + '\n'
        '  var OSHB_MANIFEST_URL = new URL("manifest.json", OSHB_DATA_ROOT).href;\n',
        "OSHB data root",
    )
    text = replace_once(
        text,
        '  var na28ManifestPromise = null;\n  var na28ChunkCache = new Map();\n',
        '  var na28ManifestPromise = null;\n  var na28ChunkCache = new Map();\n'
        '  var oshbManifestPromise = null;\n  var oshbChunkCache = new Map();\n',
        "OSHB caches",
    )

    load_na28_manifest = '''  function loadNa28Manifest() {
    if (!na28ManifestPromise) {
      na28ManifestPromise = loadJson(NA28_MANIFEST_URL, "NA28 목록을 불러오지 못했습니다.");
    }
    return na28ManifestPromise;
  }
'''
    load_manifests = load_na28_manifest + '''
  function loadOshbManifest() {
    if (!oshbManifestPromise) {
      oshbManifestPromise = loadJson(OSHB_MANIFEST_URL, "WLC/OSHB 목록을 불러오지 못했습니다.");
    }
    return oshbManifestPromise;
  }
'''
    text = replace_once(text, load_na28_manifest, load_manifests, "OSHB manifest loader")

    old_xml = '''  function loadWlcOshb(source) {
    return fetch(WLC_ROOT + source + ".xml", { credentials: "omit" }).then(function (response) {
      if (!response.ok) throw new Error("WLC/OSHB 원문을 불러오지 못했습니다.");
      return response.text();
    }).then(function (xmlText) {
      var xml = new DOMParser().parseFromString(xmlText, "application/xml");
      if (xml.querySelector("parsererror")) throw new Error("WLC/OSHB XML을 해석하지 못했습니다.");
      var chapters = {};
      xml.querySelectorAll("verse[osisID]").forEach(function (verse) {
        var parts = verse.getAttribute("osisID").split(".");
        var chapter = String(Number(parts[1]));
        var number = String(Number(parts[2]));
        chapters[chapter] = chapters[chapter] || {};
        chapters[chapter][number] = compactText(verse.textContent);
      });
      return chapters;
    });
  }
'''
    new_local = '''  function loadOshb(code) {
    return loadOshbManifest().then(function (manifest) {
      var bookInfo = manifest.books[code];
      if (!bookInfo) throw new Error("WLC/OSHB 책 정보를 찾지 못했습니다.");
      var chunkId = bookInfo.chunk;
      if (!oshbChunkCache.has(chunkId)) {
        var chunkInfo = manifest.chunks[chunkId];
        if (!chunkInfo) throw new Error("WLC/OSHB 압축 묶음 정보를 찾지 못했습니다.");
        var chunkUrl = new URL(chunkInfo.path, OSHB_DATA_ROOT).href;
        oshbChunkCache.set(chunkId, loadGzipJson(chunkUrl));
      }
      return oshbChunkCache.get(chunkId).then(function (chunk) {
        var book = chunk.books && chunk.books[code];
        if (!book || !book.chapters) throw new Error("WLC/OSHB 책 데이터를 찾지 못했습니다.");
        return book.chapters;
      });
    });
  }
'''
    text = replace_once(text, old_xml, new_local, "runtime XML loader")
    text = replace_once(
        text,
        '    if (book.testament === "OT") promise = loadWlcOshb(book.source);\n',
        '    if (book.testament === "OT") promise = loadOshb(code);\n',
        "OT original loader",
    )
    return text


def patch_page(text: str) -> str:
    if MARKER in text:
        return text
    old = '<footer class="or-footer">구약은 WLC/OSHB, 신약은 사용자 제공 NA28 변환 데이터를 사용합니다. 관주는 OpenBible.info Cross References(CC BY)를 한국어 약칭으로 변환한 참고 연결이며, 각 절 아래에서 펼쳐 볼 수 있습니다. <!-- SCRIPTORIUM_XREFS_V1 --></footer>'
    new = '<footer class="or-footer">구약은 MorphHB 2.0.2의 WLC/OSHB를 책별 로컬 gzip JSON으로 변환해 사용하고, 신약은 사용자 제공 NA28 변환 데이터를 사용합니다. 관주는 OpenBible.info Cross References(CC BY)를 한국어 약칭으로 변환한 참고 연결이며, 각 절 아래에서 펼쳐 볼 수 있습니다. <!-- SCRIPTORIUM_XREFS_V1 · ' + MARKER + ' --></footer>'
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
    required = (
        "OSHB_MANIFEST_URL",
        "loadOshbManifest",
        "loadOshb(code)",
        "oshbChunkCache",
        'new URL(chunkInfo.path, OSHB_DATA_ROOT)',
    )
    for needle in required:
        if needle not in reader:
            errors.append(f"original-reader.js missing {needle}")
    forbidden = (
        "cdn.jsdelivr.net/npm/morphhb",
        "loadWlcOshb",
        "new DOMParser",
        'response.text()',
    )
    for needle in forbidden:
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
