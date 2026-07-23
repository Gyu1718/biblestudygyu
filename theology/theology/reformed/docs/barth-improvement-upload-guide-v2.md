# 바르트 개선 업로드 팩 v2 적용 안내

## 목적

v1은 각 §가 구분되기는 했지만 설명이 짧아 연구용 카드 설명으로는 부족했습니다. v2는 바르트 『교회교의학』 75개 § 전체에 대해 다음 필드를 분리했습니다.

- `oneLineSummary`: 카드 첫 줄용 짧은 요약
- `summary`: 해당 §의 핵심 논지
- `coreThesis`: 그 §에서 바르트가 주장하는 중심 명제
- `argumentRole`: 『교회교의학』 전체 논증 안에서의 자리
- `reformedComparison`: 칼빈·개혁파 정통과 비교할 때 읽어야 할 지점
- `researchUse`: 설교·강의·논문 색인에서의 활용 방식
- `quoteContext`: 인용구 위에 붙는 고유 설명

## 업로드 경로

ZIP을 풀고 저장소 루트에 그대로 업로드합니다.

```txt
data/barth-section-contexts-v2.json
js/barth-section-context-normalize-v2.js
js/quote-context-enhance-v2.js
docs/index-script-order-snippet-v2.txt
docs/barth-improvement-upload-guide-v2.md
```

## index.html 스크립트 순서

`app.js` 이전에 다음을 넣습니다.

```html
<script src="./js/barth-section-context-normalize-v2.js"></script>
```

`app.js` 이후에 다음을 넣습니다.

```html
<script src="./js/quote-context-enhance-v2.js"></script>
```

권장 위치는 다음과 같습니다.

```html
<script src="./js/preload-data.js"></script>
<script src="./js/history-preload.js"></script>
<script src="./js/topic-guides.js"></script>
<script src="./js/topic-answers.js"></script>
<script src="./js/calvin-quotes-preload.js"></script>
<script src="./js/bavinck-preload.js"></script>
<script src="./js/bavinck-quotes-preload.js"></script>
<script src="./js/berkhof-preload.js"></script>
<script src="./js/barth-section-context-normalize-v2.js"></script>
<script src="./js/app.js"></script>
<script src="./js/quote-context-enhance-v2.js"></script>
```

## v1과의 차이

v1 설명 예시는 대체로 “이 절은 무엇을 다룬다” 수준이었습니다. v2는 각 §마다 다음 구조로 설명합니다.

```txt
핵심 논지 → 논증 위치 → 개혁파 비교 → 연구 활용 → 인용구 위 설명
```

예를 들어 `CD IV/1 §62 성령과 그리스도교 공동체의 모임`은 단순히 “교회론”이라고 하지 않고, 칭의의 교회론적 귀결, 성령의 공동체 소집, 그리스도의 화해 증언, 개혁파 교회론과의 비교까지 표시합니다.

## 주의

이 팩은 공개 저장소용 연구 색인입니다. 원문 전체, 긴 번역문, OCR 전문은 포함하지 않습니다.
