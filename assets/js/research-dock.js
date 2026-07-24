(function () {
  "use strict";

  if (window.__SCRIPTORIUM_RESEARCH_DOCK__) return;
  window.__SCRIPTORIUM_RESEARCH_DOCK__ = true;

  var script = document.currentScript;
  var siteRoot = script && script.src ? new URL("../../", script.src).href : new URL("./", location.href).href;
  var cssUrl = script && script.src ? new URL("../css/research-dock.css", script.src).href : new URL("assets/css/research-dock.css", siteRoot).href;

  var THEME_KEY = "scriptorium-theme";
  var FONT_KEY = "scriptorium-font-scale";
  var LAYOUT_KEY = "scriptorium-reader-layout";
  var HOVER_KEY = "scriptorium-lexicon-hover";
  var root = document.documentElement;
  var ui = null;
  var tocItems = [];
  var tocObserver = null;
  var lastFocused = null;
  var lastTopVisible = null;

  var BOOK_CODE = {
    genesis:"GEN", exodus:"EXO", leviticus:"LEV", numbers:"NUM", deuteronomy:"DEU",
    joshua:"JOS", judges:"JDG", ruth:"RUT", "1-samuel":"1SA", "2-samuel":"2SA",
    "1-kings":"1KI", "2-kings":"2KI", "1-chronicles":"1CH", "2-chronicles":"2CH",
    ezra:"EZR", nehemiah:"NEH", esther:"EST", job:"JOB", psalms:"PSA", proverbs:"PRO",
    ecclesiastes:"ECC", "song-of-songs":"SNG", isaiah:"ISA", jeremiah:"JER", lamentations:"LAM",
    ezekiel:"EZK", daniel:"DAN", hosea:"HOS", joel:"JOL", amos:"AMO", obadiah:"OBA",
    jonah:"JON", micah:"MIC", nahum:"NAM", habakkuk:"HAB", zephaniah:"ZEP", haggai:"HAG",
    zechariah:"ZEC", malachi:"MAL", matthew:"MAT", mark:"MRK", luke:"LUK", john:"JHN",
    acts:"ACT", romans:"ROM", "1-corinthians":"1CO", "2-corinthians":"2CO", galatians:"GAL",
    ephesians:"EPH", philippians:"PHP", colossians:"COL", "1-thessalonians":"1TH",
    "2-thessalonians":"2TH", "1-timothy":"1TI", "2-timothy":"2TI", titus:"TIT",
    philemon:"PHM", hebrews:"HEB", james:"JAS", "1-peter":"1PE", "2-peter":"2PE",
    "1-john":"1JN", "2-john":"2JN", "3-john":"3JN", jude:"JUD", revelation:"REV",
    gen:"GEN", exo:"EXO", lev:"LEV", num:"NUM", deu:"DEU", jos:"JOS", jdg:"JDG", rut:"RUT",
    "1sa":"1SA", "2sa":"2SA", "1ki":"1KI", "2ki":"2KI", "1ch":"1CH", "2ch":"2CH",
    ezr:"EZR", neh:"NEH", est:"EST", psa:"PSA", pro:"PRO", ecc:"ECC", sng:"SNG", isa:"ISA",
    jer:"JER", lam:"LAM", ezk:"EZK", dan:"DAN", hos:"HOS", jol:"JOL", amo:"AMO", oba:"OBA",
    jon:"JON", mic:"MIC", nam:"NAM", hab:"HAB", zep:"ZEP", hag:"HAG", zec:"ZEC", mal:"MAL",
    mat:"MAT", mrk:"MRK", luk:"LUK", jhn:"JHN", act:"ACT", rom:"ROM", "1co":"1CO", "2co":"2CO",
    gal:"GAL", eph:"EPH", php:"PHP", col:"COL", "1th":"1TH", "2th":"2TH", "1ti":"1TI",
    "2ti":"2TI", tit:"TIT", phm:"PHM", heb:"HEB", jas:"JAS", "1pe":"1PE", "2pe":"2PE",
    "1jn":"1JN", "2jn":"2JN", "3jn":"3JN", jud:"JUD", rev:"REV"
  };

  var CHAPTER_MAX = {
    GEN:50,EXO:40,LEV:27,NUM:36,DEU:34,JOS:24,JDG:21,RUT:4,"1SA":31,"2SA":24,"1KI":22,"2KI":25,
    "1CH":29,"2CH":36,EZR:10,NEH:13,EST:10,JOB:42,PSA:150,PRO:31,ECC:12,SNG:8,ISA:66,JER:52,LAM:5,
    EZK:48,DAN:12,HOS:14,JOL:3,AMO:9,OBA:1,JON:4,MIC:7,NAM:3,HAB:3,ZEP:3,HAG:2,ZEC:14,MAL:4,
    MAT:28,MRK:16,LUK:24,JHN:21,ACT:28,ROM:16,"1CO":16,"2CO":13,GAL:6,EPH:6,PHP:4,COL:4,
    "1TH":5,"2TH":3,"1TI":6,"2TI":4,TIT:3,PHM:1,HEB:13,JAS:5,"1PE":5,"2PE":3,"1JN":5,
    "2JN":1,"3JN":1,JUD:1,REV:22
  };

  var ICON = {
    menu:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M5 12h14M5 17h14"/></svg>',
    close:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    home:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11.5L12 4l9 7.5M5.5 10v10h13V10M9.5 20v-6h5v6"/></svg>',
    book:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A3.5 3.5 0 017.5 2H20v16H7.5A3.5 3.5 0 004 21.5zM4 5.5v16M8 6h8M8 10h8"/></svg>',
    toc:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/></svg>',
    prev:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
    next:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>',
    bible:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4.5A3.5 3.5 0 017.5 1H20v18H7.5A3.5 3.5 0 004 22.5zM4 4.5v18M12 5v8M9 8h6"/></svg>',
    lexicon:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h14v16H5zM8 8h8M8 12h5M8 16h7"/></svg>',
    search:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/></svg>',
    settings:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19 13.5v-3l-2-.7a7 7 0 00-.7-1.7l.9-1.9-2.1-2.1-1.9.9a7 7 0 00-1.7-.7L10.5 2h-3l-.7 2a7 7 0 00-1.7.7l-1.9-.9L1.1 5.9 2 7.8a7 7 0 00-.7 1.7L0 10.5v3l2 .7a7 7 0 00.7 1.7l-.9 1.9 2.1 2.1 1.9-.9a7 7 0 001.7.7l.7 2h3l.7-2a7 7 0 001.7-.7l1.9.9 2.1-2.1-.9-1.9a7 7 0 00.7-1.7z" transform="translate(1.5 .25) scale(.875)"/></svg>',
    top:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20V5M6 11l6-6 6 6M5 2h14"/></svg>',
    back:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
    minus:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/></svg>',
    plus:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>'
  };

  function injectCss() {
    if (document.querySelector('link[data-research-dock-css]')) return;
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl;
    link.dataset.researchDockCss = "";
    document.head.appendChild(link);
  }

  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn, { once:true });
    else fn();
  }

  function getStored(key, fallback) {
    try { return localStorage.getItem(key) || fallback; } catch (e) { return fallback; }
  }

  function setStored(key, value) {
    try { localStorage.setItem(key, value); } catch (e) {}
  }

  function relativePath() {
    var rootPath = new URL(siteRoot).pathname.replace(/\/+$/, "/");
    var path = location.pathname;
    return path.indexOf(rootPath) === 0 ? path.slice(rootPath.length) : path.replace(/^\/+/, "");
  }

  function context() {
    var rel = relativePath();
    var seg = rel.split("/").filter(Boolean);
    var file = seg[seg.length - 1] || "index.html";
    var bodyBook = (document.body && document.body.dataset.book || "").toLowerCase();
    var slug = (seg[0] === "ot" || seg[0] === "nt") && seg[1] ? seg[1].toLowerCase() : "";
    var query = new URLSearchParams(location.search);
    var queryBook = (query.get("book") || "").toUpperCase();
    var book = queryBook || BOOK_CODE[bodyBook] || BOOK_CODE[slug] || (/^[1-3A-Z]{3}$/.test(bodyBook.toUpperCase()) ? bodyBook.toUpperCase() : "");
    var chapter = Number(document.body && document.body.dataset.chapter) || Number(query.get("chapter")) || 0;
    var fm = file.match(/(?:ch|chapter)[-_]?(\d{1,3})\.html?$/i);
    if (!chapter && fm) chapter = Number(fm[1]);
    if (!chapter) {
      var tm = document.title.match(/(?:^|\s)(\d{1,3})장/);
      if (tm) chapter = Number(tm[1]);
    }
    var type = "page";
    if (!rel || rel === "index.html") type = "home";
    else if (/^bible\/original\.html?$/i.test(rel)) type = "original";
    else if (/^lexicon\/index\.html?$/i.test(rel)) type = "lexicon-index";
    else if (/^lexicon\/entry\.html?$/i.test(rel)) type = "lexicon-entry";
    else if ((seg[0] === "ot" || seg[0] === "nt") && file === "index.html") type = "study-home";
    else if (seg[0] === "ot" || seg[0] === "nt") type = chapter ? "chapter-study" : "study-page";
    return { rel:rel, seg:seg, file:file, slug:slug, book:book, chapter:chapter, type:type };
  }

  function href(path) { return new URL(path, siteRoot).href; }

  function currentTheme() {
    return getStored(THEME_KEY, root.getAttribute("data-theme") || "auto");
  }

  function applyTheme(mode) {
    if (["auto","light","dark"].indexOf(mode) === -1) mode = "auto";
    if (mode === "auto") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", mode);
    setStored(THEME_KEY, mode);
    document.dispatchEvent(new CustomEvent("scriptorium:themechange", { detail:{ mode:mode } }));
    updateSettingsUI();
  }

  function currentFontScale() {
    var value = Number(getStored(FONT_KEY, "100"));
    return [90,100,110,120,130].indexOf(value) !== -1 ? value : 100;
  }

  function applyFontScale(value) {
    value = Math.max(90, Math.min(130, Math.round(value / 10) * 10));
    root.style.fontSize = value + "%";
    root.dataset.fontScale = String(value);
    setStored(FONT_KEY, String(value));
    updateSettingsUI();
  }

  function applyLayout(value) {
    value = value === "single" ? "single" : "parallel";
    document.body.classList.toggle("rd-reader-single", value === "single");
    setStored(LAYOUT_KEY, value);
    updateSettingsUI();
  }

  function applyHover(value) {
    var enabled = value !== "off";
    document.body.classList.toggle("rd-lexicon-hover-off", !enabled);
    setStored(HOVER_KEY, enabled ? "on" : "off");
    updateSettingsUI();
  }

  function initializePreferences() {
    var savedTheme = getStored(THEME_KEY, "auto");
    if (savedTheme !== "auto") root.setAttribute("data-theme", savedTheme);
    applyFontScale(currentFontScale());
    applyLayout(getStored(LAYOUT_KEY, "parallel"));
    applyHover(getStored(HOVER_KEY, "on"));
  }

  function makeButton(action) {
    var button = document.createElement(action.href ? "a" : "button");
    button.className = "rd-action" + (action.wide ? " rd-wide" : "");
    if (action.href) button.href = action.href;
    else button.type = "button";
    button.innerHTML = '<span class="rd-action-icon">' + (ICON[action.icon] || ICON.menu) + '</span><span class="rd-action-label">' + action.label + '</span>';
    if (action.disabled) {
      button.setAttribute("aria-disabled", "true");
      if (!action.href) button.disabled = true;
    }
    if (action.id) button.dataset.rdAction = action.id;
    if (action.title) button.title = action.title;
    if (action.onClick) button.addEventListener("click", function (event) { event.preventDefault(); action.onClick(event); });
    else if (action.href) button.addEventListener("click", closeDock);
    return button;
  }

  function findExistingChapterLink(direction) {
    var selectors = direction === "prev"
      ? ['a[rel="prev"]','a[data-prev]','.prev a','a.prev','.chapter-prev a','.chapter-prev']
      : ['a[rel="next"]','a[data-next]','.next a','a.next','.chapter-next a','.chapter-next'];
    for (var i=0;i<selectors.length;i++) {
      var node = document.querySelector(selectors[i]);
      if (node && node.href) return node.href;
    }
    var links = Array.prototype.slice.call(document.querySelectorAll("a[href]"));
    var re = direction === "prev" ? /이전\s*(장|글|페이지)|앞\s*장/ : /다음\s*(장|글|페이지)|뒤\s*장/;
    var hit = links.find(function (a) { return re.test((a.textContent || "").trim()); });
    return hit ? hit.href : "";
  }

  function fallbackChapterLink(ctx, delta) {
    if (!ctx.chapter) return "";
    var next = ctx.chapter + delta;
    var max = CHAPTER_MAX[ctx.book] || 150;
    if (next < 1 || next > max) return "";
    var match = ctx.file.match(/^(.*?)(\d{1,3})(\.html?)$/i);
    if (!match || !/(?:ch|chapter)[-_]?$/i.test(match[1])) return "";
    var width = match[2].length;
    var number = String(next).padStart(width, "0");
    var copy = ctx.seg.slice();
    copy[copy.length - 1] = match[1] + number + match[3];
    return href(copy.join("/"));
  }

  function studyHomeUrl(ctx) {
    if ((ctx.seg[0] === "ot" || ctx.seg[0] === "nt") && ctx.seg[1]) return href(ctx.seg[0] + "/" + ctx.seg[1] + "/index.html");
    return "";
  }

  function originalUrl(ctx) {
    var url = new URL("bible/original.html", siteRoot);
    if (ctx.book) url.searchParams.set("book", ctx.book);
    if (ctx.chapter) url.searchParams.set("chapter", String(ctx.chapter));
    return url.href;
  }

  function collectToc(ctx) {
    var candidates = [];
    if (ctx.type === "study-home") {
      candidates = Array.prototype.slice.call(document.querySelectorAll(".chapter-card a[href], .chapter-list a[href], [data-chapter-link], main a[href*='ch']"));
      candidates = candidates.map(function (node, index) {
        return { node:node, id:"", label:(node.textContent || "").replace(/\s+/g," ").trim(), href:node.href, index:index };
      });
    } else {
      var nodes = Array.prototype.slice.call(document.querySelectorAll("main h2, main h3, article h2, article h3, [data-v]"));
      var seen = Object.create(null);
      nodes.forEach(function (node, index) {
        if (node.closest && node.closest(".research-dock")) return;
        var target = node;
        var label = "";
        if (node.hasAttribute && node.hasAttribute("data-v")) {
          var heading = node.querySelector("h2,h3,h4,.v-title,.verse-title");
          label = heading ? heading.textContent : ((ctx.chapter ? ctx.chapter + ":" : "") + node.getAttribute("data-v"));
        } else label = node.textContent;
        label = String(label || "").replace(/\s+/g," ").trim();
        if (!label || label.length > 100) return;
        if (seen[label]) return;
        seen[label] = true;
        if (!target.id) target.id = "rd-section-" + (index + 1);
        candidates.push({ node:target, id:target.id, label:label, href:"#" + target.id, index:index });
      });
    }
    return candidates.slice(0, 80);
  }

  function actionList() {
    var ctx = context();
    tocItems = collectToc(ctx);
    var actions = [];
    var isHome = ctx.type === "home";

    if (!isHome) actions.push({ id:"home", label:"서고 홈", icon:"home", href:href("index.html") });

    var studyHome = studyHomeUrl(ctx);
    if (studyHome && ctx.type !== "study-home") actions.push({ id:"study-home", label:"현재 책 연구", icon:"book", href:studyHome });

    if (ctx.type === "original") {
      actions.push({ id:"selector", label:"장절 선택", icon:"toc", onClick:function () {
        closeDock();
        var controls = document.querySelector(".or-controls");
        if (controls) controls.scrollIntoView({ behavior:"smooth", block:"start" });
        var select = document.getElementById("or-book");
        if (select) setTimeout(function () { select.focus(); }, 350);
      }});
      var prevBtn = document.getElementById("or-prev");
      var nextBtn = document.getElementById("or-next");
      actions.push({ id:"prev", label:"이전 장", icon:"prev", disabled:!prevBtn || prevBtn.disabled, onClick:function(){ closeDock(); if (prevBtn && !prevBtn.disabled) prevBtn.click(); } });
      actions.push({ id:"next", label:"다음 장", icon:"next", disabled:!nextBtn || nextBtn.disabled, onClick:function(){ closeDock(); if (nextBtn && !nextBtn.disabled) nextBtn.click(); } });
    } else if (ctx.type === "chapter-study") {
      var prev = findExistingChapterLink("prev") || fallbackChapterLink(ctx, -1);
      var next = findExistingChapterLink("next") || fallbackChapterLink(ctx, 1);
      if (prev) actions.push({ id:"prev", label:"이전 장", icon:"prev", href:prev });
      if (next) actions.push({ id:"next", label:"다음 장", icon:"next", href:next });
    }

    if (tocItems.length > 1) actions.push({ id:"toc", label:ctx.type === "study-home" ? "장 목록" : "현재 문서 목차", icon:"toc", onClick:openToc });

    if (ctx.type === "lexicon-index") {
      actions.push({ id:"search", label:"사전 검색", icon:"search", onClick:function () {
        closeDock();
        var input = document.getElementById("lx-query");
        if (input) { input.scrollIntoView({ behavior:"smooth", block:"center" }); setTimeout(function(){ input.focus(); },300); }
      }});
    } else if (ctx.type === "lexicon-entry") {
      actions.push({ id:"search", label:"사전 검색", icon:"search", href:href("lexicon/index.html") });
    }

    if (ctx.type !== "original") actions.push({ id:"bible", label:"원어성경", icon:"bible", href:originalUrl(ctx) });
    if (ctx.type !== "lexicon-index" && ctx.type !== "lexicon-entry") actions.push({ id:"lexicon", label:"원어사전", icon:"lexicon", href:href("lexicon/index.html") });

    actions.push({ id:"settings", label:"화면 설정", icon:"settings", onClick:openSettings, wide:true });
    if (window.scrollY > 600) actions.push({ id:"top", label:"맨 위로", icon:"top", onClick:function(){ closeDock(); window.scrollTo({ top:0, behavior:"smooth" }); }, wide:true });
    return actions;
  }

  function renderActions() {
    if (!ui) return;
    lastTopVisible = window.scrollY > 600;
    ui.actions.innerHTML = "";
    actionList().forEach(function (action) { ui.actions.appendChild(makeButton(action)); });
  }

  function openDock() {
    if (!ui) return;
    lastFocused = document.activeElement;
    renderActions();
    ui.root.classList.add("is-open");
    ui.panel.setAttribute("aria-hidden", "false");
    ui.trigger.setAttribute("aria-expanded", "true");
    document.body.classList.add("rd-dock-open");
    setTimeout(function(){ ui.close.focus(); }, 20);
  }

  function closeDock() {
    if (!ui) return;
    ui.root.classList.remove("is-open");
    ui.panel.setAttribute("aria-hidden", "true");
    ui.trigger.setAttribute("aria-expanded", "false");
    document.body.classList.remove("rd-dock-open");
    showMainPanel();
    if (lastFocused && document.contains(lastFocused)) lastFocused.focus({ preventScroll:true });
  }

  function showMainPanel() {
    if (!ui) return;
    ui.main.hidden = false;
    ui.toc.hidden = true;
    ui.settings.hidden = true;
    ui.title.textContent = "연구 도구";
    ui.back.hidden = true;
  }

  function showSubPanel(name, title) {
    ui.main.hidden = true;
    ui.toc.hidden = name !== "toc";
    ui.settings.hidden = name !== "settings";
    ui.title.textContent = title;
    ui.back.hidden = false;
    ui.back.focus();
  }

  function openToc() {
    renderToc();
    showSubPanel("toc", context().type === "study-home" ? "장 목록" : "문서 목차");
  }

  function renderToc() {
    ui.tocList.innerHTML = "";
    tocItems.forEach(function (item) {
      var a = document.createElement("a");
      a.className = "rd-toc-link";
      a.textContent = item.label;
      a.href = item.href;
      if (item.id) a.dataset.tocTarget = item.id;
      a.addEventListener("click", function (event) {
        if (item.id) {
          event.preventDefault();
          closeDock();
          var target = document.getElementById(item.id);
          if (target) {
            history.replaceState(null, "", "#" + item.id);
            target.scrollIntoView({ behavior:"smooth", block:"start" });
          }
        } else closeDock();
      });
      ui.tocList.appendChild(a);
    });
    watchToc();
  }

  function watchToc() {
    if (tocObserver) tocObserver.disconnect();
    var targets = tocItems.filter(function (item) { return item.id && document.getElementById(item.id); });
    if (!targets.length || !("IntersectionObserver" in window)) return;
    tocObserver = new IntersectionObserver(function (entries) {
      var visible = entries.filter(function (e) { return e.isIntersecting; }).sort(function(a,b){ return a.boundingClientRect.top - b.boundingClientRect.top; });
      if (!visible.length) return;
      var id = visible[0].target.id;
      ui.tocList.querySelectorAll("[data-toc-target]").forEach(function (a) { a.classList.toggle("is-current", a.dataset.tocTarget === id); });
    }, { rootMargin:"-15% 0px -70% 0px", threshold:[0,1] });
    targets.forEach(function (item) { tocObserver.observe(document.getElementById(item.id)); });
  }

  function openSettings() {
    updateSettingsUI();
    showSubPanel("settings", "화면 설정");
  }

  function updateSettingsUI() {
    if (!ui) return;
    var theme = currentTheme();
    ui.settings.querySelectorAll("[data-theme-mode]").forEach(function (btn) {
      var active = btn.dataset.themeMode === theme;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });
    var fontValue = ui.settings.querySelector("[data-font-value]");
    if (fontValue) fontValue.textContent = currentFontScale() + "%";
    var single = document.body.classList.contains("rd-reader-single");
    ui.settings.querySelectorAll("[data-reader-layout]").forEach(function (btn) {
      var active = btn.dataset.readerLayout === (single ? "single" : "parallel");
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });
    var hoverOff = document.body.classList.contains("rd-lexicon-hover-off");
    var hoverButton = ui.settings.querySelector("[data-hover-toggle]");
    if (hoverButton) {
      hoverButton.textContent = hoverOff ? "꺼짐" : "켜짐";
      hoverButton.classList.toggle("is-active", !hoverOff);
      hoverButton.setAttribute("aria-pressed", hoverOff ? "false" : "true");
    }
  }

  function settingsMarkup() {
    var ctx = context();
    return [
      '<div class="rd-setting-group"><h3>테마</h3><div class="rd-segment" role="group" aria-label="화면 테마">',
      '<button type="button" data-theme-mode="auto">시스템</button><button type="button" data-theme-mode="light">라이트</button><button type="button" data-theme-mode="dark">다크</button>',
      '</div></div>',
      '<div class="rd-setting-group"><h3>글자 크기</h3><div class="rd-stepper">',
      '<button type="button" data-font-step="-10" aria-label="글자 작게">' + ICON.minus + '</button><output data-font-value>100%</output><button type="button" data-font-step="10" aria-label="글자 크게">' + ICON.plus + '</button>',
      '</div></div>',
      ctx.type === "original" ? '<div class="rd-setting-group"><h3>본문 배열</h3><div class="rd-segment"><button type="button" data-reader-layout="parallel">두 열</button><button type="button" data-reader-layout="single">한 열</button></div></div>' : '',
      ctx.type === "original" ? '<div class="rd-setting-row"><span><b>원어사전 호버</b><small>단어 위에서 풀이 열기</small></span><button type="button" class="rd-switch" data-hover-toggle aria-pressed="true">켜짐</button></div>' : '',
      '<button type="button" class="rd-reset" data-settings-reset>화면 설정 초기화</button>'
    ].join("");
  }

  function bindSettings() {
    ui.settings.addEventListener("click", function (event) {
      var target = event.target.closest("button");
      if (!target) return;
      if (target.dataset.themeMode) applyTheme(target.dataset.themeMode);
      if (target.dataset.fontStep) applyFontScale(currentFontScale() + Number(target.dataset.fontStep));
      if (target.dataset.readerLayout) applyLayout(target.dataset.readerLayout);
      if (target.hasAttribute("data-hover-toggle")) applyHover(document.body.classList.contains("rd-lexicon-hover-off") ? "on" : "off");
      if (target.hasAttribute("data-settings-reset")) {
        applyTheme("auto");
        applyFontScale(100);
        applyLayout("parallel");
        applyHover("on");
      }
    });
  }

  function mount() {
    injectCss();
    initializePreferences();

    var wrap = document.createElement("div");
    wrap.className = "research-dock";
    wrap.innerHTML = [
      '<button type="button" class="rd-trigger" aria-label="연구 도구 열기" aria-expanded="false" aria-controls="research-dock-panel"><span class="rd-trigger-icon">' + ICON.menu + '</span><span class="rd-trigger-label">도구</span></button>',
      '<button type="button" class="rd-backdrop" tabindex="-1" aria-label="연구 도구 닫기"></button>',
      '<aside id="research-dock-panel" class="rd-panel" role="dialog" aria-modal="true" aria-hidden="true" aria-label="연구 도구">',
      '<header class="rd-panel-head"><button type="button" class="rd-back" aria-label="이전 화면" hidden>' + ICON.back + '</button><h2>연구 도구</h2><button type="button" class="rd-close" aria-label="연구 도구 닫기">' + ICON.close + '</button></header>',
      '<div class="rd-panel-main"><div class="rd-actions"></div></div>',
      '<div class="rd-subpanel rd-toc" hidden><nav class="rd-toc-list" aria-label="문서 목차"></nav></div>',
      '<div class="rd-subpanel rd-settings" hidden>' + settingsMarkup() + '</div>',
      '</aside>'
    ].join("");
    document.body.appendChild(wrap);

    ui = {
      root:wrap,
      trigger:wrap.querySelector(".rd-trigger"),
      backdrop:wrap.querySelector(".rd-backdrop"),
      panel:wrap.querySelector(".rd-panel"),
      close:wrap.querySelector(".rd-close"),
      back:wrap.querySelector(".rd-back"),
      title:wrap.querySelector(".rd-panel-head h2"),
      main:wrap.querySelector(".rd-panel-main"),
      actions:wrap.querySelector(".rd-actions"),
      toc:wrap.querySelector(".rd-toc"),
      tocList:wrap.querySelector(".rd-toc-list"),
      settings:wrap.querySelector(".rd-settings")
    };

    renderActions();
    bindSettings();
    updateSettingsUI();

    ui.trigger.addEventListener("click", function () { ui.root.classList.contains("is-open") ? closeDock() : openDock(); });
    ui.backdrop.addEventListener("click", closeDock);
    ui.close.addEventListener("click", closeDock);
    ui.back.addEventListener("click", showMainPanel);

    document.addEventListener("keydown", function (event) {
      if (!ui.root.classList.contains("is-open")) return;
      if (event.key === "Escape") {
        event.preventDefault();
        if (!ui.main.hidden) closeDock(); else showMainPanel();
      }
      if (event.key === "Tab") trapFocus(event);
    });

    document.addEventListener("focusin", function (event) {
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName)) document.body.classList.add("rd-input-active");
    });
    document.addEventListener("focusout", function () {
      setTimeout(function () {
        if (!document.activeElement || !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) document.body.classList.remove("rd-input-active");
      }, 0);
    });

    var scrollTick = false;
    window.addEventListener("scroll", function () {
      if (scrollTick) return;
      scrollTick = true;
      requestAnimationFrame(function () {
        scrollTick = false;
        var topVisible = window.scrollY > 600;
        if (!ui.root.classList.contains("is-open") && topVisible !== lastTopVisible) renderActions();
      });
    }, { passive:true });

    window.addEventListener("resize", function () { if (ui.root.classList.contains("is-open")) closeDock(); });
    document.addEventListener("scriptorium:themechange", updateSettingsUI);
  }

  function trapFocus(event) {
    var focusables = Array.prototype.slice.call(ui.panel.querySelectorAll('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])')).filter(function (el) { return !el.hidden && el.offsetParent !== null; });
    if (!focusables.length) return;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  ready(mount);
})();
