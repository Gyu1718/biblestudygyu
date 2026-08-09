(function(){"use strict";
var root=document.getElementById("supplementContent"), parts=window.GENESIS_SUPPLEMENT_PARTS||[];
if(!root||!parts.length)return;
Promise.all(parts.map(function(url){return fetch(url,{cache:"no-cache"}).then(function(r){if(!r.ok)throw new Error(url+" "+r.status);return r.text()})}))
.then(function(chunks){root.className="";root.innerHTML=chunks.join("");
  var color={K:"--k",W:"--f",H:"--h",L:"--t",B:"--b",D:"--ochre"};
  root.querySelectorAll(".c").forEach(function(el){var key=(el.textContent||"").trim();if(color[key])el.style.background="var("+color[key]+")"});
  var links=[].slice.call(document.querySelectorAll('nav.toc a.lv1[href^="#"]')), map={};
  links.forEach(function(a){map[a.getAttribute("href").slice(1)]=a});
  if("IntersectionObserver"in window){var io=new IntersectionObserver(function(es){var v=es.filter(function(e){return e.isIntersecting}).sort(function(a,b){return a.boundingClientRect.top-b.boundingClientRect.top});if(v.length)links.forEach(function(a){a.classList.toggle("is-active",a===map[v[0].target.id])})},{rootMargin:"-12% 0px -72% 0px",threshold:[0,1]});Object.keys(map).forEach(function(id){var el=document.getElementById(id);if(el)io.observe(el)})}
})
.catch(function(err){root.className="supplement-error";root.textContent="보완 연구 문서를 불러오지 못했습니다: "+err.message});
})();
