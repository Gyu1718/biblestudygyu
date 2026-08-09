/* History overview enhancer.
   Adds a learning-oriented overview panel to the history list and enriches the history-index detail page. */
(function () {
  var OVERVIEW_FLOWS = [
    {
      title: "개혁전통 기본 흐름",
      description: "종교개혁에서 개혁파 전통, 장로교, 도르트, 웨스트민스터, 정통주의로 이어지는 기본 골격입니다.",
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
      title: "신정통주의 기본 흐름",
      description: "근대 자유주의 신학의 배경에서 바르트와 신정통주의, 그리고 개혁파 정통과의 긴장으로 이어지는 흐름입니다.",
      items: [
        "modern-liberal-theology-background",
        "dialectical-theology",
        "barth-and-neo-orthodoxy",
        "reformed-orthodoxy-and-neo-orthodoxy"
      ]
    },
    {
      title: "주요 논쟁·교리 비교 흐름",
      description: "자연신학과 예정론처럼 개혁파 정통과 바르트 신학의 차이가 선명하게 드러나는 논쟁형 학습 흐름입니다.",
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
      console.warn(path + " was not loaded for history overview.", error);
    }
    return fallback;
  }

  function historyItems() {
    if (window.__DATA__ && Array.isArray(window.__DATA__.history) && window.__DATA__.history.length) {
      return window.__DATA__.history;
    }
    return [].concat(
      loadJson("./data/tradition-history.json", []),
      loadJson("./data/neo-orthodoxy-history.json", []),
      loadJson("./data/neo-orthodoxy-doctrine-history.json", [])
    ).filter(function (item) { return item && item.id; });
  }

  function esc(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function currentRoute() {
    var raw = decodeURIComponent((location.hash || "").replace(/^#/, ""));
    var parts = raw.split("=");
    return { type: parts[0] || "", id: parts[1] || "" };
  }

  function byId(items, id) {
    return items.find(function (item) { return item.id === id; });
  }

  function goHistory(id) {
    if (id) location.hash = "history=" + encodeURIComponent(id);
  }

  function flowCards(items, compact) {
    return OVERVIEW_FLOWS.map(function (flow) {
      var first = flow.items.map(function (id) { return byId(items, id); }).filter(Boolean)[0];
      var chips = flow.items.map(function (id, index) {
        var item = byId(items, id);
        if (!item) return "";
        return '<button type="button" class="history-overview-chip" data-history-target="' + esc(id) + '"><span>' + esc(index + 1) + '</span>' + esc(item.title) + '</button>';
      }).join("");

      if (compact) {
        return '<button type="button" class="history-overview-flow is-compact" data-history-target="' + esc(first ? first.id : "") + '">' +
          '<strong>' + esc(flow.title) + '</strong>' +
          '<span>시작 →</span>' +
        '</button>';
      }

      return '<article class="history-overview-flow">' +
        '<h4>' + esc(flow.title) + '</h4>' +
        '<p>' + esc(flow.description) + '</p>' +
        '<div class="history-overview-chips">' + chips + '</div>' +
        '<button type="button" class="history-overview-start" data-history-target="' + esc(first ? first.id : "") + '">이 흐름 시작하기 →</button>' +
      '</article>';
    }).join("");
  }

  function bindButtons(scope) {
    scope.querySelectorAll("[data-history-target]").forEach(function (button) {
      if (button.dataset.historyOverviewBound === "true") return;
      button.dataset.historyOverviewBound = "true";
      button.onclick = function () {
        goHistory(button.getAttribute("data-history-target"));
      };
    });
  }

  function installListOverview() {
    var route = currentRoute();
    if (route.type === "history" && route.id) return;
    var view = document.querySelector("#view");
    if (!view || view.querySelector(".detail-page") || view.querySelector(".history-overview-panel")) return;
    if (!view.querySelector(".history-card")) return;

    var items = historyItems();
    if (!items.length) return;
    var panel = document.createElement("section");
    panel.className = "history-overview-panel";
    panel.innerHTML =
      '<div class="history-overview-head">' +
        '<span class="loci-label">HISTORY GUIDE</span>' +
        '<h3>역사 파트 읽기 안내</h3>' +
        '<p>처음 읽는다면 개혁전통 기본 흐름을 먼저 보고, 이후 신정통주의와 주요 논쟁 흐름으로 이동하는 순서가 좋습니다.</p>' +
        '<div class="history-overview-actions">' +
          '<button type="button" data-history-target="history-index">전체 개요</button>' +
          '<button type="button" data-history-target="reformation-to-reformed">개혁전통</button>' +
          '<button type="button" data-history-target="modern-liberal-theology-background">신정통주의</button>' +
        '</div>' +
      '</div>' +
      '<div class="history-overview-flows compact-flows">' + flowCards(items, true) + '</div>';

    view.insertBefore(panel, view.firstChild);
    bindButtons(panel);
  }

  function installIndexDetailOverview() {
    var route = currentRoute();
    if (route.type !== "history" || route.id !== "history-index") return;
    var page = document.querySelector(".detail-page");
    var body = page && page.querySelector(".history-detail-body");
    if (!body || body.querySelector(".history-index-overview")) return;

    var items = historyItems();
    if (!items.length) return;
    var section = document.createElement("section");
    section.className = "history-section history-index-overview";
    section.innerHTML =
      '<h4>전체 역사 개요</h4>' +
      '<p class="history-overview-intro">이 페이지는 역사 파트의 대문입니다. 아래 세 흐름을 따라가면 개혁전통의 형성, 신정통주의의 등장, 그리고 두 전통의 핵심 논쟁을 순서대로 확인할 수 있습니다.</p>' +
      '<div class="history-overview-flows detail-flows">' + flowCards(items, false) + '</div>';

    var learningFlow = body.querySelector(".history-learning-flow");
    if (learningFlow) body.insertBefore(section, learningFlow);
    else body.appendChild(section);
    bindButtons(section);
  }

  function ensureStyles() {
    if (document.querySelector("#history-overview-enhance-styles")) return;
    var style = document.createElement("style");
    style.id = "history-overview-enhance-styles";
    style.textContent = "\
      .history-overview-panel{margin:0 0 12px;border:1px solid var(--line);border-radius:16px;background:linear-gradient(135deg,var(--surface),var(--surface-2));overflow:hidden;}\
      .history-overview-head{padding:16px 18px 12px;border-bottom:1px solid var(--line);}\
      .history-overview-head h3{font-family:var(--font-display);font-size:1.2rem;margin:4px 0 6px;}\
      .history-overview-head p,.history-overview-intro{color:var(--muted);line-height:1.6;max-width:980px;}\
      .history-overview-head p{font-size:.9rem;margin:0;}\
      .history-overview-actions{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;}\
      .history-overview-actions button,.history-overview-start{border:1px solid var(--line-strong);background:var(--surface);border-radius:999px;padding:7px 10px;cursor:pointer;color:var(--ink);font-size:.82rem;}\
      .history-overview-actions button:hover,.history-overview-start:hover{border-color:var(--ink);}\
      .history-overview-flows{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;padding:16px 18px 18px;}\
      .history-overview-flows.compact-flows{display:flex;flex-wrap:wrap;gap:8px;padding:10px 14px 14px;}\
      .history-overview-flows.detail-flows{padding:0;margin-top:14px;}\
      .history-overview-flow{border:1px solid var(--line);background:var(--surface);border-radius:14px;padding:15px;}\
      .history-overview-flow.is-compact{flex:1 1 220px;display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:42px;padding:9px 12px;border-radius:999px;text-align:left;cursor:pointer;color:var(--ink);}\
      .history-overview-flow.is-compact strong{font-family:var(--font-display);font-size:.9rem;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}\
      .history-overview-flow.is-compact span{flex:0 0 auto;color:var(--muted);font-size:.78rem;}\
      .history-overview-flow.is-compact:hover{border-color:var(--ink);}\
      .history-overview-flow h4{font-family:var(--font-display);margin:0 0 8px;font-size:1rem;}\
      .history-overview-flow p{color:var(--muted);font-size:.9rem;line-height:1.65;margin:0 0 12px;}\
      .history-overview-chips{display:flex;flex-wrap:wrap;gap:7px;margin:12px 0;}\
      .history-overview-chip{border:1px solid var(--line);background:var(--surface-2);border-radius:999px;padding:7px 10px;font-size:.82rem;color:var(--muted);cursor:pointer;}\
      .history-overview-chip span{font-family:var(--font-mono);font-size:.68rem;margin-right:5px;}\
      .history-overview-chip:hover{border-color:var(--ink);color:var(--ink);}\
      @media(max-width:980px){.history-overview-flows:not(.compact-flows){grid-template-columns:1fr;}}\
      @media(max-width:680px){.history-overview-panel{margin-bottom:10px;}.history-overview-head{padding:13px 14px 10px;}.history-overview-head h3{font-size:1.08rem;}.history-overview-head p{display:none;}.history-overview-actions{margin-top:8px;}.history-overview-flows.compact-flows{padding:8px 10px 10px;}.history-overview-flow.is-compact{flex-basis:100%;min-height:38px;padding:8px 10px;}}\
    ";
    document.head.appendChild(style);
  }

  function install() {
    ensureStyles();
    installListOverview();
    installIndexDetailOverview();
  }

  var view = document.querySelector("#view");
  if (view) {
    var observer = new MutationObserver(function () { install(); });
    observer.observe(view, { childList: true, subtree: true });
  }
  window.addEventListener("hashchange", function () { setTimeout(install, 0); });
  document.addEventListener("DOMContentLoaded", install);
  setTimeout(install, 0);
})();
