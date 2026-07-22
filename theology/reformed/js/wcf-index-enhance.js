/* Westminster Confession of Faith chapter index renderer.
   Reads docs/westminster-confession-index.md and injects a chapter card grid on the WCF confession page. */
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
      xhr.open("GET", "./docs/westminster-confession-index.md", false);
      xhr.send(null);
      if (xhr.status >= 200 && xhr.status < 300) text = xhr.responseText || "";
    } catch (error) {
      console.warn("Westminster Confession index was not loaded.", error);
    }
    CACHE = parseMarkdown(text);
    return CACHE;
  }

  function groupFor(number) {
    if (number <= 5) return "성경과 하나님";
    if (number <= 10) return "인간·언약·그리스도";
    if (number <= 18) return "구원의 적용";
    if (number <= 24) return "법·자유·예배";
    if (number <= 31) return "교회와 성례";
    return "종말";
  }

  function tagsFor(number, title, summary) {
    var text = [title, summary, groupFor(number)].join(" ");
    var tags = [groupFor(number)];
    [
      ["성경", "성경론"], ["삼위", "삼위일체"], ["작정", "작정"], ["창조", "창조"],
      ["섭리", "섭리"], ["타락", "타락"], ["언약", "언약"], ["그리스도", "기독론"],
      ["칭의", "칭의"], ["양자", "양자"], ["성화", "성화"], ["믿음", "믿음"],
      ["회개", "회개"], ["견인", "견인"], ["확신", "확신"], ["법", "율법"],
      ["예배", "예배"], ["시민", "시민 정부"], ["교회", "교회론"], ["성례", "성례"],
      ["세례", "세례"], ["성찬", "성찬"], ["권징", "권징"], ["부활", "부활"], ["심판", "심판"]
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

  function isWcfPage() {
    var page = document.querySelector(".confession-page");
    if (!page) return false;
    var title = page.querySelector("h3");
    return title && title.textContent.indexOf("웨스트민스터 신앙고백서") !== -1;
  }

  function ensureStyles() {
    if (document.querySelector("#wcf-index-enhance-styles")) return;
    var style = document.createElement("style");
    style.id = "wcf-index-enhance-styles";
    style.textContent = "\
      .wcf-index-section{margin-top:18px;border:1px solid var(--line);border-radius:var(--radius);background:var(--surface-2);padding:18px;}\
      .wcf-index-head{display:flex;gap:12px;align-items:flex-end;justify-content:space-between;margin-bottom:14px;}\
      .wcf-index-head h4{font-family:var(--font-display);font-size:1.18rem;margin:0;}\
      .wcf-index-head p{margin:4px 0 0;color:var(--muted);font-size:.9rem;line-height:1.6;}\
      .wcf-index-tools{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;}\
      .wcf-filter{border:1px solid var(--line);background:var(--surface);border-radius:999px;padding:7px 10px;font-size:.82rem;cursor:pointer;color:var(--muted);}\
      .wcf-filter.is-active{border-color:var(--ink);color:var(--ink);font-weight:700;}\
      .wcf-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:12px;}\
      .wcf-card{border:1px solid var(--line);border-radius:14px;background:var(--surface);padding:14px 15px;}\
      .wcf-card .num{font-family:var(--font-mono);font-size:.72rem;color:var(--faint);display:block;margin-bottom:5px;}\
      .wcf-card h5{margin:0 0 7px;font-family:var(--font-display);font-size:1rem;}\
      .wcf-card p{margin:0 0 10px;color:var(--muted);font-size:.88rem;line-height:1.65;}\
      @media(max-width:720px){.wcf-index-head{display:block;}.wcf-grid{grid-template-columns:1fr;}}\
    ";
    document.head.appendChild(style);
  }

  function tagHtml(tags) {
    return tags.map(function (tag) { return '<span class="tag">' + esc(tag) + '</span>'; }).join("");
  }

  function cardHtml(item) {
    return '<article class="wcf-card" data-wcf-group="' + esc(item.group) + '"><span class="num">제' + item.number + '장</span><h5>' + esc(item.title) + '</h5><p>' + esc(item.summary) + '</p><div class="feature-list">' + tagHtml(item.tags) + '</div></article>';
  }

  function renderCards(container, group) {
    var q = currentQuery();
    var items = readMarkdown().filter(function (item) {
      var text = [item.number, item.title, item.summary, item.group, item.tags.join(" ")].join(" ").toLowerCase();
      return (!group || item.group === group) && (!q || text.indexOf(q) !== -1);
    });
    var grid = container.querySelector(".wcf-grid");
    grid.innerHTML = items.length ? items.map(cardHtml).join("") : '<div class="empty"><b>신앙고백서 색인</b>에서 조건에 맞는 항목을 찾지 못했습니다.</div>';
    container.querySelector(".wcf-count").textContent = String(items.length);
  }

  function install() {
    if (!isWcfPage()) return;
    var page = document.querySelector(".confession-page");
    if (!page || page.querySelector(".wcf-index-section")) return;
    ensureStyles();
    var groups = ["전체", "성경과 하나님", "인간·언약·그리스도", "구원의 적용", "법·자유·예배", "교회와 성례", "종말"];
    var section = document.createElement("section");
    section.className = "wcf-index-section";
    section.innerHTML = '<div class="wcf-index-head"><div><h4>웨스트민스터 신앙고백서 33장 색인</h4><p>장별 전문이 아니라 교리 흐름과 교육용 자체 요약을 카드로 정리했습니다.</p></div><span class="tag"><b class="wcf-count">0</b> 장</span></div><div class="wcf-index-tools">' + groups.map(function (group, index) { return '<button type="button" class="wcf-filter ' + (index === 0 ? 'is-active' : '') + '" data-wcf-filter="' + esc(group === "전체" ? "" : group) + '">' + esc(group) + '</button>'; }).join("") + '</div><div class="wcf-grid"></div>';
    page.appendChild(section);
    renderCards(section, "");
    section.querySelectorAll("[data-wcf-filter]").forEach(function (button) {
      button.onclick = function () {
        section.querySelectorAll(".wcf-filter").forEach(function (node) { node.classList.remove("is-active"); });
        button.classList.add("is-active");
        renderCards(section, button.getAttribute("data-wcf-filter") || "");
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
