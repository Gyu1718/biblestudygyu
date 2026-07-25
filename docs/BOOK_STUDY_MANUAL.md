# 성경책 연구 서가 제작 매뉴얼

> 저장소: `Gyu1718/biblestudygyu`  
> 기준 페이지: `ot/esther/index.html`  
> 적용일: 2026-07-25  
> 표준형 적용 대상: 느헤미야, 학개, 로마서 및 앞으로 추가되는 일반 성경책 연구 세트  
> 예외형: 시편, 호세아  
> 기준 사례 보존: 에스더

## 1. 목적

각 성경책의 자료를 하나의 책별 서가 홈페이지에서 일관되게 찾도록 한다. 표준형 책은 다음 네 단계를 같은 순서로 제공한다.

1. 성경 읽기
2. 종합 개관
3. 장별 심층연구
4. 원어 연구

실제 파일이 없는 연구는 링크하지 않고 `준비 중`이나 `미구현`으로 표시한다.

## 2. 표준 파일 구조

```text
ot/<book>/
├── index.html
├── overview.html
├── ch01.html
├── ch02.html
├── ...
└── parsing/
    ├── ch01.html
    └── ...
```

신약도 동일하다.

```text
nt/<book>/
├── index.html
├── overview.html
├── ch01.html
├── ...
└── parsing/
```

새 원어 연구의 기본 경로는 `parsing/chNN.html`이다. 파싱, 축자 대역, 형태론, 구문 분석과 인터라이너 요소를 한 문서 안에서 통합할 수 있다.

실제 내용이 없는 `chNN.html`이나 `parsing/chNN.html`은 미리 만들지 않는다.

## 3. 서가 홈페이지 필수 순서

```text
상단 내비게이션
히어로
읽기와 연구
성경 본문 바로가기
장별 연구 서가
장별 자료 현황
자료 출처 또는 주석 범례
푸터
```

공통 스타일:

```html
<link rel="stylesheet" href="../../assets/theme.css">
<link rel="stylesheet" href="../../assets/app.css">
<link rel="stylesheet" href="../../assets/css/bible-reader.css" data-bible-reader-css>
<link rel="stylesheet" href="../../assets/css/book-shelf.css">
```

공통 스크립트:

```html
<script src="../../assets/app.js"></script>
<script src="../../assets/js/bible-reader.js" defer data-bible-reader-js></script>
```

권장 `body` 선언:

```html
<body
  class="book-shelf-page"
  data-book="romans"
  data-kind="study-home"
  data-root="../../"
  data-script="grk">
```

`data-script` 값:

```text
heb  구약 히브리어·아람어
grk  신약 헬라어
```

## 4. 네 단계 구현

### ① 성경 읽기

공통 성경 리더로 연결한다.

```text
../../bible/original.html?book=<BOOK_CODE>&chapter=<CHAPTER>
```

- 모든 장을 처음부터 활성화한다.
- 연구 진행 여부와 무관하다.
- 구약은 WLC/OSHB, 신약은 NA28, 한국어는 개역개정 런타임 데이터를 사용한다.

### ② 종합 개관

표준 파일은 `overview.html`이다.

권장 내용:

1. 책의 명칭과 정경적 위치
2. 저자와 연대
3. 역사·사회·문화적 배경
4. 본문과 전승
5. 문학 구조
6. 장별 개요
7. 중심 신학
8. 정경적·복음적 연결
9. 해석사의 쟁점
10. 참고문헌

### ③ 장별 심층연구

표준 파일은 `ch01.html`, `ch02.html` 형식이다.

권장 내용:

```text
0. 단락의 짜임
1. 단락별 절 범위 주해
2. 핵심 원어와 문법
3. 주석가별 쟁점
4. 역사·문화적 배경
5. 상호 참조
6. 정경적 연결
7. 신학 종합
8. 설교·교육을 위한 메시지
```

왼쪽 사이드바의 전체 장 이동 링크는 실제 HTML에 기록한다. 현재 장에는 `aria-current="page"`를 둔다. 핵심 링크를 자바스크립트로만 생성하지 않는다.

### ④ 원어 연구

사용자 화면의 명칭은 `원어 연구`로 통일한다.

다룰 수 있는 요소:

- 원문
- 음역
- 축자 대역
- 형태론 파싱
- 표제어와 어근
- 구문 기능
- 문장 단위 관찰
- 번역 비교

기존 느헤미야 `interlinear/`는 호환성을 위해 보존한다. 새 책에서는 `parsing/`을 기본 진입점으로 사용한다.

## 5. 실제 링크와 상태

완성된 문서:

```html
<a href="ch01.html">심층연구</a>
```

미완성 문서:

```html
<span role="note" aria-disabled="true" class="disabled">준비 중</span>
```

금지:

- `href="#"`로 준비 중 상태 표현
- 존재하지 않는 파일 연결
- CSS로 오류 링크를 숨기는 방식
- 저장소에 없는 파일을 완료로 표기

사용 상태는 다음으로 제한한다.

```text
완성
일부 구현
준비 중
미구현
```

## 6. 화면 설정·연구 도크 자동 적용

모든 연구 HTML에는 화면 설정·연구 도크 버튼이 나타나야 한다.

자동 적용 프로그램:

```bash
python3 tools/apply_study_tools.py --write
python3 tools/apply_study_tools.py --check
```

