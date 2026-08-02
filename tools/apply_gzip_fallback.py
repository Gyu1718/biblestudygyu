#!/usr/bin/env python3
"""Add a local fflate fallback to every gzip JSON reader.

Native DecompressionStream remains the fast path. Older browsers load the
vendored fflate UMD bundle only when a gzip file is requested.
"""
from __future__ import annotations

import argparse
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGETS = (
    ROOT / "assets" / "js" / "bible-reader.js",
    ROOT / "assets" / "js" / "original-reader.js",
)
VENDOR = ROOT / "assets" / "vendor" / "fflate.min.js"
LICENSE = ROOT / "assets" / "vendor" / "fflate.LICENSE.txt"
MARKER = "SCRIPTORIUM_GZIP_FALLBACK_V1"

REPLACEMENT = r'''  var gzipFallbackUrl = (function () { // SCRIPTORIUM_GZIP_FALLBACK_V1
    var current = document.currentScript && document.currentScript.src;
    return current ? new URL("../vendor/fflate.min.js", current).href : "assets/vendor/fflate.min.js";
  })();

  function loadFflateFallback() {
    if (window.fflate && typeof window.fflate.gunzipSync === "function") {
      return Promise.resolve(window.fflate);
    }
    if (window.__SCRIPTORIUM_FFLATE_PROMISE__) return window.__SCRIPTORIUM_FFLATE_PROMISE__;
    window.__SCRIPTORIUM_FFLATE_PROMISE__ = new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[data-scriptorium-fflate]');
      var script = existing || document.createElement("script");
      function ready() {
        if (window.fflate && typeof window.fflate.gunzipSync === "function") resolve(window.fflate);
        else reject(new Error("로컬 gzip 폴백을 초기화하지 못했습니다."));
      }
      script.addEventListener("load", ready, { once: true });
      script.addEventListener("error", function () {
        reject(new Error("로컬 gzip 폴백을 불러오지 못했습니다."));
      }, { once: true });
      if (!existing) {
        script.src = gzipFallbackUrl;
        script.defer = true;
        script.dataset.scriptoriumFflate = "";
        document.head.appendChild(script);
      } else if (window.fflate) {
        ready();
      }
    }).catch(function (error) {
      window.__SCRIPTORIUM_FFLATE_PROMISE__ = null;
      throw error;
    });
    return window.__SCRIPTORIUM_FFLATE_PROMISE__;
  }

  function gunzipText(buffer) {
    function fallback() {
      return loadFflateFallback().then(function (fflate) {
        var output = fflate.gunzipSync(new Uint8Array(buffer));
        return new TextDecoder("utf-8").decode(output);
      });
    }
    if (!("DecompressionStream" in window)) return fallback();
    try {
      var stream = new Blob([buffer]).stream().pipeThrough(new DecompressionStream("gzip"));
      return new Response(stream).text().catch(fallback);
    } catch (error) {
      return fallback();
    }
  }

  function decompressJson(response, errorMessage) {
    if (!response.ok) throw new Error(errorMessage || "압축 성경 데이터를 불러오지 못했습니다.");
    return response.arrayBuffer().then(gunzipText).then(function (text) {
      try {
        return JSON.parse(text);
      } catch (error) {
        throw new Error("압축 성경 데이터를 해석하지 못했습니다.");
      }
    });
  }
'''


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


def patch(text: str, path: Path) -> str:
    if MARKER in text:
        return text
    start, end = function_span(text, "decompressJson")
    return text[:start] + REPLACEMENT + text[end:]


def patched_files() -> dict[Path, str]:
    return {path: patch(path.read_text(encoding="utf-8"), path) for path in TARGETS}


def validate(files: dict[Path, str]) -> list[str]:
    errors: list[str] = []
    if not VENDOR.exists() or VENDOR.stat().st_size < 5_000:
        errors.append("assets/vendor/fflate.min.js missing or unexpectedly small")
    if not LICENSE.exists() or "MIT" not in LICENSE.read_text(encoding="utf-8", errors="ignore"):
        errors.append("fflate license file missing")
    for path, text in files.items():
        relative = path.relative_to(ROOT)
        for required in (
            MARKER,
            "loadFflateFallback",
            "gunzipSync",
            '"DecompressionStream" in window',
            "response.arrayBuffer()",
        ):
            if required not in text:
                errors.append(f"{relative}: missing {required}")
        if "최신 브라우저" in text:
            errors.append(f"{relative}: obsolete browser rejection remains")
        if text.count("function decompressJson") != 1:
            errors.append(f"{relative}: expected exactly one decompressJson")
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
        stale = [str(path.relative_to(ROOT)) for path, expected in files.items() if path.read_text(encoding="utf-8") != expected]
        if stale:
            raise SystemExit("gzip fallback is stale: " + ", ".join(stale))

    print("gzip 폴백 검증 완료: native DecompressionStream + local fflate")


if __name__ == "__main__":
    main()
