/* Westminster Shorter Catechism index renderer.
   Reads docs/westminster-shorter-catechism-index.md and injects a card grid on the WSC confession page. */
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
      xhr.open("GET", "./docs/westminster-shorter-catechism-index.md", false);
      xhr.send(null);
      if (xhr.status >= 200 && xhr.status < 300) text = xhr.responseText || "";
    } catch (error) {
      console.warn("Westminster Shorter Catechism index was not loaded.", error);
    }
    CACHE = parseMarkdown(text);
    return CACHE;
  }

  function groupFor(number) {
    if (number <= 3) return "목적과 성경";
    if (number <= 12) return "하나님·작정·창조";
    if (number <= 19) return "타락·죄·비참";
    if (number <= 28) return "구속자 그리스도";
    if (number <= 38) return "구속의 적용";
    if (number <= 44) return "도덕법 총론";
    if (number <= 81) return "십계명";
    if (number <= 97) return "은혜의 방편";
    return "기도와 주기도문";
  }

  function tagsFor(number, title, summary) {
    var text = [title, summary, groupFor(number)].join(" ");
    var tags = [groupFor(number)];
    [
      ["삼위", "삼위일체"], ["작정", "작정"], ["창조", "창조"], ["섭리", "섭리"],
      ["타락", "타락"], ["죄", "죄"], ["그리스도", "그리스도"], ["성령", "성령"],
      ["칭의", "칭의"], ["양자", "양자"], ["성화", "성화"], ["십계명", "십계명"],
      ["성례", "성례"], ["세례", "세례"], ["성찬", "성찬"], ["기도", "기도"],
      ["주기도문", "주기도문"], ["믿음", "믿음"], ["회개", "회개"], ["언약", "언약"]
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

  function isWscPage() {
    var page = document.querySelector(".confession-page");
    if (!page) return false;
    var title = page.querySelector("h3");
    return title && title.textContent.indexOf("웨스트민스터 소요리문답") !== -1;
  }

  function ensureStyles() {
    if (document.querySelector("#wsc-index-enhance-styles")) return;
    var style = document.createElement("style");
    style.id = "wsc-index-enhance-styles";
    style.textContent = "\
      .wsc-index-section{margin-top:18px;border:1px solid var(--line);border-radius:var(--radius);background:var(--surface-2);padding:18px;}\
      .wsc-index-head{display:flex;gap:12px;align-items:flex-end;justify-content:space-between;margin-bottom:14px;}\
      .wsc-index-head h4{font-family:var(--font-display);font-size:1.18rem;margin:0;}\
      .wsc-index-head p{margin:4px 0 0;color:var(--muted);font-size:.9rem;line-height:1.6;}\
      .wsc-index-tools{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;}\
      .wsc-filter{border:1px solid var(--line);background:var(--surface);border-radius:999px;padding:7px 10px;font-size:.82rem;cursor:pointer;color:var(--muted);}\
      .wsc-filter.is-active{border-color:var(--ink);color:var(--ink);font-weight:700;}\
      .wsc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;}\
      .wsc-card{border:1px solid var(--line);border-radius:14px;background:var(--surface);padding:14px 15px;}\
      .wsc-card .num{font-family:var(--font-mono);font-size:.72rem;color:var(--faint);display:block;margin-bottom:5px;}\
      .wsc-card h5{margin:0 0 7px;font-family:var(--font-display);font-size:1rem;}\
      .wsc-card p{margin:0 0 10px;color:var(--muted);font-size:.88rem;line-height:1.65;}\
      @media(max-width:720px){.wsc-index-head{display:block;}.wsc-grid{grid-template-columns:1fr;}}\
    ";
    document.head.appendChild(style);
  }

  function tagHtml(tags) {
    return tags.map(function (tag) { return '<span class="tag">' + esc(tag) + '</span>'; }).join("");
  }

  function cardHtml(item) {
    return '<article class="wsc-card" data-wsc-group="' + esc(item.group) + '"><span class="num">문 ' + item.number + '</span><h5>' + esc(item.title) + '</h5><p>' + esc(item.summary) + '</p><div class="feature-list">' + tagHtml(item.tags) + '</div></article>';
  }

  function renderCards(container, group) {
    var q = currentQuery();
    var items = readMarkdown().filter(function (item) {
      var text = [item.number, item.title, item.summary, item.group, item.tags.join(" ")].join(" ").toLowerCase();
      return (!group || item.group === group) && (!q || text.indexOf(q) !== -1);
    });
    var grid = container.querySelector(".wsc-grid");
    grid.innerHTML = items.length ? items.map(cardHtml).join("") : '<div class="empty"><b>소요리문답 색인</b>에서 조건에 맞는 항목을 찾지 못했습니다.</div>';
    container.querySelector(".wsc-count").textContent = String(items.length);
  }

  function install() {
    if (!isWscPage()) return;
    var page = document.querySelector(".confession-page");
    if (!page || page.querySelector(".wsc-index-section")) return;
    ensureStyles();
    var groups = ["전체", "목적과 성경", "하나님·작정·창조", "타락·죄·비참", "구속자 그리스도", "구속의 적용", "도덕법 총론", "십계명", "은혜의 방편", "기도와 주기도문"];
    var section = document.createElement("section");
    section.className = "wsc-index-section";
    section.innerHTML = '<div class="wsc-index-head"><div><h4>웨스트민스터 소요리문답 1–107문 색인</h4><p>문답 전문이 아니라 문항별 교리 주제와 교육용 자체 요약을 카드로 정리했습니다.</p></div><span class="tag"><b class="wsc-count">0</b> 문항</span></div><div class="wsc-index-tools">' + groups.map(function (group, index) { return '<button type="button" class="wsc-filter ' + (index === 0 ? 'is-active' : '') + '" data-wsc-filter="' + esc(group === "전체" ? "" : group) + '">' + esc(group) + '</button>'; }).join("") + '</div><div class="wsc-grid"></div>';
    page.appendChild(section);
    renderCards(section, "");
    section.querySelectorAll("[data-wsc-filter]").forEach(function (button) {
      button.onclick = function () {
        section.querySelectorAll(".wsc-filter").forEach(function (node) { node.classList.remove("is-active"); });
        button.classList.add("is-active");
        renderCards(section, button.getAttribute("data-wsc-filter") || "");
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
