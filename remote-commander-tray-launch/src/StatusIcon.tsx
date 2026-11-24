import React from "react";

// The tray status icons, ported from src/RemoteCommanderTray/UI/TrayIcons.cs:
// same colours, same disc, same glyph geometry as fractions of the icon size.
export const STATE_COLOR = {
  online: "#16A34A",
  connecting: "#D97706",
  auth: "#7C3AED",
  error: "#DC2626",
  stopped: "#6B7280",
} as const;
export type State = keyof typeof STATE_COLOR;

const P = (f: number) => f * 100; // drawn in a 100-unit box
const STROKE = 12; // size * 0.12

type Props = {
  size: number;
  color: string;
  /** Opacity of each glyph, so a state change can cross-fade. */
  glyph: Partial<Record<State, number>>;
  /** 0 → 1 draws the check on. */
  checkDraw?: number;
  /** Optional morph of the check into the app logo's chevron (0 → 1). */
  toChevron?: number;
  style?: React.CSSProperties;
};

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

export const StatusIcon: React.FC<Props> = ({ size, color, glyph, checkDraw = 1, toChevron = 0, style }) => {
  const line = { stroke: "#fff", strokeWidth: STROKE, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" } as const;
  // Check (TrayIcons.cs) → chevron of the app icon (tools/generate-icon.py).
  const check = [
    [0.27, 0.52],
    [0.43, 0.69],
    [0.75, 0.33],
  ];
  const chevron = [
    [0.3, 0.3],
    [0.5, 0.45],
    [0.3, 0.6],
  ];
  const pts = check.map(([x, y], i) => [lerp(x, chevron[i][0], toChevron), lerp(y, chevron[i][1], toChevron)]);
  const k = toChevron;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: "visible", ...style }}>
      {/* Disc: FillEllipse(0.5, 0.5, size - 1.5) → radius 0.453. App tile: 0.06 pad, 0.22 radius. */}
      <rect x={50 - lerp(45.3, 44, k)} y={50 - lerp(45.3, 44, k)} width={2 * lerp(45.3, 44, k)} height={2 * lerp(45.3, 44, k)} rx={lerp(45.3, 22, k)} fill={color} />
      {(glyph.online ?? 0) > 0 && (
        <g opacity={glyph.online}>
          <polyline
            points={pts.map(([x, y]) => `${P(x)},${P(y)}`).join(" ")}
            {...line}
            strokeWidth={lerp(STROKE, 8.5, k)}
            pathLength={1}
            strokeDasharray={checkDraw >= 1 ? undefined : `${checkDraw} 1`}
            opacity={checkDraw <= 0.01 ? 0 : 1}
          />
          {k > 0 && <line x1={P(0.55)} y1={P(0.7)} x2={P(lerp(0.55, 0.74, k))} y2={P(0.7)} {...line} strokeWidth={8.5} opacity={k} />}
        </g>
      )}
      {(glyph.connecting ?? 0) > 0 && (
        <g opacity={glyph.connecting} fill="#fff">
          {[0.27, 0.5, 0.73].map((x) => (
            <circle key={x} cx={P(x)} cy={50} r={P(0.085)} />
          ))}
        </g>
      )}
      {(glyph.auth ?? 0) > 0 && (
        <g opacity={glyph.auth}>
          <ellipse cx={P(0.22 + 0.15)} cy={P(0.48 + 0.15)} rx={P(0.15)} ry={P(0.15)} {...line} />
          <line x1={P(0.5)} y1={P(0.52)} x2={P(0.76)} y2={P(0.26)} {...line} />
          <line x1={P(0.62)} y1={P(0.4)} x2={P(0.7)} y2={P(0.48)} {...line} />
        </g>
      )}
      {(glyph.error ?? 0) > 0 && (
        <g opacity={glyph.error}>
          <line x1={P(0.32)} y1={P(0.32)} x2={P(0.68)} y2={P(0.68)} {...line} />
          <line x1={P(0.68)} y1={P(0.32)} x2={P(0.32)} y2={P(0.68)} {...line} />
        </g>
      )}
      {(glyph.stopped ?? 0) > 0 && (
        <g opacity={glyph.stopped}>
          <line x1={P(0.38)} y1={P(0.3)} x2={P(0.38)} y2={P(0.7)} {...line} />
          <line x1={P(0.62)} y1={P(0.3)} x2={P(0.62)} y2={P(0.7)} {...line} />
        </g>
      )}
    </svg>
  );
};
