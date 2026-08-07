/* Reformed ⇄ Neo-Orthodox Theology Archive — data-driven app
   data/*.json 을 직접 읽어 화면에 뿌린다. GitHub Pages 정적 호스팅에 그대로 동작. */

const TRAD = {
  "개혁파 정통": { key: "ref", short: "개혁파" },
  "신정통주의": { key: "neo", short: "신정통주의" }
};
const REF = "개혁파 정통", NEO = "신정통주의";

const DATA = { books: [], authors: [], topics: [], notes: [], history: [], taxonomy: {} };
let state = { view: "compare", trad: "all", q: "", concept: null, route: null };

const el = s => document.querySelector(s);
const view = el("#view");
const tradClass = t => (TRAD[t] ? TRAD[t].key : "");
const tradTag = t => `<span class="trad-tag ${tradClass(t)}">${t}</span>`;
const matchTrad = t => state.trad === "all" || t === state.trad;
const matchQ = h => !state.q || String(h || "").toLowerCase().includes(state.q.toLowerCase());
const bookTitle = id => { const b = DATA.books.find(x => x.id === id); return b ? b.title : id; };
const authorTitle = id => { const a = DATA.authors.find(x => x.id === id || x.name === id || x.koreanName === id); return a ? (a.koreanName || a.name) : id; };
const arr = x => Array.isArray(x) ? x : [];

