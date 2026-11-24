"""Gold outlines around the moving regions of the three lazy photos.
Reads public/loops/<name>-moving.png, writes <name>-outline.png (RGBA).
  python -I astra-first-look/scripts/outline_masks.py   (needs numpy, Pillow)
"""
from pathlib import Path
import numpy as np
from PIL import Image, ImageChops, ImageFilter

loops = Path(__file__).parent.parent / "public" / "loops"
for n in ["02-coast", "03-cabin", "04-shore"]:
    m = Image.open(loops / f"{n}-moving.png").convert("L").point(lambda v: 255 if v > 127 else 0)
    edge = np.array(ImageChops.subtract(m.filter(ImageFilter.MaxFilter(9)), m.filter(ImageFilter.MinFilter(3))))
    edge[:4, :] = 0; edge[-4:, :] = 0; edge[:, :4] = 0; edge[:, -4:] = 0  # no line on the frame border
    line = Image.fromarray(edge).filter(ImageFilter.GaussianBlur(1.2))
    glow = Image.fromarray(edge).filter(ImageFilter.GaussianBlur(10)).point(lambda v: min(255, v * 2))
    out = Image.new("RGBA", m.size, (243, 195, 107, 0))
    out.putalpha(ImageChops.lighter(line, glow.point(lambda v: v * 0.6)))
    out.save(loops / f"{n}-outline.png")
    print(n)
