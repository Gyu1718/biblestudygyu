# 사도행전 마무리 원고 패키지 v4

대상 저장소: `Gyu1718/biblestudygyu`

## 반영 범위

- 기존 종합 개관과 1–15장 심층연구는 저장소의 현재 파일을 유지합니다.
- 16장 `유럽 진입` 신규 추가
- 17장 `아레오바고` 신규 추가
- 25장 `베스도와 상소` 신규 추가
- 26장 `아그립바 앞에서` 신규 추가
- 27장 `항해와 파선` 신규 추가
- 28장 `로마` 신규 추가
- 18–24장 원고는 업로드 ZIP에 없으므로 준비 중 상태를 유지합니다.

## 기능 보완

- Markdown 원고를 기존 연구 서가와 호환되는 HTML로 변환
- 장별 자동 목차와 현재 단락 강조
- 스크롤 읽기 진행률
- 1–28장 장 이동 메뉴와 `aria-current`
- 기존 1–15장에서도 신규 장으로 이동하도록 공통 링크 스크립트 추가
- 17장과 25장 사이에 18–24장 미완성 안내 표시
- 표 모바일 가로 스크롤 및 키보드 접근성
- 출처 칩(Bruce·Peterson·Schnabel·재인용) 시각화
- 최근 읽은 사도행전 장을 서가 홈에서 이어 읽기
- 서가 검색과 완성/준비 중 필터
- 홈페이지 카탈로그를 21/28편으로 갱신
- `catalog.js`와 공통 로더 캐시 키를 `20260801.4`로 갱신

## 업로드 방법

ZIP을 컴퓨터에서 먼저 압축 해제한 뒤, 저장소 루트에 폴더 구조를 유지하여 업로드합니다. 같은 이름의 파일은 덮어씁니다.

핵심 파일:

```text
index.html
catalog.js
assets/js/research-dock-loader.js
assets/js/acts-chapter-links.js
nt/acts/index.html
nt/acts/acts-study.css
nt/acts/acts-study.js
nt/acts/acts-shelf.js
nt/acts/ch16.html
nt/acts/ch17.html
nt/acts/ch25.html
nt/acts/ch26.html
nt/acts/ch27.html
nt/acts/ch28.html
```

기존 `nt/acts/ch01.html`–`ch15.html`과 `overview.html`은 이 ZIP에 넣지 않았습니다. 저장소의 최신 파일을 보존하기 위해서입니다.

## 직접 확인 주소

```text
https://gyu1718.github.io/biblestudygyu/nt/acts/
https://gyu1718.github.io/biblestudygyu/nt/acts/ch16.html
https://gyu1718.github.io/biblestudygyu/nt/acts/ch28.html
```

GitHub Pages 배포 후 이전 카탈로그가 보이면 강력 새로고침을 실행합니다.
