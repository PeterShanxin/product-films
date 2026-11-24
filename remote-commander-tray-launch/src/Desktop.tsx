import React from "react";
import { BELL_X, CHEVRON_X, CLOCK_X, SYSTEM_ICONS_X, TASKBAR } from "./geometry";

export const UI_FONT = '"Segoe UI Variable Text", "Segoe UI Variable", "Segoe UI", sans-serif';
export const DISPLAY_FONT = '"Segoe UI Variable Display", "Segoe UI Variable", "Segoe UI", sans-serif';
export const MONO_FONT = '"Cascadia Mono", "Cascadia Code", Consolas, monospace';

/** A dark Windows 11 desktop: one soft bloom, nothing on it. */
export const Wallpaper: React.FC = () => (
  <div style={{ position: "absolute", inset: 0, background: "#080b12", overflow: "hidden" }}>
    <div
      style={{
        position: "absolute",
        left: -300,
        top: 260,
        width: 1700,
        height: 1300,
        borderRadius: "50%",
        background: "radial-gradient(closest-side, rgba(37,99,235,0.20), rgba(37,99,235,0.06) 55%, rgba(37,99,235,0) 100%)",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: 980,
        top: -420,
        width: 1400,
        height: 1100,
        borderRadius: "50%",
        background: "radial-gradient(closest-side, rgba(56,189,248,0.10), rgba(56,189,248,0) 100%)",
      }}
    />
  </div>
);

const Glyph: React.FC<{ x: number; children: React.ReactNode; size?: number; opacity?: number; scale?: number }> = ({
  x,
  children,
  size = 24,
  opacity = 1,
  scale = 1,
}) => (
  <div
    style={{
      position: "absolute",
      left: x - size / 2,
      top: TASKBAR.y + TASKBAR.h / 2 - size / 2,
      width: size,
      height: size,
      opacity,
      transform: `scale(${scale})`,
    }}
  >
    {children}
  </div>
);

/** Centre group: Start, Search, Explorer and the console the film opens with. */
const CenterApps: React.FC<{ terminal: number }> = ({ terminal }) => {
  const step = 44;
  const count = 3 + terminal; // the group re-centres as the console button leaves
  const left = 960 - ((count - 1) * step) / 2;
  const xs = [0, 1, 2, 3].map((i) => left + i * step);
  return (
    <>
      <Glyph x={xs[0]}>
        <svg viewBox="0 0 24 24" width={24} height={24}>
          {[
            [3, 3],
            [12.5, 3],
            [3, 12.5],
            [12.5, 12.5],
          ].map(([x, y]) => (
            <rect key={`${x}-${y}`} x={x} y={y} width={8.5} height={8.5} rx={1.2} fill="#5aa9f0" />
          ))}
        </svg>
      </Glyph>
      <Glyph x={xs[1]}>
        <svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke="#e6e6e6" strokeWidth={1.8} strokeLinecap="round">
          <circle cx={10.5} cy={10.5} r={6} />
          <line x1={15} y1={15} x2={20} y2={20} />
        </svg>
      </Glyph>
      <Glyph x={xs[2]}>
        <svg viewBox="0 0 24 24" width={24} height={24}>
          <path d="M2.5 6.5a2 2 0 0 1 2-2h5l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-15a2 2 0 0 1-2-2z" fill="#f2b83b" />
          <path d="M2.5 9h19v8.5a2 2 0 0 1-2 2h-15a2 2 0 0 1-2-2z" fill="#f8cc5a" />
        </svg>
      </Glyph>
      {terminal > 0.001 && (
        <>
          <Glyph x={xs[3]} opacity={terminal} scale={0.6 + 0.4 * terminal}>
            <svg viewBox="0 0 24 24" width={24} height={24}>
              <rect x={2} y={3.5} width={20} height={17} rx={3} fill="#2b2b2b" stroke="#5a5a5a" strokeWidth={0.8} />
              <path d="M6.5 9.5l3 2.5-3 2.5" fill="none" stroke="#e6e6e6" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
              <line x1={11.5} y1={15.5} x2={16.5} y2={15.5} stroke="#e6e6e6" strokeWidth={1.6} strokeLinecap="round" />
            </svg>
          </Glyph>
          {/* running-app pill under the active button */}
          <div
            style={{
              position: "absolute",
              left: xs[3] - 8 * terminal,
              top: TASKBAR.y + TASKBAR.h - 5,
              width: 16 * terminal,
              height: 3,
              borderRadius: 2,
              background: "#60b4ff",
              opacity: terminal,
            }}
          />
        </>
      )}
    </>
  );
};

export const Taskbar: React.FC<{ terminal: number; clock: [string, string] }> = ({ terminal, clock }) => (
  <>
    <div
      style={{
        position: "absolute",
        left: TASKBAR.x,
        top: TASKBAR.y,
        width: TASKBAR.w,
        height: TASKBAR.h,
        background: "rgba(28,28,30,0.94)",
        borderTop: "1px solid rgba(255,255,255,0.07)",
      }}
    />
    <CenterApps terminal={terminal} />
    {/* chevron for hidden icons */}
    <Glyph x={CHEVRON_X} size={16}>
      <svg viewBox="0 0 16 16" width={16} height={16} fill="none" stroke="#e6e6e6" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 10l4-4 4 4" />
      </svg>
    </Glyph>
    {/* network and volume */}
    <Glyph x={SYSTEM_ICONS_X[0]} size={16}>
      <svg viewBox="0 0 16 16" width={16} height={16} fill="none" stroke="#e6e6e6" strokeWidth={1.2} strokeLinecap="round">
        <path d="M1.5 6.2a9.5 9.5 0 0 1 13 0" />
        <path d="M3.7 8.6a6.3 6.3 0 0 1 8.6 0" />
        <path d="M5.9 11a3.1 3.1 0 0 1 4.2 0" />
        <circle cx={8} cy={13.2} r={0.9} fill="#e6e6e6" stroke="none" />
      </svg>
    </Glyph>
    <Glyph x={SYSTEM_ICONS_X[1]} size={16}>
      <svg viewBox="0 0 16 16" width={16} height={16} fill="none" stroke="#e6e6e6" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 6h2.5L8 3v10L4.5 10H2z" />
        <path d="M10.5 5.5a3.5 3.5 0 0 1 0 5" />
        <path d="M12.3 3.8a6 6 0 0 1 0 8.4" />
      </svg>
    </Glyph>
    <div
      style={{
        position: "absolute",
        left: CLOCK_X - 50,
        top: TASKBAR.y + 7,
        width: 100,
        textAlign: "right",
        paddingRight: 22,
        boxSizing: "border-box",
        fontFamily: UI_FONT,
        fontSize: 12,
        lineHeight: "17px",
        color: "#f0f0f0",
      }}
    >
      <div>{clock[0]}</div>
      <div>{clock[1]}</div>
    </div>
    <Glyph x={BELL_X} size={16}>
      <svg viewBox="0 0 16 16" width={16} height={16} fill="none" stroke="#e6e6e6" strokeWidth={1.2} strokeLinejoin="round">
        <path d="M4 11V7a4 4 0 0 1 8 0v4l1.2 1.5H2.8z" />
        <path d="M6.6 14a1.6 1.6 0 0 0 2.8 0" strokeLinecap="round" />
      </svg>
    </Glyph>
  </>
);
