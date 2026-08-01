(function(){
  "use strict";
  if(!document.body)return;
  var isGenesis=document.body.getAttribute("data-book")==="genesis"||/\/ot\/genesis\//i.test(location.pathname);
  if(!isGenesis)return;
  var titles={1:"태초에",2:"에덴의 동산",3:"뱀과 추방",4:"가인과 아벨",5:"아담의 계보",6:"한탄과 은혜",7:"홍수",8:"기억하신 하나님",9:"무지개 언약",10:"민족들의 지도",11:"바벨",12:"부르심",13:"롯과 갈라섬",14:"네 왕과 멜기세덱",15:"쪼갠 짐승 사이",16:"하갈",17:"할례 언약",18:"마므레의 손님",19:"소돔",20:"그랄에서",21:"웃음의 아이",22:"결박",23:"막벨라",24:"리브가",25:"두 민족"};
  var current=parseInt(document.body.getAttribute("data-chapter")||"0",10);
  function chapterHref(n){return "ch"+String(n).padStart(2,"0")+".html";}
  document.querySelectorAll(".chapter-jump").forEach(function(jump){
    Array.prototype.slice.call(jump.children).forEach(function(node){
      var n=parseInt(node.textContent.trim(),10);
      if(!n||n>25)return;
      var a=node.tagName==="A"?node:document.createElement("a");
      if(a!==node){a.textContent=String(n);node.replaceWith(a);}
      a.href=chapterHref(n);
      a.removeAttribute("aria-disabled");a.removeAttribute("title");
      a.setAttribute("aria-label","창세기 "+n+"장 · "+titles[n]);
      if(n===current)a.setAttribute("aria-current","page");else a.removeAttribute("aria-current");
    });
  });
  var pager=document.querySelector(".chapter-pager");
  if(pager&&current){
    var prev=pager.querySelector(".prev"),next=pager.querySelector(".next");
    if(prev&&current>1){var pa=document.createElement("a");pa.className="prev";pa.href=chapterHref(current-1);pa.textContent="← "+(current-1)+"장 · "+titles[current-1];prev.replaceWith(pa);}
    if(next&&current<25){var na=document.createElement("a");na.className="next";na.href=chapterHref(current+1);na.textContent=(current+1)+"장 · "+titles[current+1]+" →";next.replaceWith(na);}
  }
})();
