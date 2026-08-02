/* 필요한 연구 페이지에서만 성서 지식사전 런타임을 순차 로드한다. */
(function () {
  "use strict";
  if (window.__SCRIPTORIUM_ENCYCLOPEDIA_LOADER__) return;
  window.__SCRIPTORIUM_ENCYCLOPEDIA_LOADER__ = true;

  var script = document.currentScript;
  var siteRoot = script && script.src ? new URL("../../", script.src).href : new URL("./", location.href).href;

  function addStyle(path, marker) {
    if (document.querySelector('link[' + marker + ']')) return;
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = new URL(path, siteRoot).href;
    link.setAttribute(marker, "");
    document.head.appendChild(link);
  }

  function loadScript(path, marker) {
    var existing = document.querySelector('script[' + marker + ']');
    if (existing) return Promise.resolve(existing);
    return new Promise(function (resolve, reject) {
      var node = document.createElement("script");
      node.src = new URL(path, siteRoot).href;
      node.setAttribute(marker, "");
      node.addEventListener("load", function () { resolve(node); }, { once: true });
      node.addEventListener("error", reject, { once: true });
      document.head.appendChild(node);
    });
  }

  if (/\/ot\/nehemiah\//i.test(location.pathname)) {
    var main = document.querySelector("main");
    if (main && !main.hasAttribute("data-encyclopedia-scan")) main.setAttribute("data-encyclopedia-scan", "");
  }

  addStyle("assets/css/encyclopedia.css?v=20260802.1", "data-encyclopedia-css");
  loadScript("assets/js/encyclopedia-runtime.js?v=20260802.1", "data-encyclopedia-runtime-js").catch(function () {});
})();
