# 마가복음 서가 패키지 — 설치와 이어가기

성서 연구 서고(`Gyu1718/biblestudygyu`)에 **마가복음 서가**를 추가하는 패키지다.
`ARCHITECTURE.md`의 "새 책을 추가하는 법"과 `CONTENT-SPEC.md`의 문서 규격을 따랐다.

## 담긴 것

```
nt/mark/index.html      마가복음 연구 서가 (책별 서가 홈, 표준형)
nt/mark/overview.html   마가복음 종합 개관 (16절 구성)
nt/mark/ch01.html       1장 심층연구 — 광야의 소리 (16절 구성)
nt/mark/ch02.html       2장 심층연구 — 죄 사함의 권세 (11절 구성)
nt/mark/ch03.html       3장 심층연구 — 열둘을 세움 (13절 구성)
nt/mark/ch04.html       4장 심층연구 — 씨 뿌리는 자 (15절 구성)
nt/mark/ch05.html       5장 심층연구 — 두 딸의 구원 (12절 구성)
nt/mark/ch06.html       6장 심층연구 — 광야의 식탁 (14절 구성)
nt/mark/ch07.html       7장 심층연구 — 고르반 논쟁 (13절 구성)
nt/mark/ch08.html       8장 심층연구 — 가이사랴 빌립보 (13절 구성)
nt/mark/ch09.html       9장 심층연구 — 변화산 (14절 구성)
nt/mark/ch10.html       10장 심층연구 — 섬기는 인자 (14절 구성)
nt/mark/ch11.html       11장 심층연구 — 예루살렘 입성 (12절 구성)
nt/mark/ch12.html       12장 심층연구 — 버린 돌 머릿돌 (13절 구성)
nt/mark/ch13.html       13장 심층연구 — 깨어 있으라 (14절 구성)
nt/mark/ch14.html       14장 심층연구 — 겟세마네의 밤 (15절 구성)
nt/mark/ch15.html       15장 심층연구 — 백부장의 고백 (14절 구성)
nt/mark/ch16.html       16장 심층연구 — 빈 무덤 (13절 구성)
validate_mark.py        검증 스크립트 (태그·앵커·표·링크·개역개정 전수 대조)
patch/catalog.js        마가 항목을 삽입한 catalog.js 전체 파일 (교체용)
patch/catalog-mark-entry.js   삽입할 항목만 담은 조각 (직접 편집용)
```

## 설치 (3단계)

```bash
# 1) 서가 문서 배치
mkdir -p nt/mark
cp <패키지>/nt/mark/index.html   nt/mark/
cp <패키지>/nt/mark/overview.html nt/mark/

# 2) 카탈로그 등록 — 둘 중 하나
cp <패키지>/patch/catalog.js .            # 통째로 교체 (권장)
# 또는 catalog.js 의 nt 섹션 studies 배열 맨 앞에 조각을 직접 붙여넣기

# 3) 검증
python3 tools/validate.py
```

관주·이동 지도는 장별 심층연구가 생긴 뒤에 만든다.

```bash
python3 tools/build_xrefs.py cross_references.txt Mark   # → data/xrefs/mark.json
python3 tools/build_links.py nt/mark mark                # → data/links/mark.json
```

책 코드 약칭은 `tools/build_xrefs.py` 상단 `KO` 표에서 확인할 것.
성경읽기 리더의 책 코드는 **`MRK`**(`bible/original.html?book=MRK&chapter=N`)이며,
서가 문서의 링크는 모두 이 코드로 맞춰 두었다.

## 규격 적용 내역

