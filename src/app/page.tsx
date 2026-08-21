"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardHead, CardBody, Stat, PageHead, Steps, Bar } from "@/components/ui/Card";
import { AreaChart, Donut } from "@/components/charts/Charts";
import Pill from "@/components/ui/Pill";
import Icon from "@/components/ui/Icon";
import { useStore } from "@/lib/store";
import { NewEmployeeModal } from "@/components/modals/Modals";
import { AV, MONTHS, PAYROLL_STEPS, TODAY } from "@/lib/seed";
import { fmtDate, short } from "@/lib/format";

export default function DashboardPage() {
  const { data, me, money, openModal } = useStore();
  const router = useRouter();

  const active = data.employees.filter(e => e.status === "Active").length;
  const onLeave = data.employees.filter(e => e.status === "On Leave").length;
  const pending = data.leaves.filter(l => l.status === "Pending").length;
  const run = data.payrolls.slice().sort((a, b) => b.year - a.year || b.month - a.month)[0];
  const paidYTD = data.payrolls.filter(p => p.status === "Paid")
    .reduce((s, p) => s + p.items.reduce((a, i) => a + i.net, 0), 0);

  const todayRows = data.attendance.filter(a => +a.date === +TODAY);
  const present = todayRows.filter(a => a.status === "Present").length;
  const late = todayRows.filter(a => a.status === "Late").length;
  const absent = todayRows.filter(a => a.status === "Absent").length;

  const byDept = data.departments.map((d, i) => ({
    l: d.code, v: data.employees.filter(e => e.deptId === d.id).length, c: AV[i % AV.length],
  }));
  const delayed = data.projects.filter(p => p.status !== "Completed" && p.due < TODAY).length;

  return (
    <>
      <PageHead
        eyebrow="Wednesday, 19 August 2026 · Lahore HQ"
        title={`Good morning, ${me.first}`}
        sub={`${pending} leave requests need a decision and the August payroll is still a draft.`}
        actions={<>
          <Link className="btn" href="/reports"><Icon name="chart" size={15} /> Reports</Link>
          <button className="btn pri" onClick={() => openModal(<NewEmployeeModal />)}>
            <Icon name="people" size={15} /> Add person
          </button>
        </>}
      />

      <div className="pulse" style={{ marginBottom: 16 }}>
        <div className="pulse-in">
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <Donut data={byDept} center={[String(data.employees.length), "ON PAYROLL"]} />
            <div style={{ minWidth: 0 }}>
              <div className="eyebrow">Headcount by department</div>
              <div className="legend" style={{ flexDirection: "column", gap: 7, marginTop: 8 }}>
                {byDept.map((d, i) => (
                  <span key={d.l}><i style={{ background: d.c }} />{data.departments[i].name} <b className="num">{d.v}</b></span>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="card-h" style={{ padding: "0 0 12px", border: 0 }}>
              <div><h3>{run ? `${MONTHS[run.month - 1]} ${run.year} payroll` : "No payroll run"}</h3>
                <div className="sub">{run ? `${run.items.length} people · ${run.status}` : "Create a run to start payroll"}</div></div>
              <Link className="btn pri sm" href="/payroll">{run ? "Open run" : "Create run"}</Link>
            </div>
            {run ? <Steps steps={PAYROLL_STEPS} current={run.status} /> : <div className="empty">No payroll data yet.</div>}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginTop: 18 }}>
              <div><div className="mini">Gross</div>
                <div className="num" style={{ fontSize: 19, fontWeight: 600 }}>{money(run?.items.reduce((s, i) => s + i.gross, 0) || 0)}</div></div>
              <div><div className="mini">Tax &amp; deductions</div>
                <div className="num" style={{ fontSize: 19, fontWeight: 600, color: "var(--rose)" }}>
                  −{money(run?.items.reduce((s, i) => s + i.tax + i.loan + i.unpaid, 0) || 0)}</div></div>
              <div><div className="mini">Net payable</div>
                <div className="num" style={{ fontSize: 19, fontWeight: 600, color: "var(--jade)" }}>
                  {money(run?.items.reduce((s, i) => s + i.net, 0) || 0)}</div></div>
            </div>
            <div className="sep" />
            <div className="mini">Payroll totals are calculated from the current employee and attendance records.</div>
          </div>
        </div>
      </div>

      <div className="stats" style={{ marginBottom: 16 }}>
        <Stat label="Active people" value={active} foot={<><span className="trend up">+2</span> this quarter</>} />
        <Stat label="On leave today" value={onLeave + absent} foot={`${onLeave} approved · ${absent} unexplained`} />
        <Stat label="Awaiting approval" value={pending} foot="Oldest waiting 4 days" />
        <Stat label="Paid year to date" value={short(paidYTD)} foot={`Across ${data.payrolls.filter(p => p.status === "Paid").length} completed runs`} />
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1.35fr 1fr", marginBottom: 16 }}>
        <Card>
          <CardHead title="Headcount growth" sub="Rolling 12 months" action={<Pill value="Live" tone="info" />} />
          <CardBody>
            <AreaChart points={[9, 10, 11, 12, 12, 13, 14, 14, 15, 16, 16, 16]}
              labels={["S", "O", "N", "D", "J", "F", "M", "A", "M", "J", "J", "A"]} />
          </CardBody>
        </Card>
        <Card>
          <CardHead title="Today's attendance" sub="19 August · 16 expected" />
          <CardBody style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <Donut size={150} thick={18}
              data={[
                { l: "Present", v: present, c: "var(--jade)" },
                { l: "Late", v: late, c: "var(--amber)" },
                { l: "On leave", v: onLeave, c: "var(--brand)" },
                { l: "Absent", v: absent, c: "var(--rose)" },
              ]}
              center={[`${active ? Math.round(((present + late) / active) * 100) : 0}%`, "IN OFFICE"]} />
            <div className="legend" style={{ flexDirection: "column", gap: 9 }}>
              <span><i style={{ background: "var(--jade)" }} />On time <b className="num">{present}</b></span>
              <span><i style={{ background: "var(--amber)" }} />Late <b className="num">{late}</b></span>
              <span><i style={{ background: "var(--brand)" }} />On leave <b className="num">{onLeave}</b></span>
              <span><i style={{ background: "var(--rose)" }} />No check-in <b className="num">{absent}</b></span>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1.35fr 1fr" }}>
        <Card>
          <CardHead title="Delivery health"
            sub={`${data.projects.filter(p => p.status === "Active").length} active · ${delayed} past deadline`}
            action={<Link className="btn sm" href="/projects">All projects</Link>} />
          <div className="tablewrap">
            <table>
              <thead><tr><th>Project</th><th>Client</th><th>Deadline</th><th style={{ width: 170 }}>Progress</th><th className="right">Budget used</th></tr></thead>
              <tbody>
                {data.projects.filter(p => p.status !== "Completed").slice(0, 5).map(p => {
                  const over = p.due < TODAY;
                  return (
                    <tr key={p.id} style={{ cursor: "pointer" }} onClick={() => router.push(`/projects/${p.id}`)}>
                      <td><b>{p.name}</b><div className="mini num">{p.code}</div></td>
                      <td>{p.client}</td>
                      <td className="num" style={over ? { color: "var(--rose)" } : undefined}>{fmtDate(p.due)}{over ? " ⚠" : ""}</td>
                      <td><Bar pct={p.progress} /><div className="mini num" style={{ marginTop: 4 }}>{p.progress}%</div></td>
                      <td className="right num">{Math.round((p.spent / p.budget) * 100)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHead title="Recent activity" sub="Everything is written to the audit log" />
          <CardBody>
            <div className="tl">
              {data.audit.slice(0, 6).map(a => (
                <div className="tl-i" key={a.id}>
                  <p><b>{a.who}</b> · {a.act.toLowerCase()}<br /><span className="mini">{a.target}</span></p>
                  <time>{fmtDate(a.at)}</time>
                </div>
              ))}
            </div>
            <Link className="btn sm" href="/audit" style={{ width: "100%", justifyContent: "center" }}>Open audit log</Link>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
