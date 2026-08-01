(function(){"use strict";
var body=document.body;if(!body||!body.hasAttribute("data-acts-topic-source"))return;
var source=body.getAttribute("data-acts-topic-source"),mount=document.getElementById("topicContent"),toc=document.getElementById("topicToc"),jump=document.getElementById("topicChapters");
function esc(s){return String(s||"").replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function inline(s){var stash=[];s=String(s||"").replace(/<[^>]+>/g,function(x){stash.push(x);return"\u0000"+(stash.length-1)+"\u0000"});s=esc(s).replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>").replace(/`([^`]+)`/g,"<code>$1</code>").replace(/\*([^*]+)\*/g,"<em>$1</em>");return s.replace(/\u0000(\d+)\u0000/g,function(_,i){return stash[+i]||""})}
function slug(s){return String(s||"").normalize("NFKC").toLowerCase().replace(/[^\w가-힣α-ωά-ώ\s-]/g,"").trim().replace(/\s+/g,"-")||"section"}
function render(md){
 var lines=String(md||"").replace(/\r/g,"").split("\n"),out=[],heads=[],used={},i=0,para=[];
 function flush(){if(para.length){out.push("<p>"+inline(para.join(" "))+"</p>");para=[]}}
 function sep(x){return /^\s*\|?(?:\s*:?-+:?\s*\|)+\s*:?-+:?\s*\|?\s*$/.test(x)}
 while(i<lines.length){var t=lines[i].trim();if(!t){flush();i++;continue}
  if(/^---+$/.test(t)){flush();out.push("<hr>");i++;continue}
  var h=t.match(/^(#{1,5})\s+(.+)$/);if(h){flush();var lv=h[1].length,txt=h[2],base=slug(txt);used[base]=(used[base]||0)+1;var id=used[base]===1?base:base+"-"+used[base];out.push("<h"+lv+' id="'+id+'">'+inline(txt)+"</h"+lv+">");heads.push({level:lv,id:id,text:txt});i++;continue}
  if(/^>\s?/.test(t)){flush();var q=[];while(i<lines.length&&/^>\s?/.test(lines[i].trim()))q.push(lines[i++].trim().replace(/^>\s?/,""));out.push("<blockquote>"+q.map(inline).join("<br>")+"</blockquote>");continue}
  if(t.indexOf("|")>=0&&i+1<lines.length&&sep(lines[i+1])){flush();var rows=[t];i+=2;while(i<lines.length&&lines[i].trim()&&lines[i].trim().indexOf("|")>=0)rows.push(lines[i++].trim());function cells(r){return r.replace(/^\||\|$/g,"").split("|").map(function(x){return x.trim()})}var hd=cells(rows.shift());out.push('<div class="tbl-wrap" tabindex="0" role="region" aria-label="주제 연구 표"><table><thead><tr>'+hd.map(function(x){return"<th>"+inline(x)+"</th>"}).join("")+"</tr></thead><tbody>");rows.forEach(function(r){out.push("<tr>"+cells(r).map(function(x){return"<td>"+inline(x)+"</td>"}).join("")+"</tr>")});out.push("</tbody></table></div>");continue}
  var li=t.match(/^[-*]\s+(.+)$/);if(li){flush();var a=[];while(i<lines.length&&(li=lines[i].trim().match(/^[-*]\s+(.+)$/))){a.push(li[1]);i++}out.push("<ul>"+a.map(function(x){return"<li>"+inline(x)+"</li>"}).join("")+"</ul>");continue}
  var ol=t.match(/^\d+\.\s+(.+)$/);if(ol){flush();var a2=[];while(i<lines.length&&(ol=lines[i].trim().match(/^\d+\.\s+(.+)$/))){a2.push(ol[1]);i++}out.push("<ol>"+a2.map(function(x){return"<li>"+inline(x)+"</li>"}).join("")+"</ol>");continue}
  para.push(t);i++}
 flush();return{html:out.join(""),heads:heads};
}
if(jump){for(var n=1;n<=28;n++){var a=document.createElement("a");a.href="ch"+String(n).padStart(2,"0")+".html";a.textContent=n;a.setAttribute("aria-label","사도행전 "+n+"장");jump.appendChild(a)}}
fetch(source+"?v=20260801.7").then(function(r){if(!r.ok)throw new Error(r.status);return r.text()}).then(function(text){
 var rendered=render(text),tmp=document.createElement("div");tmp.innerHTML=rendered.html;
 var title=tmp.querySelector("h1");if(title){document.title=title.textContent+" — 사도행전 연구 서가";var hero=document.getElementById("topicTitle");if(hero)hero.textContent=title.textContent;title.remove()}
 var quote=tmp.querySelector("blockquote");if(quote){var sub=document.getElementById("topicSub");if(sub)sub.textContent=quote.textContent.trim()}
 mount.innerHTML=tmp.innerHTML;
 rendered.heads.filter(function(h){return h.level===2||h.level===3}).forEach(function(h){var a=document.createElement("a");a.className="lv1"+(h.level===3?" sub":"");a.href="#"+h.id;a.textContent=h.text;toc.appendChild(a)});
}).catch(function(err){mount.innerHTML='<div class="caveat"><strong>주제 원고를 불러오지 못했습니다.</strong> '+esc(String(err))+"</div>"});
})();