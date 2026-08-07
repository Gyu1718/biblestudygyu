(function(){"use strict";
var input=document.getElementById("genesisChapterSearch");
var rows=[].slice.call(document.querySelectorAll(".book-chapter-list .book-chapter-row"));
if(!input||!rows.length)return;
var buttons=[].slice.call(document.querySelectorAll(".chapter-filters button[data-range]"));
var result=document.getElementById("genesisChapterResult");
var empty=document.getElementById("genesisChapterEmpty");
var activeRange="all";
var normalize=function(value){return String(value||"").toLowerCase().replace(/\s+/g,"").replace(/^0+(?=\d)/,"")};
var apply=function(){
  var query=normalize(input.value),count=0;
  rows.forEach(function(row){
    var no=row.querySelector(".no");
    var chapter=parseInt(no?no.textContent:"0",10);
    var inRange=activeRange==="all";
    if(!inRange){var bounds=activeRange.split("-").map(Number);inRange=chapter>=bounds[0]&&chapter<=bounds[1]}
    var haystack=normalize(row.textContent)+" "+chapter;
    var visible=inRange&&(!query||haystack.indexOf(query)!==-1);
    row.hidden=!visible;if(visible)count++;
  });
  if(result)result.textContent=count+"개 장 표시";
  if(empty)empty.classList.toggle("show",count===0);
};
input.addEventListener("input",apply);
buttons.forEach(function(button){button.addEventListener("click",function(){
  activeRange=button.dataset.range;
  buttons.forEach(function(item){item.setAttribute("aria-pressed",item===button?"true":"false")});
  apply();
})});
apply();
})();
