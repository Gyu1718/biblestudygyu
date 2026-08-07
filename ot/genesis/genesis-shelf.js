(function(){"use strict";

/* 창세기 1–50장 심층연구가 모두 존재하므로 서가의 완료 상태를 명시적으로 동기화한다. */
var studyBadge=document.querySelector(".book-path.study .book-badge");
if(studyBadge){
  studyBadge.textContent="1–50장 전권 완성";
  studyBadge.classList.remove("partial","pending");
}

var shelfLinks=[].slice.call(document.querySelectorAll('a.book-spine[href^="ch"][href$=".html"]'));
shelfLinks.forEach(function(link){
  link.classList.remove("pending","disabled");
  link.removeAttribute("aria-disabled");
  link.setAttribute("data-study-state","complete");
  if(!link.hasAttribute("tabindex"))link.setAttribute("tabindex","0");
});

var shelfHeadings=[].slice.call(document.querySelectorAll(".book-shelf-head"));
shelfHeadings.forEach(function(head){
  var title=head.querySelector("h2");
  var text=head.querySelector("p");
  if(title&&text&&title.textContent.indexOf("장별 연구 서가")!==-1){
    text.textContent="창세기 1–50장 모든 책등이 심층연구 문서로 연결되어 있다. 책등을 누르면 해당 장 연구를 바로 연다.";
  }
  if(title&&text&&title.textContent.indexOf("장별 자료 현황")!==-1){
    text.textContent="창세기 1–50장 심층연구와 성경 본문 링크를 모두 제공한다. 원어 연구는 실제 파일이 추가되는 장부터 활성화한다.";
  }
});

var rows=[].slice.call(document.querySelectorAll(".book-chapter-list .book-chapter-row"));
rows.forEach(function(row){
  var studyLink=row.querySelector('.book-actions a[href^="ch"][href$=".html"]');
  if(studyLink){
    studyLink.classList.remove("disabled");
    studyLink.removeAttribute("aria-disabled");
    studyLink.setAttribute("data-study-state","complete");
  }
});

var input=document.getElementById("genesisChapterSearch");
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
