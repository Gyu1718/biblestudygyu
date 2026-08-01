(function(){
  "use strict";
  var body=document.body;
  if(!body||body.getAttribute("data-book")!=="acts"||body.getAttribute("data-kind")!=="study")return;

  function text(el){return el?el.textContent.replace(/\s+/g," ").trim():""}
  function chapter(){return parseInt(body.getAttribute("data-chapter")||"0",10)}

  function normalizeModernTemplate(){
    if(!body.classList.contains("acts-study")||body.dataset.actsLayoutNormalized)return;
    var wrap=document.querySelector(".acts-wrap"),top=document.querySelector(".acts-topbar"),hero=document.querySelector(".acts-hero"),layout=document.querySelector(".acts-layout"),side=document.querySelector(".acts-side"),content=document.querySelector(".acts-main");
    if(!wrap||!layout||!side||!content)return;
    var ch=chapter(),titles={16:"유럽 진입",17:"아레오바고",18:"고린도와 갈리오",19:"에베소",20:"밀레도 고별",21:"체포",22:"층대의 변론",23:"공회와 음모",24:"벨릭스 앞에서",25:"베스도와 상소",26:"아그립바 앞에서",27:"항해와 파선",28:"로마"};
    var frame=document.createElement("div");frame.className="frame";
    var toc=document.createElement("nav");toc.className="toc";toc.setAttribute("aria-label","사도행전 "+ch+"장 심층 연구 목차");
    var site=document.createElement("div");site.className="site-nav";site.innerHTML='<a href="index.html">← 사도행전 서가</a><a href="../../index.html">서고 홈</a><a href="../../bible/original.html?book=ACT&amp;chapter='+ch+'">성경읽기</a><a href="overview.html">종합 개관</a>';
    var brand=document.createElement("div");brand.className="brand";brand.textContent="사도행전 "+ch+"장 심층 연구";
    var sub=document.createElement("div");sub.className="brand-sub";sub.textContent=titles[ch]||text(hero.querySelector("h1"));
    var h1=document.createElement("div");h1.className="toc-h";h1.textContent="장 이동";
    var jump=side.querySelector(".chapter-jump");
    var h2=document.createElement("div");h2.className="toc-h";h2.textContent="현재 문서 목차";
    var links=side.querySelector(".acts-toc");
    if(links){links.classList.add("toc-links");links.querySelectorAll("a").forEach(function(a){a.classList.add("lv1")})}
    toc.append(site,brand,sub,h1);if(jump)toc.appendChild(jump);toc.appendChild(h2);if(links)toc.appendChild(links);

    var main=document.createElement("main");main.id="top";
    var newHero=document.createElement("header");newHero.className="hero";
    var ep=hero.querySelector(".acts-epigraph .grk");if(ep){var g=document.createElement("div");g.className="gk-title";g.textContent=text(ep);newHero.appendChild(g)}
    var oldTitle=hero.querySelector("h1");if(oldTitle)newHero.appendChild(oldTitle);
    var intro=hero.querySelector(".intro");if(intro){intro.className="sub";newHero.appendChild(intro)}
    var meta=document.createElement("p");meta.className="meta";meta.textContent="사도행전 "+ch+"장 · Bruce·Peterson·Schnabel 종합 · 개역개정 4판 대조 · NA28 병기";newHero.appendChild(meta);
    main.appendChild(newHero);
    while(content.firstChild)main.appendChild(content.firstChild);
    var foot=wrap.querySelector(":scope > footer");if(foot)main.appendChild(foot);
    frame.append(toc,main);wrap.replaceWith(frame);
    if(top)top.remove();if(hero)hero.remove();if(layout)layout.remove();
    body.dataset.actsLayoutNormalized="true";
  }

  function mountProgress(){
    if(document.querySelector(".reading-progress"))return;
    var bar=document.createElement("div");bar.className="reading-progress";bar.setAttribute("aria-hidden","true");bar.innerHTML="<span></span>";body.prepend(bar);var fill=bar.firstElementChild;
    function update(){var d=document.documentElement,max=Math.max(1,d.scrollHeight-d.clientHeight);fill.style.width=Math.min(100,Math.max(0,d.scrollTop/max*100))+"%"}
    addEventListener("scroll",update,{passive:true});addEventListener("resize",update,{passive:true});update();
  }

  function normalizeToc(){
    var toc=document.querySelector("nav.toc");if(!toc)return;
    var links=[].slice.call(toc.querySelectorAll('a.lv1[href^="#"],.acts-toc a[href^="#"]'));
    links.forEach(function(a){a.classList.add("lv1")});
    if(!("IntersectionObserver" in window)||!links.length)return;
    var map={};links.forEach(function(a){map[a.getAttribute("href").slice(1)]=a});
    var io=new IntersectionObserver(function(entries){var visible=entries.filter(function(e){return e.isIntersecting}).sort(function(a,b){return a.boundingClientRect.top-b.boundingClientRect.top});if(!visible.length)return;var active=map[visible[0].target.id];links.forEach(function(a){a.classList.toggle("is-active",a===active)})},{rootMargin:"-12% 0px -72% 0px",threshold:[0,1]});
    Object.keys(map).forEach(function(id){var el=document.getElementById(id);if(el)io.observe(el)});
  }

  function normalizeTables(){document.querySelectorAll("table").forEach(function(table){if(table.parentElement&&/^(DIV)$/i.test(table.parentElement.tagName)&&(table.parentElement.classList.contains("tbl-wrap")||table.parentElement.classList.contains("table-scroll")))return;var wrap=document.createElement("div");wrap.className="tbl-wrap";wrap.tabIndex=0;wrap.setAttribute("role","region");wrap.setAttribute("aria-label","표 가로 스크롤");table.parentNode.insertBefore(wrap,table);wrap.appendChild(table)})}

  normalizeModernTemplate();mountProgress();normalizeToc();normalizeTables();
})();
