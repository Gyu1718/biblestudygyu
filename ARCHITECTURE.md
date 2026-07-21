# 아키텍처 — 성서 연구 서고

이 문서는 **운영자 관점**에서 사이트를 어떻게 구성했고, 어떻게 기능을 넣고 빼며, 어떻게 느헤미야를 넘어 **모든 성경 연구를 축적**하는지 설명한다.

## 설계 원칙: 세 겹의 분리

콘텐츠·기능·표현을 분리해, 운영자가 만지는 곳과 연구 내용이 사는 곳을 나눴다.

```
① 콘텐츠 (원본 연구)        ← 손대지 않는다. 데이터 유실 없음.
   ot/<book>/*.html          심층 연구
   ot/<book>/parsing/*.html  원어 파싱
   ot/<book>/interlinear/*   인터라이너

② 데이터 (연결 정보)        ← 스크립트로 생성. 사람이 직접 안 쓴다.
   data/xrefs/<book>.json    관주 (OpenBible.info)
   data/links/<book>.json    절↔연구 이동 지도
   data/krv_<book>.json      번역 본문(허브 표시용, 선택)

③ 기능·표현 (레이어)        ← 여기만 고치면 전체에 반영.
   assets/theme.css          색·반응형(라이트/다크·중단점)의 단일 출처
   assets/app.css            관주 패널·이동 링크·테마 토글 스타일
   assets/app.js             테마 토글 + 관주/이동 링크 자동 렌더링

④ 허브 (선택)
   ot/<book>/study/chNN.html 절별 본문 + 세 연구 이동 + 관주를 모은 관문
```

핵심: **기능은 ③에 모여 있다.** 관주 표시 방식을 바꾸려면 `app.js`·`app.css` 한 곳, 색을 바꾸려면 `theme.css` 한 곳만 고친다. 13개 장, 나아가 66권 전체에 일괄 반영된다.

## 페이지에서 기능 켜기 (단 두 줄 + 속성)

어떤 문서든 아래를 넣으면 다크 모드·관주·이동 링크가 켜진다.

```html
<!-- <head> 에 -->
<link rel="stylesheet" href="/assets/theme.css">
<link rel="stylesheet" href="/assets/app.css">

<!-- <body> 태그에 데이터 속성 -->
<body data-book="neh" data-chapter="1" data-kind="study" data-root="../../../">

<!-- 관주·링크를 붙일 절 요소에 -->
<section id="v5" data-v="5"> … </section>

<!-- 문서 끝에 (이 한 줄이 기능을 켠다) -->
<script src="/assets/app.js"></script>
```

- `data-book` — 책 코드(소문자). `data/xrefs/<book>.json`·`data/links/<book>.json`을 찾는 열쇠.
- `data-chapter` — 장 번호.
- `data-kind` — 이 문서가 어느 연구인지(`study`/`parsing`/`interlinear`/`hub`). 이동 링크에서 **자기 자신은 제외**하는 데 쓴다.
- `data-root` — 문서에서 사이트 루트까지의 상대 경로. `ot/<book>/` 안이면 `../../`, `ot/<book>/parsing/` 안이면 `../../../`.

**기능을 끄려면** `<script>` 한 줄을 빼거나 `data-book` 속성을 지운다. 원본 콘텐츠는 그대로다.

## 새 책을 추가하는 법

느헤미야와 똑같은 절차를 따른다. 예: 창세기.

1. **연구 문서 작성** — `ot/genesis/` 아래에 심층·파싱·인터라이너 문서를 둔다(원하는 것만 있어도 된다).
2. **관주 생성**
   ```
   python3 tools/build_xrefs.py <cross_references.txt> Gen
   → data/xrefs/gen.json
   ```
3. **이동 지도 생성**
   ```
   python3 tools/build_links.py ot/genesis gen
   → data/links/gen.json
   ```
4. **본문 JSON(허브용, 선택)** — 번역 본문을 `data/krv_gen.json`으로.
5. **카탈로그 등록** — `catalog.js`의 `studies` 배열에 항목 추가(홈이 자동 렌더).
6. **검증**
   ```
   python3 tools/validate.py
   ```

책 코드는 `tools/build_xrefs.py` 상단의 `KO` 표에 정의돼 있다(66권 + 주요 외경). 새 약칭이 필요하면 그 표에만 추가한다.

## 관주 데이터 규모 관리

`cross_references.txt`(OpenBible.info 전체)는 34만 행이다. **책별로 쪼개** 필요한 책만 `data/xrefs/`에 둔다. 한 책 JSON은 수십~수백 KB라 페이지에서 즉시 불러온다. 66권을 전부 생성해도 사이트 총량은 관리 가능한 수준이며, 각 페이지는 **자기 책 파일 하나만** 불러온다.

투표 수(참조 강도)로 정렬하고, 페이지에서는 상위 8개를 먼저 보이고 나머지는 "더 보기"로 접는다. 이 임계값은 `app.js`의 `THRESHOLD` 한 곳에서 바꾼다.

## 다크/라이트·반응형

- **색**은 전부 CSS 변수(`--lapis` 등)로, `theme.css`가 라이트/다크 두 벌을 정의한다. 원본 문서들이 이미 같은 변수명을 쓰므로, `theme.css`를 연결하기만 하면 다크 모드가 입혀진다.
- **모드 전환**은 `data-theme="auto|light|dark"`. `auto`(또는 미지정)는 시스템 설정(`prefers-color-scheme`)을 따른다. 우하단 토글이 이 값만 바꾼다.
- **반응형 중단점**은 `theme.css`에 공통 정의(모바일 600 / 태블릿 900 / 와이드 1180). 관주 패널은 좁은 화면에서 절 아래 아코디언, 넓은 화면(`body.xref-side` 켤 때)에서 절 옆 사이드로 뜬다.
- 접근성: 키보드 포커스 표시, `prefers-reduced-motion` 존중.

## 앞으로 기능을 얹을 자리

이 구조는 새 기능을 **데이터 + app.js 한 함수**로 얹게 되어 있다. 예를 들어:

- **설교 노트 연구**를 추가 → `ot/<book>/sermon/` 폴더 + `build_links.py`가 자동 인식 → 이동 링크에 "설교"가 늘어난다(`app.js`의 `STUDY_LABEL`·`STUDY_ORDER`에 한 줄 추가).
- **원어 낱말 색인**, **주제어 태그**, **인용 성구 팝오버** 등도 같은 방식(데이터 파일 + 렌더 함수)으로 확장한다.

원본 문서는 계속 그대로 두고, 연결과 기능만 바깥 레이어에서 자란다.
