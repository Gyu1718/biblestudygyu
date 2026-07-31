(function(){
  "use strict";
  if (!document.body || document.querySelector(".reading-progress")) return;
  var bar=document.createElement("div");
  bar.className="reading-progress";
  bar.setAttribute("aria-hidden","true");
  bar.innerHTML="<span></span>";
  document.body.prepend(bar);
  var fill=bar.firstElementChild;
  var update=function(){
    var doc=document.documentElement;
    var max=Math.max(1,doc.scrollHeight-doc.clientHeight);
    fill.style.width=Math.min(100,Math.max(0,(doc.scrollTop/max)*100))+"%";
  };
  addEventListener("scroll",update,{passive:true});
  addEventListener("resize",update,{passive:true});
  update();

  var links=Array.prototype.slice.call(document.querySelectorAll('nav.toc a.lv1[href^="#"]'));
  if (!("IntersectionObserver" in window) || !links.length) return;
  var byId={};
  links.forEach(function(a){byId[a.getAttribute("href").slice(1)]=a;});
  var setActive=function(id){links.forEach(function(a){a.classList.toggle("is-active",a===byId[id]);});};
  var observer=new IntersectionObserver(function(entries){
    var visible=entries.filter(function(e){return e.isIntersecting;}).sort(function(a,b){return a.boundingClientRect.top-b.boundingClientRect.top;});
    if(visible.length) setActive(visible[0].target.id);
  },{rootMargin:"-12% 0px -72% 0px",threshold:[0,1]});
  Object.keys(byId).forEach(function(id){var el=document.getElementById(id);if(el)observer.observe(el);});
})();
