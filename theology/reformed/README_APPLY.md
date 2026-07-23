# Barth Improvement Upload Pack v5

이번 v5는 사용자가 지적한 핵심 문제, 곧 **책-바르트 상세 화면에서 §별 설명이 아니라 소주제별 설명이 필요하다**는 요구를 기준으로 다시 만든 업로드 팩입니다.

## 포함 파일

```txt
data/barth-book-deep-context-v5.json
js/barth-book-deep-enhance-v5.js
docs/barth-book-improvement-audit-v5.md
docs/barth-book-deep-context-guide-v5.md
docs/index-script-order-snippet-v5.txt
README_APPLY.md
manifest.json
```

## 핵심 변경

- 75개 § 전체 보완
- 214개 소주제별 설명 생성
- `chapter.detail` 반복 문제 해결
- `subtopicDetails[]`를 실제 화면 카드로 렌더링
- quote context를 소주제 기준으로 보정
- 개혁파 비교와 연구 활용을 소주제마다 분리

## 적용 방법

1. ZIP을 풀어 저장소 루트에 업로드합니다.
2. `index.html`에서 기존 v1-v4 관련 스크립트를 제거합니다.
3. `js/app.js` 바로 뒤에 다음 줄을 추가합니다.

```html
<script src="./js/barth-book-deep-enhance-v5.js"></script>
```

## 확인 기준

`CD IV/1 §59`와 `CD IV/1 §60`을 열었을 때 같은 문장이 반복되면 실패입니다.

성공한 경우 각 항목 아래에 다음과 같은 소주제 카드가 보입니다.

- `§59`: 하나님의 아들의 낮아지심 / 순종의 자유 / 대속적 종의 길
- `§60`: 인간의 교만 / 타락의 형태 / 십자가 아래 드러나는 죄
- `§62`: 그리스도교 공동체의 근거 / 성령에 의한 공동체의 소집 / 모임 안에서의 말씀과 증언 / 칭의의 교회론적 현실화
