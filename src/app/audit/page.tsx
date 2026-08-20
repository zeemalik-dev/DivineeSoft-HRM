"use client";
import { Card, PageHead } from "@/components/ui/Card";
import { useStore } from "@/lib/store";
import { fmtDate } from "@/lib/format";

export default function AuditPage() {
  const { data, toast } = useStore();
  return (
    <>
      <PageHead eyebrow="Insight" title="Audit log"
        sub="Append-only. Records are kept for seven years and cannot be edited from the interface."
        actions={<button className="btn" onClick={() => toast("Exporting audit log")}>Export CSV</button>} />
      <Card>
        <div className="tablewrap">
          <table>
            <thead><tr><th>When</th><th>Who</th><th>Action</th><th>Record</th>
              <th className="hide-sm">Detail</th><th className="hide-sm">IP</th></tr></thead>
            <tbody>
              {data.audit.slice().sort((a, b) => +b.at - +a.at).map(a => (
                <tr key={a.id}>
                  <td className="num">{fmtDate(a.at)}</td>
                  <td><b>{a.who}</b></td>
                  <td><span className="pill info"><i />{a.act}</span></td>
                  <td>{a.target}</td>
                  <td className="hide-sm mini">{a.detail}</td>
                  <td className="hide-sm num mini">{a.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
