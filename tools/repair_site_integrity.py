#!/usr/bin/env python3
"""Repair known static-site integrity problems.

Batch 1:
- Restore Genesis 21–25 from the newest decodable historical payload.
- Replace JavaScript gzip/base64 wrappers with plain HTML.
- Remove obsolete chapter payload fragments.
- Rebuild and validate the encyclopedia index from published Markdown sources.
"""
from __future__ import annotations

import argparse
import base64
import gzip
import json
import re
import subprocess
import sys
from pathlib import Path
from typing import Iterable

ROOT = Path(__file__).resolve().parents[1]
GENESIS_DIR = ROOT / "ot" / "genesis"
CHAPTER_PATHS = [f"ot/genesis/ch{chapter:02d}.html" for chapter in range(21, 26)]
ENCYCLOPEDIA_BUILDER = ROOT / "tools" / "build_encyclopedia_index.py"
ENCYCLOPEDIA_SOURCE = ROOT / "content" / "encyclopedia"
ENCYCLOPEDIA_INDEX = ROOT / "assets" / "data" / "encyclopedia" / "index.json"
REQUIRED_ENCYCLOPEDIA_IDS = {
    "jerusalem-wall-rebuilding",
    "levites",
    "high-priesthood",
    "second-temple",
    "judeans",
    "susa",
    "yehud",
}


def run_git(*args: str, check: bool = True) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["git", *args],
        cwd=ROOT,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=check,
    )


def git_show(commit: str, path: str) -> str | None:
    result = run_git("show", f"{commit}:{path}", check=False)
    if result.returncode != 0:
        return None
    return result.stdout


def unique(items: Iterable[str]) -> list[str]:
    seen: set[str] = set()
    output: list[str] = []
    for item in items:
        if item and item not in seen:
            seen.add(item)
            output.append(item)
    return output


def payload_files(wrapper: str) -> list[str]:
    return unique(re.findall(r"['\"]([^'\"]+\.b64)['\"]", wrapper))


def inline_payload(wrapper: str) -> str | None:
    match = re.search(
        r"\b(?:const|let|var)\s+b\s*=\s*(['\"])([A-Za-z0-9+/=\s]+?)\1",
        wrapper,
        flags=re.DOTALL,
    )
    return match.group(2) if match else None


def normalize_payload(payload: str) -> str:
    return re.sub(r"\s+", "", payload)


def decode_payload(payload: str) -> str:
    compact = normalize_payload(payload)
    if not compact or len(compact) % 4:
        raise ValueError(f"base64 length is not divisible by 4: {len(compact)}")
    compressed = base64.b64decode(compact, validate=True)
    decoded = gzip.decompress(compressed).decode("utf-8")
    lowered = decoded[:1000].lower()
    if "<html" not in lowered and "<!doctype" not in lowered:
        raise ValueError("decoded payload is not an HTML document")
    return decoded


def resolve_payload(commit: str, page_path: str, wrapper: str) -> tuple[str, str]:
    inline = inline_payload(wrapper)
    if inline:
        return decode_payload(inline), "inline gzip payload"

    fragments = payload_files(wrapper)
    if fragments:
        page_dir = Path(page_path).parent
        chunks: list[str] = []
        for fragment in fragments:
            fragment_path = (page_dir / fragment).as_posix()
            chunk = git_show(commit, fragment_path)
            if chunk is None:
                raise ValueError(f"missing payload fragment: {fragment_path}")
            chunks.append(chunk)
        return decode_payload("".join(chunks)), f"{len(fragments)} gzip payload fragments"

    lowered = wrapper[:1000].lower()
    if "<html" in lowered or "<!doctype" in lowered:
        if "decompressionstream" not in wrapper.lower() and len(wrapper) > 1000:
            return wrapper, "plain historical HTML"

    raise ValueError("no supported payload found")


def candidate_paths(page_path: str) -> list[str]:
    current = ROOT / page_path
    wrapper = current.read_text(encoding="utf-8")
    paths = [page_path]
    for fragment in payload_files(wrapper):
        paths.append((Path(page_path).parent / fragment).as_posix())
    return unique(paths)


def historical_commits(paths: list[str]) -> list[str]:
    result = run_git("rev-list", "--all", "--", *paths)
    return unique(result.stdout.splitlines())


