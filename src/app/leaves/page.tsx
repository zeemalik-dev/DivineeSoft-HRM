"use client";
import { useState } from "react";
import { Card, PageHead, Stat } from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import Pill from "@/components/ui/Pill";
import { useStore, useLookups } from "@/lib/store";
import { LeaveModal } from "@/components/modals/Modals";
import { fullName, fmtDate, daysBetween } from "@/lib/format";
import { TODAY } from "@/lib/seed";

export default function LeavesPage() {
  const { data, actions, openModal } = useStore();
  const { employeeById, departmentName } = useLookups();
  const [status, setStatus] = useState("");

  const rows = data.leaves.filter(l => !status || l.status === status);
  const pending = data.leaves.filter(l => l.status === "Pending");

  return (
    <>
      <PageHead eyebrow="HR management" title="Leave requests"
        sub={`${pending.length} waiting on you. Approving updates the balance and emails the person straight away.`}
        actions={<button className="btn pri" onClick={() => openModal(<LeaveModal />)}>Request leave</button>} />

      <div className="stats" style={{ marginBottom: 16 }}>
        <Stat label="Pending" value={pending.length} foot="Needs a decision" />
        <Stat label="Approved" value={data.leaves.filter(l => l.status === "Approved").length} foot="This month" />
        <Stat label="Rejected" value={data.leaves.filter(l => l.status === "Rejected").length} foot="Reason recorded each time" />
        <Stat label="Days booked ahead" value={data.leaves.filter(l => l.from > TODAY).reduce((s, l) => s + daysBetween(l.from, l.to), 0)} foot="September onwards" />
      </div>

      <Card>
        <div className="toolbar">
          <select className="field" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">All requests</option>
            {["Pending", "Approved", "Rejected"].map(s => <option key={s}>{s}</option>)}
          </select>
          <span className="mini" style={{ marginLeft: "auto" }}>Manager approves → HR confirms → person is emailed</span>
        </div>
        <div className="tablewrap">
          <table>
            <thead><tr><th>Person</th><th>Type</th><th>Dates</th><th>Days</th>
              <th className="hide-sm">Reason</th><th>Status</th><th /></tr></thead>
            <tbody>
              {rows.map(l => {
                const e = employeeById(l.eid)!;
                return (
                  <tr key={l.id}>
                    <td><div className="who"><Avatar e={e} size="sm" /><div><b>{fullName(e)}</b><span>{departmentName(e.deptId)}</span></div></div></td>
                    <td>{l.type}<div className="mini">{l.type === "Unpaid Leave" ? "Deducted from pay" : "Paid"}</div></td>
                    <td className="num">{fmtDate(l.from)}<div className="mini num">to {fmtDate(l.to)}</div></td>
                    <td className="num">{daysBetween(l.from, l.to)}</td>
                    <td className="hide-sm mini" style={{ maxWidth: 220 }}>{l.reason}
                      {l.note && <div style={{ color: "var(--rose)" }}>{l.note}</div>}</td>
                    <td><Pill value={l.status} /></td>
                    <td><div className="rowact">
                      {l.status === "Pending" ? (
                        <>
                          <button className="btn sm" onClick={() => actions.decideLeave(l.id, "Approved")}>Approve</button>
                          <button className="btn sm danger" onClick={() => actions.decideLeave(l.id, "Rejected")}>Reject</button>
                        </>
                      ) : <span className="mini">{l.by ? "by " + fullName(employeeById(l.by)) : ""}</span>}
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
