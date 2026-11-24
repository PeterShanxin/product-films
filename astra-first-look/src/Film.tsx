import React from "react";
import { AbsoluteFill, Html5Audio, Img, Loop, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { promptRows } from "./promptShape";
import {
  BAR, bump, C, cue, DOC, fade, FILM_OPEN, FONT, FPS, glide, impact, mix, OPEN, PHOTO, PLAYER, QUARTERS, Rect, reveal, settle, STAGE_Y,
  TILES, W,
} from "./motion";

// Astra's four animated photos, re-rendered from its own shader (scripts/render_loops.py).
const PHOTOS = ["01-lens", "02-coast", "03-cabin", "04-shore"];
const LAZY = [1, 2, 3]; // the three whose motion is a few warped regions on a still
const LOOP_FRAMES = 3.2 * FPS; // one 96-frame, 3.2 s loop, as Astra delivered it
const FILM_AT = cue.film; // Astra's own film plays from here, at its native 24 fps

const box = (r: Rect): React.CSSProperties => ({
  position: "absolute", left: r.x, top: r.y, width: r.w, height: r.h, borderRadius: r.r, overflow: "hidden",
});
const fill: React.CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" };

const LoopVideo: React.FC<{ name: string }> = ({ name }) => (
  <Loop durationInFrames={LOOP_FRAMES}>
    <OffthreadVideo src={staticFile(`loops/${name}.mp4`)} muted style={fill} />
  </Loop>
);

// Still parts drain to grey; only the pixels Astra's shader moves stay in colour
// (pre-rendered by scripts/drain_loops.py), ringed by a gold outline.
const Photo: React.FC<{ name: string; drain: number; outline?: number }> = ({ name, drain, outline = 0 }) => (
  <>
    <LoopVideo name={name} />
    {drain > 0 && (
      <div style={{ ...fill, opacity: drain }}>
        <LoopVideo name={`${name}-drained`} />
      </div>
    )}
    {outline > 0 && <Img src={staticFile(`loops/${name}-outline.png`)} style={{ ...fill, opacity: outline }} />}
  </>
);

// ---------- headlines ----------
type Seg = [string, string?];
type LineSpec = { at: number; out: number; segs: Seg[]; y?: number; step?: boolean };
const LINES: LineSpec[] = [
  { at: -1, out: cue.wow, segs: [["我让 GPT-6.2 Astra"]], y: 340 },
  { at: -1, out: cue.wow, segs: [["做一支产品宣传片。"]], y: 456 },
  { at: cue.wow, out: cue.prompt, segs: [["第一眼，"], ["哇塞", C.gold], ["。"]] },
  { at: cue.prompt, out: cue.work, segs: [["我的 Prompt 有 4000 多字，"]] },
  { at: cue.work, out: cue.film, segs: [["它一口气做了 23 分钟。"]] },
  { at: cue.film, out: cue.stutter, segs: [["片子交了——"]] },
  { at: cue.stutter, out: cue.gifs, segs: [["一卡"], ["一卡的。"]], step: true },
  { at: cue.gifs, out: cue.wow2, segs: [["那就只让它做动图吧。"]] },
  { at: cue.wow2, out: cue.coast - 0.3, segs: [["第一眼，还是"], ["哇塞", C.gold], ["。"]] },
  { at: cue.hl1, out: cue.cabin, segs: [["只有"], ["海", C.gold], ["在动。"]] },
  { at: cue.hl2, out: cue.shore, segs: [["只有"], ["窗外", C.gold], ["在动。"]] },
  { at: cue.hl3, out: cue.still, segs: [["只有"], ["海和纸鸟", C.gold], ["在动。"]] },
  { at: cue.still, out: cue.talk1, segs: [["一张静图，几块在晃。"]] },
  { at: cue.talk1, out: cue.talk2, segs: [["边聊边改，它接不住。"]] },
  { at: cue.talk2, out: cue.talk3, segs: [["都说 Prompt 得专门为它写，"]] },
  { at: cue.talk3, out: cue.talk4, segs: [["可我这份，已经优化过了。"]] },
  { at: cue.talk4, out: cue.title, segs: [["那我真不知道还能怎么写了。"]] },
  { at: cue.title, out: 99, segs: [["第一眼"], ["哇塞", C.gold], ["，"]], y: 300 },
  { at: cue.lazy, out: 99, segs: [["第二眼"], ["偷懒", C.dim], ["。"]], y: 430 },
];
const HEAD_Y = 400;
// Fit long lines inside 960 px: CJK ≈ 1 em, Latin ≈ 0.58 em, space ≈ 0.3 em.
const units = (s: string) => [...s].reduce((u, ch) => u + (ch === " " ? 0.3 : /[\x00-\xff]/.test(ch) ? 0.58 : 1), 0);
const sizeFor = (segs: Seg[]) => Math.min(84, Math.floor(960 / units(segs.map(([s]) => s).join(""))));

const Line: React.FC<{ spec: LineSpec; t: number }> = ({ spec, t }) => {
  const { at, out, segs, step } = spec;
  if (t < at - 0.05 || t > out + 0.3) return null;
  const inU = at < 0 ? 1 : reveal(t, at, at + 0.35);
  const outU = fade(t, out - 0.02, out + 0.22);
  const blur = (1 - inU) * 14 + outU * 12;
  const scale = at < 0 ? glide(t, [0, 0.6], [1.03, 1]) : settle(t, at, 0.96, 1, 0.5);
  // The stutter line arrives in two hard, frame-stepped jerks: "一卡" then "一卡的。".
  const stepped = (start: number) => {
    const u = Math.floor(Math.max(0, t - start) * 12) / 3;
    return { opacity: t >= start ? 1 : 0, scale: 1 + 0.14 * Math.max(0, 1 - u) };
  };
  const last = segs.length - 1;
  return (
    <div
      style={{
        position: "absolute", left: 0, width: W, top: (spec.y ?? HEAD_Y) - 60, height: 120, display: "flex",
        justifyContent: "center", alignItems: "center", fontFamily: FONT, fontSize: sizeFor(segs), fontWeight: 700, color: C.text,
        letterSpacing: 1, opacity: step ? 1 - outU : inU * (1 - outU), filter: step ? `blur(${outU * 12}px)` : `blur(${blur}px)`,
        transform: step ? undefined : `scale(${scale})`, whiteSpace: "pre",
      }}
    >
      {segs.map(([text, color], i) => {
        const s = step ? stepped(i === 0 ? at : at + 0.25) : null;
        const trailing = i === last && /[。，]$/.test(text);
        return (
          <span
            key={i}
            style={{
              color: color ?? C.text, display: "inline-block", marginRight: trailing ? "-0.45em" : 0,
              opacity: s ? s.opacity : 1, transform: s ? `scale(${s.scale})` : undefined,
            }}
          >
            {text}
          </span>
        );
      })}
    </div>
  );
};

// ---------- the one shape: montage -> prompt -> progress bar -> player ----------
// Opening: quick cuts through Astra's own launch film, one per half beat, landing on
// the cabin shot for the wow. [our time, source time in Astra's film]
const MONTAGE: [number, number][] = [[cue.open, 1.0], [cue.m1, 3.2], [cue.m2, 6.0], [cue.m3, 18.2], [cue.wow, 14.6]];

// The prompt is shown only as its shape: one bar per wrapped row, no text.
const PromptShape: React.FC<{ scroll: number }> = ({ scroll }) => {
  const ROW = 38;
  const width = DOC.w - 112;
  return (
    <div style={{ position: "absolute", left: 56, top: 64, width, transform: `translateY(${-scroll}px)` }}>
      {promptRows.map((f, i) =>
        f > 0 ? (
          <div
            key={i}
            style={{
              position: "absolute", top: i * ROW, left: 0, height: 14, width: Math.max(28, f * width), borderRadius: 7,
              background: i === 0 ? "#5a606d" : "#343945",
            }}
          />
        ) : null,
      )}
    </div>
  );
};

const Morph: React.FC<{ t: number }> = ({ t }) => {
  if (t >= cue.gifs) return null;
  const toDoc = settle(t, cue.prompt, 0, 1, 0.7);
  const toBar = glide(t, [cue.work, cue.work + 0.45], [0, 1]);
  const toPlayer = settle(t, cue.film, 0, 1, 0.6);
  const push = glide(t, [cue.wow, cue.prompt], [1, 1.05]) + 0.05 * MONTAGE.reduce((s, [at]) => s + bump(t, at, 0.35), 0);
  const O = FILM_OPEN;
  const openRect = { ...O, x: O.x - (O.w * (push - 1)) / 2, y: O.y - (O.h * (push - 1)) / 2, w: O.w * push, h: O.h * push };
  let r = mix(openRect, DOC, toDoc);
  if (t >= cue.work) r = mix(DOC, BAR, toBar);
  if (t >= cue.film - 0.08) r = mix(BAR, PLAYER, toPlayer);
  const photo = 1 - fade(t, cue.prompt + 0.05, cue.prompt + 0.45);
  const doc = fade(t, cue.prompt + 0.15, cue.prompt + 0.5) * (1 - fade(t, cue.work, cue.work + 0.25));
  const scroll = glide(t, [cue.prompt + 0.4, cue.work - 0.1], [0, 6400]);
  const progress = glide(t, [cue.work + 0.45, cue.film - 0.15], [0, 1]);
  const film = fade(t, cue.film, cue.film + 0.12);
  const edge = "linear-gradient(to bottom, transparent 0, #000 12%, #000 86%, transparent 100%)";
  return (
    <div style={{ ...box(r), background: t < cue.work ? C.paper : C.line, boxShadow: "0 40px 120px #000c" }}>
      {photo > 0 && (
        <div style={{ ...fill, opacity: photo }}>
          {MONTAGE.map(([at, src], i) => {
            const from = Math.round(at * FPS);
            const until = i + 1 < MONTAGE.length ? Math.round(MONTAGE[i + 1][0] * FPS) : Math.ceil((cue.prompt + 0.5) * FPS);
            return (
              <Sequence key={i} from={from} durationInFrames={until - from} premountFor={30}>
                <OffthreadVideo src={staticFile("film/astra-film.mp4")} muted startFrom={Math.round(src * FPS)} style={fill} />
              </Sequence>
            );
          })}
        </div>
      )}
      {doc > 0 && (
        <div style={{ position: "absolute", inset: 0, opacity: doc, WebkitMaskImage: edge, maskImage: edge }}>
          <PromptShape scroll={scroll} />
        </div>
      )}
      {t >= cue.work && t < cue.film + 0.1 && (
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${progress * 100}%`, background: C.gold, borderRadius: 7 }} />
      )}
      <Sequence from={Math.round(FILM_AT * FPS)} premountFor={FPS}>
        <div style={{ ...fill, opacity: film }}>
          <OffthreadVideo src={staticFile("film/astra-film.mp4")} muted style={fill} />
        </div>
      </Sequence>
    </div>
  );
};

// ---------- the four photos and the camera over them ----------
type Cam = { x: number; y: number; s: number };
const centre = (i: number) => ({ x: TILES[i].x + TILES[i].w / 2, y: TILES[i].y + TILES[i].h / 2 });
const GRID: Cam = { x: W / 2, y: STAGE_Y, s: 1 };
const ZOOM = PHOTO.w / TILES[0].w;
const focus = (i: number, s: number): Cam => ({ ...centre(i), s });
// [time, target, seconds to get there]
const MOVES: [number, Cam, number][] = [
  [cue.coast, focus(1, ZOOM), 0.6],
  [cue.cabin, focus(2, ZOOM), 0.6],
  [cue.shore, focus(3, ZOOM), 0.6],
  [cue.still, GRID, 0.6],
  [cue.talk1, focus(2, OPEN.w / TILES[0].w), 2.6],
];
const camera = (t: number): Cam =>
  MOVES.reduce((from, [at, to, len]) => {
    const u = glide(t, [at, at + len], [0, 1]);
    return { x: from.x + (to.x - from.x) * u, y: from.y + (to.y - from.y) * u, s: from.s + (to.s - from.s) * u };
  }, GRID);
const FOCUS_AT: Record<number, [number, number]> = { 1: [cue.coast, cue.cabin], 2: [cue.cabin, cue.shore], 3: [cue.shore, cue.still] };
// Each lazy photo first plays whole, in colour; its highlight lands on the next beat.
const HIGHLIGHT_AT: Record<number, number> = { 1: cue.hl1, 2: cue.hl2, 3: cue.hl3 };

const Grid: React.FC<{ t: number }> = ({ t }) => {
  if (t < cue.gifs) return null;
  const cam = camera(t);
  const final = glide(t, [cue.talk1, cue.talk1 + 2.6], [0, 1]);
  const restore = 1 - fade(t, cue.talk1, cue.talk1 + 0.6);
  const film = 1 - fade(t, cue.gifs + 0.12, cue.gifs + 0.45);
  const filmFrom = Math.round((cue.gifs - FILM_AT) * FPS);
  const zoomed = fade(t, cue.coast, cue.coast + 0.4) * (1 - fade(t, cue.still, cue.still + 0.5));
  const pulse = 0.78 + 0.22 * Math.cos((t - cue.coast) * Math.PI * 2);
  return (
    <div
      style={{
        position: "absolute", inset: 0, transformOrigin: "0 0",
        transform: `translate(${W / 2 - cam.x * cam.s}px, ${STAGE_Y - cam.y * cam.s}px) scale(${cam.s})`,
      }}
    >
      {PHOTOS.map((name, i) => {
        const u = settle(t, cue.gifs + i * 0.06, 0, 1, 0.65);
        const r = mix(QUARTERS[i], TILES[i], u);
        const isCabin = i === 2;
        const lazy = LAZY.includes(i);
        const away = isCabin ? 1 : 1 - fade(t, cue.talk1, cue.talk1 + 1.4);
        if (away <= 0) return null;
        const span = FOCUS_AT[i];
        const inFocus = span ? fade(t, span[0] - 0.2, span[0] + 0.1) * (1 - fade(t, span[1], span[1] + 0.3)) : 0;
        const dim = 1 - zoomed * (1 - inFocus);
        const lit = lazy ? fade(t, HIGHLIGHT_AT[i], HIGHLIGHT_AT[i] + 0.4) * restore : 0;
        const drain = isCabin ? Math.max(lit, fade(t, cue.lazy, cue.lazy + 0.8)) : lit;
        const outline = lazy
          ? pulse *
            Math.max(
              lit,
              isCabin ? fade(t, cue.lazy + 0.3, cue.lazy + 0.8) : 0,
            )
          : 0;
        const q = QUARTERS[i];
        const k = Math.max(r.w / q.w, r.h / q.h);
        const radius = isCabin ? r.r * (1 - final) : r.r;
        return (
          <div key={name} style={{ ...box({ ...r, r: radius }), opacity: away * dim, boxShadow: "0 30px 90px #000b", background: C.paper }}>
            <Sequence from={Math.round(cue.gifs * FPS) - 30}>
              <Photo name={name} drain={drain} outline={outline} />
            </Sequence>
            {film > 0 && (
              <div
                style={{
                  position: "absolute", opacity: film, width: PLAYER.w * k, height: PLAYER.h * k,
                  left: r.w / 2 - (q.x - PLAYER.x + q.w / 2) * k, top: r.h / 2 - (q.y - PLAYER.y + q.h / 2) * k,
                }}
              >
                <Sequence from={Math.round(cue.gifs * FPS)} durationInFrames={FPS}>
                  <OffthreadVideo src={staticFile("film/astra-film.mp4")} muted startFrom={filmFrom} style={fill} />
                </Sequence>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const hit = impact(t);
  return (
    <AbsoluteFill style={{ background: C.bg, overflow: "hidden" }}>
      {/* Preload the outlines so they never pop in late. */}
      {LAZY.map((i) => (
        <Img key={i} src={staticFile(`loops/${PHOTOS[i]}-outline.png`)} style={{ position: "absolute", width: 1, height: 1, opacity: 0 }} />
      ))}
      <AbsoluteFill
        style={{
          background: `radial-gradient(70% 40% at 50% ${(STAGE_Y / 1920) * 100}%, #3a2a1255 0%, transparent 70%)`,
          opacity: 0.6 + 0.4 * Math.min(1, hit),
        }}
      />
      <AbsoluteFill style={{ transform: `scale(${1 + 0.008 * hit})` }}>
        <Morph t={t} />
        <Grid t={t} />
        {LINES.map((spec, i) => (
          <Line key={i} spec={spec} t={t} />
        ))}
      </AbsoluteFill>
      <Html5Audio src={staticFile("score.wav")} pauseWhenBuffering />
    </AbsoluteFill>
  );
};
