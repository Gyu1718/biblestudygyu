/* History previous/next navigation and learning-flow enhancer.
   Keeps app.js stable and adds navigation to #history=... detail pages. */
(function () {
  var LEARNING_PATHS = [
    {
      id: "reformed-basic-flow",
      title: "개혁전통 기본 흐름",
      description: "개혁파 전통이 종교개혁에서 장로교, 도르트, 웨스트민스터, 정통주의로 이어지는 기본 학습 순서입니다.",
      items: [
        "history-index",
        "reformation-to-reformed",
        "reformed-and-presbyterian",
        "synod-of-dort",
        "westminster-assembly",
        "reformed-orthodoxy"
      ]
    },
    {
      id: "neo-orthodox-basic-flow",
      title: "신정통주의 기본 흐름",
      description: "근대 자유주의 신학의 배경에서 변증법적 신학, 바르트, 개혁파 정통과의 비교로 이어지는 흐름입니다.",
      items: [
        "modern-liberal-theology-background",
        "dialectical-theology",
        "barth-and-neo-orthodoxy",
        "reformed-orthodoxy-and-neo-orthodoxy"
      ]
    },
    {
      id: "doctrine-debate-flow",
      title: "주요 논쟁·교리 비교 흐름",
      description: "자연신학과 예정론처럼 개혁파 정통과 바르트 신학의 차이가 크게 드러나는 논쟁형 학습 순서입니다.",
      items: [
        "reformed-orthodoxy-and-neo-orthodoxy",
        "natural-theology-debate",
        "barth-election-doctrine"
      ]
    }
  ];

  function loadJson(path, fallback) {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", path, false);
      xhr.send(null);
      if (xhr.status >= 200 && xhr.status < 300) return JSON.parse(xhr.responseText);
    } catch (error) {
      console.warn(path + " was not loaded for history navigation.", error);
    }
    return fallback;
  }

  function dataHistoryItems() {
    if (window.__DATA__ && Array.isArray(window.__DATA__.history) && window.__DATA__.history.length) {
      return window.__DATA__.history;
    }
    return [].concat(
      loadJson("./data/tradition-history.json", []),
      loadJson("./data/neo-orthodoxy-history.json", []),
      loadJson("./data/neo-orthodoxy-doctrine-history.json", [])
    ).filter(function (item) { return item && item.id; });
  }

  var historyItems = dataHistoryItems();

  function esc(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function currentHistoryId() {
    var raw = decodeURIComponent((location.hash || "").replace(/^#/, ""));
    var parts = raw.split("=");
    return parts[0] === "history" ? parts[1] : "";
  }

  function itemById(id) {
    return historyItems.find(function (item) { return item.id === id; });
  }

  function globalNeighbors(id) {
    var index = historyItems.findIndex(function (item) { return item.id === id; });
    if (index < 0) return { prev: null, next: null };
    return { prev: historyItems[index - 1] || null, next: historyItems[index + 1] || null };
  }

  function matchedPaths(id) {
    return LEARNING_PATHS.filter(function (path) {
      return path.items.indexOf(id) >= 0;
    });
  }

  function pathNeighbors(path, id) {
    var index = path.items.indexOf(id);
    if (index < 0) return { prev: null, next: null };
    return {
      prev: itemById(path.items[index - 1]) || null,
      next: itemById(path.items[index + 1]) || null
    };
  }

  function makeFlowButton(label, item, disabledText) {
    return '<button type="button" class="history-flow-btn" data-target="' + esc(item ? item.id : "") + '" ' + (!item ? "disabled" : "") + '>' +
      '<span>' + esc(label) + '</span><b>' + esc(item ? item.title : disabledText) + '</b></button>';
  }

  function bindNavButtons(scope) {
    scope.querySelectorAll("[data-target]").forEach(function (button) {
      if (button.dataset.boundHistoryNav === "true") return;
      button.dataset.boundHistoryNav = "true";
      button.onclick = function () {
        var target = button.getAttribute("data-target");
        if (target) location.hash = "history=" + encodeURIComponent(target);
      };
    });
  }

  function installTopNav(id, page) {
    if (page.querySelector(".history-flow-nav")) return;
    var neighbors = globalNeighbors(id);
    var nav = document.createElement("nav");
    nav.className = "history-flow-nav";
    nav.setAttribute("aria-label", "역사 항목 이동");
    nav.innerHTML =
      makeFlowButton("이전", neighbors.prev, "처음 항목") +
      makeFlowButton("다음", neighbors.next, "마지막 항목");

    var hero = page.querySelector(".detail-hero");
    if (hero && hero.parentNode) hero.parentNode.insertBefore(nav, hero.nextSibling);
    else page.insertBefore(nav, page.firstChild);
    bindNavButtons(nav);
  }

  function readingPathHTML(path, activeId) {
    return path.items.map(function (id, index) {
      var item = itemById(id);
      if (!item) return "";
      var active = id === activeId ? " is-active" : "";
      return '<button type="button" class="history-path-chip' + active + '" data-target="' + esc(id) + '">' +
        '<span>' + esc(index + 1) + '</span>' + esc(item.title) + '</button>';
    }).join("");
  }

  function installLearningFlow(id, page) {
    if (page.querySelector(".history-learning-flow")) return;
    var body = page.querySelector(".history-detail-body");
    if (!body) return;

    var paths = matchedPaths(id);
    var primaryPath = paths[0];
    var neighbors = primaryPath ? pathNeighbors(primaryPath, id) : globalNeighbors(id);
    var flow = document.createElement("section");
    flow.className = "history-section history-learning-flow";

    var pathBlocks = paths.length ? paths.map(function (path) {
      return '<div class="history-path-block">' +
        '<p class="history-path-title">' + esc(path.title) + '</p>' +
        '<p class="history-path-description">' + esc(path.description) + '</p>' +
        '<div class="history-reading-path">' + readingPathHTML(path, id) + '</div>' +
      '</div>';
    }).join("") : '<p class="history-path-description">이 항목은 별도 학습 흐름에 아직 배치되지 않았습니다. 상단의 이전/다음 버튼으로 전체 역사 색인을 따라 이동할 수 있습니다.</p>';

    flow.innerHTML =
      '<h4>학습 흐름</h4>' +
      pathBlocks +
      '<div class="history-flow-footer-nav">' +
        makeFlowButton("이 흐름의 이전", neighbors.prev, "이전 항목 없음") +
        makeFlowButton("이 흐름의 다음", neighbors.next, "다음 항목 없음") +
      '</div>';

    body.appendChild(flow);
    bindNavButtons(flow);
  }

  function installNav() {
    historyItems = dataHistoryItems();
    var id = currentHistoryId();
    if (!id || !historyItems.length) return;
    var page = document.querySelector(".detail-page");
    if (!page) return;
    if (!itemById(id)) return;

    installTopNav(id, page);
    installLearningFlow(id, page);
  }

  function ensureStyles() {
    if (document.querySelector("#history-flow-nav-styles")) return;
    var style = document.createElement("style");
    style.id = "history-flow-nav-styles";
    style.textContent = "\
      .history-flow-nav{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:14px 18px;border-bottom:1px solid var(--line);background:var(--surface-2);}\
      .history-flow-btn{border:1px solid var(--line);background:var(--surface);border-radius:12px;padding:12px 14px;text-align:left;cursor:pointer;color:var(--ink);}\
      .history-flow-btn span{display:block;font-family:var(--font-mono);font-size:.7rem;color:var(--muted);letter-spacing:.08em;text-transform:uppercase;margin-bottom:4px;}\
      .history-flow-btn b{font-size:.92rem;line-height:1.45;}\
      .history-flow-btn:hover:not(:disabled){border-color:var(--ink);}\
      .history-flow-btn:disabled{opacity:.48;cursor:not-allowed;}\
      .history-learning-flow{background:linear-gradient(180deg,var(--surface-2),var(--surface));}\
      .history-path-block{border:1px solid var(--line);background:var(--surface);border-radius:13px;padding:14px;margin-top:12px;}\
      .history-path-title{font-family:var(--font-display);font-weight:700;margin:0 0 4px;color:var(--ink);}\
      .history-path-description{margin:0 0 12px;color:var(--muted);line-height:1.7;font-size:.92rem;}\
      .history-reading-path{display:flex;flex-wrap:wrap;gap:8px;}\
      .history-path-chip{border:1px solid var(--line);background:var(--surface-2);border-radius:999px;padding:7px 10px;font-size:.85rem;color:var(--muted);cursor:pointer;}\
      .history-path-chip span{display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:18px;margin-right:6px;border-radius:50%;border:1px solid var(--line);font-family:var(--font-mono);font-size:.68rem;}\
      .history-path-chip:hover{border-color:var(--ink);color:var(--ink);}\
      .history-path-chip.is-active{border-color:var(--ink);color:var(--ink);background:var(--surface);font-weight:700;}\
      .history-flow-footer-nav{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px;}\
      @media(max-width:720px){.history-flow-nav,.history-flow-footer-nav{grid-template-columns:1fr;}}\
    ";
    document.head.appendChild(style);
  }

  function loadScriptOnce(src) {
    if (document.querySelector('script[src$="' + src.split("/").pop() + '"]')) return;
    var script = document.createElement("script");
    script.src = src;
    script.defer = true;
    document.body.appendChild(script);
  }

  function loadConfessionEnhancers() {
    loadScriptOnce("./js/wsc-index-enhance.js");
    loadScriptOnce("./js/wcf-index-enhance.js");
    loadScriptOnce("./js/belgic-index-enhance.js");
    loadScriptOnce("./js/dort-index-enhance.js");
    loadScriptOnce("./js/ancient-creeds-text-enhance.js");
    loadScriptOnce("./js/heidelberg-text-enhance.js");
  }

  ensureStyles();
  var observer = new MutationObserver(function () { installNav(); });
  var view = document.querySelector("#view");
  if (view) observer.observe(view, { childList: true, subtree: true });
  window.addEventListener("hashchange", function () { setTimeout(installNav, 0); });
  document.addEventListener("DOMContentLoaded", function () { installNav(); loadConfessionEnhancers(); });
  setTimeout(installNav, 0);
  setTimeout(loadConfessionEnhancers, 0);
})();