대상:

```text
ot/**/*.html
nt/**/*.html
theology/**/*.html
```

프로그램은 빠진 자산을 상대경로에 맞춰 삽입한다.

```text
assets/theme.css
assets/app.css
assets/app.js
```

`app.js`가 연구 도크 로더를 실행하므로 화면 설정과 연구 도구 버튼이 생성된다. `.github/workflows/bible-reader.yml`이 새 연구 페이지나 관련 공통 자산이 변경될 때 자동으로 프로그램을 실행하고 필요한 HTML 변경을 커밋한다.

특정 HTML을 자동 적용에서 제외하려면 문서 안에 `data-no-study-tools`를 둔다.

표준 연구 페이지에서는 예전 자동 `원어성경 보기` 사이드바 버튼을 사용하지 않는다. 책별 서가와 명시적 성경읽기 링크를 기준으로 삼는다.

## 7. 장별 심층연구 사이드바

상단 순서:

```text
← 책별 서가
서고 홈
성경읽기
원어 연구 또는 원어 연구 준비 중
```

이후 순서:

```text
책 이름 + 현재 장
문서 유형
장 이동
전체 장 버튼
현재 문서 목차
```

예:

```html
<div class="chapter-jump">
  <a href="ch01.html">1</a>
  <a href="ch02.html" aria-current="page">2</a>
</div>
```

원어 연구 파일이 없으면 링크 대신 상태 텍스트를 둔다.

## 8. 책별 예외

### 에스더

표준형 서가의 기준 사례다. 별도 요청 없이 구조를 바꾸지 않는다. 장별 자료가 추가될 때 비활성 책등과 목록만 실제 링크로 전환한다.

### 시편

시편 150편을 다섯 권의 정경 구조로 연구하는 예외형이다. 표준형 150개 책등 구조로 변환하지 않는다.

### 호세아

기존 통합 연구 노트 구조를 유지한다. 별도 지시 없이 표준형으로 재편하지 않는다.

화면 설정·연구 도크 자동 적용은 예외형 페이지에도 적용한다. 예외는 정보 구조에 관한 것이며 공통 도구 기능의 예외가 아니다.

## 9. 현재 적용 현황

| 책 | 유형 | 성경읽기 | 종합 개관 | 장별 심층연구 | 원어 연구 |
|---|---|---:|---:|---:|---:|
| 느헤미야 | 표준형 | 활성 | 완성 | 1–13장 완성 | 파싱 13장, 기존 인터라이너 5장 |
| 학개 | 표준형 | 활성 | 완성 | 1–2장 완성 | 1:1–4 표본 |
| 로마서 | 표준형 | 활성 | 완성 | 1–16장 완성 | 미구현 |
| 에스더 | 기준 사례 | 활성 | 완성 | 준비 중 | 미구현 |
| 시편 | 예외형 | 기존 유지 | 기존 유지 | 권별 연구 | 기존 유지 |
| 호세아 | 예외형 | 기존 유지 | 기존 유지 | 통합 연구 | 기존 유지 |

## 10. 카탈로그와 문서 갱신

책의 상태를 바꾸면 같은 작업에서 다음 파일을 점검한다.

```text
catalog.js
README.md
docs/BOOK_STUDY_MANUAL.md
책 폴더의 README.md가 있으면 해당 문서
```

카탈로그와 문서의 구현 상태는 저장소 실제 파일과 일치해야 한다.

## 11. 검증

자동 검증:

```bash
python3 tools/apply_study_tools.py --check
python3 tools/apply_bible_reader.py --check
```

추가 확인:

- 서고 홈과 책별 서가 링크
- 성경읽기 책 코드와 장 번호
- 개관·심층연구·원어 연구 파일 존재 여부
- 깨진 로컬 링크와 목차 앵커
- 중복 HTML `id`
- 현재 장 `aria-current`
- 비활성 요소의 `aria-disabled="true"`
- 데스크톱·모바일·다크 모드
- 연구 도크와 다른 플로팅 버튼 충돌
- `catalog.js` JavaScript 문법

## 12. 새 책 작업 절차

1. 책 코드와 장 수를 확인한다.
2. 책 폴더를 만든다.
3. `overview.html`을 작성한다.
4. `index.html`에서 모든 장의 성경읽기를 활성화한다.
5. 실제 존재하는 장별 연구만 활성화한다.
6. 원어 연구는 `parsing/` 아래에서 시작한다.
7. `python3 tools/apply_study_tools.py --write`를 실행한다.
8. `python3 tools/apply_bible_reader.py --write`를 실행한다.
9. `catalog.js`와 `README.md`를 갱신한다.
10. 링크·앵커·중복 ID와 화면을 검증한다.

## 13. 금지 사항

- 출처 확인 없이 주석 내용을 창작하지 않는다.
- 원본 EPUB·PDF·DJVU·폰트 파일을 공개 저장소에 올리지 않는다.
- 대한성서공회 사이트를 크롤링하지 않는다.
- WLC/OSHB를 BHS라고 표기하지 않는다.
- SBLGNT를 NA28이라고 표기하지 않는다.
- 미완성 파일을 완료로 표시하지 않는다.
- 에스더·시편·호세아의 구조를 별도 요청 없이 변경하지 않는다.
