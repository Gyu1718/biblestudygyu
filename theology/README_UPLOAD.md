# Calvin subtopics expanded pack v3 — upload-ready

이 압축 파일은 저장소 루트 기준 상대 경로를 포함합니다. 압축을 풀었을 때 보이는 폴더 구조 그대로 GitHub 저장소 루트에 업로드하면 됩니다.

## 업로드 경로

| 파일 | 저장소 경로 | 역할 |
|---|---|---|
| 소주제 데이터 | `data/books-calvin-subtopics-expanded-v3.json` | 칼빈 『기독교 강요』 장별 소주제 설명 데이터 |
| 데이터 병합 스크립트 | `js/calvin-subtopics-preload.js` | `preload-data.js` 이후 `window.__DATA__.books`의 칼빈 항목에 소주제 병합 |
| 화면 표시 스크립트 | `js/calvin-subtopics-render.js` | `app.js`의 `chapterHTML()`을 확장해 소주제 카드 표시 |
| 진입 HTML | `index.html` | 위 두 스크립트를 정확한 순서로 로드 |
| 검토 문서 | `docs/calvin-subtopics-expanded-guide-v3.md` | 소주제 설명 작성 원칙과 데이터 구조 설명 |
| 경로표 | `docs/calvin-subtopics-upload-map-v3.md` | 각 파일과 데이터 병합 경로 요약 |

## 로드 순서

`index.html`에는 다음 순서가 반영되어 있습니다.

```html
<script src="./js/preload-data.js"></script>
...
<script src="./js/calvin-subtopics-preload.js"></script>
<script src="./js/app.js"></script>
<script src="./js/calvin-subtopics-render.js"></script>
```

이 순서가 중요합니다. `calvin-subtopics-preload.js`는 `app.js`가 `window.__DATA__`를 가져가기 전에 소주제 데이터를 합치고, `calvin-subtopics-render.js`는 `app.js`의 장 렌더링 함수가 만들어진 뒤 화면 표시를 확장합니다.

## 데이터 병합 경로

대표 예시는 다음과 같습니다.

```text
data/books-calvin-subtopics-expanded-v3.json
  → window.__DATA__.books[book.id="calvin-institutes"]
  → parts[제3권]
  → chapters[ref="III.2"]
  → subtopics[]
```

각 장별 항목 안에는 `_path` 필드를 넣어 `data/books.json`, `data/books-calvin-structure-map.json`, 런타임 경로를 모두 확인할 수 있게 했습니다.

## 검수

- JSON 문법 검증 완료
- 긴 원문 인용 없음
- 소주제 설명은 직접 작성한 해설문
- 인용은 실제 본문이 아니라 `quoteTargets` 위치 표기