| 항목 | 적용 |
|---|---|
| 서가 홈 형식 | `nt/romans/index.html`·`nt/acts/index.html`과 동일한 `book-shelf-page` 골격, `data-book="mark"` `data-kind="study-home"` `data-root="../../"` `data-script="grk"` |
| 개관 형식 | `nt/acts/overview.html`과 동일한 좌측 sticky 목차 + `section.part` 구성, `data-kind="overview"` `data-chapter="0"` |
| 색·서체 | CSS 변수만 사용, `theme.css`·`app.css` 연결 → 라이트/다크 자동 적용 |
| 반응형 | 모바일 600 / 태블릿 900 / 980 중단점, 표는 `.tbl-wrap` 좌우 스크롤 |
| 접근성 | `skip-link`, `aria-label`, `aria-disabled`, `prefers-reduced-motion` |
| 주석 칩 | 약칭 + 색상 칩 방식 유지 (§3). 마가복음용 여덟 칩으로 교체 |
| 심층연구 형식 | `nt/acts/ch01.html`과 동일한 골격 — STRUCTURE → 절 범위별 주해 → LEXIS → READINGS → BACKGROUND → CROSS-REFERENCES → SYNTHESIS |
| 검증 | 태그 균형 0오류 · 앵커 무결성 0오류 · 표 열 수 일치 · 공백 닫는 태그 없음 · 개역개정 전수 대조 불일치 0 |

### 마가복음 주석 칩 (CONTENT-SPEC §3의 책별 교체)

| 칩 | 저작 | 해석 축 | 색 |
|---|---|---|---|
| **F** | France, *The Gospel of Mark* (NIGTC 2002) | 헬라어 주해 · 세 막 드라마 · 본문비평 | `--f` #3c5a83 |
| **S** | Stein, *Mark* (BECNT 2008) | 문법·구문 · 저자 의도 · 공관복음 문제 | `--s` #37665a |
| **E** | Edwards, *Mark* (PNTC 2002) | 신학 주해 · 샌드위치 기법 · 목회적 적용 | `--e` #8a4658 |
| **W** | Witherington, *Mark* (2001) | 고대 전기 · 사회수사학 · 로마 정황 | `--w` #655a8c |
| **R** | Rhoads·Dewey·Michie, *Mark as Story* | 서사비평 · 구술 수행 | `--r` #7a5a38 |
| **Wa** | Watts, *Isaiah's New Exodus in Mark* | 구약 사용 · 새 출애굽 구조 | `--wa` #1d6a73 |
| **Ba** | Bauckham, *Jesus and the Eyewitnesses* | 목격자 증언 · 파피아스 재독해 | `--ba` #6e5a2e |
| **G** | Gundry, *Mark* (1993) | 십자가 변증 논제 · 본문 세부 | `--g` #7a3f2e |
| ~~He~~ | ~~Hengel, *Judaism and Hellenism*~~ | 스캔본이라 사용 불가 (위 §정직성 고지) | — |

## 정직성 고지 (CONTENT-SPEC §1)

자료 아홉 권 가운데 **여덟 권은 본문 텍스트를 확보해 대조에 사용했다** — France, Stein, Edwards, Witherington, Gundry, Rhoads 외, Watts, Bauckham.

미확정·제약 사항은 다음과 같다.

1. **Hengel, *Judaism and Hellenism* — 사용 불가.** 첨부된 EPUB는 본문이 페이지 이미지(PNG/JPG)로만 담긴 스캔본이라 텍스트 층이 없다. 목차 외에는 추출되는 문자가 없어 인용 자료로 쓰지 못했다. 개관 §6의 헹엘 항목은 그 저작의 공간된 논제를 요약한 것이며 첨부본 대조를 거치지 않았다. 문서 안에도 같은 고지를 넣었다.
2. **Gundry OCR — 부분 제약.** RTF OCR 본문은 확보했으나 그리스어 표기 손상(예: `EuayyEi..Loll`)이 심하다. 서지·구조 대조에는 썼고, 1장 세부 주해의 칩 사용은 최소화했다. Watts OCR은 판독 상태가 양호해 정상 사용했다.
3. **면수 미표기.** 모든 자료를 EPUB/OCR로 읽었으므로 인쇄본 면수를 확정할 수 없다. 칩은 논지 귀속 표시로만 쓴다. 인용·출판 시 실물 면수를 확인할 것.
4. **원어 재확인 전제.** 그리스어 형태·강세·이문은 NA28 기준으로 적었으나, 정밀 작업 시 NA28 비평장치와 형태분석 도구(Accordance/Logos/STEP Bible)로 재확인할 것.

