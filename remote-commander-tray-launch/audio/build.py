"""Build the soundtrack from the same clock the picture uses.

    python launch-film/audio/build.py

Reads audio/score.json and writes:
  out/music.wav           the score, rendered from recorded CC0 instruments
  out/keys.wav            recorded keypresses and clicks, one per screen action
  out/mix.premaster.wav   music + keys
  public/audio/mix.wav    the master the composition plays

The master is brought to -14 LUFS with a limiter ceiling of -2.4 dBFS, which
leaves room for the AAC encode to stay under -1 dBTP. Needs Node, NumPy and
FFmpeg (PATH or the FFMPEG environment variable).
"""

from __future__ import annotations

import json
import os
import random
import re
import subprocess
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
FFMPEG = os.environ.get("FFMPEG", "ffmpeg")
SR = 48_000
TARGET_I = -14.0
CEILING_DB = -2.4

score = json.loads((ROOT / "audio" / "score.json").read_text(encoding="utf-8"))
cue, sfx = score["cues"], score["sfx"]


def read_mono(path: Path) -> np.ndarray:
    with wave.open(str(path)) as wv:
        assert wv.getframerate() == SR and wv.getnchannels() == 1
        x = np.frombuffer(wv.readframes(wv.getnframes()), dtype="<i2").astype(np.float64) / 32768
    start = int(np.argmax(np.abs(x) > 0.1 * np.abs(x).max()))  # begin at the attack
    return x[max(0, start - 48):]


def write_stereo(path: Path, buf: np.ndarray) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "wb") as wv:
        wv.setnchannels(2)
        wv.setsampwidth(2)
        wv.setframerate(SR)
        wv.writeframes((np.clip(buf, -1, 1) * 32767).astype("<i2").tobytes())


def read_stereo(path: Path) -> np.ndarray:
    with wave.open(str(path)) as wv:
        assert wv.getframerate() == SR and wv.getnchannels() == 2
        return np.frombuffer(wv.readframes(wv.getnframes()), dtype="<i2").astype(np.float64).reshape(-1, 2) / 32768


def build_keys() -> np.ndarray:
    """One recorded key per typed character; the lightest key stands in for a
    mouse button going down, softer coming up."""
    keys = [read_mono(p) for p in sorted((ROOT / "audio" / "keys").glob("key-*.wav"))]
    order = np.argsort([float(np.sqrt(np.mean(k[:2400] ** 2))) for k in keys])
    click = keys[int(order[0])]
    rng = random.Random(41)
    buf = np.zeros((int(score["seconds"] * SR), 2))

    def put(seconds: float, x: np.ndarray, gain: float, pan: float = 0.0) -> None:
        k = int(round(seconds * SR))
        end = min(k + len(x), len(buf))
        buf[k:end, 0] += x[: end - k] * gain * (1 - max(0.0, pan))
        buf[k:end, 1] += x[: end - k] * gain * (1 + min(0.0, pan))

    last = -1
    for i in range(len(sfx["typeText"])):
        pick = rng.randrange(len(keys))
        if pick == last:
            pick = (pick + 1) % len(keys)
        last = pick
        put(sfx["typeStart"] + i * sfx["typeStep"], keys[pick], rng.uniform(0.4, 0.62), rng.uniform(-0.15, 0.15))
    enter = keys[int(order[-1])]  # the heaviest key is the Enter key
    put(cue["enter"], enter, 0.75)
    # Mouse button down, then softer up ~70 ms later.
    for at in (cue["toastClick"], sfx["rightClick"]):
        put(at, click, 0.6)
        put(at + 0.07, click, 0.3)
    return buf


def loudness(path: Path) -> dict:
    log = subprocess.run(
        [FFMPEG, "-hide_banner", "-nostdin", "-i", str(path), "-af", "loudnorm=I=-14:TP=-1:print_format=json", "-f", "null", "-"],
        capture_output=True, text=True, encoding="utf-8", check=True,
    ).stderr
    return json.loads(re.search(r"\{\s*\"input_i\"[\s\S]*?\}", log).group(0))


def master(source: Path, target: Path) -> dict:
    """Gain to the target loudness, catch the drum peaks with a look-ahead
    limiter, measure, and trim once more so the result sits on the target."""
    ceiling = 10 ** (CEILING_DB / 20)
    gain = TARGET_I - float(loudness(source)["input_i"])
    for _ in range(3):
        subprocess.run(
            [FFMPEG, "-hide_banner", "-nostdin", "-v", "error", "-y", "-i", str(source), "-af",
             f"volume={gain:.3f}dB,alimiter=limit={ceiling:.4f}:attack=0.5:release=20:level=false:asc=0",
             "-ar", str(SR), "-ac", "2", "-c:a", "pcm_s16le", str(target)],
            check=True,
        )
        measured = loudness(target)
        error = TARGET_I - float(measured["input_i"])
        if abs(error) < 0.1:
            break
        gain += error
    return measured


def main() -> None:
    out = ROOT / "out"
    out.mkdir(exist_ok=True)
    subprocess.run(
        ["node", str(ROOT / "audio" / "score" / "render-score.mjs"), str(ROOT / "audio" / "score.json"), str(out / "music.wav")],
        check=True,
    )
    keys = build_keys()
    write_stereo(out / "keys.wav", keys * (0.5 / np.abs(keys).max()))
    music = read_stereo(out / "music.wav")
    n = min(len(music), len(keys))
    # Keys sit under the instruments: present on quiet bars, a texture on loud ones.
    mix = music[:n] + keys[:n] * (0.2 / np.abs(keys).max())
    write_stereo(out / "mix.premaster.wav", mix * (0.7 / np.abs(mix).max()))
    measured = master(out / "mix.premaster.wav", ROOT / "public" / "audio" / "mix.wav")
    print(f"master: {measured['input_i']} LUFS, {measured['input_tp']} dBTP, LRA {measured['input_lra']}")


if __name__ == "__main__":
    main()
