# 성서 연구 서고

성경읽기, 원어 자료, 장별 심층연구와 신학 연구를 한 저장소에서 연결하는 정적 웹 아카이브입니다.

배포 주소:

```text
https://gyu1718.github.io/biblestudygyu/
```

## 주요 기능

- 성경 66권 원문·개역개정 병렬 읽기
- 구약 WLC/OSHB, 신약 NA28 런타임 연결
- 성경 장절 자동 인식, 호버 미리보기와 우측 성경 탐색기
- 히브리어·헬라어 스트롱 사전
- 책별 종합 개관과 장별 심층연구
- 주석가 칩, 다크 모드, 화면 설정·연구 도크
- 모바일·인쇄 대응

## 책별 연구 구조

표준형 책은 다음 순서를 사용합니다.

```text
책별 서가 홈페이지
├── 성경 읽기
├── 종합 개관
├── 장별 심층연구
└── 원어 연구
```

새 원어 연구는 `parsing/chNN.html` 아래에서 파싱과 인터라이너를 통합합니다. 실제 파일이 없는 연구는 링크하지 않고 `준비 중` 또는 `미구현`으로 표시합니다.

상세 규칙:

- [성경책 연구 서가 제작 매뉴얼](docs/BOOK_STUDY_MANUAL.md)
- [AI 작업자 안내](docs/AI_WORKER_GUIDE.md)
- [성경 리더 개발 인수인계](docs/BIBLE_READER_HANDOFF.md)
- [에이전트 필수 규칙](AGENTS.md)

## 현재 연구 세트

| 책 | 구조 | 현재 상태 |
|---|---|---|
| 창세기 | 표준형 | 종합 개관, 1–25장 심층연구, 50장 성경읽기 연결, 원어 연구 미구현 |
| 느헤미야 | 표준형 | 종합 개관, 1–13장 심층연구, 파싱 13장, 기존 인터라이너 5장 |
| 에스더 | 기준 사례 | 종합 개관 완성, 장별 심층연구 준비 중 |
| 시편 | 예외형 | 전체 개관, 자료집, 5권 권별 상세 연구 |
| 호세아 | 예외형 | 통합 연구 노트 구조 유지 |
| 요엘 | 표준형 | 종합 개관, 1–3장 심층연구, 원어 연구 준비 중 |
| 학개 | 표준형 | 종합 개관, 1–2장 심층연구, 원어 연구 1:1–4 표본 |
| 사도행전 | 표준형 | 종합 개관, 1–15장 심층연구, 원어 연구 준비 중 |
| 로마서 | 표준형 | 종합 개관, 1–16장 심층연구, 원어 연구 미구현 |

에스더는 표준 서가의 기준 사례로 보존합니다. 시편과 호세아는 자료 성격상 별도 지시가 있기 전까지 예외 구조를 유지합니다.

## 공통 도구 버튼 자동 적용

모든 연구 HTML에 화면 설정·연구 도크 버튼이 나타나도록 다음 프로그램이 자동 적용합니다.

```bash
python3 tools/apply_study_tools.py --write
python3 tools/apply_study_tools.py --check
```

검사 대상:

```text
ot/**/*.html
nt/**/*.html
theology/**/*.html
```

프로그램은 누락된 다음 자산을 상대경로에 맞춰 삽입합니다.

```text
assets/theme.css
assets/app.css
assets/app.js
```

`app.js`가 연구 도크 로더를 불러오므로 화면 설정과 연구 도구 버튼이 자동으로 생성됩니다. GitHub Actions가 연구 HTML이나 관련 공통 자산이 변경될 때 프로그램을 실행하고, 필요한 HTML 수정 사항을 자동 커밋합니다.

특정 문서에서 자동 적용을 피해야 할 경우 HTML에 `data-no-study-tools` 속성을 둡니다.

## 주요 경로

```text
index.html                         서고 홈페이지
catalog.js                         홈페이지 연구 카탈로그
bible/original.html                원문·개역개정 병렬 성경읽기
lexicon/                           원어 사전
ot/<book>/index.html               구약 책별 서가
nt/<book>/index.html               신약 책별 서가
assets/css/book-shelf.css          표준형 책별 서가 공통 스타일
tools/apply_study_tools.py         도구 버튼 자동 적용
tools/apply_bible_reader.py        성경 리더 자동 적용
docs/BOOK_STUDY_MANUAL.md          책 작업 매뉴얼
docs/BIBLE_READER_HANDOFF.md       성경 리더 정책과 구조
```

## 자료 정책

- 구약 원문 리더는 WLC/OSHB를 사용합니다.
- 신약 원문 리더는 사용자 제공 NA28 EPUB에서 변환한 런타임 데이터를 사용합니다.
- 한국어 병렬 본문은 사용자 제공 개역개정 런타임 데이터를 사용합니다.
- 원본 EPUB·PDF·DJVU와 폰트 파일은 저장소에 배포하지 않습니다.
- 대한성서공회 사이트를 크롤링하지 않습니다.
- WLC/OSHB를 BHS라고 표기하지 않으며 SBLGNT를 NA28이라고 표기하지 않습니다.

## 기본 검증

```bash
python3 tools/apply_study_tools.py --check
python3 tools/apply_bible_reader.py --check
```

추가로 확인할 항목:

- 깨진 로컬 링크와 앵커
- 중복 HTML `id`
- 장 이동 버튼과 `aria-current`
- 존재하지 않는 연구 파일 링크
- 모바일·다크 모드
- `catalog.js` 문법
- 연구 도크와 플로팅 버튼 충돌

## AI 작업자

작업을 시작하기 전에 반드시 `AGENTS.md`를 읽습니다. 루트 `README.md`는 프로젝트 전체 안내 문서이므로 개별 패치나 ZIP의 임시 설명으로 덮어쓰지 않습니다.
