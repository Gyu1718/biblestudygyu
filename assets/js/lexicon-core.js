(function () {
  "use strict";
  if (window.BibleLexiconCore) return;

  var script = document.currentScript;
  var siteRoot = script && script.src ? new URL("../../", script.src).href : "/biblestudygyu/";
  var dataRoot = new URL("assets/data/lexicon/", siteRoot).href;
  var manifestPromise = null;
  var indexPromise = null;
  var bucketCache = new Map();

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>\"]/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch];
    });
  }

  function normalizeId(value) {
    var m = String(value || "").toUpperCase().match(/([GH])\s*0*(\d{1,5})/);
    return m ? m[1] + String(Number(m[2])) : null;
  }

  function idsFrom(value) {
    var seen = Object.create(null);
    var out = [];
    String(value || "").toUpperCase().replace(/([GH])\s*0*(\d{1,5})/g, function (_, p, n) {
      var id = p + String(Number(n));
      if (!seen[id]) { seen[id] = true; out.push(id); }
      return _;
    });
    return out;
  }

  function normalizeGreek(value) {
    return String(value || "").toLocaleLowerCase("el")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/ς/g, "σ").replace(/[^α-ωσ]/g, "");
  }

  function readJson(response, message) {
    if (!response.ok) throw new Error(message || "데이터를 불러오지 못했습니다.");
    if (/\.gz(?:$|\?)/.test(response.url)) {
      if (typeof DecompressionStream !== "function") {
        throw new Error("압축 사전 데이터를 읽으려면 최신 Chrome·Edge·Safari가 필요합니다.");
      }
      return new Response(response.body.pipeThrough(new DecompressionStream("gzip"))).json();
    }
    return response.json();
  }

  function fetchJson(url, message) {
    return fetch(url, { credentials: "same-origin" }).then(function (r) { return readJson(r, message); });
  }

  function loadManifest() {
    if (!manifestPromise) manifestPromise = fetchJson(new URL("manifest.json", dataRoot).href, "사전 목록을 불러오지 못했습니다.");
    return manifestPromise;
  }

  function bucketInfo(id, manifest) {
    id = normalizeId(id);
    if (!id) return null;
    var prefix = id.charAt(0);
    var number = Number(id.slice(1));
    var language = prefix === "G" ? "greek" : "hebrew";
    var max = manifest.max[language];
    if (number < 1 || number > max) return null;
    var size = manifest.bucketSize || 250;
    var start = Math.floor((number - 1) / size) * size + 1;
    var end = Math.min(start + size - 1, max);
    var file = prefix.toLowerCase() + String(start).padStart(4, "0") + "-" + String(end).padStart(4, "0") + ".json.gz";
    return { id: id, language: language, number: number, url: new URL(language + "/" + file, dataRoot).href };
  }

  function loadEntry(id) {
    return loadManifest().then(function (manifest) {
      var info = bucketInfo(id, manifest);
      if (!info) throw new Error("Strong 번호를 인식하지 못했습니다.");
      if (!bucketCache.has(info.url)) bucketCache.set(info.url, fetchJson(info.url, "사전 항목을 불러오지 못했습니다."));
      return bucketCache.get(info.url).then(function (bucket) {
        if (!bucket[info.id]) throw new Error(info.id + " 항목이 없습니다.");
        return bucket[info.id];
      });
    });
  }

  function loadIndex() {
    if (!indexPromise) {
      indexPromise = loadManifest().then(function (m) {
        return fetchJson(new URL(m.searchIndex, dataRoot).href, "사전 검색 색인을 불러오지 못했습니다.");
      });
    }
    return indexPromise;
  }

  function loadGreekForms() {
    return loadManifest().then(function (m) {
      var url = new URL(m.greekForms, dataRoot).href;
      if (!bucketCache.has(url)) bucketCache.set(url, fetchJson(url, "헬라어 활용형 색인을 불러오지 못했습니다."));
      return bucketCache.get(url);
    });
  }

  function entryUrl(id) {
    var url = new URL("lexicon/entry.html", siteRoot);
    url.searchParams.set("id", normalizeId(id) || id);
    return url.href;
  }

  window.BibleLexiconCore = {
    siteRoot: siteRoot,
    dataRoot: dataRoot,
    escapeHtml: escapeHtml,
    normalizeId: normalizeId,
    idsFrom: idsFrom,
    normalizeGreek: normalizeGreek,
    loadManifest: loadManifest,
    loadEntry: loadEntry,
    loadIndex: loadIndex,
    loadGreekForms: loadGreekForms,
    entryUrl: entryUrl
  };
})();
