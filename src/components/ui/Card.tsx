import React from "react";

export function Card({ children, className = "", style, onClick }: {
  children: React.ReactNode; className?: string; style?: React.CSSProperties; onClick?: () => void;
}) {
  return <div className={`card ${className}`} style={style} onClick={onClick}>{children}</div>;
}

export function CardHead({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="card-h">
      <div><h3>{title}</h3>{sub && <div className="sub">{sub}</div>}</div>
      {action}
    </div>
  );
}

export function CardBody({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div className="card-b" style={style}>{children}</div>;
}

export function Stat({ label, value, foot }: { label: string; value: React.ReactNode; foot?: React.ReactNode }) {
  return (
    <div className="stat">
      <div className="lbl">{label}</div>
      <div className="val num">{value}</div>
      {foot && <div className="foot">{foot}</div>}
    </div>
  );
}

export function PageHead({ eyebrow, title, sub, actions }: {
  eyebrow?: string; title: string; sub?: React.ReactNode; actions?: React.ReactNode;
}) {
  return (
    <div className="phead">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {sub && <p>{sub}</p>}
      </div>
      {actions && <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>{actions}</div>}
    </div>
  );
}

export function Empty({ title, body, icon }: { title: string; body?: string; icon?: React.ReactNode }) {
  return <div className="empty">{icon}<h4>{title}</h4>{body && <p>{body}</p>}</div>;
}

export function Steps({ steps, current }: { steps: readonly string[]; current: string }) {
  const i = steps.indexOf(current);
  return (
    <div className="steps">
      {steps.map((s, k) => (
        <div key={s} className={`step ${k < i ? "done" : ""} ${k === i ? "now" : ""}`}>{s}</div>
      ))}
    </div>
  );
}

export function Bar({ pct, color }: { pct: number; color?: string }) {
  return <div className="bar"><i style={{ width: `${Math.min(100, Math.max(0, pct))}%`, background: color }} /></div>;
}
