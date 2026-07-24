(function () {
  "use strict";
  var core = window.BibleLexiconCore;
  if (!core) return;
  var page = document.body.dataset.lexiconPage;
  var esc = core.escapeHtml;

  function displayMeaning(row) {
    return row.summaryKo || row.glossEn || "풀이 준비 중";
  }

  function initIndex() {
    var form = document.getElementById("lx-search");
    var input = document.getElementById("lx-query");
    var lang = document.getElementById("lx-language");
    var status = document.getElementById("lx-status");
    var results = document.getElementById("lx-results");
    var all = [];
    var query = new URLSearchParams(location.search).get("q") || "";
    input.value = query;

    function normalize(value) {
      return String(value || "").toLocaleLowerCase("ko-KR").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\s.,;:'\"()\[\]{}<>/_-]+/g, "");
    }

    function render() {
      var q = normalize(input.value);
      var selected = lang.value;
      var rows = all.filter(function (row) {
        if (selected !== "all" && row.language !== selected) return false;
        if (!q) return row.number <= 60;
        var hay = normalize([row.id,row.lemma,row.transliteration,row.pronunciationKo,row.summaryKo,row.glossEn,row.partOfSpeech].join(" "));
        return hay.indexOf(q) !== -1;
      }).slice(0, 120);
      status.textContent = q ? rows.length + "개 항목 표시" + (rows.length === 120 ? " · 검색 결과가 많아 앞의 120개만 표시합니다." : "") : "Strong 번호, 원어, 한글 발음과 뜻으로 검색할 수 있습니다.";
      results.innerHTML = rows.length ? rows.map(function (row) {
        return '<a class="lx-result" href="entry.html?id=' + encodeURIComponent(row.id) + '">' +
          '<span class="lx-rid">' + esc(row.id) + '</span>' +
          '<span class="lx-rlemma ' + (row.language === "hebrew" ? "is-hebrew" : "is-greek") + '">' + esc(row.lemma || "—") + '</span>' +
          '<span class="lx-rbody"><b>' + esc([row.pronunciationKo,row.transliteration].filter(Boolean).join(" · ")) + '</b><small>' + esc(row.partOfSpeech || "") + '</small><p>' + esc(displayMeaning(row).replace(/\s+/g," ").slice(0,240)) + '</p></span>' +
        '</a>';
      }).join("") : '<div class="lx-empty">일치하는 항목을 찾지 못했습니다.</div>';
    }

    status.textContent = "사전 색인을 불러오는 중입니다…";
    core.loadIndex().then(function (index) { all = index; render(); }).catch(function (e) { status.textContent = e.message; });
    form.addEventListener("submit", function (event) { event.preventDefault(); render(); history.replaceState(null,"","?q="+encodeURIComponent(input.value)); });
    input.addEventListener("input", function () { clearTimeout(input._t); input._t=setTimeout(render,160); });
    lang.addEventListener("change", render);
  }

  function initEntry() {
    var id = core.normalizeId(new URLSearchParams(location.search).get("id"));
    var mount = document.getElementById("lx-entry");
    if (!id) { mount.innerHTML='<div class="lx-empty">Strong 번호가 필요합니다.</div>'; return; }
    document.title = id + " — 원어 스트롱 사전";
    core.loadEntry(id).then(function (entry) {
      var sup=entry.supplement || {};
      var meaning=entry.summaryKo || sup.glossEn || sup.definitionEn || "풀이가 없습니다.";
      var sourceTitle=entry.language==='hebrew'?'히브리어 스트롱 사전':'헬라어 스트롱 사전';
      mount.innerHTML = [
        '<nav class="lx-entry-nav"><a href="index.html">← 사전 검색</a><button id="lx-copy" type="button">주소 복사</button></nav>',
        '<header class="lx-entry-head"><div><span class="lx-entry-id">'+esc(entry.id)+'</span><span class="lx-entry-lang">'+(entry.language==='hebrew'?'히브리어·아람어':'헬라어')+'</span></div>',
        '<h1 class="lx-entry-lemma '+(entry.language==='hebrew'?'is-hebrew':'is-greek')+'">'+esc(entry.lemma || entry.id)+'</h1>',
        '<p class="lx-entry-meta">'+[entry.transliteration,entry.pronunciationKo,entry.partOfSpeech,entry.occurrences?entry.occurrences.toLocaleString()+"회":null].filter(Boolean).map(esc).join(' · ')+'</p></header>',
        '<section class="lx-card"><h2>핵심 풀이</h2><p class="lx-lead">'+esc(meaning)+'</p></section>',
        entry.rawKo ? '<section class="lx-card"><h2>한글 스트롱 사전 원문</h2><pre class="lx-raw"></pre></section>' : '<section class="lx-card lx-warning"><h2>한글 원문 미확인</h2><p>한글 스트롱 사전에서 이 항목을 추출하지 못해 보충 자료만 표시합니다.</p></section>',
        sup.glossEn || sup.definitionEn ? '<section class="lx-card"><h2>보충 검증 정보 <small>STEP Bible</small></h2><p><b>'+esc(sup.glossEn || '')+'</b></p><p class="lx-en">'+esc(sup.definitionEn || '')+'</p><p class="lx-source">'+esc(sup.source || '')+'</p></section>' : '',
        '<section class="lx-sourcebox"><b>주자료</b><span>'+esc(sourceTitle)+'</span></section>'
      ].join('');
      var pre=mount.querySelector('.lx-raw'); if(pre) pre.textContent=entry.rawKo;
      document.getElementById('lx-copy').addEventListener('click',function(){ navigator.clipboard.writeText(location.href).then(function(){ this.textContent='복사됨'; }.bind(this)); });
    }).catch(function (e) { mount.innerHTML='<div class="lx-empty">'+esc(e.message)+'</div>'; });
  }

  if (page === "index") initIndex();
  if (page === "entry") initEntry();
})();


/* 연구 도크 공통 로더 */
(function () {
  if (typeof document === "undefined" || document.querySelector("script[data-rd-loader]")) return;
  var current = document.currentScript;
  var src = current && current.src
    ? new URL("research-dock-loader.js?v=20260724.2", current.src).href
    : "assets/js/research-dock-loader.js?v=20260724.2";
  var node = document.createElement("script");
  node.src = src;
  node.dataset.rdLoader = "";
  document.head.appendChild(node);
})();
