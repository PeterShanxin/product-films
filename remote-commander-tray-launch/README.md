# Remote Commander Tray: launch film

A 35-second launch film, in English and Chinese cuts, for [Remote Commander Tray](https://github.com/PeterShanxin/Remote-Commander-Tray), made in code
(Remotion + React + TypeScript) with a score arranged from recorded CC0
instrument samples.

**Concept:** the console window you can't close folds itself into one status
icon in your tray, and that icon still does everything the window did.

One continuous take. It opens by naming its audience: from frame 0,
"Using Desktop Commander Remote?" / 「你也在用 Desktop Commander Remote 吗？」 over
a PowerShell window where `desktop-commander remote` is being typed. The second
line names the pain while the cursor hovers the close button: "Close this
window, and your PC goes offline." / 「这个窗口一关，电脑就掉线。」 Then the
window folds into the tray and lands as the real status icon, green on the
music's drop. The camera stays on the tray for one ordinary day: it starts at
sign-in, restarts itself after a crash, and stays silent through a network
blip. It raises one notification, when sign-in is needed, which the user
answers with a single click. Then a right-click opens the real menu. Finally the
icon leaves the tray and becomes the app's logo.

| Time | Beat | On screen (EN / ZH) |
| --- | --- | --- |
| 0–2 s | Who it's for, from frame 0 | **Using Desktop Commander Remote?** / 你也在用 Desktop Commander Remote 吗？ while the command is typed and logs stream |
| 2–4 s | Pain | **Close this window, and your PC goes offline.** / 这个窗口一关，电脑就掉线。 Cursor hovers the red close button |
| 4–6 s | Magic moment | The window folds into the tray and lands as the status icon; green on the drop at 6 s |
| 6.5–10 s | Name + value | **Remote Commander Tray** / No console window. Always ready in your tray. · 告别黑窗口，托盘里随时待命。 |
| 10–14 s | Sign-in | Dark, clock jumps to the next morning, Connecting → Online: Starts when you sign in. Connects on its own. / 登录即启动，自动连上线。 |
| 14–18 s | Crash | Offline, backoff ring, Online: Crashes? It restarts itself. / 崩了？自己重启。 |
| 18–24 s | The user's one decision | Silent reconnect, then the sign-in notification, one click: Quiet until it needs you. / 没事不打扰，有事才找你。 |
| 24–28 s | Proof | The real menu: Zero console clutter. Full lifecycle control. / 桌面清清爽爽，启停尽在掌控。 + four facts |
| 28–35 s | Brand | Icon → app logo, name, tagline, Microsoft Store · GitHub |

The app's own UI (console, menu, notification) stays English in both cuts: the
app ships in English only. Copy for both cuts lives in `src/copy.ts`.

## What the film shows vs what the app does

Everything on screen was taken from the [Remote Commander Tray repository](https://github.com/PeterShanxin/Remote-Commander-Tray), not invented:

| On screen | Source in the repo |
| --- | --- |
| Status icons: colours, disc, check/dots/key/cross/pause geometry | `src/RemoteCommanderTray/UI/TrayIcons.cs`, ported 1:1 to SVG (`src/StatusIcon.tsx`) |
| App logo (blue tile, chevron and bar) and the check → chevron morph | `tools/generate-icon.py` |
| Context menu items, order, separators, disabled header, checked "Launch at sign-in" | `TrayApplicationContext.cs`; geometry measured from a real WinForms `ContextMenuStrip` capture (211 × 264 px at 100 %) |
| Notification title and text | `AgentSupervisor.cs` (`AuthenticationRequired`) |
| Clicking the notification to sign in | `OnBalloonClicked` opens the current sign-in prompt |
| CLI log lines in the console | Formats recognised by `AgentOutputParser.cs` and its tests (CLI 0.3.1 clock prefix) |
| Restart after a crash | `RestartBackoff.cs` (5 s → 15 s → 30 s → 60 s) |
| Silent reconnect, notification only when action is needed | README "Notifications", `TrayNotification.cs` |
| Facts on screen | README: Store + portable editions, x64 and ARM64, "no admin rights", "does not read or manage OAuth credentials" |

Presentation choices that differ from the running app, and why:

- The machine name `STUDIO-PC`, the times and dates are fictional. This is
  said in the release description, not on screen (owner's call: no small print
  in the picture).
- The sign-in, crash and reconnect beats are compressed in time; the real
  backoff waits 5 s before the first restart.
- The amber ring around the crashed icon is a film graphic that stands for the
  backoff wait; the app shows "Retrying in 5s" in its menu instead.
- The menu grows out of the icon (a morph); the real menu simply appears.
- The browser sign-in itself is not shown.
- The taskbar is a simplified Windows 11 taskbar drawn in code, not a capture.

## Files

| Path | Owns |
| --- | --- |
| `audio/score.json` | The one clock. `cues` (seconds) drive every landing in the picture and every accent in the score; `sfx` drives typing, log lines and clicks. 120 BPM, a beat is 0.5 s. |
| `audio/build.py` | Renders the score, adds recorded key/click sounds, masters to −14 LUFS → `public/audio/mix.wav` |
| `audio/score/` | Copy of the acoustic-score renderer and sample manifest (samples download on first run, hash-checked) |
| `audio/keys/` | 32 recorded keypresses (CC0) |
| `src/clock.ts` | Easing helpers, imports the cue table |
| `src/geometry.ts` | Desktop, window, tray, menu, toast rects and camera positions |
| `src/timeline.ts` | Camera, the window fold, tray icon states, cursor path |
| `src/Film.tsx` | The film; `src/Cover.tsx` the thumbnail |
| `scripts/` | `stills.mjs` (inspection frames), `sheet.py`, `mux.py`, `verify.py` (writes `out/qc.json`) |

`node_modules/`, `out/` and `public/audio/*.wav` are not committed. The MP4 is a
release asset; its checksum is recorded below.

## Reproduce

Windows 11 (the film uses the system fonts Segoe UI Variable and Cascadia Mono),
Node 24, Python 3.12 with NumPy and Pillow, FFmpeg on PATH. This folder has its own
`package.json`; from `remote-commander-tray-launch/`:

```powershell
npm ci
python audio/build.py
node audio/score/check-sync.mjs out/music.wav audio/score.json
npx tsc --noEmit
npm run studio            # http://localhost:3117 → LaunchFilm (with sound)
npx remotion render src/index.ts LaunchFilmSilent out/picture.mp4 --muted --codec=h264 --crf=16 --pixel-format=yuv420p --color-space=bt709
python scripts/mux.py out/remote-commander-tray-launch-en-v5.mp4
python scripts/verify.py out/remote-commander-tray-launch-en-v5.mp4
node audio/score/check-sync.mjs out/remote-commander-tray-launch-en-v5.mp4 audio/score.json --ffmpeg ffmpeg
# Chinese cut: the same with LaunchFilmZhSilent and ...-zh-v5.mp4
npx remotion still src/index.ts Cover out/cover-en.png
npx remotion still src/index.ts CoverZh out/cover-zh.png
```

The picture is rendered silent and the master muxed in afterwards, so the audio
lands exactly where the score put it.

## Release masters

Measured by `scripts/verify.py` and `check-sync.mjs` (v5, both cuts): 35.000 s,
1920 × 1080, 60 fps, H.264 High yuv420p BT.709, AAC stereo 48 kHz,
−14.0 LUFS, −1.6 dBTP, full decode clean, 26 of 26 cues within ±15 ms.
Published as release
[`rct-launch-v1.1.0`](https://github.com/PeterShanxin/product-films/releases/tag/rct-launch-v1.1.0);
the first, English-only cut is [`rct-launch-v1.0.0`](https://github.com/PeterShanxin/product-films/releases/tag/rct-launch-v1.0.0).

## Credits

| Asset | Source | License |
| --- | --- | --- |
| Piano (Steinway B), concert bass drum, snare, rim, roll, claps, hi-hat, shaker, tom, suspended cymbal, bell tree | VCSL, Versilian Studios / Sam Gossner and contributors, commit `c1ea7bc` | CC0 1.0 |
| Cello, viola and violin sections, muted kick | VSCO 2 Community Edition, Versilian Studios, commit `4403009` | CC0 1.0 |
| Keypresses and clicks | "Keyboard Soundpack 1" by unicaegames, OpenGameArt | CC0 1.0 |
| Fonts | Segoe UI Variable, Cascadia Mono: Windows system fonts, rendered locally, not redistributed | Windows / SIL OFL (Cascadia) |
| GitHub mark | GitHub, Inc., used to link to the project | GitHub logo guidelines |

Music: an original score, arranged in code from the samples above
(`audio/score.json`). It is not a live performance, and no third-party
composition is used. See `audio/score/PROVENANCE.md` and
`audio/keys/PROVENANCE.md`.

This folder is MIT licensed (see `LICENSE`), like Remote Commander Tray. Remote Commander Tray is an independent companion, not an official Desktop
Commander product.
