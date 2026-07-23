# Bible Reader Development Handoff

> Repository: `Gyu1718/biblestudygyu`  
> Primary branch: `main`  
> Last updated: 2026-07-23  
> Scope: Korean Bible explorer, automatic Scripture-reference previews, and original-language parallel reader

## 1. Project goal

This project adds shared Bible-reading tools to every biblical research page in the static GitHub Pages site.

The intended user experience is:

1. Scripture references such as `학개 1:5–6`, `느 2:1–8`, and `롬 8:28` are detected automatically.
2. Hovering over a detected reference displays a short Korean Bible preview.
3. Clicking the reference opens the right-side Bible explorer without leaving the study page.
4. The explorer supports direct reference lookup and full-text search across all 66 books.
5. Every study page receives a left-sidebar `원어성경 보기 ↗` button.
6. The original-language page opens in a new tab and displays the original text on the left and the Korean Revised Version on the right, aligned verse by verse.
7. Newly added study HTML pages should inherit the shared reader automatically.

## 2. Critical source-status clarification

### Korean Bible

The Korean Bible corpus is derived from the user-provided and academically licensed EPUB:

- `성경전서 개역개정판 - 2018.10.10.epub`

The repository must not crawl, scrape, or automatically collect Korean Bible text from the Korean Bible Society website.

The runtime corpus is stored as a manifest and eight gzip-compressed lazy-loading chunks:

```text
assets/data/bible/kor/
├── manifest.json
└── chunks/
    ├── ot-pentateuch.json.gz
    ├── ot-history.json.gz
    ├── ot-wisdom.json.gz
    ├── ot-prophets.json.gz
    ├── nt-gospels-acts.json.gz
    ├── nt-paul.json.gz
    ├── nt-general.json.gz
    └── nt-revelation.json.gz
```

Expected validation totals:

- 66 books
- 1,189 chapters
- 31,102 verses

The data is used only within the user's academic and scholarly permission scope.

### Original-language Bible: current implementation is temporary

The current original-language reader does **not** yet use the user-provided BHS and NA28 EPUB files.

Current temporary sources in `assets/js/original-reader.js` are:

- Old Testament: WLC/OSHB data loaded from `morphhb` through jsDelivr
- New Testament: SBLGNT data loaded from the Faithlife GitHub repository through jsDelivr

The interface labels these sources as `WLC / OSHB` and `SBLGNT`.

The intended final sources are the user-provided and academically licensed files:

- `Biblia Hebraica Stuttgartensia BHS (1).epub`
- `NA28.epub`

A future developer must not claim that BHS or NA28 is currently displayed until those EPUB files have been converted, validated, packaged, and connected to the reader.

## 3. Important limitation of the supplied BHS and NA28 EPUBs

The supplied BHS and NA28 EPUBs were inspected during development.

They are page-oriented Internet Archive OCR EPUBs rather than clean verse-structured Bible databases. Their pages do not reliably separate:

- biblical text
- book, chapter, and verse identifiers
- critical apparatus
- page furniture and OCR artifacts

The BHS OCR, in particular, showed substantial Hebrew recognition corruption in sampled pages. NA28 pages also combine biblical text and critical apparatus without a dependable semantic structure.

Therefore, converting these EPUBs must be treated as a text-critical data conversion project, not as simple HTML extraction.

Required safeguards:

1. Preserve the original EPUB files as immutable source artifacts.
2. Build a conversion script that outputs a normalized verse-keyed format.
3. Validate book, chapter, and verse coverage against a canonical versification table.
4. Perform manual sample checks across every biblical section.
5. Do not silently substitute WLC/OSHB or SBLGNT while labeling the result BHS or NA28.
6. Keep critical apparatus separate from the running biblical text.
7. Record any unresolved OCR readings and versification differences.

If a cleaner licensed BHS/NA28 source becomes available, such as XML, OSIS, USFM, Accordance export, Logos export, or another structured format, prefer it over OCR extraction.

## 4. Current repository architecture

### Shared Korean Bible explorer

```text
assets/js/bible-reader.js
assets/css/bible-reader.css
```

Responsibilities:

- recognize Korean Bible book names and abbreviations
- infer the current book and chapter from the page path or title
- convert detected references into interactive links
- open the right-side explorer
- show hover previews
- load only the required corpus chunk
- cache loaded chunks in browser memory
- search the entire Korean Bible only when full-text search is requested
- inject the original-language reader button into the left sidebar

