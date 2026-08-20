"use client";
import Link from "next/link";
import { Card, PageHead, Stat } from "@/components/ui/Card";
import Pill from "@/components/ui/Pill";
import { useStore } from "@/lib/store";
import { ComposeModal } from "@/components/modals/Modals";
import { fmtDate } from "@/lib/format";
import { CO } from "@/lib/seed";

export default function EmailPage() {
  const { data, openModal } = useStore();
  const inAugust = data.emails.filter(e => e.at >= new Date(2026, 7, 1)).length;
  return (
    <>
      <PageHead eyebrow="Communication" title="Email history"
        sub={`Sent through ${data.settings.smtp.host} as ${CO.email}. One bounce needs attention.`}
        actions={<>
          <Link className="btn" href="/settings">SMTP settings</Link>
          <button className="btn pri" onClick={() => openModal(<ComposeModal />)}>Compose</button>
        </>} />
      <div className="stats" style={{ marginBottom: 16 }}>
        <Stat label="Sent this month" value={inAugust} foot="Across 6 templates" />
        <Stat label="Delivered" value={data.emails.filter(e => e.status === "Delivered").length} foot="Confirmed by the mail server" />
        <Stat label="Bounced" value={data.emails.filter(e => e.status === "Bounced").length} foot="Retry after fixing the mailbox" />
        <Stat label="Queued" value={data.emails.filter(e => e.status === "Queued").length} foot="Sending within a minute" />
      </div>
      <Card>
        <div className="tablewrap">
          <table>
            <thead><tr><th>Recipient</th><th>Subject</th><th className="hide-sm">Template</th><th>Sent</th><th>Status</th></tr></thead>
            <tbody>
              {data.emails.slice().sort((a, b) => +b.at - +a.at).map(m => (
                <tr key={m.id}>
                  <td className="num" style={{ fontSize: 12 }}>{m.to}</td>
                  <td><b>{m.subject}</b>{m.err && <div className="mini" style={{ color: "var(--rose)" }}>{m.err}</div>}</td>
                  <td className="hide-sm"><span className="pill mute"><i />{m.tpl}</span></td>
                  <td className="num">{fmtDate(m.at)}</td>
                  <td><Pill value={m.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
