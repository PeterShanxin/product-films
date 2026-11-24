import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { C, FONT } from "./motion";

// 3:4 cover: Astra's shore photo, the left half as it first looks, the right half with
// every pixel its shader never moves greyed out and the moving water and paper birds outlined in gold.
const IMG = { top: 560, h: 880 };
const head = (shadow: string): React.CSSProperties => ({ color: C.text, textShadow: `8px 8px 0 ${shadow}` });

export const Cover: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg, fontFamily: FONT, overflow: "hidden" }}>
    <div style={{ position: "absolute", left: 0, top: IMG.top, width: 1080, height: IMG.h, overflow: "hidden" }}>
      <Img src={staticFile("cover/shore.png")} style={{ position: "absolute", left: 0, top: 0, width: 1080, height: IMG.h, objectFit: "cover" }} />
      <div style={{ position: "absolute", left: 540, top: 0, width: 540, height: IMG.h, overflow: "hidden" }}>
        <Img src={staticFile("cover/shore-drained.png")} style={{ position: "absolute", left: -540, top: 0, width: 1080, height: IMG.h, objectFit: "cover" }} />
        <Img src={staticFile("cover/shore-outline.png")} style={{ position: "absolute", left: -540, top: 0, width: 1080, height: IMG.h, objectFit: "cover" }} />
      </div>
      <div style={{ position: "absolute", left: 537, top: 0, width: 6, height: IMG.h, background: C.text, boxShadow: "0 0 24px #000" }} />
    </div>
    <div style={{ position: "absolute", left: 64, top: 70, fontSize: 150, fontWeight: 900, lineHeight: 1.18, letterSpacing: -2 }}>
      <div style={head("#7a5418")}>第一眼<span style={{ color: C.gold }}>哇塞</span></div>
      <div style={head("#2b2f38")}>第二眼<span style={{ color: C.dim }}>偷懒</span></div>
    </div>
    <div
      style={{
        position: "absolute", right: 48, top: IMG.top - 46, rotate: "6deg", background: "#ffd84a", color: "#11131a",
        fontSize: 54, fontWeight: 900, padding: "10px 28px", borderRadius: 14, boxShadow: "0 14px 34px #000c",
      }}
    >
      GPT-6.2 Astra 实测
    </div>
  </AbsoluteFill>
);
