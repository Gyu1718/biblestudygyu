function normalizeText(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function toSearchText(item) {
  return normalizeText(JSON.stringify(item));
}

function filterItems(items, query) {
  const keyword = normalizeText(query);
  if (!keyword) return items;
  return items.filter((item) => toSearchText(item).includes(keyword));
}

function renderTags(tags = []) {
  if (!Array.isArray(tags) || tags.length === 0) return "";
  return `<div class="tag-list">${tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}</div>`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