def newest_decodable_version(page_path: str) -> tuple[str, str, str]:
    paths = candidate_paths(page_path)
    commits = historical_commits(paths)
    failures: list[str] = []

    for commit in commits:
        wrapper = git_show(commit, page_path)
        if wrapper is None:
            continue
        try:
            decoded, source_type = resolve_payload(commit, page_path, wrapper)
        except Exception as exc:  # keep scanning older history
            failures.append(f"{commit[:12]}: {exc}")
            continue
        return decoded, commit, source_type

    detail = "\n".join(failures[:12])
    raise RuntimeError(f"No decodable historical version for {page_path}.\n{detail}")


def restore_genesis_pages(write: bool) -> None:
    restored: list[tuple[str, str, str]] = []
    for page_path in CHAPTER_PATHS:
        page = ROOT / page_path
        current = page.read_text(encoding="utf-8")
        if "decompressionstream" not in current.lower() and not payload_files(current):
            restored.append((page_path, "current", "already plain HTML"))
            continue

        decoded, commit, source_type = newest_decodable_version(page_path)
        if write:
            page.write_text(decoded.rstrip() + "\n", encoding="utf-8")
        restored.append((page_path, commit[:12], source_type))

    if write:
        for fragment in sorted(GENESIS_DIR.glob("ch2[1-5].*.b64")):
            fragment.unlink()

    for page_path, commit, source_type in restored:
        print(f"restored {page_path}: {source_type} from {commit}")


def rebuild_encyclopedia_index(write: bool) -> None:
    if not write:
        return
    subprocess.run([sys.executable, str(ENCYCLOPEDIA_BUILDER)], cwd=ROOT, check=True)


def published_encyclopedia_ids() -> set[str]:
    try:
        import frontmatter  # type: ignore
    except ImportError as exc:
        raise RuntimeError("python-frontmatter is required for validation") from exc

    ids: set[str] = set()
    for path in sorted(ENCYCLOPEDIA_SOURCE.rglob("*.md")):
        post = frontmatter.load(path)
        if post.metadata.get("status", "draft") != "published":
            continue
        entry_id = post.metadata.get("id")
        if not entry_id:
            raise ValueError(f"published entry has no id: {path.relative_to(ROOT)}")
        ids.add(str(entry_id))
    return ids


def validate() -> None:
    errors: list[str] = []

    for page_path in CHAPTER_PATHS:
        text = (ROOT / page_path).read_text(encoding="utf-8")
        lowered = text.lower()
        if "decompressionstream" in lowered:
            errors.append(f"{page_path}: DecompressionStream wrapper remains")
        if payload_files(text):
            errors.append(f"{page_path}: payload fragment references remain")
        if "<html" not in lowered and "<!doctype" not in lowered:
            errors.append(f"{page_path}: not a recognizable HTML document")
        if len(text) < 5000:
            errors.append(f"{page_path}: unexpectedly small plain HTML ({len(text)} bytes)")

    leftovers = sorted(GENESIS_DIR.glob("ch2[1-5].*.b64"))
    if leftovers:
        errors.append("obsolete Genesis payload fragments remain: " + ", ".join(path.name for path in leftovers))

    source_ids = published_encyclopedia_ids()
    index_data = json.loads(ENCYCLOPEDIA_INDEX.read_text(encoding="utf-8"))
    index_ids = {str(entry["id"]) for entry in index_data}
    if source_ids != index_ids:
        missing = sorted(source_ids - index_ids)
        extra = sorted(index_ids - source_ids)
        errors.append(f"encyclopedia source/index mismatch; missing={missing}, extra={extra}")
    missing_required = sorted(REQUIRED_ENCYCLOPEDIA_IDS - index_ids)
    if missing_required:
        errors.append(f"required encyclopedia entries missing: {missing_required}")

    if errors:
        print("site integrity validation failed:", file=sys.stderr)
        for error in errors:
            print(f"  - {error}", file=sys.stderr)
        raise SystemExit(1)

    print(f"Genesis 21–25 are plain HTML; encyclopedia index contains {len(index_ids)} published entries.")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--write", action="store_true", help="write repaired files")
    args = parser.parse_args()

    restore_genesis_pages(write=args.write)
    rebuild_encyclopedia_index(write=args.write)
    validate()


if __name__ == "__main__":
    main()
