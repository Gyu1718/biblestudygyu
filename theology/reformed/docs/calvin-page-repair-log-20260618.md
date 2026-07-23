# 칼빈 페이지 보수 작업 로그 — 2026-06-18

## 적용 완료

### 1. 소주제 설명 렌더링 보강

수정 파일: `js/calvin-subtopics-render.js`

변경 내용:

- 공통 바르트식 책 상세 레이아웃은 그대로 유지한다.
- 칼빈 책 상세 페이지의 각 장 펼침 영역 안에 `Subtopic Notes` 카드 영역을 추가한다.
- `chapter.subtopicsRaw`를 우선 사용하여 다음 필드를 화면에 보존한다.
  - 설명
  - 핵심 질문
  - 논증 역할
  - 오독 방지
  - 인용 후보 위치
- 장 단위 `quoteTargets`도 `Quote Targets` 카드로 표시한다.

### 2. 소주제 데이터 병합 로직 보강

수정 파일: `js/calvin-subtopics-preload.js`

변경 내용:

- 기존 방식: `studyNote.subtopicNotes`가 있으면 `expanded-v3.subtopics`를 대체했다.
- 변경 방식: 같은 장의 `studyNote.subtopicNotes`와 `expanded-v3.subtopics`를 병합한다.
- 병합된 원본 객체를 `chapter.subtopicsRaw`에 보존한다.
- `quoteTargets`, `caution`, `connections`, `refs`가 사라지지 않도록 보존한다.
- `book-description-standardize.js`가 `chapter.subtopics`를 제목 배열로 바꾸더라도, 렌더러가 `subtopicsRaw`를 읽어 상세 설명을 표시할 수 있게 했다.

### 3. 인용 후보 위치 데이터 추가

추가 파일: `data/quotes/calvin-institutes-quote-targets-v1.json`

변경 내용:

- 직접 인용문이 아직 없는 장을 중심으로 43개 인용 후보 위치를 추가했다.
- 이 파일은 원문 인용이 아니라 위치 후보와 선별 이유만 담는다.
- 실제 인용문은 추후 `calvin-institutes-quotes-v5.json` 이상에서 합법 소장본 기준으로 짧은 완결문만 추가한다.

### 4. 인용 후보 위치 프리로드

수정 파일: `js/calvin-quotes-preload.js`

변경 내용:

- 기존 직접 인용구 v1-v4 로딩은 유지한다.
- 새 `calvin-institutes-quote-targets-v1.json`을 추가로 로딩한다.
- 각 장에 `chapter.quoteTargets`를 붙인다.

### 5. 보수 체크리스트 추가

추가 파일: `docs/calvin-page-repair-checklist.md`

변경 내용:

- 단계별 보수 항목을 문서화했다.
- 직접 인용 보강 대상 장을 권별로 정리했다.
- 후속 작업 순서를 남겼다.

## 다음 단계

1. `calvin-institutes-quotes-v5.json` 생성
   - 제1권과 제2권 누락 핵심 장 우선 보강
2. `calvin-institutes-quotes-v6.json` 생성
   - 제3권 칭의 후반부와 예정론 후반부 보강
3. `calvin-institutes-quotes-v7.json` 생성
   - 제4권 교회정치·교회권위·서원·미사·다섯 의식 보강
4. 루트 `calvin-institutes.json` 정리
   - 운영 기준 파일과 혼동되지 않도록 삭제 또는 archive 이동
5. 제4권 study note JSON pretty-print 정리
