#!/usr/bin/env python3
"""Install the Joel study set into Gyu1718/biblestudygyu.

The installer is intentionally idempotent. It copies the HTML payload and updates
catalog/documentation files without replacing unrelated repository content.
"""
from __future__ import annotations

import argparse
import hashlib
import re
import shutil
import sys
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit

PACKAGE_ROOT = Path(__file__).resolve().parent
PAYLOAD_ROOT = PACKAGE_ROOT / "repo_files"
JOEL_SOURCE = PAYLOAD_ROOT / "ot" / "joel"
REQUIRED_REPO_FILES = (
    "catalog.js",
    "README.md",
    "AGENTS.md",
    "docs/BOOK_STUDY_MANUAL.md",
)
JOEL_HTML_FILES = ("index.html", "overview.html", "ch01.html", "ch02.html", "ch03.html")
INTEGRATION_DATE = "2026-07-28"

JOEL_CATALOG_BLOCK = '''        {
          id: "joel",
          path: "ot/joel/index.html",
          title: "요엘 연구 서가",
          original: "יוֹאֵל",
          script: "heb",
          meta: "표준형 서가 — 성경읽기 · 종합 개관 1편 · 장별 심층연구 3편 · 원어 연구 준비 중",
          desc: "메뚜기 재앙에서 여호와의 날, 회개, 영의 부어짐, 열방 심판까지 세 장을 절 단위로 주해했다. 책별 서가에서 성경읽기, 종합 개관과 장별 심층연구를 연결한다.",
          volumes: 4
        },
'''

README_ROW = "| 요엘 | 표준형 | 종합 개관, 1–3장 심층연구, 원어 연구 준비 중 |"
MANUAL_ROW = "| 요엘 | 표준형 | 활성 | 완성 | 1–3장 완성 | 미구현 |"
AGENT_ROW = "- `ot/joel/`"


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _attrs_dict(attrs: list[tuple[str, str | None]]) -> dict[str, str]:
    return {key: (value or "") for key, value in attrs}


class StudyHTMLParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.ids: list[str] = []
        self.hrefs: list[str] = []
        self.body_attrs: dict[str, str] = {}
        self.current_links: list[tuple[str, str]] = []
        self.chapter_jump_depth = 0
        self.site_nav_depth = 0
        self.disabled_status_texts: list[str] = []
        self._capture_status = False
        self._status_buffer: list[str] = []
        self._stack: list[tuple[str, dict[str, str]]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        data = _attrs_dict(attrs)
        self._stack.append((tag, data))
        if "id" in data:
            self.ids.append(data["id"])
        if tag == "a" and "href" in data:
            self.hrefs.append(data["href"])
            if self.chapter_jump_depth and data.get("aria-current") == "page":
                self.current_links.append((data["href"], ""))
        if tag == "body":
            self.body_attrs = data
        classes = set(data.get("class", "").split())
        if "chapter-jump" in classes:
            self.chapter_jump_depth += 1
        if "site-nav" in classes:
            self.site_nav_depth += 1
        if self.site_nav_depth and tag == "span" and "off" in classes and data.get("aria-disabled") == "true":
            self._capture_status = True
            self._status_buffer = []

    def handle_endtag(self, tag: str) -> None:
        if self._capture_status and tag == "span":
            self.disabled_status_texts.append("".join(self._status_buffer).strip())
            self._capture_status = False
        if self._stack:
            start_tag, data = self._stack.pop()
            classes = set(data.get("class", "").split())
            if "chapter-jump" in classes:
                self.chapter_jump_depth = max(0, self.chapter_jump_depth - 1)
            if "site-nav" in classes:
                self.site_nav_depth = max(0, self.site_nav_depth - 1)

    def handle_data(self, data: str) -> None:
        if self._capture_status:
            self._status_buffer.append(data)
        if self.chapter_jump_depth and self.current_links and not self.current_links[-1][1]:
            href, _ = self.current_links[-1]
            stripped = data.strip()
            if stripped:
                self.current_links[-1] = (href, stripped)


def parse_html(path: Path) -> StudyHTMLParser:
    parser = StudyHTMLParser()
    parser.feed(path.read_text(encoding="utf-8"))
    parser.close()
    return parser


def validate_payload() -> list[str]:
    errors: list[str] = []
    known_repo_targets = {
        "../../index.html",
        "../../bible/original.html",
        "../../assets/theme.css",
        "../../assets/app.css",
        "../../assets/css/bible-reader.css",
        "../../assets/css/book-shelf.css",
        "../../assets/app.js",
        "../../assets/js/bible-reader.js",
    }

    for filename in JOEL_HTML_FILES:
        path = JOEL_SOURCE / filename
        if not path.exists():
            errors.append(f"누락된 payload 파일: {path.relative_to(PACKAGE_ROOT)}")
            continue
        parser = parse_html(path)
        duplicates = sorted({value for value in parser.ids if parser.ids.count(value) > 1})
        if duplicates:
            errors.append(f"{filename}: 중복 id {duplicates}")

        id_set = set(parser.ids)
        for href in parser.hrefs:
            href = href.strip()
            if href.startswith("#") and href[1:] not in id_set:
                errors.append(f"{filename}: 존재하지 않는 앵커 {href}")
                continue
            parts = urlsplit(href)
            if parts.scheme or href.startswith("//") or href.startswith("mailto:"):
                continue
            target = parts.path
            if not target:
                continue
            local_target = target[2:] if target.startswith("./") else target
            if local_target in JOEL_HTML_FILES:
                if not (JOEL_SOURCE / local_target).exists():
                    errors.append(f"{filename}: 깨진 요엘 내부 링크 {href}")
            elif parts.path.startswith("../../") and parts.path not in known_repo_targets:
                errors.append(f"{filename}: 확인되지 않은 저장소 링크 {href}")

        required_assets = (
            "../../assets/theme.css",
            "../../assets/app.css",
            "../../assets/css/bible-reader.css",
            "../../assets/app.js",
            "../../assets/js/bible-reader.js",
        )
        markup = path.read_text(encoding="utf-8")
        for asset in required_assets:
            if asset not in markup:
                errors.append(f"{filename}: 공통 자산 누락 {asset}")

        if parser.body_attrs.get("data-book") != "joel":
            errors.append(f"{filename}: body data-book=joel 누락")
        if parser.body_attrs.get("data-root") != "../../":
            errors.append(f"{filename}: body data-root=../../ 누락")

    ch01_markup = (JOEL_SOURCE / "ch01.html").read_text(encoding="utf-8")
    if 'href="./ch03.html"' not in ch01_markup:
        errors.append("ch01.html: 3장 이동 링크가 활성화되지 않음")

    for chapter in (1, 2, 3):
        parser = parse_html(JOEL_SOURCE / f"ch{chapter:02d}.html")
        current_labels = [label for _, label in parser.current_links]
        if str(chapter) not in current_labels:
            errors.append(f"ch{chapter:02d}.html: aria-current 장 번호 불일치")
        if not any("원어 연구 준비 중" in text for text in parser.disabled_status_texts):
            errors.append(f"ch{chapter:02d}.html: 원어 연구 준비 상태 누락")

    return errors

def patch_catalog(text: str) -> str:
    text = re.sub(
        r'(updated:\s*")[0-9]{4}-[0-9]{2}-[0-9]{2}("\s*)',
        rf'\g<1>{INTEGRATION_DATE}\g<2>',
        text,
        count=1,
    )
    if 'id: "joel"' not in text:
        marker = '        {\n          id: "haggai",'
        if marker not in text:
            raise ValueError('catalog.js에서 haggai 삽입 기준점을 찾지 못했습니다.')
        text = text.replace(marker, JOEL_CATALOG_BLOCK + marker, 1)
    return text


def insert_after_line(text: str, startswith: str, new_line: str) -> str:
    if new_line in text:
        return text
    lines = text.splitlines()
    for index, line in enumerate(lines):
        if line.startswith(startswith):
            lines.insert(index + 1, new_line)
            suffix = "\n" if text.endswith("\n") else ""
            return "\n".join(lines) + suffix
    raise ValueError(f"삽입 기준 행을 찾지 못했습니다: {startswith}")


def patch_readme(text: str) -> str:
    return insert_after_line(text, "| 호세아 |", README_ROW)


def patch_agents(text: str) -> str:
    return insert_after_line(text, "- `ot/haggai/`", AGENT_ROW)


def patch_manual(text: str) -> str:
    text = re.sub(r'^> 적용일: .*$', f'> 적용일: {INTEGRATION_DATE}  ', text, count=1, flags=re.MULTILINE)
    text = re.sub(
        r'^> 표준형 적용 대상: .*$',
        '> 표준형 적용 대상: 느헤미야, 학개, 요엘, 로마서 및 앞으로 추가되는 일반 성경책 연구 세트  ',
        text,
        count=1,
        flags=re.MULTILINE,
    )
    return insert_after_line(text, "| 학개 |", MANUAL_ROW)


PATCHERS = {
    "catalog.js": patch_catalog,
    "README.md": patch_readme,
    "AGENTS.md": patch_agents,
    "docs/BOOK_STUDY_MANUAL.md": patch_manual,
}


def validate_repo_root(repo: Path) -> None:
    missing = [rel for rel in REQUIRED_REPO_FILES if not (repo / rel).is_file()]
    if missing:
        raise FileNotFoundError("저장소 루트 확인 실패. 누락: " + ", ".join(missing))


def expected_integration(repo: Path) -> dict[str, str]:
    expected: dict[str, str] = {}
    for rel, patcher in PATCHERS.items():
        path = repo / rel
        expected[rel] = patcher(path.read_text(encoding="utf-8"))
    return expected


def run_check(repo: Path) -> int:
    validate_repo_root(repo)
    errors = validate_payload()
    for filename in JOEL_HTML_FILES:
        source = JOEL_SOURCE / filename
        destination = repo / "ot" / "joel" / filename
        if not destination.exists():
            errors.append(f"저장소에 누락: ot/joel/{filename}")
        elif sha256(source) != sha256(destination):
            errors.append(f"payload와 다른 파일: ot/joel/{filename}")

    try:
        expected = expected_integration(repo)
    except ValueError as exc:
        errors.append(str(exc))
        expected = {}

    for rel, expected_text in expected.items():
        current = (repo / rel).read_text(encoding="utf-8")
        if current != expected_text:
            errors.append(f"통합 갱신 필요: {rel}")

    if errors:
        print("CHECK FAILED")
        for error in errors:
            print(f"- {error}")
        return 1
    print("CHECK PASSED: 요엘 연구 세트와 카탈로그 문서가 일치합니다.")
    return 0


def run_write(repo: Path) -> int:
    validate_repo_root(repo)
    payload_errors = validate_payload()
    if payload_errors:
        print("PAYLOAD VALIDATION FAILED", file=sys.stderr)
        for error in payload_errors:
            print(f"- {error}", file=sys.stderr)
        return 1

    changes: list[str] = []
    destination_dir = repo / "ot" / "joel"
    destination_dir.mkdir(parents=True, exist_ok=True)
    for filename in JOEL_HTML_FILES:
        source = JOEL_SOURCE / filename
        destination = destination_dir / filename
        before = destination.read_bytes() if destination.exists() else None
        after = source.read_bytes()
        if before != after:
            shutil.copy2(source, destination)
            changes.append(f"ot/joel/{filename}")

    for rel, patcher in PATCHERS.items():
        path = repo / rel
        before = path.read_text(encoding="utf-8")
        after = patcher(before)
        if before != after:
            path.write_text(after, encoding="utf-8", newline="\n")
            changes.append(rel)

    if changes:
        print("UPDATED")
        for rel in changes:
            print(f"- {rel}")
    else:
        print("NO CHANGES: 이미 동일한 상태입니다.")
    return run_check(repo)


def main() -> int:
    parser = argparse.ArgumentParser(description="요엘 연구 세트를 biblestudygyu 저장소에 통합합니다.")
    parser.add_argument("--repo", type=Path, required=True, help="biblestudygyu 로컬 저장소 루트")
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--write", action="store_true", help="파일을 복사하고 카탈로그/문서를 갱신")
    mode.add_argument("--check", action="store_true", help="현재 통합 상태만 검사")
    args = parser.parse_args()
    repo = args.repo.expanduser().resolve()
    return run_write(repo) if args.write else run_check(repo)


if __name__ == "__main__":
    raise SystemExit(main())
