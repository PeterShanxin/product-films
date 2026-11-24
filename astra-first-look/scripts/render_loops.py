"""Re-render Astra's four animated photos at the plates' native height.

Uses Astra's own shader (scripts/astra-loop.frag, copied unchanged from
C:/Repos/Harbor-Live-Photos/work/loop.frag) and its own crops, so the motion
is exactly what it delivered; only the output size differs (1254x940 instead
of 960x720). Also writes, per photo, a mask of the pixels the shader actually
displaces at any point of the loop.

Run with a Python that has moderngl, numpy and Pillow:
  python -I astra-first-look/scripts/render_loops.py <plates-dir>
"""
import json, math, struct, subprocess, sys
from pathlib import Path
import moderngl, numpy as np
from PIL import Image, ImageFilter

here = Path(__file__).parent
plates = Path(sys.argv[1])
out = here.parent / "public" / "loops"
out.mkdir(parents=True, exist_ok=True)
W, H, COUNT = 1254, 940, 96          # 96 frames per 3.2 s loop, as delivered
frag = (here / "astra-loop.frag").read_text()
# Second program: same shader, but it outputs how far each pixel was moved.
disp = frag.replace("vec2 p=vec2(cropLeft+cropWidth*uv.x,uv.y);float a=phase;",
                    "vec2 p=vec2(cropLeft+cropWidth*uv.x,uv.y);vec2 p0=p;float a=phase;")
disp = disp.replace("frag=vec4(c,1.);", "frag=vec4((p-p0).x/cropWidth*%d.,(p-p0).y*%d.,c.r,1.);" % (W, H))
assert disp != frag
gl = moderngl.create_standalone_context()
vert = "#version 330\nin vec2 pos; out vec2 uv;\nvoid main(){uv=.5+.5*pos;gl_Position=vec4(pos,0,1);}\n"
vbo = gl.buffer(struct.pack("8f", -1, -1, 1, -1, -1, 1, 1, 1))
progs = [gl.program(vertex_shader=vert, fragment_shader=s) for s in (frag, disp)]
planes = [gl.simple_vertex_array(p, vbo, "pos") for p in progs]
color = gl.simple_framebuffer((W, H), components=3)
dfb = gl.framebuffer(color_attachments=[gl.texture((W, H), 4, dtype="f4")])
shots = [("lens", "01-lens", .20), ("coast", "02-coast", .025), ("cabin", "03-cabin", .10), ("shore", "04-shore", .115)]
report = []
for i, (asset, name, left) in enumerate(shots):
    im = Image.open(plates / f"{asset}.png").convert("RGB")
    tex = gl.texture(im.size, 3, im.tobytes()); tex.filter = (moderngl.LINEAR, moderngl.LINEAR); tex.use(0)
    for p in progs:
        p["page"] = 0; p["shot"] = i; p["cropLeft"] = left; p["cropWidth"] = (4 / 3) / (im.width / im.height)
    enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
                            "-r", "30", "-i", "-", "-c:v", "libx264", "-crf", "12", "-preset", "slow",
                            "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(out / f"{name}.mp4")], stdin=subprocess.PIPE)
    moved = np.zeros((H, W), np.float32)
    for j in range(COUNT):
        phase = 2 * math.pi * j / COUNT
        progs[0]["phase"] = phase; progs[1]["phase"] = phase
        color.use(); gl.viewport = (0, 0, W, H); planes[0].render(moderngl.TRIANGLE_STRIP)
        enc.stdin.write(color.read(components=3, alignment=1))
        dfb.use(); gl.viewport = (0, 0, W, H); planes[1].render(moderngl.TRIANGLE_STRIP)
        r = np.frombuffer(dfb.read(components=4, dtype="f4"), np.float32).reshape(H, W, 4)
        moved = np.maximum(moved, np.hypot(r[..., 0], r[..., 1]))
    enc.stdin.close(); enc.wait()
    mask = Image.fromarray(((moved > 0.5) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3))
    mask.save(out / f"{name}-moving.png")
    report.append({"photo": name, "moving_pixels_pct": round(float((moved > 0.5).mean()) * 100, 1),
                   "max_displacement_px": round(float(moved.max()), 1)})
    tex.release()
(out / "motion.json").write_text(json.dumps(report, indent=1))
print(json.dumps(report, indent=1))
