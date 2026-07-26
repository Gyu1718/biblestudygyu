# 인터라이너 도구

```bash
python3 tools/interlinear/fetch_sources.py
python3 tools/interlinear/build_interlinear.py --book Neh --slug nehemiah --chapter 1 --verify-morphology
python3 tools/interlinear/render_interlinear.py --input data/interlinear/nehemiah/01.json --output ot/nehemiah/parsing/ch01.html --book-slug nehemiah --book-title 느헤미야
python3 tools/interlinear/validate_interlinear.py data/interlinear/nehemiah/01.json ot/nehemiah/parsing/ch01.html
```

전체 규격은 `docs/INTERLINEAR_PIPELINE.md`를 따른다. 현재 생성기는 구약 TAHOT만 지원하며 신약 TAGNT 변환은 아직 구현하지 않았다.
