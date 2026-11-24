"""Mux the WAV master into the silent picture: python scripts/mux.py [out/name.mp4].

The picture is rendered with --muted and the master is added here as AAC 48 kHz,
so the audio lands exactly where the score put it (no encoder offset inside the
render). Video is copied, not re-encoded.
"""
import subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
target = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "out" / "remote-commander-tray-launch.mp4"
subprocess.run([
    "ffmpeg", "-v", "error", "-y",
    "-i", str(ROOT / "out" / "picture.mp4"),
    "-i", str(ROOT / "public" / "audio" / "mix.wav"),
    "-map", "0:v", "-map", "1:a",
    "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-ar", "48000", "-ac", "2",
    "-shortest", "-movflags", "+faststart", str(target),
], check=True)
print(target)
