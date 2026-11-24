import { Easing, interpolate } from "remotion";
import score from "../audio/score.json";

// One clock for picture and sound: every time below comes from the score.
export const FPS = 60;
export const W = 1920;
export const H = 1080;
export const SECONDS = score.seconds;
export const cue = score.cues;
export const sfx = score.sfx;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const inOut = Easing.bezier(0.65, 0, 0.25, 1);
export const out = Easing.bezier(0.16, 1, 0.3, 1);
export const inn = Easing.bezier(0.55, 0, 0.9, 0.4);

/** Eased, clamped keyframes: the shape-change curve of the whole film. */
export const glide = (t: number, keys: number[], values: number[]) =>
  interpolate(t, keys, values, { ...clamp, easing: inOut });
/** Linear keyframes, for opacities and schedules. */
export const lin = (t: number, keys: number[], values: number[]) => interpolate(t, keys, values, clamp);
/** 0 → 1 with a fast start and a soft landing. */
export const reveal = (t: number, from: number, to: number) =>
  interpolate(t, [from, to], [0, 1], { ...clamp, easing: out });
/** 0 → 1, slow start, fast end: things leaving. */
export const leave = (t: number, from: number, to: number) =>
  interpolate(t, [from, to], [0, 1], { ...clamp, easing: inn });
/** One-shot impulse 0 → 1 → 0 that peaks just after `at`. */
export const bump = (t: number, at: number, length = 0.4) => {
  const u = (t - at) / length;
  return u <= 0 || u >= 1 ? 0 : Math.sin(Math.PI * Math.sqrt(u)) * (1 - u);
};
/** Arrives at `at` with a small overshoot: 0 → ~1.07 → 1. */
export const pop = (t: number, at: number, length = 0.45) => {
  const u = (t - at) / length;
  if (u <= 0) return 0;
  if (u >= 1) return 1;
  return 1 - Math.pow(1 - u, 3) * Math.cos(u * Math.PI * 1.5);
};
export const mix = (a: number, b: number, k: number) => a + (b - a) * k;

export const hexMix = (a: string, b: string, k: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const c = pa.map((v, i) => Math.round(mix(v, pb[i], Math.min(1, Math.max(0, k)))));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
};

/** The whole frame breathes on the big downbeats. */
export const impact = (t: number) =>
  [
    [cue.online, 1],
    [cue.onlineA, 0.35],
    [cue.crash, 0.5],
    [cue.onlineB, 0.35],
    [cue.auth, 0.4],
    [cue.menu, 0.7],
    [cue.logo, 0.9],
    [cue.get, 0.5],
  ].reduce((sum, [at, weight]) => sum + weight * bump(t, at, 0.6), 0);
