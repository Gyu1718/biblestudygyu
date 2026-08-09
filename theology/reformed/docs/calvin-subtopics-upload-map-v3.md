# Calvin subtopics upload map v3

> 저장소 루트 기준 상대 경로를 사용합니다.

## 1. 실제 업로드 파일

- `index.html` — 스크립트 로드 순서 반영본
- `data/books-calvin-subtopics-expanded-v3.json` — 장별 소주제 설명 데이터
- `js/calvin-subtopics-preload.js` — 소주제 데이터를 칼빈 책 데이터에 병합
- `js/calvin-subtopics-render.js` — 소주제 카드를 화면에 출력
- `docs/calvin-subtopics-expanded-guide-v3.md` — 검토용 설명 문서
- `docs/calvin-subtopics-upload-map-v3.md` — 이 경로표

## 2. 데이터 병합 대상 경로

| ref | 데이터 파일 위치 | 런타임 병합 위치 |
|---|---|---|
| `I.1` | `data/books-calvin-subtopics-expanded-v3.json > chapterPatches[ref="I.1"]` | `window.__DATA__.books[book.id="calvin-institutes"].parts[0].chapters[ref="I.1"].subtopics` |
| `I.3` | `data/books-calvin-subtopics-expanded-v3.json > chapterPatches[ref="I.3"]` | `window.__DATA__.books[book.id="calvin-institutes"].parts[0].chapters[ref="I.3"].subtopics` |
| `I.4` | `data/books-calvin-subtopics-expanded-v3.json > chapterPatches[ref="I.4"]` | `window.__DATA__.books[book.id="calvin-institutes"].parts[0].chapters[ref="I.4"].subtopics` |
| `I.5` | `data/books-calvin-subtopics-expanded-v3.json > chapterPatches[ref="I.5"]` | `window.__DATA__.books[book.id="calvin-institutes"].parts[0].chapters[ref="I.5"].subtopics` |
| `I.6` | `data/books-calvin-subtopics-expanded-v3.json > chapterPatches[ref="I.6"]` | `window.__DATA__.books[book.id="calvin-institutes"].parts[0].chapters[ref="I.6"].subtopics` |
| `I.7` | `data/books-calvin-subtopics-expanded-v3.json > chapterPatches[ref="I.7"]` | `window.__DATA__.books[book.id="calvin-institutes"].parts[0].chapters[ref="I.7"].subtopics` |
| `I.9` | `data/books-calvin-subtopics-expanded-v3.json > chapterPatches[ref="I.9"]` | `window.__DATA__.books[book.id="calvin-institutes"].parts[0].chapters[ref="I.9"].subtopics` |
| `I.13` | `data/books-calvin-subtopics-expanded-v3.json > chapterPatches[ref="I.13"]` | `window.__DATA__.books[book.id="calvin-institutes"].parts[0].chapters[ref="I.13"].subtopics` |
| `I.15` | `data/books-calvin-subtopics-expanded-v3.json > chapterPatches[ref="I.15"]` | `window.__DATA__.books[book.id="calvin-institutes"].parts[0].chapters[ref="I.15"].subtopics` |
| `I.16-18` | `data/books-calvin-subtopics-expanded-v3.json > chapterPatches[ref="I.16-18"]` | `window.__DATA__.books[book.id="calvin-institutes"].parts[0].chapters[ref="I.16-18"].subtopics` |
| `II.1` | `data/books-calvin-subtopics-expanded-v3.json > chapterPatches[ref="II.1"]` | `window.__DATA__.books[book.id="calvin-institutes"].parts[1].chapters[ref="II.1"].subtopics` |
| `II.2-3` | `data/books-calvin-subtopics-expanded-v3.json > chapterPatches[ref="II.2-3"]` | `window.__DATA__.books[book.id="calvin-institutes"].parts[1].chapters[ref="II.2-3"].subtopics` |
| `II.6` | `data/books-calvin-subtopics-expanded-v3.json > chapterPatches[ref="II.6"]` | `window.__DATA__.books[book.id="calvin-institutes"].parts[1].chapters[ref="II.6"].subtopics` |
| `II.7` | `data/books-calvin-subtopics-expanded-v3.json > chapterPatches[ref="II.7"]` | `window.__DATA__.books[book.id="calvin-institutes"].parts[1].chapters[ref="II.7"].subtopics` |
| `II.8` | `data/books-calvin-subtopics-expanded-v3.json > chapterPatches[ref="II.8"]` | `window.__DATA__.books[book.id="calvin-institutes"].parts[1].chapters[ref="II.8"].subtopics` |
| `II.10-11` | `data/books-calvin-subtopics-expanded-v3.json > chapterPatches[ref="II.10-11"]` | `window.__DATA__.books[book.id="calvin-institutes"].parts[1].chapters[ref="II.10-11"].subtopics` |
| `II.12-14` | `data/books-calvin-subtopics-expanded-v3.json > chapterPatches[ref="II.12-14"]` | `window.__DATA__.books[book.id="calvin-institutes"].parts[1].chapters[ref="II.12-14"].subtopics` |
| `II.15` | `data/books-calvin-subtopics-expanded-v3.json > chapterPatches[ref="II.15"]` | `window.__DATA__.books[book.id="calvin-institutes"].parts[1].chapters[ref="II.15"].subtopics` |
| `II.16-17` | `data/books-calvin-subtopics-expanded-v3.json > chapterPatches[ref="II.16-17"]` | `window.__DATA__.books[book.id="calvin-institutes"].parts[1].chapters[ref="II.16-17"].subtopics` |
| `III.1` | `data/books-calvin-subtopics-expanded-v3.json > chapterPatches[ref="III.1"]` | `window.__DATA__.books[book.id="calvin-institutes"].parts[2].chapters[ref="III.1"].subtopics` |
| `III.2` | `data/books-calvin-subtopics-expanded-v3.json > chapterPatches[ref="III.2"]` | `window.__DATA__.books[book.id="calvin-institutes"].parts[2].chapters[ref="III.2"].subtopics` |
| `III.3` | `data/books-calvin-subtopics-expanded-v3.json > chapterPatches[ref="III.3"]` | `window.__DATA__.books[book.id="calvin-institutes"].parts[2].chapters[ref="III.3"].subtopics` |
| `III.4-5` | `data/books-calvin-subtopics-expanded-v3.json > chapterPatches[ref="III.4-5"]` | `window.__DATA__.books[book.id="calvin-institutes"].parts[2].chapters[ref="III.4-5"].subtopics` |
| `III.6-10` | `data/books-calvin-subtopics-expanded-v3.json > chapterPatches[ref="III.6-10"]` | `window.__DATA__.books[book.id="calvin-institutes"].parts[2].chapters[ref="III.6-10"].subtopics` |
| `III.11-18` | `data/books-calvin-subtopics-expanded-v3.json > chapterPatches[ref="III.11-18"]` | `window.__DATA__.books[book.id="calvin-institutes"].parts[2].chapters[ref="III.11-18"].subtopics` |
| `III.19` | `data/books-calvin-subtopics-expanded-v3.json > chapterPatches[ref="III.19"]` | `window.__DATA__.books[book.id="calvin-institutes"].parts[2].chapters[ref="III.19"].subtopics` |
| `III.20` | `data/books-calvin-subtopics-expanded-v3.json > chapterPatches[ref="III.20"]` | `window.__DATA__.books[book.id="calvin-institutes"].parts[2].chapters[ref="III.20"].subtopics` |
| `III.21-24` | `data/books-calvin-subtopics-expanded-v3.json > chapterPatches[ref="III.21-24"]` | `window.__DATA__.books[book.id="calvin-institutes"].parts[2].chapters[ref="III.21-24"].subtopics` |
| `III.25` | `data/books-calvin-subtopics-expanded-v3.json > chapterPatches[ref="III.25"]` | `window.__DATA__.books[book.id="calvin-institutes"].parts[2].chapters[ref="III.25"].subtopics` |
| `IV.1` | `data/books-calvin-subtopics-expanded-v3.json > chapterPatches[ref="IV.1"]` | `window.__DATA__.books[book.id="calvin-institutes"].parts[3].chapters[ref="IV.1"].subtopics` |
| `IV.2` | `data/books-calvin-subtopics-expanded-v3.json > chapterPatches[ref="IV.2"]` | `window.__DATA__.books[book.id="calvin-institutes"].parts[3].chapters[ref="IV.2"].subtopics` |
| `IV.3` | `data/books-calvin-subtopics-expanded-v3.json > chapterPatches[ref="IV.3"]` | `window.__DATA__.books[book.id="calvin-institutes"].parts[3].chapters[ref="IV.3"].subtopics` |
| `IV.8-10` | `data/books-calvin-subtopics-expanded-v3.json > chapterPatches[ref="IV.8-10"]` | `window.__DATA__.books[book.id="calvin-institutes"].parts[3].chapters[ref="IV.8-10"].subtopics` |
| `IV.12` | `data/books-calvin-subtopics-expanded-v3.json > chapterPatches[ref="IV.12"]` | `window.__DATA__.books[book.id="calvin-institutes"].parts[3].chapters[ref="IV.12"].subtopics` |
| `IV.14` | `data/books-calvin-subtopics-expanded-v3.json > chapterPatches[ref="IV.14"]` | `window.__DATA__.books[book.id="calvin-institutes"].parts[3].chapters[ref="IV.14"].subtopics` |
| `IV.15-16` | `data/books-calvin-subtopics-expanded-v3.json > chapterPatches[ref="IV.15-16"]` | `window.__DATA__.books[book.id="calvin-institutes"].parts[3].chapters[ref="IV.15-16"].subtopics` |
| `IV.17` | `data/books-calvin-subtopics-expanded-v3.json > chapterPatches[ref="IV.17"]` | `window.__DATA__.books[book.id="calvin-institutes"].parts[3].chapters[ref="IV.17"].subtopics` |
| `IV.18` | `data/books-calvin-subtopics-expanded-v3.json > chapterPatches[ref="IV.18"]` | `window.__DATA__.books[book.id="calvin-institutes"].parts[3].chapters[ref="IV.18"].subtopics` |
| `IV.19` | `data/books-calvin-subtopics-expanded-v3.json > chapterPatches[ref="IV.19"]` | `window.__DATA__.books[book.id="calvin-institutes"].parts[3].chapters[ref="IV.19"].subtopics` |
| `IV.20` | `data/books-calvin-subtopics-expanded-v3.json > chapterPatches[ref="IV.20"]` | `window.__DATA__.books[book.id="calvin-institutes"].parts[3].chapters[ref="IV.20"].subtopics` |

## 3. 커밋 메시지 예시

```text
Add Calvin Institutes expanded subtopic data and renderer
```