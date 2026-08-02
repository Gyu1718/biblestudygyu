#!/usr/bin/env python3
"""Replace the homepage's stale one-link noscript fallback."""
from __future__ import annotations

import argparse
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"
MARKER = "SCRIPTORIUM_CRAWLER_FALLBACK_V1"

FALLBACK = '''<noscript>
  <section class="crawler-fallback" aria-labelledby="crawlerFallbackTitle">
    <p class="crawler-kicker">Static archive navigation</p>
    <h2 id="crawlerFallbackTitle">자바스크립트 없이 연구 서가 열기</h2>
    <p>책별 서가와 핵심 도구는 정적 링크로 직접 열 수 있습니다.</p>
    <nav aria-label="정적 연구 서가">
      <a href="ot/genesis/index.html">창세기</a>
      <a href="ot/nehemiah/index.html">느헤미야</a>
      <a href="ot/esther/index.html">에스더</a>
      <a href="ot/psalms/index.html">시편</a>
      <a href="ot/hosea/index.html">호세아</a>
      <a href="ot/joel/index.html">요엘</a>
      <a href="ot/haggai/index.html">학개</a>
      <a href="nt/acts/index.html">사도행전</a>
      <a href="nt/romans/index.html">로마서</a>
      <a href="bible/original.html">원어·개역개정 성경읽기</a>
      <a href="lexicon/index.html">원어 사전</a>
      <a href="search/index.html">전체 검색</a>
    </nav>
  </section>
</noscript>'''

CSS = '''
/* SCRIPTORIUM_CRAWLER_FALLBACK_V1 */
.crawler-fallback{width:min(70rem,calc(100% - 2rem));margin:1.2rem auto 2.4rem;border:1px solid var(--line);border-radius:14px;background:var(--card);padding:1.25rem 1.35rem;color:var(--ink)}
.crawler-fallback .crawler-kicker{margin:0;color:var(--ochre);font:700 .66rem var(--sans);letter-spacing:.12em;text-transform:uppercase}.crawler-fallback h2{margin:.35rem 0;color:var(--lapis-deep);font-size:1.15rem}.crawler-fallback p{margin:.3rem 0 .8rem;color:var(--ink-soft);font-size:.8rem}.crawler-fallback nav{display:flex;flex-wrap:wrap;gap:.42rem}.crawler-fallback a{border:1px solid var(--line);border-radius:999px;padding:.42rem .68rem;color:var(--lapis);font:700 .68rem var(--sans);text-decoration:none}.crawler-fallback a:hover{border-color:var(--lapis);background:var(--lapis);color:#fff}
'''


def patch(text: str) -> str:
    if MARKER in text:
        return text
    patched, count = re.subn(r"<noscript\b[^>]*>.*?</noscript>", FALLBACK, text, count=1, flags=re.IGNORECASE | re.DOTALL)
    if count == 0:
        body = re.search(r"<body\b[^>]*>", text, flags=re.IGNORECASE)
        if not body:
            raise RuntimeError("index.html has no body element")
        patched = text[: body.end()] + "\n" + FALLBACK + text[body.end() :]
    if "</style>" not in patched:
        raise RuntimeError("index.html has no inline style block")
    patched = patched.replace("</style>", CSS + "</style>", 1)
    return patched


def validate(text: str) -> list[str]:
    errors: list[str] = []
    if text.count(MARKER) != 1:
        errors.append("crawler fallback marker count is not one")
    if text.count("<noscript") != 1:
        errors.append("expected exactly one noscript block")
    for path in (
        "ot/genesis/index.html", "ot/nehemiah/index.html", "ot/esther/index.html",
        "ot/psalms/index.html", "ot/hosea/index.html", "ot/joel/index.html",
        "ot/haggai/index.html", "nt/acts/index.html", "nt/romans/index.html",
        "bible/original.html", "lexicon/index.html", "search/index.html",
    ):
        if f'href="{path}"' not in text:
            errors.append(f"noscript fallback missing {path}")
    return errors


def main() -> None:
    parser = argparse.ArgumentParser()
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--write", action="store_true")
    mode.add_argument("--check", action="store_true")
    args = parser.parse_args()

    current = INDEX.read_text(encoding="utf-8")
    expected = patch(current)
    errors = validate(expected)
    if errors:
        raise SystemExit("\n".join(errors))
    if args.write:
        INDEX.write_text(expected, encoding="utf-8")
    elif current != expected:
        raise SystemExit("homepage crawler fallback is stale")
    print("정적 홈 탐색 검증 완료: 책 서가 9개 + 핵심 도구 3개")


if __name__ == "__main__":
    main()
