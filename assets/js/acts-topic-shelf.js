(function(){"use strict";
if(!document.body||!document.body.classList.contains("book-shelf-page")||!/\/nt\/acts\/(?:index\.html)?$/.test(location.pathname))return;
if(document.getElementById("acts-topic-studies"))return;
var sec=document.createElement("section");sec.className="book-shelf-section";sec.id="acts-topic-studies";
sec.innerHTML='<div class="book-shelf-head"><div class="book-shelf-eyebrow">CROSS-THEMATIC STUDIES</div><h2>횡단 주제 연구</h2><p>장별 주해에 흩어진 논지를 사도행전 전체의 흐름으로 다시 묶어 읽는다.</p></div><div class="book-chapter-list"><article class="book-chapter-row"><span class="no">①</span><span class="original">Πνεῦμα καὶ λόγος</span><span><h3>성령과 말씀의 전진</h3><p>경계를 넘을 때 집중되는 성령의 사역과 다섯 차례 말씀 전진 후렴을 함께 추적한다.</p></span><span class="book-actions"><a href="topic01-spirit-word.html">주제 연구 열기</a></span></article><article class="book-chapter-row"><span class="no">②</span><span class="original">λόγοι καὶ ἀπολογία</span><span><h3>연설과 변증</h3><p>주요 연설의 고정된 케리그마와 청중별 변주, 로마 관리들의 판단을 통한 누가의 변증을 정리한다.</p></span><span class="book-actions"><a href="topic02-speeches-apologetic.html">주제 연구 열기</a></span></article></div></section>';
var chapters=document.getElementById("chapters"),research=document.getElementById("research-shelf");
if(chapters&&chapters.parentNode)chapters.parentNode.insertBefore(sec,chapters);else if(research)research.insertAdjacentElement("afterend",sec);
})();