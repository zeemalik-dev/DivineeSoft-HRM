"use client";
import { Card, PageHead } from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import { useStore } from "@/lib/store";
import { fullName, fmtDate } from "@/lib/format";
import { TODAY } from "@/lib/seed";

export default function DocumentsPage() {
  const { data, toast } = useStore();
  const all = data.employees.flatMap(e => e.docs.map(d => ({ ...d, e })));
  const expiring = all.filter(d => d.exp && (+d.exp - +TODAY) / 864e5 < 400);

  return (
    <>
      <PageHead eyebrow="HR management" title="Documents"
        sub={`${all.length} files across ${data.employees.length} people. ${expiring.length} expire within a year.`}
        actions={<button className="btn pri" onClick={() => toast("Secure upload — 10 MB limit, virus scanned")}>Upload document</button>} />
      <Card>
        <div className="toolbar">
          <span className="mini">Uploads are virus-scanned, limited to 10 MB, and every download is written to the audit log.</span>
        </div>
        <div className="tablewrap">
          <table>
            <thead><tr><th>Person</th><th>Document</th><th>Type</th><th>Added</th><th>Expires</th><th /></tr></thead>
            <tbody>
              {all.map((d, i) => (
                <tr key={i}>
                  <td><div className="who"><Avatar e={d.e} size="sm" /><div><b>{fullName(d.e)}</b></div></div></td>
                  <td><b>{d.n}</b></td><td>{d.t}</td><td className="num">{fmtDate(d.at)}</td>
                  <td className="num">
                    {d.exp ? (<>{fmtDate(d.exp)}{(+d.exp - +TODAY) / 864e5 < 400 &&
                      <span className="pill warn" style={{ marginLeft: 6 }}><i />renew soon</span>}</>) : "—"}
                  </td>
                  <td className="right"><button className="btn sm">Download</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
