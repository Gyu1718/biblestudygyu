(function () {
  "use strict";
  if (window.__SCRIPTORIUM_DOCK_LOADER__) return;
  window.__SCRIPTORIUM_DOCK_LOADER__ = true;
  var script = document.currentScript;
  var siteRoot = script && script.src ? new URL("../../", script.src).href : new URL("./", location.href).href;

  function absolute(path) { return new URL(path, siteRoot).href; }
  function sameAsset(nodes, url) {
    return Array.prototype.some.call(nodes, function (node) {
      return node.href === url || node.src === url ||
        (node.href && node.href.split("?")[0] === url.split("?")[0]) ||
        (node.src && node.src.split("?")[0] === url.split("?")[0]);
    });
  }
  function addStyle(path, marker) {
    var url = absolute(path);
    if (document.querySelector('link[' + marker + ']') || sameAsset(document.querySelectorAll('link[rel="stylesheet"]'), url)) return;
    var link=document.createElement("link");link.rel="stylesheet";link.href=url;link.setAttribute(marker,"");document.head.appendChild(link);
  }
  function addScript(path, marker) {
    var url = absolute(path);
    if (document.querySelector('script[' + marker + ']') || sameAsset(document.scripts, url)) return;
    var node=document.createElement("script");node.src=url;node.async=false;node.setAttribute(marker,"");document.head.appendChild(node);
  }

  var body = document.body;
  var path = location.pathname;
  var researchSurface = Boolean(
    (body && (body.getAttribute("data-book") || body.classList.contains("book-shelf-page"))) ||
    /\/(?:ot|nt)\//i.test(path)
  );

  addStyle("assets/theme.css?v=20260724.2", "data-rd-theme-css");
  addStyle("assets/app.css?v=20260724.2", "data-rd-app-css");
  addStyle("assets/css/study-navigation-policy.css?v=20260725.1", "data-study-navigation-policy-css");

  if (researchSurface) {
    addStyle("assets/css/global-study-features.css?v=20260801.1", "data-global-study-features-css");
    addScript("assets/js/global-study-features.js?v=20260801.1", "data-global-study-features-js");

    /* 자동 성경 구절 감지·호버·클릭 본문창. 기존 직접 로더가 있으면 중복 로드하지 않는다. */
    addStyle("assets/css/bible-reader.css?v=20260801.1", "data-bible-reader-css");
    addScript("assets/js/bible-reader.js?v=20260801.1", "data-bible-reader-js");
  }

  if (body && body.classList.contains("book-shelf-page")) {
    addStyle("assets/css/book-shelf-enhancements.css?v=20260801.2", "data-book-shelf-enhancements-css");
    addScript("assets/js/book-shelf-enhancements.js?v=20260801.2", "data-book-shelf-enhancements-js");
  }
  if (/\/nt\/acts\//i.test(path) || (body && body.getAttribute("data-book")==="acts")) {
    if (body && body.getAttribute("data-kind")==="study") {
      addStyle("assets/css/acts-study-normalize.css?v=20260801.6", "data-acts-study-normalize-css");
      addStyle("assets/css/acts-study-polish.css?v=20260801.6", "data-acts-study-polish-css");
      addStyle("assets/css/acts-chapter-nav-fix.css?v=20260801.6", "data-acts-chapter-nav-fix-css");
      addScript("assets/js/acts-layout-normalizer.js?v=20260801.6", "data-acts-layout-normalizer-js");
      if (parseInt(body.getAttribute("data-chapter")||"0",10)>0) {
        addStyle("assets/css/acts-supplements.css?v=20260801.7", "data-acts-supplements-css");
        addScript("assets/js/acts-supplements.js?v=20260801.7", "data-acts-supplements-js");
      }
    }
    addScript("assets/js/acts-chapter-links.js?v=20260801.6", "data-acts-chapter-links-js");
    if (body && body.classList.contains("book-shelf-page")) addScript("assets/js/acts-topic-shelf.js?v=20260801.7", "data-acts-topic-shelf-js");
  }
  if (/\/nt\/romans\//i.test(path)) addScript("assets/js/romans-supplement.js?v=20260726.1", "data-romans-supplement-js");
  if (/\/ot\/nehemiah\//i.test(path) || document.querySelector("[data-encyclopedia-scan],.encyclopedia-scan,.dict-scan,[data-entity]")) addScript("assets/js/encyclopedia-loader.js?v=20260730.1", "data-encyclopedia-loader-js");
  addScript("assets/js/research-dock.js?v=20260729.1", "data-research-dock-js");
})();
