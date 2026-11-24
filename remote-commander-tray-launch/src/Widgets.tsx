import React from "react";
import { MENU, MENU_ROWS, TOAST, menuRowRect } from "./geometry";
import { UI_FONT } from "./Desktop";
import { StatusIcon } from "./StatusIcon";

/**
 * The tray's real ContextMenuStrip (WinForms ToolStripProfessionalRenderer), at
 * 100 % scale: light, square-cornered, with the image-margin gutter. Colours are
 * sampled from a capture of the same items on Windows 11.
 */
export const TrayMenu: React.FC<{ hover: number; content: number }> = ({ hover, content }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: MENU.w, height: MENU.h, fontFamily: UI_FONT, fontSize: 12, opacity: content }}>
    <div style={{ position: "absolute", left: 1, top: 1, width: 25, bottom: 1, background: "linear-gradient(90deg, #fbfbfb, #f1f1f1)" }} />
    {MENU_ROWS.map((row, i) => {
      const r = menuRowRect(i);
      const top = r.y - MENU.y;
      if (row.kind === "sep") {
        return <div key={i} style={{ position: "absolute", left: 30, right: 2, top: top + 2, height: 1, background: "#d7d7d7", boxShadow: "0 1px 0 #fff" }} />;
      }
      const selected = i === hover;
      return (
        <div key={i} style={{ position: "absolute", left: 2, top, width: MENU.w - 4, height: 22 }}>
          {selected && (
            <div style={{ position: "absolute", inset: 0, background: "#b5d7f3", border: "1px solid #7ebae9", boxSizing: "border-box" }} />
          )}
          {row.checked && (
            <div
              style={{
                position: "absolute",
                left: 2,
                top: 1,
                width: 20,
                height: 20,
                background: "#b5d7f3",
                border: "1px solid #7ebae9",
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg viewBox="0 0 10 10" width={10} height={10} fill="none" stroke="#000" strokeWidth={1.4}>
                <path d="M1.5 5.2l2.2 2.3 4.8-5" />
              </svg>
            </div>
          )}
          <div
            style={{
              position: "absolute",
              left: 33,
              top: 0,
              height: 22,
              lineHeight: "22px",
              color: row.kind === "disabled" ? "#6d6d6d" : "#000",
              whiteSpace: "nowrap",
            }}
          >
            {row.text}
          </div>
        </div>
      );
    })}
  </div>
);

/** A Windows 11 toast, which is how a NotifyIcon balloon appears today. */
export const Toast: React.FC = () => (
  <div
    style={{
      position: "absolute",
      left: 0,
      top: 0,
      width: TOAST.w,
      height: TOAST.h,
      background: "#2c2c2c",
      borderRadius: 8,
      boxShadow: "0 0 0 1px rgba(255,255,255,0.09), 0 16px 36px rgba(0,0,0,0.5)",
      fontFamily: UI_FONT,
      color: "#ffffff",
      boxSizing: "border-box",
      padding: "12px 16px",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#c8c8c8", height: 18 }}>
      <AppIcon size={16} />
      <span>Remote Commander Tray</span>
      <span style={{ marginLeft: "auto", letterSpacing: 1 }}>{"···"}</span>
      <span style={{ marginLeft: 14 }}>{"✕"}</span>
    </div>
    <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
      <svg viewBox="0 0 20 20" width={20} height={20} style={{ flex: "none", marginTop: 1 }}>
        <path d="M10 1.8l8.6 15.4H1.4z" fill="#fce100" stroke="#fce100" strokeLinejoin="round" strokeWidth={1.2} />
        <rect x={9.1} y={7} width={1.8} height={5.5} rx={0.9} fill="#1a1a1a" />
        <circle cx={10} cy={14.6} r={1} fill="#1a1a1a" />
      </svg>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, lineHeight: "20px" }}>Remote Commander - sign-in required</div>
        <div style={{ fontSize: 14, lineHeight: "20px", color: "#d0d0d0", marginTop: 2 }}>
          Desktop Commander needs you to sign in. Use Open sign-in page, or Re-authenticate if the session expired.
        </div>
      </div>
    </div>
  </div>
);

/** The app icon from tools/generate-icon.py: blue tile, white chevron and bar. */
export const AppIcon: React.FC<{ size: number }> = ({ size }) => (
  <StatusIcon size={size} color="#2563EB" glyph={{ online: 1 }} toChevron={1} />
);

/** Windows arrow cursor, tip at (0, 0). */
export const Cursor: React.FC<{ press: number }> = ({ press }) => (
  <svg
    viewBox="0 0 13 20"
    width={15.6}
    height={24}
    style={{ position: "absolute", left: 0, top: 0, overflow: "visible", transform: `scale(${1 - 0.1 * press})`, transformOrigin: "0 0" }}
  >
    <path
      d="M0.6 0.6 L0.6 16.4 L4.4 12.8 L7 18.9 L9.6 17.8 L7.1 11.9 L12.2 11.9 Z"
      fill="#fff"
      stroke="#000"
      strokeWidth={1}
      strokeLinejoin="round"
    />
  </svg>
);
