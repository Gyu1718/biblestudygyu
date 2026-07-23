# Bible Reader Development Handoff

> Repository: `Gyu1718/biblestudygyu`  
> Primary branch: `main`  
> Last updated: 2026-07-23  
> Scope: Korean Bible explorer, Scripture-reference previews, homepage Bible reader, and original-language parallel reading

## 1. Fixed source decision

The original-language reader must use the following sources:

- Old Testament: `WLC / OSHB`, loaded from the existing MorphHB structured XML source
- New Testament: `NA28`, converted from the user-provided structured EPUB
- Korean parallel text: the user-provided and academically licensed Korean Revised Version EPUB

Do not replace these sources without the user's explicit approval.

Do not label WLC/OSHB as BHS. The supplied BHS PDF and DJVU files are reference and verification materials only. The PDF uses a legacy Hebrew font encoding and contains no usable critical apparatus layer for the web reader. The DJVU is image-based and has no embedded OCR text.

Do not use SBLGNT in the production reader. The earlier SBLGNT connection has been removed.

## 2. User-provided source files

The runtime data was or will be derived from these user-provided files:

```text
성경전서 개역개정판 - 2018.10.10.epub
Novum Testamentum Graece (Nestle-Aland) NA28 ... .epub
```

The NA28 EPUB is a structured electronic edition. Running text, critical apparatus, and outer-margin references are stored separately. The current runtime package includes only the running Greek text.

The repository must not publish the source EPUB files or bundled font files.

The repository must not crawl or scrape the Korean Bible Society website.

## 3. Current user experience

1. Korean Scripture references such as `학개 1:5–6`, `느 2:1–8`, and `롬 8:28` are detected automatically on study pages.
2. Hovering over a detected reference shows a short Korean Bible preview.
3. Clicking the reference opens the right-side Korean Bible explorer.
4. The explorer supports reference lookup and full-text search across all 66 books.
5. Study pages receive a left-sidebar `원어성경 보기 ↗` link.
6. The site homepage contains a `성경읽기` card.
7. The Bible-reading page displays original text on the left and Korean text on the right.
8. Old Testament pages display WLC/OSHB; New Testament pages display NA28.

Main reader URL:

```text
/biblestudygyu/bible/original.html
```

Parameterized example:

```text
/biblestudygyu/bible/original.html?book=ROM&chapter=8&verse=28&end=30
```

## 4. Repository architecture

### Korean Bible explorer

```text
assets/js/bible-reader.js
assets/css/bible-reader.css
```

Responsibilities:

- recognize Korean Bible book names and abbreviations
- infer book and chapter from the page path or title
- convert detected references into interactive links
- show hover previews
- open the right-side explorer
- load only required compressed data chunks
- cache manifests, chunks, and books
- load all Korean chunks only when full-text search is requested
- inject the original-language reader link into compatible left sidebars

### Korean Bible corpus

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

Expected totals:

- 66 books
- 1,189 chapters
- 31,102 verses

### Original-language parallel reader

```text
bible/original.html
assets/js/original-reader.js
assets/css/original-reader.css
```

Current source behavior:

```text
Old Testament request
└── load WLC/OSHB XML from MorphHB through jsDelivr

New Testament request
└── load local NA28 manifest
    └── load one required gzip chunk
        └── render NA28 running text beside Korean text
```

### NA28 runtime corpus

```text
assets/data/bible/original/na28/
├── manifest.json
└── chunks/
    ├── nt-gospels.json.gz
    ├── nt-acts-paul.json.gz
    ├── nt-general.json.gz
    └── nt-revelation.json.gz
```

Expected totals:

- 27 books
- 260 chapters
- 7,941 NA28 verse markers

The manifest is stored in the repository. The four gzip chunk files may need to be uploaded manually because binary uploads are not handled through the text-only GitHub connector.

## 5. NA28 extraction

Reproducible converter:

```text
tools/extract_na28_epub.py
```

Usage:

```bash
python3 tools/extract_na28_epub.py "/path/to/NA28.epub" \
  --output assets/data/bible/original/na28
```

The script uses only the Python standard library and extracts:

- elements with class `greek-text`
- elements with class `greek-italics`
- verse identifiers shaped like `v40001001`

It excludes:

- critical apparatus files
- outer-margin references
- Eusebian material
- EPUB fonts
- introductory and appendix material

The converter fails if validation does not produce exactly 27 books, 260 chapters, and 7,941 verse markers.

## 6. NA28 versification differences

The Korean Bible and NA28 do not always contain the same independent verse numbers. The parallel reader must preserve the NA28 numbering and clearly report a missing NA28 verse rather than fabricating text.

Known Korean verse numbers without an independent NA28 verse marker include:

```text
Matthew 17:21
Matthew 18:11
Matthew 23:14
Mark 7:16
Mark 9:44
Mark 9:46
Mark 11:26
Mark 15:28
Luke 17:36
Luke 23:17
John 5:4
Acts 8:37
Acts 15:34
Acts 19:41
Acts 24:7
Acts 28:29
Romans 16:24
```

