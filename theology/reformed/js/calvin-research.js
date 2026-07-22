const CALVIN_RESEARCH_URLS = [
  "data/books/calvin-chapter-research.json",
  "data/books/calvin-book2-chapter-research.json",
  "data/books/calvin-book4-chapter-research.json"
];
const CALVIN_INDEX_URL = "data/books/calvin-80-chapter-index.json";
const CALVIN_CLUSTERS_URL = "data/books/calvin-priority-clusters.json";

window.addEventListener("load", async () => {
  const target = document.querySelector("#calvin-research");
  if (!target) return;

  const ref = new URLSearchParams(window.location.search).get("ref");
  if (!ref) return;

  try {
    const [researchSources, chapterIndex, clusters] = await Promise.all([
      loadResearchSources(),
      loadOptionalJson(CALVIN_INDEX_URL),
      loadOptionalJson(CALVIN_CLUSTERS_URL)
    ]);
    const detail = buildChapterDetail(ref, researchSources, chapterIndex, clusters);
    renderResearchDetail(target, ref, detail);
  } catch (error) {
    console.warn("Calvin research detail was not loaded.", error);
  }
});

async function loadResearchSources() {
  const results = await Promise.all(CALVIN_RESEARCH_URLS.map(loadOptionalJson));
  return results.filter(Boolean);
}

