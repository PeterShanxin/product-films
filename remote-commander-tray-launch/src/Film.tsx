import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FPS, SECONDS, bump, cue, sfx, glide, hexMix, impact, lin, mix, pop, reveal } from "./clock";
import { Taskbar, Wallpaper } from "./Desktop";
import { MENU, TOAST, TRAY_ICON, WINDOW, toScreen } from "./geometry";
import { STATE_COLOR, StatusIcon } from "./StatusIcon";
import { Terminal } from "./Terminal";
import { COPY, DISPLAY, HEAVY, Lang } from "./copy";
import { FOLD_END, FOLD_START, camAt, cursorAt, foldAt, iconAt, menuHoverAt } from "./timeline";
import { Cursor, TrayMenu, Toast } from "./Widgets";

const INK = "#f4f6fa";
const MUTED = "#9aa4b2";

export const LangContext = React.createContext<Lang>("en");
const useLang = () => React.useContext(LangContext);

/** A full-width 。or ？ at the end of a centred CJK line pushes it right: pull it back. */
const Tail: React.FC<{ text: string }> = ({ text }) => {
  const last = text.slice(-1);
  if (!"。？！".includes(last)) return <>{text}</>;
  return (
    <>
      {text.slice(0, -1)}
      <span style={{ marginRight: "-0.45em" }}>{last}</span>
    </>
  );
};