### Korean Bible data

```text
assets/data/bible/kor/manifest.json
assets/data/bible/kor/chunks/*.json.gz
```

The manifest maps each book code to one of eight chunks. The explorer should never preload all 66 books on initial page load.

Expected lazy-loading behavior:

```text
Open a study page
└── Load shared CSS and JavaScript only

Hover over 학개 1:5
└── Load ot-prophets.json.gz once
    └── Reuse it for all prophetic-book references during the session

Run full-text search
└── Load and scan the eight chunks sequentially
```

### Original-language parallel reader

```text
bible/original.html
assets/js/original-reader.js
assets/css/original-reader.css
```

Current behavior:

- receives `book`, `chapter`, `verse`, and `end` through URL query parameters
- loads the matching Korean Bible book from the compressed corpus
- loads temporary original-language data from external WLC/OSHB or SBLGNT sources
- renders one row per verse
- displays original text in the left column and Korean text in the right column
- uses RTL direction for Hebrew
- highlights a selected verse or verse range

Example URL:

```text
/biblestudygyu/bible/original.html?book=HAG&chapter=1&verse=5&end=6
```

### Automatic application to study pages

```text
tools/apply_bible_reader.py
.github/workflows/bible-reader.yml
```

The tool scans:

```text
ot/**/*.html
nt/**/*.html
theology/**/*.html
```

It inserts the shared reader CSS and JavaScript tags when missing.

The workflow also validates the uploaded Korean Bible corpus when all 66 books and chunks are present.

## 5. Scripture-reference recognition rules

Supported examples should include:

```text
학개 1:5
학 1:5–6
느헤미야 2장
느 2:1–8
렘 25:11–12; 29:10
창 26:3; 사 41:10; 43:5
마 1:12
롬 8:28–30
```

Bare references such as `1:5–6` may be inferred only when the page context identifies the biblical book.

The parser must skip references inside:

```text
a
button
script
style
pre
code
textarea
input
select
option
nav
.bible-reader-ui
.hw
[data-no-scripture-link]
```

Do not convert unrelated number patterns such as years, bibliography dates, ratios, or table coordinates into Scripture links.

## 6. Performance requirements

The hover-preview feature is approved and should be retained.

It does not require hand-authoring each reference. References are detected by the shared parser, and text is loaded from the corpus only when requested.

Performance rules:

- do not embed Bible text inside every research HTML file
- do not load all 66 books at initial page load
- use the eight compressed chunks
- cache manifest, chunks, and books
- delay hover preview briefly to avoid accidental requests
- show at most three verses in the tooltip
- load all chunks only for full-text search
- cap visible search results, currently 100
- preserve mobile behavior by disabling hover tooltips and using the bottom-sheet explorer

## 7. Source and rights policy

The user stated that the supplied Korean Revised Version, BHS, and NA28 files may be used for the user's academic and scholarly work.

Development rules:

1. Use only files supplied by the user or sources explicitly approved by the user.
2. Do not scrape the Korean Bible Society website.
3. Do not download or replace the supplied licensed corpus through an unrelated public source.
4. Do not expose source EPUB files through the public site.
5. Publish only the transformed runtime data required by the reader.
6. Do not include font files in deliverables.
7. Preserve a note in generated data indicating academic and scholarly use.
8. Do not label WLC/OSHB as BHS or SBLGNT as NA28.

## 8. Priority work remaining

### Priority 1 — verify Korean Bible deployment

Confirm that these files exist on `main`:

```text
assets/data/bible/kor/manifest.json
assets/data/bible/kor/chunks/ot-pentateuch.json.gz
assets/data/bible/kor/chunks/ot-history.json.gz
assets/data/bible/kor/chunks/ot-wisdom.json.gz
assets/data/bible/kor/chunks/ot-prophets.json.gz
assets/data/bible/kor/chunks/nt-gospels-acts.json.gz
assets/data/bible/kor/chunks/nt-paul.json.gz
assets/data/bible/kor/chunks/nt-general.json.gz
assets/data/bible/kor/chunks/nt-revelation.json.gz
```

Validate totals and test references from every chunk.

### Priority 2 — replace temporary original-language sources

