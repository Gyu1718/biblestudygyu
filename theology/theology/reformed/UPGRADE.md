# 아카이브 업그레이드 — 적용 안내

## 이 묶음이 하는 일
저장소를 **데이터 주도(data-driven) 시스템**으로 바꿉니다. 화면이 `data/*.json`을
직접 읽어 그리므로, 앞으로는 JSON만 고치면 사이트가 갱신됩니다(코드 수정 불필요).

## 저장소에 적용
아래 파일/폴더를 저장소 루트에 그대로 덮어쓰기:
- `index.html`
- `css/style.css`
- `js/app.js`
- `data/books.json` `data/authors.json` `data/topics.json`
  `data/passages.json` `data/notes.json` `data/taxonomy.json`

기존 내용은 **보존**했습니다 — 벌코프 10장 요약, 메모 8개, topic의 references·relatedTopics는 그대로 두고,
그 위에 두 가지 축만 얹었습니다.

## 스키마 변경 요약
- **tradition 축 1급화**: 모든 책·학자에 `tradition`("개혁파 정통"|"신정통주의") + `traditionKey`("ref"|"neo").
- **positions 비교축**: topic에 `positions[]`(tradition·holder·claim·loc) 추가. 같은 교리에서 두 전통을 좌우로 대질.
- **parts 권 구조**: 칼빈처럼 4권 구조인 책은 `parts[]`(권) → `chapters[]`(장). 평면 `chapters`도 그대로 호환.
- **taxonomy.traditions**: 전통 축 정의 추가.

## 로컬 미리보기
파일을 더블클릭해 열면 fetch가 막힙니다. 폴더에서 서버를 띄우세요:
```
python3 -m http.server 8000
```
→ http://localhost:8000

## GitHub Pages
Settings → Pages → Branch: main / root 로 배포하면 위와 동일하게 동작합니다.
