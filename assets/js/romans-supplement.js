(function () {
  "use strict";

  if (window.__SCRIPTORIUM_ROMANS_AE__) return;
  if (!/\/nt\/romans\//i.test(location.pathname)) return;
  window.__SCRIPTORIUM_ROMANS_AE__ = true;

  var script = document.currentScript;
  var siteRoot = script && script.src
    ? new URL("../../", script.src)
    : new URL("/biblestudygyu/", location.origin);
  var PART_ROOT = new URL("tools/romans-patches/", siteRoot);
  var PART_COUNT = 7;

  var LEGEND = [
    '<span><b>자료 칩 · 직접 확인</b></span>',
    '<span><span class="c f">M</span> Moo NICNT²</span>',
    '<span><span class="c t">D</span> Dunn WBC</span>',
    '<span><span class="c h">G</span> Gaventa NTL</span>',
    '<span><span class="c k">B</span> Barth 로마서</span>',
    '<span><span class="c x">C</span> Cranfield</span>',
    '<span><span class="c x">K</span> Kruse PNTC</span>',
    '<span><span class="c x">S</span> Stott BST</span>',
    '<span><b style="margin-left:.6rem">재인용</b></span>',
    '<span><span class="c b">J</span> Jewett <span style="color:#8a8">(원본 미확보)</span></span>',
    '<span><span class="c x">L</span> Longenecker <span style="color:#8a8">(원본 미확보)</span></span>'
  ].join("\n");

  var SOURCE_STATUS = [
    '<section class="book-shelf-section" id="source-status">',
    '<div class="book-shelf-head"><div class="book-shelf-eyebrow">SOURCE STATUS</div>',
    '<h2>연구 자료의 확인 상태</h2><p>자료 칩은 직접 확인 자료와 재인용 자료를 구분한다.</p></div>',
    '<div class="book-paths">',
    '<div class="book-path"><span class="symbol">πηγή</span><span><h3>직접 확인 일곱 종</h3>',
    '<p>Cranfield·Kruse·Stott의 주해와 Moo·Dunn·Gaventa·Barth의 독법을 직접 확인해 사용한다.</p></span>',
    '<span class="go">C · K · S · M · D · G · B</span></div>',
    '<div class="book-path"><span class="symbol">παράθεσις</span><span><h3>재인용 두 종</h3>',
    '<p>Jewett과 Longenecker는 원본 미확보 상태이므로 직접 확인 자료가 인용한 범위에서만 사용한다.</p></span>',
    '<span class="go">J · L</span></div></div></section>'
  ].join("");

  var B_MARKS = { 1: "B-01", 3: "B-03", 5: "B-05", 7: "B-07", 8: "B-08", 9: "B-09", 11: "B-11" };
  var D_MARKS = { 2: "D-02", 4: "D-04", 6: "D-06", 10: "D-10", 12: "D-12", 13: "D-13", 14: "D-14", 15: "D-15", 16: "D-16" };
  var E_MARKS = {
    "E-12a": [12, "12:1-2", ["λογικὴν λατρείαν — 개역개정의 선택", "제의 언어의 이주"]],
    "E-12b": [12, "12:3-8", ["세 목록의 관계"]],
    "E-13a": [13, "13:1-5", ['두 개의 "하나님의 사역자"', '4절의 "칼"']],
    "E-14a": [14, "14:13-23", ["14:23의 사정거리", "옳은 쪽에게 요구되는 양보"]],
    "E-15a": [15, "15:14-21", ["제사장 직분이라는 자기 이해", "예루살렘 연보의 무게"]],
    "E-16a": [16, "16:1-2", ["뵈뵈의 두 낱말", "명단이 증명하는 것"]]
  };

  function pageName() {
    return location.pathname.split("/").pop() || "index.html";
  }

  function chapterNumber() {
    var match = pageName().match(/^ch(\d{2})\.html$/i);
    return match ? Number(match[1]) : 0;
  }

  function bytesFromBase64(value) {
    var clean = String(value || "").replace(/\s+/g, "");
    var raw = atob(clean);
    var bytes = new Uint8Array(raw.length);
    for (var i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i);
    return bytes;
  }

  function findEocd(view) {
    for (var i = view.byteLength - 22; i >= Math.max(0, view.byteLength - 65557); i -= 1) {
      if (view.getUint32(i, true) === 0x06054b50) return i;
    }
    throw new Error("ZIP 중앙 디렉터리를 찾지 못했습니다.");
  }

  async function inflateRaw(bytes) {
    if (typeof DecompressionStream !== "function") {
      throw new Error("이 브라우저는 로마서 보완 자료 압축 해제를 지원하지 않습니다.");
    }
    var stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }

  async function unzip(bytes) {
    var view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    var eocd = findEocd(view);
    var count = view.getUint16(eocd + 10, true);
    var offset = view.getUint32(eocd + 16, true);
    var decoder = new TextDecoder("utf-8");
    var files = Object.create(null);

    for (var index = 0; index < count; index += 1) {
      if (view.getUint32(offset, true) !== 0x02014b50) throw new Error("잘못된 ZIP 중앙 헤더입니다.");
      var method = view.getUint16(offset + 10, true);
      var compressedSize = view.getUint32(offset + 20, true);
      var nameLength = view.getUint16(offset + 28, true);
      var extraLength = view.getUint16(offset + 30, true);
      var commentLength = view.getUint16(offset + 32, true);
      var localOffset = view.getUint32(offset + 42, true);
      var name = decoder.decode(bytes.subarray(offset + 46, offset + 46 + nameLength));

      if (view.getUint32(localOffset, true) !== 0x04034b50) throw new Error("잘못된 ZIP 로컬 헤더입니다.");
      var localNameLength = view.getUint16(localOffset + 26, true);
      var localExtraLength = view.getUint16(localOffset + 28, true);
      var dataStart = localOffset + 30 + localNameLength + localExtraLength;
      var compressed = bytes.subarray(dataStart, dataStart + compressedSize);
      var output;
      if (method === 0) output = compressed.slice();
      else if (method === 8) output = await inflateRaw(compressed);
      else throw new Error("지원하지 않는 ZIP 압축 방식: " + method);
      files[name] = decoder.decode(output);
      offset += 46 + nameLength + extraLength + commentLength;
    }
    return files;
  }

  function findFile(files, prefix) {
    var names = Object.keys(files);
    for (var i = 0; i < names.length; i += 1) {
      if (names[i].indexOf(prefix) === 0) return files[names[i]];
    }
    throw new Error("패치 파일을 찾지 못했습니다: " + prefix);
  }

  function sliceBlock(text, mark, allMarks) {
    var marker = text.indexOf(mark);
    if (marker < 0) return "";
    var start = text.indexOf("-->", marker);
    start = text.indexOf("\n", start) + 1;
    var end = text.length;
    allMarks.forEach(function (other) {
      if (other === mark) return;
      var found = text.indexOf(other, start);
      if (found > 0 && found < end) end = found;
    });
    var segment = text.slice(start, end).split(/\n<!-- [═\-]/)[0];
    return segment.trim();
  }

  function fragment(htmlText) {
    var template = document.createElement("template");
    template.innerHTML = String(htmlText || "").trim();
    return template.content;
  }

  function addNavLink(afterSelector, href, label) {
    var toc = document.querySelector("nav.toc");
    if (!toc || toc.querySelector('a[href="' + href + '"]')) return;
    var anchor = toc.querySelector(afterSelector);
    var link = document.createElement("a");
    link.className = "lv1";
    link.href = href;
    link.textContent = label;
    if (anchor) anchor.insertAdjacentElement("afterend", link);
    else toc.appendChild(link);
  }

  function normalizeLegend() {
    document.querySelectorAll(".legend").forEach(function (node) {
      var text = node.textContent || "";
      if (/주석 칩|자료 칩/.test(text)) node.innerHTML = LEGEND;
    });
  }

  function applyIndex() {
    if (document.getElementById("source-status")) return;
    var footer = document.querySelector(".book-shelf-footer, footer");
    if (footer) footer.insertAdjacentHTML("beforebegin", SOURCE_STATUS);
  }

  function replaceRow(row, htmlText) {
    var template = document.createElement("template");
    template.innerHTML = '<table><tbody>' + htmlText + '</tbody></table>';
    var rows = template.content.querySelectorAll("tr");
    rows.forEach(function (newRow) { row.parentNode.insertBefore(newRow, row); });
    row.remove();
  }

  function applyOverview() {
    document.querySelectorAll("h3").forEach(function (node) {
      if ((node.textContent || "").indexOf("주석 스파인 — 다섯 축") !== -1) node.textContent = "연구 자료 — 직접 확인 일곱 종";
    });
    document.querySelectorAll("p").forEach(function (node) {
      var text = (node.textContent || "").replace(/\s+/g, " ").trim();
      if (text.indexOf("느헤미야·학개에서 쓴 다섯 색 슬롯") === 0) {
        node.innerHTML = '이 편지는 주석 전통이 워낙 두꺼워, 서로 다른 방법론이 같은 본문에서 다른 결론에 이르는 일이 잦다. 그래서 자료를 <strong>두 층</strong>으로 나눠 쓴다. 절 단위 해설을 떠받치는 <em>주해 저층</em>(Cranfield·Kruse·Stott)과, 해석 지형의 갈림을 드러내는 <em>방법 축</em>(Moo·Dunn·Gaventa·Barth)이다. 아래 일곱 종은 원본을 직접 확인했고, Jewett·Longenecker는 원본을 확보하지 못해 재인용으로만 표기한다. 색 슬롯은 느헤미야·학개와 같은 것을 유지한다.';
      }
    });
    document.querySelectorAll("caption").forEach(function (node) {
      if ((node.textContent || "").indexOf("표 1. 로마서 주석 스파인") !== -1) node.textContent = "표 1. 로마서 연구 자료와 각 주석의 방법";
    });
    document.querySelectorAll("tr").forEach(function (row) {
      var text = (row.textContent || "").replace(/\s+/g, " ");
      if (text.indexOf("Jewett, Romans") !== -1) {
        replaceRow(row, [
          '<tr><td class="head"><span class="c x">C</span></td><td>Cranfield, <i>Romans: A Shorter Commentary</i> (1985)</td><td>ICC 두 권을 저자 자신이 축약한 판. 문법과 구문을 조밀하게 따지고 대안 독법을 번호로 나열한 뒤 판단한다. 이 서가의 <strong>절 단위 해설을 가장 많이 떠받치는 층</strong>이다.</td></tr>',
          '<tr><td class="head"><span class="c x">K</span></td><td>Kruse, <i>Paul\'s Letter to the Romans</i> (PNTC, 2012)</td><td>균형 잡힌 중급 주해. 단락마다 "추가 노트"를 두어 쟁점을 따로 정리하며, 새 관점 논쟁에서 어느 한쪽에 서지 않고 양쪽 논거를 나란히 보여 준다.</td></tr>',
          '<tr><td class="head"><span class="c x">S</span></td><td>Stott, <i>The Message of Romans</i> (BST, 1994)</td><td>강해와 목회 적용. 본문의 논지 흐름을 설교 가능한 단위로 재구성하고, 20세기의 구체적 사례를 끌어와 수용의 현장을 보여 준다.</td></tr>'
        ].join(""));
      } else if (text.indexOf("Longenecker") !== -1 && text.indexOf("Kruse") !== -1 && text.indexOf("Cranfield") !== -1) {
        replaceRow(row, '<tr><td class="head"><span class="c b">J</span> <span class="c x">L</span></td><td>Jewett(Hermeneia, 2007) · Longenecker(NIGTC, 2016)</td><td><strong>재인용.</strong> 원본을 확보하지 못해 위 일곱 종이 인용한 범위에서만 표기한다. Jewett은 로마서를 서바나 선교 후원을 구하는 대사적 서신으로 읽는 사회사·수사학 연구이고, Longenecker는 그리스어 본문과 구조를 다루는 NIGTC 주석이다.</td></tr>');
      }
    });
    var footer = document.querySelector("footer");
    if (footer) {
      footer.innerHTML = footer.innerHTML
        .replace("Moo(NICNT² 2018)·Dunn(WBC 1988)·Gaventa(NTL 2024)·Barth(1933 영역)·Stott(BST) 직접 확인분.", "Moo(NICNT² 2018)·Dunn(WBC 38A·38B 1988)·Gaventa(NTL 2024)·Barth(1933 영역)·Cranfield(Shorter)·Kruse(PNTC 2012)·Stott(BST 1994) 직접 확인분.")
        .replace("Käsemann·Sanders·Wright·Martyn·Kümmel·Bornkamm·L.&nbsp;T.&nbsp;Johnson·Cremer·Ziesler·Lightfoot·Gamble은 재인용으로 표기.", "Jewett·Longenecker·Käsemann·Sanders·Wright·Martyn·Kümmel·Bornkamm·L.&nbsp;T.&nbsp;Johnson·Cremer·Ziesler·Lightfoot·Gamble은 재인용으로 표기.");
    }
  }

  function findCrossReferenceSection() {
    var sections = document.querySelectorAll("section.part");
    for (var i = 0; i < sections.length; i += 1) {
      var eye = sections[i].querySelector(".eyebrow");
      if (eye && /CROSS-REFERENCES/i.test(eye.textContent || "")) return sections[i];
    }
    return null;
  }

  function applyB(chapter, text) {
    var mark = B_MARKS[chapter];
    var section = document.getElementById("sc");
    if (!mark || !section || (section.textContent || "").indexOf("바르트의 독법") !== -1) return;
    var block = sliceBlock(text, mark, Object.keys(B_MARKS).map(function (key) { return B_MARKS[key]; }));
    if (block) section.appendChild(fragment(block));
  }

  function applyD(chapter, text) {
    var mark = D_MARKS[chapter];
    if (!mark || document.getElementById("sc")) return;
    var block = sliceBlock(text, mark, Object.keys(D_MARKS).map(function (key) { return D_MARKS[key]; }));
    var cross = findCrossReferenceSection();
    if (!block || !cross) return;
    cross.parentNode.insertBefore(fragment(block), cross);
    addNavLink('a[href="#' + cross.id + '"]', "#sc", "주석별 독법");
  }

  function applyC(chapter, text) {
    if (chapter !== 13 || document.getElementById("sr")) return;
    var parsed = new DOMParser().parseFromString(text, "text/html");
    var section = parsed.getElementById("sr");
    var cross = document.getElementById("s5") || findCrossReferenceSection();
    if (!section || !cross) return;
    cross.parentNode.insertBefore(document.importNode(section, true), cross);
    addNavLink('a[href="#s4"]', "#sr", "보론. 로마서 13장 수용사");
  }

  function normalizeRef(value) {
    return String(value || "").replace(/[–—−]/g, "-").replace(/\s+/g, "");
  }

  function eBlock(text, mark) {
    var re = new RegExp("<!--(?:(?!-->).)*" + mark.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?:(?!-->).)*-->\\s*([\\s\\S]*?)(?=\\n<!--[^>]*E-|$)");
    var match = text.match(re);
    return match ? match[1].trim() : "";
  }

  function findVerseBlock(target) {
    var normalized = normalizeRef(target);
    var start = normalized.split("-")[0];
    var fallback = null;
    var nodes = document.querySelectorAll(".vs");
    for (var i = 0; i < nodes.length; i += 1) {
      var text = normalizeRef(nodes[i].textContent);
      if (text.indexOf(normalized) !== -1) return nodes[i];
      if (!fallback && text.indexOf(start) !== -1) fallback = nodes[i];
    }
    return fallback;
  }

  function applyE(chapter, text) {
    Object.keys(E_MARKS).forEach(function (mark) {
      var spec = E_MARKS[mark];
      if (spec[0] !== chapter) return;
      var titles = spec[2];
      var already = titles.every(function (title) { return document.body.textContent.indexOf(title) !== -1; });
      if (already) return;
      var target = findVerseBlock(spec[1]);
      var block = eBlock(text, mark);
      if (target && block) target.appendChild(fragment(block));
    });
  }

  async function loadPatchFiles() {
    var requests = [];
    for (var i = 0; i < PART_COUNT; i += 1) {
      var name = "payload.part" + String(i).padStart(2, "0") + ".b64";
      requests.push(fetch(new URL(name, PART_ROOT), { credentials: "same-origin" }).then(function (response) {
        if (!response.ok) throw new Error("로마서 패치 데이터를 불러오지 못했습니다: " + response.status);
        return response.text();
      }));
    }
    var joined = (await Promise.all(requests)).join("");
    return unzip(bytesFromBase64(joined));
  }

  async function apply() {
    var file = pageName();
    if (!/^(?:index|overview|ch\d{2})\.html$/i.test(file)) return;
    var files = await loadPatchFiles();
    if (file === "index.html") applyIndex();
    else if (file === "overview.html") applyOverview();
    else {
      var chapter = chapterNumber();
      normalizeLegend();
      applyB(chapter, findFile(files, "PATCH-B-"));
      applyD(chapter, chapter <= 10 ? findFile(files, "PATCH-D1-") : findFile(files, "PATCH-D2-"));
      applyC(chapter, findFile(files, "PATCH-C-"));
      applyE(chapter, findFile(files, "PATCH-E-"));
    }
    document.documentElement.dataset.romansSupplement = "applied";
    document.dispatchEvent(new CustomEvent("romans:supplement-ready", { detail: { page: file } }));
    if (location.hash) {
      var target = document.getElementById(location.hash.slice(1));
      if (target) requestAnimationFrame(function () { target.scrollIntoView(); });
    }
  }

  apply().catch(function (error) {
    document.documentElement.dataset.romansSupplement = "error";
    console.error("[Romans A–E supplement]", error);
  });
})();
