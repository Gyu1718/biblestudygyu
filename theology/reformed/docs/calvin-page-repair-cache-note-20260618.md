# 칼빈 페이지 캐시 갱신 후속 메모 — 2026-06-18

이번 보수에서 다음 파일은 실제로 수정 또는 추가되었다.

- `js/calvin-subtopics-render.js`
- `js/calvin-subtopics-preload.js`
- `js/calvin-quotes-preload.js`
- `data/quotes/calvin-institutes-quote-targets-v1.json`
- `docs/calvin-page-repair-checklist.md`
- `docs/calvin-page-repair-log-20260618.md`

다만 `index.html`의 스크립트 쿼리스트링 캐시 버전 갱신은 SHA 충돌로 이번 단계에서 적용하지 못했다.
다음 단계에서 최신 `index.html` SHA를 확인한 뒤 다음 세 줄을 갱신하면 된다.

```html
<script src="./js/calvin-quotes-preload.js?v=calvin-quote-targets-20260618"></script>
<script src="./js/calvin-subtopics-preload.js?v=calvin-merge-20260618"></script>
<script src="./js/calvin-subtopics-render.js?v=calvin-notes-20260618"></script>
```

캐시 갱신 전에도 GitHub Pages가 새 JS를 정상 반영하면 기능은 작동한다. 브라우저 캐시가 남아 있으면 강력 새로고침이 필요할 수 있다.
