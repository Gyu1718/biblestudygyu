# 바르트 책 상세 보완 v5 적용 안내

## 1. 기존 v1-v4 파일 정리

이전에 넣은 아래 스크립트가 있다면 `index.html`에서 제거하는 편이 좋습니다.

```html
<script src="./js/section-context-normalize.js"></script>
<script src="./js/barth-section-context-normalize-v2.js"></script>
<script src="./js/barth-subtopic-context-normalize-v3.js"></script>
<script src="./js/barth-subtopic-context-normalize-v4.js"></script>
<script src="./js/quote-context-enhance.js"></script>
<script src="./js/quote-context-enhance-v2.js"></script>
<script src="./js/quote-context-enhance-v3.js"></script>
<script src="./js/quote-context-enhance-v4.js"></script>
```

## 2. 새 파일 업로드

ZIP을 풀고 저장소 루트에 그대로 업로드합니다.

```txt
data/barth-book-deep-context-v5.json
js/barth-book-deep-enhance-v5.js
docs/barth-book-improvement-audit-v5.md
docs/index-script-order-snippet-v5.txt
README_APPLY.md
manifest.json
```

## 3. index.html 스크립트 순서

`js/app.js` 뒤에 아래 한 줄을 추가합니다.

```html
<script src="./js/barth-book-deep-enhance-v5.js"></script>
```

권장 위치:

```html
<script src="./js/app.js"></script>
<script src="./js/barth-book-deep-enhance-v5.js"></script>
```

기존 UI 보강 스크립트가 여러 개 있으면 충돌할 수 있으므로, 바르트 책 상세 설명은 v5 하나만 쓰는 것을 권장합니다.

## 4. 적용 후 확인할 것

책 탭에서 바르트 『교회교의학』 상세 페이지를 열고 다음을 확인합니다.

- `CD IV/1 §59`와 `§60`의 본문 설명이 서로 다른가?
- 각 § 아래에 소주제 카드가 보이는가?
- 소주제 카드 안에 `핵심`, `초점 질문`, `개혁파 비교`, `연구 활용`이 따로 보이는가?
- 인용구 위 설명이 소주제별로 달라지는가?

## 5. 이번 v5의 성격

v5는 원문 전체를 게시하는 파일이 아닙니다. 공개 저장소에 올릴 수 있는 연구용 해설, 구조화된 소주제 설명, 짧은 인용 위치 설명만 제공합니다.
