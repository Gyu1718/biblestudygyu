(function(){"use strict";
if(document.body&&document.body.getAttribute("data-kind")==="study"&&!document.querySelector('link[data-genesis-visual]')){
  var visual=document.createElement('link');
  visual.rel='stylesheet';
  visual.href='./genesis-visual.css';
  visual.setAttribute('data-genesis-visual','');
  document.head.appendChild(visual);
}
if(!document.body||document.querySelector(".reading-progress"))return;
var b=document.createElement("div");b.className="reading-progress";b.setAttribute("aria-hidden","true");b.innerHTML="<span></span>";document.body.prepend(b);
var f=b.firstElementChild,u=function(){var d=document.documentElement,m=Math.max(1,d.scrollHeight-d.clientHeight);f.style.width=Math.min(100,Math.max(0,d.scrollTop/m*100))+"%"};
addEventListener("scroll",u,{passive:true});addEventListener("resize",u,{passive:true});u();
var a=[].slice.call(document.querySelectorAll('nav.toc a.lv1[href^="#"]'));
if(!a.length||!("IntersectionObserver"in window))return;
var map={};a.forEach(function(x){map[x.getAttribute("href").slice(1)]=x});
var io=new IntersectionObserver(function(es){var v=es.filter(function(e){return e.isIntersecting}).sort(function(x,y){return x.boundingClientRect.top-y.boundingClientRect.top});if(v.length)a.forEach(function(x){x.classList.toggle("is-active",x===map[v[0].target.id])})},{rootMargin:"-12% 0px -72% 0px",threshold:[0,1]});
Object.keys(map).forEach(function(id){var e=document.getElementById(id);if(e)io.observe(e)})
})();
