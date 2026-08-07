/* Quote context enhancement
   quotes[].context / purpose / placement 를 인용구 위 설명으로 표시한다.
   목표: 책 전체/장 전체 설명이 반복되지 않도록, 각 인용 위치의 고유한 논증 맥락을 카드 안에 노출한다. */

(function () {
  function ensureQuoteContextStyles() {
    if (document.querySelector("#quote-context-enhance-styles")) return;
    const style = document.createElement("style");
    style.id = "quote-context-enhance-styles";
    style.textContent = `
      .quote-block{margin-top:12px}
      .quote-block+.quote-block{margin-top:16px}
      .quote-context{margin:0 0 8px;color:var(--muted);font-size:.93rem;line-height:1.72;border-left:3px solid var(--line-strong);padding-left:12px;background:var(--surface-2);border-radius:0 10px 10px 0;padding-top:9px;padding-bottom:9px;padding-right:10px}
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

  if (typeof quotesHTML === "function") {
    quotesHTML = enhancedQuotesHTML;
  } else {
    window.quotesHTML = enhancedQuotesHTML;
  }

  if (typeof render === "function") render();
})();
