/* Section-specific quote context normalizer.
   목적: 인용구 위 설명이 책 전체/장 전체 설명으로 반복되지 않도록,
   각 quote에 해당 §/장/소주제의 고유 설명을 채운다. */

(function () {
  var SPECIAL_SECTION_DETAILS = {
    "CD IV/1 §62": "이 절은 바르트가 화해론의 교회론적 귀결을 다루며, 성령께서 예수 그리스도의 완성된 화해 사역을 공동체의 모임 안에서 현실화하시는 방식을 설명하는 대목입니다. 교회는 인간의 종교 단체로 먼저 정의되지 않고, 성령께서 그리스도의 몸을 불러 모아 말씀을 듣고 증언하게 하시는 사건으로 이해됩니다."
  };

  function arr(value) {
    return Array.isArray(value) ? value : [];
  }

  function shortText(text, max) {
    var raw = String(text || "").replace(/\s+/g, " ").trim();
    if (!raw) return "";
    if (raw.length <= max) return raw;
    var sliced = raw.slice(0, max);
    var lastStop = Math.max(sliced.lastIndexOf("."), sliced.lastIndexOf("다."), sliced.lastIndexOf("요."));
    return (lastStop > 60 ? sliced.slice(0, lastStop + 1) : sliced.replace(/[\s,.;:]+$/, "")) + "…";
  }

  function sectionLabel(chapter) {
    return [chapter.ref, chapter.title ? "‘" + chapter.title + "’" : ""].filter(Boolean).join(" ");
  }

  function quoteFocus(quote, chapter) {
    return quote.subtopic || quote.topic || quote.purpose || arr(chapter.keyPoints)[0] || chapter.title || "해당 주제";
  }

  function buildContext(book, part, chapter, quote) {
    if (quote.context) return quote.context;

    var special = SPECIAL_SECTION_DETAILS[chapter.ref];
    if (special) {
      var focus = quoteFocus(quote, chapter);
      return special + " 이 인용은 그 가운데 특히 " + focus + "를 보여 주는 짧은 표지로 사용합니다.";
    }

    var label = sectionLabel(chapter);
    var focusText = quoteFocus(quote, chapter);
    var sectionDetail = shortText(chapter.detail || chapter.summary || part.summary || "", 150);
    var author = book.author || book.originalAuthor || "저자";

    if (book.id === "barth-church-dogmatics") {
      return "이 인용은 " + label + "에서 바르트가 " + focusText + "를 하나님의 말씀과 예수 그리스도 중심의 교의학 안에서 다루는 대목에 붙입니다." + (sectionDetail ? " " + sectionDetail : "");
    }

    if (book.id === "calvin-institutes") {
      return "이 인용은 " + label + "에서 칼빈이 " + focusText + "를 성경의 증언과 경건의 목적 안에서 정리하는 대목에 붙입니다." + (sectionDetail ? " " + sectionDetail : "");
    }

    if (book.id === "bavinck-reformed-dogmatics") {
      return "이 인용은 " + label + "에서 바빙크가 " + focusText + "를 개혁교의학의 유기적 체계 안에 배치하는 대목에 붙입니다." + (sectionDetail ? " " + sectionDetail : "");
    }

    if (book.id === "berkhof-systematic-theology") {
      return "이 인용은 " + label + "에서 벌코프가 " + focusText + "를 개혁파 조직신학의 표준 교과서적 질서 안에서 설명하는 대목에 붙입니다." + (sectionDetail ? " " + sectionDetail : "");
    }

    return "이 인용은 " + label + "에서 " + author + "가 " + focusText + "를 설명하는 대목에 붙입니다." + (sectionDetail ? " " + sectionDetail : "");
  }

  function normalizeChapter(book, part, chapter) {
    if (!chapter || typeof chapter !== "object") return;

    if (SPECIAL_SECTION_DETAILS[chapter.ref]) {
      chapter.detail = SPECIAL_SECTION_DETAILS[chapter.ref];
      chapter.summary = chapter.summary || "성령께서 그리스도교 공동체를 불러 모으시고, 그 공동체 안에서 그리스도의 화해 사역이 증언되는 방식을 다룹니다.";
      chapter.concepts = arr(chapter.concepts).concat(["성령", "교회론", "공동체", "화해론"]).filter(function (value, index, array) { return value && array.indexOf(value) === index; });
      chapter.keyPoints = arr(chapter.keyPoints).concat(["성령에 의한 공동체의 소집", "화해론의 교회론적 귀결", "그리스도의 몸으로서의 모임"]).filter(function (value, index, array) { return value && array.indexOf(value) === index; });
    }

    arr(chapter.quotes).forEach(function (quote) {
      quote.context = buildContext(book, part, chapter, quote);
    });
  }

  function normalizeBook(book) {
    if (!book || !Array.isArray(book.parts)) return;
    book.parts.forEach(function (part) {
      arr(part.chapters).forEach(function (chapter) { normalizeChapter(book, part, chapter); });
    });
  }

  if (window.__DATA__ && Array.isArray(window.__DATA__.books)) {
    window.__DATA__.books.forEach(normalizeBook);
  }
})();
