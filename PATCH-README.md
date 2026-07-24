# v2.0 → v2.1 주석 칩 흰색 글자 핫픽스

이미 `biblestudygyu_reference_hover_automation_v2.0.zip`을 업로드한 경우 이 핫픽스만 추가로 적용합니다.

## 교체할 파일

- `assets/js/bible-reader.js`
- `assets/js/commentator-chips.js`
- `assets/css/commentator-chips.css`

저장소 루트에 경로 구조 그대로 덮어씁니다.

## 변경 내용

- 모든 주석 칩 글자색을 흰색(`#ffffff`)으로 고정
- 라이트·다크·시스템 테마에서 동일하게 흰색 유지
- 흰색 글자와 최소 4.5:1 대비가 나오도록 일부 칩 배경색 조정
- 기존 장절 호버링 v2.0 기능은 그대로 유지

업로드 뒤 브라우저에서 `Ctrl + Shift + R` 또는 `Cmd + Shift + R`로 강력 새로고침합니다.
