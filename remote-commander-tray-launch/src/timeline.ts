import { cue, glide, hexMix, lin, mix, pop, reveal, sfx } from "./clock";
import {
  CLOSE_BUTTON,
  Cam,
  MENU,
  MENU_CAM,
  MENU_ROWS,
  TOAST,
  TRAY,
  TRAY_ICON,
  WIDE,
  WINDOW,
  center,
  menuRowRect,
} from "./geometry";
import { STATE_COLOR, State } from "./StatusIcon";

// ── Camera ─────────────────────────────────────────────────────────────
// One take: wide on the console, follow it into the corner, lean into the
// tray, make room for the menu, pull back out for the logo.
const camKeys: [number, Cam][] = [
  [0, { ...WIDE, s: 1 }],
  [cue.squash + 0.85, { ...WIDE, s: 1.03 }],
  [cue.online + 0.1, TRAY],
  [cue.menu - 0.7, { ...TRAY, s: 3.7 }],
  [cue.menu, MENU_CAM],
  [cue.fold + 0.1, { ...MENU_CAM, s: 2.66 }],
  [cue.fold + 1.3, WIDE],
];
// Holds drift linearly (the frame never freezes); moves between them are eased.
const HOLDS = new Set([0, cue.online + 0.1, cue.menu]);
export const camAt = (t: number): Cam => {
  for (let i = 0; i < camKeys.length - 1; i++) {
    const [a, ca] = camKeys[i];
    const [b, cb] = camKeys[i + 1];
    if (t <= b || i === camKeys.length - 2) {
      const f = HOLDS.has(a) ? lin(t, [a, b], [0, 1]) : glide(t, [a, b], [0, 1]);
      // zoom in log space so the push feels constant
      const s = Math.exp(mix(Math.log(ca.s), Math.log(cb.s), f));
      // keep the focus point steady relative to zoom
      const w = (1 / s - 1 / ca.s) / (1 / cb.s - 1 / ca.s || 1);
      const k = ca.s === cb.s ? f : w;
      return { x: mix(ca.x, cb.x, k), y: mix(ca.y, cb.y, k), s };
    }
  }
  return WIDE;
};

// ── The console window folding into the tray icon ──────────────────────
export const FOLD_START = cue.squash + 0.3; // 4.3
export const FOLD_END = cue.land - 0.05; // 5.45
const DISC = 14.5; // the icon's disc diameter at 16 px

export const foldAt = (t: number) => {
  const p = glide(t, [FOLD_START, FOLD_END], [0, 1]);
  const w = Math.exp(mix(Math.log(WINDOW.w), Math.log(DISC), p));
  const h = Math.exp(mix(Math.log(WINDOW.h), Math.log(DISC), Math.min(1, p * 1.08)));
  // A tossed arc: up and right, then down into the tray.
  const a = center(WINDOW);
  const c = { x: 1590, y: 520 };
  const b = { x: TRAY_ICON.x, y: TRAY_ICON.y };
  const q = p;
  const x = (1 - q) * (1 - q) * a.x + 2 * (1 - q) * q * c.x + q * q * b.x;
  const y = (1 - q) * (1 - q) * a.y + 2 * (1 - q) * q * c.y + q * q * b.y;
  const roundness = glide(t, [FOLD_START + 0.35, FOLD_END - 0.1], [0, 1]);
  const radius = mix(8, Math.min(w, h) / 2, roundness);
  // Anticipation on the downbeat: squash a little, lift, then go.
  const anticipate = glide(t, [cue.squash, cue.squash + 0.15, FOLD_START], [0, 1, 0]);
  return {
    p,
    x,
    y,
    w,
    h,
    radius,
    sx: 1 + 0.018 * anticipate,
    sy: 1 - 0.03 * anticipate,
    lift: -10 * anticipate,
    color: hexMix("#0c0c0c", STATE_COLOR.connecting, lin(t, [FOLD_START + 0.55, FOLD_END], [0, 1])),
    content: 1 - lin(t, [FOLD_START + 0.1, FOLD_START + 0.55], [0, 1]),
  };
};

// ── Tray icon states ───────────────────────────────────────────────────
const changes: [number, State | "hidden"][] = [
  [cue.land - 0.06, "connecting"],
  [cue.online, "online"],
  [cue.sleep + 0.2, "hidden"],
  [cue.wake, "connecting"],
  [cue.onlineA, "online"],
  [cue.crash, "error"],
  [cue.retry, "connecting"],
  [cue.onlineB, "online"],
  [cue.chapterC + 0.75, "connecting"], // an ordinary network blip: icon only, no notification
  [cue.chapterC + 1.25, "online"],
  [cue.auth, "auth"],
  [cue.signedIn, "connecting"],
  [cue.onlineC, "online"],
];
const X = 0.16; // cross-fade length

