"use client";
import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import AssistantDrawer from "@/components/ai/AssistantDrawer";
import { useStore } from "@/lib/store";
import Icon from "@/components/ui/Icon";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [railOpen, setRailOpen] = useState(false);
  const { toasts, modal, closeModal } = useStore();

  return (
    <div className="app">
      <Sidebar open={railOpen} onNavigate={() => setRailOpen(false)} />
      <div className="main">
        <Topbar onMenu={() => setRailOpen(v => !v)} />
        <main className="content">{children}</main>
      </div>

      {modal && (
        <div className="scrim" onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          {modal}
        </div>
      )}

      <AssistantDrawer />

      <div className="toasts">
        {toasts.map(t => (
          <div key={t.id} className="toast">
            <Icon name="check" size={16} style={{ color: "var(--jade)" }} />
            {t.text}
          </div>
        ))}
      </div>
    </div>
  );
}
