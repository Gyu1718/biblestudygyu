(function () {
  "use strict";

  var INDEX_URL = new URL("../data/search-index.json", document.currentScript && document.currentScript.src ? document.currentScript.src : location.href).href;
  var SITE_ROOT = new URL("../", location.href);
  var state = { documents: [], query: "", category: "전체", ready: false };
  var ui = {};

  function normalize(value) {
    return String(value || "").normalize("NFKC").toLocaleLowerCase("ko-KR").replace(/\s+/g, " ").trim();
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function termsFor(query) {
    var full = normalize(query);
    if (!full) return [];
    var terms = full.split(/[^\p{L}\p{N}\p{M}]+/u).filter(Boolean);
    if (terms.indexOf(full) === -1) terms.unshift(full);
    return terms.filter(function (term, index, all) { return all.indexOf(term) === index; }).slice(0, 12);
  }

  function countMatches(haystack, needle) {
    if (!needle) return 0;
    var count = 0;
    var start = 0;
    while ((start = haystack.indexOf(needle, start)) !== -1) {
      count += 1;
      start += Math.max(needle.length, 1);
      if (count >= 20) break;
    }
    return count;
  }

  function scoreDocument(document, query, terms) {
    var title = document._title;
    var headings = document._headings;
    var description = document._description;
    var text = document._text;
    var score = 0;

    if (title.indexOf(query) !== -1) score += 140;
    if (headings.indexOf(query) !== -1) score += 80;
    if (description.indexOf(query) !== -1) score += 45;
    if (text.indexOf(query) !== -1) score += 18;

    terms.forEach(function (term) {
      score += countMatches(title, term) * 34;
      score += countMatches(headings, term) * 17;
      score += countMatches(description, term) * 11;
      score += countMatches(text, term) * 3;
    });

    if (title === query) score += 250;
    if (title.indexOf(query) === 0) score += 70;
    return score;
  }

  function prepare(document) {
    document._title = normalize(document.title);
    document._description = normalize(document.description);
    document._headings = normalize((document.headings || []).join(" "));
    document._text = normalize(document.text);
    return document;
  }

  function highlighted(value, terms) {
    value = String(value || "");
    var useful = terms.filter(Boolean).sort(function (a, b) { return b.length - a.length; });
    if (!useful.length) return escapeHtml(value);
    var regex;
    try {
      regex = new RegExp(useful.map(escapeRegExp).join("|"), "giu");
    } catch (error) {
      return escapeHtml(value);
    }
    var output = "";
    var last = 0;
    var match;
    while ((match = regex.exec(value)) !== null) {
      output += escapeHtml(value.slice(last, match.index));
      output += "<mark>" + escapeHtml(match[0]) + "</mark>";
      last = match.index + match[0].length;
      if (!match[0].length) regex.lastIndex += 1;
    }
    return output + escapeHtml(value.slice(last));
  }

  function makeSnippet(document, query, terms) {
    var source = document.text || document.description || "";
    if (!source) return "";
    var normalizedSource = normalize(source);
    var candidates = [normalize(query)].concat(terms).filter(Boolean);
    var index = -1;
    candidates.some(function (candidate) {
      index = normalizedSource.indexOf(candidate);
      return index >= 0;
    });
    if (index < 0) return source.slice(0, 300) + (source.length > 300 ? "…" : "");
    var start = Math.max(0, index - 90);
    var end = Math.min(source.length, start + 330);
    return (start ? "…" : "") + source.slice(start, end) + (end < source.length ? "…" : "");
  }

  function matchedHeadings(document, terms) {
    return (document.headings || []).filter(function (heading) {
      var normalized = normalize(heading);
      return terms.some(function (term) { return normalized.indexOf(term) !== -1; });
    }).slice(0, 4);
  }

  function resultMarkup(result, terms) {
    var document = result.document;
    var headings = matchedHeadings(document, terms);
    var url = new URL(document.url, SITE_ROOT).href;
    var badges = '<span class="search-badge">' + escapeHtml(document.category) + '</span>';
    if (document.book) badges += '<span class="search-badge book">' + escapeHtml(document.book) + '</span>';
    var headingMarkup = headings.length ? '<ul class="search-headings">' + headings.map(function (heading) {
      return "<li>" + highlighted(heading, terms) + "</li>";
    }).join("") + "</ul>" : "";
    var snippet = makeSnippet(document, state.query, terms);
    return '<article class="search-result">' +
      '<div class="search-result-head"><a class="search-result-title" href="' + escapeHtml(url) + '">' + highlighted(document.title, terms) + '</a><div class="search-badges">' + badges + '</div></div>' +
      '<div class="search-path">' + escapeHtml(document.url) + '</div>' +
      (document.description ? '<p class="search-description">' + highlighted(document.description, terms) + '</p>' : "") +
      (snippet ? '<p class="search-snippet">' + highlighted(snippet, terms) + '</p>' : "") +
      headingMarkup +
    '</article>';
  }

  function categoriesFor(documents) {
    var counts = { "전체": documents.length };
    documents.forEach(function (document) {
      counts[document.category] = (counts[document.category] || 0) + 1;
    });
    return counts;
  }

  function renderFilters() {
    var counts = categoriesFor(state.documents);
    var preferred = ["전체", "구약", "신약", "성경읽기", "원어사전", "조직신학", "홈", "기타"];
    ui.filters.innerHTML = preferred.filter(function (name) { return counts[name]; }).map(function (name) {
      return '<button type="button" class="search-filter' + (state.category === name ? " is-active" : "") + '" data-category="' + escapeHtml(name) + '" aria-pressed="' + (state.category === name ? "true" : "false") + '">' + escapeHtml(name) + ' ' + counts[name] + '</button>';
    }).join("");
  }

  function updateUrl() {
    var url = new URL(location.href);
    if (state.query) url.searchParams.set("q", state.query); else url.searchParams.delete("q");
    if (state.category !== "전체") url.searchParams.set("category", state.category); else url.searchParams.delete("category");
    history.replaceState(null, "", url.pathname + url.search + url.hash);
  }

  function render() {
    if (!state.ready) return;
    renderFilters();
    var query = normalize(state.query);
    var terms = termsFor(state.query);
    if (!query) {
      ui.status.textContent = state.documents.length + "개 문서 검색 가능";
      ui.results.innerHTML = '<div class="search-empty"><strong>검색어를 입력해 주세요.</strong>성경 책, 본문 구절, 원어, 주석가, 신학 주제를 함께 검색할 수 있습니다.</div>';
      return;
    }

    var results = state.documents.filter(function (document) {
      return state.category === "전체" || document.category === state.category;
    }).map(function (document) {
      return { document: document, score: scoreDocument(document, query, terms) };
    }).filter(function (result) { return result.score > 0; })
      .sort(function (a, b) { return b.score - a.score || a.document.title.localeCompare(b.document.title, "ko"); })
      .slice(0, 60);

    ui.status.textContent = results.length + "개 결과";
    if (!results.length) {
      ui.results.innerHTML = '<div class="search-empty"><strong>일치하는 문서를 찾지 못했습니다.</strong>검색어를 줄이거나 다른 표현으로 다시 찾아보세요.</div>';
    } else {
      ui.results.innerHTML = results.map(function (result) { return resultMarkup(result, terms); }).join("");
    }
    updateUrl();
  }

  function bind() {
    var timer = null;
    ui.form.addEventListener("submit", function (event) {
      event.preventDefault();
      state.query = ui.input.value;
      render();
    });
    ui.input.addEventListener("input", function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        state.query = ui.input.value;
        render();
      }, 90);
    });
    ui.filters.addEventListener("click", function (event) {
      var button = event.target.closest("[data-category]");
      if (!button) return;
      state.category = button.dataset.category || "전체";
      render();
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "/" && document.activeElement !== ui.input) {
        event.preventDefault();
        ui.input.focus();
      }
      if (event.key === "Escape" && document.activeElement === ui.input && ui.input.value) {
        ui.input.value = "";
        state.query = "";
        render();
      }
    });
  }

  function init() {
    ui.form = document.getElementById("siteSearchForm");
    ui.input = document.getElementById("siteSearchInput");
    ui.filters = document.getElementById("siteSearchFilters");
    ui.status = document.getElementById("siteSearchStatus");
    ui.results = document.getElementById("siteSearchResults");
    if (!ui.form || !ui.input || !ui.filters || !ui.status || !ui.results) return;

    var params = new URLSearchParams(location.search);
    state.query = params.get("q") || "";
    state.category = params.get("category") || "전체";
    ui.input.value = state.query;
    bind();

    fetch(INDEX_URL, { credentials: "same-origin" }).then(function (response) {
      if (!response.ok) throw new Error("검색 색인을 불러오지 못했습니다.");
      return response.json();
    }).then(function (payload) {
      state.documents = (payload.documents || []).map(prepare);
      state.ready = true;
      render();
      if (state.query) ui.input.focus({ preventScroll: true });
    }).catch(function (error) {
      ui.status.textContent = "검색 불가";
      ui.results.innerHTML = '<div class="search-error"><strong>검색 색인을 불러오지 못했습니다.</strong>' + escapeHtml(error.message || String(error)) + '</div>';
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
