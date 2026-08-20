"use client";
import { use, useState } from "react";
import Link from "next/link";
import { Card, CardHead, CardBody, Empty, Bar } from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import Pill from "@/components/ui/Pill";
import Icon from "@/components/ui/Icon";
import { useStore, useLookups } from "@/lib/store";
import { StatusModal, SalaryModal, ComposeModal } from "@/components/modals/Modals";
import { fullName, fmtDate, daysBetween } from "@/lib/format";
import { TODAY, payLine } from "@/lib/seed";

const TABS = ["overview", "employment", "salary", "attendance", "leave", "projects", "documents", "timeline"] as const;
type Tab = typeof TABS[number];

export default function EmployeePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, money, openModal } = useStore();
  const { departmentName, employeeById } = useLookups();
  const [tab, setTab] = useState<Tab>("overview");

  const e = data.employees.find(x => x.id === id);
  if (!e) return <Empty title="That person is not on file" body="They may have been removed. Go back to the people list." />;

  const line = payLine(e);
  const att = data.attendance.filter(a => a.eid === e.id);
  const myLeaves = data.leaves.filter(l => l.eid === e.id);
  const myTasks = data.tasks.filter(t => t.assignee === e.id);
  const myProjects = data.projects.filter(p => p.team.includes(e.id) || p.pm === e.id);

  return (
    <>
      <Link className="btn sm" href="/employees" style={{ marginBottom: 14 }}>← All people</Link>

      <Card style={{ marginBottom: 16 }}>
        <CardBody style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
          <Avatar e={e} size="lg" />
          <div style={{ flex: 1, minWidth: 200 }}>
            <h1 style={{ fontSize: 23, display: "flex", alignItems: "center", gap: 10 }}>
              {fullName(e)} <Pill value={e.status} />
            </h1>
            <p className="mini" style={{ marginTop: 5 }}>{e.desig} · {departmentName(e.deptId)} · <span className="num">{e.code}</span></p>
            <p className="mini">{e.email} · <span className="num">{e.phone}</span></p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="btn" onClick={() => openModal(<ComposeModal to={e.email} />)}>Send email</button>
            <button className="btn" onClick={() => openModal(<SalaryModal employee={e} />)}>Revise salary</button>
            {e.status !== "Terminated" && (
              <button className="btn danger" onClick={() => openModal(<StatusModal employee={e} />)}>Change status</button>
            )}
          </div>
        </CardBody>
        <div className="tabs">
          {TABS.map(t => (
            <button key={t} className={`tab ${tab === t ? "on" : ""}`} onClick={() => setTab(t)}>
              {t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </Card>

      {tab === "overview" && (
        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <Card>
            <CardHead title="Personal" />
            <CardBody>
              <dl className="kv">
                <dt>Employee ID</dt><dd className="num">{e.code}</dd>
                <dt>Date of birth</dt><dd>{fmtDate(e.dob)}</dd>
                <dt>Gender</dt><dd>{e.gender}</dd>
                <dt>Phone</dt><dd className="num">{e.phone}</dd>
                <dt>Email</dt><dd>{e.email}</dd>
                <dt>Address</dt><dd>{e.address}</dd>
                <dt>Emergency contact</dt>
                <dd>{e.emergency.name} · {e.emergency.rel}<div className="mini num">{e.emergency.phone}</div></dd>
              </dl>
            </CardBody>
          </Card>
          <Card>
            <CardHead title="This month" />
            <CardBody>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div><div className="mini">Days present</div><div className="num" style={{ fontSize: 22 }}>{att.filter(a => a.status !== "Absent" && a.status !== "On Leave").length}</div></div>
                <div><div className="mini">Late arrivals</div><div className="num" style={{ fontSize: 22, color: "var(--amber)" }}>{att.filter(a => a.status === "Late").length}</div></div>
                <div><div className="mini">Overtime hours</div><div className="num" style={{ fontSize: 22 }}>{att.reduce((s, a) => s + (a.overtime || 0), 0).toFixed(1)}</div></div>
                <div><div className="mini">Open tasks</div><div className="num" style={{ fontSize: 22 }}>{myTasks.filter(t => t.status !== "Completed").length}</div></div>
              </div>
              <div className="sep" />
              <div className="mini" style={{ marginBottom: 8 }}>Leave balance</div>
              {Object.entries(e.leave).map(([k, v]) => (
                <div key={k} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5 }}>
                    <span style={{ textTransform: "capitalize" }}>{k}</span>
                    <span className="num">{v.total - v.used} of {v.total} left</span>
                  </div>
                  <Bar pct={(v.used / v.total) * 100} />
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      )}

      {tab === "employment" && (
        <Card><CardBody>
          <dl className="kv">
            <dt>Joined</dt><dd>{fmtDate(e.joined)}</dd>
            <dt>Contract</dt><dd>{e.type}</dd>
            <dt>Work type</dt><dd>{e.work}</dd>
            <dt>Location</dt><dd>{e.location}</dd>
            <dt>Department</dt><dd>{departmentName(e.deptId)}</dd>
            <dt>Designation</dt><dd>{e.desig}</dd>
            <dt>Reports to</dt><dd>{fullName(employeeById(e.mgrId))}</dd>
            <dt>System role</dt><dd>{e.role}</dd>
            <dt>Status</dt>
            <dd><Pill value={e.status} />
              {e.statusMeta && <div className="mini">{e.statusMeta.reason} — {e.statusMeta.by}, {fmtDate(e.statusMeta.at)}</div>}</dd>
          </dl>
        </CardBody></Card>
      )}

      {tab === "salary" && (
        <div className="grid" style={{ gridTemplateColumns: "1.2fr 1fr" }}>
          <Card>
            <CardHead title="Current structure" sub="Effective 1 August 2026"
              action={<button className="btn sm" onClick={() => openModal(<SalaryModal employee={e} />)}>Revise</button>} />
            <div className="tablewrap"><table><tbody>
              {([["Basic salary", line.basic], ["House rent allowance", line.housing],
                 ["Transport allowance", line.transport], ["Medical allowance", line.medical]] as [string, number][])
                .map(([l, v]) => <tr key={l}><td>{l}</td><td className="right num">{money(v)}</td></tr>)}
              <tr style={{ background: "var(--panel-2)" }}><td><b>Gross</b></td><td className="right num"><b>{money(line.gross)}</b></td></tr>
              <tr><td>Income tax ({(e.salary.taxRate * 100).toFixed(0)}%)</td>
                <td className="right num" style={{ color: "var(--rose)" }}>−{money(line.tax)}</td></tr>
              {line.loan > 0 && <tr><td>Loan repayment</td><td className="right num" style={{ color: "var(--rose)" }}>−{money(line.loan)}</td></tr>}
              <tr style={{ background: "var(--tint)" }}><td><b>Net monthly</b></td><td className="right num"><b>{money(line.net)}</b></td></tr>
            </tbody></table></div>
          </Card>
          <Card>
            <CardHead title="Salary history" />
            <CardBody><div className="tl">
              {[[new Date(2026, 7, 1), e.salary.basic], [new Date(2025, 7, 1), Math.round(e.salary.basic * 0.86)], [e.joined, Math.round(e.salary.basic * 0.62)]]
                .map(([d, v], i) => (
                  <div className="tl-i" key={i}>
                    <p className="num" style={{ fontWeight: 600 }}>{money(v as number)} <span className="mini">basic</span></p>
                    <time>{i === 2 ? "On joining · " : ""}{fmtDate(d as Date)}</time>
                  </div>
                ))}
            </div></CardBody>
          </Card>
        </div>
      )}

      {tab === "attendance" && (
        <Card>
          <CardHead title="August 2026" sub={`${att.length} working days recorded`} />
          <div className="tablewrap"><table>
            <thead><tr><th>Date</th><th>Check in</th><th>Check out</th><th>Hours</th><th>Overtime</th><th>Status</th></tr></thead>
            <tbody>{att.slice().reverse().map((a, i) => (
              <tr key={i}><td className="num">{fmtDate(a.date)}</td><td className="num">{a.in || "—"}</td>
                <td className="num">{a.out || "—"}</td><td className="num">{a.hours || "—"}</td>
                <td className="num">{a.overtime ? a.overtime + "h" : "—"}</td><td><Pill value={a.status} /></td></tr>
            ))}</tbody>
          </table></div>
        </Card>
      )}

      {tab === "leave" && (
        <Card>
          {myLeaves.length ? (
            <div className="tablewrap"><table>
              <thead><tr><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Status</th></tr></thead>
              <tbody>{myLeaves.map(l => (
                <tr key={l.id}><td>{l.type}</td><td className="num">{fmtDate(l.from)}</td><td className="num">{fmtDate(l.to)}</td>
                  <td className="num">{daysBetween(l.from, l.to)}</td><td className="mini">{l.reason}</td>
                  <td><Pill value={l.status} /></td></tr>
              ))}</tbody>
            </table></div>
          ) : <Empty icon={<Icon name="calendar" size={34} />} title="No leave taken yet" body="Requests will appear here once submitted." />}
        </Card>
      )}

      {tab === "projects" && (
        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <Card><CardHead title="Projects" /><CardBody>
            {myProjects.length ? myProjects.map(p => (
              <div key={p.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "9px 0", borderBottom: "1px solid var(--line)" }}>
                <div><b>{p.name}</b><div className="mini">{p.pm === e.id ? "Project manager" : "Team member"} · {p.client}</div></div>
                <Pill value={p.status} />
              </div>
            )) : <div className="mini">Not assigned to any project.</div>}
          </CardBody></Card>
          <Card><CardHead title="Tasks" /><CardBody>
            {myTasks.length ? myTasks.map(t => (
              <div key={t.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "9px 0", borderBottom: "1px solid var(--line)" }}>
                <div><b>{t.title}</b><div className="mini">Due {fmtDate(t.due)}</div></div>
                <Pill value={t.status} />
              </div>
            )) : <div className="mini">No tasks assigned.</div>}
          </CardBody></Card>
        </div>
      )}

      {tab === "documents" && (
        <Card>
          <CardHead title="Documents" sub="Stored encrypted · access is logged"
            action={<button className="btn sm pri">Upload</button>} />
          <div className="tablewrap"><table>
            <thead><tr><th>Document</th><th>Type</th><th>Added</th><th>Expires</th><th /></tr></thead>
            <tbody>{e.docs.map((d, i) => (
              <tr key={i}><td><b>{d.n}</b></td><td>{d.t}</td><td className="num">{fmtDate(d.at)}</td>
                <td className="num">{d.exp ? fmtDate(d.exp) : "—"}</td>
                <td className="right"><button className="btn sm">Download</button></td></tr>
            ))}</tbody>
          </table></div>
        </Card>
      )}

      {tab === "timeline" && (
        <Card><CardBody><div className="tl">
          {[
            { p: `Salary revised to ${money(e.salary.basic)} basic`, d: new Date(2026, 7, 1) },
            ...(e.statusMeta ? [{ p: `Status changed to ${e.status} — ${e.statusMeta.reason}`, d: e.statusMeta.at }] : []),
            { p: `Assigned to ${myProjects[0]?.name || "internal work"}`, d: new Date(2026, 5, 2) },
            { p: "Annual review completed — rating 4.2 / 5", d: new Date(2026, 0, 15) },
            { p: `Joined Divineesoft Technologies as ${e.desig}`, d: e.joined },
          ].map((x, i) => (
            <div className="tl-i" key={i}><p>{x.p}</p><time>{fmtDate(x.d)}</time></div>
          ))}
        </div></CardBody></Card>
      )}
    </>
  );
}
