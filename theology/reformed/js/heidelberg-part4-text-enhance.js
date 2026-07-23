/* Heidelberg Catechism self-translation part 4 renderer.
   Reads docs/heidelberg-catechism-self-translation-part4.md and injects Q/A cards on the Heidelberg page. */
(function () {
  var CACHE = null;

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function loadText() {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", "./docs/heidelberg-catechism-self-translation-part4.md", false);
      xhr.send(null);
      if (xhr.status >= 200 && xhr.status < 300) return xhr.responseText || "";
    } catch (error) {
      console.warn("Heidelberg Catechism part 4 was not loaded.", error);
    }
    return "";
  }

  function lordDayFor(number) {
    if (number <= 87) return "제32주일";
    if (number <= 91) return "제33주일";
    if (number <= 95) return "제34주일";
    if (number <= 98) return "제35주일";
    if (number <= 100) return "제36주일";
    if (number <= 102) return "제37주일";
    if (number <= 103) return "제38주일";
    if (number <= 104) return "제39주일";
    if (number <= 107) return "제40주일";
    if (number <= 109) return "제41주일";
    if (number <= 111) return "제42주일";
    if (number <= 112) return "제43주일";
    if (number <= 115) return "제44주일";
    return "추후 수록";
  }

  function parseMarkdown(text) {
    var items = [];
    var current = null;
    text.split(/\r?\n/).forEach(function (line) {
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
    return items.sort(function (a, b) { return a.number - b.number; });
  }

  function readItems() {
    if (CACHE) return CACHE;
    CACHE = parseMarkdown(loadText());
    return CACHE;
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
    if (document.querySelector("#heidelberg-part4-text-styles")) return;
    var style = document.createElement("style");
    style.id = "heidelberg-part4-text-styles";
    style.textContent = "\
      .heidelberg-part4-section{margin-top:18px;border:1px solid var(--line);border-radius:var(--radius);background:var(--surface-2);padding:18px;}\
      .heidelberg-part4-head{display:flex;gap:12px;align-items:flex-end;justify-content:space-between;margin-bottom:14px;}\
      .heidelberg-part4-head h4{font-family:var(--font-display);font-size:1.18rem;margin:0;}\
      .heidelberg-part4-head p{margin:4px 0 0;color:var(--muted);font-size:.9rem;line-height:1.6;}\
      .heidelberg-part4-tools{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;}\
      .heidelberg-part4-filter{border:1px solid var(--line);background:var(--surface);border-radius:999px;padding:7px 10px;font-size:.82rem;cursor:pointer;color:var(--muted);}\
      .heidelberg-part4-filter.is-active{border-color:var(--ink);color:var(--ink);font-weight:700;}\
      .heidelberg-part4-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:12px;}\
      .heidelberg-part4-card{border:1px solid var(--line);border-radius:14px;background:var(--surface);padding:14px 15px;}\
      .heidelberg-part4-card .num{font-family:var(--font-mono);font-size:.72rem;color:var(--faint);display:block;margin-bottom:5px;}\
      .heidelberg-part4-card h5{margin:0 0 8px;font-family:var(--font-display);font-size:1rem;line-height:1.45;}\
      .heidelberg-part4-card p{margin:0;color:var(--muted);font-size:.88rem;line-height:1.75;}\
      @media(max-width:720px){.heidelberg-part4-head{display:block;}.heidelberg-part4-grid{grid-template-columns:1fr;}}\
    ";
    document.head.appendChild(style);
  }

  function cardHtml(item) {
    return '<article class="heidelberg-part4-card"><span class="num">' + esc(item.lordDay) + ' · 문 ' + item.number + '</span><h5>' + esc(item.question) + '</h5><p>' + esc(item.answer) + '</p></article>';
  }

  function renderCards(container, lordDay) {
    var q = currentQuery();
    var items = readItems().filter(function (item) {
      var text = [item.number, item.question, item.answer, item.lordDay].join(" ").toLowerCase();
      return (!lordDay || item.lordDay === lordDay) && (!q || text.indexOf(q) !== -1);
    });
    container.querySelector(".heidelberg-part4-grid").innerHTML = items.length ? items.map(cardHtml).join("") : '<div class="empty"><b>하이델베르크 4차분</b>에서 조건에 맞는 문답을 찾지 못했습니다.</div>';
    container.querySelector(".heidelberg-part4-count").textContent = String(items.length);
  }

  function install() {
    if (!isHeidelbergPage()) return;
    var page = document.querySelector(".confession-page");
    if (!page || page.querySelector(".heidelberg-part4-section")) return;
    ensureStyles();
    var groups = ["전체", "제32주일", "제33주일", "제34주일", "제35주일", "제36주일", "제37주일", "제38주일", "제39주일", "제40주일", "제41주일", "제42주일", "제43주일", "제44주일"];
    var section = document.createElement("section");
    section.className = "heidelberg-part4-section";
    section.innerHTML = '<div class="heidelberg-part4-head"><div><h4>하이델베르크 요리문답 자체 번역 4차분</h4><p>제32–44주일, 문 86–115까지 수록했습니다. 회개, 선행, 십계명 해설을 다룹니다.</p></div><span class="tag"><b class="heidelberg-part4-count">0</b> 문답</span></div><div class="heidelberg-part4-tools">' + groups.map(function (group, index) { return '<button type="button" class="heidelberg-part4-filter ' + (index === 0 ? 'is-active' : '') + '" data-heidelberg-part4-filter="' + esc(group === "전체" ? "" : group) + '">' + esc(group) + '</button>'; }).join("") + '</div><div class="heidelberg-part4-grid"></div>';
    page.appendChild(section);
    renderCards(section, "");
    section.querySelectorAll("[data-heidelberg-part4-filter]").forEach(function (button) {
      button.onclick = function () {
        section.querySelectorAll(".heidelberg-part4-filter").forEach(function (node) { node.classList.remove("is-active"); });
        button.classList.add("is-active");
        renderCards(section, button.getAttribute("data-heidelberg-part4-filter") || "");
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
