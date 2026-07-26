# AGENTS.md

이 저장소에서 작업하는 모든 AI 에이전트와 자동화 도구에 적용한다.

## 먼저 읽을 문서

1. `docs/BOOK_STUDY_MANUAL.md`
2. `docs/BIBLE_READER_HANDOFF.md`
3. `docs/INTERLINEAR_PIPELINE.md`
4. `docs/AI_WORKER_GUIDE.md`

## 필수 규칙

- 표준형 책의 서가 순서는 `성경 읽기 → 종합 개관 → 장별 심층연구 → 원어 연구`다.
- 새 원어 연구의 기본 경로는 `parsing/chNN.html`이다.
- 인터라이너는 손으로 반복 작성하지 않고 `tools/interlinear/` 파이프라인에서 생성한다.
- 구약은 TAHOT/TEHMC, 신약은 TAGNT/TEGMC를 사용한다.
- TAGNT의 `N` 선택은 비평본문 계열이며 저장소의 NA28 원문 자체를 형태 분석한 것으로 표기하지 않는다.
- 핵심 장 이동과 연구 링크는 실제 HTML에 기록한다.
- 존재하지 않는 파일은 절대 링크하지 않는다.
- 파일이 저장소에 없으면 완료로 표기하지 않는다.
- `catalog.js`와 루트 `README.md`의 상태를 실제 파일과 일치시킨다.
- 모든 연구 HTML에는 화면 설정·연구 도크와 성경 리더 공통 자산이 있어야 한다.
- 새 HTML을 추가하거나 수정한 뒤 `tools/apply_study_tools.py`와 `tools/apply_bible_reader.py`를 검사한다.
- 에스더는 기준 사례로 보존한다.
- 시편과 호세아는 정보 구조 예외형이며 별도 지시 없이 구조를 변경하지 않는다. 공통 도구 버튼은 예외형에도 적용한다.
- 원본 EPUB·PDF·DJVU·폰트 파일과 `sources/STEPBible-Data/`를 커밋하지 않는다.
- WLC/OSHB를 BHS로, SBLGNT나 TAGNT를 NA28 자체로 표기하지 않는다.
- 성경 리더의 지연 로딩, 장절 호버, 원문별 절 번호 차이를 보존한다.

## 표준형 현재 적용 대상

- `ot/nehemiah/`
- `ot/haggai/`
- `nt/romans/`

## 기준 사례와 예외

- `ot/esther/`: 기준 사례. 사용자 요청 없이 정보 구조 변경 금지.
- `ot/psalms/`: 5권 정경 구조 유지.
- `ot/hosea/`: 통합 연구 노트 구조 유지.

## 자동 적용 프로그램

```bash
python3 tools/apply_study_tools.py --write
python3 tools/apply_study_tools.py --check
python3 tools/apply_bible_reader.py --write
python3 tools/apply_bible_reader.py --check
python3 tools/interlinear/validate_interlinear.py <json> <html>
```

`apply_study_tools.py`는 `ot/`, `nt/`, `theology/` 아래의 HTML에 누락된 `theme.css`, `app.css`, `app.js`를 상대경로에 맞춰 삽입한다. 특정 문서를 제외해야 하면 HTML에 `data-no-study-tools`를 둔다.

## 검증

작업 후 최소한 다음을 확인한다.

```text
공통 도구 자산 누락 0
성경 리더 자산 누락 0
인터라이너 schema와 CC BY 출처
로컬 링크
목차 앵커
중복 id
현재 장 aria-current
성경읽기 링크의 책 코드와 장 번호
미완성 연구의 비활성 상태
모바일·다크 모드
catalog.js 문법
```
