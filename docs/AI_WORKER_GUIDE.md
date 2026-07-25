# AI 작업자 안내

이 저장소를 수정하는 AI 작업자는 작업 전에 다음 문서를 순서대로 읽는다.

1. `AGENTS.md`
2. `docs/BOOK_STUDY_MANUAL.md`
3. `docs/BIBLE_READER_HANDOFF.md`
4. 수정할 책 폴더의 `README.md`가 있으면 해당 문서

## 작업 원칙

- 현재 저장소를 사실 기준으로 삼는다.
- 대화 중 생성된 ZIP이나 로컬 산출물이 저장소에 반영되지 않았다면 구현 완료로 간주하지 않는다.
- 표준형 책은 `성경 읽기 → 종합 개관 → 장별 심층연구 → 원어 연구`의 순서를 따른다.
- 핵심 메뉴와 장 이동 링크는 실제 HTML에 넣는다.
- 없는 파일은 링크하지 않는다.
- 새 원어 연구는 `parsing/`에 만든다.
- 기존 느헤미야 `interlinear/`는 호환성을 위해 보존한다.
- 에스더는 기준 사례로 보존한다.
- 시편과 호세아는 정보 구조 예외형이므로 별도 지시 없이 구조를 바꾸지 않는다.
- 화면 설정·연구 도크와 성경 리더 공통 기능은 모든 연구 페이지에 적용한다.

## 자동 적용 프로그램

연구 HTML을 추가하거나 변경한 뒤 다음 명령을 실행한다.

```bash
python3 tools/apply_study_tools.py --write
python3 tools/apply_bible_reader.py --write
python3 tools/apply_study_tools.py --check
python3 tools/apply_bible_reader.py --check
```

`tools/apply_study_tools.py`는 다음 경로를 검사한다.

```text
ot/**/*.html
nt/**/*.html
theology/**/*.html
```

누락된 다음 자산을 문서 깊이에 맞는 상대경로로 삽입한다.

```text
assets/theme.css
assets/app.css
assets/app.js
```

`app.js`가 연구 도크 로더를 실행하므로 화면 설정·연구 도구 버튼이 자동으로 생성된다. 특정 문서가 공통 도구를 사용하면 안 될 때만 `data-no-study-tools`를 둔다.

GitHub Actions의 `.github/workflows/bible-reader.yml`도 같은 프로그램을 실행한다. 새 HTML을 저장소에 올릴 때 수동 삽입을 빼먹어도 워크플로가 수정해 자동 커밋한다.

## 수정 전 확인

```text
현재 브랜치와 최신 커밋
수정 대상 파일의 현재 SHA
실제 존재하는 장별 연구 파일
실제 존재하는 원어 연구 파일
상대경로와 data-book/data-chapter/data-root
catalog.js의 현재 설명
```

## 수정 후 확인

```text
공통 도구 자산 누락 0
성경 리더 자산 누락 0
깨진 로컬 링크 0
깨진 앵커 0
중복 HTML id 0
존재하지 않는 파일 링크 0
완료 상태 과장 0
모바일 레이아웃 확인
다크 모드 확인
성경 장절 호버와 패널 확인
연구 도크 버튼 표시 확인
```

## GitHub 작업 규칙

- 같은 파일을 연속 수정할 때는 최신 blob SHA를 다시 사용한다.
- 관련 없는 파일을 함께 수정하지 않는다.
- 임시 패키지 README를 루트 `README.md`로 덮어쓰지 않는다.
- 루트 README는 프로젝트 전체 설명과 현재 상태만 담는다.
- 바이너리와 폰트 파일을 커밋하지 않는다.
- 파일 삭제는 대상 경로와 SHA를 확인한 뒤 실행한다.
- 자동화가 만든 HTML 커밋이 있는지 확인한 뒤 같은 파일을 다시 수정한다.

## 자료와 저작권

- 구약 원문 리더: WLC/OSHB
- 신약 원문 리더: 사용자 제공 NA28에서 변환한 런타임 데이터
- 한국어 본문: 사용자 제공 개역개정 런타임 데이터
- 원본 EPUB·PDF·DJVU·폰트는 공개 저장소에 올리지 않는다.
- 대한성서공회 사이트를 크롤링하지 않는다.

## 완료 보고 형식

작업 보고에는 다음을 포함한다.

```text
변경 파일
적용한 책
예외로 보존한 책
실제 구현 상태
자동 적용 결과
검증 결과
삭제 또는 마이그레이션 항목
```

완료되지 않은 항목은 `준비 중`, `일부 구현`, `미구현`으로 명확히 구분한다.
