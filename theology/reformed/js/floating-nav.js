/* Floating quick navigation: home / top / toc / bottom */
(function(){
  const NAV_ID = "floating-page-nav";
  const PANEL_ID = "floating-page-toc-panel";
  const REDUCE_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)");
  const SCROLL_MARGIN = 12;

  function getBehavior(){
    return REDUCE_MOTION.matches ? "auto" : "smooth";
  }

  function getStickyOffset(){
    const raw = getComputedStyle(document.documentElement).getPropertyValue("--sticky-offset");
    const parsed = parseInt(raw,10);
    return Number.isFinite(parsed) ? parsed : 96;
  }

  function maxScrollTop(){
    const doc = document.documentElement;
    const body = document.body;
    const max = Math.max(
      body.scrollHeight,
      body.offsetHeight,
      doc.clientHeight,
      doc.scrollHeight,
      doc.offsetHeight
    ) - window.innerHeight;
    return Math.max(0,max);
  }

  function isVisible(node){
    if(!node) return false;
    const rect = node.getBoundingClientRect();
    const style = getComputedStyle(node);
    return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden";
  }

  function cleanText(node){
    if(!node) return "";
    const clone = node.cloneNode(true);
    clone.querySelectorAll(".lat,.cat-tag,.trad-tag,.tag").forEach(x => x.remove());
    return clone.textContent.replace(/\s+/g," ").trim();
  }

  function scrollToElement(node){
    if(!node) return;
    const top = Math.max(0, window.scrollY + node.getBoundingClientRect().top - getStickyOffset());
    window.scrollTo({ top, behavior:getBehavior() });
  }

  function visibleDetailToc(){
    return Array.from(document.querySelectorAll(".detail-toc")).find(isVisible) || null;
  }

  function uniquePush(items,item){
    if(!item || !item.label) return;
    if(item.target && items.some(x => x.target === item.target)) return;
    if(item.tab && items.some(x => x.tab === item.tab)) return;
    items.push(item);
  }

  function getCurrentTocItems(){
    const items = [];
    const detailToc = visibleDetailToc();

    if(detailToc){
      const detailPage = detailToc.closest(".detail-page") || document.querySelector(".detail-page");
      uniquePush(items,{ label:"문서 처음", target:detailPage || document.querySelector("#view") });

      detailToc.querySelectorAll("a[href^='#']").forEach(link => {
        const id = decodeURIComponent(link.getAttribute("href").slice(1));
        const target = document.getElementById(id);
        uniquePush(items,{ label:cleanText(link), target });
      });

      if(items.length > 1) return { title:"문서 목차", items };
    }

    document.querySelectorAll(".tabs .tab").forEach(tab => {
      uniquePush(items,{ label:cleanText(tab), tab });
    });

    const headings = Array.from(document.querySelectorAll([
      "#view .detail-hero h2",
      "#view .part-h",
      "#view .topic-section h4",
      "#view .history-section h4",
      "#view .compare-head h3",
      "#view .card h3"
    ].join(","))).filter(isVisible).slice(0,24);

    headings.forEach(heading => {
      uniquePush(items,{ label:cleanText(heading), target:heading });
    });

    return { title:"화면 목차", items };
  }

  function createButton(action, icon, text, label){
    const button = document.createElement("button");
    button.type = "button";
    button.className = "floating-page-nav__button";
    button.dataset.floatingAction = action;
    button.setAttribute("aria-label", label);
    button.title = label;
    button.innerHTML = `<span class="floating-page-nav__icon" aria-hidden="true">${icon}</span><span class="floating-page-nav__text">${text}</span>`;
    if(action === "toc"){
      button.setAttribute("aria-haspopup","dialog");
      button.setAttribute("aria-expanded","false");
      button.setAttribute("aria-controls",PANEL_ID);
    }
    return button;
  }

  function ensurePanel(){
    let panel = document.getElementById(PANEL_ID);
    if(panel) return panel;

    panel = document.createElement("aside");
    panel.id = PANEL_ID;
    panel.className = "floating-page-toc-panel";
    panel.setAttribute("role","dialog");
    panel.setAttribute("aria-label","목차");
    panel.hidden = true;
    document.body.appendChild(panel);

    panel.addEventListener("click", function(event){
      const close = event.target.closest("[data-floating-toc-close]");
      if(close){
        closePanel();
        return;
      }

      const item = event.target.closest("[data-floating-toc-index]");
      if(!item) return;

      const index = Number(item.dataset.floatingTocIndex);
      const tocItem = Array.isArray(panel.__tocItems) ? panel.__tocItems[index] : null;
      if(!tocItem) return;

      closePanel();

      if(tocItem.tab){
        tocItem.tab.click();
        window.setTimeout(function(){
          scrollToElement(document.querySelector(".tabs") || document.querySelector("#view"));
        },0);
        return;
      }

      scrollToElement(tocItem.target);
    });

    return panel;
  }

  function renderPanel(){
    const panel = ensurePanel();
    const toc = getCurrentTocItems();
    panel.__tocItems = toc.items;

    const list = toc.items.length
      ? toc.items.map((item,index) => `<button type="button" class="floating-page-toc-panel__item" data-floating-toc-index="${index}">${item.label}</button>`).join("")
      : `<p class="floating-page-toc-panel__empty">현재 화면에서 이동할 목차 항목이 없습니다.</p>`;

    panel.innerHTML = `
      <div class="floating-page-toc-panel__head">
        <strong>${toc.title}</strong>
        <button type="button" data-floating-toc-close aria-label="목차 닫기">×</button>
      </div>
      <div class="floating-page-toc-panel__list">${list}</div>
    `;
  }

  function openPanel(){
    const nav = document.getElementById(NAV_ID);
    const tocButton = nav && nav.querySelector('[data-floating-action="toc"]');
    renderPanel();
    const panel = ensurePanel();
    panel.hidden = false;
    if(tocButton) tocButton.setAttribute("aria-expanded","true");
  }

  function closePanel(){
    const panel = document.getElementById(PANEL_ID);
    const nav = document.getElementById(NAV_ID);
    const tocButton = nav && nav.querySelector('[data-floating-action="toc"]');
    if(panel) panel.hidden = true;
    if(tocButton) tocButton.setAttribute("aria-expanded","false");
  }

  function togglePanel(){
    const panel = ensurePanel();
    if(panel.hidden) openPanel();
    else closePanel();
  }

  function resetHomeControls(){
    const searchInput = document.querySelector("#q");
    if(searchInput && searchInput.value){
      searchInput.value = "";
      searchInput.dispatchEvent(new Event("input", { bubbles:true }));
    }

    const allFilter = document.querySelector('.chip[data-trad="all"]');
    if(allFilter && allFilter.getAttribute("aria-pressed") !== "true"){
      allFilter.click();
    }
  }

  function goHome(){
    closePanel();
    resetHomeControls();

    const homeTab = document.querySelector('.tab[data-view="compare"]');
    if(homeTab){
      homeTab.click();
    }else{
      history.pushState("", document.title, location.pathname + location.search);
    }

    window.setTimeout(function(){
      window.scrollTo({ top:0, behavior:getBehavior() });
    },0);
  }

  function mount(){
    if(document.getElementById(NAV_ID)) return;

    const nav = document.createElement("nav");
    nav.id = NAV_ID;
    nav.className = "floating-page-nav";
    nav.setAttribute("aria-label", "빠른 화면 이동");

    nav.append(
      createButton("home", "⌂", "홈", "홈으로 이동"),
      createButton("top", "↑", "위", "맨 위로 이동"),
      createButton("toc", "≡", "목차", "목차 열기"),
      createButton("bottom", "↓", "아래", "맨 아래로 이동")
    );

    nav.addEventListener("click", function(event){
      const button = event.target.closest("button[data-floating-action]");
      if(!button || button.disabled) return;
      const action = button.dataset.floatingAction;

      if(action === "home"){
        goHome();
        return;
      }

      if(action === "top"){
        closePanel();
        window.scrollTo({ top:0, behavior:getBehavior() });
        return;
      }

      if(action === "toc"){
        event.stopPropagation();
        togglePanel();
        return;
      }

      if(action === "bottom"){
        closePanel();
        window.scrollTo({ top:maxScrollTop(), behavior:getBehavior() });
      }
    });

    document.body.appendChild(nav);
    ensurePanel();
    updateState();

    let ticking = false;
    const requestUpdate = function(){
      if(ticking) return;
      ticking = true;
      window.requestAnimationFrame(function(){
        updateState();
        ticking = false;
      });
    };

    window.addEventListener("scroll", requestUpdate, { passive:true });
    window.addEventListener("resize", requestUpdate);
    document.addEventListener("click", function(event){
      const panel = document.getElementById(PANEL_ID);
      const nav = document.getElementById(NAV_ID);
      if(!panel || panel.hidden) return;
      if(panel.contains(event.target) || (nav && nav.contains(event.target))) return;
      closePanel();
    });
    document.addEventListener("keydown", function(event){
      if(event.key === "Escape") closePanel();
    });

    const view = document.querySelector("#view");
    if(view){
      const observer = new MutationObserver(function(){
        closePanel();
        requestUpdate();
      });
      observer.observe(view, { childList:true, subtree:true });
    }
  }

  function updateState(){
    const nav = document.getElementById(NAV_ID);
    if(!nav) return;

    const maxTop = maxScrollTop();
    nav.hidden = maxTop < 160;
    if(nav.hidden){
      closePanel();
      return;
    }

    const topButton = nav.querySelector('[data-floating-action="top"]');
    const bottomButton = nav.querySelector('[data-floating-action="bottom"]');
    const tocButton = nav.querySelector('[data-floating-action="toc"]');

    if(topButton) topButton.disabled = window.scrollY <= SCROLL_MARGIN;
    if(bottomButton) bottomButton.disabled = window.scrollY >= maxTop - SCROLL_MARGIN;
    if(tocButton) tocButton.disabled = !getCurrentTocItems().items.length;
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", mount, { once:true });
  }else{
    mount();
  }
})();
