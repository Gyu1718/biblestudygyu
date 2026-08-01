(function () {
  "use strict";
  if (window.__SCRIPTORIUM_DOCK_LOADER__) return;
  window.__SCRIPTORIUM_DOCK_LOADER__ = true;
  var script = document.currentScript;
  var siteRoot = script && script.src ? new URL("../../", script.src).href : new URL("./", location.href).href;
  function addStyle(path, marker) { if (document.querySelector('link[' + marker + ']')) return; var link=document.createElement("link");link.rel="stylesheet";link.href=new URL(path,siteRoot).href;link.setAttribute(marker,"");document.head.appendChild(link); }
  function addScript(path, marker) { if (document.querySelector('script[' + marker + ']')) return; var node=document.createElement("script");node.src=new URL(path,siteRoot).href;node.async=false;node.setAttribute(marker,"");document.head.appendChild(node); }
  addStyle("assets/theme.css?v=20260724.2", "data-rd-theme-css");
  addStyle("assets/app.css?v=20260724.2", "data-rd-app-css");
  addStyle("assets/css/study-navigation-policy.css?v=20260725.1", "data-study-navigation-policy-css");
  if (document.body && document.body.classList.contains("book-shelf-page")) {
    addStyle("assets/css/book-shelf-enhancements.css?v=20260801.2", "data-book-shelf-enhancements-css");
    addScript("assets/js/book-shelf-enhancements.js?v=20260801.2", "data-book-shelf-enhancements-js");
  }
  if (/\/nt\/acts\//i.test(location.pathname) || (document.body && document.body.getAttribute("data-book")==="acts")) {
    if (document.body && document.body.getAttribute("data-kind")==="study") {
      addStyle("assets/css/acts-study-normalize.css?v=20260801.6", "data-acts-study-normalize-css");
      addStyle("assets/css/acts-study-polish.css?v=20260801.6", "data-acts-study-polish-css");
      addStyle("assets/css/acts-chapter-nav-fix.css?v=20260801.6", "data-acts-chapter-nav-fix-css");
      addScript("assets/js/acts-layout-normalizer.js?v=20260801.6", "data-acts-layout-normalizer-js");
    }
    addScript("assets/js/acts-chapter-links.js?v=20260801.6", "data-acts-chapter-links-js");
  }
  if (/\/nt\/romans\//i.test(location.pathname)) addScript("assets/js/romans-supplement.js?v=20260726.1", "data-romans-supplement-js");
  if (/\/ot\/nehemiah\//i.test(location.pathname) || document.querySelector("[data-encyclopedia-scan],.encyclopedia-scan,.dict-scan,[data-entity]")) addScript("assets/js/encyclopedia-loader.js?v=20260730.1", "data-encyclopedia-loader-js");
  addScript("assets/js/research-dock.js?v=20260729.1", "data-research-dock-js");
})();
