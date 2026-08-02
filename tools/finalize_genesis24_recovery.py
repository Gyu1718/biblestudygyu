#!/usr/bin/env python3
"""Build a complete plain-HTML Genesis 24 recovery edition.

Sections 0–7 are preserved byte-for-byte from the recoverable original HTML
prefix. The damaged text beginning with section 8 is replaced by a clearly
identified editorial supplement so the page is complete, searchable, and
usable without runtime decompression.
"""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "tools" / "genesis24-recoverable-prefix.html"
TARGET = ROOT / "ot" / "genesis" / "ch24.html"

SUPPLEMENT = r'''
<section class="part" id="s8">
  <div class="part-head"><div class="eyebrow">BACKGROUND · RECOVERY</div><h2>8. 역사·문화적 배경 (보론)</h2><div class="gloss">아람나하라임과 혼인 절차.</div></div>
  <p><b>복구 보완 안내.</b> 원본 압축 스트림은 이 절의 첫 문단 중간에서 손상되었다. 아래 8–16번은 보존된 목차와 앞선 논지를 따라 새로 정리한 보완 내용이다. 0–7번은 복구된 원문을 그대로 유지했다.</p>
  <p><b>아람나하라임</b>은 문자적으로 “두 강 사이의 아람”을 뜻하며, 하란을 포함한 북서 메소포타미아 지역을 가리킨다. “나홀의 성”은 나홀이라는 이름의 성읍일 수도 있고, 아브라함의 형제 나홀의 집안이 거주하던 성읍을 가리키는 표현일 수도 있다.</p>
  <p>혼인 교섭은 한 사람의 선택만으로 끝나지 않는다. 종은 아브라함의 집과 사명을 설명하고, 가족은 선물과 조건을 확인하며, 마지막에는 리브가에게 직접 “네가 이 사람과 함께 가려느냐”라고 묻는다(24:58). 가부장적 사회의 틀 안에서도 서사는 리브가의 결단을 사건의 전환점으로 기록한다.</p>
  <p>리브가에게 준 코걸이와 팔찌, 가족에게 준 은금 패물과 의복은 단순한 호의 이상의 기능을 한다. 종의 신뢰성과 아브라함 집안의 형편을 증명하고, 혼인 약속이 실제 책임을 수반한다는 것을 보여 준다. 그러나 본문은 거래보다 리브가의 환대와 신속한 순종을 더 길게 묘사한다.</p>
  <div class="back"><a href="#top">↑ 문서 처음으로</a></div>
</section>

<section class="part" id="s9">
  <div class="part-head"><div class="eyebrow">DEBATE</div><h2>9. 신학적 논쟁과 난제</h2><div class="gloss">표징, 섭리, 혼인, 종의 이름.</div></div>
  <h3>① 종의 요청은 미신적 표징인가</h3>
  <p>종이 구한 표징은 임의의 기적이 아니다. 낯선 여행자에게 물을 주고 열 마리 낙타까지 먹이는 행동은 상당한 수고와 환대를 요구한다. 종은 외모나 재산보다 아브라함의 집에 어울리는 성품이 드러나는 상황을 구했다. 그럼에도 본문은 이 방식을 모든 결정의 보편적 공식으로 제시하지 않는다.</p>
  <h3>② 하나님의 섭리는 어떻게 드러나는가</h3>
  <p>이 장에서 하나님은 새 계시를 직접 말씀하지 않으신다. 대신 만남의 시점, 친족 관계의 확인, 가족의 동의, 리브가의 결단이 한 방향으로 모인다. 종은 그 과정을 “여호와께서 나를 바른 길로 인도하셨다”라고 해석한다(24:27, 48). 섭리는 우연을 지우는 말이라기보다 사건의 연속을 약속의 관점에서 읽는 고백이다.</p>
  <h3>③ 리브가에게 선택권이 있었는가</h3>
  <p>혼인은 가족과 남성 대표들이 교섭하는 구조 안에서 진행된다. 동시에 출발 여부를 묻는 마지막 질문은 리브가에게 향하고, 그는 “가겠나이다”라고 대답한다. 서사는 제도의 한계를 숨기지 않으면서도 리브가를 수동적 물건으로만 그리지 않는다.</p>
  <h3>④ 종은 엘리에셀인가</h3>
  <p>15:2의 다메섹 엘리에셀을 떠올릴 수 있으나 24장은 종의 이름을 밝히지 않는다. 이름 없는 종이라는 서술은 그의 인격을 지우기보다 주인의 명령과 하나님의 인도를 충실하게 수행하는 역할을 전면에 놓는다.</p>
  <div class="back"><a href="#top">↑ 문서 처음으로</a></div>
</section>

<section class="part" id="s10">
  <div class="part-head"><div class="eyebrow">CROSS REFERENCES</div><h2>10. 상호 참조 총람</h2><div class="gloss">약속, 우물, 길, 혼인.</div></div>
  <table><caption>표 D. 창세기 24장의 주요 상호참조</caption><thead><tr><th>주제</th><th>본문</th><th>연결</th></tr></thead><tbody>
    <tr><td class="head">씨와 땅의 약속</td><td>창 12:1–3; 13:14–17; 22:15–18</td><td>이삭의 혼인은 후손 약속이 다음 세대로 이어지는 통로가 된다.</td></tr>
    <tr><td class="head">친족과 혼인</td><td>창 28:1–5; 신 7:3–4; 고전 7:39</td><td>혼인은 단순한 혈통 보존보다 하나님을 섬기는 공동체의 방향과 연결된다.</td></tr>
    <tr><td class="head">우물가의 만남</td><td>창 29:1–14; 출 2:15–21; 요 4:4–30</td><td>우물은 여행자, 여성, 가족, 새로운 사명의 만남이 일어나는 서사적 공간이다.</td></tr>
    <tr><td class="head">하나님의 인도</td><td>출 13:21–22; 시 23:2–3; 32:8; 48:14</td><td>길의 형통은 편리함보다 약속에 합당한 방향으로 이끄시는 은혜를 가리킨다.</td></tr>
    <tr><td class="head">떠남과 순종</td><td>창 12:1–4; 룻 1:16–17</td><td>리브가는 익숙한 집을 떠나 아직 보지 못한 미래로 간다는 점에서 아브라함과 룻의 결단을 떠올리게 한다.</td></tr>
    <tr><td class="head">위로와 새 가정</td><td>창 23:1–20; 24:67</td><td>사라의 죽음 뒤에 리브가가 장막에 들어오며 이삭은 위로를 얻는다.</td></tr>
  </tbody></table>
  <div class="back"><a href="#top">↑ 문서 처음으로</a></div>
</section>

<section class="part" id="s11">
  <div class="part-head"><div class="eyebrow">CROSS REFERENCES</div><h2>11. 상호 참조 총람 (보론)</h2><div class="gloss">반복되는 창세기의 문법.</div></div>
  <p><b>“가다”의 반복.</b> 아브라함은 부르심을 받고 떠났고(12:4), 종은 명령을 받아 길을 나섰으며(24:10), 리브가는 “가겠나이다”라고 응답한다(24:58). 약속은 한 사람의 체험에 머물지 않고 다음 사람이 길을 떠날 때 이어진다.</p>
  <p><b>“복”의 확장.</b> 아브라함이 모든 소유에 복을 받은 사실로 장이 시작되고(24:1), 종의 찬송과 라반의 인사와 리브가를 향한 가족의 축복으로 번진다(24:27, 31, 35, 48, 60). 복은 소유의 목록보다 약속을 운반하는 관계를 통해 전개된다.</p>
  <p><b>우물 장면의 차이.</b> 야곱과 모세의 우물 장면에서는 남성이 먼저 행동하지만 리브가는 스스로 물을 길어 낯선 이와 낙타를 섬긴다. 이 차이는 그가 이후 야곱 이야기에서 보일 주도성과 결단력을 미리 드러낸다.</p>
  <p><b>장막의 계승.</b> 리브가가 사라의 장막에 들어가는 장면은 단순한 거주지 이동이 아니다. 약속의 가정에서 비어 있던 자리가 채워지고, 창세기 25장 이후의 세대가 시작된다.</p>
  <div class="back"><a href="#top">↑ 문서 처음으로</a></div>
</section>

<section class="part" id="s12">
  <div class="part-head"><div class="eyebrow">CANON</div><h2>12. 정경적·복음적 메시지</h2><div class="gloss">보이지 않는 인도와 이어지는 약속.</div></div>
  <p>창세기 24장의 중심 문제는 좋은 배우자를 찾는 기술이 아니다. 하나님이 아브라함에게 주신 씨의 약속이 이삭의 세대에서 어떻게 이어질 것인가가 중심이다. 그래서 아브라함은 이삭을 약속의 땅에서 떠나게 하지 않으면서도 가나안의 우상적 질서에 흡수되지 않을 길을 찾는다.</p>
  <p>종은 기도하고 관찰하고 질문하고 확인하고 설명한다. 신앙은 아무 정보 없이 뛰어드는 행동으로 묘사되지 않는다. 그는 하나님의 인도를 구하면서도 리브가의 가족, 혈통, 의사, 출발 조건을 세밀하게 확인한다. 섭리에 대한 신뢰와 책임 있는 판단이 함께 움직인다.</p>
  <p>리브가의 “가겠나이다”는 약속의 역사가 새로운 사람의 자유로운 응답을 통해 이어짐을 보여 준다. 하나님은 사람을 수단으로만 사용하지 않으시며, 사람의 결단을 약속의 역사 안에 실제 원인으로 받아들이신다.</p>
  <p>기독교 전통은 종의 파송과 신부의 귀향에서 복음적 유비를 읽어 왔다. 그러나 본문의 일차적 의미는 이삭의 혼인과 언약 계승이다. 교회와 그리스도의 관계에 연결할 때에도 세부 요소를 일대일로 암호화하기보다, 하나님이 약속을 이루시고 백성을 부르신다는 큰 흐름 안에서 절제해 읽는 것이 안전하다.</p>
  <div class="back"><a href="#top">↑ 문서 처음으로</a></div>
</section>

<section class="part" id="s13">
  <div class="part-head"><div class="eyebrow">CANON</div><h2>13. 정경적·복음적 메시지 (보론)</h2><div class="gloss">리브가와 성경의 여성 서사.</div></div>
  <p>리브가는 환대, 노동, 결단으로 처음 등장한다. 서술자는 그의 아름다움을 언급하지만 이야기의 방향을 바꾸는 것은 물을 긷는 행동과 떠나겠다는 대답이다. 이는 여성 인물을 외모나 혼인 관계로만 읽지 못하게 한다.</p>
  <p>아브라함이 고향을 떠난 부르심과 리브가가 친정을 떠나는 결단은 서로 울린다. 두 사람 모두 아직 보지 못한 미래를 향해 가족과 익숙한 공간을 떠난다. 리브가는 약속의 집에 들어오는 주변 인물이 아니라 약속의 다음 세대를 함께 세우는 주체다.</p>
  <p>24:67은 사랑과 위로를 함께 말한다. 이삭은 리브가를 아내로 맞아 사랑했고 어머니를 잃은 뒤 위로를 얻었다. 성경의 혼인은 언약 계승이라는 공적 역할과 한 사람의 상실을 돌보는 친밀한 관계를 동시에 품는다.</p>
  <div class="back"><a href="#top">↑ 문서 처음으로</a></div>
</section>

<section class="part" id="s14">
  <div class="part-head"><div class="eyebrow">SYNTHESIS</div><h2>14. 신학 종합</h2><div class="gloss">네 가닥.</div></div>
  <h3>① 약속은 평범한 선택을 통해 이어진다</h3>
  <p>천사의 현현이나 하늘의 음성 없이 여행, 우물, 식사, 가족회의, 출발이 이어진다. 하나님은 일상의 결정들을 약속의 통로로 사용하신다.</p>
  <h3>② 기도는 관찰과 책임을 없애지 않는다</h3>
  <p>종은 응답을 구한 뒤 리브가를 자세히 살피고 친족 관계를 확인하고 사명을 설명한다. 기도와 분별은 경쟁하지 않는다.</p>
  <h3>③ 환대가 사람의 성품을 드러낸다</h3>
  <p>리브가의 행동은 요청받은 한 모금보다 훨씬 크다. 낙타에게까지 물을 주는 수고가 약속의 집을 이어 갈 사람의 넉넉함을 드러낸다.</p>
  <h3>④ 새로운 세대는 새로운 응답으로 시작한다</h3>
  <p>아브라함의 믿음이 리브가의 믿음을 대신할 수 없다. 약속은 계승되지만 응답은 각 세대가 새롭게 해야 한다.</p>
  <div class="back"><a href="#top">↑ 문서 처음으로</a></div>
</section>

<section class="part" id="s15">
  <div class="part-head"><div class="eyebrow">SYNTHESIS</div><h2>15. 신학 종합 (보론)</h2><div class="gloss">분별을 위한 네 질문.</div></div>
  <h3>⑤ 내가 구하는 표징은 성품을 드러내는가</h3>
  <p>종의 요청은 자극적 기적보다 환대와 수고를 드러내는 시험이었다. 신앙적 분별은 내가 원하는 결과를 정당화하는 표징보다 하나님의 성품과 이웃 사랑에 합당한지를 물어야 한다.</p>
  <h3>⑥ 나는 응답 뒤에도 사실을 확인하는가</h3>
  <p>종은 첫인상만으로 결론 내리지 않는다. 관계와 조건을 확인하고 공동체 앞에서 과정을 설명한다. 확신은 검증을 두려워하지 않는다.</p>
  <h3>⑦ 다른 사람의 의사를 하나님의 뜻이라는 말로 덮지 않는가</h3>
  <p>리브가의 출발은 가족의 합의만으로 결정되지 않는다. 본문은 당사자에게 묻고 그의 대답을 기록한다. 하나님의 뜻을 말할수록 타인의 인격과 동의를 더 존중해야 한다.</p>
  <h3>⑧ 형통을 편안함으로만 정의하지 않는가</h3>
  <p>종의 길은 길고 책임은 무거웠다. 형통은 어려움의 부재가 아니라 맡겨진 사명이 약속에 맞게 완수되는 것이다.</p>
  <div class="back"><a href="#top">↑ 문서 처음으로</a></div>
</section>

<section class="part" id="s16">
  <div class="part-head"><div class="eyebrow">PREACHING</div><h2>16. 설교를 위한 메시지</h2><div class="gloss">길 위에서 확인되는 인도.</div></div>
  <h3>① 하나님은 약속을 다음 세대로 옮기신다</h3>
  <p>아브라함의 시대가 저물어도 하나님의 약속은 멈추지 않는다. 하나님은 종의 충성, 리브가의 환대, 가족의 대화, 이삭의 기다림을 엮어 다음 세대를 준비하신다.</p>
  <h3>② 작은 친절이 큰 사명의 문을 연다</h3>
  <p>리브가는 자신이 구속사의 중요한 인물이 될 것을 알고 물을 길은 것이 아니다. 눈앞의 낯선 이를 넉넉히 섬겼고, 그 행동 속에서 그의 성품과 미래가 드러났다.</p>
  <h3>③ 기도한 사람은 살피고 설명하고 책임진다</h3>
  <p>종은 “하나님이 하실 것”이라는 말 뒤에 숨지 않는다. 그는 기도한 뒤 관찰하고, 확인하고, 가족에게 설명하고, 맡은 일을 끝까지 수행한다.</p>
  <h3>④ 믿음은 떠나야 할 때 “가겠습니다”라고 말한다</h3>
  <p>리브가는 익숙한 집을 떠나 약속의 땅으로 향한다. 믿음은 모든 미래를 다 아는 상태가 아니라, 하나님의 인도를 충분히 확인한 뒤 오늘 순종할 길을 선택하는 용기다.</p>
  <h3>⑤ 사랑은 상실 뒤에 새 위로를 만든다</h3>
  <p>장은 이삭이 리브가를 사랑하고 어머니를 잃은 뒤 위로를 얻었다는 말로 끝난다. 하나님의 섭리는 역사의 큰 약속을 이루면서 한 사람의 슬픔도 돌보신다.</p>
  <div class="back"><a href="#top">↑ 문서 처음으로</a></div>
</section>

<footer>
  성서 연구 서고 · 창세기 24장 · 리브가.<br>
  0–7번은 손상된 gzip에서 검증 가능한 원문을 복구했고, 8–16번은 2026년 8월 2일 복구 과정에서 보완 작성했다.<br>
  원문은 <a href="../../bible/original.html?book=GEN&amp;chapter=24">성경읽기</a>에서 절 단위로 다시 볼 수 있고, 책 전체의 배경은 <a href="./overview.html">종합 개관</a>에 있다.
</footer>
</main>

</div>
<script src="../../assets/app.js"></script>
<script src="../../assets/js/commentator-chips.js" defer></script>
<script data-bible-reader-js defer src="../../assets/js/bible-reader.js"></script>
</body>
</html>
'''


def main() -> None:
    source = SOURCE.read_text(encoding="utf-8")
    marker = '<section class="part" id="s8">'
    if marker not in source:
        raise SystemExit("recoverable prefix does not contain section 8 marker")

    preserved = source.split(marker, 1)[0].rstrip() + "\n\n"
    completed = preserved + SUPPLEMENT.lstrip()

    required_ids = [f'id="s{index}"' for index in range(17)]
    missing = [section_id for section_id in required_ids if section_id not in completed]
    if missing:
        raise SystemExit(f"missing section IDs: {missing}")
    if "DecompressionStream" in completed or ".b64" in completed:
        raise SystemExit("runtime payload references remain")
    if not completed.rstrip().endswith("</html>"):
        raise SystemExit("completed page has no closing html tag")

    TARGET.write_text(completed, encoding="utf-8")
    for fragment in TARGET.parent.glob("ch24.*.b64"):
        fragment.unlink()

    print(f"wrote {TARGET.relative_to(ROOT)} ({len(completed):,} characters)")
    print("preserved original sections 0–7; replaced damaged sections 8–16 with an identified supplement")


if __name__ == "__main__":
    main()
