/* Calvin Institutes renderer compatibility shim.
   The Calvin page now uses the shared Barth-style book detail renderer.
   This file is intentionally inert so older cached index.html versions that still
   request it will not inject duplicate Calvin-only cards into chapter details. */
(function () {
  window.__CALVIN_SUBTOPICS_RENDER_DISABLED__ = true;
})();
