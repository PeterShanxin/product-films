import React from "react";
import { AbsoluteFill } from "remotion";
import { DISPLAY_FONT } from "./Desktop";
import { World } from "./Film";
import { AppIcon } from "./Widgets";

// Thumbnail / cover (1920 × 1080): the promise on the left, the real tray menu
// on the right. Designed, not a frame of the film.
const S = 2.9;
const CX = 1920 - 960 / S;
const CY = 1080 - 540 / S;

export const Cover: React.FC = () => (
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
      <World t={27.4} />
    </div>
    <AbsoluteFill style={{ background: "linear-gradient(90deg, #080b12 0%, #080b12 48%, rgba(8,11,18,0) 60%)" }} />
    <div style={{ position: "absolute", left: 120, top: 250, fontFamily: DISPLAY_FONT, color: "#f4f6fa" }}>
      <div style={{ fontSize: 124, fontWeight: 700, letterSpacing: -2.5, lineHeight: 1.02 }}>
        No console
        <br />
        window.
      </div>
      <div style={{ fontSize: 56, fontWeight: 500, color: "#9aa4b2", marginTop: 34 }}>Always ready in your tray.</div>
    </div>
    <div style={{ position: "absolute", left: 120, bottom: 110, display: "flex", alignItems: "center", gap: 26 }}>
      <AppIcon size={92} />
      <div style={{ fontFamily: DISPLAY_FONT, fontSize: 50, fontWeight: 600, color: "#f4f6fa", letterSpacing: -0.6 }}>Remote Commander Tray</div>
    </div>
  </AbsoluteFill>
);
