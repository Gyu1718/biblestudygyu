/* Heidelberg Catechism self-translation renderer.
   Reads docs/heidelberg-catechism-self-translation.md and injects Q/A cards on the Heidelberg page. */
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
      xhr.open("GET", "./docs/heidelberg-catechism-self-translation.md", false);
      xhr.send(null);
      if (xhr.status >= 200 && xhr.status < 300) text = xhr.responseText || "";
    } catch (error) {
      console.warn("Heidelberg Catechism self-translation was not loaded.", error);
    }
    CACHE = parseMarkdown(text);
    return CACHE;
  }

  function lordDayFor(number) {
    if (number <= 2) return "제1주일";
    if (number <= 5) return "제2주일";
    if (number <= 8) return "제3주일";
    if (number <= 11) return "제4주일";
    if (number <= 15) return "제5주일";
    if (number <= 19) return "제6주일";
    if (number <= 23) return "제7주일";
    if (number <= 25) return "제8주일";
    if (number <= 26) return "제9주일";
    if (number <= 28) return "제10주일";
    if (number <= 30) return "제11주일";
    if (number <= 32) return "제12주일";
    if (number <= 34) return "제13주일";
    if (number <= 36) return "제14주일";
    if (number <= 39) return "제15주일";
    if (number <= 44) return "제16주일";
    if (number <= 45) return "제17주일";
    if (number <= 49) return "제18주일";
    if (number <= 52) return "제19주일";
    if (number <= 53) return "제20주일";
    if (number <= 56) return "제21주일";
    if (number <= 58) return "제22주일";
    return "추후 수록";
  }

  function parseMarkdown(text) {
    var items = [];
    var current = null;
    var lines = text.split(/\r?\n/);
    lines.forEach(function (line) {
      var match = line.match(/^###\s+문\s+(\d+)\.\s+(.+)$/);
      if (match) {
        if (current) items.push(current);
        var number = parseInt(match[1], 10);
        current = { number: number, question: match[2].trim(), answer: [], lordDay: lordDayFor(number) };
        return;
      }
      if (current && line.trim() && !/^#/.test(line)) current.answer.push(line.trim());
    });
    if (current) items.push(current);
    items.forEach(function (item) { item.answer = item.answer.join(" "); });
    return items;
  }

  function currentQuery() {
    return (typeof state !== "undefined" && state.q ? state.q : "").toLowerCase();
  }

  function isHeidelbergPage() {
    var page = document.querySelector(".confession-page");
    if (!page) return false;
    var title = page.querySelector("h3");
    return title && title.textContent.indexOf("하이델베르크 요리문답") !== -1;
  }

  function ensureStyles() {
    if (document.querySelector("#heidelberg-text-enhance-styles")) return;
    var style = document.createElement("style");
    style.id = "heidelberg-text-enhance-styles";
    style.textContent = "\
      .heidelberg-text-section{margin-top:18px;border:1px solid var(--line);border-radius:var(--radius);background:var(--surface-2);padding:18px;}\
      .heidelberg-text-head{display:flex;gap:12px;align-items:flex-end;justify-content:space-between;margin-bottom:14px;}\
      .heidelberg-text-head h4{font-family:var(--font-display);font-size:1.18rem;margin:0;}\
      .heidelberg-text-head p{margin:4px 0 0;color:var(--muted);font-size:.9rem;line-height:1.6;}\
      .heidelberg-text-tools{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;}\
      .heidelberg-filter{border:1px solid var(--line);background:var(--surface);border-radius:999px;padding:7px 10px;font-size:.82rem;cursor:pointer;color:var(--muted);}\
      .heidelberg-filter.is-active{border-color:var(--ink);color:var(--ink);font-weight:700;}\
      .heidelberg-qa-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:12px;}\
      .heidelberg-qa-card{border:1px solid var(--line);border-radius:14px;background:var(--surface);padding:14px 15px;}\
      .heidelberg-qa-card .num{font-family:var(--font-mono);font-size:.72rem;color:var(--faint);display:block;margin-bottom:5px;}\
      .heidelberg-qa-card h5{margin:0 0 8px;font-family:var(--font-display);font-size:1rem;line-height:1.45;}\
      .heidelberg-qa-card p{margin:0;color:var(--muted);font-size:.88rem;line-height:1.75;}\
      @media(max-width:720px){.heidelberg-text-head{display:block;}.heidelberg-qa-grid{grid-template-columns:1fr;}}\
    ";
    document.head.appendChild(style);
  }

  function cardHtml(item) {
    return '<article class="heidelberg-qa-card" data-lord-day="' + esc(item.lordDay) + '"><span class="num">' + esc(item.lordDay) + ' · 문 ' + item.number + '</span><h5>' + esc(item.question) + '</h5><p>' + esc(item.answer) + '</p></article>';
  }

  function renderCards(container, lordDay) {
    var q = currentQuery();
    var items = readMarkdown().filter(function (item) {
      var text = [item.number, item.question, item.answer, item.lordDay].join(" ").toLowerCase();
      return (!lordDay || item.lordDay === lordDay) && (!q || text.indexOf(q) !== -1);
    });
    var grid = container.querySelector(".heidelberg-qa-grid");
    grid.innerHTML = items.length ? items.map(cardHtml).join("") : '<div class="empty"><b>하이델베르크 자체 번역</b>에서 조건에 맞는 문답을 찾지 못했습니다.</div>';
    container.querySelector(".heidelberg-text-count").textContent = String(items.length);
  }

  function install() {
    if (!isHeidelbergPage()) return;
    var page = document.querySelector(".confession-page");
    if (!page || page.querySelector(".heidelberg-text-section")) return;
    ensureStyles();
    var groups = ["전체"];
    for (var i = 1; i <= 22; i += 1) groups.push("제" + i + "주일");
    var section = document.createElement("section");
    section.className = "heidelberg-text-section";
    section.innerHTML = '<div class="heidelberg-text-head"><div><h4>하이델베르크 요리문답 자체 번역</h4><p>현재 제1–22주일, 문 1–58까지 수록했습니다. 기존 한국어 번역본을 복사하지 않은 공개 저장소용 자체 번역입니다.</p></div><span class="tag"><b class="heidelberg-text-count">0</b> 문답</span></div><div class="heidelberg-text-tools">' + groups.map(function (group, index) { return '<button type="button" class="heidelberg-filter ' + (index === 0 ? 'is-active' : '') + '" data-heidelberg-filter="' + esc(group === "전체" ? "" : group) + '">' + esc(group) + '</button>'; }).join("") + '</div><div class="heidelberg-qa-grid"></div>';
    page.appendChild(section);
    renderCards(section, "");
    section.querySelectorAll("[data-heidelberg-filter]").forEach(function (button) {
      button.onclick = function () {
        section.querySelectorAll(".heidelberg-filter").forEach(function (node) { node.classList.remove("is-active"); });
        button.classList.add("is-active");
        renderCards(section, button.getAttribute("data-heidelberg-filter") || "");
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