export const iconAt = (t: number) => {
  let i = -1;
  for (let j = 0; j < changes.length; j++) if (t >= changes[j][0]) i = j;
  if (i < 0) return undefined;
  const [at, state] = changes[i];
  const prev = i > 0 ? changes[i - 1][1] : "hidden";
  const k = lin(t, [at, at + X], [0, 1]);
  if (state === "hidden") {
    const fade = 1 - k;
    if (fade <= 0) return undefined;
    return { color: STATE_COLOR.online, glyph: { online: 1 }, scale: 1 - 0.4 * (1 - fade), opacity: fade, checkDraw: 1, ring: 0 };
  }
  const fromHidden = prev === "hidden";
  const glyph: Partial<Record<State, number>> = { [state]: k };
  if (!fromHidden) glyph[prev as State] = (glyph[prev as State] ?? 0) + (1 - k);
  const color = fromHidden ? STATE_COLOR[state] : hexMix(STATE_COLOR[prev as State], STATE_COLOR[state], k);
  // Every change lands with a small pop; a crash shakes.
  const appear = fromHidden ? pop(t, at, 0.5) : 1;
  const pulse = fromHidden ? 0 : 0.22 * Math.sin(Math.PI * Math.min(1, Math.max(0, (t - at) / 0.3)));
  const shake = state === "error" ? 1.6 * Math.sin((t - at) * 60) * Math.max(0, 1 - (t - at) / 0.35) : 0;
  const checkDraw = state === "online" ? reveal(t, at, at + 0.32) : 1;
  // Restart backoff: a ring sweeps while the tray waits to restart the agent.
  const ring = state === "error" ? lin(t, [at + 0.12, cue.retry], [0, 1]) : 0;
  return { color, glyph, scale: appear * (1 + pulse), opacity: 1, checkDraw, ring, shake };
};

// ── Cursor ─────────────────────────────────────────────────────────────
const closeAt = center(CLOSE_BUTTON);
const toastAt = { x: TOAST.x + 210, y: TOAST.y + 92 };
const trayAt = { x: TRAY_ICON.x + 2, y: TRAY_ICON.y + 3 };
const rowAt = (i: number) => {
  const r = menuRowRect(i);
  return { x: MENU.x + 92, y: r.y + r.h / 2 + 1 };
};
export const ROW_RESTART = MENU_ROWS.findIndex((r) => r.text === "Restart connection");
export const ROW_STOP = MENU_ROWS.findIndex((r) => r.text === "Stop agent");

type Way = [number, { x: number; y: number }];
const path: Way[] = [
  [cue.pain - 0.3, { x: 1330, y: 760 }],
  [sfx.hover, closeAt],
  [sfx.retreat, closeAt],
  [cue.squash, { x: closeAt.x - 50, y: closeAt.y + 44 }],
  [cue.auth + 0.85, { x: 1935, y: 1000 }],
  [cue.toastClick - 0.1, toastAt],
  [cue.toastClick + 0.25, toastAt],
  [cue.menu - 0.25, trayAt],
  [cue.menu + 0.2, trayAt],
  [cue.menu + 0.6, rowAt(ROW_RESTART)],
  [cue.menu + 1.3, rowAt(ROW_RESTART)],
  [cue.menu + 1.7, rowAt(ROW_STOP)],
];
export const cursorAt = (t: number) => {
  const visible = (t >= cue.pain - 0.3 && t < cue.squash + 0.2) || (t >= cue.auth + 0.85 && t < cue.fold + 0.25);
  if (!visible) return undefined;
  let p = path[0][1];
  for (let i = 0; i < path.length - 1; i++) {
    const [a, pa] = path[i];
    const [b, pb] = path[i + 1];
    if (t >= a && t <= b) {
      p = { x: glide(t, [a, b], [pa.x, pb.x]), y: glide(t, [a, b], [pa.y, pb.y]) };
      break;
    }
    if (t > b) p = pb;
  }
  const opacity = t < cue.squash + 0.2 ? lin(t, [cue.pain - 0.3, cue.pain - 0.15, cue.squash, cue.squash + 0.2], [0, 1, 1, 0]) : lin(t, [cue.fold, cue.fold + 0.25], [1, 0]);
  const press = Math.max(
    lin(t, [cue.toastClick, cue.toastClick + 0.04, cue.toastClick + 0.12], [0, 1, 0]),
    lin(t, [sfx.rightClick, sfx.rightClick + 0.04, sfx.rightClick + 0.12], [0, 1, 0]),
  );
  return { ...p, opacity, press };
};

export const menuHoverAt = (t: number) => {
  const c = cursorAt(t);
  if (!c || t < cue.menu + 0.3) return -1;
  return MENU_ROWS.findIndex((row, i) => {
    if (row.kind !== "item") return false;
    const r = menuRowRect(i);
    return c.y >= r.y && c.y < r.y + r.h && c.x >= r.x && c.x <= r.x + r.w;
  });
};
