# 창세기 연구 서가 패키지 v1

대상 저장소: `Gyu1718/biblestudygyu`

## 포함 내용

- `ot/genesis/index.html` — 창세기 서가 홈, 50장 본문 바로가기, 1–15장 활성 연구 서가
- `ot/genesis/overview.html` — 창세기 종합 개관
- `ot/genesis/ch01.html`–`ch15.html` — 장별 심층연구
- `ot/genesis/genesis-suite.css` — 창세기 문서 공통 스타일
- `ot/genesis/genesis-suite.js` — 읽기 진행 표시와 현재 목차 강조
- `ot/genesis/genesis-shelf.js` — 50장 제목 검색과 대단락 필터
- `catalog.js` — 홈페이지 구약 연구에 창세기 카드 등록
- `index.html` — `catalog.js?v=20260731.3` 캐시 무효화와 로딩 오류 안내

## 이번 패키지에서 수정한 내용

1. 서가 홈의 잘못된 `1–5장 완성` 표기를 `1–15장 완성`으로 수정했습니다.
2. 1–10장 문서에서 비활성으로 남아 있던 11–15장 이동 버튼을 활성화했습니다.
3. 모든 장에 이전 장·서가·다음 장 이동 바를 추가했습니다.
4. 문서 스크롤 진행 표시와 현재 목차 자동 강조를 추가했습니다.
5. 50장 현황표에 장 번호·제목·주제 검색과 원역사/아브라함/이삭·야곱/요셉 필터를 추가했습니다.
6. 모든 HTML에 검색 설명 메타데이터와 테마 색상을 추가했습니다.
7. 홈페이지 카탈로그에 창세기 연구 서가를 등록하고 캐시 버전을 올렸습니다.

## 업로드 방법

ZIP을 먼저 압축 해제한 뒤 저장소 루트에 폴더 구조를 유지하여 업로드합니다. 기존 `catalog.js`와 `index.html`은 이 패키지 파일로 덮어씁니다.

GitHub Pages 반영 뒤에는 다음 주소를 직접 확인할 수 있습니다.

- `/biblestudygyu/ot/genesis/`
- `/biblestudygyu/ot/genesis/ch01.html`

`package-info/` 폴더는 검수 기록이므로 사이트 실행에 필수는 아닙니다.
