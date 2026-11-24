"""For each loop in public/loops, write <name>-drained.mp4: the same frames with
every pixel Astra's shader never moves turned grey and dimmed, keeping colour
only inside <name>-moving.png. Run after render_loops.py:
  python -I astra-first-look/scripts/drain_loops.py
"""
import subprocess
from pathlib import Path

loops = Path(__file__).parent.parent / "public" / "loops"
for name in ["01-lens", "02-coast", "03-cabin", "04-shore"]:
    subprocess.run([
        "ffmpeg", "-v", "error", "-y", "-i", str(loops / f"{name}.mp4"), "-loop", "1", "-i", str(loops / f"{name}-moving.png"),
        "-filter_complex",
        "[0:v]format=rgb24,split[c][g];"
        "[g]hue=s=0,colorlevels=romax=0.38:gomax=0.38:bomax=0.38[grey];"
        "[1:v]format=gray,scale=1254:940[m];[c][m]alphamerge[live];"
        "[grey][live]overlay=shortest=1,format=yuv420p",
        "-frames:v", "96", "-r", "30", "-c:v", "libx264", "-crf", "12", "-preset", "slow", "-movflags", "+faststart",
        str(loops / f"{name}-drained.mp4"),
    ], check=True)
    print(name)
