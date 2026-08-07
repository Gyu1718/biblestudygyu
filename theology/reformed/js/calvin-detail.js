const CALVIN_DATA_URL = "data/books/calvin-institutes.json";
const CALVIN_THEMES_URL = "data/books/calvin-book-themes.json";

const CALVIN_TOPIC_SLUGS = {
  "하나님 지식": "knowledge-of-god",
  "성경론": "revelation-scripture",
  "삼위일체": "trinity-creation",
  "섭리": "providence",
  "원죄와 인간론": "sin-and-humanity",
  "율법과 복음": "law-gospel",
  "기독론": "christology",
  "그리스도와의 연합": "union-with-christ",
  "칭의": "justification",
  "그리스도인의 삶": "christian-life",
  "예정론": "predestination-prayer-resurrection",
  "교회론": "ecclesiology",
  "성례론": "sacraments",
  "정치신학": "political-theology",
};

const calvinState = {
  data: null,
  themes: { books: {} },
  query: "",
};

document.addEventListener("DOMContentLoaded", async () => {
  const [data, themes] = await Promise.all([loadJson(CALVIN_DATA_URL), loadOptionalJson(CALVIN_THEMES_URL)]);
  calvinState.data = data;
  calvinState.themes = themes || { books: {} };
  bindCalvinSearch();
  renderCalvinPage();
});