/** A line of copy: blurs in on its cue, blurs out before the next one. */
const Line: React.FC<{
  t: number;
  at: number;
  until: number;
  size: number;
  weight?: number;
  color?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ t, at, until, size, weight, color = INK, style, children }) => {
  const lang = useLang();
  const inK = reveal(t, at - 0.06, at + 0.4);
  const outK = lin(t, [until - 0.28, until], [0, 1]);
  const k = inK * (1 - outK);
  if (k <= 0.001) return null;
  const blur = Math.max(6, size * 0.12) * (1 - inK) + Math.max(6, size * 0.12) * outK;
  return (
    <div
      style={{
        position: "absolute",
        fontFamily: DISPLAY[lang],
        fontSize: size,
        fontWeight: weight ?? HEAVY[lang],
        letterSpacing: size > 60 ? -0.012 * size : 0,
        lineHeight: 1.12,
        color,
        opacity: k,
        filter: blur > 0.2 ? `blur(${blur}px)` : undefined,
        transform: `translateY(${(1 - inK) * 14}px) scale(${1 - 0.02 * (1 - inK)})`,
        transformOrigin: "0 50%",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Everything that lives on the desktop, in desktop pixels. */
export const World: React.FC<{ t: number }> = ({ t }) => {
  const fold = foldAt(t);
  const icon = iconAt(t);
  const cursor = cursorAt(t);
  const closeHover = lin(t, [sfx.hover - 0.13, sfx.hover, sfx.retreat, sfx.retreat + 0.12], [0, 1, 1, 0]);
  const terminalButton = 1 - glide(t, [FOLD_START + 0.2, FOLD_START + 0.6], [0, 1]);

  // Sign out → sign in: the desktop goes dark and comes back the next morning.
  const night = lin(t, [cue.sleep + 0.05, cue.sleep + 0.45, cue.wake - 0.25, cue.wake + 0.1], [0, 0.94, 0.94, 0]);
  const clock: [string, string] = t < cue.sleep + 0.6 ? ["18:42", "24/11/2026"] : ["09:00", "25/11/2026"];

  // Toast: rises on `auth`, dismissed by the click.
  const toastIn = reveal(t, cue.auth + 0.05, cue.auth + 0.45);
  const toastOut = glide(t, [cue.toastClick + 0.08, cue.toastClick + 0.38], [0, 1]);
  const toastVisible = t >= cue.auth && toastOut < 1;

  // Menu: grows out of the icon on the right-click, folds back into it.
  const open = glide(t, [cue.menu + 0.02, cue.menu + 0.3], [0, 1]) - glide(t, [cue.fold, cue.fold + 0.3], [0, 1]);
  const settleK = bump(t, cue.menu + 0.3, 0.35);
  const disc = { x: TRAY_ICON.x - 7.25, y: TRAY_ICON.y - 7.25, w: 14.5, h: 14.5 };
  const m = {
    x: mix(disc.x, MENU.x, open),
    y: mix(disc.y, MENU.y, open) - 3 * settleK,
    w: mix(disc.w, MENU.w, open),
    h: mix(disc.h, MENU.h, open) + 3 * settleK,
  };
  const menuContent = lin(open, [0.7, 1], [0, 1]);

  return (
    <>
      <Wallpaper />
      {/* the console window, then the shape it folds into */}
      {t < FOLD_END + 0.1 && (
        <div
          style={{
            position: "absolute",
            left: fold.x - fold.w / 2,
            top: fold.y - fold.h / 2 + fold.lift,
            width: fold.w,
            height: fold.h,
            borderRadius: fold.radius,
            background: fold.color,
            overflow: "hidden",
            transform: `scale(${fold.sx}, ${fold.sy})`,
            boxShadow: `0 ${30 * (1 - fold.p)}px ${80 * (1 - fold.p)}px rgba(0,0,0,${0.55 * (1 - fold.p)})`,
            opacity: lin(t, [FOLD_END, FOLD_END + 0.12], [1, 0]),
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              transform: `scale(${fold.w / WINDOW.w}, ${fold.h / WINDOW.h})`,
              transformOrigin: "0 0",
              opacity: fold.content,
            }}
          >
            <Terminal t={t} closeHover={closeHover} />
          </div>
        </div>
      )}
      <Taskbar terminal={terminalButton} clock={clock} />
      {icon && (
        <div
          style={{
            position: "absolute",
            left: TRAY_ICON.x - 8 + (icon.shake ?? 0),
            top: TRAY_ICON.y - 8,
            width: 16,
            height: 16,
            opacity: icon.opacity * (t < cue.fold + 0.3 ? 1 : 0),
            transform: `scale(${icon.scale})`,
          }}
        >
          <StatusIcon size={16} color={icon.color} glyph={icon.glyph} checkDraw={icon.checkDraw} />
          {icon.ring > 0 && icon.ring < 1 && (
            <svg width={30} height={30} viewBox="0 0 30 30" style={{ position: "absolute", left: -7, top: -7, overflow: "visible" }}>
              <circle
                cx={15}
                cy={15}
                r={12.5}
                fill="none"
                stroke={STATE_COLOR.connecting}
                strokeWidth={1.6}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={`${icon.ring} 1`}
                transform="rotate(-90 15 15)"
              />
            </svg>
          )}
        </div>
      )}
      {/* glow under the icon when it first comes online */}
      <div
        style={{
          position: "absolute",
          left: TRAY_ICON.x - 40,
          top: TRAY_ICON.y - 40,
          width: 80,
          height: 80,
          borderRadius: 40,
          background: "radial-gradient(closest-side, rgba(22,163,74,0.55), rgba(22,163,74,0))",
          opacity: bump(t, cue.online, 1.1) * 1.4,
          pointerEvents: "none",
        }}
      />
      {[0, 0.18].map((d) => {
        const r = lin(t, [cue.online + d, cue.online + d + 0.9], [0, 1]);
        if (r <= 0 || r >= 1) return null;
        const radius = 9 + 34 * (1 - Math.pow(1 - r, 3));
        return (
          <div
            key={d}
            style={{
              position: "absolute",
              left: TRAY_ICON.x - radius,
              top: TRAY_ICON.y - radius,
              width: radius * 2,
              height: radius * 2,
              borderRadius: radius,
              border: `1.2px solid ${STATE_COLOR.online}`,
              opacity: (1 - r) * 0.9,
              boxSizing: "border-box",
            }}
          />
        );
      })}
      {toastVisible && (
        <div
          style={{
            position: "absolute",
            left: TOAST.x + 40 * toastOut,
            top: TOAST.y + 24 * (1 - toastIn),
            opacity: toastIn * (1 - toastOut),
          }}
        >
          <Toast />
        </div>
      )}
      {open > 0.001 && (
        <div
          style={{
            position: "absolute",
            left: m.x,
            top: m.y,
            width: m.w,
            height: m.h,
            borderRadius: mix(7.25, 0, open),
            background: hexMix(STATE_COLOR.online, "#fcfcfc", lin(open, [0, 0.5], [0, 1])),
            border: `1px solid rgba(151,151,151,${open})`,
            boxSizing: "border-box",
            boxShadow: `2px 3px 8px rgba(0,0,0,${0.45 * open})`,
            overflow: "hidden",
          }}
        >
          <TrayMenu hover={menuHoverAt(t)} content={menuContent} />
        </div>
      )}
      <div style={{ position: "absolute", inset: 0, background: "#000", opacity: night }} />
      {cursor && (
        <div style={{ position: "absolute", left: cursor.x, top: cursor.y, opacity: cursor.opacity }}>
          <Cursor press={cursor.press} />
        </div>
      )}
    </>
  );
};

/** The status icon leaves the tray and becomes the app's logo. */
const Hero: React.FC<{ t: number }> = ({ t }) => {
  const lift = glide(t, [cue.fold + 0.3, cue.logo - 0.1], [0, 1]);
  if (lift <= 0) return null;
  const cam = camAt(t);
  const from = toScreen({ x: TRAY_ICON.x, y: TRAY_ICON.y }, cam);
  const to = { x: 960, y: 372 };
  // arc up from the corner into the centre
  const q = lift;
  const c = { x: from.x - 40, y: to.y + 40 };
  const x = (1 - q) * (1 - q) * from.x + 2 * (1 - q) * q * c.x + q * q * to.x;
  const y = (1 - q) * (1 - q) * from.y + 2 * (1 - q) * q * c.y + q * q * to.y;
  const size = mix(16 * cam.s, 208, Math.pow(lift, 0.8));
  const morph = glide(t, [cue.logo - 0.55, cue.logo], [0, 1]);
  const land = bump(t, cue.logo, 0.5);
  const color = hexMix(STATE_COLOR.online, "#2563EB", morph);
  return (
    <div
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        transform: `scale(${1 + 0.07 * land})`,
        filter: `drop-shadow(0 ${18 * lift}px ${40 * lift}px rgba(37,99,235,${0.35 * morph}))`,
      }}
    >
      <StatusIcon size={size} color={color} glyph={{ online: 1 }} toChevron={morph} />
    </div>
  );
};

const EndCard: React.FC<{ t: number }> = ({ t }) => {
  const lang = useLang();
  const copy = COPY[lang];
  const nameK = reveal(t, cue.name2 - 0.05, cue.name2 + 0.45);
  const shine = lin(t, [cue.name2 + 0.25, cue.name2 + 1.05], [-30, 130]);
  const tagK = reveal(t, cue.tagline - 0.05, cue.tagline + 0.45);
  const fadeOut = lin(t, [SECONDS - 0.6, SECONDS], [0, 1]);
  if (t < cue.name2 - 0.1) return null;
  return (
    <AbsoluteFill style={{ opacity: 1 - fadeOut }}>
      <div
        style={{
          position: "absolute",
          top: 520,
          width: "100%",
          textAlign: "center",
          fontFamily: DISPLAY[lang],
          fontSize: 92,
          fontWeight: 600,
          letterSpacing: -1.2,
          opacity: nameK,
          filter: nameK < 1 ? `blur(${(1 - nameK) * 11}px)` : undefined,
          transform: `translateY(${(1 - nameK) * 16}px) scale(${1 + 0.025 * bump(t, cue.name2 + 0.5, 0.5)})`,
          backgroundImage: `linear-gradient(100deg, ${INK} ${shine - 18}%, #ffffff ${shine - 6}%, #9cc3ff ${shine}%, #ffffff ${shine + 6}%, ${INK} ${shine + 18}%)`,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        {copy.name}
      </div>
      <div
        style={{
          position: "absolute",
          top: 652,
          width: "100%",
          textAlign: "center",
          fontFamily: DISPLAY[lang],
          fontSize: 42,
          fontWeight: 500,
          color: MUTED,
          opacity: tagK,
          filter: tagK < 1 ? `blur(${(1 - tagK) * 8}px)` : undefined,
          transform: `translateY(${(1 - tagK) * 12}px)`,
        }}
      >
        {lang === "zh" ? <Tail text={copy.tagline} /> : copy.tagline}
      </div>
      <GetRow t={t} />
    </AbsoluteFill>
  );
};

const StoreMark: React.FC = () => (
  <svg viewBox="0 0 24 24" width={42} height={42} fill="none" stroke="#e8ecf2" strokeWidth={1.6} strokeLinejoin="round">
    <path d="M3.5 7.5h17l-1.2 12.5H4.7z" />
    <path d="M8.5 7.5V6a3.5 3.5 0 0 1 7 0v1.5" />
    <rect x={8.6} y={10.6} width={3} height={3} fill="#e8ecf2" stroke="none" />
    <rect x={12.4} y={10.6} width={3} height={3} fill="#e8ecf2" stroke="none" />
    <rect x={8.6} y={14.4} width={3} height={3} fill="#e8ecf2" stroke="none" />
    <rect x={12.4} y={14.4} width={3} height={3} fill="#e8ecf2" stroke="none" />
  </svg>
);
const GitHubMark: React.FC = () => (
  <svg viewBox="0 0 16 16" width={38} height={38} fill="#e8ecf2">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
  </svg>
);

const GetRow: React.FC<{ t: number }> = ({ t }) => {
  const lang = useLang();
  const items: [React.ReactNode, string][] = [
    [<StoreMark key="s" />, "Microsoft Store"],
    [<GitHubMark key="g" />, "GitHub"],
  ];
  return (
    <div style={{ position: "absolute", top: 806, width: "100%", display: "flex", justifyContent: "center", gap: 72 }}>
      {items.map(([mark, label], i) => {
        const k = pop(t, cue.get + i * 0.25, 0.5);
        const o = reveal(t, cue.get + i * 0.25, cue.get + i * 0.25 + 0.3);
        return (
          <div
            key={label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              opacity: o,
              transform: `translateY(${(1 - k) * 18}px) scale(${0.92 + 0.08 * k})`,
              fontFamily: DISPLAY[lang],
              fontSize: 36,
              fontWeight: 500,
              color: "#e8ecf2",
            }}
          >
            {mark}
            <span>{label}</span>
          </div>
        );
      })}
    </div>
  );
};

const Lines: React.FC<{ lines: readonly string[] }> = ({ lines }) => (
  <>
    {lines.map((l, i) => (
      <React.Fragment key={l}>
        {i > 0 && <br />}
        {l}
      </React.Fragment>
    ))}
  </>
);

export const Film: React.FC<{ lang?: Lang }> = ({ lang = "en" }) => (
  <LangContext.Provider value={lang}>
    <FilmBody />
  </LangContext.Provider>
);

const FilmBody: React.FC = () => {
  const lang = useLang();
  const copy = COPY[lang];
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const cam = camAt(t);
  const breathe = 1 + 0.006 * impact(t);
  const endDim = lin(t, [cue.fold + 0.6, cue.fold + 1.6], [0, 1]);

  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${breathe})` }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 1920,
            height: 1080,
            transformOrigin: "0 0",
            transform: `translate(${960 - cam.x * cam.s}px, ${540 - cam.y * cam.s}px) scale(${cam.s})`,
          }}
        >
          <World t={t} />
        </div>
        <AbsoluteFill style={{ background: "#05070b", opacity: endDim * 0.97 }} />
      </AbsoluteFill>

      {/* Copy: one line at a time, in screen space. The hook is already up on frame 0. */}
      <Line t={t} at={cue.hook - 0.5} until={cue.pain} size={84} style={{ top: 88, width: "100%", textAlign: "center", transformOrigin: "50% 50%" }}>
        {lang === "zh" ? <Tail text={copy.hook} /> : copy.hook}
      </Line>
      <Line t={t} at={cue.pain} until={cue.squash + 0.15} size={84} style={{ top: 88, width: "100%", textAlign: "center", transformOrigin: "50% 50%" }}>
        {lang === "zh" ? <Tail text={copy.pain} /> : copy.pain}
      </Line>
      <Line t={t} at={cue.name} until={cue.sleep - 0.15} size={104} weight={HEAVY.en} style={{ left: 128, top: 300 }}>
        {copy.name}
      </Line>
      <Line t={t} at={cue.value} until={cue.sleep - 0.15} size={lang === "zh" ? 52 : 48} weight={500} color={MUTED} style={{ left: 132, top: 440 }}>
        {copy.value}
      </Line>
      <Line t={t} at={cue.sleep} until={cue.chapterB} size={76} style={{ left: 128, top: 128 }}>
        <Lines lines={copy.signIn} />
      </Line>
      <Line t={t} at={cue.chapterB} until={cue.chapterC} size={76} style={{ left: 128, top: 128 }}>
        <Lines lines={copy.crash} />
      </Line>
      <Line t={t} at={cue.chapterC} until={cue.menu - 0.35} size={76} style={{ left: 128, top: 128 }}>
        <Lines lines={copy.quiet} />
      </Line>
      <Line t={t} at={cue.menu} until={cue.fold} size={76} style={{ left: 120, top: 250 }}>
        <Lines lines={copy.control} />
      </Line>
      {copy.facts.map((fact, i) => (
        <Line
          key={fact}
          t={t}
          at={cue.facts + i * 0.25}
          until={cue.fold}
          size={34}
          weight={500}
          color="#c9d1dc"
          style={{ left: 124 + (i % 2) * 560, top: 500 + Math.floor(i / 2) * 62 }}
        >
          {fact}
        </Line>
      ))}

      <Hero t={t} />
      <EndCard t={t} />
    </AbsoluteFill>
  );
};
