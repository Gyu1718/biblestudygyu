/* Expanded confessions and catechisms page. */
(function () {
  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  var DOCS = [
    {
      id: "apostles",
      title: "사도신경",
      english: "Apostles’ Creed",
      type: "신경",
      family: "고대 보편 신경",
      period: "고대교회 신앙 규칙 전승",
      origin: "세례 고백과 복음 요약 전승",
      summary: "사도신경은 기독교 신앙의 복음적 골자를 가장 간결하게 배열한 고대 신경입니다. 하이델베르크 전통은 이를 그리스도인이 믿어야 할 복음의 요약으로 다루며, 성부와 창조, 성자와 구속, 성령과 성화의 삼중 구조로 읽습니다.",
      structure: [["1–2항", "성부와 창조", "전능하신 아버지 하나님과 천지 창조를 고백합니다."], ["3–8항", "성자와 구속", "성육신, 고난, 죽음, 부활, 승천, 하나님 우편, 재림과 심판을 고백합니다."], ["9–12항", "성령과 성화", "성령, 거룩한 보편 교회, 성도의 교제, 죄 사함, 몸의 부활, 영생을 고백합니다."]],
      details: [["해설 초점", "사도신경은 단순한 암송문이 아니라 교회가 복음의 내용을 짧게 고백하는 신앙의 표지입니다."], ["하이델베르크와의 연결", "하이델베르크 22–25문은 사도신경을 믿음의 내용으로 제시하고, 이를 성부·성자·성령의 구원 경륜으로 나누어 설명합니다."], ["교육 포인트", "교리반에서는 12항 암송에서 멈추지 말고, 각 항목이 창조·구속·성화·교회·종말로 이어지는 구조를 보여 주는 것이 좋습니다."]],
      features: ["복음의 골자", "세례 고백", "삼위일체 구조", "공교회성"],
      topics: ["삼위일체", "창조", "성육신", "비하와 승귀", "교회", "부활", "영생"],
      sources: ["우르시누스, 하이델베르크 요리문답 해설 22–25문", "벌코프, 신조와 삼위일체·그리스도론 해설", "바빙크, 성경과 신앙고백·삼위일체·그리스도 사역"]
    },
    {
      id: "nicene",
      title: "니케아-콘스탄티노폴리스 신경",
      english: "Niceno-Constantinopolitan Creed",
      type: "신경",
      family: "고대 보편 신경",
      period: "325/381",
      origin: "니케아 공의회와 콘스탄티노폴리스 공의회",
      summary: "니케아 신경은 성자가 피조물이 아니라 성부와 동일 본질이신 참 하나님이라는 교회의 고백을 분명히 합니다. 콘스탄티노폴리스에서 성령 고백이 더 명료해지면서 삼위일체 정통의 핵심 문서가 되었습니다.",
      structure: [["성부", "창조주 하나님", "한 분 하나님, 전능하신 아버지, 하늘과 땅의 창조주를 고백합니다."], ["성자", "참 하나님이신 그리스도", "성자는 성부에게서 나신 분이며, 피조물이 아니라 성부와 동일 본질이심을 고백합니다."], ["성령", "주님이시며 생명을 주시는 분", "성령의 신성과 교회·세례·부활·영생의 소망을 고백합니다."]],
      details: [["신학적 기능", "니케아 신경은 예수 그리스도를 뛰어난 피조물이나 중간 존재로 낮추는 해석을 거부하고, 그분의 참된 신성을 보존합니다."], ["사도신경과의 관계", "사도신경이 복음의 골자를 간결하게 말한다면, 니케아 신경은 특히 성자와 성령의 신성을 더 정밀하게 고백합니다."], ["교육 포인트", "삼위일체 교육에서는 동일 본질, 참 하나님, 성령의 신성을 중심 개념으로 삼아야 합니다."]],
      features: ["삼위일체 정통", "성자의 신성", "성령의 신성", "공의회 신경"],
      topics: ["성자", "동일본질", "아리우스 논쟁", "성령론", "공교회"],
      sources: ["우르시누스, 사도신경과 후대 신조 해설 흐름", "벌코프, 삼위일체론", "바빙크, 삼위일체와 계시"]
    },
    {
      id: "chalcedon",
      title: "칼케돈 신조",
      english: "Definition of Chalcedon",
      type: "신조",
      family: "고대 보편 신조",
      period: "451",
      origin: "칼케돈 공의회",
      summary: "칼케돈 신조는 예수 그리스도께서 참 하나님이시며 참 사람이시고, 한 인격 안에 두 본성을 지니신다는 기독론의 경계선을 세웁니다. 이는 중보자론과 성육신 이해의 핵심 기준입니다.",
      structure: [["한 분 그리스도", "인격의 통일성", "예수 그리스도는 둘로 나뉜 두 주체가 아니라 한 인격이십니다."], ["두 본성", "참 하나님·참 사람", "신성과 인성은 혼합되거나 변하거나 나뉘거나 분리되지 않습니다."], ["중보자", "구원의 가능성", "그리스도는 하나님과 인간 사이의 참 중보자이시기에 참 하나님과 참 사람이어야 합니다."]],
      details: [["신학적 기능", "칼케돈은 그리스도의 신성을 약화시키는 길과 인성을 약화시키는 길을 동시에 막습니다."], ["개혁파 연결", "웨스트민스터와 하이델베르크의 중보자론은 칼케돈의 기독론적 경계 안에서 이해되어야 합니다."], ["교육 포인트", "한 인격 두 본성은 추상 공식이 아니라, 구원자가 왜 우리를 대표할 수 있고 동시에 우리를 구원할 수 있는지를 설명하는 복음의 문법입니다."]],
      features: ["한 인격", "두 본성", "성육신", "중보자론"],
      topics: ["기독론", "성육신", "신성", "인성", "중보자"],
      sources: ["벌코프, 그리스도의 인격", "바빙크, 성육신과 중보자", "우르시누스, 중보자와 사도신경 성자 항목"]
    },
    {
      id: "athanasian",
      title: "아타나시우스 신경",
      english: "Athanasian Creed",
      type: "신경",
      family: "서방교회 삼위일체 신경",
      period: "고대 후기–중세 초 전승",
      origin: "서방교회 신앙 규칙 전승",
      summary: "아타나시우스 신경은 삼위일체와 성육신을 가장 엄격한 신앙 문법으로 정리합니다. 성부·성자·성령의 구별과 한 하나님의 통일성을 동시에 붙들도록 돕습니다.",
      structure: [["삼위일체", "한 본질, 세 위격", "성부·성자·성령은 혼동되지 않고, 신적 본질은 나뉘지 않습니다."], ["동등성", "영광과 위엄", "세 위격은 영원성과 권능과 영광에서 동등하게 고백됩니다."], ["성육신", "참 하나님·참 사람", "그리스도는 신성과 인성을 지니시되 한 분 그리스도이십니다."]],
      details: [["신학적 기능", "삼위일체를 물질적 비유나 단순한 역할 변화로 설명하는 오류를 막는 데 유용합니다."], ["교육적 주의", "초신자 교육에서는 표현이 무겁게 느껴질 수 있으므로, 니케아와 칼케돈을 먼저 설명한 뒤 보충 문서로 다루는 편이 좋습니다."], ["개념비교 연결", "삼위일체, 계시론, 기독론, 예배론 항목과 직접 연결됩니다."]],
      features: ["삼위일체 문법", "본질과 위격", "성육신", "이단 경계"],
      topics: ["삼위일체", "위격", "본질", "성육신", "정통 교리"],
      sources: ["벌코프, 삼위일체론과 기독론", "바빙크, 삼위일체와 성육신"]
    },
    {
      id: "wcf",
      title: "웨스트민스터 신앙고백서",
      english: "Westminster Confession of Faith",
      type: "신앙고백",
      family: "웨스트민스터 표준문서",
      period: "1646",
      origin: "영국·스코틀랜드 개혁파 전통",
      summary: "성경, 하나님, 작정, 창조, 섭리, 타락, 언약, 그리스도, 구원 적용, 교회, 성례, 국가, 종말을 장별로 배열한 개혁파 정통 교의 체계입니다.",
      structure: [["1장", "성경", "계시, 정경, 영감, 권위, 명료성, 해석 원리."], ["2–5장", "하나님과 사역", "하나님, 삼위일체, 작정, 창조, 섭리."], ["6–8장", "죄·언약·중보자", "타락과 언약 구조, 그리스도의 중보 사역."], ["9–18장", "구원의 적용", "자유의지, 부르심, 칭의, 양자, 성화, 믿음, 회개, 선행, 견인."], ["19–33장", "교회와 삶과 종말", "법, 예배, 교회, 성례, 권징, 시민 정부, 죽음과 심판."]],
      details: [["교의학적 기능", "소요리문답이 교육용 압축이라면, 신앙고백서는 논쟁 가능한 교리 항목을 장별 명제로 정리한 표준문서 역할을 합니다."], ["비교축", "성경론, 작정, 언약, 칭의, 성화, 교회론, 성례론, 종말론의 개혁파 기준점으로 삼을 수 있습니다."], ["교육 포인트", "1장 성경론에서 시작해 하나님과 사역, 구원, 교회와 종말로 이어지는 흐름을 먼저 보여 주는 것이 좋습니다."]],
      features: ["교의학 체계", "장별 색인", "개혁파 기준점", "논쟁 주제 연결"],
      topics: ["성경론", "작정", "언약", "칭의", "성화", "교회", "종말"],
      sources: ["벌코프, 조직신학", "바빙크, 개혁교의학 개요"]
    },
    {
      id: "wsc",
      title: "웨스트민스터 소요리문답",
      english: "Westminster Shorter Catechism",
      type: "교리문답",
      family: "웨스트민스터 표준문서",
      period: "1647",
      origin: "영국·스코틀랜드 개혁파 전통",
      summary: "기독교 신앙의 핵심을 짧은 문답 형식으로 압축한 교리 교육 문서입니다. 하나님, 인간, 죄, 그리스도, 구원, 십계명, 성례, 기도까지 신앙의 기본 골격을 배열합니다.",
      structure: [["문 1–3", "목적과 성경", "인간의 제일 되는 목적, 성경의 가르침, 신앙과 의무."], ["문 4–38", "믿을 것", "하나님, 작정, 창조, 섭리, 타락, 은혜 언약, 그리스도, 구속 적용."], ["문 39–81", "행할 것", "도덕법과 십계명."], ["문 82–107", "은혜의 방편", "믿음과 회개, 말씀·성례·기도, 주기도문."]],
      details: [["해설서 기반 구조", "토머스 왓슨의 해설은 짧은 문답을 설교 가능한 교리 단락으로 풀어내며, 인간의 목적에서 시작해 구원 적용과 은혜의 방편으로 나아갑니다."], ["교리적 강점", "목적-규범-하나님-죄-그리스도-구원 적용-법-은혜의 방편의 구조가 조직신학 입문에 매우 적합합니다."], ["교육 포인트", "1문은 목적론, 33–35문은 칭의·양자·성화, 88문 이후는 은혜의 방편 훈련으로 카드화하기 좋습니다."]],
      features: ["짧은 암기", "설교 적용", "십계명", "주기도문"],
      topics: ["인간의 목적", "성경", "삼위일체", "칭의", "성화", "성례", "기도"],
      sources: ["토머스 왓슨, 웨스트민스터 소요리문답 해설", "벌코프, 조직신학"]
    },
    {
      id: "heidelberg",
      title: "하이델베르크 요리문답",
      english: "Heidelberg Catechism",
      type: "교리문답",
      family: "독일 개혁파 요리문답",
      period: "1563",
      origin: "팔츠 개혁교회 전통",
      summary: "신자의 유일한 위로에서 출발하여 죄와 비참, 구원, 감사의 삶으로 이어지는 목회적 교리문답입니다.",
      structure: [["문 1–2", "유일한 위로", "나의 비참, 구원, 감사의 구조."], ["문 3–11", "죄와 비참", "율법을 통해 인간의 죄를 드러냅니다."], ["문 12–85", "구원", "중보자, 믿음, 사도신경, 칭의, 성례, 권징."], ["문 86–129", "감사", "선행, 회개, 십계명, 주기도문."]],
      details: [["해설서 기반 구조", "우르시누스는 율법과 복음의 큰 구조 안에서 요리문답을 설명하면서도, 교육 구조는 비참·구원·감사의 세 부분으로 전개합니다."], ["사도신경과의 연결", "22문부터 믿음의 내용을 사도신경으로 요약하고, 24–25문에서 이를 성부·성자·성령 구조로 나눕니다."], ["교육 포인트", "정답 암기보다 나의 위로와 감사의 삶을 강조하는 교육에 적합합니다. 52주일 구조는 교리 설교와 주간 교리반 운영에 바로 연결됩니다."]],
      features: ["목회적 문체", "위로", "죄-구원-감사", "사도신경 해설", "52주일 구조"],
      topics: ["위로", "죄", "믿음", "사도신경", "칭의", "감사", "기도"],
      sources: ["우르시누스, 하이델베르크 요리문답 해설"]
    },
    {
      id: "belgic",
      title: "벨직 신앙고백서",
      english: "Belgic Confession",
      type: "신앙고백",
      family: "세 일치 신조",
      period: "1561",
      origin: "네덜란드 개혁교회 전통",
      summary: "박해 상황 속에서 개혁교회의 신앙을 변증적으로 제시한 신앙고백입니다. 성경, 삼위일체, 창조와 섭리, 타락, 그리스도, 칭의, 교회, 성례, 국가, 종말을 간결하게 다룹니다.",
      structure: [["1–7조", "하나님과 성경", "하나님 인식, 계시, 정경과 성경의 충족성."], ["8–13조", "삼위일체·창조·섭리", "삼위일체와 창조, 섭리, 천사와 악의 문제."], ["14–26조", "인간·그리스도·구원", "타락, 원죄, 선택, 성육신, 만족, 칭의, 중보."], ["27–35조", "교회와 성례", "보편 교회, 참 교회 표지, 직분, 세례와 성찬."], ["36–37조", "국가와 종말", "시민 정부와 최후 심판."]],
      details: [["신앙고백적 성격", "개혁교회가 공교회적 기독교와 단절된 집단이 아니라는 점을 드러내는 변증적 문서입니다."], ["교회론 강점", "참 교회의 표지, 직분, 권징, 세례와 성찬을 연결해 읽기 좋습니다."], ["교육 포인트", "성경의 충족성, 참 교회, 성례, 시민 정부 항목은 현대 교회 현실과 연결해 토론하기 좋습니다."]],
      features: ["변증", "교회론", "세 일치 신조", "조항 구조"],
      topics: ["성경", "삼위일체", "칭의", "참 교회", "성례", "국가", "심판"],
      sources: ["바빙크, 교회와 성례", "벌코프, 교회론과 성례론"]
    },
    {
      id: "dort",
      title: "도르트 신조",
      english: "Canons of Dort",
      type: "신조",
      family: "세 일치 신조",
      period: "1618–1619",
      origin: "도르트 총회",
      summary: "알미니우스주의 논쟁에 응답하여 하나님의 선택, 그리스도의 죽음, 인간의 부패, 회심, 성도의 견인을 논증한 개혁파 구원론 문서입니다.",
      structure: [["제1교리", "선택과 유기", "구원의 궁극 근거가 하나님의 은혜로운 선택에 있음을 밝힙니다."], ["제2교리", "그리스도의 죽음", "속죄의 충분성과 구원 효력을 구분해 설명합니다."], ["제3·4교리", "부패와 회심", "전적 부패와 효과적 은혜, 성령의 내적 사역을 다룹니다."], ["제5교리", "성도의 견인", "참 신자가 하나님의 보존하심으로 믿음 안에 견딤을 설명합니다."]],
      details: [["논쟁사적 기능", "교의학 전체 요약이라기보다 구원론 논쟁에 대한 정밀한 응답입니다."], ["교리적 강점", "구원의 원인을 인간의 예견된 믿음이나 의지에서 찾지 않고 하나님의 은혜로운 선택과 성령의 효과적 사역에서 찾습니다."], ["교육 포인트", "TULIP 약어만 가르치기보다 각 교리가 왜 신자에게 위로가 되는지 묻는 카드로 만드는 편이 좋습니다."]],
      features: ["논쟁 문서", "구원론", "예정론", "견인"],
      topics: ["예정", "속죄", "전적 부패", "효과적 부르심", "견인", "은혜"],
      sources: ["벌코프, 예정론과 견인", "바빙크, 소명과 구원 적용"]
    }
  ];

  var LORD_DAYS = [
    [1, "문 1–2", "유일한 위로와 세 가지 지식", "요리문답 전체의 문을 여는 주일입니다. 신자는 그리스도께 속한 사람이며, 비참·구원·감사의 지식 안에서 위로를 배웁니다.", ["위로", "소속", "전체 구조"]],
    [2, "문 3–5", "죄를 알게 하는 율법", "율법은 인간의 죄와 사랑의 결핍을 드러냅니다. 복음은 이 진단을 회피하지 않고 정직하게 통과합니다.", ["율법", "죄 인식", "사랑"]],
    [3, "문 6–8", "창조와 타락과 부패", "인간은 선하게 창조되었으나 타락으로 본성이 부패했습니다. 구원은 자기 개선이 아니라 새롭게 하시는 은혜를 필요로 합니다.", ["창조", "타락", "부패"]],
    [4, "문 9–11", "하나님의 의와 자비", "하나님은 불의하지 않으시며 죄를 가볍게 넘기지 않으십니다. 자비는 의를 제거하지 않고 구원의 길을 열어 줍니다.", ["공의", "자비", "심판"]],
    [5, "문 12–15", "참 중보자의 필요", "죄인은 스스로 만족을 이룰 수 없습니다. 구원의 길은 하나님과 인간 사이에 설 수 있는 참 중보자를 요구합니다.", ["중보자", "만족", "구속"]],
    [6, "문 16–19", "참 하나님·참 사람", "중보자는 인간을 대표해야 하므로 참 사람이어야 하고, 죄와 죽음을 이겨야 하므로 참 하나님이어야 합니다.", ["기독론", "칼케돈", "중보"]],
    [7, "문 20–23", "참 믿음과 사도신경", "모든 사람이 자동으로 구원받는 것이 아니라, 참 믿음으로 그리스도와 그의 유익에 연합합니다. 사도신경은 그 믿음의 내용을 요약합니다.", ["믿음", "사도신경", "복음 요약"]],
    [8, "문 24–25", "삼위일체 구조", "사도신경은 성부와 창조, 성자와 구속, 성령과 성화로 나뉩니다. 구원은 삼위 하나님의 사역입니다.", ["삼위일체", "성부", "성자", "성령"]],
    [9, "문 26", "성부와 창조", "창조 신앙은 세계의 기원만이 아니라 하나님의 아버지 되심과 돌보심을 고백하게 합니다.", ["창조", "성부", "섭리"]],
    [10, "문 27–28", "섭리와 신뢰", "섭리는 우연을 부정하고 하나님의 보존과 통치를 고백합니다. 신자는 풍요와 결핍 속에서도 하나님을 신뢰하도록 부름받습니다.", ["섭리", "신뢰", "위로"]],
    [11, "문 29–30", "예수라는 이름", "예수라는 이름은 구원이 그분 안에 있음을 말합니다. 다른 구원 근거를 붙드는 것은 복음의 충분성을 약화시킵니다.", ["예수", "구원", "충분성"]],
    [12, "문 31–32", "그리스도와 그리스도인", "그리스도는 기름부음 받은 선지자·제사장·왕이시며, 신자는 그분께 속한 사람으로 고백과 섬김에 참여합니다.", ["삼중직", "제자도", "정체성"]],
    [13, "문 33–34", "독생자와 주 되심", "그리스도는 유일한 아들이시며 우리의 주님이십니다. 구속은 신자의 소유권과 충성의 방향을 바꿉니다.", ["아들", "주권", "구속"]],
    [14, "문 35–36", "성육신", "성자는 성령으로 잉태되어 참 인간이 되셨습니다. 성육신은 인간의 죄와 비참을 담당하시는 구원의 시작입니다.", ["성육신", "동정녀 탄생", "인성"]],
    [15, "문 37–39", "고난과 십자가", "그리스도의 전 생애와 십자가는 죄에 대한 하나님의 심판과 구원의 은혜를 드러냅니다.", ["고난", "십자가", "속죄"]],
    [16, "문 40–44", "죽음과 장사와 지옥 강하", "그리스도의 죽음은 실제 죽음이며, 신자의 죽음과 심판 두려움을 새롭게 해석하게 합니다.", ["죽음", "장사", "심판"]],
    [17, "문 45", "부활의 유익", "부활은 의와 새 생명과 장래 부활의 보증입니다. 구원은 십자가에서 멈추지 않고 새 창조의 소망으로 나아갑니다.", ["부활", "의", "새 생명"]],
    [18, "문 46–49", "승천의 유익", "승천하신 그리스도는 하늘에서 우리를 위해 계시며, 성령으로 우리와 함께하십니다.", ["승천", "중보", "성령"]],
    [19, "문 50–52", "하나님 우편과 재림", "그리스도는 교회의 머리로 다스리시며 다시 오셔서 심판하십니다. 이 고백은 위로와 경계를 함께 줍니다.", ["통치", "재림", "심판"]],
    [20, "문 53", "성령", "성령은 신자를 그리스도와 그의 유익에 참여하게 하시는 하나님이십니다. 신앙은 성령의 현재적 사역 안에서 살아납니다.", ["성령", "연합", "적용"]],
    [21, "문 54–56", "교회와 죄 사함", "교회는 그리스도께서 모으시고 보호하시는 공동체이며, 죄 사함은 신자의 양심에 주어지는 복음의 위로입니다.", ["교회", "성도의 교제", "죄 사함"]],
    [22, "문 57–58", "부활과 영생", "몸의 부활과 영생은 죽음 이후의 막연한 위안이 아니라 그리스도 안에서 보증된 최종 소망입니다.", ["부활", "영생", "소망"]],
    [23, "문 59–61", "칭의", "신자는 자신의 공로가 아니라 그리스도의 의 때문에 하나님 앞에서 의롭다 하심을 받습니다.", ["칭의", "믿음", "그리스도의 의"]],
    [24, "문 62–64", "선행과 공로", "선행은 구원의 근거가 아니지만 은혜 받은 삶의 열매입니다. 복음은 공로주의와 무관심을 함께 거부합니다.", ["선행", "공로", "열매"]],
    [25, "문 65–68", "믿음과 성례", "믿음은 성령께서 말씀으로 일으키시고 성례로 확증하십니다. 성례는 복음 약속을 보이고 인치는 표입니다.", ["믿음", "말씀", "성례"]],
    [26, "문 69–71", "세례의 의미", "세례는 그리스도의 피와 성령의 씻음을 가리키는 언약의 표지입니다.", ["세례", "씻음", "언약"]],
    [27, "문 72–74", "세례와 유아", "세례의 표지는 물 자체의 자동 효과가 아니라 하나님의 약속과 공동체적 언약 구조 안에서 이해됩니다.", ["유아세례", "언약", "표지"]],
    [28, "문 75–77", "성찬의 의미", "성찬은 그리스도의 죽음을 기억하고 그의 유익에 참여함을 확증하는 은혜의 표지입니다.", ["성찬", "기념", "참여"]],
    [29, "문 78–79", "성찬과 그리스도의 몸", "성찬은 물질 자체의 변화가 아니라 성령의 사역 안에서 그리스도와의 참된 교제를 확증합니다.", ["성찬", "성령", "교제"]],
    [30, "문 80–82", "성찬의 분별과 권징", "성찬은 반복되는 제사의 논리와 구별되며, 교회는 참여자의 믿음과 삶을 분별해야 합니다.", ["성찬", "권징", "분별"]],
    [31, "문 83–85", "천국 열쇠", "복음 선포와 권징은 교회가 맡은 천국 열쇠입니다. 이는 위로와 경고의 기능을 함께 가집니다.", ["교회", "복음 선포", "권징"]],
    [32, "문 86–87", "감사의 삶", "구원받은 신자는 선행으로 구원을 얻지 않지만, 구원받았기 때문에 감사의 삶으로 부름받습니다.", ["감사", "선행", "회개"]],
    [33, "문 88–91", "참된 회개", "회개는 옛 사람의 죽음과 새 사람의 살아남입니다. 선행은 참 믿음에서 나오고 하나님의 법에 맞으며 그분의 영광을 향합니다.", ["회개", "새 사람", "선행"]],
    [34, "문 92–95", "십계명과 우상숭배", "감사의 삶은 하나님의 법으로 구체화됩니다. 첫 계명은 하나님 외에 다른 신뢰 대상을 만들지 않도록 합니다.", ["십계명", "우상", "감사"]],
    [35, "문 96–98", "예배와 형상 금지", "하나님은 인간이 만든 형상에 갇히지 않으십니다. 예배는 하나님이 자신을 계시하신 방식에 따라야 합니다.", ["예배", "형상", "계시"]],
    [36, "문 99–100", "하나님의 이름", "하나님의 이름은 가볍게 쓰일 수 없습니다. 말과 고백과 침묵까지 하나님 경외 아래 놓입니다.", ["이름", "경외", "고백"]],
    [37, "문 101–102", "맹세와 진실", "맹세는 하나님의 이름 앞에서 진실을 확인하는 무거운 행위입니다. 신자의 말은 하나님 앞의 책임을 지닙니다.", ["맹세", "진실", "책임"]],
    [38, "문 103", "안식일과 예배", "안식일 계명은 예배, 말씀, 안식, 자비의 삶으로 연결됩니다. 신자는 자신의 시간도 하나님께 속했음을 배웁니다.", ["안식", "예배", "시간"]],
    [39, "문 104", "부모와 권위", "부모 공경은 모든 정당한 권위 질서에 대한 감사와 순종을 포함하되, 하나님 앞에서 분별되어야 합니다.", ["부모", "권위", "질서"]],
    [40, "문 105–107", "생명 보호", "살인 금지는 생명을 해치는 행동뿐 아니라 미움과 분노까지 다룹니다. 이 계명은 이웃의 생명을 보존하라는 적극적 부름입니다.", ["생명", "분노", "이웃 사랑"]],
    [41, "문 108–109", "정결과 성", "간음 금지는 몸과 마음과 관계 전체를 하나님 앞에서 거룩하게 하라는 부름입니다.", ["정결", "몸", "관계"]],
    [42, "문 110–111", "소유와 정직", "도둑질 금지는 타인의 소유를 빼앗지 않는 데서 나아가 이웃의 유익을 증진하는 삶을 요구합니다.", ["소유", "정직", "청지기"]],
    [43, "문 112", "진실한 증언", "거짓 증언 금지는 법정의 거짓말만이 아니라 이웃의 명예를 해치는 말과 판단을 경계합니다.", ["진실", "말", "명예"]],
    [44, "문 113–115", "탐심과 율법의 기능", "탐심 금지는 죄가 행동 이전의 마음에서 시작됨을 드러냅니다. 율법은 신자를 회개와 은혜로 이끕니다.", ["탐심", "마음", "율법"]],
    [45, "문 116–119", "기도의 필요와 주기도문", "기도는 감사의 가장 중요한 표현이며, 하나님이 명하신 은혜의 길입니다. 주기도문은 기도의 학교입니다.", ["기도", "감사", "주기도문"]],
    [46, "문 120–121", "하늘 아버지", "기도는 추상적 신에게 말하는 것이 아니라 그리스도 안에서 아버지께 나아가는 신뢰의 행위입니다.", ["아버지", "신뢰", "기도"]],
    [47, "문 122", "이름이 거룩히 여김을 받으심", "첫 번째 간구는 하나님의 이름과 영광이 우리의 삶과 세상 속에서 바르게 드러나기를 구합니다.", ["하나님의 이름", "영광", "거룩"]],
    [48, "문 123", "나라가 임하심", "하나님의 나라는 말씀과 성령으로 다스림 받는 현실입니다. 교회는 그 나라를 구하고 증언합니다.", ["하나님 나라", "말씀", "성령"]],
    [49, "문 124", "뜻이 이루어짐", "하나님의 뜻을 구하는 기도는 자기 뜻의 관철이 아니라 순종과 자기 부인의 훈련입니다.", ["순종", "뜻", "자기부인"]],
    [50, "문 125", "일용할 양식", "일용할 양식을 구하는 기도는 생존의 필요를 하나님께 의존하며 받는 훈련입니다.", ["양식", "의존", "섭리"]],
    [51, "문 126", "죄 용서와 용서의 삶", "용서받은 신자는 이웃을 용서하도록 부름받습니다. 용서는 복음의 수직적 은혜가 수평적 관계로 흘러가는 자리입니다.", ["용서", "죄 사함", "화해"]],
    [52, "문 127–129", "시험과 악에서 구원", "마지막 간구와 아멘은 신자가 악과 연약함 속에서도 하나님께 끝까지 의지하도록 이끕니다.", ["시험", "악", "아멘"]]
  ];

  var CARDS = [
    ["신경은 신앙의 표지다", "사도신경; 하이델베르크 22–23문", "신경은 성경을 대체하지 않고, 성경이 증언하는 복음의 핵심을 교회가 함께 고백하도록 요약합니다.", ["신경", "공교회", "교리교육"]],
    ["사도신경의 삼위일체 구조", "사도신경; 하이델베르크 24–25문", "성부와 창조, 성자와 구속, 성령과 성화라는 구조는 삼위 하나님의 구원 경륜을 배우게 합니다.", ["성부", "성자", "성령", "구원 경륜"]],
    ["성자는 피조물이 아니라 참 하나님이다", "니케아 신경", "니케아 신경은 그리스도를 가장 높은 피조물로 낮추는 해석을 거부하고 성자의 참 신성을 고백합니다.", ["니케아", "성자", "동일본질"]],
    ["성령은 주님이시며 생명을 주신다", "니케아-콘스탄티노폴리스 신경", "성령은 단순한 능력이나 분위기가 아니라 성부와 성자와 함께 예배받으시는 참 하나님이십니다.", ["성령론", "삼위일체", "예배"]],
    ["한 인격 두 본성", "칼케돈 신조", "그리스도는 참 하나님이시며 참 사람이시고, 두 본성은 혼합되거나 분리되지 않습니다.", ["칼케돈", "기독론", "성육신"]],
    ["중보자는 왜 참 하나님·참 사람이어야 하는가", "칼케돈; 하이델베르크 12–19문", "구원자는 인간을 대표해야 하므로 참 사람이어야 하고, 죄와 죽음을 이겨야 하므로 참 하나님이어야 합니다.", ["중보자", "구속", "기독론"]],
    ["삼위일체는 단순 비유로 축소되지 않는다", "아타나시우스 신경", "삼위일체는 세 역할이나 세 양태가 아니라 한 본질 안의 세 위격이라는 고백입니다.", ["아타나시우스", "본질", "위격"]],
    ["하이델베르크의 큰 흐름", "문 1–129", "하이델베르크는 위로에서 시작하여 비참, 구원, 감사로 이어지는 목회적 교리 구조를 가집니다.", ["위로", "비참", "구원", "감사"]],
    ["인간의 제일 되는 목적", "웨스트민스터 소요리문답 1문", "인간의 삶은 자기완성보다 하나님을 영화롭게 하고 하나님 안에서 즐거워하는 데 목적이 있습니다.", ["목적론", "예배", "인간론"]],
    ["살아서나 죽어서나 유일한 위로", "하이델베르크 1문", "위로의 근거는 감정의 안정이 아니라 내가 그리스도께 속했다는 소속의 전환입니다.", ["위로", "그리스도와의 연합", "확신"]],
    ["선택 교리는 무엇을 보호하는가", "도르트 신조 제1교리", "선택 교리는 운명론이 아니라 은혜의 우선성과 구원의 확실성을 보호합니다.", ["예정", "은혜", "도르트"]],
    ["참 교회의 표지", "벨직 신앙고백서 27–29조", "교회는 규모나 분위기가 아니라 말씀, 성례, 권징이라는 표지 안에서 분별됩니다.", ["교회론", "말씀", "성례", "권징"]],
    ["칭의와 성화의 구별", "웨스트민스터 신앙고백서 11–13장", "칭의는 하나님 앞에서의 법정적 선언이고, 성화는 성령께서 신자를 새롭게 하시는 실제적 변화입니다.", ["칭의", "성화", "구원론"]]
  ];

  function tags(items) {
    return (items || []).map(function (item) { return '<span class="tag">' + esc(item) + '</span>'; }).join("");
  }

  function textPool(doc) {
    return [doc.title, doc.english, doc.type, doc.family, doc.period, doc.origin, doc.summary, doc.features.join(" "), doc.topics.join(" "), doc.structure.map(function (x) { return x.join(" "); }).join(" "), doc.details.map(function (x) { return x.join(" "); }).join(" ")].join(" ");
  }

  function matches(text) {
    if (typeof state === "undefined") return true;
    return !state.q || text.toLowerCase().indexOf(state.q.toLowerCase()) !== -1;
  }

  function ensureStyles() {
    if (document.querySelector("#confessions-next-styles")) return;
    var style = document.createElement("style");
    style.id = "confessions-next-styles";
    style.textContent = "\
      .confession-group-note{margin:14px 0 0;color:var(--muted);font-size:.9rem;line-height:1.65;}\
      .detail-note{border:1px solid var(--line);background:var(--surface);border-radius:12px;padding:13px 14px;margin-bottom:10px;}\
      .detail-note b{display:block;font-size:.92rem;margin-bottom:4px;}\
      .detail-note p{font-size:.88rem;line-height:1.68;margin:0;color:var(--muted);}\
      .source-list{margin:0;padding-left:18px;color:var(--muted);}\
      .source-list li{font-size:.86rem;margin:5px 0;}\
      .confession-btn .mini{display:block;font-size:.7rem;color:var(--faint);margin-top:3px;}\
      .lord-day-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;margin-top:12px;}\
      .lord-day-card{border:1px solid var(--line);border-radius:14px;background:var(--surface);padding:14px 15px;}\
      .lord-day-card h5{margin:0 0 7px;font-family:var(--font-display);font-size:1rem;}\
      .lord-day-card .range{font-family:var(--font-mono);font-size:.72rem;color:var(--faint);display:block;margin-bottom:4px;}\
      .lord-day-card p{margin:0 0 10px;color:var(--muted);font-size:.88rem;line-height:1.65;}\
    ";
    document.head.appendChild(style);
  }

  function fixTabOrder() {
    var tabs = document.querySelector(".tabs");
    if (!tabs) return;
    var compare = document.querySelector('[data-view="compare"]');
    var books = document.querySelector('[data-view="books"]');
    var conf = document.querySelector('[data-view="confessions"]');
    if (compare && books && compare.nextElementSibling !== books) tabs.insertBefore(books, compare.nextSibling);
    if (books && conf && books.nextElementSibling !== conf) tabs.insertBefore(conf, books.nextSibling);
  }

  function appendCount() {
    var bar = document.querySelector("#countbar");
    if (!bar) return;
    document.querySelectorAll(".conf-count").forEach(function (node) { node.remove(); });
    bar.insertAdjacentHTML("beforeend", '<span class="sep conf-count">·</span><b class="conf-count">' + DOCS.length + '</b><span class="conf-count"> 고백·문답</span><span class="sep conf-count">·</span><b class="conf-count">' + LORD_DAYS.length + '</b><span class="conf-count"> 하이델베르크 주일</span><span class="sep conf-count">·</span><b class="conf-count">' + CARDS.length + '</b><span class="conf-count"> 카드</span>');
  }

  function button(doc, activeId) {
    return '<button class="confession-btn ' + (doc.id === activeId ? 'is-active' : '') + '" data-confession-id="' + esc(doc.id) + '"><span>' + esc(doc.title) + '</span><span class="mini">' + esc(doc.type) + '</span></button>';
  }

  function renderLordDay(item) {
    return '<article class="lord-day-card"><span class="range">제' + esc(item[0]) + '주일 · ' + esc(item[1]) + '</span><h5>' + esc(item[2]) + '</h5><p>' + esc(item[3]) + '</p><div class="feature-list">' + tags(item[4]) + '</div></article>';
  }

  function renderLordDaysIfNeeded(doc) {
    if (doc.id !== "heidelberg") return "";
    var days = LORD_DAYS.filter(function (item) { return matches(item.join(" ")); });
    return '<section class="confession-section" style="margin-top:18px"><h4>하이델베르크 52주일 색인</h4><p class="muted">문답 전문이 아니라 주일별 범위와 교리 주제, 교육용 요약만 정리했습니다.</p><div class="lord-day-grid">' + (days.length ? days.map(renderLordDay).join("") : '<div class="empty"><b>52주일 색인</b>에서 조건에 맞는 항목을 찾지 못했습니다.</div>') + '</div></section>';
  }

  function renderDoc(doc) {
    var structure = doc.structure.map(function (item) {
      return '<div class="structure-item"><span class="range">' + esc(item[0]) + '</span><div><b>' + esc(item[1]) + '</b><p>' + esc(item[2]) + '</p></div></div>';
    }).join("");
    var details = doc.details.map(function (item) {
      return '<div class="detail-note"><b>' + esc(item[0]) + '</b><p>' + esc(item[1]) + '</p></div>';
    }).join("");
    var sources = doc.sources.map(function (item) { return '<li>' + esc(item) + '</li>'; }).join("");
    return '<article class="confession-page"><header class="confession-hero"><div class="confession-meta"><span>' + esc(doc.family) + '</span><span>' + esc(doc.period) + '</span><span>' + esc(doc.origin) + '</span><span>' + esc(doc.type) + '</span></div><h3>' + esc(doc.title) + '<span class="eng">' + esc(doc.english) + '</span></h3><p class="sum">' + esc(doc.summary) + '</p></header><div class="confession-body"><div class="confession-main"><section class="confession-section"><h4>문서 구조</h4><div class="structure-list">' + structure + '</div></section><section class="confession-section"><h4>세부 해설</h4>' + details + '</section></div><aside class="confession-side"><section class="confession-section"><h4>특징</h4><div class="feature-list">' + tags(doc.features) + '</div></section><section class="confession-section"><h4>연결 교리</h4><div class="feature-list">' + tags(doc.topics) + '</div></section><section class="confession-section"><h4>참고 파일·해설 축</h4><ul class="source-list">' + sources + '</ul></section></aside></div>' + renderLordDaysIfNeeded(doc) + '</article>';
  }

  function renderCard(card) {
    return '<details class="study-card"><summary><span class="kind">학습 카드</span><h4>' + esc(card[0]) + '</h4><span class="anchor">' + esc(card[1]) + '</span><p class="summary">' + esc(card[2]) + '</p></summary><div class="study-card-body"><div class="feature-list">' + tags(card[3]) + '</div></div></details>';
  }

  function renderConfessions() {
    ensureStyles();
    fixTabOrder();
    appendCount();
    if (typeof state !== "undefined" && state.trad === "신정통주의") {
      view.innerHTML = '<div class="empty"><b>신앙고백·교리문답</b>은 현재 개혁파 정통과 고대 보편 신경 중심으로 구성되어 있습니다.<br>전통 필터를 전체 또는 개혁파로 바꾸면 볼 수 있습니다.</div>';
      return;
    }
    if (!state.confessionId) state.confessionId = "apostles";
    var docs = DOCS.filter(function (doc) { return matches(textPool(doc)); });
    var cards = CARDS.filter(function (card) { return matches(card.join(" ")); });
    var active = docs.find(function (doc) { return doc.id === state.confessionId; }) || DOCS.find(function (doc) { return doc.id === state.confessionId; }) || docs[0] || DOCS[0];
    view.innerHTML = '<section class="confession-wrap"><div class="confession-intro"><span class="loci-label">CONFESSIONS · CATECHISMS</span><h3>신앙고백·교리문답 페이지</h3><p>고대 보편 신경에서 종교개혁 신앙고백과 교리문답으로 이어지는 흐름을 한 페이지에서 비교합니다.</p><p class="confession-group-note">권장 읽기 순서: 사도신경 → 니케아 신경 → 칼케돈 신조 → 아타나시우스 신경 → 웨스트민스터·하이델베르크·세 일치 신조.</p></div><div class="confession-switch">' + DOCS.map(function (doc) { return button(doc, active.id); }).join("") + '</div>' + renderDoc(active) + '<section class="topic-section" style="margin-top:18px"><h4>학습·비교 카드</h4><p class="muted">암기, 설교 도입, 교리반 토론, 개념비교 페이지 연결에 쓸 수 있는 카드입니다.</p><div class="confession-card-grid">' + (cards.length ? cards.map(renderCard).join("") : '<div class="empty"><b>카드</b>에서 조건에 맞는 항목을 찾지 못했습니다.</div>') + '</div></section></section>';
    view.querySelectorAll("[data-confession-id]").forEach(function (btn) {
      btn.onclick = function () { state.confessionId = btn.dataset.confessionId; renderConfessions(); };
    });
  }

  fixTabOrder();
  setTimeout(fixTabOrder, 0);
  setTimeout(fixTabOrder, 100);
  appendCount();
  if (typeof VIEWS !== "undefined") VIEWS.confessions = renderConfessions;
}());