The reader currently displays:

```text
NA28에는 해당 절 번호가 없습니다.
```

Revelation also requires attention:

```text
NA28 Revelation 12:18
Korean versification places related wording at the transition into Revelation 13:1
```

Do not silently merge or renumber this material. A future explicit versification map may add cross-reference notices while preserving both source systems.

## 7. Performance rules

The hover-preview feature is approved and should remain.

- do not embed Bible text into every study HTML file
- do not load all 66 Korean books on initial page load
- do not load all 27 NA28 books on initial page load
- load one relevant compressed chunk when a passage is requested
- cache loaded chunks in browser memory
- delay hover preview briefly
- show at most three verses in a tooltip
- load all Korean chunks only for full-text search
- cap visible search results, currently 100
- disable hover tooltips on touch-oriented mobile layouts

## 8. Source and rights policy

1. Use only user-provided files or sources explicitly approved by the user.
2. The user approved WLC/OSHB as the Old Testament runtime source.
3. The user approved the provided NA28 EPUB as the New Testament runtime source.
4. Do not scrape the Korean Bible Society website.
5. Do not publish source EPUB, PDF, DJVU, or font files.
6. Publish only transformed runtime data required by the reader.
7. Do not label WLC/OSHB as BHS.
8. Do not label SBLGNT as NA28.
9. Keep the NA28 critical apparatus separate from the running text if it is added later.
10. Do not include font files in deliverables.

## 9. Automatic application to study pages

```text
tools/apply_bible_reader.py
.github/workflows/bible-reader.yml
```

The application tool scans:

```text
ot/**/*.html
nt/**/*.html
theology/**/*.html
```

It inserts the shared Korean Bible reader CSS and JavaScript when missing.

Commands:

```bash
python3 tools/apply_bible_reader.py --write
python3 tools/apply_bible_reader.py --check
```

The GitHub Actions workflow validates:

- Korean corpus totals when all Korean chunks are present
- NA28 totals when all four NA28 chunks are present
- shared reader asset links on research HTML pages

If the NA28 manifest exists but binary chunks have not yet been uploaded, the workflow reports the missing paths and skips NA28 corpus validation without failing unrelated work.

## 10. Testing checklist

### Korean explorer

- `학개 1:5–6` hover preview
- `느헤미야 2:1–8` click-to-open
- `롬 8:28` direct reference lookup
- full book name and abbreviation search
- full-text Korean search
- no duplicate links after repeated initialization
- no false links in bibliography years and ratios

### Original-language reader: Old Testament

- Genesis 1 displays Hebrew RTL
- Psalm 1 displays Hebrew RTL
- Psalm 119 loads correctly
- Isaiah 6 loads correctly
- Haggai 1 loads correctly
- source badge reads `WLC / OSHB`

### Original-language reader: New Testament

- Matthew 1:1 matches the provided NA28 EPUB
- Mark 16 loads correctly
- Romans 8 loads correctly
- Acts 8:37 displays the missing-NA28-verse notice
- Revelation 12:18 is preserved
- Revelation 22 loads correctly
- source badge reads `NA28`

### Mobile

- controls fit the viewport
- original and Korean verse pairs remain readable
- Hebrew direction remains RTL
- Greek direction remains LTR
- selected verse remains visible after direct-link navigation

## 11. Immediate deployment requirement

For New Testament reading to work, these four files must exist on `main`:

```text
assets/data/bible/original/na28/chunks/nt-gospels.json.gz
assets/data/bible/original/na28/chunks/nt-acts-paul.json.gz
assets/data/bible/original/na28/chunks/nt-general.json.gz
assets/data/bible/original/na28/chunks/nt-revelation.json.gz
```

If they are missing, the reader intentionally reports that the NA28 package has not been uploaded.

## 12. Next development priorities

1. Upload and validate the four NA28 gzip chunks.
2. Test homepage `성경읽기` entry and direct study-page links.
3. Add a visible note for known versification differences.
4. Consider a separate optional NA28 critical-apparatus layer.
5. Keep morphology and parsing as a separate data layer.
6. Consider self-hosting WLC/OSHB only if the user later wants the Old Testament to work without an external CDN.

## 13. Starter prompt for another AI

```text
Work from the main branch of Gyu1718/biblestudygyu.
Read docs/BIBLE_READER_HANDOFF.md before editing anything.

Fixed source policy:
- Old Testament original text: WLC/OSHB
- New Testament original text: local NA28 data converted from the user-provided EPUB
- Korean text: local user-provided Korean Revised Version corpus

Do not scrape the Korean Bible Society website.
Do not replace NA28 with SBLGNT.
Do not label WLC/OSHB as BHS.
Do not publish source EPUBs or font files.
Preserve lazy loading, hover previews, and source-specific versification differences.
```
