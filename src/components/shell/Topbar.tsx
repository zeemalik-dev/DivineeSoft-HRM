"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Icon from "@/components/ui/Icon";
import { useStore } from "@/lib/store";
import { ROLES } from "@/lib/rbac";
import type { RoleName } from "@/lib/types";

export default function Topbar({ onMenu }: { onMenu: () => void }) {
  const { me, setRole, theme, toggleTheme, data, setAiOpen } = useStore();
  const router = useRouter();
  const [q, setQ] = useState("");
  const unread = data.notifications.some(n => !n.read);

  return (
    <header className="top">
      <button className="iconbtn burger" onClick={onMenu} aria-label="Open menu"><Icon name="menu" /></button>

      <div className="search">
        <Icon name="search" size={15} />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search people, projects, payslips…"
          onKeyDown={e => {
            if (e.key === "Enter" && q.trim()) router.push(`/employees?q=${encodeURIComponent(q.trim())}`);
          }} />
      </div>

      <div style={{ flex: 1 }} />

      <div className="rolepick hide-sm" title="Switch the role you are signed in as">
        <Icon name="star" size={15} style={{ color: "var(--muted)" }} />
        <select value={me.role} onChange={e => setRole(e.target.value as RoleName)}>
          {ROLES.map(r => <option key={r}>{r}</option>)}
        </select>
      </div>

      <button className="iconbtn" onClick={toggleTheme} title="Switch theme">
        <Icon name={theme === "light" ? "moon" : "sun"} />
      </button>

      <button className="iconbtn" title="Notifications" onClick={() => router.push("/notifications")}>
        <Icon name="bell" />
        {unread && <span className="dot" />}
      </button>

      <button className="ai-cta" onClick={() => setAiOpen(true)}>
        <Icon name="sparkle" size={15} style={{ strokeWidth: 2 } as React.CSSProperties} />
        <span className="hide-sm">Ask HR AI</span>
      </button>
    </header>
  );
}
