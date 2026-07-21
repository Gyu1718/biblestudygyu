# 성서 연구 서고 · Biblical Studies Archive

본문을 절 단위로 읽고, 주석을 대조하고, 원어를 파싱하고, 관주로 잇는 개인 성서·신학 연구 아카이브. **느헤미야를 시작으로 모든 성경 연구를 축적**하도록 설계했다.

## 지금 담긴 것

- **느헤미야 심층 연구** 14편 — 다섯 주석(Kidner·Fensham·Throntveit·Bolin·Harrington) 절 단위 대조
- **느헤미야 원어 파싱** 13편 — 핵심어 발음·뜻·문법·어근
- **느헤미야 인터라이너** 1편(1장) — 전 단어 축자 대역·문법 분석
- **관주** — 느헤미야 3,046개(OpenBible.info, CC-BY), 절별 자동 표시
- **1장 허브** — 한 절에서 세 연구와 관주로 건너가는 관문(새 아키텍처 실증)

## 구조 한눈에

```
index.html            서고 홈 (catalog.js를 읽어 렌더링)
catalog.js            연구 카탈로그 (새 연구는 여기만 수정)
assets/               기능·표현 레이어 — 여기만 고치면 전체 반영
  theme.css             색·반응형(라이트/다크·중단점)의 단일 출처
  app.css               관주 패널·이동 링크·테마 토글 스타일
  app.js                테마 토글 + 관주/이동 링크 자동 렌더링
data/                 데이터 레이어 — 스크립트로 생성
  xrefs/<book>.json     관주 (책별)
  links/<book>.json     절↔연구 이동 지도
  krv_<book>.json       번역 본문(허브용)
tools/                생성·검사 스크립트
  build_xrefs.py        관주 빌더 (전 성경 대응)
  build_links.py        이동 지도 빌더
  validate.py           무결성 검사
ot/  nt/  theology/    분과별 연구 (원본은 손대지 않는다)
  nehemiah/
    ch01~13.html          심층 연구
    parsing/ch01~13       원어 파싱
    interlinear/ch01      인터라이너
    study/ch01.html       장 허브 (절별 본문+연구 이동+관주)
    index.html            느헤미야 서재
    overview.html         종합 노트
```

자세한 설계·확장 방법은 **[ARCHITECTURE.md](ARCHITECTURE.md)** 참고.

## 새 책을 추가하려면 (예: 창세기)

```bash
# 1) ot/genesis/ 에 연구 문서를 둔다 (원하는 것만 있어도 됨)
# 2) 관주 생성
python3 tools/build_xrefs.py cross_references.txt Gen
# 3) 이동 지도 생성
python3 tools/build_links.py ot/genesis gen
# 4) catalog.js 에 항목 추가
# 5) 검사
python3 tools/validate.py
```

책 코드 표는 `tools/build_xrefs.py` 상단에 있다(66권 + 주요 외경).

## 페이지에서 다크 모드·관주 켜기

문서 `<head>`에 `theme.css`·`app.css`, 끝에 `app.js` 한 줄, `<body>`에 `data-book`/`data-chapter`/`data-kind`/`data-root` 속성, 절 요소에 `data-v`를 넣으면 끝. 자세한 건 ARCHITECTURE.md의 "페이지에서 기능 켜기".

## 배포

GitHub Pages: Settings → Pages → Deploy from a branch → `main` / `/ (root)`.

관주는 `fetch`로 JSON을 읽으므로 **로컬 file:// 더블클릭에서는 관주가 안 보일 수 있다**(브라우저 보안). GitHub Pages나 로컬 HTTP 서버(`python3 -m http.server`)에서는 정상 작동한다. 오프라인 확인용으로는 데이터를 인라인한 미리보기 파일을 쓴다.

## 데이터 출처·라이선스

관주는 OpenBible.info Cross References(CC-BY)를 한국어 약칭으로 변환했다. 재배포 시 출처를 유지할 것(`data/xrefs/LICENSE.txt`). 성경 본문은 개역개정 4판. 주석 인용·출판 시 각 주석 해당 면수를 확인해 출처를 명기할 것.
