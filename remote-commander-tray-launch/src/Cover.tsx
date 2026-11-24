import React from "react";
import { AbsoluteFill } from "remotion";
import { DISPLAY, Lang } from "./copy";
import { World } from "./Film";
import { AppIcon } from "./Widgets";
import { cue } from "./clock";

// Thumbnail / cover (1920 × 1080): the promise on the left, the real tray menu
// on the right. Designed, not a frame of the film.
const S = 2.9;
const CX = 1920 - 960 / S;
const CY = 1080 - 540 / S;

const HEAD = {
  en: { big: ["No console", "window."], sub: "Always ready in your tray.", size: 124 },
  zh: { big: ["告别", "黑窗口。"], sub: "托盘里随时待命。", size: 150 },
} as const;

export const Cover: React.FC<{ lang: Lang }> = ({ lang }) => (
  <AbsoluteFill style={{ background: "#080b12", overflow: "hidden" }}>
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 1920,
        height: 1080,
        transformOrigin: "0 0",
        transform: `translate(${960 - CX * S}px, ${540 - CY * S}px) scale(${S})`,
      }}
    >
      <World t={cue.menu + 3.4} />
    </div>
    <AbsoluteFill style={{ background: "linear-gradient(90deg, #080b12 0%, #080b12 48%, rgba(8,11,18,0) 60%)" }} />
    <div style={{ position: "absolute", left: 120, top: 250, fontFamily: DISPLAY[lang], color: "#f4f6fa" }}>
      <div style={{ fontSize: HEAD[lang].size, fontWeight: 700, letterSpacing: lang === "en" ? -2.5 : 0, lineHeight: lang === "en" ? 1.02 : 1.12 }}>
        {HEAD[lang].big[0]}
        <br />
        {HEAD[lang].big[1]}
      </div>
      <div style={{ fontSize: 56, fontWeight: 500, color: "#9aa4b2", marginTop: 34 }}>{HEAD[lang].sub}</div>
    </div>
    <div style={{ position: "absolute", left: 120, bottom: 110, display: "flex", alignItems: "center", gap: 26 }}>
      <AppIcon size={92} />
      <div style={{ fontFamily: DISPLAY.en, fontSize: 50, fontWeight: 600, color: "#f4f6fa", letterSpacing: -0.6 }}>Remote Commander Tray</div>
    </div>
  </AbsoluteFill>
);