function parseHash() {
  const raw = decodeURIComponent((location.hash || "").replace(/^#/, ""));
  if (!raw) return null;
  const [type, id] = raw.split("=");
  if ((type === "book" || type === "topic" || type === "history") && id) return { type, id };
  return null;
}
function setRoute(type, id) { location.hash = `${type}=${encodeURIComponent(id)}`; }
function clearRoute(targetView) {
  history.pushState("", document.title, location.pathname + location.search);
  if (targetView) state.view = targetView;
  state.route = null;
  render();
}
function syncRoute() { state.route = parseHash(); }
function setActiveTab(viewName) {
  document.querySelectorAll(".tab").forEach(tab => tab.classList.toggle("is-active", tab.dataset.view === viewName));
}

function ensureDetailStyles() {
  if (document.querySelector("#detail-page-styles")) return;
  const style = document.createElement("style");
  style.id = "detail-page-styles";
  style.textContent = `
    .card-actions{margin-top:16px;display:flex;gap:8px;flex-wrap:wrap}.open-link,.back-btn{border:1px solid var(--line-strong);background:var(--surface-2);border-radius:999px;padding:8px 13px;cursor:pointer;font-size:.86rem;color:var(--ink)}.open-link:hover,.back-btn:hover{border-color:var(--ink);background:var(--surface)}
    .detail-page{margin-top:24px;background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);overflow:hidden}.detail-hero{padding:24px 28px;border-bottom:1px solid var(--line);background:linear-gradient(90deg,var(--ref-soft),transparent 55%,var(--neo-soft))}.detail-hero h2{font-family:var(--font-display);font-size:1.8rem;margin:8px 0 4px}.detail-hero .by{color:var(--muted);margin:0 0 12px}.detail-hero .sum{max-width:880px;color:var(--muted)}
    .detail-layout{display:grid;grid-template-columns:minmax(220px,280px) 1fr;gap:0}.detail-toc{border-right:1px solid var(--line);background:var(--surface-2);padding:18px;position:sticky;top:84px;align-self:start;max-height:calc(100vh - 96px);overflow:auto}.detail-toc-title{font-family:var(--font-mono);font-size:.72rem;letter-spacing:.12em;color:var(--muted);text-transform:uppercase;margin-bottom:10px}.detail-toc a{display:block;color:var(--muted);text-decoration:none;font-size:.86rem;padding:7px 0;border-bottom:1px solid var(--line)}.detail-toc a:hover{color:var(--ink)}.detail-main{padding:20px 28px 32px}.detail-main .part{scroll-margin-top:94px;margin-top:22px}.detail-main .part:first-child{margin-top:0}.detail-tools{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px}
    .topic-detail-body{padding:22px 28px 30px}.topic-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.topic-panel{border:1px solid var(--line);border-radius:12px;padding:16px;background:var(--surface-2)}.topic-panel h4{margin:0 0 10px;font-family:var(--font-display)}
    .topic-section{margin-top:18px;border:1px solid var(--line);border-radius:14px;background:var(--surface-2);padding:18px}.topic-section h4{margin:0 0 12px;font-family:var(--font-display);font-size:1.02rem}.topic-section .muted{color:var(--muted)}.topic-meta-tags{margin-top:14px;display:flex;gap:7px;flex-wrap:wrap}.topic-meta-tags .tag{background:var(--surface);border-color:var(--line-strong)}
    .axis-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.axis-card{border:1px solid var(--line);border-radius:12px;padding:14px;background:var(--surface)}.axis-card b{display:block;margin-bottom:8px}.axis-card p{margin:8px 0;color:var(--muted);font-size:.92rem}.axis-card .axis-label{font-family:var(--font-mono);font-size:.72rem;letter-spacing:.08em;color:var(--muted);display:block;margin-bottom:2px}.topic-list{margin:0;padding-left:19px}.topic-list li{margin:7px 0;color:var(--muted)}.reading-path{display:flex;gap:8px;flex-wrap:wrap}.reading-path span{border:1px solid var(--line);background:var(--surface);border-radius:999px;padding:7px 10px;font-size:.85rem;color:var(--muted)}
    .history-card .history-period{font-family:var(--font-mono);font-size:.78rem;color:var(--muted);letter-spacing:.04em}.history-card .sum{min-height:72px}.history-detail-body{padding:22px 28px 30px}.history-section{margin-top:18px;border:1px solid var(--line);border-radius:14px;background:var(--surface-2);padding:18px}.history-section h4{margin:0 0 12px;font-family:var(--font-display);font-size:1.04rem}.history-list{margin:0;padding-left:19px}.history-list li{margin:7px 0;color:var(--muted)}.history-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.history-mini{border:1px solid var(--line);border-radius:12px;background:var(--surface);padding:14px}.history-mini b{display:block;margin-bottom:6px}.history-mini p,.history-mini span{color:var(--muted);font-size:.9rem}.history-relations{display:flex;gap:8px;flex-wrap:wrap}.history-relations button,.history-relations span{border:1px solid var(--line);background:var(--surface);border-radius:999px;padding:7px 10px;font-size:.85rem;color:var(--muted)}.history-relations button{cursor:pointer}.history-relations button:hover{color:var(--ink);border-color:var(--ink)}
    @media(max-width:1020px){.axis-grid{grid-template-columns:1fr}.history-grid{grid-template-columns:1fr}}
    @media(max-width:860px){.detail-layout{grid-template-columns:1fr}.detail-toc{position:relative;top:auto;max-height:none;border-right:0;border-bottom:1px solid var(--line)}.topic-grid{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);
}

function applyTopicGuides() {
  const guides = Array.isArray(window.__TOPIC_GUIDES__) ? window.__TOPIC_GUIDES__ : [];
  if (!guides.length || !Array.isArray(DATA.topics)) return;
  const guideMap = {};
  guides.forEach(g => { if (g && g.id) guideMap[g.id] = g; });
  DATA.topics = DATA.topics.map(topic => {
    const guide = guideMap[topic.id];
    return guide ? Object.assign({}, topic, guide) : topic;
  });
}

/* ---------------- data load ---------------- */
function afterLoad() {
  ensureDetailStyles();
  applyTopicGuides();
  if (!Array.isArray(DATA.history)) DATA.history = [];
  const both = DATA.topics.find(hasBoth);
  state.concept = (both || DATA.topics[0] || {}).id || null;
  syncRoute();
  renderCounts();
  render();
}
async function boot() {
  if (window.__DATA__) { Object.assign(DATA, window.__DATA__); afterLoad(); return; }
  view.innerHTML = `<div class="loading">데이터를 불러오는 중…</div>`;
  const files = [
    { key: "books", file: "books" },
    { key: "authors", file: "authors" },
    { key: "topics", file: "topics" },
    { key: "notes", file: "notes" },
    { key: "taxonomy", file: "taxonomy" },
    { key: "history", file: "tradition-history" }
  ];
  try {
    const results = await Promise.all(
      files.map(item => fetch(`./data/${item.file}.json`, { cache: "no-cache" }).then(r => {
        if (!r.ok) throw new Error(`${item.file}.json (${r.status})`);
        return r.json();
      }))
    );
    files.forEach((item, i) => { DATA[item.key] = results[i]; });
    afterLoad();
  } catch (e) {
    view.innerHTML = `<div class="empty"><b>데이터를 불러오지 못했습니다.</b><br>
      ${e.message}<br><br>이 사이트는 <code>data/*.json</code>을 fetch로 읽습니다.
      로컬에서 볼 때는 파일을 직접 열지 말고 간단한 서버를 띄우세요:<br>
      <code style="font-family:var(--font-mono)">python3 -m http.server</code> → http://localhost:8000</div>`;
  }
}

const chapterText = b => {
  let s = "";
  if (b.parts) b.parts.forEach(p => { s += p.title + p.summary; (p.chapters || []).forEach(c => s += c.ref + c.title + c.summary + (c.concepts || []).join(" ")); });
  if (b.chapters) b.chapters.forEach(c => s += (c.title || "") + (c.summary || ""));
  return s;
};
const hasRefPos = t => (t.positions || []).some(p => p.tradition === REF);
const hasNeoPos = t => (t.positions || []).some(p => p.tradition === NEO);
const hasBoth = t => hasRefPos(t) && hasNeoPos(t);

/* ---------------- shared book rendering ---------------- */
function quotesHTML(items) {
  if (!items || !items.length) return "";
  const html = items.filter(q => q.text && q.source).map(q =>
    `<blockquote class="chap-quote">${q.text}<cite>— ${q.source}${q.ref ? ` · ${q.ref}` : ""}</cite></blockquote>`).join("");
  return html ? `<div class="quotes">${html}</div>` : "";
}
function chapterHTML(ch) {
  const ref = `<span class="cref">${ch.ref || "·"}</span>`;
  const head = `${ref}<div class="chap-head"><b>${ch.title}</b>${ch.summary ? `<p>${ch.summary}</p>` : ""}</div>`;
  const tags = (ch.concepts && ch.concepts.length) ? `<div class="tags">${ch.concepts.map(x => `<span class="tag">${x}</span>`).join("")}</div>` : "";
  const quotes = quotesHTML(ch.quotes);
  const hasDetail = ch.detail || (ch.keyPoints && ch.keyPoints.length) || quotes;
  if (!hasDetail) return `<div class="chap">${head}</div>${tags ? `<div class="chap-tagrow">${tags}</div>` : ""}`;
  const kp = (ch.keyPoints && ch.keyPoints.length) ? `<ul class="keypoints">${ch.keyPoints.map(k => `<li>${k}</li>`).join("")}</ul>` : "";
  return `<details class="chap-x"><summary class="chap chap-sum">${head}</summary><div class="chap-detail">${ch.detail ? `<p class="chap-body">${ch.detail}</p>` : ""}${kp}${quotes}${tags}</div></details>`;
}
function bookStructure(b) {
  if (b.parts && b.parts.length) {
    const parts = b.parts.map((p, idx) => `
      <section class="part" id="part-${idx + 1}">
        <h4 class="part-h">${p.title}</h4>
        ${p.summary ? `<p class="part-sum">${p.summary}</p>` : ""}
        ${quotesHTML(p.quotes)}
        ${(p.chapters || []).map(chapterHTML).join("")}
      </section>`).join("");
    return parts;
  }
  if (b.chapters && b.chapters.length) return `<section class="part">${b.chapters.map(chapterHTML).join("")}</section>`;
  return "";
}
function bookToc(b) {
  if (!b.parts || !b.parts.length) return "";
  return `<aside class="detail-toc"><div class="detail-toc-title">목차</div>${b.parts.map((p, idx) => `<a href="#part-${idx + 1}">${p.title}</a>`).join("")}</aside>`;
}

/* ---------------- detail pages ---------------- */
function renderBookDetail(id) {
  const b = DATA.books.find(x => x.id === id);
  if (!b) { view.innerHTML = `<div class="empty">책을 찾지 못했습니다.<br><button class="back-btn" data-back="books">책 목록으로</button></div>`; wireBackButtons(); return; }
  const total = b.parts ? b.parts.reduce((n, p) => n + ((p.chapters || []).length), 0) : (b.chapters || []).length;
  view.innerHTML = `
    <article class="detail-page t-${tradClass(b.tradition)}">
      <header class="detail-hero">
        <button class="back-btn" data-back="books">← 책 목록</button>
        <div class="meta-row" style="margin-top:14px">${tradTag(b.tradition)}<span class="cat-tag">${b.category || ""}</span>${b.edition ? `<span class="cat-tag">· ${b.edition}</span>` : ""}</div>
        <h2>${b.title}</h2>
        <p class="by">${b.author}${b.originalAuthor ? " · " + b.originalAuthor : ""}</p>
        <p class="sum">${b.summary || ""}</p>
        ${b.researchUse ? `<p class="diverge"><b>연구 용도</b>${b.researchUse}</p>` : ""}
        <div class="detail-tools"><span class="tag">${b.parts ? b.parts.length : 0}개 대주제</span><span class="tag">${total}개 §/장</span></div>
      </header>
      <div class="detail-layout">
        ${bookToc(b)}
        <main class="detail-main">${bookStructure(b)}</main>
      </div>
    </article>`;
  wireBackButtons();
}
function renderTopicDetail(id) {
  const c = DATA.topics.find(x => x.id === id) || DATA.topics.find(x => x.name === id);
  if (!c) { view.innerHTML = `<div class="empty">개념을 찾지 못했습니다.<br><button class="back-btn" data-back="compare">개념 비교로</button></div>`; wireBackButtons(); return; }
  const side = trad => (c.positions || []).filter(p => p.tradition === trad).map(p => `<div class="position"><span class="holder">${p.holder}</span><p class="claim">${p.claim}</p><span class="loc">${p.loc || ""}</span></div>`).join("") || `<p class="pole-empty">입장이 아직 없습니다.</p>`;
  const refs = (c.references || []).map(r => `<div class="ref-item"><b>${bookTitle(r.bookId)}</b> <span class="loc">${r.location || ""}</span><br>${r.note || ""}</div>`).join("");
  const tags = items => (items && items.length) ? `<div class="topic-meta-tags">${items.map(x => `<span class="tag">${x}</span>`).join("")}</div>` : "";
  const axes = (c.comparisonAxes || []).map(a => `<div class="axis-card"><b>${a.axis}</b><p><span class="axis-label">개혁파 정통</span>${a.ref}</p><p><span class="axis-label">신정통주의</span>${a.neo}</p></div>`).join("");
  const questions = (c.researchQuestions || []).map(q => `<li>${q}</li>`).join("");
  const reading = (c.readingPath || []).map(x => `<span>${x}</span>`).join("");
  view.innerHTML = `
    <article class="detail-page">
      <header class="detail-hero">
        <button class="back-btn" data-back="compare">← 개념 비교</button>
        <span class="loci-label" style="display:block;margin-top:14px">LOCUS · 교리 상세</span>
        <h2>${c.name}<span class="lat">${c.latin || ""}</span></h2>
        ${c.summary ? `<p class="sum">${c.summary}</p>` : ""}
        ${c.diverge ? `<p class="diverge"><b>갈라지는 지점</b>${c.diverge}</p>` : ""}
        ${tags(c.keywords || c.relatedTopics)}
      </header>
      <div class="topic-detail-body">
        <div class="topic-grid">
          <section class="topic-panel"><h4>${REF}</h4>${side(REF)}</section>
          <section class="topic-panel"><h4>${NEO}</h4>${side(NEO)}</section>
        </div>
        ${axes ? `<section class="topic-section"><h4>비교축</h4><div class="axis-grid">${axes}</div></section>` : ""}
        ${questions ? `<section class="topic-section"><h4>연구 질문</h4><ul class="topic-list">${questions}</ul></section>` : ""}
        ${reading ? `<section class="topic-section"><h4>읽기 순서</h4><div class="reading-path">${reading}</div></section>` : ""}
        ${tags(c.relatedTopics) ? `<section class="topic-section"><h4>관련 개념</h4>${tags(c.relatedTopics)}</section>` : ""}
        ${refs ? `<div class="refs" style="margin-top:18px"><p class="refs-label">관련 문헌</p>${refs}</div>` : ""}
      </div>
    </article>`;
  wireBackButtons();
}
function renderHistoryDetail(id) {
  const h = DATA.history.find(x => x.id === id);
  if (!h) { view.innerHTML = `<div class="empty">역사 항목을 찾지 못했습니다.<br><button class="back-btn" data-back="history">역사 목록으로</button></div>`; wireBackButtons(); return; }
  const list = items => arr(items).length ? `<ul class="history-list">${arr(items).map(x => `<li>${x}</li>`).join("")}</ul>` : "";
  const mini = (items, titleKey, subKey, noteKey) => arr(items).map(item => `<div class="history-mini"><b>${item[titleKey] || item.name || item.title || "항목"}</b>${item[subKey] ? `<span>${item[subKey]}</span>` : ""}${item[noteKey] ? `<p>${item[noteKey]}</p>` : ""}</div>`).join("");
  const relatedTopics = arr(h.relatedTopics).map(t => `<button type="button" data-topic-jump="${t}">${t}</button>`).join("");
  const relatedBooks = arr(h.relatedBooks).map(id => `<button type="button" data-book-jump="${id}">📖 ${bookTitle(id)}</button>`).join("");
  const relatedAuthors = arr(h.relatedAuthors).map(id => `<span>${authorTitle(id)}</span>`).join("");
  const pointers = arr(h.quotePointers).map(p => `<div class="history-mini"><b>${p.source || "인용 위치"}</b>${p.location ? `<span>${p.location}</span>` : ""}${p.note ? `<p>${p.note}</p>` : ""}</div>`).join("");
  view.innerHTML = `
    <article class="detail-page">
      <header class="detail-hero">
        <button class="back-btn" data-back="history">← 역사 목록</button>
        <span class="loci-label" style="display:block;margin-top:14px">HISTORY · ${h.category || "개혁전통의 역사"}</span>
        <h2>${h.title}</h2>
        <p class="by">${h.period || ""}</p>
        ${h.summary ? `<p class="sum">${h.summary}</p>` : ""}
        ${h.definition ? `<p class="diverge"><b>정의</b>${h.definition}</p>` : ""}
      </header>
      <div class="history-detail-body">
        ${h.historicalBackground ? `<section class="history-section"><h4>역사적 배경</h4><p class="muted">${h.historicalBackground}</p></section>` : ""}
        ${arr(h.keyQuestions).length ? `<section class="history-section"><h4>핵심 질문</h4>${list(h.keyQuestions)}</section>` : ""}
        ${arr(h.keyFigures).length ? `<section class="history-section"><h4>주요 인물</h4><div class="history-grid">${mini(h.keyFigures, "name", "", "role")}</div></section>` : ""}
        ${arr(h.keyDocuments).length ? `<section class="history-section"><h4>주요 문헌</h4><div class="history-grid">${mini(h.keyDocuments, "title", "year", "note")}</div></section>` : ""}
        ${arr(h.theologicalIssues).length ? `<section class="history-section"><h4>핵심 신학 쟁점</h4><div class="history-relations">${arr(h.theologicalIssues).map(x => `<span>${x}</span>`).join("")}</div></section>` : ""}
        ${(relatedTopics || relatedBooks || relatedAuthors) ? `<section class="history-section"><h4>연결 색인</h4><div class="history-relations">${relatedTopics}${relatedBooks}${relatedAuthors}</div></section>` : ""}
        ${arr(h.misunderstandings).length ? `<section class="history-section"><h4>자주 생기는 오해</h4>${list(h.misunderstandings)}</section>` : ""}
        ${arr(h.researchUses).length ? `<section class="history-section"><h4>연구 활용</h4>${list(h.researchUses)}</section>` : ""}
        ${pointers ? `<section class="history-section"><h4>인용 위치 메모</h4><div class="history-grid">${pointers}</div></section>` : ""}
        ${h.personalNote ? `<section class="history-section"><h4>개인 연구 메모</h4><p class="muted">${h.personalNote}</p></section>` : ""}
      </div>
    </article>`;
  wireBackButtons();
  wireHistoryActions();
}
function wireBackButtons() { view.querySelectorAll("[data-back]").forEach(btn => btn.onclick = () => clearRoute(btn.dataset.back)); }
function wireHistoryActions() {
  view.querySelectorAll("[data-topic-jump]").forEach(btn => btn.onclick = () => setRoute("topic", btn.dataset.topicJump));
  view.querySelectorAll("[data-book-jump]").forEach(btn => btn.onclick = () => setRoute("book", btn.dataset.bookJump));
}

/* ---------------- compare (개념 비교) ---------------- */
function renderCompare() {
  const concepts = DATA.topics;
  if (!concepts.length) return emptyState("개념");
  const switcher = concepts.map(c => {
    const dot = hasBoth(c) ? "has-both" : (hasRefPos(c) || hasNeoPos(c)) ? "ref-only" : "none";
    return `<button class="concept-btn ${c.id === state.concept ? "is-active" : ""}" data-concept="${c.id}"><span class="dot ${dot}"></span>${c.name}</button>`;
  }).join("");
  const c = concepts.find(x => x.id === state.concept) || concepts[0];

  const side = trad => {
    let pos = (c.positions || []).filter(p => p.tradition === trad);
    const searchable = [c.name, c.summary, c.diverge, (c.keywords || []).join(" "), (c.relatedTopics || []).join(" "), (c.researchQuestions || []).join(" ")].join(" ");
    if (state.trad !== "all") pos = pos.filter(p => matchTrad(p.tradition));
    if (state.q) pos = pos.filter(p => matchQ(p.holder + p.claim + searchable));
    if (!pos.length) return `<p class="pole-empty">${state.trad !== "all" || state.q ? "조건에 맞는 입장이 없습니다." : `아직 입력된 입장이 없습니다.<span class="invite">data/topics.json 의 positions[]에 한 줄 추가하면 채워집니다.</span>`}</p>`;
    return pos.map(p => `<div class="position"><span class="holder">${p.holder}</span><p class="claim">${p.claim}</p><span class="loc">${p.loc || ""}</span></div>`).join("");
  };

  const refs = (c.references || []).map(r => `<div class="ref-item"><b>${bookTitle(r.bookId)}</b> <span class="loc">${r.location || ""}</span><br>${r.note || ""}</div>`).join("");
  const conceptTags = (c.keywords || c.relatedTopics || []).slice(0, 8).map(t => `<span class="tag">${t}</span>`).join("");

  view.innerHTML = `
    <div class="concept-switch">${switcher}</div>
    <article class="compare">
      <div class="compare-head">
        <span class="loci-label">LOCUS · 교리</span>
        <h3>${c.name}<span class="lat">${c.latin || ""}</span></h3>
        ${c.summary ? `<p class="topic-sum">${c.summary}</p>` : ""}
        ${c.diverge ? `<p class="diverge"><b>갈라지는 지점</b>${c.diverge}</p>` : ""}
        ${conceptTags ? `<div class="tags" style="margin-top:12px">${conceptTags}</div>` : ""}
        <div class="card-actions"><button class="open-link" data-topic-open="${c.id}">개념 상세 페이지 열기 →</button></div>
      </div>
      <div class="poles"><div class="pole pole-ref"><span class="pole-tag">${REF}</span>${side(REF)}</div><div class="axis" aria-hidden="true"></div><div class="pole pole-neo"><span class="pole-tag">${NEO}</span>${side(NEO)}</div></div>
      ${refs ? `<div class="refs"><p class="refs-label">관련 문헌</p>${refs}</div>` : ""}
    </article>`;

  view.querySelectorAll(".concept-btn").forEach(b => b.onclick = () => { state.concept = b.dataset.concept; render(); });
  view.querySelectorAll("[data-topic-open]").forEach(b => b.onclick = () => setRoute("topic", b.dataset.topicOpen));
}

/* ---------------- books ---------------- */
function renderBooks() {
  const items = DATA.books.filter(b => matchTrad(b.tradition) && matchQ(b.title + b.author + (b.summary || "") + (b.topics || []).join(" ") + chapterText(b)));
  if (!items.length) return emptyState("책");
  view.innerHTML = `<div class="grid">` + items.map(b => {
    const total = b.parts ? b.parts.reduce((n, p) => n + ((p.chapters || []).length), 0) : (b.chapters || []).length;
    return `<article class="card t-${tradClass(b.tradition)}">
      <div class="meta-row">${tradTag(b.tradition)}<span class="cat-tag">${b.category || ""}</span>${b.edition ? `<span class="cat-tag">· ${b.edition}</span>` : ""}</div>
      <h3>${b.title}</h3>
      <p class="by">${b.author}${b.originalAuthor ? " · " + b.originalAuthor : ""}</p>
      <p class="sum">${b.summary || ""}</p>
      <div class="tags">${(b.topics || []).slice(0, 12).map(t => `<span class="tag">${t}</span>`).join("")}${total ? `<span class="tag">${total}개 §/장</span>` : ""}</div>
      <div class="card-actions"><button class="open-link" data-book-open="${b.id}">상세 페이지 열기 →</button></div>
    </article>`;
  }).join("") + `</div>`;
  view.querySelectorAll("[data-book-open]").forEach(b => b.onclick = () => setRoute("book", b.dataset.bookOpen));
}

/* ---------------- authors ---------------- */
function renderAuthors() {
  const items = DATA.authors.filter(a => matchTrad(a.tradition) && matchQ((a.koreanName || "") + a.name + (a.summary || "") + (a.keyTopics || []).join(" ")));
  if (!items.length) return emptyState("학자");
  view.innerHTML = `<div class="grid">` + items.map(a => `
    <article class="card t-${tradClass(a.tradition)}">
      <div class="meta-row">${tradTag(a.tradition)}<span class="cat-tag">${a.period || ""}</span></div>
      <h3>${a.koreanName || a.name}</h3>
      <p class="by">${a.name}</p>
      <p class="sum">${a.summary || ""}</p>
      <div class="tags">${(a.keyTopics || []).map(t => `<span class="tag">${t}</span>`).join("")}${(a.majorWorks || []).map(w => `<span class="tag">📖 ${w}</span>`).join("")}</div>
    </article>`).join("") + `</div>`;
}

/* ---------------- history ---------------- */
function historyText(h) {
  return [
    h.title, h.period, h.category, h.summary, h.definition, h.historicalBackground, h.personalNote,
    arr(h.keyQuestions).join(" "),
    arr(h.keyFigures).map(x => [x.name, x.role].join(" ")).join(" "),
    arr(h.keyDocuments).map(x => [x.title, x.year, x.note].join(" ")).join(" "),
    arr(h.theologicalIssues).join(" "),
    arr(h.relatedTopics).join(" "),
    arr(h.relatedBooks).join(" "),
    arr(h.relatedAuthors).join(" "),
    arr(h.misunderstandings).join(" "),
    arr(h.researchUses).join(" "),
    arr(h.quotePointers).map(x => [x.source, x.location, x.note].join(" ")).join(" ")
  ].join(" ");
}
function renderHistory() {
  const items = DATA.history.filter(h => matchQ(historyText(h)));
  if (!items.length) return emptyState("개혁전통의 역사");
  view.innerHTML = `<div class="grid">` + items.map(h => `
    <article class="card history-card">
      <div class="meta-row"><span class="cat-tag">${h.category || "개혁전통의 역사"}</span><span class="cat-tag history-period">${h.period || ""}</span></div>
      <h3>${h.title}</h3>
      <p class="sum">${h.summary || ""}</p>
      <div class="tags">${arr(h.relatedTopics).slice(0, 10).map(t => `<span class="tag">${t}</span>`).join("")}</div>
      <div class="card-actions"><button class="open-link" data-history-open="${h.id}">역사 항목 열기 →</button></div>
    </article>`).join("") + `</div>`;
  view.querySelectorAll("[data-history-open]").forEach(b => b.onclick = () => setRoute("history", b.dataset.historyOpen));
}

/* ---------------- notes ---------------- */
function renderNotes() {
  const items = DATA.notes.filter(n => matchQ(n.title + (n.body || "") + (n.tags || []).join(" ")));
  if (!items.length) return emptyState("메모");
  view.innerHTML = `<div class="grid">` + items.map(n => `
    <article class="note">
      <span class="ntype">${n.type || "note"}</span>${n.status ? `<span class="status ${n.status === "active" ? "active" : ""}">${n.status}</span>` : ""}
      <h3>${n.title}</h3>
      <p class="body">${n.body || ""}</p>
      <div class="tags" style="margin-top:12px">${(n.tags || []).map(t => `<span class="tag">${t}</span>`).join("")}</div>
    </article>`).join("") + `</div>`;
}

function emptyState(label) { view.innerHTML = `<div class="grid"><div class="empty"><b>${label}</b>에서 조건에 맞는 항목을 찾지 못했습니다.<br>검색어를 지우거나 전통 필터를 '전체'로 바꿔 보세요.</div></div>`; }

const VIEWS = { compare: renderCompare, books: renderBooks, authors: renderAuthors, history: renderHistory, notes: renderNotes };
function render() {
  syncRoute();
  if (state.route?.type === "book") { setActiveTab("books"); return renderBookDetail(state.route.id); }
  if (state.route?.type === "topic") { setActiveTab("compare"); return renderTopicDetail(state.route.id); }
  if (state.route?.type === "history") { setActiveTab("history"); return renderHistoryDetail(state.route.id); }
  setActiveTab(state.view);
  (VIEWS[state.view] || renderCompare)();
}

function renderCounts() {
  const ch = DATA.books.reduce((n, b) => n + (b.parts ? b.parts.reduce((m, p) => m + (p.chapters ? p.chapters.length : 0), 0) : (b.chapters ? b.chapters.length : 0)), 0);
  const pos = DATA.topics.reduce((n, t) => n + (t.positions ? t.positions.length : 0), 0);
  el("#countbar").innerHTML = `<b>${DATA.books.length}</b> 책 <span class="sep">·</span><b>${ch}</b> 장 색인 <span class="sep">·</span><b>${DATA.topics.length}</b> 개념 <span class="sep">·</span><b>${pos}</b> 입장 <span class="sep">·</span><b>${DATA.history.length}</b> 역사 항목 <span class="sep">·</span><b>${DATA.notes.length}</b> 메모`;
}

/* ---------------- wiring ---------------- */
document.querySelectorAll(".tab").forEach(t => t.onclick = () => {
  state.view = t.dataset.view;
  clearRoute(state.view);
});
document.querySelectorAll(".chip").forEach(c => c.onclick = () => {
  document.querySelectorAll(".chip").forEach(x => x.setAttribute("aria-pressed", "false"));
  c.setAttribute("aria-pressed", "true"); state.trad = c.dataset.trad; render();
});
el("#q").addEventListener("input", e => { state.q = e.target.value.trim(); render(); });
window.addEventListener("hashchange", () => { syncRoute(); render(); });

boot();