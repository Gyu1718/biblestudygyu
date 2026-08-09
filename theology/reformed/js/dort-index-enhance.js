/* Canons of Dort doctrine index renderer.
   Reads docs/canons-of-dort-index.md and injects a doctrine card grid on the Dort page. */
(function () {
  var CACHE = null;

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function readMarkdown() {
    if (CACHE) return CACHE;
    var text = "";
    try {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", "./docs/canons-of-dort-index.md", false);
      xhr.send(null);
      if (xhr.status >= 200 && xhr.status < 300) text = xhr.responseText || "";
    } catch (error) {
      console.warn("Canons of Dort index was not loaded.", error);
    }
    CACHE = parseMarkdown(text);
    return CACHE;
  }

  function groupFor(number) {
    if (number <= 8) return "선택과 유기";
    if (number <= 14) return "그리스도의 죽음";
    if (number <= 21) return "부패와 회심";
    if (number <= 27) return "성도의 견인";
    return "교육적 요약";
  }

  function tagsFor(number, title, summary) {
    var text = [title, summary, groupFor(number)].join(" ");
    var tags = [groupFor(number)];
    [
      ["선택", "선택"], ["유기", "유기"], ["복음", "복음 선포"], ["믿음", "믿음"],
      ["불신", "불신앙"], ["그리스도", "그리스도"], ["죽음", "속죄"], ["속죄", "속죄"],
      ["만족", "만족"], ["부패", "전적 부패"], ["타락", "타락"], ["성령", "성령"],
      ["중생", "중생"], ["회심", "회심"], ["은혜", "은혜"], ["견인", "견인"],
      ["확신", "확신"], ["거룩", "성화"], ["오류 반박", "논쟁"], ["위로", "위로"]
    ].forEach(function (pair) {
      if (text.indexOf(pair[0]) !== -1 && tags.indexOf(pair[1]) === -1) tags.push(pair[1]);
    });
    return tags.slice(0, 5);
  }

  function parseMarkdown(text) {
    var items = [];
    text.split(/\r?\n/).forEach(function (line) {
      var match = line.match(/^(\d+)\.\s+(.+?)\s+—\s+(.+)$/);
      if (!match) return;
      var number = parseInt(match[1], 10);
      var title = match[2].trim();
      var summary = match[3].trim();
      items.push({ number: number, title: title, summary: summary, group: groupFor(number), tags: tagsFor(number, title, summary) });
    });
    return items;
  }

  function currentQuery() {
    return (typeof state !== "undefined" && state.q ? state.q : "").toLowerCase();
  }

  function isDortPage() {
    var page = document.querySelector(".confession-page");
    if (!page) return false;
    var title = page.querySelector("h3");
    return title && title.textContent.indexOf("도르트 신조") !== -1;
  }

  function ensureStyles() {
    if (document.querySelector("#dort-index-enhance-styles")) return;
    var style = document.createElement("style");
    style.id = "dort-index-enhance-styles";
    style.textContent = "\
      .dort-index-section{margin-top:18px;border:1px solid var(--line);border-radius:var(--radius);background:var(--surface-2);padding:18px;}\
      .dort-index-head{display:flex;gap:12px;align-items:flex-end;justify-content:space-between;margin-bottom:14px;}\
      .dort-index-head h4{font-family:var(--font-display);font-size:1.18rem;margin:0;}\
      .dort-index-head p{margin:4px 0 0;color:var(--muted);font-size:.9rem;line-height:1.6;}\
      .dort-index-tools{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;}\
      .dort-filter{border:1px solid var(--line);background:var(--surface);border-radius:999px;padding:7px 10px;font-size:.82rem;cursor:pointer;color:var(--muted);}\
      .dort-filter.is-active{border-color:var(--ink);color:var(--ink);font-weight:700;}\
      .dort-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:12px;}\
      .dort-card{border:1px solid var(--line);border-radius:14px;background:var(--surface);padding:14px 15px;}\
      .dort-card .num{font-family:var(--font-mono);font-size:.72rem;color:var(--faint);display:block;margin-bottom:5px;}\
      .dort-card h5{margin:0 0 7px;font-family:var(--font-display);font-size:1rem;}\
      .dort-card p{margin:0 0 10px;color:var(--muted);font-size:.88rem;line-height:1.65;}\
      @media(max-width:720px){.dort-index-head{display:block;}.dort-grid{grid-template-columns:1fr;}}\
    ";
    document.head.appendChild(style);
  }

  function tagHtml(tags) {
    return tags.map(function (tag) { return '<span class="tag">' + esc(tag) + '</span>'; }).join("");
  }

  function cardHtml(item) {
    return '<article class="dort-card" data-dort-group="' + esc(item.group) + '"><span class="num">항목 ' + item.number + '</span><h5>' + esc(item.title) + '</h5><p>' + esc(item.summary) + '</p><div class="feature-list">' + tagHtml(item.tags) + '</div></article>';
  }

  function renderCards(container, group) {
    var q = currentQuery();
    var items = readMarkdown().filter(function (item) {
      var text = [item.number, item.title, item.summary, item.group, item.tags.join(" ")].join(" ").toLowerCase();
      return (!group || item.group === group) && (!q || text.indexOf(q) !== -1);
    });
    var grid = container.querySelector(".dort-grid");
    grid.innerHTML = items.length ? items.map(cardHtml).join("") : '<div class="empty"><b>도르트 신조 색인</b>에서 조건에 맞는 항목을 찾지 못했습니다.</div>';
    container.querySelector(".dort-count").textContent = String(items.length);
  }

  function install() {
    if (!isDortPage()) return;
    var page = document.querySelector(".confession-page");
    if (!page || page.querySelector(".dort-index-section")) return;
    ensureStyles();
    var groups = ["전체", "선택과 유기", "그리스도의 죽음", "부패와 회심", "성도의 견인", "교육적 요약"];
    var section = document.createElement("section");
    section.className = "dort-index-section";
    section.innerHTML = '<div class="dort-index-head"><div><h4>도르트 신조 5대 교리 색인</h4><p>교리 본문과 오류 반박의 흐름을 교육용 자체 요약 카드로 정리했습니다.</p></div><span class="tag"><b class="dort-count">0</b> 항목</span></div><div class="dort-index-tools">' + groups.map(function (group, index) { return '<button type="button" class="dort-filter ' + (index === 0 ? 'is-active' : '') + '" data-dort-filter="' + esc(group === "전체" ? "" : group) + '">' + esc(group) + '</button>'; }).join("") + '</div><div class="dort-grid"></div>';
    page.appendChild(section);
    renderCards(section, "");
    section.querySelectorAll("[data-dort-filter]").forEach(function (button) {
      button.onclick = function () {
        section.querySelectorAll(".dort-filter").forEach(function (node) { node.classList.remove("is-active"); });
        button.classList.add("is-active");
        renderCards(section, button.getAttribute("data-dort-filter") || "");
      };
    });
  }

  function boot() {
    install();
    var view = document.querySelector("#view");
    if (view) new MutationObserver(function () { setTimeout(install, 0); }).observe(view, { childList: true, subtree: true });
    document.addEventListener("click", function () { setTimeout(install, 0); });
    window.addEventListener("hashchange", function () { setTimeout(install, 0); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
