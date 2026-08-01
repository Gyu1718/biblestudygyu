(function(){
  "use strict";
  if(window.__SCRIPTORIUM_SHELF_TOOLS__) return;
  window.__SCRIPTORIUM_SHELF_TOOLS__=true;

  var body=document.body;
  if(!body || !body.classList.contains("book-shelf-page")) return;
  var book=(body.getAttribute("data-book")||"").toLowerCase();
  var CONFIG={
    acts:{name:"사도행전",total:28,completed:15,latest:15,reader:"ACT",ranges:[
      {id:"all",label:"전체",min:1,max:28},
      {id:"jerusalem",label:"예루살렘",min:1,max:7},
      {id:"judea",label:"유대·사마리아",min:8,max:12},
      {id:"mission1",label:"1차 여행·공회",min:13,max:15},
      {id:"rome",label:"로마를 향하여",min:16,max:28}
    ]},
    genesis:{name:"창세기",total:50,completed:20,latest:20,reader:"GEN",ranges:[
      {id:"all",label:"전체",min:1,max:50},
      {id:"primeval",label:"원역사",min:1,max:11},
      {id:"abraham",label:"아브라함",min:12,max:25},
      {id:"jacob",label:"이삭·야곱",min:26,max:36},
      {id:"joseph",label:"요셉",min:37,max:50}
    ]}
  };
  var cfg=CONFIG[book];
  if(!cfg) return;

  function q(sel,root){return (root||document).querySelector(sel)}
  function qa(sel,root){return Array.prototype.slice.call((root||document).querySelectorAll(sel))}
  function chapterOf(node){
    var t=q(".num,.no",node); if(!t) return null;
    var m=t.textContent.match(/\d+/); return m?parseInt(m[0],10):null;
  }
  function textOf(node){return (node.textContent||"").toLowerCase().replace(/\s+/g," ").trim()}
  function isComplete(n){return n>=1 && n<=cfg.completed}
  function studyHref(n){return "ch"+String(n).padStart(2,"0")+".html"}
  function storeLast(n,title){
    if(!n || !isComplete(n)) return;
    try{localStorage.setItem("scriptorium-last-study-"+book,JSON.stringify({chapter:n,title:title||("제 "+n+"장"),href:studyHref(n),savedAt:Date.now()}))}catch(e){}
  }
  function readLast(){
    try{var x=JSON.parse(localStorage.getItem("scriptorium-last-study-"+book)||"null");if(x&&isComplete(x.chapter))return x}catch(e){}
    return {chapter:cfg.latest,title:"최근 완성 장",href:studyHref(cfg.latest)};
  }
  function toast(message){
    var node=q(".shelf-toast");
    if(!node){node=document.createElement("div");node.className="shelf-toast";node.setAttribute("role","status");document.body.appendChild(node)}
    node.textContent=message;node.classList.add("show");clearTimeout(node._timer);node._timer=setTimeout(function(){node.classList.remove("show")},1800);
  }
  function copyLink(){
    var value=location.href;
    if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(value).then(function(){toast("현재 주소를 복사했습니다.")},fallback)}else fallback();
    function fallback(){var ta=document.createElement("textarea");ta.value=value;ta.style.position="fixed";ta.style.opacity="0";document.body.appendChild(ta);ta.select();try{document.execCommand("copy");toast("현재 주소를 복사했습니다.")}catch(e){toast("주소 복사에 실패했습니다.")}ta.remove()}
  }
  function makeButton(label,value,kind){
    var b=document.createElement("button");b.type="button";b.className="shelf-filter-button";b.textContent=label;b.dataset[kind]=value;b.setAttribute("aria-pressed",value==="all"?"true":"false");return b;
  }

  var hero=q(".book-shelf-hero");
  var panel=document.createElement("section");
  panel.className="shelf-tools-panel";panel.setAttribute("aria-label",cfg.name+" 서가 도구");
  var percent=Math.round(cfg.completed/cfg.total*100);
  panel.innerHTML='<div class="shelf-tools-summary"><div><h2>서가 탐색 도구</h2><p>검색 결과는 본문 바로가기·연구 책등·장별 현황에 동시에 적용됩니다. <kbd>/</kbd> 키로 검색창에 바로 이동합니다.</p></div><div class="shelf-progress-number">'+cfg.completed+' / '+cfg.total+'장 · '+percent+'%</div><div class="shelf-progress-track" role="progressbar" aria-label="심층연구 완성률" aria-valuemin="0" aria-valuemax="'+cfg.total+'" aria-valuenow="'+cfg.completed+'"><span style="width:'+percent+'%"></span></div></div>'+
    '<div class="shelf-quick-actions"></div>'+
    '<div class="shelf-search-wrap"><label for="shelfChapterSearch">장 번호·제목·주제 검색</label><input id="shelfChapterSearch" type="search" placeholder="예: 15, 언약, 스데반, 안디옥" autocomplete="off"><button type="button" class="shelf-tool-button" data-clear-search>검색 지우기</button></div>'+
    '<div class="shelf-filter-line" data-status-line><span class="shelf-filter-label">상태</span></div>'+
    '<div class="shelf-filter-line" data-range-line><span class="shelf-filter-label">구간</span></div>'+
    '<p class="shelf-tools-result" aria-live="polite"></p><div class="shelf-no-results">검색 조건과 일치하는 장이 없습니다.</div>';
  if(hero) hero.insertAdjacentElement("afterend",panel); else (q(".book-shelf-wrap")||body).prepend(panel);

  var quick=q(".shelf-quick-actions",panel);var last=readLast();
  var resume=document.createElement("a");resume.className="shelf-tool-link primary";resume.href=last.href;resume.textContent="최근 연구 이어보기 · "+last.chapter+"장";quick.appendChild(resume);
  var latest=document.createElement("a");latest.className="shelf-tool-link";latest.href=studyHref(cfg.latest);latest.textContent="최신 완성 장 · "+cfg.latest+"장";quick.appendChild(latest);
  var statusJump=document.createElement("a");statusJump.className="shelf-tool-link";statusJump.href="#chapters";statusJump.textContent="장별 현황";quick.appendChild(statusJump);
  var readingJump=document.createElement("a");readingJump.className="shelf-tool-link";readingJump.href="#reading-chapters";readingJump.textContent="본문 장 목록";quick.appendChild(readingJump);
  var copy=document.createElement("button");copy.type="button";copy.className="shelf-tool-button";copy.textContent="주소 복사";copy.addEventListener("click",copyLink);quick.appendChild(copy);

  var statusLine=q("[data-status-line]",panel);[
    ["전체","all"],["심층연구 완성","complete"],["준비 중","pending"]
  ].forEach(function(x){statusLine.appendChild(makeButton(x[0],x[1],"status"))});
  var rangeLine=q("[data-range-line]",panel);cfg.ranges.forEach(function(r){rangeLine.appendChild(makeButton(r.label,r.id,"range"))});

  var state={query:"",status:"all",range:"all"};
  var search=q("#shelfChapterSearch",panel),result=q(".shelf-tools-result",panel),empty=q(".shelf-no-results",panel);
  var readings=qa(".book-chapter-grid a");
  var spines=qa(".book-spine").filter(function(n){return chapterOf(n)!==null});
  var rows=qa("#chapters .book-chapter-row").filter(function(n){return chapterOf(n)!==null});
  var targets=readings.concat(spines,rows);

  function rangeMatch(n){var r=cfg.ranges.filter(function(x){return x.id===state.range})[0]||cfg.ranges[0];return n>=r.min&&n<=r.max}
  function statusMatch(n){return state.status==="all"||(state.status==="complete"?isComplete(n):!isComplete(n))}
  function queryMatch(node,n){if(!state.query)return true;var qx=state.query.toLowerCase().trim();var numeric=parseInt(qx.replace(/[^0-9]/g,""),10);if(/\d/.test(qx)&&numeric===n)return true;return textOf(node).indexOf(qx)>-1}
  function apply(){
    var visibleChapters={};
    targets.forEach(function(node){var n=chapterOf(node);var show=!!n&&rangeMatch(n)&&statusMatch(n)&&queryMatch(node,n);node.dataset.shelfFilterHidden=show?"false":"true";if(show)visibleChapters[n]=true});
    var count=Object.keys(visibleChapters).length;
    result.textContent=count+"개 장 표시 · 완성 "+cfg.completed+"장 · 준비 중 "+(cfg.total-cfg.completed)+"장";
    empty.classList.toggle("show",count===0);
  }
  function setPressed(kind,value){qa("[data-"+kind+"]",panel).forEach(function(b){b.setAttribute("aria-pressed",b.dataset[kind]===value?"true":"false")})}
  statusLine.addEventListener("click",function(e){var b=e.target.closest("[data-status]");if(!b)return;state.status=b.dataset.status;setPressed("status",state.status);apply()});
  rangeLine.addEventListener("click",function(e){var b=e.target.closest("[data-range]");if(!b)return;state.range=b.dataset.range;setPressed("range",state.range);apply()});
  search.addEventListener("input",function(){state.query=search.value;apply()});
  q("[data-clear-search]",panel).addEventListener("click",function(){search.value="";state.query="";apply();search.focus()});
  document.addEventListener("keydown",function(e){if(e.key==="/"&&!/input|textarea|select/i.test(document.activeElement.tagName)){e.preventDefault();search.focus()}if(e.key==="Escape"&&document.activeElement===search){search.value="";state.query="";apply();search.blur()}});

  document.addEventListener("click",function(e){var a=e.target.closest('a[href*="ch"]');if(!a)return;var m=(a.getAttribute("href")||"").match(/ch(\d{2})\.html/i);if(!m)return;var n=parseInt(m[1],10);var title=(q(".title",a)||q("h3",a)||a).textContent.trim();storeLast(n,title)});

  var top=document.createElement("button");top.type="button";top.className="shelf-top-button";top.setAttribute("aria-label","맨 위로");top.textContent="↑";top.addEventListener("click",function(){window.scrollTo({top:0,behavior:"smooth"})});document.body.appendChild(top);
  window.addEventListener("scroll",function(){top.classList.toggle("show",window.scrollY>650)},{passive:true});
  apply();
})();
