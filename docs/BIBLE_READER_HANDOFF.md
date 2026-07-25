# Bible Reader Development Handoff

> Repository: `Gyu1718/biblestudygyu`  
> Primary branch: `main`  
> Last updated: 2026-07-25  
> Scope: Korean Bible explorer, original-language parallel reading, Scripture-reference previews, and integration with book-study shelves

## 1. Fixed source policy

The production reader uses these sources.

- Old Testament original text: `WLC / OSHB`, loaded from the existing MorphHB structured XML source
- New Testament original text: `NA28`, converted from the user-provided structured EPUB
- Korean parallel text: the user-provided and academically licensed Korean Revised Version runtime corpus

Do not replace these sources without the user's explicit approval.

Do not label WLC/OSHB as BHS. The supplied BHS PDF and DJVU are reference materials only and are not the production text layer.

Do not use SBLGNT in the production reader. Do not label SBLGNT as NA28.

Do not publish source EPUB, PDF, DJVU, or font files. Do not crawl or scrape the Korean Bible Society website.

## 2. User experience

1. Korean Scripture references such as `학개 1:5–6`, `느 2:1–8`, and `롬 8:28` are detected on research pages.
2. Hovering shows a short Korean preview on pointer-oriented devices.
3. Clicking opens the right-side Korean Bible explorer.
4. The explorer supports reference lookup and full-text search across all 66 books.
5. The homepage contains a `성경읽기` entry.
6. Every standard book shelf contains an explicit `성경 읽기` card and chapter buttons.
7. The parallel reader displays original text and Korean text together.
8. Old Testament pages display WLC/OSHB; New Testament pages display NA28.

Main reader:

```text
/biblestudygyu/bible/original.html
```

Parameterized example:

```text
/biblestudygyu/bible/original.html?book=ROM&chapter=8&verse=28&end=30
```

## 3. Relationship to book-study shelves

Read `docs/BOOK_STUDY_MANUAL.md` before changing a book shelf.

The standard book shelf order is:

```text
성경 읽기
종합 개관
장별 심층연구
원어 연구
```

The Bible reader supplies the `성경 읽기` stage. It does not replace the book shelf, overview, chapter studies, or original-language research.

### Explicit links are required

Book shelf pages must author the Bible-reading links in HTML.

```html
<a href="../../bible/original.html?book=NEH&chapter=1">성경 읽기</a>
```

Chapter-study pages should explicitly link to the current chapter where the page design includes a top navigation.

The legacy sidebar element created by the reader is hidden by default through `assets/css/study-navigation-policy.css`. It is visible only when a page explicitly opts in.

```html
<body data-auto-original-link="true">
```

Do not enable this attribute on standard book shelves or standard chapter-study pages unless the user explicitly requests the legacy button.

## 4. Repository architecture

### Shared Korean explorer

```text
assets/js/bible-reader.js
assets/css/bible-reader.css
assets/css/study-navigation-policy.css
```

Responsibilities:

- recognize Korean Bible book names and abbreviations
- infer book and chapter from `data-book`, `data-chapter`, path, or title
- convert detected references into interactive links
- show hover previews
- open the right-side explorer
- load only required compressed data chunks
- cache manifests, chunks, and books
- load all Korean chunks only for full-text search
- keep the legacy sidebar link visually disabled unless a page opts in

### Korean corpus

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

Runtime behavior:

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

## 5. NA28 extraction

Converter:

```text
tools/extract_na28_epub.py
```

Usage:

```bash
python3 tools/extract_na28_epub.py "/path/to/NA28.epub" \
  --output assets/data/bible/original/na28
```

The converter extracts running Greek text and verse identifiers. It excludes apparatus files, outer-margin references, Eusebian material, fonts, introductions, and appendices.

Validation must produce exactly 27 books, 260 chapters, and 7,941 verse markers.

## 6. Versification differences

The Korean Bible and NA28 do not always contain the same independent verse numbers. Preserve the NA28 numbering and report a missing verse rather than fabricating text.

Known Korean verse numbers without an independent NA28 marker include:

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

Displayed notice:

```text
NA28에는 해당 절 번호가 없습니다.
```

Revelation 12:18 and the transition to Revelation 13:1 must also remain source-specific. Do not silently merge or renumber the texts.

## 7. Performance rules

- do not embed Bible text into every study HTML file
- do not load all 66 Korean books on initial page load
- do not load all 27 NA28 books on initial page load
- load one relevant compressed chunk for a passage
- cache loaded chunks in browser memory
- delay hover preview briefly
- show at most three verses in a normal tooltip
- load all Korean chunks only for full-text search
- cap visible search results
- disable hover tooltips on touch-oriented mobile layouts

## 8. Automatic asset application

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

It inserts only the shared Bible reader CSS and JavaScript when they are missing.

```bash
python3 tools/apply_bible_reader.py --write
python3 tools/apply_bible_reader.py --check
```

It does not create book shelves, chapter buttons, overview links, original-study links, or completion states. Those are authored according to `docs/BOOK_STUDY_MANUAL.md`.

## 9. Testing checklist

### Korean explorer

- `학개 1:5–6` hover preview
- `느헤미야 2:1–8` click-to-open
- `롬 8:28` direct lookup
- full book name and abbreviation search
- full-text Korean search
- no duplicate links after repeated initialization
- no false links in bibliography years and ratios

### Original-language reader

Old Testament:

- Genesis 1 displays Hebrew RTL
- Psalm 119 loads correctly
- Haggai 1 loads correctly
- source badge reads `WLC / OSHB`

New Testament:

- Matthew 1:1 matches the provided NA28 EPUB
- Romans 8 loads correctly
- Acts 8:37 displays the missing-NA28 notice
- Revelation 12:18 is preserved
- source badge reads `NA28`

### Book shelves

- explicit Bible-reading card exists
- every chapter-reading button has the correct book code and chapter
- no visible automatic `원어성경 보기` button appears without opt-in
- missing chapter studies are disabled instead of linked
- mobile and dark mode remain readable

## 10. Immediate deployment requirement

For New Testament reading, these files must exist on `main`.

```text
assets/data/bible/original/na28/chunks/nt-gospels.json.gz
assets/data/bible/original/na28/chunks/nt-acts-paul.json.gz
assets/data/bible/original/na28/chunks/nt-general.json.gz
assets/data/bible/original/na28/chunks/nt-revelation.json.gz
```

If they are missing, the reader intentionally reports that the NA28 package has not been uploaded.

## 11. Starter prompt for another AI

```text
Work from the current main branch of Gyu1718/biblestudygyu.

Read these files before editing:
1. AGENTS.md
2. docs/BOOK_STUDY_MANUAL.md
3. docs/BIBLE_READER_HANDOFF.md
4. docs/AI_WORKER_GUIDE.md

Fixed source policy:
- Old Testament: WLC/OSHB
- New Testament: local NA28 runtime data from the user-provided EPUB
- Korean: local user-provided Korean Revised Version runtime corpus

Do not scrape the Korean Bible Society website.
Do not replace NA28 with SBLGNT.
Do not label WLC/OSHB as BHS.
Do not publish source EPUBs, PDFs, DJVUs, or fonts.
Preserve lazy loading, hover previews, and source-specific versification.
Use explicit HTML links for book shelves and chapter navigation.
Do not claim a study is complete unless the files exist in the repository.
```
