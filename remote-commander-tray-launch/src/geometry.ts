// World geometry: a 1920 × 1080 Windows 11 desktop at 100 % scale. Everything
// the cursor touches is a named rect here, so paths are computed, not guessed.

export type Rect = { x: number; y: number; w: number; h: number };
export const center = (r: Rect) => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 });

export const TASKBAR: Rect = { x: 0, y: 1032, w: 1920, h: 48 };

// Notification area, right to left: bell, clock, network/volume, our icon, chevron.
export const TRAY_ICON = { x: 1648, y: 1056, size: 16 }; // centre of the status icon
export const CHEVRON_X = 1617;
export const SYSTEM_ICONS_X = [1694, 1718];
export const CLOCK_X = 1834; // centre of the two clock lines
export const BELL_X = 1898;

// The console window the film opens on.
export const WINDOW: Rect = { x: 400, y: 248, w: 1120, h: 620 };
export const TITLEBAR_H = 46;
export const CAPTION_W = 58;
export const CLOSE_BUTTON: Rect = { x: WINDOW.x + WINDOW.w - CAPTION_W, y: WINDOW.y, w: CAPTION_W, h: TITLEBAR_H };

// The real tray context menu: WinForms ContextMenuStrip measured at 100 % scale
// (211 × 264: 2 px top padding, 22 px items, 6 px separators).
export const MENU: Rect = { x: TRAY_ICON.x - 4, y: 766, w: 211, h: 264 }; // bottom just above the taskbar
export const MENU_ROWS: { text: string; kind: "item" | "disabled" | "sep"; checked?: boolean }[] = [
  { text: "✓ Online - STUDIO-PC", kind: "disabled" },
  { text: "Last connected: 09:02", kind: "disabled" },
  { text: "", kind: "sep" },
  { text: "Restart connection", kind: "item" },
  { text: "Re-authenticate...", kind: "item" },
  { text: "Stop agent", kind: "item" },
  { text: "", kind: "sep" },
  { text: "Open Remote MCP", kind: "item" },
  { text: "Open logs", kind: "item" },
  { text: "Copy diagnostics", kind: "item" },
  { text: "", kind: "sep" },
  { text: "Launch at sign-in", kind: "item", checked: true },
  { text: "About", kind: "item" },
  { text: "Exit", kind: "item" },
];
export const menuRowRect = (index: number): Rect => {
  let y = MENU.y + 2;
  for (let i = 0; i < index; i++) y += MENU_ROWS[i].kind === "sep" ? 6 : 22;
  return { x: MENU.x + 2, y, w: MENU.w - 4, h: MENU_ROWS[index].kind === "sep" ? 6 : 22 };
};

// Windows 11 notification toast, bottom right above the taskbar.
export const TOAST: Rect = { x: 1544, y: 870, w: 364, h: 150 };

// Camera: the world point shown at the frame centre, and the zoom.
export type Cam = { x: number; y: number; s: number };
export const WIDE: Cam = { x: 960, y: 540, s: 1 };
export const CORNER: Cam = { x: 1480, y: 834, s: 2.2 }; // after the window lands
export const TRAY: Cam = { x: 1652, y: 930, s: 3.6 }; // the tray, close up
export const MENU_CAM: Cam = { x: 1550, y: 870, s: 2.6 }; // room for the menu

export const toScreen = (p: { x: number; y: number }, cam: Cam) => ({
  x: (p.x - cam.x) * cam.s + 960,
  y: (p.y - cam.y) * cam.s + 540,
});
