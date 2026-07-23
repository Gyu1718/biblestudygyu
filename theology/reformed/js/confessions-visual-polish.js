/* Confessions / Catechisms visual enhancer
   Runs after the existing data-driven renderer and only adds presentation helpers. */
(function () {
  var TIMELINE = [
    ["고대", "사도신경", "복음의 골자"],
    ["325–451", "니케아·칼케돈", "삼위일체와 기독론 경계"],
    ["1561–1563", "벨직·하이델베르크", "개혁교회 고백과 교육"],
    ["1618–1647", "도르트·웨스트민스터", "논쟁과 표준문서"]
  ];

  var QA_SAMPLES = {
    "웨스트민스터 소요리문답": {
      ref: "WSC 1",
      q: "사람의 제일 되는 목적은 무엇입니까?",
      a: "교리교육의 출발점을 인간의 자기완성이 아니라 하나님의 영광과 하나님 안에서 누리는 기쁨으로 잡습니다."
    },
    "하이델베르크 요리문답": {
      ref: "HC 1",
      q: "살아서나 죽어서나 나의 유일한 위로는 무엇입니까?",
      a: "나 자신에게 속하지 않고 신실한 구주 예수 그리스도께 속했다는 고백에서 위로와 감사의 삶을 배웁니다."
    }
  };

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function text(selector, root) {
    var node = (root || document).querySelector(selector);
    return node ? node.textContent.trim() : "";
  }

  function kindClass(kind, title) {
    if (/교리문답|요리문답/.test(kind) || /교리문답|요리문답/.test(title)) return "catechism";
    if (/신앙고백/.test(kind)) return "confession";
    if (/도르트/.test(title)) return "synod";
    if (/신조/.test(kind)) return "definition";
    if (/신경/.test(kind)) return "creed";
    return "confession";
  }

  function sigil(kind, title) {
    if (/교리문답|요리문답/.test(kind) || /교리문답|요리문답/.test(title)) return "Q";
    if (/신앙고백/.test(kind)) return "C";
    if (/신조/.test(kind) || /도르트/.test(title)) return "D";
    if (/신경/.test(kind)) return "Cr";
    return "C";
  }

  function buttonLabel(button) {
    var nodes = Array.prototype.slice.call(button.children || []);
    var labelNode = nodes.find(function (node) {
      return !node.classList.contains("doc-sigil") && !node.classList.contains("mini");
    });
    return labelNode ? labelNode.textContent.trim() : button.textContent.trim();
  }

  function addLegend() {
    var intro = document.querySelector(".confession-intro");
    if (!intro || intro.querySelector(".confession-type-legend")) return;
    intro.insertAdjacentHTML("beforeend",
      '<div class="confession-type-legend" aria-label="문헌 유형 범례">' +
        '<span class="confession-type-pill is-creed">고대 신경</span>' +
        '<span class="confession-type-pill is-confession">신앙고백</span>' +
        '<span class="confession-type-pill is-catechism">교리문답</span>' +
        '<span class="confession-type-pill is-synod">논쟁 신조</span>' +
      '</div>'
    );
  }

  function addTimeline() {
    var wrap = document.querySelector(".confession-wrap");
    var intro = document.querySelector(".confession-intro");
    if (!wrap || !intro || wrap.querySelector(".confessional-map")) return;
    var html = TIMELINE.map(function (item) {
      return '<article class="confessional-map-step"><span class="era">' + esc(item[0]) + '</span><b>' + esc(item[1]) + '</b><p>' + esc(item[2]) + '</p></article>';
    }).join("");
    intro.insertAdjacentHTML("afterend", '<div class="confessional-map" aria-label="신앙고백 문헌 흐름">' + html + '</div>');
  }

  function classifyActiveDoc() {
    var page = document.querySelector(".confession-page");
    if (!page) return null;
    var title = text(".confession-hero h3", page).replace(text(".confession-hero .eng", page), "").trim();
    var meta = Array.prototype.slice.call(page.querySelectorAll(".confession-meta span")).map(function (node) { return node.textContent.trim(); });
    var kind = meta.length ? meta[meta.length - 1] : "";
    var klass = kindClass(kind, title);
    page.classList.remove("is-creed", "is-definition", "is-confession", "is-catechism", "is-synod");
    page.classList.add("is-" + klass);
    page.dataset.docKind = klass;
    return { title: title, kind: kind, klass: klass };
  }

  function addCatechismPrimer(info) {
    document.querySelectorAll(".catechism-primer").forEach(function (node) { node.remove(); });
    if (!info || info.klass !== "catechism") return;
    var main = document.querySelector(".confession-main");
    if (!main) return;
    var sample = QA_SAMPLES[info.title] || {
      ref: "Catechism",
      q: "이 문답은 무엇을 묻고 있습니까?",
      a: "교리문답은 추상 개념을 질문과 응답의 구조로 바꾸어, 신자가 고백하고 기억하고 가르칠 수 있게 만듭니다."
    };
    var html = '<section class="confession-section catechism-primer">' +
      '<h4>문답 형식으로 읽기</h4>' +
      '<div class="catechism-qa">' +
        '<div class="catechism-qa-row"><span class="qa-mark">Q</span><div class="qa-copy"><b>' + esc(sample.q) + '</b><p>문답은 교리를 정보가 아니라 신자가 입으로 고백할 질문으로 바꿉니다.</p></div></div>' +
        '<div class="catechism-qa-row"><span class="qa-mark">A</span><div class="qa-copy"><b>핵심 해설</b><p>' + esc(sample.a) + '</p><span class="qa-ref">' + esc(sample.ref) + '</span></div></div>' +
      '</div>' +
    '</section>';
    main.insertAdjacentHTML("afterbegin", html);
  }

  function upgradeButtons() {
    document.querySelectorAll(".confession-btn").forEach(function (button) {
      var mini = text(".mini", button);
      var label = buttonLabel(button);
      var klass = kindClass(mini, label);
      button.classList.remove("kind-creed", "kind-definition", "kind-confession", "kind-catechism", "kind-synod");
      button.classList.add("kind-" + klass);
      if (!button.querySelector(".doc-sigil")) {
        button.insertAdjacentHTML("afterbegin", '<span class="doc-sigil" aria-hidden="true">' + esc(sigil(mini, label)) + '</span>');
      }
      if (!button.dataset.visualPolishBound) {
        button.dataset.visualPolishBound = "1";
        button.addEventListener("click", function () { setTimeout(enhance, 0); });
      }
    });
  }

  function markStudyCards() {
    document.querySelectorAll(".study-card").forEach(function (card) {
      var body = card.textContent || "";
      card.classList.toggle("is-catechism-card", /WSC|HC|문답|요리문답|소요리/.test(body));
      card.classList.toggle("is-confession-card", /WCF|벨직|신앙고백/.test(body));
      card.classList.toggle("is-synod-card", /Dort|도르트|예정/.test(body));
    });
  }

  function enhance() {
    if (!document.querySelector(".confession-wrap")) return;
    addLegend();
    addTimeline();
    var info = classifyActiveDoc();
    addCatechismPrimer(info);
    upgradeButtons();
    markStudyCards();
  }

  function install() {
    if (typeof VIEWS === "undefined" || !VIEWS.confessions || VIEWS.confessions.__visualPolish) {
      enhance();
      return;
    }
    var original = VIEWS.confessions;
    var patched = function () {
      original();
      enhance();
    };
    patched.__visualPolish = true;
    VIEWS.confessions = patched;
    enhance();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", install);
  } else {
    install();
  }
  setTimeout(install, 0);
  setTimeout(install, 150);
}());
