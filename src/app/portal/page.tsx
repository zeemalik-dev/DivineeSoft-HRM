"use client";
import Link from "next/link";
import { Card, CardHead, CardBody, PageHead, Empty, Bar } from "@/components/ui/Card";
import Pill from "@/components/ui/Pill";
import Icon from "@/components/ui/Icon";
import { useStore, useLookups } from "@/lib/store";
import { LeaveModal, PayslipModal } from "@/components/modals/Modals";
import { fullName, fmtDate } from "@/lib/format";
import { MONTHS, TODAY } from "@/lib/seed";

export default function PortalPage() {
  const { data, me, money, actions, openModal } = useStore();
  const { projectById } = useLookups();

  const att = data.attendance.filter(a => a.eid === me.id);
  const today = att.find(a => +a.date === +TODAY);
  const mySlips = data.payslips.filter(p => p.eid === me.id).sort((a, b) => b.month - a.month);
  const myTasks = data.tasks.filter(t => t.assignee === me.id && t.status !== "Completed");
  const myLeaves = data.leaves.filter(l => l.eid === me.id);

  return (
    <>
      <PageHead eyebrow="My workspace" title={`Hello ${me.first}`}
        sub={`${today ? `Checked in at ${today.in} today.` : "You haven't checked in yet today."} ${myTasks.length} tasks are open.`}
        actions={<>
          <button className="btn" onClick={() => openModal(<LeaveModal />)}>Request leave</button>
          <button className="btn pri" onClick={() => actions.checkIn()}>{today ? "Check out" : "Check in"}</button>
        </>} />

      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", marginBottom: 16 }}>
        <Card>
          <CardHead title="Leave balance" />
          <CardBody>
            {Object.entries(me.leave).map(([k, v]) => (
              <div key={k} style={{ marginBottom: 13 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ textTransform: "capitalize", fontWeight: 500 }}>{k}</span>
                  <span className="num"><b>{v.total - v.used}</b> of {v.total} left</span>
                </div>
                <Bar pct={(v.used / v.total) * 100} />
              </div>
            ))}
            <div className="mini">Unused annual days carry over up to a maximum of 5.</div>
          </CardBody>
        </Card>

        <Card>
          <CardHead title="Latest payslip" />
          <CardBody>
            {mySlips[0] ? (
              <>
                <div className="eyebrow">{MONTHS[mySlips[0].month - 1]} {mySlips[0].year}</div>
                <div className="num" style={{ fontSize: 30, fontWeight: 600, fontFamily: "var(--font-display)", margin: "6px 0" }}>
                  {money(mySlips[0].line.net)}
                </div>
                <div className="mini">Paid {mySlips[0].paidAt ? fmtDate(mySlips[0].paidAt) : "—"} into HBL •••• 4471</div>
                <div className="sep" />
                <button className="btn pri sm" style={{ width: "100%", justifyContent: "center" }}
                  onClick={() => openModal(<PayslipModal slip={mySlips[0]} />)}>Open payslip</button>
              </>
            ) : <div className="mini">Your first payslip appears after the next run.</div>}
          </CardBody>
        </Card>

        <Card>
          <CardHead title="This month" />
          <CardBody>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div><div className="mini">Days worked</div><div className="num" style={{ fontSize: 22, fontWeight: 600 }}>{att.filter(a => a.hours).length}</div></div>
              <div><div className="mini">Hours logged</div><div className="num" style={{ fontSize: 22, fontWeight: 600 }}>{att.reduce((s, a) => s + a.hours, 0).toFixed(0)}</div></div>
              <div><div className="mini">Overtime</div><div className="num" style={{ fontSize: 22, fontWeight: 600, color: "var(--jade)" }}>{att.reduce((s, a) => s + (a.overtime || 0), 0).toFixed(1)}h</div></div>
              <div><div className="mini">Late arrivals</div><div className="num" style={{ fontSize: 22, fontWeight: 600, color: "var(--amber)" }}>{att.filter(a => a.status === "Late").length}</div></div>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1.3fr 1fr" }}>
        <Card>
          <CardHead title="My tasks" sub={`Across ${new Set(myTasks.map(t => t.pid)).size} projects`}
            action={<Link className="btn sm" href="/tasks">Open board</Link>} />
          {myTasks.length ? (
            <div className="tablewrap">
              <table>
                <thead><tr><th>Task</th><th>Project</th><th>Due</th><th>Status</th></tr></thead>
                <tbody>{myTasks.map(t => (
                  <tr key={t.id}>
                    <td><b>{t.title}</b></td>
                    <td className="mini">{projectById(t.pid)?.name}</td>
                    <td className="num" style={t.due < TODAY ? { color: "var(--rose)" } : undefined}>{fmtDate(t.due)}</td>
                    <td><Pill value={t.status} /></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          ) : <Empty icon={<Icon name="check" size={34} />} title="Nothing on your plate" body="Enjoy it while it lasts." />}
        </Card>

        <Card>
          <CardHead title="My requests" />
          <CardBody>
            {myLeaves.length ? myLeaves.map(l => (
              <div key={l.id} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--line)" }}>
                <div><b style={{ fontSize: 13 }}>{l.type}</b>
                  <div className="mini num">{fmtDate(l.from)} → {fmtDate(l.to)}</div></div>
                <Pill value={l.status} />
              </div>
            )) : <div className="mini">No leave requests yet.</div>}
            <div className="sep" />
            <h3 style={{ fontSize: 14, marginBottom: 10 }}>Announcements</h3>
            {data.announcements.slice(0, 2).map(a => (
              <div key={a.id} style={{ padding: "9px 0" }}>
                <b style={{ fontSize: 13 }}>{a.title}</b>
                <div className="mini">{a.body.slice(0, 90)}…</div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
