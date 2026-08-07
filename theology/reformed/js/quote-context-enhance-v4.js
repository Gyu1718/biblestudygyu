/* Quote and subtopic context renderer v4.
   Shows chapter.subtopicDetails as separate cards and renders quote.context above each quote. */
(function () {
  function arr(x) { return Array.isArray(x) ? x : []; }
  function ensureStyles() {
    if (document.querySelector("#quote-context-enhance-v4-styles")) return;
    var style = document.createElement("style");
    style.id = "quote-context-enhance-v4-styles";
    style.textContent = `
      .subtopic-contexts{margin:14px 0 16px;display:grid;grid-template-columns:1fr;gap:10px}
      .subtopic-context-card{border:1px solid var(--line);background:var(--surface-2);border-radius:14px;padding:13px 14px}
      .subtopic-context-card h5{margin:0 0 7px;font-family:var(--font-display);font-size:1rem}
      .subtopic-context-card p{margin:7px 0;color:var(--muted);line-height:1.72;font-size:.92rem}
      .subtopic-context-card .focus{border-left:3px solid var(--line-strong);padding-left:10px;background:var(--surface);border-radius:0 9px 9px 0;padding-top:7px;padding-bottom:7px}
      .subtopic-context-meta{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
      .subtopic-context-meta span,.quote-meta span{font-family:var(--font-mono);font-size:.7rem;color:var(--muted);border:1px solid var(--line);border-radius:999px;padding:4px 7px;background:var(--surface)}
      .quote-block{margin-top:12px}.quote-block+.quote-block{margin-top:16px}
      .quote-context{margin:0 0 8px;color:var(--muted);font-size:.93rem;line-height:1.72;border-left:3px solid var(--line-strong);padding-left:12px;background:var(--surface-2);border-radius:0 10px 10px 0;padding-top:9px;padding-bottom:9px;padding-right:10px}
      .quote-meta{display:flex;gap:6px;flex-wrap:wrap;margin:7px 0 0}
    `;
    document.head.appendChild(style);
  }
  function metaHTML(items) {
    items = arr(items).filter(Boolean);
    return items.length ? `<div class="subtopic-context-meta">${items.map(function(x){return `<span>${x}</span>`;}).join("")}</div>` : "";
  }
  function subtopicDetailsHTML(details) {
    details = arr(details);
    if (!details.length) return "";
    ensureStyles();
    return `<div class="subtopic-contexts">` + details.map(function (d) {
      return `<section class="subtopic-context-card">
        <h5>${d.order ? d.order + ". " : ""}${d.label || "소주제"}</h5>
        ${d.oneLineSummary ? `<p><b>요약</b> · ${d.oneLineSummary}</p>` : ""}
        ${d.detail ? `<p>${d.detail}</p>` : ""}
        ${d.focusQuestion ? `<p class="focus"><b>초점 질문</b> · ${d.focusQuestion}</p>` : ""}
        ${d.reformedComparison ? `<p><b>개혁파 비교</b> · ${d.reformedComparison}</p>` : ""}
        ${d.researchUse ? `<p><b>연구 활용</b> · ${d.researchUse}</p>` : ""}
        ${metaHTML(d.concepts)}
      </section>`;
    }).join("") + `</div>`;
  }
  function quoteMetaHTML(q) {
    var items = [q.topic, q.subtopic, q.purpose, q.placement].filter(Boolean);
    return items.length ? `<div class="quote-meta">${items.map(function(x){return `<span>${x}</span>`;}).join("")}</div>` : "";
  }
  function enhancedQuotesHTML(items) {
    items = arr(items);
    if (!items.length) return "";
    ensureStyles();
    var html = items.filter(function(q){ return q.text && q.source; }).map(function(q){
      return `<div class="quote-block">
        ${q.context ? `<p class="quote-context">${q.context}</p>` : ""}
        <blockquote class="chap-quote">${q.text}<cite>— ${q.source}${q.ref ? ` · ${q.ref}` : ""}</cite></blockquote>
        ${quoteMetaHTML(q)}
      </div>`;
    }).join("");
    return html ? `<div class="quotes">${html}</div>` : "";
  }
  if (typeof quotesHTML === "function") quotesHTML = enhancedQuotesHTML;
  else window.quotesHTML = enhancedQuotesHTML;
  if (typeof chapterHTML === "function") {
    chapterHTML = function (ch) {
      ensureStyles();
      var ref = `<span class="cref">${ch.ref || "·"}</span>`;
      var head = `${ref}<div class="chap-head"><b>${ch.title}</b>${ch.summary ? `<p>${ch.summary}</p>` : ""}</div>`;
      var tags = (ch.concepts && ch.concepts.length) ? `<div class="tags">${ch.concepts.map(function(x){return `<span class="tag">${x}</span>`;}).join("")}</div>` : "";
      var quotes = enhancedQuotesHTML(ch.quotes);
      var subtopics = subtopicDetailsHTML(ch.subtopicDetails);
      var hasDetail = ch.detail || arr(ch.keyPoints).length || quotes || subtopics;
      if (!hasDetail) return `<div class="chap">${head}</div>${tags ? `<div class="chap-tagrow">${tags}</div>` : ""}`;
      var kp = arr(ch.keyPoints).length ? `<ul class="keypoints">${arr(ch.keyPoints).map(function(k){return `<li>${k}</li>`;}).join("")}</ul>` : "";
      return `<details class="chap-x"><summary class="chap chap-sum">${head}</summary><div class="chap-detail">${ch.detail ? `<p class="chap-body">${ch.detail}</p>` : ""}${subtopics}${kp}${quotes}${tags}</div></details>`;
    };
  }
  if (typeof render === "function") render();
})();
