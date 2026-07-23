(function () {
  "use strict";

  var script = document.currentScript;
  var siteRoot = script && script.src ? new URL("../../", script.src).href : "/biblestudygyu/";
  var DATA_ROOT = new URL("assets/data/bible/kor/", siteRoot).href;
  var MANIFEST_URL = new URL("manifest.json", DATA_ROOT).href;

  var BOOKS = [
    ["GEN","창세기","Gen","Gen.xml"],["EXO","출애굽기","Exod","Exod.xml"],["LEV","레위기","Lev","Lev.xml"],["NUM","민수기","Num","Num.xml"],["DEU","신명기","Deut","Deut.xml"],
    ["JOS","여호수아","Josh","Josh.xml"],["JDG","사사기","Judg","Judg.xml"],["RUT","룻기","Ruth","Ruth.xml"],["1SA","사무엘상","1Sam","1Sam.xml"],["2SA","사무엘하","2Sam","2Sam.xml"],
    ["1KI","열왕기상","1Kgs","1Kgs.xml"],["2KI","열왕기하","2Kgs","2Kgs.xml"],["1CH","역대상","1Chr","1Chr.xml"],["2CH","역대하","2Chr","2Chr.xml"],["EZR","에스라","Ezra","Ezra.xml"],
    ["NEH","느헤미야","Neh","Neh.xml"],["EST","에스더","Esth","Esth.xml"],["JOB","욥기","Job","Job.xml"],["PSA","시편","Ps","Ps.xml"],["PRO","잠언","Prov","Prov.xml"],
    ["ECC","전도서","Eccl","Eccl.xml"],["SNG","아가","Song","Song.xml"],["ISA","이사야","Isa","Isa.xml"],["JER","예레미야","Jer","Jer.xml"],["LAM","예레미야애가","Lam","Lam.xml"],
    ["EZK","에스겔","Ezek","Ezek.xml"],["DAN","다니엘","Dan","Dan.xml"],["HOS","호세아","Hos","Hos.xml"],["JOL","요엘","Joel","Joel.xml"],["AMO","아모스","Amos","Amos.xml"],
    ["OBA","오바댜","Obad","Obad.xml"],["JON","요나","Jonah","Jonah.xml"],["MIC","미가","Mic","Mic.xml"],["NAM","나훔","Nah","Nah.xml"],["HAB","하박국","Hab","Hab.xml"],
    ["ZEP","스바냐","Zeph","Zeph.xml"],["HAG","학개","Hag","Hag.xml"],["ZEC","스가랴","Zech","Zech.xml"],["MAL","말라기","Mal","Mal.xml"],
    ["MAT","마태복음","Matt","Matt.txt"],["MRK","마가복음","Mark","Mark.txt"],["LUK","누가복음","Luke","Luke.txt"],["JHN","요한복음","John","John.txt"],["ACT","사도행전","Acts","Acts.txt"],
    ["ROM","로마서","Rom","Rom.txt"],["1CO","고린도전서","1Cor","1Cor.txt"],["2CO","고린도후서","2Cor","2Cor.txt"],["GAL","갈라디아서","Gal","Gal.txt"],["EPH","에베소서","Eph","Eph.txt"],
    ["PHP","빌립보서","Phil","Phil.txt"],["COL","골로새서","Col","Col.txt"],["1TH","데살로니가전서","1Thess","1Thess.txt"],["2TH","데살로니가후서","2Thess","2Thess.txt"],["1TI","디모데전서","1Tim","1Tim.txt"],
    ["2TI","디모데후서","2Tim","2Tim.txt"],["TIT","디도서","Titus","Titus.txt"],["PHM","빌레몬서","Phlm","Phlm.txt"],["HEB","히브리서","Heb","Heb.txt"],["JAS","야고보서","Jas","Jas.txt"],
    ["1PE","베드로전서","1Pet","1Pet.txt"],["2PE","베드로후서","2Pet","2Pet.txt"],["1JN","요한일서","1John","1John.txt"],["2JN","요한이서","2John","2John.txt"],["3JN","요한삼서","3John","3John.txt"],
    ["JUD","유다서","Jude","Jude.txt"],["REV","요한계시록","Rev","Rev.txt"]
  ];

  var bookMap = Object.create(null);
  BOOKS.forEach(function (row, index) { bookMap[row[0]] = { code:row[0], name:row[1], sourceCode:row[2], file:row[3], testament:index < 39 ? "OT" : "NT" }; });
  var manifestPromise = null;
  var chunkCache = new Map();
  var koreanCache = new Map();
  var originalCache = new Map();

  var bookSelect = document.getElementById("or-book");
  var chapterSelect = document.getElementById("or-chapter");
  var verseInput = document.getElementById("or-verse");
  var openButton = document.getElementById("or-open");
  var prevButton = document.getElementById("or-prev");
  var nextButton = document.getElementById("or-next");
  var status = document.getElementById("or-status");
  var versesBox = document.getElementById("or-verses");
  var originalLabel = document.getElementById("or-original-label");
  var originalSource = document.getElementById("or-original-source");

  function escapeHtml(value){return String(value).replace(/[&<>\"]/g,function(ch){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[ch];});}
  function setStatus(message){status.textContent=message||"";}

  function loadManifest(){if(!manifestPromise)manifestPromise=fetch(MANIFEST_URL).then(function(r){if(!r.ok)throw new Error("성경 목록을 불러오지 못했습니다");return r.json();});return manifestPromise;}
  function decompressJson(response){if(!response.ok)throw new Error("한국어 성경 데이터를 불러오지 못했습니다");if(typeof DecompressionStream!=="function")throw new Error("최신 브라우저가 필요합니다");return new Response(response.body.pipeThrough(new DecompressionStream("gzip"))).json();}
  function loadChunk(name,manifest){if(chunkCache.has(name))return chunkCache.get(name);var p=fetch(new URL(manifest.chunks[name].path,DATA_ROOT).href).then(decompressJson);chunkCache.set(name,p);return p;}
  function loadKorean(code){if(koreanCache.has(code))return koreanCache.get(code);var p=loadManifest().then(function(m){return loadChunk(m.books[code].chunk,m);}).then(function(chunk){var data=(chunk.books||chunk)[code];if(!data)throw new Error("한국어 본문이 없습니다");return data;});koreanCache.set(code,p);return p;}

  function loadOriginal(code){
    if(originalCache.has(code))return originalCache.get(code);
    var book=bookMap[code];
    var promise;
    if(book.testament==="OT"){
      var url="https://cdn.jsdelivr.net/npm/morphhb@2.0.2/wlc/"+book.file;
      promise=fetch(url).then(function(r){if(!r.ok)throw new Error("히브리어 원문을 불러오지 못했습니다");return r.text();}).then(function(xmlText){
        var doc=new DOMParser().parseFromString(xmlText,"application/xml");
        if(doc.querySelector("parsererror"))throw new Error("히브리어 원문을 해석하지 못했습니다");
        var data={};
        doc.querySelectorAll("verse[osisID]").forEach(function(verse){
          var id=verse.getAttribute("osisID").split(".");
          var ch=Number(id[id.length-2]),v=Number(id[id.length-1]);
          var text=verse.textContent.replace(/\s+/g," ").trim();
          if(!data[ch])data[ch]={};data[ch][v]=text;
        });
        return data;
      });
    }else{
      var ntUrl="https://cdn.jsdelivr.net/gh/Faithlife/SBLGNT@master/data/sblgnt/text/"+book.file;
      promise=fetch(ntUrl).then(function(r){if(!r.ok)throw new Error("헬라어 원문을 불러오지 못했습니다");return r.text();}).then(function(text){
        var data={};
        text.split(/\r?\n/).forEach(function(line){
          var parts=line.split("\t");if(parts.length<2)return;
          var m=parts[0].match(/(\d+):(\d+)$/);if(!m)return;
          var ch=Number(m[1]),v=Number(m[2]);if(!data[ch])data[ch]={};data[ch][v]=parts.slice(1).join("\t").trim();
        });
        return data;
      });
    }
    originalCache.set(code,promise);return promise;
  }

  function params(){var p=new URLSearchParams(location.search);var code=(p.get("book")||"GEN").toUpperCase();if(!bookMap[code])code="GEN";return{code:code,chapter:Math.max(1,Number(p.get("chapter"))||1),verse:Math.max(0,Number(p.get("verse"))||0),end:Math.max(0,Number(p.get("end"))||0)};}
  function updateUrl(code,chapter,verse,end){var url=new URL(location.href);url.searchParams.set("book",code);url.searchParams.set("chapter",String(chapter));if(verse){url.searchParams.set("verse",String(verse));}else url.searchParams.delete("verse");if(end&&end!==verse)url.searchParams.set("end",String(end));else url.searchParams.delete("end");history.replaceState(null,"",url);}

  function fillBooks(){bookSelect.innerHTML=BOOKS.map(function(row,index){return(index===0?' <optgroup label="구약">':'')+(index===39?'</optgroup><optgroup label="신약">':'')+'<option value="'+row[0]+'">'+row[1]+'</option>'+(index===65?'</optgroup>':'');}).join("");}
  function fillChapters(count,current){var html="";for(var i=1;i<=count;i++)html+='<option value="'+i+'">'+i+'장</option>';chapterSelect.innerHTML=html;chapterSelect.value=String(Math.min(current,count));}

  function render(code,chapter,selected,end){
    var book=bookMap[code];
    setStatus(book.name+" "+chapter+"장을 불러오는 중입니다.");
    versesBox.innerHTML='<div class="or-empty">본문을 불러오는 중입니다.</div>';
    Promise.all([loadKorean(code),loadOriginal(code)]).then(function(values){
      var korean=values[0],original=values[1];
      var kChapter=korean.chapters[String(chapter)]||{};
      var oChapter=original[chapter]||{};
      var nums=Array.from(new Set(Object.keys(kChapter).concat(Object.keys(oChapter)).map(Number))).sort(function(a,b){return a-b;});
      if(!nums.length)throw new Error("해당 장의 본문을 찾지 못했습니다");
      originalLabel.textContent=book.testament==="OT"?"히브리어 원문":"헬라어 원문";
      originalSource.textContent=book.testament==="OT"?"WLC / OSHB":"SBLGNT";
      versesBox.innerHTML=nums.map(function(v){
        var active=selected&&v>=selected&&v<=(end||selected);
        return '<article class="or-verse-row'+(active?' is-selected':'')+'" id="verse-'+v+'">'+
          '<div class="or-cell or-original '+(book.testament==="OT"?'is-hebrew':'')+'"><span class="or-num">'+v+'</span>'+(oChapter[v]?escapeHtml(oChapter[v]):'<span class="or-missing">원문 장절 구분 확인 필요</span>')+'</div>'+
          '<div class="or-cell or-korean"><span class="or-num">'+v+'</span>'+(kChapter[String(v)]?escapeHtml(kChapter[String(v)]):'<span class="or-missing">한국어 본문 없음</span>')+'</div></article>';
      }).join("");
      setStatus(book.name+" "+chapter+"장 · "+nums.length+"절");
      if(selected){var target=document.getElementById("verse-"+selected);if(target)setTimeout(function(){target.scrollIntoView({block:"center",behavior:"smooth"});},50);}
    }).catch(function(error){setStatus(error.message);versesBox.innerHTML='<div class="or-empty">'+escapeHtml(error.message)+'</div>';});
  }

  function openCurrent(){loadManifest().then(function(manifest){var code=bookSelect.value;var max=manifest.books[code].chapters;var chapter=Math.min(Number(chapterSelect.value)||1,max);var verse=Math.max(0,Number(verseInput.value)||0);updateUrl(code,chapter,verse,0);updateControls(code,chapter,manifest);render(code,chapter,verse,0);});}
  function updateControls(code,chapter,manifest){bookSelect.value=code;fillChapters(manifest.books[code].chapters,chapter);prevButton.disabled=chapter<=1;nextButton.disabled=chapter>=manifest.books[code].chapters;}
  function shiftChapter(delta){loadManifest().then(function(manifest){var code=bookSelect.value;var chapter=Math.max(1,Math.min(manifest.books[code].chapters,(Number(chapterSelect.value)||1)+delta));chapterSelect.value=String(chapter);verseInput.value="";updateUrl(code,chapter,0,0);updateControls(code,chapter,manifest);render(code,chapter,0,0);window.scrollTo({top:0,behavior:"smooth"});});}

  fillBooks();
  loadManifest().then(function(manifest){var p=params();updateControls(p.code,p.chapter,manifest);verseInput.value=p.verse||"";render(p.code,Math.min(p.chapter,manifest.books[p.code].chapters),p.verse,p.end);});
  bookSelect.addEventListener("change",function(){loadManifest().then(function(m){fillChapters(m.books[bookSelect.value].chapters,1);verseInput.value="";openCurrent();});});
  chapterSelect.addEventListener("change",function(){verseInput.value="";openCurrent();});
  openButton.addEventListener("click",openCurrent);verseInput.addEventListener("keydown",function(e){if(e.key==="Enter")openCurrent();});
  prevButton.addEventListener("click",function(){shiftChapter(-1);});nextButton.addEventListener("click",function(){shiftChapter(1);});
})();
