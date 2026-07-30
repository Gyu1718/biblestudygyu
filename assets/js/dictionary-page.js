(function () {
  "use strict";

  var CAT = {
    person: "인물", place: "지명", people: "민족", group: "집단",
    institution: "제도·직분", object: "사물·건축", event: "사건",
    concept: "신학 개념", text: "성경 문헌"
  };
  var entries = [];
  var activeType = "all";
  var query = "";

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>\"]/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch];
    });
  }

  function normalize(value) {
    return String(value || "").toLocaleLowerCase("ko-KR").replace(/[\s·ㆍ,.;:!?"'‘’“”()\[\]{}<>—–-]+/g, "");
  }

  function entryText(entry) {
    return [
      entry.name && entry.name.ko,
      entry.name && entry.name.en,
      entry.name && entry.name.original,
      entry.name && entry.name.translit,
      entry.line,
      entry.hover,
      entry.subtype,
      (entry.match && entry.match.search || []).join(" ")
    ].filter(Boolean).join(" ");
  }

  function renderStats() {
    var stats = document.getElementById("encyclopedia-stats");
    if (!stats) return;
    var counts = Object.create(null);
    entries.forEach(function (entry) { counts[entry.type] = (counts[entry.type] || 0) + 1; });
    var chips = ['<span class="dictionary-stat">현재 ' + entries.length + '항목</span>'];
    Object.keys(counts).sort().forEach(function (type) {
      chips.push('<span class="dictionary-stat">' + escapeHtml(CAT[type] || type) + ' ' + counts[type] + '</span>');
    });
    stats.innerHTML = chips.join("");
  }

  function renderFilters() {
    var root = document.getElementById("dictionary-filter");
    if (!root) return;
    var types = Array.from(new Set(entries.map(function (entry) { return entry.type; })));
    root.innerHTML = ['<button type="button" class="is-active" data-type="all">전체</button>']
      .concat(types.map(function (type) {
        return '<button type="button" data-type="' + escapeHtml(type) + '">' + escapeHtml(CAT[type] || type) + '</button>';
      })).join("");
    root.addEventListener("click", function (event) {
      var button = event.target.closest("button[data-type]");
      if (!button) return;
      activeType = button.dataset.type;
      root.querySelectorAll("button").forEach(function (item) { item.classList.toggle("is-active", item === button); });
      renderEntries();
    });
  }

  function renderEntries() {
    var root = document.getElementById("dictionary-results");
    var status = document.getElementById("dictionary-status");
    if (!root) return;
    var normalizedQuery = normalize(query);
    var filtered = entries.filter(function (entry) {
      if (activeType !== "all" && entry.type !== activeType) return false;
      return !normalizedQuery || normalize(entryText(entry)).indexOf(normalizedQuery) !== -1;
    });
    if (status) status.textContent = filtered.length + "개 표제어";
    if (!filtered.length) {
      root.innerHTML = '<p class="dictionary-empty">일치하는 표제어를 찾지 못했습니다.</p>';
      return;
    }
    root.innerHTML = filtered.map(function (entry) {
      return '<a class="dictionary-entry" href="../encyclopedia/entry.html?id=' + encodeURIComponent(entry.id) + '">' +
        '<span><b>' + escapeHtml(entry.name.ko) + '</b><span>' + escapeHtml(entry.line) + '</span></span>' +
        '<em>' + escapeHtml(CAT[entry.type] || entry.type) + '</em></a>';
    }).join("");
  }

  function bindSearch() {
    var form = document.getElementById("dictionary-search");
    var input = document.getElementById("dictionary-query");
    if (!form || !input) return;
    form.addEventListener("submit", function (event) { event.preventDefault(); query = input.value.trim(); renderEntries(); });
    input.addEventListener("input", function () { query = input.value.trim(); renderEntries(); });
  }

  fetch("../assets/data/encyclopedia/index.json", { credentials: "same-origin" })
    .then(function (response) {
      if (!response.ok) throw new Error("성서 지식사전 목록을 불러오지 못했습니다.");
      return response.json();
    })
    .then(function (data) {
      entries = data.slice().sort(function (a, b) { return a.name.ko.localeCompare(b.name.ko, "ko"); });
      renderStats();
      renderFilters();
      bindSearch();
      renderEntries();
    })
    .catch(function (error) {
      var root = document.getElementById("dictionary-results");
      if (root) root.innerHTML = '<p class="dictionary-empty">' + escapeHtml(error.message) + '</p>';
    });
})();