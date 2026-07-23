/* Quote context enhancement v2.
   Displays quotes[].context above each quote and preserves topic/purpose/placement metadata. */
(function () {
  function ensureQuoteContextStyles() {
    if (document.querySelector("#quote-context-enhance-v2-styles")) return;
    const style = document.createElement("style");
    style.id = "quote-context-enhance-v2-styles";
    style.textContent = `
      .quote-block{margin-top:14px}
      .quote-block+.quote-block{margin-top:18px}
      .quote-context{margin:0 0 9px;color:var(--muted);font-size:.94rem;line-height:1.78;border-left:3px solid var(--line-strong);padding:10px 12px;background:var(--surface-2);border-radius:0 12px 12px 0}
      .quote-meta{display:flex;gap:6px;flex-wrap:wrap;margin:7px 0 0}
      .quote-meta span{font-family:var(--font-mono);font-size:.7rem;color:var(--muted);border:1px solid var(--line);border-radius:999px;padding:4px 7px;background:var(--surface)}
    `;
    document.head.appendChild(style);
  }

  function metaHTML(q) {
    const items = [q.topic, q.purpose, q.placement].filter(Boolean);
    return items.length ? `<div class="quote-meta">${items.map(x => `<span>${x}</span>`).join("")}</div>` : "";
  }

  function enhancedQuotesHTML(items) {
    if (!items || !items.length) return "";
    ensureQuoteContextStyles();
    const html = items.filter(q => q.text && q.source).map(q => `
      <div class="quote-block">
        ${q.context ? `<p class="quote-context">${q.context}</p>` : ""}
        <blockquote class="chap-quote">${q.text}<cite>— ${q.source}${q.ref ? ` · ${q.ref}` : ""}</cite></blockquote>
        ${metaHTML(q)}
      </div>`).join("");
    return html ? `<div class="quotes">${html}</div>` : "";
  }

  if (typeof quotesHTML === "function") quotesHTML = enhancedQuotesHTML;
  else window.quotesHTML = enhancedQuotesHTML;
  if (typeof render === "function") render();
})();
