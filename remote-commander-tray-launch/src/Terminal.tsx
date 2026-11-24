import React from "react";
import { CAPTION_W, TITLEBAR_H, WINDOW } from "./geometry";
import { MONO_FONT, UI_FONT } from "./Desktop";
import { sfx } from "./clock";

// What `desktop-commander remote` prints (CLI 0.3.1 format, as recognised by
// AgentOutputParser and its tests). Machine name and times are fictional.
export const LOG: [string, string][] = [
  ["[18:41:56]", " \u{1F680} Starting MCP Device..."],
  ["[18:41:56]", " \u23F3 Connecting to Remote MCP https://mcp.desktopcommander.app"],
  ["[18:41:57]", "    - \u{1F50C} Connected to Remote MCP"],
  ["[18:41:57]", " \u2705 Device ready:"],
  ["[18:41:57]", "    - Device Name: STUDIO-PC"],
  ["[18:41:58]", " Device marked as online"],
  ["[18:42:13]", " Presence tracked"],
];
const LOG_TIMES = [0, 1, 2, 3, 4, 5, 7].map((i) => sfx.logStart + i * sfx.logStep);

const FONT = 21;
const LINE = 31;

/** Windows Terminal running PowerShell, drawn at its window size. */
export const Terminal: React.FC<{ t: number; closeHover: number }> = ({ t, closeHover }) => {
  const typed = Math.max(0, Math.min(sfx.typeText.length, Math.floor((t - sfx.typeStart) / sfx.typeStep) + 1));
  const command = sfx.typeText.slice(0, t < sfx.typeStart ? 0 : typed);
  const name = command.slice(0, "desktop-commander".length);
  const rest = command.slice("desktop-commander".length);
  const lines = LOG.filter((_, i) => t >= LOG_TIMES[i]);
  const caretOn = t < sfx.logStart || Math.floor(t * 2.2) % 2 === 0; // solid while typing
  const caretAfterCommand = t < sfx.logStart;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: WINDOW.w,
        height: WINDOW.h,
        background: "#0c0c0c",
        borderRadius: 8,
        overflow: "hidden",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.10)",
      }}
    >
      {/* title bar with one tab */}
      <div style={{ position: "absolute", left: 0, top: 0, width: WINDOW.w, height: TITLEBAR_H, background: "#1f1f1f" }} />
      <div
        style={{
          position: "absolute",
          left: 10,
          top: 8,
          width: 250,
          height: TITLEBAR_H - 8,
          background: "#0c0c0c",
          borderRadius: "8px 8px 0 0",
          display: "flex",
          alignItems: "center",
          gap: 10,
          paddingLeft: 14,
          boxSizing: "border-box",
          fontFamily: UI_FONT,
          fontSize: 15,
          color: "#f2f2f2",
        }}
      >
        <svg viewBox="0 0 16 16" width={16} height={16}>
          <rect x={0.5} y={1.5} width={15} height={13} rx={2.5} fill="#2b2b2b" stroke="#6b6b6b" strokeWidth={0.6} />
          <path d="M4 6l2.5 2L4 10" fill="none" stroke="#e6e6e6" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" />
          <line x1={8} y1={11} x2={12} y2={11} stroke="#e6e6e6" strokeWidth={1.3} strokeLinecap="round" />
        </svg>
        <span>Windows PowerShell</span>
        <span style={{ marginLeft: "auto", marginRight: 14, color: "#bdbdbd", fontSize: 13 }}>{"\u2715"}</span>
      </div>
      <div style={{ position: "absolute", left: 274, top: 12, fontFamily: UI_FONT, fontSize: 18, color: "#cfcfcf" }}>+</div>
      {/* caption buttons */}
      {[0, 1, 2].map((i) => {
        const isClose = i === 2;
        const x = WINDOW.w - CAPTION_W * (3 - i);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: 0,
              width: CAPTION_W,
              height: TITLEBAR_H,
              background: isClose ? `rgba(196,43,28,${closeHover})` : "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg viewBox="0 0 12 12" width={12} height={12} fill="none" stroke="#f2f2f2" strokeWidth={1}>
              {i === 0 && <line x1={1} y1={6} x2={11} y2={6} />}
              {i === 1 && <rect x={1.5} y={1.5} width={9} height={9} rx={1} />}
              {i === 2 && (
                <>
                  <line x1={1.5} y1={1.5} x2={10.5} y2={10.5} />
                  <line x1={10.5} y1={1.5} x2={1.5} y2={10.5} />
                </>
              )}
            </svg>
          </div>
        );
      })}
      {/* console */}
      <div
        style={{
          position: "absolute",
          left: 24,
          top: TITLEBAR_H + 18,
          right: 24,
          fontFamily: MONO_FONT,
          fontSize: FONT,
          lineHeight: `${LINE}px`,
          color: "#cccccc",
          whiteSpace: "pre",
        }}
      >
        <div>
          <span>PS C:\Users\dev&gt; </span>
          <span style={{ color: "#f9f1a5" }}>{name}</span>
          <span style={{ color: "#f2f2f2" }}>{rest}</span>
          {caretAfterCommand && <Caret on={caretOn} />}
        </div>
        {lines.map(([stamp, text], i) => (
          <div key={i}>
            <span style={{ color: "#767676" }}>{stamp}</span>
            <span style={{ color: i === 5 ? "#16c60c" : "#cccccc" }}>{text}</span>
          </div>
        ))}
        {!caretAfterCommand && <Caret on={caretOn} />}
      </div>
    </div>
  );
};

const Caret: React.FC<{ on: boolean }> = ({ on }) => (
  <span style={{ display: "inline-block", width: 11, height: 22, background: "#cccccc", verticalAlign: -4, opacity: on ? 1 : 0 }} />
);