### 개역개정 4판 전수 대조 — 통과

전 16장 — 인용 블록 **216개, 절 678개 전부**를 저장소 자체의 개역개정 데이터(`assets/data/bible/kor/chunks/nt-gospels-acts.json.gz`의 `MRK`)와 공백 제거 후 문자 단위로 비교했다. **불일치 0건.** 판본 혼입 없음.

`validate_mark.py`가 이 대조를 포함한 다섯 검사(태그 균형·앵커 무결성·표 열 수·내부 링크·개역개정 전수 대조)를 한 번에 돌린다.

```
$ python3 validate_mark.py
OK  nt/mark/ch01.html  (59,237B) tags=0 anchors=0 tables=0 links=0 krv=0
OK  nt/mark/ch02.html  (57,983B) tags=0 anchors=0 tables=0 links=0 krv=0
OK  nt/mark/ch03.html  (68,943B) tags=0 anchors=0 tables=0 links=0 krv=0
OK  nt/mark/ch04.html  (73,923B) tags=0 anchors=0 tables=0 links=0 krv=0
OK  nt/mark/ch05.html  (68,173B) tags=0 anchors=0 tables=0 links=0 krv=0
OK  nt/mark/ch06.html  (80,707B) tags=0 anchors=0 tables=0 links=0 krv=0
OK  nt/mark/ch07.html  (71,176B) tags=0 anchors=0 tables=0 links=0 krv=0
OK  nt/mark/ch08.html  (72,329B) tags=0 anchors=0 tables=0 links=0 krv=0
OK  nt/mark/ch09.html  (73,800B) tags=0 anchors=0 tables=0 links=0 krv=0
OK  nt/mark/index.html (16,327B) tags=0 anchors=0 tables=0 links=0 krv=0
OK  nt/mark/overview.html (42,872B) tags=0 anchors=0 tables=0 links=0 krv=0

전체 통과 — 오류 0
```

## 작업 완료

마가복음 16장 전편의 장별 심층연구가 완성되었다. 남은 확장 여지는 다음과 같다.

- **원어 연구** — 서가 index와 각 장 상단의 `원어 연구 준비 중` 표시가 아직 비활성이다. 별도 제작 시 각 장 `site-nav`의 `<span class="off">`를 링크로 교체할 것.
- **절별 대중 관주** — 각 장 §상호 참조 총람은 주석 근거가 붙은 학술 관주이며, OpenBible.info 기반 절별 관주는 성경읽기 화면에서 따로 제공된다.

### 다음 책 서가 작업 시 인계 사항

`nt/mark/ch01.html`–`ch16.html`이 장별 심층연구의 완성된 형식 표본이다. 장 성격별 처리 방식 —

- **긴 서사 장**(6장 56절, 14장 72절): 단락을 8–10개로 나누고 §0에서 구조를 먼저 세운다.
- **강화 장**(4장, 13장): 강화 전체의 기능을 §0에서 규정하고, 해석이 갈리는 대목은 두 독법을 나란히 놓는다.
- **논쟁 장**(11–12장): 도전의 연속을 표로 정리하고 각 만남의 성격 변화를 추적한다.
- **본문비평 장**(16장): 사본 증거를 별도 절로 독립시키고 표로 정리한다.

**절 번호 주의:** 개역개정과 NA28의 절 구분이 어긋나는 대목은 caveat 박스로 명시한다. 처리한 사례 — 7:15–16, 9:44·46, 11:26, 15:28(모두 "(없음)" 표기), 12:10·36(사이트 데이터가 구약 인용문을 절 본문과 분리 저장), 16:9–20(대괄호 표기).

**제목 일치:** 각 장의 `<title>`·`brand-sub`·`<h1>`은 반드시 `index.html`의 `book-spine` title과 일치시킬 것. 불일치 시 서가와 문서가 어긋난다.

**작업 중 유실 방지:** 장 완성 직후 `/mnt/user-data/outputs/`로 즉시 복사할 것. 작업 디렉터리는 세션 리셋 시 초기화된다.