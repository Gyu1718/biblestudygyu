/* Bavinck preloader.
   Adds Herman Bavinck's Reformed Dogmatics as a structured book before app.js renders. */
(function () {
  function loadJson(path, fallback) {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", path, false);
      xhr.send(null);
      if (xhr.status >= 200 && xhr.status < 300) return JSON.parse(xhr.responseText);
    } catch (error) {
      console.warn(path + " was not preloaded.", error);
    }
    return fallback;
  }

  function chapterFromString(raw, partTitle) {
    var m = String(raw).match(/^([IVX]+\.\d+)\s+(.+)$/);
    var ref = m ? m[1] : String(raw);
    var title = m ? m[2] : String(raw);
    var concepts = ["개혁파 정통", "개혁교의학", "유기적 신학"];
    if (/계시|성경|영감|권위|신학의 원리/.test(title)) concepts.push("계시론", "성경론");
    if (/하나님|속성|삼위|작정/.test(title)) concepts.push("신론");
    if (/창조|섭리|형상|인간|천사/.test(title)) concepts.push("창조론", "인간론");
    if (/죄|언약|그리스도|속죄|부활|승천|중보/.test(title)) concepts.push("죄론", "기독론", "구속론");
    if (/성령|소명|중생|믿음|회심|칭의|성화|견인/.test(title)) concepts.push("구원론");
    if (/교회|직분|말씀|성례|세례|성찬/.test(title)) concepts.push("교회론", "성례론");
    if (/죽음|재림|부활|심판|새 창조/.test(title)) concepts.push("종말론");
    return {
      ref: ref,
      title: title,
      summary: "바빙크는 『개혁교의학』 " + ref + "에서 ‘" + title + "’을 개혁파 정통의 교의학 질서 안에서 다룹니다.",
      detail: "이 장은 " + partTitle + "에 속합니다. 바빙크의 특징은 성경적 계시와 개혁파 고백, 교회사적 전통, 철학적 사유를 분리하지 않고 유기적으로 종합한다는 데 있습니다. 이 항목은 칼빈의 고전적 교리 질서와 바르트의 계시 중심 재구성을 비교할 때 중간의 중요한 개혁파 정통-근대 신학 접점으로 읽을 수 있습니다.",
      keyPoints: ["성경적 계시", "개혁파 고백 전통", "유기적 교의학", "근대 신학과의 비판적 대화"],
      concepts: concepts.filter(function (v, i, a) { return a.indexOf(v) === i; })
    };
  }

  function buildBavinckBook(map) {
    if (!map || !Array.isArray(map.parts)) return null;
    return {
      id: "bavinck-reformed-dogmatics",
      title: "개혁교의학",
      author: "헤르만 바빙크",
      originalAuthor: "Herman Bavinck",
      tradition: "개혁파 정통",
      traditionKey: "ref",
      category: "Reformed Dogmatics / Systematic Theology",
      language: "Korean",
      summary: "바빙크의 『개혁교의학』은 계시와 성경, 하나님과 창조, 죄와 그리스도 안의 구원, 성령과 교회와 새 창조를 유기적으로 배열한 개혁파 교의학의 대표 문헌입니다.",
      researchUse: "칼빈과 비교하면 바빙크는 종교개혁의 교리 구조를 더 넓은 교회사와 근대 학문 상황 속에서 체계화합니다. 바르트와 비교하면 계시 중심의 문제의식은 공유할 수 있으나, 자연·은혜·창조·문화의 관계에서 더 고전적이고 유기적인 개혁파 종합을 제시합니다.",
      topics: ["계시론", "성경론", "신론", "삼위일체", "창조론", "인간론", "죄론", "기독론", "구원론", "교회론", "성례론", "종말론"],
      authorsMentioned: ["Augustine", "Thomas Aquinas", "Martin Luther", "John Calvin", "Friedrich Schleiermacher", "Karl Barth"],
      edition: "『개혁교의학』 4권 구조 한국어 연구색인",
      parts: map.parts.map(function (part) {
        return {
          title: part.title,
          summary: part.summary,
          chapters: (part.chapters || []).map(function (chapter) { return chapterFromString(chapter, part.title); })
        };
      })
    };
  }

  function upsertBook(data, book) {
    if (!data || !Array.isArray(data.books) || !book) return data;
    var replaced = false;
    data.books = data.books.map(function (item) {
      if (item && item.id === book.id) {
        replaced = true;
        return book;
      }
      return item;
    });
    if (!replaced) data.books.push(book);
    return data;
  }

  var map = loadJson("./data/books-bavinck-structure-map.json", null);
  var book = buildBavinckBook(map);
  window.__DATA__ = upsertBook(window.__DATA__, book);
})();
