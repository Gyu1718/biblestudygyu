/* Barth book deep enhancer v5
   Solves the unresolved issue in the book-Barth detail page:
   - old behavior: one repeated paragraph per CD volume/section
   - new behavior: each section receives subtopicDetails[], and the UI renders each subtopic with its own explanation.
   Upload this file to js/barth-book-deep-enhance-v5.js and load it after js/app.js.
*/
(function () {
  const DATA_PATH = "./data/barth-book-deep-context-v5.json";

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function arr(value) {
    return Array.isArray(value) ? value : [];
  }

  function getArchiveData() {
    try {
      if (typeof DATA !== "undefined" && DATA && Array.isArray(DATA.books)) return DATA;
    } catch (error) {}
    if (window.__DATA__ && Array.isArray(window.__DATA__.books)) return window.__DATA__;
    return null;
  }

  function ensureStyles() {
    if (document.querySelector("#barth-book-deep-enhance-v5-styles")) return;
    const style = document.createElement("style");
    style.id = "barth-book-deep-enhance-v5-styles";
    style.textContent = `
      .barth-deep-note{margin:12px 0 14px;color:var(--muted);font-size:.94rem;line-height:1.72}
      .barth-subtopic-grid{display:grid;grid-template-columns:1fr;gap:10px;margin:14px 0}
      .barth-subtopic-card{border:1px solid var(--line);border-radius:13px;background:var(--surface-2);padding:13px 14px}
      .barth-subtopic-card h5{margin:0 0 7px;font-size:.96rem;font-family:var(--font-display);color:var(--ink)}
      .barth-subtopic-card p{margin:7px 0;color:var(--muted);font-size:.9rem;line-height:1.68}
      .barth-subtopic-card .focus{font-family:var(--font-mono);font-size:.75rem;letter-spacing:.01em;color:var(--muted);border-top:1px dashed var(--line);padding-top:8px;margin-top:9px}
      .barth-subtopic-card .comparison{background:var(--surface);border-left:3px solid var(--line-strong);border-radius:0 10px 10px 0;padding:8px 10px;margin-top:9px}
      .barth-concept-row{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}
      .barth-concept-row span{border:1px solid var(--line);border-radius:999px;background:var(--surface);padding:4px 8px;color:var(--muted);font-size:.75rem}
      .quote-block{margin-top:12px}
      .quote-block+.quote-block{margin-top:16px}
      .quote-context{margin:0 0 8px;color:var(--muted);font-size:.93rem;line-height:1.72;border-left:3px solid var(--line-strong);padding:9px 10px 9px 12px;background:var(--surface-2);border-radius:0 10px 10px 0}
      .quote-meta{display:flex;gap:6px;flex-wrap:wrap;margin:7px 0 0}
      .quote-meta span{font-family:var(--font-mono);font-size:.7rem;color:var(--muted);border:1px solid var(--line);border-radius:999px;padding:4px 7px;background:var(--surface)}
      @media(min-width:980px){.barth-subtopic-grid{grid-template-columns:1fr 1fr}}
    `;
    document.head.appendChild(style);
  }

  function normalizeRef(ref) {
    return String(ref || "").replace(/\s+/g, " ").trim();
  }

  function sectionKey(ref) {
    return normalizeRef(ref)
      .replace(/^CD\s+/, "")
      .replace(/\s*—.*$/, "")
      .trim();
  }

  function bestSubtopicForQuote(quote, record) {
    const subtopics = arr(record.subtopicContexts);
    if (!subtopics.length) return null;

    const qText = [
      quote.subtopic,
      quote.topic,
      quote.purpose,
      quote.ref,
      quote.text
    ].filter(Boolean).join(" ");

    let found = subtopics.find(s => quote.subtopic && s.label === quote.subtopic);
    if (found) return found;

    found = subtopics.find(s => qText.includes(s.label) || s.label.includes(qText));
    if (found) return found;

    found = subtopics.find(s => arr(s.concepts).some(c => qText.includes(c)));
    if (found) return found;

    return subtopics[0];
  }

  function applyRecords(payload) {
    const archive = getArchiveData();
    if (!archive || !Array.isArray(archive.books)) return false;

    const book = archive.books.find(item => item && item.id === "barth-church-dogmatics");
    if (!book || !Array.isArray(book.parts)) return false;

    const map = {};
    arr(payload.sections).forEach(record => {
      map[normalizeRef(record.ref)] = record;
      map[sectionKey(record.ref)] = record;
    });

    book.parts.forEach(part => {
      arr(part.chapters).forEach(chapter => {
        const record = map[normalizeRef(chapter.ref)] || map[sectionKey(chapter.ref)];
        if (!record) return;

        chapter.__barthDeepV5 = true;
        chapter.summary = record.summary || chapter.summary;
        chapter.detail = record.detail || chapter.detail;
        chapter.argumentRole = record.argumentRole || "";
        chapter.subtopicDetails = arr(record.subtopicContexts);
        chapter.keyPoints = arr(record.keyPoints).length ? record.keyPoints : chapter.keyPoints;
        chapter.concepts = Array.from(new Set(arr(chapter.concepts).concat(arr(record.concepts))));

        arr(chapter.quotes).forEach(quote => {
          const sub = bestSubtopicForQuote(quote, record);
          if (!sub) return;
          quote.subtopic = quote.subtopic || sub.label;
          quote.context = sub.quoteContext || quote.context;
          quote.purpose = quote.purpose || "subtopic-context";
          quote.placement = quote.placement || "quote-block";
        });
      });
    });

    return true;
  }

  function quoteMetaHTML(q) {
    const items = [q.subtopic, q.topic, q.purpose, q.placement].filter(Boolean);
    return items.length ? `<div class="quote-meta">${items.map(x => `<span>${esc(x)}</span>`).join("")}</div>` : "";
  }

  function deepQuotesHTML(items) {
    if (!items || !items.length) return "";
    const html = items.filter(q => q.text && q.source).map(q => `
      <div class="quote-block">
        ${q.context ? `<p class="quote-context">${esc(q.context)}</p>` : ""}
        <blockquote class="chap-quote">${esc(q.text)}<cite>— ${esc(q.source)}${q.ref ? ` · ${esc(q.ref)}` : ""}</cite></blockquote>
        ${quoteMetaHTML(q)}
      </div>`).join("");
    return html ? `<div class="quotes">${html}</div>` : "";
  }

  function subtopicCardsHTML(ch) {
    const items = arr(ch.subtopicDetails);
    if (!items.length) return "";
    return `<div class="barth-subtopic-grid">` + items.map(item => `
      <section class="barth-subtopic-card">
        <h5>${esc(item.order ? item.order + ". " : "")}${esc(item.label)}</h5>
        ${item.oneLineSummary ? `<p><b>핵심:</b> ${esc(item.oneLineSummary)}</p>` : ""}
        ${item.detail ? `<p>${esc(item.detail)}</p>` : ""}
        ${item.focusQuestion ? `<p class="focus">${esc(item.focusQuestion)}</p>` : ""}
        ${item.reformedComparison ? `<p class="comparison"><b>개혁파 비교:</b> ${esc(item.reformedComparison)}</p>` : ""}
        ${item.researchUse ? `<p><b>연구 활용:</b> ${esc(item.researchUse)}</p>` : ""}
        ${arr(item.concepts).length ? `<div class="barth-concept-row">${arr(item.concepts).slice(0, 8).map(c => `<span>${esc(c)}</span>`).join("")}</div>` : ""}
      </section>`).join("") + `</div>`;
  }

  function renderDeepChapter(ch) {
    const ref = `<span class="cref">${esc(ch.ref || "·")}</span>`;
    const head = `${ref}<div class="chap-head"><b>${esc(ch.title)}</b>${ch.summary ? `<p>${esc(ch.summary)}</p>` : ""}</div>`;
    const tags = arr(ch.concepts).length ? `<div class="tags">${arr(ch.concepts).slice(0, 12).map(x => `<span class="tag">${esc(x)}</span>`).join("")}</div>` : "";
    const subtopics = subtopicCardsHTML(ch);
    const quotes = deepQuotesHTML(ch.quotes);
    const keypoints = arr(ch.keyPoints).length ? `<ul class="keypoints">${arr(ch.keyPoints).map(k => `<li>${esc(k)}</li>`).join("")}</ul>` : "";
    const role = ch.argumentRole ? `<p class="barth-deep-note"><b>논증 위치:</b> ${esc(ch.argumentRole)}</p>` : "";
    return `<details class="chap-x"><summary class="chap chap-sum">${head}</summary><div class="chap-detail">
      ${ch.detail ? `<p class="chap-body">${esc(ch.detail)}</p>` : ""}
      ${role}
      ${subtopics || keypoints}
      ${quotes}
      ${tags}
    </div></details>`;
  }

  const previousChapterHTML = (typeof chapterHTML === "function") ? chapterHTML : null;
  const previousQuotesHTML = (typeof quotesHTML === "function") ? quotesHTML : null;

  function installRenderers() {
    ensureStyles();

    if (typeof quotesHTML === "function") {
      quotesHTML = function(items) {
        return deepQuotesHTML(items);
      };
    }

    if (typeof chapterHTML === "function") {
      chapterHTML = function(ch) {
        if (ch && ch.__barthDeepV5) return renderDeepChapter(ch);
        return previousChapterHTML ? previousChapterHTML(ch) : "";
      };
    }
  }

  function loadAndApply() {
    fetch(DATA_PATH, { cache: "no-cache" })
      .then(response => {
        if (!response.ok) throw new Error(DATA_PATH + " " + response.status);
        return response.json();
      })
      .then(payload => {
        installRenderers();
        const changed = applyRecords(payload);
        if (changed && typeof render === "function") render();
      })
      .catch(error => {
        console.warn("Barth deep context v5 was not applied.", error);
      });
  }

  loadAndApply();
})();