async function loadOptionalJson(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to load ${url}`);
    return response.json();
  } catch (error) {
    console.warn(`${url} was not loaded.`, error);
    return null;
  }
}

function buildChapterDetail(ref, researchSources, chapterIndex, clusters) {
  const detail = {};
  const indexEntry = (chapterIndex?.chapters || []).find((chapter) => chapter.ref === ref);
  if (indexEntry) mergeDetail(detail, detailFromIndexEntry(indexEntry));

  const relatedClusters = (clusters?.clusters || []).filter((cluster) => (cluster.chapters || []).includes(ref));
  relatedClusters.forEach((cluster) => mergeDetail(detail, detailFromCluster(cluster)));

  researchSources.forEach((source) => {
    const chapterDetail = source?.chapters?.[ref];
    if (chapterDetail) mergeDetail(detail, chapterDetail);
  });

  return Object.keys(detail).length ? detail : null;
}

function detailFromIndexEntry(entry) {
  return {
    sourceSectionHeadings: [
      entry.majorTheme ? `대주제: ${entry.majorTheme}` : "대주제 미정",
      entry.title ? `장 주제: ${entry.title}` : `장 위치: ${entry.ref}`
    ],
    keyQuestions: entry.coreQuestion ? [entry.coreQuestion] : [],
    keyClaims: entry.coreClaim ? [entry.coreClaim] : [],
    bibleReferences: entry.bibleReferences || [],
    compareWith: (entry.comparisonAxis || []).map((item) => ({
      bookId: item,
      location: "비교축",
      note: `${item}와 비교하여 읽을 수 있습니다.`
    })),
    researchNotes: ["80장 기본 색인에서 불러온 기본 연구 데이터입니다."]
  };
}

function detailFromCluster(cluster) {
  return {
    sourceSectionHeadings: [cluster.title ? `관련 묶음: ${cluster.title}` : "관련 묶음", cluster.range ? `범위: ${cluster.range}` : ""].filter(Boolean),
    keyQuestions: cluster.coreQuestions || [],
    keyClaims: cluster.coreClaims || [],
    compareWith: (cluster.comparison || []).map((item) => ({
      bookId: item.tradition || "comparison",
      location: cluster.title || "우선 심화 묶음",
      note: item.note || "비교 메모가 필요합니다."
    })),
    researchNotes: [cluster.summary, ...(cluster.useCases || []).map((item) => `활용: ${item}`)].filter(Boolean)
  };
}

function mergeDetail(target, source) {
  if (!source) return target;
  ["sourceSectionHeadings", "keyQuestions", "keyClaims", "bibleReferences", "shortQuotes", "compareWith", "researchNotes"].forEach((key) => {
    if (!source[key]) return;
    target[key] = mergeArrays(target[key], source[key], key);
  });
  return target;
}

function mergeArrays(current = [], next = [], key) {
  const incoming = Array.isArray(next) ? next : [next];
  const combined = [...(Array.isArray(current) ? current : [current]), ...incoming].filter(Boolean);
  const seen = new Set();
  return combined.filter((item) => {
    const signature = key === "compareWith"
      ? `${item.bookId || ""}|${item.location || ""}|${item.note || ""}`
      : key === "shortQuotes"
        ? `${item.location || ""}|${item.text || ""}|${item.note || ""}`
        : String(item);
    if (seen.has(signature)) return false;
    seen.add(signature);
    return true;
  });
}

function renderResearchDetail(target, ref, detail) {
  if (!detail) {
    target.innerHTML = `
      <section class="results">
        <article class="result-card full-width">
          <h2>연구 보강 예정</h2>
          <p class="card-summary">${escapeHtml(ref)} 장은 아직 핵심 질문·핵심 주장·비교 문헌이 보강되지 않았습니다.</p>
        </article>
      </section>
    `;
    return;
  }

  target.innerHTML = `
    <section class="results">
      <article class="result-card full-width">
        <div class="card-meta">Research Layer · ${escapeHtml(ref)}</div>
        <h2>연구 보강</h2>
        <p class="card-summary">장 구조와 연구 메모를 바탕으로 만든 공개용 상세 페이지입니다. 원문 전문은 포함하지 않습니다.</p>
      </article>
    </section>

    <section class="results">
      ${renderListCard("장 내 소제목", detail.sourceSectionHeadings)}
      ${renderListCard("핵심 질문", detail.keyQuestions)}
      ${renderListCard("핵심 주장", detail.keyClaims)}
      ${renderListCard("관련 성경 본문", detail.bibleReferences)}
    </section>

    <section class="results">
      <article class="result-card full-width">
        <h3>짧은 인용</h3>
        ${Array.isArray(detail.shortQuotes) && detail.shortQuotes.length ? `
          <div class="chapter-list">
            ${detail.shortQuotes.map((item) => `
              <section class="chapter-item">
                <div class="card-meta">${escapeHtml(item.location || ref)}</div>
                <p>“${escapeHtml(item.text)}”</p>
                ${item.note ? `<p class="card-summary">${escapeHtml(item.note)}</p>` : ""}
              </section>
            `).join("")}
          </div>
        ` : `<p class="card-summary">이 장에는 아직 공개용 짧은 인용이 입력되지 않았습니다.</p>`}
      </article>
    </section>

    <section class="results">
      <article class="result-card full-width">
        <h3>비교 문헌</h3>
        ${Array.isArray(detail.compareWith) && detail.compareWith.length ? `
          <div class="chapter-list">
            ${detail.compareWith.map((item) => `
              <section class="chapter-item">
                <div class="card-meta">${escapeHtml(item.bookId)} · ${escapeHtml(item.location)}</div>
                <p>${escapeHtml(item.note)}</p>
              </section>
            `).join("")}
          </div>
        ` : `<p class="card-summary">연결된 비교 문헌이 없습니다.</p>`}
      </article>
    </section>

    <section class="results">
      ${renderListCard("연구 메모", detail.researchNotes, true)}
    </section>
  `;
}

function renderListCard(title, items, fullWidth = false) {
  const safeItems = Array.isArray(items) ? items : [];
  return `
    <article class="result-card ${fullWidth ? "full-width" : ""}">
      <h3>${escapeHtml(title)}</h3>
      ${safeItems.length ? `
        <ul class="detail-list">
          ${safeItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      ` : `<p class="card-summary">아직 입력된 항목이 없습니다.</p>`}
    </article>
  `;
}
