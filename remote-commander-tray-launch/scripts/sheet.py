"""Tile stills into one sheet: python scripts/sheet.py out.png a.png b.png ... (COLS env, default 2)."""
import os, sys
from PIL import Image, ImageDraw
out, files = sys.argv[1], sys.argv[2:]
cols = int(os.environ.get("COLS", 2))
ims = [Image.open(f).convert("RGB") for f in files]
w, h = ims[0].size
scale = float(os.environ.get("TILE", 1))
w2, h2 = int(w * scale), int(h * scale)
rows = (len(ims) + cols - 1) // cols
sheet = Image.new("RGB", (cols * w2 + (cols - 1) * 6, rows * h2 + (rows - 1) * 6), (60, 60, 60))
d = ImageDraw.Draw(sheet)
for i, (im, f) in enumerate(zip(ims, files)):
    x, y = (i % cols) * (w2 + 6), (i // cols) * (h2 + 6)
    sheet.paste(im.resize((w2, h2)), (x, y))
    d.text((x + 6, y + 4), os.path.basename(f).split("-")[-1], fill=(255, 80, 80))
sheet.save(out)
