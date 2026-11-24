# 第一眼哇塞，第二眼偷懒 — GPT-6.2 Astra first look

A 46-second portrait film (1080 × 1920, 60 fps) on the owner's first try of
GPT-6.2 Astra in Codex (Nov 18, 2026, session
`rollout-2026-11-18T19-33-44-01a1ee6f…`): a 4,127-character launch-film
prompt, 23 minutes of autonomous work, a film that stutters, then four
animated photos whose motion turns out to be a few warped regions on one still.

A beat-cut montage of Astra's own launch film (「我让 GPT-6.2 Astra 做一支产品宣传片。」), then one continuous take: the
prompt (shown only as its shape, one bar per wrapped row, no text) → a
progress bar → Astra's own film at its native 24 fps → split into the four
photos → zoom into each of the three lazy ones (coast, cabin, shore) with the
photo first playing whole, then on the next beat the still parts grey and the moving region outlined → push into the cabin → title.
The lens photo is left alone: its light sweeps across the whole frame.

## What is shown, and how it was measured

| On screen | Source |
| --- | --- |
| The prompt | Only its shape (`src/promptShape.ts`: row widths from the session's first user message). The owner does not want the text shown or committed. |
| "23 分钟" | Turn 1 ran 1,383.8 s (task_started → task_complete). |
| Astra's film | `Meowcal-Sub-Harbor-Light.mp4` as delivered (24 fps; 93 of 629 frame steps are repeats, 69 of them a frozen 2.9 s ending). |
| The four photos | Re-rendered by `scripts/render_loops.py` with Astra's unchanged shader (`scripts/astra-loop.frag`) and plates at 1254 × 940 instead of 960 × 720. Same motion, same 3.2 s / 96-frame loop. |
| What stays in colour | `*-moving.png`: every pixel the shader displaces by > 0.5 px at any point of the loop. Lens 0.6 %, coast 29.4 %, cabin 43.5 %, shore 20.7 % (`public/loops/motion.json`). Light sweeps that only change brightness are not counted as movement. |

The takeaway lines (「边聊边改，它接不住。」「都说 Prompt 得专门为它写，可我这份，
已经优化过了。那我真不知道还能怎么写了。」) are the owner's opinion, not a measurement.

## Reproduce

```powershell
# plates: C:\Repos\Meowcal-Harbor-Film\harbor-light\assets (lens/coast/cabin/shore.png)
<python with moderngl, numpy, Pillow> -I astra-first-look/scripts/render_loops.py <plates-dir>
python -I astra-first-look/scripts/drain_loops.py
<python with numpy, Pillow> -I astra-first-look/scripts/outline_masks.py
copy <Astra delivery>\Meowcal-Sub-Harbor-Light.mp4 astra-first-look\public\film\astra-film.mp4
npm run audio:astra-first-look
npm run render:astra-first-look   # renders the picture muted, then muxes public/score.wav (Remotion's AAC lands ~42 ms late)
# cover plates: frame 1.0 s of the shore loop, plain and drained, plus its outline
ffmpeg -ss 1.0 -i astra-first-look/public/loops/04-shore.mp4 -frames:v 1 astra-first-look/public/cover/shore.png
ffmpeg -ss 1.0 -i astra-first-look/public/loops/04-shore-drained.mp4 -frames:v 1 astra-first-look/public/cover/shore-drained.png
copy astra-first-look\public\loops\04-shore-outline.png astra-first-look\public\cover\shore-outline.png
npm run cover:astra-first-look
node astra-first-look/audio/score/check-sync.mjs astra-first-look/out/astra-first-look.mp4 astra-first-look/audio/score.json --ffmpeg ffmpeg
```

Astra's film, the loop videos, cover plates, the score WAV and `out/` are not committed. The motion masks, outlines and `motion.json` are.

## Sound

Score from `audio/score.json` (120 BPM, A minor): pedal-down piano chords,
legato cello/viola pad and a violin line, one light kit; the stutter line gets
two snare hits. Recorded CC0 samples (VSCO 2 CE, VCSL) via the
`acoustic-score` renderer copied to `audio/score/` (violin gain raised to
0.25, viola lowered to 0.1). Provenance: `audio/score/PROVENANCE.md`.
