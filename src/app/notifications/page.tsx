"use client";
import { useRouter } from "next/navigation";
import { Card, CardBody, PageHead } from "@/components/ui/Card";
import { useStore } from "@/lib/store";
import { fmtDateTime } from "@/lib/format";

export default function NotificationsPage() {
  const { data, actions } = useStore();
  const router = useRouter();
  const unread = data.notifications.filter(n => !n.read).length;

  return (
    <>
      <PageHead eyebrow="Communication" title="Notifications"
        sub={`${unread} unread. Selecting one takes you to the record it came from.`}
        actions={<button className="btn" onClick={() => actions.markAllRead()}>Mark all read</button>} />
      <Card><CardBody style={{ padding: 8 }}>
        {data.notifications.map(n => (
          <div key={n.id} onClick={() => { actions.readNotification(n.id); router.push(n.go); }}
            style={{ display: "flex", gap: 12, alignItems: "center", padding: 13, borderRadius: 11,
              cursor: "pointer", background: n.read ? "transparent" : "var(--tint)" }}>
            <div className="avatar sm" style={{ background: n.read ? "var(--slate-bg)" : "var(--brand)", color: n.read ? "var(--muted)" : "#fff" }}>
              {n.read ? "✓" : "!"}
            </div>
            <div style={{ flex: 1 }}>
              <b style={{ fontSize: 13.5, fontWeight: n.read ? 500 : 600 }}>{n.text}</b>
              <div className="mini">{fmtDateTime(n.at)}</div>
            </div>
            <span className="mini">Open →</span>
          </div>
        ))}
      </CardBody></Card>
    </>
  );
}
