# AGENTS.md

이 저장소에서 작업하는 모든 AI 에이전트와 자동화 도구에 적용한다.

## 먼저 읽을 문서

1. `docs/BOOK_STUDY_MANUAL.md`
2. `docs/BIBLE_READER_HANDOFF.md`
3. `docs/AI_WORKER_GUIDE.md`

## 필수 규칙

- 표준형 책의 서가 순서는 `성경 읽기 → 종합 개관 → 장별 심층연구 → 원어 연구`다.
- 새 원어 연구의 기본 경로는 `parsing/chNN.html`이다.
- 핵심 장 이동과 연구 링크는 실제 HTML에 기록한다.
- 존재하지 않는 파일은 절대 링크하지 않는다.
- 파일이 저장소에 없으면 완료로 표기하지 않는다.
- `catalog.js`와 루트 `README.md`의 상태를 실제 파일과 일치시킨다.
- 에스더는 기준 사례로 보존한다.
- 시편과 호세아는 예외형이며 별도 지시 없이 구조를 변경하지 않는다.
- 원본 EPUB·PDF·DJVU·폰트 파일을 커밋하지 않는다.
- WLC/OSHB를 BHS로, SBLGNT를 NA28로 표기하지 않는다.
- 성경 리더의 지연 로딩, 장절 호버, 원문별 절 번호 차이를 보존한다.

## 표준형 현재 적용 대상

- `ot/nehemiah/`
- `ot/haggai/`
- `nt/romans/`

## 수정 금지 또는 예외

- `ot/esther/`: 기준 사례. 사용자 요청 없이 구조 변경 금지.
- `ot/psalms/`: 5권 정경 구조 유지.
- `ot/hosea/`: 통합 연구 노트 구조 유지.

## 검증

작업 후 최소한 다음을 확인한다.

```text
로컬 링크
목차 앵커
중복 id
현재 장 aria-current
성경읽기 링크의 책 코드와 장 번호
미완성 연구의 비활성 상태
모바일·다크 모드
catalog.js 문법
```
