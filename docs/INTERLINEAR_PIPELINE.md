# 신구약 인터라이너 자동화 파이프라인

인터라이너는 손으로 반복 작성하지 않고 STEPBible의 CC BY 4.0 데이터를 변환해 생성한다. 저장소의 원어 연구 표준 경로인 `parsing/chNN.html`에 결과를 배치한다.

## 지원 범위

| 영역 | 자료 | 상태 |
|---|---|---|
| 구약 히브리어·아람어 | TAHOT + TEHMC | 구현 |
| 신약 헬라어 | TAGNT + TEGMC | 구현 |
| 히브리어 한글 음역 | STEPBible 음역 기반 | 구현 |
| 헬라어 한글 음역 | TAGNT 음역 기반 | 구현 |
| 한국어 문법 라벨 | 형태코드 원자 조합 | 구현 |
| 장별 JSON → HTML | 신구약 공용 렌더러 | 구현 |
| 한국어 간이 뜻 | 선택형 gloss JSON | 사람 감수 필요 |
| 신약 이본 선택 | N·K·O·전체 | 구현 |

## 구조

```text
tools/interlinear/
├── fetch_sources.py
├── build_interlinear.py          구약 TAHOT
├── build_interlinear_gk.py       신약 TAGNT
├── render_interlinear.py         신구약 공용
├── validate_interlinear.py
├── morph_ko.py                   TEHMC 한국어화
├── morph_ko_gk.py                TEGMC 한국어화
├── translit_ko.py                히브리어 한글 음역
└── translit_gk_ko.py             헬라어 한글 음역

data/interlinear/<book>/<chapter>.json
assets/css/interlinear.css
ot/<book>/parsing/chNN.html
nt/<book>/parsing/chNN.html
```

## 원자료 받기

```bash
python3 tools/interlinear/fetch_sources.py
```

다음 자료만 sparse checkout으로 내려받는다.

```text
TAHOT · TAGNT · TEHMC · TEGMC · TBESH · TBESG
```

`sources/STEPBible-Data/`는 저장소에 커밋하지 않는다.

## 구약 생성

```bash
python3 tools/interlinear/build_interlinear.py \
  --book Neh --slug nehemiah --chapter 1 --verify-morphology

python3 tools/interlinear/render_interlinear.py \
  --input data/interlinear/nehemiah/01.json \
  --output ot/nehemiah/parsing/ch01.html \
  --book-slug nehemiah --book-title 느헤미야 --testament ot
```

책 전체는 `--chapter` 대신 `--all-chapters`를 사용한다.

## 신약 생성

```bash
python3 tools/interlinear/build_interlinear_gk.py \
  --book Rom --slug romans --chapter 8 \
  --text N --verify-morphology

python3 tools/interlinear/render_interlinear.py \
  --input data/interlinear/romans/08.json \
  --output nt/romans/parsing/ch08.html \
  --book-slug romans --book-title 로마서 --testament nt
```

신약의 `--text` 값:

| 값 | 출력 |
|---|---|
| `N` | NA28/SBL 계열 비평본문, 기본값 |
| `K` | TR/Byz 계열 |
| `O` | 기타 판본 |
| `all` | 모든 이본을 포함하고 낱말별 `variant` 필드를 저장 |

TAGNT는 판본 소속을 `N`, `K`, `O` 조합으로 표시한다. `N` 선택은 TAGNT가 표시한 비평본문 계열 낱말을 사용하며, 저장소의 NA28 원문 리더 자체를 형태 분석한 데이터라는 뜻은 아니다.

## JSON schema 2

```jsonc
{
  "book": "Rom",
  "chapter": 8,
  "lang": "grc",
  "schema": 2,
  "text": "NA28/SBL 계열 비평본문",
  "src": "STEPBible TAGNT (CC BY 4.0)",
  "v": [{
    "n": 1,
    "w": [{
      "i": 1,
      "t": "Οὐδὲν",
      "tr": "Ouden",
      "m": ["A-NSN"],
      "s": ["G3762"],
      "lem": "οὐδείς",
      "en": "No"
    }]
  }]
}
```

공통 낱말 필드:

```text
i    절 안 낱말 번호
t    원어 표면형
tr   STEPBible 음역
m    형태코드 배열
s    Strong 번호 배열
lem  표제어
en   STEPBible 영어 간이 뜻
```

한글 음역과 한국어 문법 설명은 렌더링할 때 계산한다. 표기 규칙을 수정한 뒤 전체 HTML을 재생성할 수 있다.

## 한국어 뜻

선택형 gloss JSON 예:

```json
{
  "G2631": {"ko": "유죄 판결, 정죄", "draft": false},
  "H1697G": {"ko": "말, 사건, 일", "draft": false}
}
```

검수되지 않은 뜻은 `draft: true`로 둔다. gloss 파일이 없으면 STEPBible의 영어 간이 뜻을 임시 표시한다.

## 검증

```bash
python3 tools/interlinear/validate_interlinear.py \
  data/interlinear/romans/08.json \
  nt/romans/parsing/ch08.html
```

검증 항목:

- schema 2
- 절·낱말 번호 순서와 중복
- 원어·음역·형태·Strong 필드
- CC BY 4.0 출처
- HTML 공통 CSS와 중복 ID

## GitHub Actions

`.github/workflows/interlinear.yml`을 수동 실행한다. `testament`, 책 코드, 슬러그, 제목, 장 번호를 입력하면 신구약 중 알맞은 빌더가 실행되고 JSON과 HTML을 artifact ZIP으로 제공한다. 신약에서는 본문 계열도 선택할 수 있다.

생성 결과를 자동으로 `main`에 커밋하지 않는다. 원어 뜻과 음역을 검수한 후 해당 책의 `parsing/` 경로와 서가 링크를 활성화한다.

## 라이선스

원자료는 STEPBible.org와 Tyndale House Cambridge의 CC BY 4.0 데이터다. 생성 페이지마다 다음 출처를 표시한다.

> 원어 데이터: STEPBible.org (CC BY 4.0), 원자료 Tyndale House Cambridge. 형태 분석 TAHOT/TEHMC 또는 TAGNT/TEGMC.
