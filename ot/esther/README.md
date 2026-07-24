# 에스더 연구 Git 업로드 패키지 v1

## 기준 자료

사용자가 제공한 `files (4).zip`의 에스더 1차분을 기준으로 정리했습니다.

현재 완성 문서:

- `ot/esther/index.html` — 에스더 연구 서재
- `ot/esther/overview.html` — 에스더 종합 개관

장별 심층연구 `ch01.html`–`ch10.html`은 아직 포함되지 않았습니다.

## 저장소에 들어가는 파일

```text
catalog.js
ot/esther/
  index.html
  overview.html
  esther-suite.css
  README.md
```

## 주요 수정

- 최신 저장소 카탈로그의 시편 항목을 보존하면서 에스더 카드를 추가
- 에스더를 느헤미야 다음에 배치
- 두 문서에 `data-book="est"`와 저장소 루트 문맥 추가
- 에스더 장절의 자동 호버·클릭 성경 패널 연결
- 공통 연구 도크와 화면 설정 연결
- 기존 A–Z 주석·자료 칩 팔레트 사용
- 다크 모드에서 표·노트·서가 배경 보완
- 서고 홈과 에스더 성경읽기 링크 추가
- 에스더 1–10장 원어·개역개정 성경읽기 바로가기 추가
- 미완성 장별 연구 책등과 목록을 접근성 있는 비활성 상태로 유지
- 연구서와 수용사 자료가 포함된 점을 반영해 `주석 스파인`을 `연구 자료 칩`으로 정정

## 자료 칩

- `M` — Jean-Daniel Macchi, IECOT
- `G` — Jonathan Grossman
- `L` — Lloyd Llewellyn-Jones
- `C` — Jo Carruthers
- `E` — Carol M. Bechtel
- `B` — Joyce G. Baldwin, OCR 보류

`M·G·L·C·E`는 현재 문서에서 직접 확인한 자료입니다. Baldwin은 원자료 OCR이 완료되기 전까지 본문 인용을 보류한 상태를 유지했습니다.

## 적용 방법

ZIP의 내용물을 `Gyu1718/biblestudygyu` 저장소 루트에 그대로 덮어씁니다.

- `catalog.js`는 교체
- `ot/esther/`는 새 폴더

업로드 후 강력 새로고침:

- Windows: `Ctrl + Shift + R`
- macOS: `Cmd + Shift + R`
