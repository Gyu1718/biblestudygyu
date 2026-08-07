/* Adds explanatory answers to history key questions without rewriting the base history JSON. */
(function () {
  const explanations = {
    "history-index": [
      {
        question: "개혁파, 장로교, 칼빈주의는 어떻게 구분되는가?",
        answer: "개혁파는 종교개혁 이후 형성된 넓은 신학 전통을 가리키고, 장로교는 그 전통이 장로회 정치와 신앙고백 문서로 제도화된 교회 형태를 가리킨다. 칼빈주의는 개혁파 신학의 특징을 압축하는 말이지만, 전통 전체를 칼빈 개인이나 예정론 하나로 축소할 때 혼란을 만든다. 이 세 용어는 겹치지만 같은 층위의 말이 아니므로 역사, 신학, 교회 제도를 구분해서 읽어야 한다."
      },
      {
        question: "종교개혁 이후 개혁신학은 어떤 역사적 흐름 속에서 형성되었는가?",
        answer: "개혁신학은 루터파와 구별되는 스위스·제네바·하이델베르크·네덜란드·스코틀랜드의 개혁운동 속에서 형성되었다. 초기 종교개혁의 성경 권위와 예배 개혁은 이후 신앙고백, 요리문답, 교회정치, 정통주의 교의학으로 체계화되었다. 따라서 개혁신학은 한순간의 사상이 아니라 교회 개혁과 교육, 논쟁, 신앙고백을 통해 형성된 역사적 전통이다."
      },
      {
        question: "신앙고백과 정통주의는 개혁신학에서 어떤 역할을 하는가?",
        answer: "신앙고백은 교회가 성경을 어떻게 공적으로 이해하고 가르치는지를 압축해 표현한 문서다. 정통주의는 그 신앙고백적 내용을 논쟁과 교육의 상황 속에서 더 정교하게 설명한 신학적 체계화의 과정이다. 그래서 신앙고백과 정통주의는 성경을 대체하는 권위가 아니라, 교회가 성경을 함께 읽고 가르치기 위한 역사적·교리적 도구로 기능한다."
      },
      {
        question: "현대 개혁신학을 읽기 위해 왜 정통주의와 신칼빈주의의 흐름을 함께 보아야 하는가?",
        answer: "정통주의는 개혁파 교리의 신앙고백적·조직신학적 뼈대를 제공하고, 신칼빈주의는 그 전통이 근대 학문, 문화, 사회 문제와 만나는 방식을 보여 준다. 하나만 보면 교리의 구조나 현대적 적용 중 한쪽이 약해진다. 두 흐름을 함께 보면 개혁신학이 교회의 고백이면서 동시에 세계와 학문을 해석하는 신학적 전통이라는 점을 더 입체적으로 이해할 수 있다."
      }
    ],
    "reformation-to-reformed": [
      {
        question: "종교개혁은 왜 하나의 단일 전통으로만 설명될 수 없는가?",
        answer: "종교개혁은 복음과 성경 권위의 회복이라는 공통 문제의식에서 출발했지만, 지역과 논쟁 상황에 따라 루터파, 개혁파, 재세례파, 로마가톨릭 개혁 등 서로 다른 흐름으로 전개되었다. 독일의 칭의 논쟁, 스위스의 예배와 성례 개혁, 제네바의 교회 질서, 스코틀랜드의 장로회 정치가 같은 방식으로 발전한 것은 아니다. 따라서 종교개혁을 하나의 이름으로만 묶으면 각 전통의 신학적 차이와 교회적 형성을 놓치게 된다."
      },
      {
        question: "루터파와 개혁파는 어떤 점에서 공통되고 어떤 점에서 구별되는가?",
        answer: "루터파와 개혁파는 모두 성경 권위, 은혜에 의한 구원, 믿음으로 말미암는 칭의를 강조한다. 그러나 성찬에서 그리스도의 임재를 설명하는 방식, 예배 개혁의 범위, 교회 질서와 권징의 이해에서는 뚜렷한 차이를 보인다. 개혁파는 특히 말씀에 따라 예배와 교회 제도를 계속 개혁해야 한다는 원리를 더 강하게 발전시켰다."
      },
      {
        question: "개혁파 전통은 왜 성경, 성례, 교회 개혁을 함께 다루는가?",
        answer: "개혁파 전통에서 성경은 교리만이 아니라 예배, 성례, 교회 질서를 판단하는 최종 기준이다. 그래서 성경론은 곧 성례론과 교회론으로 이어지고, 교회의 실제 제도와 예배 방식까지 개혁의 대상이 된다. 이 점에서 개혁파 신학은 추상적 교리 체계가 아니라 말씀 아래에서 교회를 새롭게 세우려는 전통이다."
      },
      {
        question: "개혁파 전통은 도시 개혁과 교회 질서의 문제를 어떻게 신학화했는가?",
        answer: "취리히와 제네바의 종교개혁은 도시 공동체의 예배, 교육, 빈민 구제, 권징, 공적 질서와 긴밀히 연결되었다. 개혁파는 교회가 말씀과 성례만이 아니라 실제 공동체의 삶과 질서 속에서 개혁되어야 한다고 보았다. 그래서 도시 개혁은 단순한 정치적 개편이 아니라 교회와 사회가 하나님의 말씀 앞에서 새롭게 질서 잡히는 신학적 사건으로 이해되었다."
      }
    ],
    "reformed-and-presbyterian": [
      {
        question: "개혁파와 장로교는 동일한 말인가?",
        answer: "개혁파와 장로교는 서로 깊이 연결되어 있지만 완전히 같은 말은 아니다. 개혁파는 16세기 종교개혁에서 형성된 넓은 신학 전통이고, 장로교는 그 전통이 장로회 정치와 웨스트민스터 신앙고백 전통을 중심으로 제도화된 교회 형태다. 따라서 모든 장로교회는 원칙적으로 개혁파 전통 안에 있지만, 모든 개혁파 교회가 장로교인 것은 아니다."
      },
      {
        question: "칼빈주의라는 말은 언제 유용하고 언제 혼란을 만드는가?",
        answer: "칼빈주의라는 말은 하나님의 주권, 은혜의 우선성, 예정론, 언약신학처럼 개혁파 신학의 특징을 압축해서 말할 때 유용하다. 그러나 개혁파 전통 전체를 칼빈 개인의 사상으로 축소하거나, 예정론 하나만을 칼빈주의의 전부처럼 말할 때 혼란이 생긴다. 개혁파 전통은 칼빈뿐 아니라 츠빙글리, 불링거, 베자, 우르시누스, 투레틴, 바빙크, 벌코프 등 여러 인물과 신앙고백 문서를 통해 발전했다."
      },
      {
        question: "장로회 정치는 개혁신학과 어떻게 연결되는가?",
        answer: "장로회 정치는 단순한 행정 방식이 아니라 그리스도께서 말씀으로 교회를 다스리신다는 개혁파 교회론의 제도적 표현이다. 교회의 권위는 한 개인이나 성직 계급에게 집중되지 않고, 목사와 장로가 함께 말씀 아래에서 분별하고 치리하는 회의 구조로 나타난다. 당회, 노회, 총회로 이어지는 구조는 교회의 질서와 상호 책임성을 지키기 위한 신학적 장치다."
      },
      {
        question: "한국 장로교는 개혁파 전통을 어떤 방식으로 수용했는가?",
        answer: "한국 장로교는 주로 미국 북장로교와 남장로교 선교를 통해 성경 중심 신앙, 웨스트민스터 표준문서, 장로회 정치, 보수적 복음주의 경향을 수용했다. 그러나 그 수용은 단순한 이식이 아니라 부흥운동, 새벽기도, 성경공부, 민족사의 고난, 분단과 전쟁, 급속한 교회 성장 속에서 한국적 경건과 결합되었다. 그러므로 한국 장로교는 서구 개혁파 전통을 계승하면서도 한국 교회의 역사와 문화 속에서 독특하게 형성된 전통이다."
      }
    ],
    "synod-of-dort": [
      {
        question: "도르트 총회는 왜 열렸는가?",
        answer: "도르트 총회는 네덜란드 개혁교회 안에서 아르미니우스와 그의 추종자들이 제기한 예정, 은혜, 인간 의지에 관한 논쟁에 응답하기 위해 열렸다. 이 논쟁은 단순한 학문적 차이가 아니라 교회의 설교, 교리교육, 구원 이해를 흔드는 문제로 받아들여졌다. 그래서 도르트 총회는 국제 개혁파 대표들이 함께 모여 개혁파 구원론을 신앙고백적으로 정리한 사건이다."
      },
      {
        question: "도르트 신경은 예정론만을 말하는 문서인가?",
        answer: "도르트 신경은 예정론을 중요하게 다루지만 예정론만을 말하는 문서는 아니다. 인간의 부패, 그리스도의 속죄, 은혜의 효력, 성도의 견인까지 구원의 전 과정을 함께 설명한다. 따라서 도르트 신경은 하나님의 선택 교리를 고립된 사변으로 제시하기보다, 은혜가 죄인을 실제로 구원한다는 복음의 논리 안에서 다룬다."
      },
      {
        question: "개혁파 구원론에서 은혜와 인간 의지는 어떻게 이해되는가?",
        answer: "개혁파 구원론은 타락한 인간의 의지가 스스로 하나님께 돌아갈 능력을 갖고 있다고 보지 않는다. 구원은 인간 의지의 자율적 결단에서 시작되는 것이 아니라 성령께서 말씀을 통해 죄인을 새롭게 하시는 은혜에서 시작된다. 그러나 이것은 인간을 기계로 만든다는 뜻이 아니라, 은혜가 인간의 의지를 회복시켜 자발적으로 그리스도를 믿고 따르게 한다는 의미다."
      },
      {
        question: "도르트 신경과 이른바 TULIP 공식은 어떤 관계에 있는가?",
        answer: "TULIP은 도르트 신경의 핵심 내용을 후대에 다섯 항목으로 요약한 교육용 공식이다. 그러나 도르트 신경 자체는 TULIP보다 더 목회적이고 신앙고백적인 문서이며, 각 조항마다 성경적 근거와 목회적 위로를 함께 다룬다. 그러므로 TULIP은 입문용으로 유용하지만, 도르트 신경 전체를 대체하는 요약으로 사용되면 문서의 깊이를 줄일 수 있다."
      }
    ],
    "westminster-assembly": [
      {
        question: "웨스트민스터 총회는 왜 장로교 전통에서 중요한가?",
        answer: "웨스트민스터 총회는 장로교 신앙고백, 교회정치, 예배, 교리교육을 표준 문서의 형태로 정리한 결정적 사건이다. 웨스트민스터 신앙고백과 대소요리문답은 이후 영어권 장로교와 한국 장로교의 교리적 기준이 되었다. 그래서 이 총회는 장로교가 무엇을 믿고, 어떻게 예배하고, 어떤 질서로 교회를 세우는지를 보여 주는 역사적 기준점이다."
      },
      {
        question: "웨스트민스터 문서들은 교리, 예배, 정치, 교육을 어떻게 함께 다루는가?",
        answer: "웨스트민스터 문서들은 신앙고백만이 아니라 요리문답, 공예배 지침, 교회정치 문서를 함께 산출했다. 이것은 교리가 머릿속의 체계로만 남지 않고 예배, 성례, 권징, 교육의 실제 질서로 이어져야 한다는 장로교적 확신을 보여 준다. 따라서 웨스트민스터 전통은 교리 문서인 동시에 교회를 세우는 실천적 문서 전통이다."
      },
      {
        question: "웨스트민스터 신앙고백은 언약신학과 어떤 관련이 있는가?",
        answer: "웨스트민스터 신앙고백은 하나님의 창조, 타락, 구원, 교회, 성례를 언약의 틀 속에서 정리한다. 행위언약과 은혜언약의 구분은 인간의 책임, 그리스도의 중보, 구원의 적용을 체계적으로 설명하는 중요한 구조가 된다. 이 때문에 웨스트민스터 전통에서 언약신학은 단순한 부가 교리가 아니라 성경 전체와 구원사를 읽는 핵심 틀로 기능한다."
      },
      {
        question: "한국 장로교가 웨스트민스터 전통을 수용할 때 무엇을 기준으로 삼아야 하는가?",
        answer: "한국 장로교가 웨스트민스터 전통을 수용할 때는 단순한 교단 표어나 보수성의 상징으로만 삼지 말아야 한다. 성경 권위, 신앙고백적 교리교육, 공예배의 질서, 장로회 정치, 권징과 목회적 책임이 함께 수용되어야 한다. 그래야 웨스트민스터 전통이 문서상의 명칭이 아니라 교회의 실제 신앙과 질서를 세우는 기준이 될 수 있다."
      }
    ],
    "reformed-orthodoxy": [
      {
        question: "개혁파 정통주의는 종교개혁 신학의 왜곡인가, 체계화인가?",
        answer: "개혁파 정통주의는 종교개혁 신학을 단순히 왜곡한 시기로만 볼 수 없다. 종교개혁 이후 개혁파 교회가 로마가톨릭, 루터파, 재세례파, 항론파 등과 논쟁하면서 교리를 더 명료하게 정리한 체계화의 과정이었다. 물론 방법과 강조점의 변화는 있었지만, 정통주의는 종교개혁 신학을 교육과 논쟁, 신앙고백의 언어로 보존하고 발전시킨 흐름으로 보아야 한다."
      },
      {
        question: "스콜라주의는 내용인가, 방법인가?",
        answer: "스콜라주의는 반드시 특정한 교리 내용만을 뜻하지 않고, 질문을 세우고 구분하고 논증하는 학문적 방법을 가리킬 때가 많다. 개혁파 정통주의자들은 이 방법을 사용해 성경과 신앙고백의 내용을 체계적으로 설명하고 논쟁에 응답했다. 그러므로 스콜라주의라는 말만으로 곧바로 비성경적이거나 로마가톨릭적이라고 판단하면 역사적 실제를 지나치게 단순화하게 된다."
      },
      {
        question: "개혁파 정통주의는 언약신학과 예정론을 어떻게 체계화했는가?",
        answer: "개혁파 정통주의는 하나님의 작정과 예정, 은혜언약, 그리스도의 중보, 구원의 적용을 조직신학적 구조 안에서 정교하게 설명했다. 언약신학은 성경의 구원사를 읽는 틀로, 예정론은 구원이 하나님의 은혜에서 시작되고 완성된다는 교리로 자리 잡았다. 이 체계화는 추상적 사변만이 아니라 교리교육과 설교, 논쟁적 변증을 위한 목적을 가졌다."
      },
      {
        question: "정통주의와 경건은 대립하는가?",
        answer: "정통주의와 경건을 단순히 대립시키는 것은 역사적으로 부정확하다. 청교도와 네덜란드 개혁파 전통에서 볼 수 있듯이, 정교한 교리 체계와 깊은 경건 훈련은 함께 나타나는 경우가 많았다. 개혁파 정통주의의 목적은 차가운 논리 자체가 아니라 교회가 바른 복음 이해 안에서 예배하고 살도록 돕는 것이었다."
      }
    ],
    "modern-liberal-theology-background": [
      {
        question: "신정통주의는 왜 근대 자유주의 신학에 대한 반응으로 등장했는가?",
        answer: "신정통주의는 근대 자유주의 신학이 인간 경험, 문화, 역사 의식 안에서 기독교를 설명하려는 경향에 대한 반응으로 등장했다. 제1차 세계대전은 인간 문화와 진보에 대한 낙관을 무너뜨렸고, 바르트는 자유주의 신학이 하나님의 계시를 인간 종교성 안에 흡수한다고 비판했다. 따라서 신정통주의는 반지성주의가 아니라 신학의 출발점을 인간이 아니라 하나님의 말씀에 두려는 재정위였다."
      },
      {
        question: "슐라이어마허와 하르낙은 어떤 점에서 바르트의 비판 대상이 되는가?",
        answer: "슐라이어마허는 종교를 인간의 경건 의식에서 설명했고, 하르낙은 역사적 예수와 기독교의 본질을 근대 문화의 언어로 재해석했다. 바르트는 이런 접근이 기독교 신앙의 출발점을 하나님의 자기계시가 아니라 인간의 종교 경험과 문화 판단에 둔다고 보았다. 그래서 그는 자유주의 신학을 단순히 틀린 의견이 아니라 계시론의 출발점이 잘못 놓인 신학으로 비판했다."
      },
      {
        question: "근대 신학의 경험·역사·문화 중심성은 계시론과 어떻게 충돌하는가?",
        answer: "근대 신학은 종교 경험, 역사비평, 문화적 보편성을 통해 신앙을 설명하려는 경향을 보였다. 바르트의 관점에서 이것은 계시를 하나님이 자유롭게 말씀하시는 사건이 아니라 인간이 해석하고 소유할 수 있는 대상으로 바꾸는 위험을 갖는다. 따라서 충돌의 핵심은 경험이나 역사를 전혀 보지 말자는 것이 아니라, 신학의 규범과 출발점이 인간에게 있는가 하나님의 말씀에 있는가에 있다."
      },
      {
        question: "개혁파 정통과 신정통주의는 자유주의 신학을 어떤 방식으로 다르게 비판하는가?",
        answer: "개혁파 정통은 성경의 영감과 권위, 신앙고백적 교리 체계를 기준으로 자유주의 신학을 비판한다. 신정통주의는 인간 종교성과 문화개신교가 하나님의 말씀을 포획하려 한다는 계시론적 관점에서 자유주의를 비판한다. 두 전통은 자유주의의 인간 중심성을 문제 삼는 점에서는 만날 수 있지만, 성경론과 신앙고백의 권위를 설명하는 방식에서는 중요한 차이를 보인다."
      }
    ],
    "dialectical-theology": [
      {
        question: "변증법적 신학은 왜 제1차 세계대전 이후 등장했는가?",
        answer: "제1차 세계대전은 유럽 문명과 인간 진보에 대한 자유주의적 낙관을 크게 무너뜨렸다. 바르트와 초기 변증법적 신학자들은 인간 문화와 종교가 하나님의 나라를 점진적으로 실현한다는 생각을 의심하게 되었다. 그래서 하나님의 말씀은 인간 역사의 연속선 위에 놓이는 것이 아니라, 인간을 심판하고 새롭게 부르는 타자로 선포되었다."
      },
      {
        question: "하나님과 인간 사이의 질적 차이는 무엇을 의미하는가?",
        answer: "하나님과 인간 사이의 질적 차이는 하나님이 인간의 종교성, 도덕성, 문화 능력의 연장선에서 파악될 수 없다는 뜻이다. 인간은 스스로 하나님께 올라가거나 하나님을 소유할 수 없고, 하나님은 자유롭게 자신을 계시하시는 분이다. 이 강조는 하나님의 초월성을 회복하려는 의도였지만, 개혁파 정통의 창조·일반계시 이해와는 긴장을 만들기도 한다."
      },
      {
        question: "바르트의 『로마서』 주석은 왜 현대신학의 전환점으로 읽히는가?",
        answer: "바르트의 『로마서』 주석은 성경을 인간 종교 경험의 문헌으로 읽기보다 하나님의 심판과 은혜의 말씀으로 새롭게 들으려 했다는 점에서 충격을 주었다. 이 책은 자유주의적 문화개신교의 낙관과 역사주의적 해석에 강한 문제를 제기했다. 그래서 현대신학사에서는 바르트가 신학의 중심을 인간에서 하나님 말씀으로 돌려놓은 상징적 전환점으로 읽힌다."
      },
      {
        question: "변증법적 신학과 개혁파 정통주의는 하나님의 초월성을 어떻게 다르게 설명하는가?",
        answer: "변증법적 신학은 하나님과 인간 사이의 단절, 심판, 말씀의 사건성을 통해 하나님의 초월성을 강조한다. 개혁파 정통주의는 창조주와 피조물의 구분, 하나님의 작정과 섭리, 일반계시와 특별계시의 질서를 통해 초월성을 설명한다. 두 전통 모두 하나님을 인간에게 종속시키지 않으려 하지만, 계시와 창조 질서를 연결하는 방식은 서로 다르다."
      }
    ],
    "barth-and-neo-orthodoxy": [
      {
        question: "바르트는 왜 자유주의 신학을 비판했는가?",
        answer: "바르트는 자유주의 신학이 하나님의 말씀을 인간의 종교 경험, 윤리, 문화 의식 안에 흡수한다고 보았다. 특히 제1차 세계대전은 인간 문화와 진보에 대한 낙관이 얼마나 취약한지를 드러냈고, 바르트는 신학이 다시 하나님의 계시 앞에 서야 한다고 주장했다. 그의 비판은 근대 학문 자체의 거부라기보다, 신학의 주체와 기준을 하나님에게 돌려놓으려는 시도였다."
      },
      {
        question: "바르트의 계시론은 개혁파 정통 성경론과 어떻게 다른가?",
        answer: "개혁파 정통 성경론은 성경을 하나님의 영감된 말씀으로 보고, 기록된 말씀의 권위와 충분성을 강조한다. 바르트는 성경을 하나님의 말씀에 대한 증언으로 보며, 하나님이 성경을 통해 지금 말씀하실 때 성경이 하나님의 말씀이 된다는 사건성을 강조한다. 이 차이는 성경을 존중한다는 공통점 안에서도 성경의 권위와 계시의 관계를 설명하는 방식이 다르다는 점을 보여 준다."
      },
      {
        question: "바르트의 그리스도 중심 예정론은 도르트와 웨스트민스터 전통과 어떻게 갈라지는가?",
        answer: "도르트와 웨스트민스터 전통은 하나님의 영원한 작정 안에서 선택과 유기, 구원의 적용을 신앙고백적으로 설명한다. 바르트는 예정론의 출발점을 숨은 작정이 아니라 예수 그리스도 안에 계시된 하나님의 자기결정으로 옮긴다. 그래서 그는 예수 그리스도를 선택하시는 하나님이자 선택받은 인간으로 말하며, 이 점에서 전통 개혁파 예정론과 뚜렷하게 갈라진다."
      },
      {
        question: "신정통주의를 개혁신학 연구 아카이브 안에 넣을 때 어떤 비교 기준이 필요한가?",
        answer: "신정통주의를 개혁신학 아카이브에 넣는 것은 동일시가 아니라 비교를 위한 배치여야 한다. 공통점은 자유주의 신학의 인간 중심성을 비판하고 하나님의 말씀을 강조한다는 데 있지만, 성경론, 자연신학, 예정론, 신앙고백의 권위에서는 분명한 차이가 있다. 그러므로 비교 기준은 유사성보다 차이를 정밀하게 드러내는 방향으로 세워야 한다."
      }
    ],
    "reformed-orthodoxy-and-neo-orthodoxy": [
      {
        question: "개혁파 정통주의와 신정통주의는 왜 모두 하나님의 말씀을 강조하는가?",
        answer: "두 전통은 모두 신학이 인간의 자율적 사유나 종교 경험에서 출발해서는 안 된다는 문제의식을 공유한다. 개혁파 정통주의는 성경의 영감과 권위를 통해 하나님의 말씀을 강조하고, 신정통주의는 하나님의 자유로운 계시 사건과 교회의 선포를 통해 말씀을 강조한다. 같은 표현을 쓰지만 말씀의 권위가 어떻게 성경, 계시, 선포와 연결되는지에서는 차이가 있다."
      },
      {
        question: "두 전통은 성경의 권위와 계시의 관계를 어떻게 다르게 이해하는가?",
        answer: "개혁파 정통은 성경을 하나님의 영감된 기록 말씀으로 이해하며, 성경의 권위와 충분성을 신학의 객관적 기준으로 삼는다. 신정통주의는 성경을 계시에 대한 인간적 증언으로 보면서, 하나님이 성경을 통해 말씀하시는 사건을 강조한다. 이 차이는 두 전통이 모두 성경을 중요하게 여기면서도 성경과 계시의 동일성, 증언성, 사건성을 다르게 배열한다는 점을 보여 준다."
      },
      {
        question: "바르트의 예정론은 도르트와 웨스트민스터 전통과 어떤 점에서 충돌하는가?",
        answer: "도르트와 웨스트민스터는 하나님의 영원한 작정 안에서 선택과 유기를 구분하며, 구원의 적용을 성령의 사역과 연결해 설명한다. 바르트는 예수 그리스도 안에서 하나님 자신이 선택하시는 주체이자 선택받는 인간이 되신다고 말하며, 예정론을 그리스도 중심적으로 재구성한다. 이로 인해 선택과 유기, 보편성과 특수성, 심판과 은혜의 관계를 설명하는 방식이 전통 개혁파와 충돌한다."
      },
      {
        question: "개혁신학 연구 아카이브에서 신정통주의를 비교 대상으로 둘 때 어떤 균형이 필요한가?",
        answer: "신정통주의를 비교 대상으로 둔다는 것은 개혁파 정통과 같은 전통으로 승인한다는 뜻이 아니다. 동시에 바르트와 신정통주의를 단순히 배제하면 20세기 신학이 제기한 계시, 성경, 자유주의 비판의 문제를 놓치게 된다. 따라서 아카이브는 개혁파 정통의 기준을 분명히 유지하면서 신정통주의의 문제의식과 차이를 함께 보여 주어야 한다."
      }
    ],
    "natural-theology-debate": [
      {
        question: "브루너가 말한 접촉점은 무엇인가?",
        answer: "브루너가 말한 접촉점은 타락한 인간 안에도 하나님의 말씀을 들을 수 있는 어떤 형식적 가능성이나 책임의 자리가 남아 있다는 주장과 관련된다. 그는 자연과 은총, 인간 본성과 계시의 관계를 완전히 단절시키지 않으려 했다. 바르트는 바로 이 지점이 하나님의 자유로운 계시를 인간의 가능성 안에 가두는 위험을 가진다고 보았다."
      },
      {
        question: "바르트는 왜 자연신학을 거부했는가?",
        answer: "바르트는 자연신학이 하나님을 아는 근거를 하나님의 자기계시가 아니라 인간의 자연적 능력이나 세계 해석 안에서 찾는다고 보았다. 그에게 하나님은 오직 예수 그리스도 안에서 자유롭게 자신을 알리시는 분이며, 신학은 그 계시에서 출발해야 한다. 그래서 자연신학 거부는 창조세계의 부정이 아니라 계시의 주권을 지키려는 신학 방법론의 문제다."
      },
      {
        question: "자연신학 논쟁은 자유주의 신학 비판과 어떻게 연결되는가?",
        answer: "자유주의 신학은 인간 경험, 역사, 문화 안에서 하나님과 기독교의 의미를 설명하려는 경향을 보였다. 바르트는 자연신학도 비슷하게 하나님을 인간이 파악할 수 있는 자연적 질서 안에 위치시키는 위험을 가진다고 보았다. 따라서 자연신학 논쟁은 단순한 신 존재 증명 논쟁이 아니라 자유주의 신학의 인간 중심적 출발점에 대한 비판과 연결된다."
      },
      {
        question: "개혁파 정통의 일반계시 이해와 바르트의 자연신학 거부는 어떻게 다른가?",
        answer: "개혁파 정통은 하나님이 창조세계와 인간 양심 속에서 자신을 일반적으로 드러내신다고 보며, 이것을 특별계시와 구분하면서도 연결한다. 바르트는 자연신학이 인간의 자연적 인식에서 하나님을 알 수 있다고 주장할 때 계시의 자유를 훼손한다고 판단했다. 따라서 개혁파 일반계시론과 바르트의 자연신학 거부는 모두 하나님 인식의 문제를 다루지만, 창조 질서와 계시의 관계를 설정하는 방식이 다르다."
      }
    ],
    "barth-election-doctrine": [
      {
        question: "바르트는 왜 예정론의 출발점을 예수 그리스도에게 두는가?",
        answer: "바르트는 하나님이 누구를 선택하고 버리시는지를 하나님의 숨은 의지에서 찾기보다, 예수 그리스도 안에서 계시된 하나님의 자기결정에서 출발해야 한다고 보았다. 예수 그리스도는 하나님의 선택이 무엇인지 드러내는 중심이며, 예정론은 그리스도 밖의 추상적 작정이 아니라 그리스도 안의 복음으로 이해된다. 이 점에서 바르트는 예정론을 공포의 교리가 아니라 복음의 중심 교리로 재배치한다."
      },
      {
        question: "바르트에게 예수 그리스도가 선택하시는 하나님이자 선택받은 인간이라는 말은 무엇을 뜻하는가?",
        answer: "바르트에게 예수 그리스도는 단지 선택의 대상들 가운데 하나가 아니라, 선택하시는 하나님 자신이 인간으로 오신 분이다. 동시에 그는 인간을 대표하여 선택받은 인간이며, 인간의 거절과 심판까지 짊어지는 분이다. 이 구조 때문에 바르트의 예정론은 하나님의 선택과 인간의 선택을 예수 그리스도 한 인격 안에서 함께 설명하려 한다."
      },
      {
        question: "바르트의 예정론은 도르트 신경과 웨스트민스터 신앙고백의 예정론과 어디서 갈라지는가?",
        answer: "도르트와 웨스트민스터는 하나님의 영원한 작정 안에서 선택과 유기를 구분하고, 구원의 적용을 특정한 택자에게 주어지는 은혜로 설명한다. 바르트는 선택과 유기의 중심을 예수 그리스도 안으로 옮기며, 그리스도 안에서 하나님이 인간을 위해 스스로 심판을 담당하신다고 말한다. 이 차이 때문에 바르트의 예정론은 전통 개혁파 예정론과 용어를 공유하면서도 구조와 결론에서 크게 달라진다."
      },
      {
        question: "바르트의 예정론은 보편구원론인가, 아니면 그보다 더 복잡한 그리스도 중심 구원론인가?",
        answer: "바르트의 예정론은 모든 인간을 예수 그리스도 안에서 이해하려 하기 때문에 보편구원론으로 읽힐 여지가 있다. 그러나 바르트는 단순히 모든 사람이 자동으로 구원받는다고 말하기보다, 그리스도 안에서 하나님의 은혜와 인간의 거절, 복음의 선포와 응답의 문제를 함께 다룬다. 따라서 그의 입장은 단순 보편구원론이라는 딱지보다 그리스도 중심 선택론의 구조와 긴장 속에서 읽어야 한다."
      }
    ]
  };

  window.__HISTORY_QUESTION_EXPLANATIONS__ = explanations;

  const safeArr = value => Array.isArray(value) ? value : [];
  const esc = value => String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

  function questionExplanationsFor(historyItem) {
    if (!historyItem) return [];
    const fromItem = safeArr(historyItem.keyQuestionExplanations);
    if (fromItem.length) return fromItem;
    return explanations[historyItem.id] || [];
  }

  function injectHistoryQuestionStyles() {
    if (document.querySelector("#history-question-explanation-styles")) return;
    const style = document.createElement("style");
    style.id = "history-question-explanation-styles";
    style.textContent = `
      .history-question-grid{grid-template-columns:1fr}
      .history-question-card{position:relative;padding:16px 16px 15px}
      .history-question-card .question-label{display:inline-block;margin-bottom:7px;font-family:var(--font-mono);font-size:.68rem;letter-spacing:.1em;color:var(--muted)}
      .history-question-card b{font-size:.98rem;line-height:1.55;color:var(--ink)}
      .history-question-card p{margin:8px 0 0;line-height:1.75}
    `;
    document.head.appendChild(style);
  }

  function questionSectionHTML(historyItem, fallbackList) {
    const explained = questionExplanationsFor(historyItem);
    if (explained.length) {
      return `<section class="history-section"><h4>핵심 질문</h4><div class="history-grid history-question-grid">${explained.map(item => `
        <div class="history-mini history-question-card">
          <span class="question-label">QUESTION</span>
          <b>${esc(item.question)}</b>
          <p>${esc(item.answer || item.explanation || "")}</p>
        </div>`).join("")}</div></section>`;
    }
    return safeArr(historyItem.keyQuestions).length ? `<section class="history-section"><h4>핵심 질문</h4>${fallbackList(historyItem.keyQuestions)}</section>` : "";
  }

  injectHistoryQuestionStyles();

  if (typeof historyText === "function") {
    const originalHistoryText = historyText;
    historyText = function (historyItem) {
      const explanationText = questionExplanationsFor(historyItem)
        .map(item => [item.question, item.answer || item.explanation].join(" "))
        .join(" ");
      return [originalHistoryText(historyItem), explanationText].join(" ");
    };
  }

  if (typeof renderHistoryDetail === "function") {
    renderHistoryDetail = function (id) {
      const h = DATA.history.find(x => x.id === id);
      if (!h) {
        view.innerHTML = `<div class="empty">역사 항목을 찾지 못했습니다.<br><button class="back-btn" data-back="history">역사 목록으로</button></div>`;
        if (typeof wireBackButtons === "function") wireBackButtons();
        return;
      }
      const list = items => safeArr(items).length ? `<ul class="history-list">${safeArr(items).map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : "";
      const mini = (items, titleKey, subKey, noteKey) => safeArr(items).map(item => `<div class="history-mini"><b>${esc(item[titleKey] || item.name || item.title || "항목")}</b>${item[subKey] ? `<span>${esc(item[subKey])}</span>` : ""}${item[noteKey] ? `<p>${esc(item[noteKey])}</p>` : ""}</div>`).join("");
      const relatedTopics = safeArr(h.relatedTopics).map(t => `<button type="button" data-topic-jump="${esc(t)}">${esc(t)}</button>`).join("");
      const relatedBooks = safeArr(h.relatedBooks).map(id => `<button type="button" data-book-jump="${esc(id)}">📖 ${esc(typeof bookTitle === "function" ? bookTitle(id) : id)}</button>`).join("");
      const relatedAuthors = safeArr(h.relatedAuthors).map(id => `<span>${esc(typeof authorTitle === "function" ? authorTitle(id) : id)}</span>`).join("");
      const pointers = safeArr(h.quotePointers).map(p => `<div class="history-mini"><b>${esc(p.source || "인용 위치")}</b>${p.location ? `<span>${esc(p.location)}</span>` : ""}${p.note ? `<p>${esc(p.note)}</p>` : ""}</div>`).join("");
      view.innerHTML = `
        <article class="detail-page">
          <header class="detail-hero">
            <button class="back-btn" data-back="history">← 역사 목록</button>
            <span class="loci-label" style="display:block;margin-top:14px">HISTORY · ${esc(h.category || "개혁전통의 역사")}</span>
            <h2>${esc(h.title)}</h2>
            <p class="by">${esc(h.period || "")}</p>
            ${h.summary ? `<p class="sum">${esc(h.summary)}</p>` : ""}
            ${h.definition ? `<p class="diverge"><b>정의</b>${esc(h.definition)}</p>` : ""}
          </header>
          <div class="history-detail-body">
            ${h.historicalBackground ? `<section class="history-section"><h4>역사적 배경</h4><p class="muted">${esc(h.historicalBackground)}</p></section>` : ""}
            ${questionSectionHTML(h, list)}
            ${safeArr(h.keyFigures).length ? `<section class="history-section"><h4>주요 인물</h4><div class="history-grid">${mini(h.keyFigures, "name", "", "role")}</div></section>` : ""}
            ${safeArr(h.keyDocuments).length ? `<section class="history-section"><h4>주요 문헌</h4><div class="history-grid">${mini(h.keyDocuments, "title", "year", "note")}</div></section>` : ""}
            ${safeArr(h.theologicalIssues).length ? `<section class="history-section"><h4>핵심 신학 쟁점</h4><div class="history-relations">${safeArr(h.theologicalIssues).map(x => `<span>${esc(x)}</span>`).join("")}</div></section>` : ""}
            ${(relatedTopics || relatedBooks || relatedAuthors) ? `<section class="history-section"><h4>연결 색인</h4><div class="history-relations">${relatedTopics}${relatedBooks}${relatedAuthors}</div></section>` : ""}
            ${safeArr(h.misunderstandings).length ? `<section class="history-section"><h4>자주 생기는 오해</h4>${list(h.misunderstandings)}</section>` : ""}
            ${safeArr(h.researchUses).length ? `<section class="history-section"><h4>연구 활용</h4>${list(h.researchUses)}</section>` : ""}
            ${pointers ? `<section class="history-section"><h4>인용 위치 메모</h4><div class="history-grid">${pointers}</div></section>` : ""}
            ${h.personalNote ? `<section class="history-section"><h4>개인 연구 메모</h4><p class="muted">${esc(h.personalNote)}</p></section>` : ""}
          </div>
        </article>`;
      if (typeof wireBackButtons === "function") wireBackButtons();
      if (typeof wireHistoryActions === "function") wireHistoryActions();
    };
  }

  if (typeof render === "function" && typeof state !== "undefined" && state.route && state.route.type === "history") {
    render();
  }
})();
