# 신구약 인터라이너 도구

원자료 받기:

```bash
python3 tools/interlinear/fetch_sources.py
```

구약 예시:

```bash
python3 tools/interlinear/build_interlinear.py --book Neh --slug nehemiah --chapter 1 --verify-morphology
python3 tools/interlinear/render_interlinear.py --input data/interlinear/nehemiah/01.json --output ot/nehemiah/parsing/ch01.html --book-slug nehemiah --book-title 느헤미야 --testament ot
```

신약 예시:

```bash
python3 tools/interlinear/build_interlinear_gk.py --book Rom --slug romans --chapter 8 --text N --verify-morphology
python3 tools/interlinear/render_interlinear.py --input data/interlinear/romans/08.json --output nt/romans/parsing/ch08.html --book-slug romans --book-title 로마서 --testament nt
```

검증:

```bash
python3 tools/interlinear/validate_interlinear.py data/interlinear/romans/08.json nt/romans/parsing/ch08.html
```

전체 규격과 신약 이본 선택 방식은 `docs/INTERLINEAR_PIPELINE.md`를 따른다.
