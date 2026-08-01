(function(){"use strict";
var body=document.body;if(!body||body.getAttribute("data-book")!=="acts"||body.getAttribute("data-kind")!=="study")return;
var chapter=parseInt(body.getAttribute("data-chapter")||"0",10);if(!chapter)return;
var FILES=[];
if(chapter<=7)FILES.push("sources/supp_ch01-07.md");
if(chapter===4||chapter===5||(chapter>=8&&chapter<=15))FILES.push("sources/supp_ch08-15.md");
if(chapter>=10&&chapter<=19)FILES.push("sources/supp_ch10-19.md");
if(chapter>=20&&chapter<=28)FILES.push("sources/supp_ch20-28.md");
if(!FILES.length)return;

function esc(s){return String(s||"").replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function inline(s){
  s=String(s||"");
  var stash=[];
  s=s.replace(/<[^>]+>/g,function(x){stash.push(x);return"\u0000"+(stash.length-1)+"\u0000"});
  s=esc(s);
  s=s.replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>")
     .replace(/`([^`]+)`/g,"<code>$1</code>")
     .replace(/\*([^*]+)\*/g,"<em>$1</em>");
  return s.replace(/\u0000(\d+)\u0000/g,function(_,i){return stash[+i]||""});
}
function renderMarkdown(md){
  var lines=String(md||"").replace(/\r/g,"").split("\n"),out=[],i=0,para=[];
  function flush(){if(para.length){out.push("<p>"+inline(para.join(" "))+"</p>");para=[]}}
  function isSep(line){return /^\s*\|?(?:\s*:?-+:?\s*\|)+\s*:?-+:?\s*\|?\s*$/.test(line)}
  while(i<lines.length){
    var line=lines[i],trim=line.trim();
    if(!trim){flush();i++;continue}
    if(/^---+$/.test(trim)){flush();out.push("<hr>");i++;continue}
    var h=trim.match(/^(#{2,5})\s+(.+)$/);
    if(h){flush();out.push("<h"+h[1].length+">"+inline(h[2])+"</h"+h[1].length+">");i++;continue}
    if(/^>\s?/.test(trim)){flush();var q=[];while(i<lines.length&&/^>\s?/.test(lines[i].trim()))q.push(lines[i++].trim().replace(/^>\s?/,""));out.push("<blockquote>"+q.map(function(x){return inline(x)}).join("<br>")+"</blockquote>");continue}
    if(trim.indexOf("|")>=0&&i+1<lines.length&&isSep(lines[i+1])){
      flush();var rows=[trim];i+=2;while(i<lines.length&&lines[i].trim().indexOf("|")>=0&&lines[i].trim())rows.push(lines[i++].trim());
      function cells(r){return r.replace(/^\||\|$/g,"").split("|").map(function(x){return x.trim()})}
      var head=cells(rows.shift());out.push('<div class="tbl-wrap" tabindex="0" role="region" aria-label="보완 연구 표"><table><thead><tr>'+head.map(function(x){return"<th>"+inline(x)+"</th>"}).join("")+"</tr></thead><tbody>");
      rows.forEach(function(r){out.push("<tr>"+cells(r).map(function(x){return"<td>"+inline(x)+"</td>"}).join("")+"</tr>")});out.push("</tbody></table></div>");continue
    }
    var li=trim.match(/^[-*]\s+(.+)$/);
    if(li){flush();var ls=[];while(i<lines.length&&(li=lines[i].trim().match(/^[-*]\s+(.+)$/))){ls.push(li[1]);i++}out.push("<ul>"+ls.map(function(x){return"<li>"+inline(x)+"</li>"}).join("")+"</ul>");continue}
    var ol=trim.match(/^\d+\.\s+(.+)$/);
    if(ol){flush();var os=[];while(i<lines.length&&(ol=lines[i].trim().match(/^\d+\.\s+(.+)$/))){os.push(ol[1]);i++}out.push("<ol>"+os.map(function(x){return"<li>"+inline(x)+"</li>"}).join("")+"</ol>");continue}
    para.push(trim);i++;
  }
  flush();return out.join("");
}
function parseFile(text,source){
  var lines=String(text||"").replace(/\r/g,"").split("\n"),items=[],marker=null,buf=[];
  function flush(){
    if(!marker)return;var m=marker.match(/삽입 위치:\s*(\d+)장/);if(!m||+m[1]!==chapter){marker=null;buf=[];return}
    var sm=marker.match(/§\s*(\d+)/),pm=marker.match(/\(([^)]+)\)/),label=pm?pm[1].trim():(/부록/.test(marker)?"부록":null);
    var content=buf.join("\n").trim();if(content)items.push({chapter:chapter,marker:marker.replace(/^###\s*▸\s*삽입 위치:\s*/,"").trim(),section:sm?+sm[1]:null,label:label,html:renderMarkdown(content),source:source});
    marker=null;buf=[];
  }
  lines.forEach(function(line){
    if(/^###\s*▸\s*삽입 위치:/.test(line)){flush();marker=line;buf=[]}
    else if(/^##\s+/.test(line)&&!/^###/.test(line)){flush()}
    else if(marker)buf.push(line);
  });flush();return items;
}
function norm(s){return String(s||"").toLowerCase().replace(/[\s·:：()（）"'’“”〈〉《》\-—–_.]/g,"")}
function level(el){return /^H[1-6]$/.test(el.tagName)?parseInt(el.tagName.slice(1),10):6}
function findHeading(item){
  var hs=[].slice.call(document.querySelectorAll("main h2,main h3,main h4,.part-head h2,.part-head h3")),label=norm(item.label);
  if(label){var exact=hs.find(function(h){var t=norm(h.textContent);return t.indexOf(label)>=0||label.indexOf(t)>=0});if(exact)return exact}
  if(item.section){var rx=new RegExp("^"+item.section+"(?:\\.|\\s|장|§)");var sec=hs.find(function(h){return rx.test(String(h.textContent||"").trim())});if(sec)return sec}
  if(item.label==="부록")return hs.find(function(h){return/부록/.test(h.textContent)});
  return null;
}
function sectionEnd(h){
  if(!h)return null;var lvl=level(h),n=h.nextElementSibling;
  while(n){if(/^H[1-6]$/.test(n.tagName)&&level(n)<=lvl)return n;if(n.classList&&/(chapter-pager|chapter-footer-nav)/.test(n.className))return n;n=n.nextElementSibling}return null;
}
function mount(item,index){
  var id="acts-supp-"+String(chapter).padStart(2,"0")+"-"+String(index+1).padStart(2,"0");if(document.getElementById(id))return;
  var box=document.createElement("aside");box.id=id;box.className="acts-supplement";box.setAttribute("aria-label","사도행전 "+chapter+"장 추가 보완 연구");
  box.innerHTML='<div class="acts-supplement-kicker">ADDITIONAL RESEARCH · 추가 보완</div><div class="acts-supplement-location">'+esc(item.marker)+'</div><div class="acts-supplement-body">'+item.html+'</div><div class="acts-supplement-source"><a href="'+esc(item.source)+'">원고 Markdown 보기</a></div>';
  var h=findHeading(item),part=h&&h.closest?h.closest("section.part"):null,boundary=sectionEnd(h);
  if(part){var tail=[].slice.call(part.children).find(function(x){return x.classList&&x.classList.contains("back")});part.insertBefore(box,tail||null)}
  else if(boundary)boundary.parentNode.insertBefore(box,boundary);
  else{var pager=document.querySelector("main .chapter-pager,main .chapter-footer-nav");if(pager)pager.parentNode.insertBefore(box,pager);else(document.querySelector("main")||document.body).appendChild(box);box.classList.add("acts-supplement-fallback")}
  var title=box.querySelector("h2,h3,h4");if(!title){title=document.createElement("h3");title.textContent="추가 보완 연구";box.querySelector(".acts-supplement-body").prepend(title)}
  title.id=id+"-title";
  var toc=document.querySelector("nav.toc .toc-links,nav.toc .acts-toc,nav.toc");if(toc){var a=document.createElement("a");a.href="#"+title.id;a.className="lv1 supplement-link";a.textContent="보완 · "+title.textContent.replace(/^쟁점\s*\d+\s*/,"").trim();toc.appendChild(a)}
}
Promise.all(FILES.map(function(file){return fetch(file+"?v=20260801.7").then(function(r){if(!r.ok)throw new Error(file+" "+r.status);return r.text()}).then(function(t){return parseFile(t,file)})}))
.then(function(groups){var all=[];groups.forEach(function(g){all=all.concat(g)});all.forEach(mount)})
.catch(function(err){console.warn("Acts supplements unavailable",err)});
})();