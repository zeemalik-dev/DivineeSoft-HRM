import { initials } from "@/lib/format";
import type { Employee } from "@/lib/types";

export default function Avatar({ e, size = "" }: { e?: Employee; size?: "sm" | "lg" | "" }) {
  if (!e) return <div className={`avatar ${size}`} style={{ background: "var(--slate-bg)" }}>?</div>;
  return <div className={`avatar ${size}`} style={{ background: e.color }}>{initials(e)}</div>;
}
