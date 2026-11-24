import { Easing, interpolate } from "remotion";
import score from "../audio/score.json";

export const cue = score.cues;
export const FPS = 60;
export const W = 1080;
export const H = 1920;
export const SECONDS = score.seconds;
export const FONT = '"Microsoft YaHei UI", "Microsoft YaHei", "Segoe UI", sans-serif';
export const C = {
  bg: "#0a0c11",
  text: "#f4f2ee",
  dim: "#8d919c",
  gold: "#f3c36b",
  paper: "#14171e",
  line: "#262a33",
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const glide = (t: number, keys: number[], values: number[]) =>
  interpolate(t, keys, values, { ...clamp, easing: Easing.bezier(0.65, 0, 0.25, 1) });
export const reveal = (t: number, a: number, b: number) =>
  interpolate(t, [a, b], [0, 1], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });
export const fade = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], clamp);
// Wind-up, ~6 % overshoot, settle.
export const settle = (t: number, at: number, a: number, b: number, length = 0.6) =>
  glide(t, [at - 0.08, at, at + length * 0.55, at + length], [a, a - (b - a) * 0.04, b + (b - a) * 0.06, b]);
export const bump = (t: number, at: number, length = 0.4) => {
  const u = (t - at) / length;
  return u <= 0 || u >= 1 ? 0 : Math.sin(Math.PI * Math.sqrt(u)) * (1 - u);
};
const accents: [number, number][] = [
  [cue.wow, 0.6], [cue.film, 1], [cue.stutter, 0.5], [cue.gifs, 0.6], [cue.wow2, 0.5], [cue.hl1, 0.5],
  [cue.hl2, 0.5], [cue.hl3, 0.5], [cue.talk1, 0.3], [cue.title, 0.8], [cue.lazy, 0.6],
];
export const impact = (t: number) => accents.reduce((s, [at, w]) => s + w * bump(t, at, 0.7), 0);

export type Rect = { x: number; y: number; w: number; h: number; r: number };
export const mix = (a: Rect, b: Rect, u: number): Rect => ({
  x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u, w: a.w + (b.w - a.w) * u,
  h: a.h + (b.h - a.h) * u, r: a.r + (b.r - a.r) * u,
});
const centred = (w: number, h: number, cy: number, r: number): Rect => ({ x: (W - w) / 2, y: cy - h / 2, w, h, r });

// Stage geometry. Astra's photos are 4:3 (1254 x 940 source).
export const STAGE_Y = 1080;
export const OPEN = centred(1260, 945, STAGE_Y, 0);
export const FILM_OPEN = centred(1080, 607.5, STAGE_Y, 0); // Astra's 16:9 film, full width
export const PHOTO = centred(1000, 750, STAGE_Y, 28);
export const DOC = centred(880, 1120, STAGE_Y, 28);
export const BAR = centred(880, 14, STAGE_Y, 7);
export const PLAYER = centred(1000, 562.5, STAGE_Y, 24);
const GAP = 24;
const TW = (1000 - GAP) / 2;
const TH = (TW * 3) / 4;
const GRID_TOP = STAGE_Y - (TH * 2 + GAP) / 2;
export const TILES: Rect[] = [0, 1, 2, 3].map((i) => ({
  x: 40 + (i % 2) * (TW + GAP), y: GRID_TOP + Math.floor(i / 2) * (TH + GAP), w: TW, h: TH, r: 20,
}));
// Each tile starts as one quarter of the player.
export const QUARTERS: Rect[] = [0, 1, 2, 3].map((i) => ({
  x: PLAYER.x + (i % 2) * (PLAYER.w / 2), y: PLAYER.y + Math.floor(i / 2) * (PLAYER.h / 2),
  w: PLAYER.w / 2, h: PLAYER.h / 2, r: 0,
}));
