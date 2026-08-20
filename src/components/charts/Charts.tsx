"use client";
import React from "react";

/** Hand-drawn SVG charts — no charting library, so the bundle stays small
 *  and every colour comes from the brand token set. */

export function AreaChart({ points, labels = [], height = 170 }: {
  points: number[]; labels?: string[]; height?: number;
}) {
  const w = 520, pad = 26;
  const max = Math.max(...points) * 1.15, min = Math.min(...points) * 0.85;
  const X = (i: number) => pad + i * ((w - pad * 2) / (points.length - 1));
  const Y = (v: number) => height - 24 - ((v - min) / (max - min || 1)) * (height - 52);
  const line = points.map((v, i) => `${i ? "L" : "M"}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join(" ");
  const area = `${line} L${X(points.length - 1)} ${height - 24} L${pad} ${height - 24} Z`;
  const gid = React.useId();
  return (
    <svg viewBox={`0 0 ${w} ${height}`} style={{ width: "100%", height: "auto", overflow: "visible" }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--brand)" stopOpacity=".26" />
          <stop offset="1" stopColor="var(--brand)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.5, 1].map(f => (
        <line key={f} x1={pad} x2={w - pad} y1={24 + f * (height - 52)} y2={24 + f * (height - 52)}
          stroke="var(--line)" strokeDasharray="3 4" />
      ))}
      <path d={area} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke="var(--brand)" strokeWidth={2.4} strokeLinejoin="round" strokeLinecap="round" />
      {points.map((v, i) => (
        <circle key={i} cx={X(i)} cy={Y(v)} r={3.2} fill="var(--panel)" stroke="var(--brand)" strokeWidth={2}>
          <title>{labels[i]}: {v}</title>
        </circle>
      ))}
      {labels.map((l, i) => (
        <text key={i} x={X(i)} y={height - 6} textAnchor="middle" fontSize={10}
          fill="var(--faint)" fontFamily="var(--font-mono), monospace">{l}</text>
      ))}
    </svg>
  );
}

export function BarChart({ data, height = 180 }: {
  data: { l: string; v: number; c?: string }[]; height?: number;
}) {
  const w = 520;
  const max = Math.max(...data.map(d => d.v)) * 1.12;
  const bw = (w - 40) / data.length;
  return (
    <svg viewBox={`0 0 ${w} ${height}`} style={{ width: "100%", height: "auto" }}>
      {data.map((d, i) => {
        const bh = Math.max(3, (d.v / max) * (height - 46));
        const x = 20 + i * bw + bw * 0.16, y = height - 26 - bh, ww = bw * 0.68;
        return (
          <g key={i}>
            <rect x={x} y={y} width={ww} height={bh} rx={5} fill={d.c || "var(--brand)"}>
              <title>{d.l}: {d.v}</title>
            </rect>
            <text x={x + ww / 2} y={height - 9} textAnchor="middle" fontSize={10}
              fill="var(--faint)" fontFamily="var(--font-mono), monospace">{d.l}</text>
          </g>
        );
      })}
    </svg>
  );
}

export function Donut({ data, size = 168, thick = 20, center }: {
  data: { l: string; v: number; c: string }[]; size?: number; thick?: number; center?: [string, string];
}) {
  const total = data.reduce((s, d) => s + d.v, 0) || 1;
  const r = (size - thick) / 2, C = 2 * Math.PI * r;
  let off = 0;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} style={{ width: size, height: size, flex: "none" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--slate-bg)" strokeWidth={thick} />
      {data.map((d, i) => {
        const len = (d.v / total) * C;
        const el = (
          <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={d.c} strokeWidth={thick}
            strokeDasharray={`${Math.max(0, len - 2)} ${C - len + 2}`} strokeDashoffset={-off}
            transform={`rotate(-90 ${size / 2} ${size / 2})`} strokeLinecap="round">
            <title>{d.l}: {d.v}</title>
          </circle>
        );
        off += len;
        return el;
      })}
      {center && (
        <>
          <text x="50%" y="47%" textAnchor="middle" fontSize={26} fontWeight={600}
            fontFamily="var(--font-display), sans-serif" fill="var(--text)">{center[0]}</text>
          <text x="50%" y="61%" textAnchor="middle" fontSize={10} fill="var(--muted)" letterSpacing="1.4">{center[1]}</text>
        </>
      )}
    </svg>
  );
}
