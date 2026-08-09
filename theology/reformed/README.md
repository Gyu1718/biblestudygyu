# Reformed Theology Research Archive

개혁신학 연구 자료를 책, 학자, 주제, 인용 위치, 개혁전통·신정통주의 역사 단위로 연결해 정리하는 정적 HTML 아카이브입니다.

이 저장소의 목표는 저작권 있는 원문 전체를 공개하는 것이 아니라, 연구와 인용을 돕기 위한 **서지정보, 목차, 요약, 주제 색인, 개혁전통·신정통주의 역사 색인, 짧은 인용 위치**를 체계적으로 관리하는 것입니다.

## 핵심 기능

- 책별 보기: 주요 개혁신학·신정통주의 문헌의 목차와 장별 요약
- 학자별 보기: 칼빈, 바빙크, 벌코프, 바르트 등 학자 중심 색인
- 주제별 보기: 계시론, 신론, 예정론, 언약신학, 교회론 등 교리 주제 정리
- 관계 연결: 주제-역사, 학자-역사 연결을 `relations.js`에서 통합 처리
- 모바일 탭 보강: 작은 화면에서 탭을 pill 형태로 표시하고 활성 탭을 자동으로 시야에 맞춤
- 개혁전통·신정통주의 역사: 종교개혁, 개혁파, 장로교, 도르트, 웨스트민스터, 개혁파 정통주의, 근대 자유주의 신학, 변증법적 신학, 바르트와 신정통주의 흐름 정리
- 통합 검색: 책, 학자, 주제, 역사 항목을 한 번에 검색

## 공개 저장소 원칙

이 저장소는 public repository입니다. 따라서 다음 자료는 올리지 않습니다.

- 저작권 있는 PDF 원문
- EPUB 원문
- OCR TXT 전문
- 번역서 본문 전체
- 긴 인용문

원문 파일은 개인 로컬 저장소 또는 private repository에서 별도로 관리합니다.

## 폴더 구조

```txt
.
├─ index.html
├─ css/
│  ├─ style.css
│  └─ mobile-tabs.css
├─ js/
│  ├─ app.js
│  ├─ preload-data.js
│  ├─ history-preload.js
│  ├─ history-nav-enhance.js
│  ├─ relations.js
│  ├─ ui-polish.js
│  └─ search.js
├─ data/
│  ├─ books.json
│  ├─ authors.json
│  ├─ author-history-links.json
│  ├─ topics.json
│  ├─ topic-history-links.json
│  ├─ tradition-history.json
│  ├─ neo-orthodoxy-history.json
│  ├─ neo-orthodoxy-doctrine-history.json
│  └─ taxonomy.json
├─ templates/
│  ├─ book-entry.template.json
│  ├─ topic-entry.template.json
│  └─ history-entry.template.json
└─ docs/
   ├─ project-plan.md
   ├─ history-plan.md
   ├─ data-schema.md
   ├─ relations-script.md
   ├─ ui-polish-notes.md
   ├─ input-workflow.md
   └─ copyright-policy.md
```

## 업데이트 방식

1. 새 책을 추가할 때 `templates/book-entry.template.json`을 복사해 구조를 잡습니다.
2. 책 기본 정보와 장별 요약은 `data/books.json`에 입력합니다.
3. 학자 정보가 필요하면 `data/authors.json`에 추가합니다.
4. 학자와 역사 항목의 연결은 `data/author-history-links.json`에 추가합니다.
5. 주제 연결은 `data/topics.json`에 추가합니다.
6. 주제와 역사 항목의 연결은 `data/topic-history-links.json`에 추가합니다.
7. 자료 사이의 화면 연결은 `js/relations.js`가 담당합니다.
8. 모바일 탭 동작은 `js/ui-polish.js`, 시각 규칙은 `css/mobile-tabs.css`가 담당합니다.
9. 개혁전통의 역사 항목은 `data/tradition-history.json`에 추가합니다.
10. 신정통주의 역사 항목은 `data/neo-orthodoxy-history.json`에 추가합니다.
11. 신정통주의 세부 교리사 항목은 `data/neo-orthodoxy-doctrine-history.json`에 추가합니다.
12. 표준 주제 분류는 `data/taxonomy.json`을 기준으로 관리합니다.

## 작업 문서

- [`docs/project-plan.md`](docs/project-plan.md): 전체 기획서
- [`docs/history-plan.md`](docs/history-plan.md): 역사 파트 설계안
- [`docs/data-schema.md`](docs/data-schema.md): JSON 데이터 입력 규칙
- [`docs/relations-script.md`](docs/relations-script.md): 관계 연결 통합 스크립트 설명
- [`docs/ui-polish-notes.md`](docs/ui-polish-notes.md): UI 정리 패치 설명
- [`docs/input-workflow.md`](docs/input-workflow.md): 책 한 권을 추가할 때 따르는 실제 작업 순서
- [`docs/copyright-policy.md`](docs/copyright-policy.md): 공개 저장소 운영 원칙

## 입력 템플릿

- [`templates/book-entry.template.json`](templates/book-entry.template.json): 책 데이터 입력 양식
- [`templates/topic-entry.template.json`](templates/topic-entry.template.json): 주제 데이터 입력 양식
- [`templates/history-entry.template.json`](templates/history-entry.template.json): 역사 항목 입력 양식

## 1차 개발 범위

현재 버전은 정적 HTML, CSS, JavaScript만 사용합니다. 별도 빌드 도구 없이 GitHub Pages에서 바로 배포할 수 있도록 구성합니다.
