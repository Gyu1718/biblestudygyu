/* ============================================================
   성서 연구 서고 — 기능 레이어  (app.js)
   ------------------------------------------------------------
   동작의 단일 출처. 두 가지를 담당한다.
     (1) 테마 토글  — 라이트 / 다크 / 시스템
     (2) 관주 렌더링 — 현재 페이지의 책·장을 읽어 절별 관주를 그린다

   페이지가 해야 할 선언은 <body>에 데이터 속성 두 개뿐:
       <body data-book="neh" data-chapter="1">
   그리고 관주를 붙일 절 요소에 data-v="5" 표시:
       <section id="v5" data-v="5"> … </section>
   이 파일과 theme.css를 <head>에서 불러오면 나머지는 자동이다.

   기능을 끄려면: <body>에서 data-book 속성을 지우거나
                 이 스크립트 <script> 한 줄을 빼면 된다.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- (1) 테마 ---------- */
  var THEME_KEY = "scriptorium-theme";
  var root = document.documentElement;

  function currentTheme() {
    return root.getAttribute("data-theme") || "auto";
  }
  function applyTheme(mode) {
    if (mode === "auto") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", mode);
    try { window.localStorage.setItem(THEME_KEY, mode); } catch (e) {}
    updateToggleUI(mode);
  }
  function savedTheme() {
    try { return window.localStorage.getItem(THEME_KEY); } catch (e) { return null; }
  }

  var TOGGLE_ORDER = ["auto", "light", "dark"];
  var TOGGLE_LABEL = { auto: "시스템", light: "라이트", dark: "다크" };
  var TOGGLE_ICON  = { auto: "◐", light: "☀", dark: "☾" };

  function updateToggleUI(mode) {
    var btn = document.getElementById("theme-toggle");
    if (!btn) return;
    btn.textContent = TOGGLE_ICON[mode] + " " + TOGGLE_LABEL[mode];
    btn.setAttribute("aria-label", "화면 모드: " + TOGGLE_LABEL[mode] + " (눌러서 전환)");
  }

  function mountThemeToggle() {
    if (document.getElementById("theme-toggle")) return;
    var btn = document.createElement("button");
    btn.id = "theme-toggle";
    btn.type = "button";
    btn.className = "theme-toggle";
    btn.addEventListener("click", function () {
      var i = TOGGLE_ORDER.indexOf(currentTheme());
      applyTheme(TOGGLE_ORDER[(i + 1) % TOGGLE_ORDER.length]);
    });
    document.body.appendChild(btn);
    updateToggleUI(currentTheme());
  }

  // 저장된 선택을 부팅 시 반영(깜빡임 최소화를 위해 되도록 빨리)
  var pref = savedTheme();
  if (pref) applyTheme(pref);

  /* ---------- (2) 관주 렌더링 ---------- */
  var BOOK = document.body ? document.body.getAttribute("data-book") : null;
  var CHAP = document.body ? document.body.getAttribute("data-chapter") : null;

  // 페이지 위치에 따라 data 폴더까지의 상대 경로를 추정.
  // <body data-root="../../"> 로 명시하면 그 값을 우선한다.
  function dataBase() {
    var explicit = document.body.getAttribute("data-root");
    if (explicit !== null) return explicit;
    // 경로 깊이로 추정: /ot/<book>/  → ../../ ,  /ot/<book>/parsing/ → ../../../
    var seg = location.pathname.split("/").filter(Boolean);
    // 파일명 제외
    var depth = Math.max(seg.length - 1, 0);
    // site 루트 기준으로 몇 단계 들어와 있는지 알 수 없으므로 문서가 명시하는 편을 권장.
    // 기본값: 3단계(ot/book/sub/) 안전 추정 실패 시 문서에서 data-root 지정.
    return "";
  }

  function dataRoot() {
    var base = document.body.getAttribute("data-root");
    return base === null ? "" : base;
  }
  function xrefUrl()  { return dataRoot() + "data/xrefs/" + BOOK + ".json"; }
  function linksUrl() { return dataRoot() + "data/links/" + BOOK + ".json"; }

  var STUDY_LABEL = { study: "심층", parsing: "파싱", interlinear: "인터라이너" };
  var STUDY_ORDER = ["study", "parsing", "interlinear"];

  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }

  function renderXrefs(byVerse) {
    var chap = byVerse[CHAP];
    if (!chap) return;
    var verseNodes = document.querySelectorAll("[data-v]");
    verseNodes.forEach(function (node) {
      var v = node.getAttribute("data-v");
      var refs = chap[v];
      if (!refs || !refs.length) return;
      if (node.querySelector(".xref-panel")) return; // 중복 방지

      var panel = el("aside", "xref-panel");
      panel.setAttribute("aria-label", BOOK + " " + CHAP + ":" + v + " 관주");

      var head = el("button", "xref-head");
      head.type = "button";
      head.setAttribute("aria-expanded", "false");
      head.innerHTML =
        '<span class="xref-title">관주 <span class="xref-count">' + refs.length + "</span></span>" +
        '<span class="xref-caret" aria-hidden="true">▾</span>';

      var body = el("div", "xref-body");
      var THRESHOLD = 8; // 처음엔 상위 8개만
      var list = el("ul", "xref-list");

      refs.forEach(function (r, i) {
        var li = el("li", "xref-item" + (i >= THRESHOLD ? " xref-extra" : ""));
        var span = el("span", "xref-ref", r.r);
        li.appendChild(span);
        if (typeof r.v === "number") {
          var vote = el("span", "xref-vote", r.v > 0 ? "+" + r.v : String(r.v));
          li.appendChild(vote);
        }
        list.appendChild(li);
      });
      body.appendChild(list);

      if (refs.length > THRESHOLD) {
        var more = el("button", "xref-more");
        more.type = "button";
        var hidden = refs.length - THRESHOLD;
        more.textContent = "+ " + hidden + "개 더 보기";
        more.addEventListener("click", function () {
          var expanded = panel.classList.toggle("xref-all");
          more.textContent = expanded ? "접기" : "+ " + hidden + "개 더 보기";
        });
        body.appendChild(more);
      }

      head.addEventListener("click", function () {
        var open = panel.classList.toggle("xref-open");
        head.setAttribute("aria-expanded", open ? "true" : "false");
      });

      panel.appendChild(head);
      panel.appendChild(body);
      node.appendChild(panel);
    });
  }

  function initXrefs() {
    if (!BOOK || !CHAP) return;
    if (!document.querySelector("[data-v]")) return; // 절 표시가 없으면 그리지 않음
    fetch(xrefUrl())
      .then(function (r) { if (!r.ok) throw new Error("xref " + r.status); return r.json(); })
      .then(renderXrefs)
      .catch(function (e) { /* 데이터가 없으면 조용히 넘어간다 */ });
  }

  // 절마다 "이 절 보기: 심층 · 파싱 · 인터라이너" 이동 링크를 붙인다.
  // 현재 페이지 자신에 해당하는 연구는 링크에서 제외한다.
  var SELF_KIND = document.body ? document.body.getAttribute("data-kind") : null;

  function renderLinks(map) {
    var chap = map.chapters && map.chapters[CHAP];
    if (!chap) return;
    document.querySelectorAll("[data-v]").forEach(function (node) {
      var v = node.getAttribute("data-v");
      var entry = chap[v];
      if (!entry) return;
      if (node.querySelector(".vlinks")) return;

      var wrap = el("nav", "vlinks");
      wrap.setAttribute("aria-label", BOOK + " " + CHAP + ":" + v + " 다른 연구로 이동");
      var lead = el("span", "vlinks-lead", "이 절:");
      wrap.appendChild(lead);

      var any = false;
      STUDY_ORDER.forEach(function (kind) {
        if (kind === SELF_KIND) return;      // 자기 자신 제외
        var t = entry[kind];
        if (!t) return;
        var a = el("a", "vlink vlink-" + kind, STUDY_LABEL[kind]);
        a.href = t.href + "#" + t.anchor;
        wrap.appendChild(a);
        any = true;
      });
      if (any) node.appendChild(wrap);
    });
  }

  function initLinks() {
    if (!BOOK || !CHAP) return;
    if (!document.querySelector("[data-v]")) return;
    fetch(linksUrl())
      .then(function (r) { if (!r.ok) throw new Error("links " + r.status); return r.json(); })
      .then(renderLinks)
      .catch(function (e) { /* 링크 지도가 없으면 조용히 넘어간다 */ });
  }

  /* ---------- 부팅 ---------- */
  function boot() {
    mountThemeToggle();
    initLinks();
    initXrefs();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

/* ---------- (3) 반응형 연구 도크 자동 로더 ---------- */
(function () {
  "use strict";
  if (typeof document === "undefined") return;
  if (window.__SCRIPTORIUM_RESEARCH_DOCK_LOADING__ || document.querySelector("script[data-research-dock-js]")) return;
  window.__SCRIPTORIUM_RESEARCH_DOCK_LOADING__ = true;
  var current = document.currentScript;
  var src = current && current.src
    ? new URL("js/research-dock.js", current.src).href
    : "assets/js/research-dock.js";
  var loader = document.createElement("script");
  loader.src = src;
  loader.defer = true;
  loader.dataset.researchDockJs = "";
  loader.addEventListener("load", function () { window.__SCRIPTORIUM_RESEARCH_DOCK_LOADING__ = false; });
  loader.addEventListener("error", function () { window.__SCRIPTORIUM_RESEARCH_DOCK_LOADING__ = false; });
  document.head.appendChild(loader);
})();