async function loadJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to load ${url}`);
  return response.json();
}

async function loadOptionalJson(url) {
  try {
    return await loadJson(url);
  } catch (error) {
    console.warn(`${url} was not loaded.`, error);
    return null;
  }
}

function bindCalvinSearch() {
  const input = document.querySelector("#calvin-search");
  if (!input) return;
  input.addEventListener("input", (event) => {
    calvinState.query = event.target.value.trim().toLowerCase();
    renderCalvinPage();
  });
}

function renderCalvinPage() {
  const page = document.body.dataset.calvinPage || "overview";
  if (page === "book") return renderCalvinBookPage();
  if (page === "chapter") return renderCalvinChapterPage();
  if (page === "topic") return renderCalvinTopicPage();
  return renderCalvinOverviewPage();
}

function getParams() {
  return new URLSearchParams(window.location.search);
}

function flattenChapters() {
  return calvinState.data.books.flatMap((book, index) => {
    const bookNumber = index + 1;
    return book.chapters.map((chapter) => ({
      ...chapter,
      bookNumber,
      bookTitle: book.title,
      bookRange: book.range,
    }));
  });
}

function topicSlug(topic) {
  return CALVIN_TOPIC_SLUGS[topic] || String(topic).toLowerCase().replace(/\s+/g, "-");
}

function matchesQuery(item) {
  if (!calvinState.query) return true;
  return JSON.stringify(item).toLowerCase().includes(calvinState.query);
}

function normalizeSubtopics(subtopics) {
  return (subtopics || [])
    .map((subtopic) => {
      if (typeof subtopic === "string") {
        return { title: subtopic, summary: "", note: "", refs: [] };
      }
      const summary = subtopic.summary || "";
      return {
        title: subtopic.title || subtopic.name || "",
        summary,
        note: subtopic.note || subtopic.description || summary,
        argumentRole: subtopic.argumentRole || "",
        reformedContrast: subtopic.reformedContrast || "",
        studyPrompt: subtopic.studyPrompt || "",
        refs: subtopic.refs || subtopic.chapters || [],
      };
    })
    .filter((subtopic) => subtopic.title);
}

function getSubtopicLabels(subtopics) {
  return normalizeSubtopics(subtopics).map((subtopic) => subtopic.title);
}

function renderSubtopicCards(subtopics) {
  const items = normalizeSubtopics(subtopics);
  if (!items.length) return "";
  return `
    <div class="chapter-list subtopic-list">
      ${items.map(renderSubtopicCard).join("")}
    </div>
  `;
}

function renderSubtopicField(label, value) {
  if (!value) return "";
  return `<p class="subtopic-field"><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`;
}

function renderSubtopicCard(subtopic) {
  const refs = Array.isArray(subtopic.refs) ? subtopic.refs : [];
  const hasDistinctNote = subtopic.note && subtopic.note !== subtopic.summary;
  return `
    <section class="chapter-item subtopic-card">
      <div class="card-meta">${escapeHtml(refs.length ? refs.join(" · ") : "소주제")}</div>
      <h4>${escapeHtml(subtopic.title)}</h4>
      ${renderSubtopicField(hasDistinctNote ? "요약" : "소주제 설명", subtopic.summary || subtopic.note)}
      ${hasDistinctNote ? renderSubtopicField("소주제 설명", subtopic.note) : ""}
      ${renderSubtopicField("논증 역할", subtopic.argumentRole)}
      ${renderSubtopicField("개혁파 비교", subtopic.reformedContrast)}
      ${renderSubtopicField("학습 질문", subtopic.studyPrompt)}
    </section>
  `;
}

function renderCalvinOverviewPage() {
  const root = document.querySelector("#calvin-root");
  const data = calvinState.data;
  const books = data.books.filter(matchesQuery);
  const allThemes = Object.entries(calvinState.themes.books || {}).flatMap(([bookNumber, book]) =>
    (book.themes || []).map((theme) => ({ ...theme, bookNumber, bookTitle: book.title }))
  ).filter(matchesQuery);

  root.innerHTML = `
    <section class="results">
      <article class="result-card full-width">
        <div class="card-meta">${escapeHtml(data.category)} · Core Reference</div>
        <h2>${escapeHtml(data.title)}</h2>
        <p class="card-summary">${escapeHtml(data.originalTitle)} · ${escapeHtml(data.originalAuthor)}</p>
        <p>${escapeHtml(data.summary)}</p>
        <p class="research-use"><strong>아카이브에서의 역할:</strong> ${escapeHtml(data.researchUse)}</p>
        <p class="quote-pointer"><strong>운영 원칙:</strong> 원문 전문은 공개하지 않고, 개념 색인·요약·짧은 인용·위치 정보 중심으로 운영합니다.</p>
      </article>
    </section>

    <section class="results">
      ${books.map((book, index) => renderBookCard(book, index + 1)).join("")}
    </section>

    <section class="results">
      <article class="result-card full-width">
        <h2>개념별 진입</h2>
        <p class="card-summary">책을 장 번호로만 보지 않고, 개혁신학과 신정통주의 비교가 가능한 개념 단위로 이동합니다.</p>
        <div class="chapter-list">
          ${allThemes.map(renderThemeCard).join("")}
        </div>
      </article>
    </section>
  `;
}

function renderBookCard(book, bookNumber) {
  return `
    <article class="result-card">
      <div class="card-meta">${escapeHtml(book.range)} · ${book.chapters.length}개 장</div>
      <h3>${escapeHtml(book.title)}</h3>
      <p>${escapeHtml(book.summary)}</p>
      ${renderTags(book.majorTopics)}
      <div class="card-actions">
        <a href="calvin-book.html?book=${bookNumber}">대주제 보기</a>
      </div>
    </article>
  `;
}

function renderThemeCard(theme) {
  return `
    <section class="chapter-item">
      <div class="card-meta">${escapeHtml(theme.bookTitle || "기독교 강요")} · ${escapeHtml((theme.chapters || []).join(" · "))}</div>
      <h4>${escapeHtml(theme.title)}</h4>
      <p>${escapeHtml(theme.summary)}</p>
      ${renderTags(getSubtopicLabels(theme.subtopics))}
      <div class="card-actions">
        <a href="calvin-topic.html?topic=${encodeURIComponent(theme.concept || theme.id)}">개념 상세 보기</a>
      </div>
    </section>
  `;
}

function renderCalvinBookPage() {
  const root = document.querySelector("#calvin-root");
  const bookNumber = Number(getParams().get("book") || 1);
  const book = calvinState.data.books[bookNumber - 1];
  const themeBook = calvinState.themes.books?.[String(bookNumber)];

  if (!book) {
    root.innerHTML = `<div class="empty-state">해당 권을 찾을 수 없습니다.</div>`;
    return;
  }

  const themes = (themeBook?.themes || []).filter(matchesQuery);
  const chapterMap = Object.fromEntries(book.chapters.map((chapter) => [chapter.ref, chapter]));

  root.innerHTML = `
    <section class="results">
      <article class="result-card full-width">
        <div class="card-meta">${escapeHtml(book.range)} · ${book.chapters.length}개 장</div>
        <h2>${escapeHtml(book.title)}</h2>
        <p>${escapeHtml(book.summary)}</p>
        ${renderTags(book.majorTopics)}
      </article>
    </section>

    <section class="results">
      <article class="result-card full-width">
        <h2>대주제–소주제 카드</h2>
        <p class="card-summary">각 대주제 아래에서 소주제별 고유 해설과 관련 장 위치를 확인합니다.</p>
        <div class="chapter-list">
          ${themes.map((theme) => renderBookThemeWithChapters(theme, chapterMap)).join("") || `<div class="empty-state">검색 결과가 없습니다.</div>`}
        </div>
      </article>
    </section>
  `;
}

function renderBookThemeWithChapters(theme, chapterMap) {
  const chapters = (theme.chapters || []).map((ref) => chapterMap[ref]).filter(Boolean);
  return `
    <section class="chapter-item">
      <div class="card-meta">${escapeHtml((theme.chapters || []).join(" · "))}</div>
      <h3>${escapeHtml(theme.title)}</h3>
      <p>${escapeHtml(theme.summary)}</p>
      ${renderSubtopicCards(theme.subtopics)}
      <div class="card-actions">
        <a href="calvin-topic.html?topic=${encodeURIComponent(theme.concept || theme.id)}">개념 상세 보기</a>
      </div>
      <div class="chapter-list">
        ${chapters.map(renderCompactChapterLink).join("")}
      </div>
    </section>
  `;
}

function renderCompactChapterLink(chapter) {
  return `
    <section class="chapter-item">
      <div class="card-meta">${escapeHtml(chapter.ref)}</div>
      <h4>${escapeHtml(chapter.title)}</h4>
      <p>${escapeHtml(chapter.summary)}</p>
      <div class="card-actions">
        <a href="calvin-chapter.html?ref=${encodeURIComponent(chapter.ref)}">장 상세 보기</a>
      </div>
    </section>
  `;
}

function renderChapterCard(chapter) {
  return `
    <article class="result-card">
      <div class="card-meta">${escapeHtml(chapter.bookTitle || "기독교 강요")} · ${escapeHtml(chapter.ref)} · ${escapeHtml(chapter.priority || "")}</div>
      <h3>${escapeHtml(chapter.title)}</h3>
      <p>${escapeHtml(chapter.summary)}</p>
      ${renderTags(chapter.topics)}
      <div class="card-actions">
        <a href="calvin-chapter.html?ref=${encodeURIComponent(chapter.ref)}">장 상세 보기</a>
      </div>
    </article>
  `;
}

function renderCalvinChapterPage() {
  const root = document.querySelector("#calvin-root");
  const ref = getParams().get("ref");
  const chapter = flattenChapters().find((item) => item.ref === ref);

  if (!chapter) {
    root.innerHTML = `<div class="empty-state">해당 장을 찾을 수 없습니다.</div>`;
    return;
  }

  const relatedThemes = Object.entries(calvinState.themes.books || {}).flatMap(([bookNumber, book]) =>
    (book.themes || []).filter((theme) => (theme.chapters || []).includes(chapter.ref)).map((theme) => ({ ...theme, bookNumber, bookTitle: book.title }))
  );

  root.innerHTML = `
    <section class="results">
      <article class="result-card full-width">
        <div class="card-meta">${escapeHtml(chapter.bookTitle)} · ${escapeHtml(chapter.ref)}</div>
        <h2>${escapeHtml(chapter.title)}</h2>
        <p>${escapeHtml(chapter.summary)}</p>
        ${renderTags(chapter.topics)}
      </article>
    </section>

    ${relatedThemes.length ? `
      <section class="results">
        <article class="result-card full-width">
          <h2>연결된 대주제</h2>
          <div class="chapter-list">
            ${relatedThemes.map(renderThemeCard).join("")}
          </div>
        </article>
      </section>
    ` : ""}
  `;
}

function renderCalvinTopicPage() {
  const root = document.querySelector("#calvin-root");
  const topicParam = decodeURIComponent(getParams().get("topic") || "");
  const allThemes = Object.entries(calvinState.themes.books || {}).flatMap(([bookNumber, book]) =>
    (book.themes || []).map((theme) => ({ ...theme, bookNumber, bookTitle: book.title }))
  );
  const theme = allThemes.find((item) => item.concept === topicParam || item.id === topicParam || topicSlug(item.title) === topicParam);
  const chapters = flattenChapters().filter((chapter) =>
    theme ? (theme.chapters || []).includes(chapter.ref) : (chapter.topics || []).some((topic) => topicSlug(topic) === topicParam || topic === topicParam)
  ).filter(matchesQuery);

  root.innerHTML = `
    <section class="results">
      <article class="result-card full-width">
        <div class="card-meta">Concept View</div>
        <h2>${escapeHtml(theme ? theme.title : topicParam)}</h2>
        <p>${escapeHtml(theme ? theme.summary : "이 개념과 연결된 장들을 표시합니다.")}</p>
        ${theme ? renderSubtopicCards(theme.subtopics) : ""}
      </article>
    </section>

    <section class="results">
      ${chapters.map(renderChapterCard).join("") || `<div class="empty-state">연결된 장을 찾지 못했습니다.</div>`}
    </section>
  `;
}
