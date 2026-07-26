# 인터라이너 자동화 파이프라인

인터라이너는 손으로 반복 작성하지 않고 STEPBible의 CC BY 4.0 데이터를 변환해 생성한다. 저장소의 원어 연구 표준 경로인 `parsing/chNN.html`에 결과를 배치한다.

## 현재 지원 범위

- 구약 TAHOT → 장별 JSON: 지원
- TEHMC 형태코드 → 한국어 문법 라벨: 지원
- STEPBible 음역 → 한글 음역: 지원
- 장별 JSON → 원어 연구 HTML: 지원
- 한국어 간이 뜻: 선택형 gloss JSON
- 신약 TAGNT 변환: 아직 구현하지 않음

## 구조

```text
tools/interlinear/
├── fetch_sources.py
├── build_interlinear.py
├── render_interlinear.py
├── validate_interlinear.py
├── morph_ko.py
└── translit_ko.py

data/interlinear/<book>/<chapter>.json
assets/css/interlinear.css
ot/<book>/parsing/chNN.html
```

## 실행

```bash
python3 tools/interlinear/fetch_sources.py

python3 tools/interlinear/build_interlinear.py \
  --book Neh --slug nehemiah --chapter 1 --verify-morphology

python3 tools/interlinear/render_interlinear.py \
  --input data/interlinear/nehemiah/01.json \
  --output ot/nehemiah/parsing/ch01.html \
  --book-slug nehemiah --book-title 느헤미야

python3 tools/interlinear/validate_interlinear.py \
  data/interlinear/nehemiah/01.json \
  ot/nehemiah/parsing/ch01.html
```

책 전체는 `--chapter` 대신 `--all-chapters`를 사용한다.

## JSON schema 2

낱말에는 다음 필드를 저장한다.

```text
i    절 안 낱말 번호
t    원어 표면형
tr   STEPBible 음역
m    형태코드 배열
s    Strong 번호 배열
lem  표제어
en   STEPBible 영어 간이 뜻
```

한글 음역과 한국어 문법 설명은 렌더링할 때 계산한다. 표기 규칙을 수정하면 모든 장에 일괄 반영된다.

## 한국어 뜻

선택형 gloss JSON 예:

```json
{
  "H1697G": {"ko": "말, 사건, 일", "draft": false}
}
```

검수되지 않은 뜻은 `draft: true`로 둔다. gloss 파일이 없으면 영어 간이 뜻을 임시 표시한다.

## GitHub Actions

`.github/workflows/interlinear.yml`을 수동 실행한다. 책 코드·슬러그·장 번호를 입력하면 JSON과 HTML을 생성하고 검증한 뒤 artifact ZIP으로 제공한다. 자동으로 `main`에 커밋하지 않는다.

## 라이선스

원자료는 STEPBible.org와 Tyndale House Cambridge의 CC BY 4.0 데이터다. 생성 페이지마다 다음 출처를 표시한다.

> 원어 데이터: STEPBible.org (CC BY 4.0), 원자료 Tyndale House Cambridge. 형태 분석 TAHOT/TEHMC.

`sources/STEPBible-Data/`는 저장소에 커밋하지 않는다.
