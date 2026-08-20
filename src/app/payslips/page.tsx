"use client";
import { useState } from "react";
import { Card, PageHead } from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import Pill from "@/components/ui/Pill";
import { useStore, useLookups } from "@/lib/store";
import { PayslipModal } from "@/components/modals/Modals";
import { MONTHS, CO } from "@/lib/seed";
import { fullName } from "@/lib/format";

export default function PayslipsPage() {
  const { data, money, openModal, toast } = useStore();
  const { employeeById } = useLookups();
  const [q, setQ] = useState("");
  const [month, setMonth] = useState("");

  const rows = data.payslips
    .filter(p => !month || p.month === Number(month))
    .filter(p => !q || fullName(employeeById(p.eid)).toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <PageHead eyebrow="Payroll" title="Payslips"
        sub={`Generated automatically the moment a run is marked paid, then emailed from ${CO.email}.`}
        actions={<button className="btn" onClick={() => toast("Re-queued payslips for July")}>Re-send all for July</button>} />
      <Card>
        <div className="toolbar">
          <input className="field" placeholder="Search person…" value={q} onChange={e => setQ(e.target.value)} />
          <select className="field" value={month} onChange={e => setMonth(e.target.value)}>
            <option value="">All months</option>
            {[6, 7, 8].map(m => <option key={m} value={m}>{MONTHS[m - 1]} 2026</option>)}
          </select>
          <span className="mini" style={{ marginLeft: "auto" }}>{rows.length} payslips</span>
        </div>
        <div className="tablewrap">
          <table>
            <thead><tr><th>Person</th><th>Period</th><th className="right">Gross</th>
              <th className="right">Deductions</th><th className="right">Net paid</th><th>Email</th><th /></tr></thead>
            <tbody>
              {rows.map(p => {
                const e = employeeById(p.eid)!;
                return (
                  <tr key={p.id}>
                    <td><div className="who"><Avatar e={e} size="sm" /><div><b>{fullName(e)}</b><span className="num">{e.code}</span></div></div></td>
                    <td>{MONTHS[p.month - 1]} {p.year}</td>
                    <td className="right num">{money(p.line.gross)}</td>
                    <td className="right num" style={{ color: "var(--rose)" }}>−{money(p.line.tax + p.line.loan + p.line.unpaid)}</td>
                    <td className="right num"><b>{money(p.line.net)}</b></td>
                    <td><Pill value={p.emailed ? "Delivered" : "Queued"} /></td>
                    <td><div className="rowact">
                      <button className="btn sm pri" onClick={() => openModal(<PayslipModal slip={p} />)}>Open</button>
                    </div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
