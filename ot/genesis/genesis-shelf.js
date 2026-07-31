(function(){
  "use strict";
  var input=document.getElementById("genesisChapterSearch");
  var rows=Array.prototype.slice.call(document.querySelectorAll(".book-chapter-list .book-chapter-row"));
  if(!input||!rows.length)return;
  var buttons=Array.prototype.slice.call(document.querySelectorAll(".chapter-filters button[data-range]"));
  var result=document.getElementById("genesisChapterResult");
  var empty=document.getElementById("genesisChapterEmpty");
  var active="all";
  var normalize=function(s){return String(s||"").toLowerCase().replace(/\s+/g,"").replace(/^0+(?=\d)/,"");};
  var apply=function(){
    var q=normalize(input.value);var shown=0;
    rows.forEach(function(row){
      var num=parseInt((row.querySelector(".no")||{}).textContent||"0",10);
      var inRange=active==="all"||(function(){var a=active.split("-").map(Number);return num>=a[0]&&num<=a[1];})();
      var text=normalize(row.textContent)+" "+num;
      var match=inRange&&(!q||text.indexOf(q)!==-1);
      row.hidden=!match;if(match)shown++;
    });
    if(result)result.textContent=shown+"개 장 표시";
    if(empty)empty.classList.toggle("show",shown===0);
  };
  input.addEventListener("input",apply);
  buttons.forEach(function(btn){btn.addEventListener("click",function(){active=btn.dataset.range;buttons.forEach(function(b){b.setAttribute("aria-pressed",b===btn?"true":"false");});apply();});});
  apply();
})();