Create an internal original-language corpus path, for example:

```text
assets/data/bible/original/
├── manifest.json
├── bhs/
│   └── chunks/*.json.gz
└── na28/
    └── chunks/*.json.gz
```

Recommended normalized verse object:

```json
{
  "book": "HAG",
  "chapter": 1,
  "verse": 1,
  "text": "…",
  "apparatus": [],
  "source": "BHS",
  "reviewStatus": "verified"
}
```

Then update `assets/js/original-reader.js` so it loads these internal datasets rather than external CDNs.

### Priority 3 — original-language validation

Test at least:

- Genesis 1
- Psalm 1 and Psalm 119
- Isaiah 6
- Haggai 1
- Matthew 1
- Mark 16
- Romans 8
- Revelation 22

Also test passages where Hebrew/Greek versification differs from Korean Bible numbering.

### Priority 4 — user-interface refinement

- add a visible source badge: `BHS` or `NA28`
- allow whole chapter and selected-range modes
- keep original and Korean verses vertically synchronized
- support previous and next chapter navigation
- preserve the selected verse in the URL
- add mobile tabs or stacked verse pairs
- later add morphology and parsing as a separate layer

## 9. Testing checklist

### Korean explorer

- `학개 1:5–6` hover preview
- `느헤미야 2:1–8` click-to-open
- `롬 8:28` New Testament lookup
- direct search using full book name and abbreviation
- full-text search for a Korean phrase
- no duplicate links after reload or repeated initialization
- no false links in bibliography years and numeric ratios

### Original-language page

- left column is original language
- right column is Korean Revised Version
- Hebrew is RTL
- Greek is LTR
- selected verse is highlighted
- direct URL opens the requested book and chapter
- previous and next chapter buttons respect book boundaries
- missing or unverified text is reported explicitly

### Mobile

- explorer opens as a bottom sheet
- hover tooltip is not shown
- original and Korean texts remain readable
- controls do not overflow the viewport

## 10. Commands

Apply shared reader assets to new pages:

```bash
python3 tools/apply_bible_reader.py --write
```

Check for missing shared reader assets:

```bash
python3 tools/apply_bible_reader.py --check
```

Validate the Korean corpus locally:

```bash
python3 - <<'PY'
import gzip
import json
from pathlib import Path

root = Path('assets/data/bible/kor')
manifest = json.loads((root / 'manifest.json').read_text(encoding='utf-8'))
assert len(manifest['books']) == 66

loaded = {}
for info in manifest['chunks'].values():
    with gzip.open(root / info['path'], 'rt', encoding='utf-8') as handle:
        chunk = json.load(handle)
    loaded.update(chunk.get('books', chunk))

assert set(loaded) == set(manifest['books'])
total = sum(
    len(verses)
    for book in loaded.values()
    for verses in book['chapters'].values()
)
assert total == 31102, total
print(f'Validated: {len(loaded)} books, {total:,} verses')
PY
```

## 11. Instructions for the next Claude or GPT session

Use the following as the starting instruction:

```text
Work from the current main branch of Gyu1718/biblestudygyu.
Read docs/BIBLE_READER_HANDOFF.md before changing anything.

Do not scrape the Korean Bible Society website.
Use the Korean Bible corpus already stored under assets/data/bible/kor/.
The current original-language reader still uses temporary WLC/OSHB and SBLGNT CDN sources.
Do not describe those sources as BHS or NA28.

The next main task is to convert and validate the user's licensed
Biblia Hebraica Stuttgartensia BHS EPUB and NA28 EPUB into an internal,
verse-keyed corpus, then replace the temporary external sources in
assets/js/original-reader.js.

Preserve the existing Korean hover preview, right-side explorer,
full-text search, lazy loading, mobile behavior, and automatic application
to newly added research pages.
```

## 12. Definition of completion

The Bible-reader project is complete when:

1. all 66 Korean Bible books are searchable and previewable
2. research-page references are linked automatically
3. hover previews and the right-side explorer work without heavy initial loading
4. the left sidebar opens the original-language page in a new tab
5. the original-language page uses the user's licensed BHS and NA28 data internally
6. the left original text and right Korean text are aligned by verse
7. source labels are accurate
8. new research pages inherit the features automatically
9. all validation and mobile tests pass
