/* Confessions & Catechisms study page
   Public archive rule: store summaries, indices, study cards, and citation locations only. */
(function () {
  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  var DOCS = [
    {
      id: "wsc",
      title: "웨스트민스터 소요리문답",
      englishTitle: "Westminster Shorter Catechism",
      type: "교리문답",
      family: "웨스트민스터 표준문서",
      period: "1647",
      tradition: "개혁파 정통",
      origin: "영국·스코틀랜드 개혁파 전통",
      summary: "기독교 신앙의 핵심을 짧은 문답 형식으로 압축한 교리 교육 문서입니다. 하나님, 인간, 죄, 그리스도, 구원, 십계명, 성례, 기도까지 신앙의 기본 골격을 학습하기 좋게 배열합니다.",
      researchUse: "설교 교리문, 새가족·청소년 교리교육, 조직신학 입문 색인, 개념 비교 카드의 기준 문서로 쓰기 좋습니다.",
      structure: [
        { range: "문 1–3", title: "인간의 목적과 계시의 규범", note: "인간의 제일 되는 목적, 성경의 가르침, 신앙과 의무의 기본 구조." },
        { range: "문 4–38", title: "믿을 것", note: "하나님, 삼위일체, 작정, 창조, 섭리, 타락, 언약, 그리스도, 구원의 적용." },
        { range: "문 39–81", title: "행할 것", note: "도덕법과 십계명 해설. 신앙을 윤리적 응답과 연결합니다." },
        { range: "문 82–107", title: "은혜의 방편", note: "죄의 문제, 믿음과 회개, 말씀·성례·기도, 주기도문 해설." }
      ],
      features: ["짧은 암기 단위", "설교 적용에 유리", "십계명·주기도문 학습", "교리 입문용"],
      linkedTopics: ["하나님의 목적", "성경론", "삼위일체", "그리스도의 직분", "칭의", "성화", "성례", "기도"]
    },
    {
      id: "heidelberg",
      title: "하이델베르크 요리문답",
      englishTitle: "Heidelberg Catechism",
      type: "교리문답",
      family: "독일 개혁파 요리문답",
      period: "1563",
      tradition: "개혁파 정통",
      origin: "팔츠 개혁교회 전통",
      summary: "신자의 유일한 위로에서 출발하여 죄와 비참, 구원, 감사의 삶으로 이어지는 목회적 교리문답입니다. 지식 전달보다 신자의 고백과 위로, 경건 형성을 강하게 지향합니다.",
      researchUse: "교리와 경건, 교리교육과 목회적 위로를 연결할 때 특히 유용합니다. 설교 적용, 청년 교리반, 신앙고백형 카드 제작에 적합합니다.",
      structure: [
        { range: "문 1–2", title: "유일한 위로와 세 가지 지식", note: "나의 비참, 구원, 감사의 구조를 제시합니다." },
        { range: "문 3–11", title: "죄와 비참", note: "율법을 통해 인간의 죄와 심판 아래 있는 상태를 드러냅니다." },
        { range: "문 12–85", title: "구원", note: "그리스도, 믿음, 사도신경, 칭의, 성례, 교회의 권징을 다룹니다." },
        { range: "문 86–129", title: "감사", note: "선행, 십계명, 회개, 주기도문을 감사의 삶으로 배열합니다." }
      ],
      features: ["목회적 문체", "위로 중심", "죄-구원-감사 구조", "사도신경·십계명·주기도문 해설"],
      linkedTopics: ["위로", "죄", "믿음", "칭의", "감사", "십계명", "주기도문"]
    },
    {
      id: "wcf",
      title: "웨스트민스터 신앙고백서",
      englishTitle: "Westminster Confession of Faith",
      type: "신앙고백",
      family: "웨스트민스터 표준문서",
      period: "1646",
      tradition: "개혁파 정통",
      origin: "영국·스코틀랜드 개혁파 전통",
      summary: "성경, 하나님, 작정, 창조, 섭리, 타락, 언약, 그리스도, 구원 적용, 교회, 성례, 국가, 종말을 장별로 배열한 개혁파 정통 교의 체계입니다.",
      researchUse: "조직신학의 교리 순서를 잡거나, 개념 비교 페이지에서 개혁파 정통의 표준 입장을 대표시키기에 좋습니다.",
      structure: [
        { range: "1장", title: "성경", note: "계시, 정경, 영감, 권위, 명료성, 해석 원리를 다룹니다." },
        { range: "2–5장", title: "하나님과 사역", note: "하나님, 삼위일체, 작정, 창조, 섭리를 다룹니다." },
        { range: "6–8장", title: "죄, 언약, 중보자", note: "타락과 언약 구조, 그리스도의 중보 사역을 연결합니다." },
        { range: "9–18장", title: "구원의 적용", note: "자유의지, 부르심, 칭의, 양자, 성화, 믿음, 회개, 선행, 견인을 다룹니다." },
        { range: "19–33장", title: "법, 교회, 성례, 종말", note: "도덕법, 예배, 교회, 성례, 권징, 국가, 결혼, 죽음과 심판을 다룹니다." }
      ],
      features: ["교의학 체계", "장별 색인화 용이", "개혁파 정통 기준점", "논쟁 주제 연결에 적합"],
      linkedTopics: ["성경론", "하나님의 작정", "언약신학", "그리스도론", "칭의", "성화", "교회론", "종말론"]
    },
    {
      id: "belgic",
      title: "벨직 신앙고백서",
      englishTitle: "Belgic Confession",
      type: "신앙고백",
      family: "세 일치 신조",
      period: "1561",
      tradition: "개혁파 정통",
      origin: "네덜란드 개혁교회 전통",
      summary: "박해 상황 속에서 개혁교회의 신앙을 변증적으로 제시한 신앙고백입니다. 성경, 삼위일체, 창조와 섭리, 타락, 그리스도, 칭의, 교회, 성례, 국가, 종말을 간결하게 다룹니다.",
      researchUse: "개혁교회의 공교회성, 참 교회 표지, 성례와 교회 질서를 비교할 때 유용합니다.",
      structure: [
        { range: "1–7조", title: "하나님과 성경", note: "하나님 인식, 계시, 정경과 성경의 충족성을 다룹니다." },
        { range: "8–13조", title: "삼위일체·창조·섭리", note: "삼위일체와 창조, 섭리, 천사와 악의 문제를 다룹니다." },
        { range: "14–26조", title: "인간·그리스도·구원", note: "타락, 원죄, 선택, 성육신, 만족, 칭의, 중보를 다룹니다." },
        { range: "27–35조", title: "교회와 성례", note: "보편 교회, 참 교회 표지, 직분, 세례와 성찬을 다룹니다." },
        { range: "36–37조", title: "국가와 종말", note: "시민 정부와 최후 심판을 다룹니다." }
      ],
      features: ["변증적 성격", "교회론 강점", "세 일치 신조", "간결한 조항 구조"],
      linkedTopics: ["성경의 충족성", "삼위일체", "선택", "칭의", "참 교회", "성례", "국가", "최후 심판"]
    },
    {
      id: "dort",
      title: "도르트 신조",
      englishTitle: "Canons of Dort",
      type: "신조",
      family: "세 일치 신조",
      period: "1618–1619",
      tradition: "개혁파 정통",
      origin: "도르트 총회",
      summary: "알미니우스주의 논쟁에 응답하여 하나님의 선택, 그리스도의 죽음, 인간의 부패, 회심, 성도의 견인을 논증한 개혁파 구원론 문서입니다.",
      researchUse: "예정론, 속죄론, 은혜론, 견인 교리를 논쟁사와 함께 정리할 때 적합합니다.",
      structure: [
        { range: "제1교리", title: "하나님의 선택과 유기", note: "구원의 궁극 근거가 하나님의 은혜로운 선택에 있음을 밝힙니다." },
        { range: "제2교리", title: "그리스도의 죽음과 구속", note: "그리스도의 속죄의 충분성과 구원 효력을 구분해 설명합니다." },
        { range: "제3·4교리", title: "인간의 부패와 회심", note: "전적 부패와 효과적 은혜, 성령의 내적 사역을 다룹니다." },
        { range: "제5교리", title: "성도의 견인", note: "참 신자가 하나님의 보존하심으로 믿음 안에 견딤을 설명합니다." }
      ],
      features: ["논쟁 문서", "구원론 집중", "예정론 색인", "TULIP 비교에 유용"],
      linkedTopics: ["예정", "속죄", "전적 부패", "효과적 부르심", "견인", "은혜"]
    }
  ];

  var STUDY_CARDS = [
    {
      id: "chief-end",
      title: "인간의 제일 되는 목적",
      kind: "암기 카드",
      anchor: "WSC 1",
      summary: "인간은 하나님을 영화롭게 하고 하나님을 영원토록 즐거워하도록 지음받았습니다.",
      front: "사람의 제일 되는 목적은 무엇인가?",
      back: "하나님 중심의 목적론입니다. 인간의 삶은 자기완성이나 효율이 아니라, 하나님의 영광과 하나님 안에서의 기쁨을 향합니다.",
      doctrine: ["창조 목적", "인간론", "예배", "소명"],
      compare: "하이델베르크가 ‘위로’에서 시작한다면, 소요리문답은 ‘목적’에서 시작합니다. 둘 다 인간의 자기소유를 부정하고 하나님께 속한 삶을 말합니다."
    },
    {
      id: "only-comfort",
      title: "살아서나 죽어서나 유일한 위로",
      kind: "고백 카드",
      anchor: "HC 1",
      summary: "신자는 자기 자신에게 속하지 않고, 신실한 구주 예수 그리스도께 속했다는 사실에서 위로를 얻습니다.",
      front: "나의 유일한 위로는 무엇인가?",
      back: "위로의 근거는 감정의 안정이 아니라 소속의 전환입니다. 나는 나의 것이 아니라 그리스도의 것입니다.",
      doctrine: ["그리스도와의 연합", "구원의 확신", "위로", "목회"],
      compare: "웨스트민스터가 교리 체계의 골격을 선명하게 잡는다면, 하이델베르크는 같은 교리를 신자의 고백과 위로의 언어로 배열합니다."
    },
    {
      id: "scripture-rule",
      title: "성경의 규범성",
      kind: "개념 카드",
      anchor: "WCF 1; Belgic 3–7; WSC 2–3",
      summary: "성경은 하나님을 영화롭게 하고 구원에 이르는 데 필요한 신앙과 삶의 규범을 충분히 가르칩니다.",
      front: "교리는 무엇에 의해 판단되는가?",
      back: "교회의 전통, 신자의 경험, 신학자의 체계는 모두 성경 아래 있습니다. 고백서는 성경을 대체하지 않고 성경의 가르침을 요약합니다.",
      doctrine: ["성경론", "정경", "권위", "해석"],
      compare: "개념비교 페이지의 ‘계시론·성경론’과 직접 연결됩니다. 신앙고백 문서는 성경의 권위를 전제하고 교리를 정리합니다."
    },
    {
      id: "trinity",
      title: "한 하나님, 세 위격",
      kind: "교리 카드",
      anchor: "WCF 2; HC 24–25; Belgic 8–9",
      summary: "개혁파 고백은 한 본질 안에 성부·성자·성령 세 위격이 계신다는 정통 삼위일체 신앙을 고백합니다.",
      front: "삼위일체는 왜 교리의 중심인가?",
      back: "창조, 구원, 성화, 예배는 모두 삼위 하나님의 사역으로 이해됩니다. 삼위일체는 추상 명제가 아니라 복음의 문법입니다.",
      doctrine: ["삼위일체", "신론", "기독론", "성령론"],
      compare: "바르트의 계시론적 삼위일체 배열과 비교할 때, 고백문서는 니케아-칼케돈 정통의 교회적 요약을 제공합니다."
    },
    {
      id: "decree-election",
      title: "작정과 선택",
      kind: "논쟁 카드",
      anchor: "WCF 3; Canons of Dort I",
      summary: "구원의 궁극적 근거는 인간의 예견된 공로가 아니라 하나님의 은혜로운 작정과 선택에 있습니다.",
      front: "선택 교리는 무엇을 보호하려 하는가?",
      back: "선택 교리는 운명론이 아니라 은혜의 우선성을 보호합니다. 구원은 인간의 자격에서 나오지 않고 하나님의 긍휼에서 나옵니다.",
      doctrine: ["예정론", "은혜", "도르트", "구원론"],
      compare: "개념비교 페이지의 예정론에서 칼빈·벌코프·바빙크·바르트의 배열 차이를 비교하는 기준 카드로 쓰기 좋습니다."
    },
    {
      id: "covenant-mediator",
      title: "언약과 중보자 그리스도",
      kind: "구조 카드",
      anchor: "WCF 7–8; WSC 20–28",
      summary: "하나님은 언약 안에서 죄인을 구원하시며, 그 언약의 중보자는 참 하나님이자 참 사람이신 그리스도입니다.",
      front: "왜 그리스도는 중보자여야 하는가?",
      back: "죄인은 하나님께 스스로 나아갈 수 없습니다. 그리스도는 선지자·제사장·왕으로서 하나님과 인간 사이의 구원을 이루고 적용하십니다.",
      doctrine: ["언약신학", "그리스도론", "삼중직", "구속"],
      compare: "웨스트민스터는 언약과 중보자를 교의학적 구조 안에 배열하고, 소요리문답은 이를 교육 가능한 문답으로 압축합니다."
    },
    {
      id: "justification-sanctification",
      title: "칭의와 성화",
      kind: "구분 카드",
      anchor: "WCF 11–13; HC 59–64; WSC 33–36",
      summary: "칭의는 그리스도의 의를 근거로 한 하나님의 법정적 선언이고, 성화는 성령께서 신자를 새롭게 하시는 실제적 변화입니다.",
      front: "칭의와 성화는 어떻게 구별되고 연결되는가?",
      back: "칭의와 성화는 분리되지 않지만 혼동되어서도 안 됩니다. 칭의는 받아들여짐의 근거이고, 성화는 은혜 받은 삶의 열매입니다.",
      doctrine: ["칭의", "성화", "믿음", "선행"],
      compare: "하이델베르크의 감사 구조는 선행을 공로가 아니라 구원받은 자의 응답으로 배치합니다."
    },
    {
      id: "church-sacraments",
      title: "교회와 성례",
      kind: "실천 카드",
      anchor: "WCF 25–29; Belgic 27–35; HC 65–82",
      summary: "교회는 말씀과 성례와 권징 안에서 드러나며, 성례는 복음의 약속을 보이는 말씀으로 확증합니다.",
      front: "교회와 성례는 왜 교리교육의 마지막 장식이 아닌가?",
      back: "교리는 개인의 관념으로 끝나지 않습니다. 말씀을 듣고, 성례에 참여하고, 교회의 질서 안에서 살아가는 신앙의 몸을 형성합니다.",
      doctrine: ["교회론", "세례", "성찬", "권징", "은혜의 방편"],
      compare: "벨직 신앙고백은 참 교회의 표지와 성례 이해를 연결하기에 교회론 카드 제작에 특히 좋습니다."
    },
    {
      id: "law-prayer",
      title: "십계명과 주기도문",
      kind: "훈련 카드",
      anchor: "WSC 39–107; HC 92–129",
      summary: "십계명은 감사의 삶의 규범을, 주기도문은 하나님 앞에서 구할 바를 가르칩니다.",
      front: "교리문답은 왜 율법과 기도를 길게 다루는가?",
      back: "믿음은 지식으로만 머물지 않습니다. 하나님 사랑과 이웃 사랑의 질서, 그리고 하나님께 의존하는 기도의 삶으로 훈련됩니다.",
      doctrine: ["십계명", "주기도문", "감사", "제자도"],
      compare: "소요리문답은 세밀한 문답으로, 하이델베르크는 감사의 큰 흐름으로 율법과 기도를 배열합니다."
    }
  ];

  function ensureStyles() {
    if (document.querySelector("#confession-page-styles")) return;
    var style = document.createElement("style");
    style.id = "confession-page-styles";
    style.textContent = "\
      .confession-wrap{margin-top:24px;}\
      .confession-intro{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);padding:22px 26px;background-image:linear-gradient(90deg,var(--ref-soft),transparent 58%);}\
      .confession-intro h3{font-family:var(--font-display);font-size:1.44rem;margin:6px 0 8px;}\
      .confession-intro p{margin:0;color:var(--muted);max-width:900px;}\
      .confession-switch{display:flex;gap:8px;flex-wrap:wrap;margin:18px 0;}\
      .confession-btn{border:1px solid var(--line-strong);background:var(--surface);border-radius:999px;padding:8px 13px;cursor:pointer;font-size:.88rem;color:var(--muted);display:inline-flex;gap:7px;align-items:center;}\
      .confession-btn:hover{border-color:var(--ink);color:var(--ink);}\
      .confession-btn.is-active{background:var(--ref);border-color:var(--ref);color:#fff;}\
      .confession-btn .mini{font-family:var(--font-mono);font-size:.68rem;opacity:.82;}\
      .confession-page{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);overflow:hidden;}\
      .confession-hero{padding:24px 28px 22px;border-bottom:1px solid var(--line);background:linear-gradient(90deg,var(--ref-soft),transparent 68%);}\
      .confession-hero h3{font-family:var(--font-display);font-size:1.58rem;margin:8px 0 3px;line-height:1.28;}\
      .confession-hero .eng{display:block;font-family:var(--font-mono);font-size:.78rem;color:var(--faint);letter-spacing:.04em;margin-top:2px;}\
      .confession-hero .sum{margin:10px 0 0;color:var(--muted);max-width:920px;}\
      .confession-meta{display:flex;flex-wrap:wrap;gap:8px;align-items:center;}\
      .confession-meta span{font-family:var(--font-mono);font-size:.72rem;color:var(--muted);border:1px solid var(--line);background:var(--surface);border-radius:999px;padding:3px 9px;}\
      .confession-body{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(260px,.9fr);gap:0;}\
      .confession-section{padding:22px 26px;border-bottom:1px solid var(--line);}\
      .confession-section h4{font-family:var(--font-display);font-size:1.04rem;margin:0 0 12px;}\
      .confession-section p{margin:0;color:var(--muted);font-size:.94rem;}\
      .confession-main{border-right:1px solid var(--line);}\
      .confession-side{background:var(--surface-2);}\
      .structure-list{display:grid;gap:9px;}\
      .structure-item{display:grid;grid-template-columns:78px 1fr;gap:12px;padding:10px 0;border-bottom:1px solid var(--line);}\
      .structure-item:last-child{border-bottom:none;}\
      .structure-item .range{font-family:var(--font-mono);font-size:.76rem;color:var(--ref-ink);background:var(--ref-soft);border-radius:6px;height:fit-content;text-align:center;padding:4px 6px;}\
      .structure-item b{display:block;font-size:.94rem;}\
      .structure-item p{font-size:.88rem;margin:2px 0 0;color:var(--muted);}\
      .feature-list{display:flex;gap:7px;flex-wrap:wrap;}\
      .confession-card-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-top:18px;}\
      .study-card{background:var(--surface);border:1px solid var(--line);border-radius:14px;overflow:hidden;min-height:100%;}\
      .study-card summary{list-style:none;cursor:pointer;padding:18px 18px 16px;position:relative;}\
      .study-card summary::-webkit-details-marker{display:none;}\
      .study-card summary::after{content:'펼치기';position:absolute;right:14px;top:14px;font-family:var(--font-mono);font-size:.62rem;color:var(--neo-ink);background:var(--neo-soft);border-radius:4px;padding:2px 7px;}\
      .study-card[open] summary::after{content:'접기';}\
      .study-card .kind{font-family:var(--font-mono);font-size:.68rem;letter-spacing:.08em;color:var(--muted);text-transform:uppercase;}\
      .study-card h4{font-family:var(--font-display);font-size:1.08rem;margin:8px 0 6px;padding-right:54px;}\
      .study-card .anchor{font-family:var(--font-mono);font-size:.72rem;color:var(--ref-ink);}\
      .study-card .summary{margin:10px 0 0;color:var(--muted);font-size:.9rem;}\
      .study-card-body{border-top:1px dashed var(--line);padding:14px 18px 18px;background:var(--surface-2);}\
      .qa{margin:0 0 10px;}\
      .qa b{display:block;font-family:var(--font-mono);font-size:.68rem;color:var(--muted);letter-spacing:.08em;text-transform:uppercase;margin-bottom:3px;}\
      .qa p{margin:0;font-size:.9rem;color:var(--ink);}\
      .compare-note{margin-top:10px;padding-left:12px;border-left:3px solid var(--neo);color:var(--muted);font-size:.88rem;}\
      @media(max-width:1040px){.confession-card-grid{grid-template-columns:repeat(2,minmax(0,1fr));}}\
      @media(max-width:820px){.confession-body{grid-template-columns:1fr}.confession-main{border-right:none}.confession-card-grid{grid-template-columns:1fr}.structure-item{grid-template-columns:1fr}}\
    ";
    document.head.appendChild(style);
  }

  function tags(items) {
    return (items || []).map(function (item) { return '<span class="tag">' + esc(item) + '</span>'; }).join("");
  }

  function textPoolDoc(doc) {
    return [doc.title, doc.englishTitle, doc.type, doc.family, doc.origin, doc.summary, doc.researchUse, (doc.linkedTopics || []).join(" "), (doc.features || []).join(" "), (doc.structure || []).map(function (s) { return s.range + " " + s.title + " " + s.note; }).join(" ")].join(" ");
  }

  function textPoolCard(card) {
    return [card.title, card.kind, card.anchor, card.summary, card.front, card.back, card.compare, (card.doctrine || []).join(" ")].join(" ");
  }

  function matchQuery(text) {
    if (typeof state === "undefined" || !state.q) return true;
    return text.toLowerCase().indexOf(state.q.toLowerCase()) !== -1;
  }

  function matchTradition() {
    return typeof state === "undefined" || state.trad === "all" || state.trad === "개혁파 정통";
  }

  function docButton(doc, activeId) {
    return '<button class="confession-btn ' + (doc.id === activeId ? 'is-active' : '') + '" data-confession-id="' + esc(doc.id) + '"><span>' + esc(doc.title) + '</span><span class="mini">' + esc(doc.type) + '</span></button>';
  }

  function renderDoc(doc) {
    var structure = (doc.structure || []).map(function (item) {
      return '<div class="structure-item"><span class="range">' + esc(item.range) + '</span><div><b>' + esc(item.title) + '</b><p>' + esc(item.note) + '</p></div></div>';
    }).join("");
    return '<article class="confession-page">' +
      '<header class="confession-hero">' +
        '<div class="confession-meta"><span>' + esc(doc.family) + '</span><span>' + esc(doc.period) + '</span><span>' + esc(doc.origin) + '</span><span>' + esc(doc.type) + '</span></div>' +
        '<h3>' + esc(doc.title) + '<span class="eng">' + esc(doc.englishTitle) + '</span></h3>' +
        '<p class="sum">' + esc(doc.summary) + '</p>' +
      '</header>' +
      '<div class="confession-body">' +
        '<div class="confession-main">' +
          '<section class="confession-section"><h4>문서 구조</h4><div class="structure-list">' + structure + '</div></section>' +
          '<section class="confession-section"><h4>연구·교육 용도</h4><p>' + esc(doc.researchUse) + '</p></section>' +
        '</div>' +
        '<aside class="confession-side">' +
          '<section class="confession-section"><h4>특징</h4><div class="feature-list">' + tags(doc.features) + '</div></section>' +
          '<section class="confession-section"><h4>연결 교리</h4><div class="feature-list">' + tags(doc.linkedTopics) + '</div></section>' +
        '</aside>' +
      '</div>' +
    '</article>';
  }

  function renderCard(card) {
    return '<details class="study-card">' +
      '<summary>' +
        '<span class="kind">' + esc(card.kind) + '</span>' +
        '<h4>' + esc(card.title) + '</h4>' +
        '<span class="anchor">' + esc(card.anchor) + '</span>' +
        '<p class="summary">' + esc(card.summary) + '</p>' +
      '</summary>' +
      '<div class="study-card-body">' +
        '<div class="qa"><b>앞면 질문</b><p>' + esc(card.front) + '</p></div>' +
        '<div class="qa"><b>뒷면 해설</b><p>' + esc(card.back) + '</p></div>' +
        '<div class="feature-list">' + tags(card.doctrine) + '</div>' +
        '<p class="compare-note">' + esc(card.compare) + '</p>' +
      '</div>' +
    '</details>';
  }

  function renderConfessions() {
    ensureStyles();
    if (!matchTradition()) {
      view.innerHTML = '<div class="empty"><b>신앙고백·교리문답</b>은 현재 개혁파 정통 문서 기준으로 구성되어 있습니다.<br>전통 필터를 “전체” 또는 “개혁파”로 바꾸면 볼 수 있습니다.</div>';
      return;
    }

    if (!state.confessionId) state.confessionId = DOCS[0].id;
    var docs = DOCS.filter(function (doc) { return matchQuery(textPoolDoc(doc)); });
    var cards = STUDY_CARDS.filter(function (card) { return matchQuery(textPoolCard(card)); });
    var active = docs.find(function (doc) { return doc.id === state.confessionId; }) || DOCS.find(function (doc) { return doc.id === state.confessionId; }) || docs[0] || DOCS[0];
    var switcher = DOCS.map(function (doc) { return docButton(doc, active.id); }).join("");
    var cardHtml = cards.length ? cards.map(renderCard).join("") : '<div class="empty"><b>카드</b>에서 조건에 맞는 항목을 찾지 못했습니다.</div>';

    view.innerHTML = '<section class="confession-wrap">' +
      '<div class="confession-intro">' +
        '<span class="loci-label">CONFESSIONS · CATECHISMS</span>' +
        '<h3>신앙고백·교리문답 페이지</h3>' +
        '<p>신앙고백서는 교회의 공적 고백을, 교리문답은 교육 가능한 문답 구조를 제공합니다. 이 페이지는 원문 전문이 아니라 문서 구조, 교리 연결, 연구·설교용 카드만 정리합니다.</p>' +
      '</div>' +
      '<div class="confession-switch">' + switcher + '</div>' +
      renderDoc(active) +
      '<section class="topic-section" style="margin-top:18px"><h4>학습·비교 카드</h4><p class="muted">암기, 설교 도입, 교리반 토론, 개념비교 페이지 연결에 쓸 수 있는 카드입니다.</p><div class="confession-card-grid">' + cardHtml + '</div></section>' +
    '</section>';

    view.querySelectorAll("[data-confession-id]").forEach(function (button) {
      button.onclick = function () {
        state.confessionId = button.dataset.confessionId;
        renderConfessions();
      };
    });
  }

  function installTab() {
    var tabs = document.querySelector(".tabs");
    if (!tabs || document.querySelector('[data-view="confessions"]')) return;
    var button = document.createElement("button");
    button.className = "tab";
    button.dataset.view = "confessions";
    button.innerHTML = '신앙고백·교리문답<span class="lat">Confessions</span>';
    var compare = document.querySelector('[data-view="compare"]');
    if (compare && compare.nextSibling) tabs.insertBefore(button, compare.nextSibling);
    else tabs.appendChild(button);
    button.onclick = function () {
      document.querySelectorAll(".tab").forEach(function (tab) { tab.classList.remove("is-active"); });
      button.classList.add("is-active");
      state.view = "confessions";
      clearRoute(state.view);
    };
  }

  function appendCount() {
    var bar = document.querySelector("#countbar");
    if (!bar || bar.querySelector(".conf-count")) return;
    bar.insertAdjacentHTML("beforeend", '<span class="sep conf-count">·</span><b class="conf-count">' + DOCS.length + '</b><span class="conf-count"> 고백·문답</span><span class="sep conf-count">·</span><b class="conf-count">' + STUDY_CARDS.length + '</b><span class="conf-count"> 카드</span>');
  }

  if (typeof VIEWS !== "undefined") VIEWS.confessions = renderConfessions;
  installTab();
  appendCount();
}());
