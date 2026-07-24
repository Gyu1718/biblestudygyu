# 자동 대비·다크모드 보완 패치

저장소 루트에 ZIP 내용을 그대로 덮어씁니다.

## 추가 파일
- `assets/js/auto-contrast.js`
- `assets/css/auto-contrast.css`

## 교체 파일
- `catalog.js`
- `bible/original.html`
- `lexicon/index.html`
- `lexicon/entry.html`

`catalog.js`는 로마서 버튼과 홈페이지 조밀형 카드 패치를 포함한 최신본입니다.

## 동작
- 시스템 테마, 라이트, 다크 선택을 공통으로 사용합니다.
- `--paper`, `--panel`, `--card`, `--band`, `--lapis`, `--deep`, `--ochre`의 실제 명도를 계산합니다.
- 각 배경에서 흰색 계열과 짙은색 계열 중 대비가 높은 글자색을 자동 선택합니다.
- 보조 글자색도 WCAG AA 일반 텍스트 기준인 4.5:1 이상을 목표로 계산합니다.
- 사용자 CSS가 배경 변수를 바꾸면 약 1.2초 안에 다시 계산합니다.
- 시스템 다크모드가 변경되거나 테마 토글을 누르면 즉시 다시 계산합니다.

## 임의 배경 요소

사용자 지정 배경을 가진 요소에는 다음 속성을 붙입니다.

```html
<section data-auto-contrast style="background:#735947">
  <h2>자동 글자색</h2>
  <p data-auto-contrast-muted>자동 보조 글자색</p>
</section>
```

JavaScript가 실제 렌더링된 배경색을 읽어 `--auto-contrast-ink`와 `--auto-contrast-soft`를 설정합니다.

## 범위
- 홈페이지
- 원어성경 읽기
- 원어사전 검색·상세 페이지
- 기존 연구 문서는 원래의 `theme.css` 다크모드를 계속 사용합니다.

기존 연구 문서에서 임의 배경 자동 대비까지 사용하려면 해당 문서에 아래 두 줄을 추가할 수 있습니다.

```html
<link rel="stylesheet" href="상대경로/assets/css/auto-contrast.css">
<script src="상대경로/assets/js/auto-contrast.js" defer></script>
```
