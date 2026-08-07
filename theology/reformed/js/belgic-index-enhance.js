/* Belgic Confession article index renderer.
   Reads docs/belgic-confession-index.md and injects an article card grid on the Belgic Confession page. */
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
      xhr.open("GET", "./docs/belgic-confession-index.md", false);
      xhr.send(null);
      if (xhr.status >= 200 && xhr.status < 300) text = xhr.responseText || "";
    } catch (error) {
      console.warn("Belgic Confession index was not loaded.", error);
    }
    CACHE = parseMarkdown(text);
    return CACHE;
  }

  function groupFor(number) {
    if (number <= 7) return "하나님·계시·성경";
    if (number <= 13) return "삼위일체·창조·섭리";
    if (number <= 21) return "인간·죄·그리스도";
    if (number <= 26) return "칭의·성화·중보";
    if (number <= 32) return "교회·직분·권징";
    return "성례·국가·종말";
  }

  function tagsFor(number, title, summary) {
    var text = [title, summary, groupFor(number)].join(" ");
    var tags = [groupFor(number)];
    [
      ["성경", "성경론"], ["계시", "계시"], ["삼위", "삼위일체"], ["성자", "성자"],
      ["성령", "성령"], ["창조", "창조"], ["섭리", "섭리"], ["타락", "타락"],
      ["원죄", "죄"], ["선택", "선택"], ["성육신", "성육신"], ["두 본성", "기독론"],
      ["만족", "속죄"], ["믿음", "믿음"], ["칭의", "칭의"], ["선행", "선행"],
      ["중보", "중보"], ["교회", "교회론"], ["직분", "직분"], ["권징", "권징"],
      ["성례", "성례"], ["세례", "세례"], ["성찬", "성찬"], ["시민", "시민 정부"], ["심판", "심판"]
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

  function isBelgicPage() {
    var page = document.querySelector(".confession-page");
    if (!page) return false;
    var title = page.querySelector("h3");
    return title && title.textContent.indexOf("벨직 신앙고백서") !== -1;
  }

  function ensureStyles() {
    if (document.querySelector("#belgic-index-enhance-styles")) return;
    var style = document.createElement("style");
    style.id = "belgic-index-enhance-styles";
    style.textContent = "\
      .belgic-index-section{margin-top:18px;border:1px solid var(--line);border-radius:var(--radius);background:var(--surface-2);padding:18px;}\
      .belgic-index-head{display:flex;gap:12px;align-items:flex-end;justify-content:space-between;margin-bottom:14px;}\
      .belgic-index-head h4{font-family:var(--font-display);font-size:1.18rem;margin:0;}\
      .belgic-index-head p{margin:4px 0 0;color:var(--muted);font-size:.9rem;line-height:1.6;}\
      .belgic-index-tools{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;}\
      .belgic-filter{border:1px solid var(--line);background:var(--surface);border-radius:999px;padding:7px 10px;font-size:.82rem;cursor:pointer;color:var(--muted);}\
      .belgic-filter.is-active{border-color:var(--ink);color:var(--ink);font-weight:700;}\
      .belgic-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:12px;}\
      .belgic-card{border:1px solid var(--line);border-radius:14px;background:var(--surface);padding:14px 15px;}\
      .belgic-card .num{font-family:var(--font-mono);font-size:.72rem;color:var(--faint);display:block;margin-bottom:5px;}\
      .belgic-card h5{margin:0 0 7px;font-family:var(--font-display);font-size:1rem;}\
      .belgic-card p{margin:0 0 10px;color:var(--muted);font-size:.88rem;line-height:1.65;}\
      @media(max-width:720px){.belgic-index-head{display:block;}.belgic-grid{grid-template-columns:1fr;}}\
    ";
    document.head.appendChild(style);
  }

  function tagHtml(tags) {
    return tags.map(function (tag) { return '<span class="tag">' + esc(tag) + '</span>'; }).join("");
  }

  function cardHtml(item) {
    return '<article class="belgic-card" data-belgic-group="' + esc(item.group) + '"><span class="num">제' + item.number + '조</span><h5>' + esc(item.title) + '</h5><p>' + esc(item.summary) + '</p><div class="feature-list">' + tagHtml(item.tags) + '</div></article>';
  }

  function renderCards(container, group) {
    var q = currentQuery();
    var items = readMarkdown().filter(function (item) {
      var text = [item.number, item.title, item.summary, item.group, item.tags.join(" ")].join(" ").toLowerCase();
      return (!group || item.group === group) && (!q || text.indexOf(q) !== -1);
    });
    var grid = container.querySelector(".belgic-grid");
    grid.innerHTML = items.length ? items.map(cardHtml).join("") : '<div class="empty"><b>벨직 신앙고백서 색인</b>에서 조건에 맞는 항목을 찾지 못했습니다.</div>';
    container.querySelector(".belgic-count").textContent = String(items.length);
  }

  function install() {
    if (!isBelgicPage()) return;
    var page = document.querySelector(".confession-page");
    if (!page || page.querySelector(".belgic-index-section")) return;
    ensureStyles();
    var groups = ["전체", "하나님·계시·성경", "삼위일체·창조·섭리", "인간·죄·그리스도", "칭의·성화·중보", "교회·직분·권징", "성례·국가·종말"];
    var section = document.createElement("section");
    section.className = "belgic-index-section";
    section.innerHTML = '<div class="belgic-index-head"><div><h4>벨직 신앙고백서 37조 색인</h4><p>조항 전문이 아니라 교리 흐름과 교육용 자체 요약을 카드로 정리했습니다.</p></div><span class="tag"><b class="belgic-count">0</b> 조항</span></div><div class="belgic-index-tools">' + groups.map(function (group, index) { return '<button type="button" class="belgic-filter ' + (index === 0 ? 'is-active' : '') + '" data-belgic-filter="' + esc(group === "전체" ? "" : group) + '">' + esc(group) + '</button>'; }).join("") + '</div><div class="belgic-grid"></div>';
    page.appendChild(section);
    renderCards(section, "");
    section.querySelectorAll("[data-belgic-filter]").forEach(function (button) {
      button.onclick = function () {
        section.querySelectorAll(".belgic-filter").forEach(function (node) { node.classList.remove("is-active"); });
        button.classList.add("is-active");
        renderCards(section, button.getAttribute("data-belgic-filter") || "");
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
