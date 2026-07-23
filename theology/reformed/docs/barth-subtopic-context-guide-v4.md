# Barth subtopic context v4 guide

## 핵심 변경

v4는 `CD 권/부 §번호` 단위 설명이 아니라, 그 아래의 `subtopicContexts[]` 단위 설명을 기준으로 합니다.

각 소주제는 다음 필드를 갖습니다.

- `label`: 소주제명
- `oneLineSummary`: 카드 첫 줄 요약
- `coreThesis`: 해당 소주제의 핵심 논지
- `detail`: 인용구 위 설명과 상세 카드에 사용할 본문
- `focusQuestion`: 인용 전 독자가 붙잡아야 할 질문
- `quoteContext`: 인용구 바로 위에 표시할 설명
- `argumentRole`: 이 소주제가 전체 논증 안에서 맡는 역할
- `reformedComparison`: 개혁파 정통과 비교할 때의 관찰점
- `researchUse`: 연구·설교·카드뉴스 활용 방식
- `misuseWarning`: 사용 시 피해야 할 설명 방식
- `concepts`: 검색·태그용 개념

## 적용 규칙

1. `data/barth-subtopic-contexts-v4.json`을 `data/`에 업로드합니다.
2. `js/barth-subtopic-context-normalize-v4.js`를 `app.js`보다 먼저 로드합니다.
3. `js/quote-context-enhance-v4.js`를 `app.js`보다 뒤에 로드합니다.
4. 기존 v1/v2/v3 스크립트를 함께 쓰지 않는 편이 안전합니다.

## 중요한 원칙

인용구 위 설명에는 `sectionSummary`보다 `subtopicContexts[].quoteContext`를 우선 사용합니다.  
즉 `CD IV/1 §62` 전체 설명이 아니라, 그 아래 `그리스도교 공동체의 근거`, `성령에 의한 공동체의 소집`, `모임 안에서의 말씀과 증언`, `칭의의 교회론적 현실화` 각각의 설명이 달라야 합니다.
