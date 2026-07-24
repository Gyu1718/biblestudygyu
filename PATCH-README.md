# 반응형 연구 도크 수정 패치 v1.1

이 패치는 첫 연구 도크 패치가 홈페이지·원어성경·원어사전에서 로드되지 않던 문제를 수정합니다.

## 원인

기존 패치는 `assets/app.js`가 모든 페이지에서 로드된다고 가정했습니다. 실제로는 연구 문서 일부만 `app.js`를 사용하며, 홈페이지·원어성경·원어사전은 이를 불러오지 않습니다.

## 적용

ZIP의 내용물을 저장소 루트에 업로드하고 같은 이름의 파일을 덮어씁니다.

반드시 다음 경로가 저장소에 직접 보여야 합니다.

- `assets/js/research-dock-loader.js`
- `assets/js/research-dock.js`
- `assets/js/original-lexicon-bridge.js`
- `assets/js/lexicon-page.js`
- `assets/css/research-dock.css`
- `assets/app.js`
- `catalog.js`
- `bible/original.html`
- `lexicon/index.html`
- `lexicon/entry.html`

ZIP 파일 자체나 `research_dock_fix_v1.1` 폴더를 통째로 저장소 안에 넣으면 작동하지 않습니다.

## 로딩 경로

- 홈페이지: `catalog.js` → 공통 로더
- 연구 문서: `assets/app.js` → 공통 로더
- 원어성경: `bible/original.html` → 공통 로더
- 원어사전: `lexicon/index.html`, `lexicon/entry.html` → 공통 로더

공통 로더는 `theme.css`, `app.css`, `research-dock.js`를 저장소 루트 기준 절대 URL로 계산해 불러옵니다.

## 확인

업로드 후 브라우저 개발자 도구의 Network에서 다음 파일이 모두 200으로 로드되는지 확인합니다.

- `assets/js/research-dock-loader.js`
- `assets/js/research-dock.js`
- `assets/js/original-lexicon-bridge.js`
- `assets/js/lexicon-page.js`
- `assets/css/research-dock.css`
- `assets/theme.css`

그 후 강력 새로고침을 실행합니다.

- Windows: `Ctrl + Shift + R`
- macOS: `Cmd + Shift + R`

## 중복 방지와 캐시 갱신

원어성경과 사전은 HTML 직접 로드와 기존 페이지 스크립트 로드의 두 경로를 둡니다. 먼저 실행된 로더가 전역 잠금값을 설정하므로 도크는 한 번만 생성됩니다.

모든 새 로더 주소에는 `v=20260724.2`가 붙어 브라우저와 GitHub Pages의 이전 캐시를 우회합니다.
