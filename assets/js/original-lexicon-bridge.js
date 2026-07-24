(function () {
  "use strict";
  var core = window.BibleLexiconCore;
  var box = document.getElementById("or-verses");
  if (!core || !box) return;

  var OT = {
    GEN:["Gen","Gen.xml"],EXO:["Exod","Exod.xml"],LEV:["Lev","Lev.xml"],NUM:["Num","Num.xml"],DEU:["Deut","Deut.xml"],
    JOS:["Josh","Josh.xml"],JDG:["Judg","Judg.xml"],RUT:["Ruth","Ruth.xml"],"1SA":["1Sam","1Sam.xml"],"2SA":["2Sam","2Sam.xml"],
    "1KI":["1Kgs","1Kgs.xml"],"2KI":["2Kgs","2Kgs.xml"],"1CH":["1Chr","1Chr.xml"],"2CH":["2Chr","2Chr.xml"],EZR:["Ezra","Ezra.xml"],
    NEH:["Neh","Neh.xml"],EST:["Esth","Esth.xml"],JOB:["Job","Job.xml"],PSA:["Ps","Ps.xml"],PRO:["Prov","Prov.xml"],
    ECC:["Eccl","Eccl.xml"],SNG:["Song","Song.xml"],ISA:["Isa","Isa.xml"],JER:["Jer","Jer.xml"],LAM:["Lam","Lam.xml"],
    EZK:["Ezek","Ezek.xml"],DAN:["Dan","Dan.xml"],HOS:["Hos","Hos.xml"],JOL:["Joel","Joel.xml"],AMO:["Amos","Amos.xml"],
    OBA:["Obad","Obad.xml"],JON:["Jonah","Jonah.xml"],MIC:["Mic","Mic.xml"],NAM:["Nah","Nah.xml"],HAB:["Hab","Hab.xml"],
    ZEP:["Zeph","Zeph.xml"],HAG:["Hag","Hag.xml"],ZEC:["Zech","Zech.xml"],MAL:["Mal","Mal.xml"]
  };
  var xmlCache = new Map();
  var formsPromise = null;
  var busy = false;

  function current() {
    var q = new URLSearchParams(location.search);
    var book = (document.getElementById("or-book") && document.getElementById("or-book").value) || q.get("book") || "GEN";
    var chapter = Number((document.getElementById("or-chapter") && document.getElementById("or-chapter").value) || q.get("chapter") || 1);
    return { book: book.toUpperCase(), chapter: chapter };
  }

  function canonicalHebrewStrong(lemma) {
    var nums = String(lemma || "").match(/\d{1,4}/g) || [];
    var lexical = nums.map(Number).filter(function (n) { return n > 0 && n < 9000; });
    return lexical.length ? "H" + lexical[lexical.length - 1] : "";
  }

  function loadXml(code) {
    var file = OT[code] && OT[code][1];
    if (!file) return Promise.reject(new Error("구약 책 코드를 찾지 못했습니다."));
    if (!xmlCache.has(file)) {
      var url = "https://cdn.jsdelivr.net/npm/morphhb@2.0.2/wlc/" + file;
      xmlCache.set(file, fetch(url).then(function (r) {
        if (!r.ok) throw new Error("OSHB 형태 분석 자료를 불러오지 못했습니다.");
        return r.text();
      }).then(function (text) {
        var doc = new DOMParser().parseFromString(text, "application/xml");
        if (doc.querySelector("parsererror")) throw new Error("OSHB XML을 해석하지 못했습니다.");
        return doc;
      }));
    }
    return xmlCache.get(file);
  }

  function wordSpan(text, strong, morph, lang) {
    var span = document.createElement("span");
    span.className = "original-word " + (lang === "hebrew" ? "ow-hebrew" : "ow-greek");
    span.textContent = text;
    if (strong) span.dataset.strong = strong;
    if (morph) span.dataset.morph = morph;
    span.tabIndex = strong ? 0 : -1;
    return span;
  }

  function tokenizedHebrewVerse(verse) {
    var frag = document.createDocumentFragment();
    var first = true;
    Array.prototype.forEach.call(verse.children, function (node) {
      if (node.localName === "w") {
        if (!first) frag.appendChild(document.createTextNode(" "));
        first = false;
        frag.appendChild(wordSpan(node.textContent, canonicalHebrewStrong(node.getAttribute("lemma")), node.getAttribute("morph"), "hebrew"));
      } else if (node.localName === "seg") {
        frag.appendChild(document.createTextNode(node.textContent));
      }
    });
    return frag;
  }

  function applyHebrew(ctx) {
    return loadXml(ctx.book).then(function (doc) {
      var source = OT[ctx.book][0] + "." + ctx.chapter + ".";
      box.querySelectorAll(".or-verse-row").forEach(function (row) {
        var cell = row.querySelector(".or-original");
        if (!cell || cell.dataset.lexiconLinked === "hebrew") return;
        var n = row.id.replace(/\D/g, "");
        var verse = doc.querySelector('verse[osisID="' + source + n + '"]');
        if (!verse) return;
        var num = cell.querySelector(".or-num");
        Array.from(cell.childNodes).forEach(function (node) { if (node !== num) node.remove(); });
        cell.appendChild(tokenizedHebrewVerse(verse));
        cell.dataset.lexiconLinked = "hebrew";
      });
    });
  }

  function wrapGreekCell(cell, forms) {
    if (cell.dataset.lexiconLinked === "greek") return;
    var num = cell.querySelector(".or-num");
    var nodes = [];
    var walker = document.createTreeWalker(cell, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) if (!num || !num.contains(walker.currentNode)) nodes.push(walker.currentNode);
    nodes.forEach(function (node) {
      var text = node.nodeValue;
      var re = /[\u0370-\u03ff\u1f00-\u1fff]+/g;
      var m, pos = 0, frag = document.createDocumentFragment(), changed = false;
      while ((m = re.exec(text))) {
        if (m.index > pos) frag.appendChild(document.createTextNode(text.slice(pos, m.index)));
        var key = core.normalizeGreek(m[0]);
        var ids = forms[key];
        if (ids) {
          var list = Array.isArray(ids) ? ids : [ids];
          frag.appendChild(wordSpan(m[0], list.join(" "), "", "greek"));
          changed = true;
        } else frag.appendChild(document.createTextNode(m[0]));
        pos = re.lastIndex;
      }
      if (pos < text.length) frag.appendChild(document.createTextNode(text.slice(pos)));
      if (changed) node.parentNode.replaceChild(frag, node);
    });
    cell.dataset.lexiconLinked = "greek";
  }

  function applyGreek() {
    if (!formsPromise) formsPromise = core.loadGreekForms();
    return formsPromise.then(function (forms) {
      box.querySelectorAll(".or-original").forEach(function (cell) { wrapGreekCell(cell, forms); });
    });
  }

  function process() {
    if (busy || !box.querySelector(".or-verse-row")) return;
    busy = true;
    var ctx = current();
    var job = OT[ctx.book] ? applyHebrew(ctx) : applyGreek(ctx);
    job.catch(function () {}).finally(function () { busy = false; });
  }

  new MutationObserver(function () { setTimeout(process, 0); }).observe(box, { childList: true, subtree: true });
  document.getElementById("or-book").addEventListener("change", function () { setTimeout(process, 200); });
  document.getElementById("or-chapter").addEventListener("change", function () { setTimeout(process, 200); });
  setTimeout(process, 500);
})();
