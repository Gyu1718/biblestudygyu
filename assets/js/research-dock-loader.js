(function () {
  "use strict";
  if (window.__SCRIPTORIUM_DOCK_LOADER__) return;
  window.__SCRIPTORIUM_DOCK_LOADER__ = true;

  var script = document.currentScript;
  var siteRoot = script && script.src
    ? new URL("../../", script.src).href
    : new URL("./", location.href).href;

  function addStyle(path, marker) {
    if (document.querySelector('link[' + marker + ']')) return;
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = new URL(path, siteRoot).href;
    link.setAttribute(marker, "");
    document.head.appendChild(link);
  }

  function addScript(path, marker) {
    if (document.querySelector('script[' + marker + ']')) return;
    var node = document.createElement("script");
    node.src = new URL(path, siteRoot).href;
    node.setAttribute(marker, "");
    document.head.appendChild(node);
  }

  addStyle("assets/theme.css?v=20260724.2", "data-rd-theme-css");
  addStyle("assets/app.css?v=20260724.2", "data-rd-app-css");
  addScript("assets/js/research-dock.js?v=20260724.2", "data-research-dock-js");
})();
