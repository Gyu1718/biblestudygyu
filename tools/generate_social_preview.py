#!/usr/bin/env python3
"""Generate the 1200×630 social preview image used by shelf pages."""
from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "assets" / "og" / "site-preview.png"
WIDTH, HEIGHT = 1200, 630


def first_existing(*paths: str) -> str:
    for path in paths:
        if Path(path).exists():
            return path
    raise FileNotFoundError("No suitable font found: " + ", ".join(paths))


def generate() -> Image.Image:
    image = Image.new("RGB", (WIDTH, HEIGHT), "#f6f2e8")
    draw = ImageDraw.Draw(image)

    # Deterministic light paper grain without external assets.
    seed = 7
    for _ in range(12000):
        seed = (1103515245 * seed + 12345) & 0x7FFFFFFF
        x = seed % WIDTH
        seed = (1103515245 * seed + 12345) & 0x7FFFFFFF
        y = seed % HEIGHT
        shade = (242, 244, 246, 247, 248)[seed % 5]
        draw.point((x, y), fill=(shade, shade - 2, shade - 7))

    draw.rounded_rectangle((54, 50, 1146, 580), radius=28, fill="#16354f")
    draw.rounded_rectangle((78, 74, 1122, 556), radius=22, fill="#fbfaf6")
    draw.rounded_rectangle((78, 74, 1122, 90), radius=8, fill="#a8823c")

    serif_bold = first_existing(
        "/usr/share/fonts/opentype/noto/NotoSerifCJK-Bold.ttc",
        "/usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc",
    )
    serif_regular = first_existing(
        "/usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc",
        "/usr/share/fonts/opentype/noto/NotoSerifCJK-Bold.ttc",
    )
    sans_regular = first_existing(
        "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    )
    hebrew_font = first_existing(
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/freefont/FreeSans.ttf",
    )

    title_font = ImageFont.truetype(serif_bold, 68)
    subtitle_font = ImageFont.truetype(serif_regular, 30)
    body_font = ImageFont.truetype(sans_regular, 22)
    archive_font = ImageFont.truetype(serif_bold, 32)
    hebrew = ImageFont.truetype(hebrew_font, 122)

    draw.rounded_rectangle((120, 128, 340, 348), radius=22, fill="#1f4e78")
    draw.text((230, 226), "ב", font=hebrew, anchor="mm", fill="#d3ad61")
    draw.text((390, 142), "성서 연구 서고", font=title_font, fill="#16354f")
    draw.text((394, 235), "Biblical Studies Archive", font=subtitle_font, fill="#7a5a38")
    draw.line((392, 294, 1035, 294), fill="#d9d2c3", width=2)
    draw.text((394, 323), "본문 · 원어 · 주석 · 관주를 연결하는", font=body_font, fill="#4a5563")
    draw.text((394, 365), "성서·신학 연구 아카이브", font=archive_font, fill="#202a35")

    shelf_y = 512
    draw.rounded_rectangle((110, shelf_y, 1090, shelf_y + 16), radius=5, fill="#3b2d21")
    x = 392
    spines = [
        (72, 76, "#1f4e78"), (62, 64, "#7f3f4e"), (78, 88, "#37665a"),
        (66, 70, "#8a6d3b"), (70, 82, "#4f5e87"), (58, 60, "#6c4d70"),
        (76, 74, "#244c64"),
    ]
    for width, height, color in spines:
        y = shelf_y - height
        draw.rounded_rectangle((x, y, x + width, shelf_y), radius=5, fill=color, outline="#d0a659", width=3)
        draw.line((x + 14, y + 10, x + 14, shelf_y - 9), fill="#e6edf3", width=2)
        x += width + 14

    return image


def validate() -> None:
    if not OUTPUT.exists():
        raise SystemExit(f"missing social preview: {OUTPUT.relative_to(ROOT)}")
    with Image.open(OUTPUT) as image:
        if image.size != (WIDTH, HEIGHT):
            raise SystemExit(f"unexpected preview dimensions: {image.size}")
        if image.format != "PNG":
            raise SystemExit(f"unexpected preview format: {image.format}")
        if OUTPUT.stat().st_size < 20_000:
            raise SystemExit("social preview appears unexpectedly small")
    print(f"공유 이미지 검증 완료: {WIDTH}×{HEIGHT}, {OUTPUT.stat().st_size:,} bytes")


def main() -> None:
    parser = argparse.ArgumentParser()
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--write", action="store_true")
    mode.add_argument("--check", action="store_true")
    args = parser.parse_args()

    if args.write:
        OUTPUT.parent.mkdir(parents=True, exist_ok=True)
        generate().save(OUTPUT, optimize=True)
    validate()


if __name__ == "__main__":
    main()
