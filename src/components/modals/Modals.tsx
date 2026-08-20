"use client";
import { useState } from "react";
import Image from "next/image";
import { useStore, useLookups } from "@/lib/store";
import { CO, MONTHS, TODAY, payLine } from "@/lib/seed";
import { fullName, fmtDate } from "@/lib/format";
import Avatar from "@/components/ui/Avatar";
import Pill from "@/components/ui/Pill";
import type { Employee, EmploymentStatus, Payslip, PayrollRun, RoleName } from "@/lib/types";

function Frame({ title, sub, wide, children, footer }: {
  title: string; sub?: string; wide?: boolean; children: React.ReactNode; footer?: React.ReactNode;
}) {
  const { closeModal } = useStore();
  return (
    <div className={`modal ${wide ? "wide" : ""}`} onClick={e => e.stopPropagation()}>
      <div className="modal-h">
        <div><h3>{title}</h3>{sub && <p>{sub}</p>}</div>
        <button className="btn sm" onClick={closeModal}>Close</button>
      </div>
      <div className="modal-b">{children}</div>
      {footer && <div className="modal-f">{footer}</div>}
    </div>
  );
}

/* ------------------------------- status change ------------------------------ */
export function StatusModal({ employee }: { employee: Employee }) {
  const { actions, closeModal } = useStore();
  const [status, setStatus] = useState<EmploymentStatus>(employee.status);
  const [reason, setReason] = useState("");
  return (
    <Frame title={`Change status · ${fullName(employee)}`}
      sub={`Currently ${employee.status}. Nothing is deleted — the record and history stay intact.`}
      footer={<>
        <button className="btn" onClick={closeModal}>Cancel</button>
        <button className="btn pri" onClick={() => { actions.changeStatus(employee.id, status, reason); closeModal(); }}>
          Apply change
        </button>
      </>}>
      <div className="form">
        <div>
          <label className="lb">New status</label>
          <select className="in" value={status} onChange={e => setStatus(e.target.value as EmploymentStatus)}>
            {["Active", "On Leave", "Probation", "Suspended", "Terminated", "Resigned"].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="lb">Reason (recorded in the audit log)</label>
          <textarea className="in" value={reason} onChange={e => setReason(e.target.value)}
            placeholder="Be specific — this is what the person and any tribunal will read." />
        </div>
        <div style={{ background: "var(--amber-bg)", color: "var(--amber)", padding: 12, borderRadius: 10, fontSize: 12.5 }}>
          Suspending revokes active sessions immediately and removes the person from the next payroll run until reinstated.
        </div>
      </div>
    </Frame>
  );
}

/* -------------------------------- salary edit ------------------------------- */
export function SalaryModal({ employee }: { employee: Employee }) {
  const { actions, closeModal, money } = useStore();
  const [basic, setBasic] = useState(String(employee.salary.basic));
  const n = Number(basic) || 0;
  return (
    <Frame title={`Revise salary · ${fullName(employee)}`}
      sub="The previous figure is kept in salary history and written to the audit log."
      footer={<>
        <button className="btn" onClick={closeModal}>Cancel</button>
        <button className="btn pri" onClick={() => { actions.reviseSalary(employee.id, n); closeModal(); }}>Save revision</button>
      </>}>
      <div className="form">
        <div className="f2">
          <div><label className="lb">Current basic</label><input className="in num" value={money(employee.salary.basic)} disabled /></div>
          <div><label className="lb">New basic</label><input className="in num" value={basic} onChange={e => setBasic(e.target.value)} /></div>
        </div>
        <div className="f3">
          <div><label className="lb">House rent (20%)</label><input className="in num" value={money(n * 0.2)} disabled /></div>
          <div><label className="lb">Transport (8%)</label><input className="in num" value={money(n * 0.08)} disabled /></div>
          <div><label className="lb">Medical (6%)</label><input className="in num" value={money(n * 0.06)} disabled /></div>
        </div>
        <div className="hint">Allowances recalculate from the new basic automatically. Net after tax updates on save.</div>
      </div>
    </Frame>
  );
}

/* ------------------------------- add employee ------------------------------- */
export function NewEmployeeModal() {
  const { data, actions, closeModal } = useStore();
  const [f, setF] = useState({
    first: "", last: "", email: "", deptId: data.departments[0].id,
    desig: "Software Engineer", role: "Employee" as RoleName,
    type: "Full Time" as Employee["type"], work: "On-site" as Employee["work"], basic: "150000",
  });
  const set = (k: string, v: string) => setF(prev => ({ ...prev, [k]: v }));
  return (
    <Frame wide title="Add a person" sub={`A welcome email with sign-in details goes out from ${CO.email} once you save.`}
      footer={<>
        <button className="btn" onClick={closeModal}>Cancel</button>
        <button className="btn pri" onClick={() => {
          actions.addEmployee({ ...f, basic: Number(f.basic) || 150000, first: f.first || "New", last: f.last || "Joiner" });
          closeModal();
        }}>Add and send welcome email</button>
      </>}>
      <div className="form">
        <div className="f3">
          <div><label className="lb">First name</label><input className="in" value={f.first} onChange={e => set("first", e.target.value)} /></div>
          <div><label className="lb">Last name</label><input className="in" value={f.last} onChange={e => set("last", e.target.value)} /></div>
          <div><label className="lb">Employee ID</label><input className="in num" value={`DST-0${data.employees.length + 1}`} disabled /></div>
        </div>
        <div className="f2">
          <div><label className="lb">Work email</label><input className="in" value={f.email} onChange={e => set("email", e.target.value)} placeholder="name@divineesoft.com" /></div>
          <div><label className="lb">Monthly basic salary</label><input className="in num" value={f.basic} onChange={e => set("basic", e.target.value)} /></div>
        </div>
        <div className="f3">
          <div><label className="lb">Department</label>
            <select className="in" value={f.deptId} onChange={e => set("deptId", e.target.value)}>
              {data.departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select></div>
          <div><label className="lb">Contract</label>
            <select className="in" value={f.type} onChange={e => set("type", e.target.value)}>
              {["Full Time", "Part Time", "Contract", "Internship", "Freelance"].map(x => <option key={x}>{x}</option>)}
            </select></div>
          <div><label className="lb">Work type</label>
            <select className="in" value={f.work} onChange={e => set("work", e.target.value)}>
              {["On-site", "Hybrid", "Remote"].map(x => <option key={x}>{x}</option>)}
            </select></div>
        </div>
        <div className="f2">
          <div><label className="lb">Designation</label><input className="in" value={f.desig} onChange={e => set("desig", e.target.value)} /></div>
          <div><label className="lb">System role</label>
            <select className="in" value={f.role} onChange={e => set("role", e.target.value)}>
              {["Employee", "Team Lead", "Project Manager", "Finance Manager", "HR Manager", "Super Admin"].map(r => <option key={r}>{r}</option>)}
            </select></div>
        </div>
      </div>
    </Frame>
  );
}

/* -------------------------------- leave form -------------------------------- */
export function LeaveModal() {
  const { data, actions, closeModal } = useStore();
  const [type, setType] = useState(data.leaveTypes[0].name);
  const [from, setFrom] = useState("2026-09-07");
  const [to, setTo] = useState("2026-09-09");
  const [reason, setReason] = useState("");
  return (
    <Frame title="Request leave" sub="Your manager sees it immediately; HR confirms afterwards."
      footer={<>
        <button className="btn" onClick={closeModal}>Cancel</button>
        <button className="btn pri" onClick={() => {
          actions.requestLeave({ type, from: new Date(from), to: new Date(to), reason });
          closeModal();
        }}>Submit request</button>
      </>}>
      <div className="form">
        <div><label className="lb">Type</label>
          <select className="in" value={type} onChange={e => setType(e.target.value)}>
            {data.leaveTypes.map(l => <option key={l.id}>{l.name}</option>)}
          </select></div>
        <div className="f2">
          <div><label className="lb">From</label><input className="in" type="date" value={from} onChange={e => setFrom(e.target.value)} /></div>
          <div><label className="lb">To</label><input className="in" type="date" value={to} onChange={e => setTo(e.target.value)} /></div>
        </div>
        <div><label className="lb">Reason</label>
          <textarea className="in" value={reason} onChange={e => setReason(e.target.value)} placeholder="A sentence is enough." /></div>
        <div><label className="lb">Attachment</label>
          <div style={{ padding: 14, border: "1px dashed var(--line)", borderRadius: 11 }} className="mini">
            Drop a medical certificate or supporting document here — PDF, JPG or PNG up to 10 MB.
          </div></div>
      </div>
    </Frame>
  );
}

/* --------------------------------- compose ---------------------------------- */
export function ComposeModal({ to = "" }: { to?: string }) {
  const { actions, closeModal, data } = useStore();
  const [f, setF] = useState({ to, subject: "", body: "" });
  return (
    <Frame title="Compose" sub={`Sending as ${data.settings.smtp.from} <${CO.email}>`}
      footer={<>
        <button className="btn" onClick={closeModal}>Cancel</button>
        <button className="btn pri" onClick={() => {
          actions.sendEmail(f.to || CO.email, f.subject); closeModal();
        }}>Send</button>
      </>}>
      <div className="form">
        <div><label className="lb">To</label><input className="in num" value={f.to} onChange={e => setF({ ...f, to: e.target.value })} placeholder="name@divineesoft.com" /></div>
        <div><label className="lb">Subject</label><input className="in" value={f.subject} onChange={e => setF({ ...f, subject: e.target.value })} /></div>
        <div><label className="lb">Message</label><textarea className="in" style={{ minHeight: 130 }} value={f.body} onChange={e => setF({ ...f, body: e.target.value })} /></div>
      </div>
    </Frame>
  );
}

/* ------------------------------- payroll detail ----------------------------- */
export function RunDetailModal({ run }: { run: PayrollRun }) {
  const { money } = useStore();
  const { employeeById } = useLookups();
  const sum = (k: "gross" | "tax" | "net") => run.items.reduce((s, i) => s + i[k], 0);
  return (
    <Frame wide title={`${MONTHS[run.month - 1]} ${run.year} breakdown`}
      sub={`${run.items.length} people · ${run.status}`}>
      <div className="tablewrap">
        <table>
          <thead><tr>
            <th>Person</th><th className="right">Basic</th><th className="right">Allowances</th>
            <th className="right">Overtime</th><th className="right">Bonus</th><th className="right">Gross</th>
            <th className="right">Tax</th><th className="right">Other</th><th className="right">Net</th>
          </tr></thead>
          <tbody>
            {run.items.map(i => {
              const e = employeeById(i.eid)!;
              return (
                <tr key={i.eid}>
                  <td><div className="who"><Avatar e={e} size="sm" /><div><b>{fullName(e)}</b><span className="num">{e.code}</span></div></div></td>
                  <td className="right num">{money(i.basic)}</td>
                  <td className="right num">{money(i.housing + i.transport + i.medical)}</td>
                  <td className="right num">{i.overtime ? money(i.overtime) : "—"}</td>
                  <td className="right num">{i.bonus ? money(i.bonus) : "—"}</td>
                  <td className="right num"><b>{money(i.gross)}</b></td>
                  <td className="right num" style={{ color: "var(--rose)" }}>−{money(i.tax)}</td>
                  <td className="right num" style={{ color: "var(--rose)" }}>{i.loan + i.unpaid ? "−" + money(i.loan + i.unpaid) : "—"}</td>
                  <td className="right num"><b>{money(i.net)}</b></td>
                </tr>
              );
            })}
            <tr style={{ background: "var(--tint)" }}>
              <td><b>Total</b></td><td colSpan={4} />
              <td className="right num"><b>{money(sum("gross"))}</b></td>
              <td className="right num"><b>−{money(sum("tax"))}</b></td>
              <td className="right num"><b>−{money(run.items.reduce((s, i) => s + i.loan + i.unpaid, 0))}</b></td>
              <td className="right num"><b>{money(sum("net"))}</b></td>
            </tr>
          </tbody>
        </table>
      </div>
    </Frame>
  );
}

/* --------------------------------- payslip ---------------------------------- */
export function PayslipModal({ slip }: { slip: Payslip }) {
  const { money, closeModal, actions, data } = useStore();
  const e = data.employees.find(x => x.id === slip.eid)!;
  const l = slip.line;
  const dept = data.departments.find(d => d.id === e.deptId)?.name;
  const earnings: [string, number][] = [
    ["Basic salary", l.basic], ["House rent allowance", l.housing],
    ["Transport allowance", l.transport], ["Medical allowance", l.medical],
  ];
  if (l.bonus) earnings.push(["Performance bonus", l.bonus]);
  if (l.overtime) earnings.push(["Overtime", l.overtime]);
  const deductions: [string, number][] = [["Income tax", l.tax]];
  if (l.loan) deductions.push(["Loan repayment", l.loan]);
  if (l.unpaid) deductions.push(["Unpaid leave", l.unpaid]);

  return (
    <div className="modal wide" onClick={ev => ev.stopPropagation()}>
      <div className="modal-h noprint">
        <div><h3>Payslip · {MONTHS[slip.month - 1]} {slip.year}</h3><p>{fullName(e)} · {e.code}</p></div>
        <button className="btn sm" onClick={closeModal}>Close</button>
      </div>
      <div className="modal-b" style={{ background: "var(--panel-2)" }}>
        <div className="slip">
          <div className="slip-top">
            <div style={{ display: "flex", gap: 13, alignItems: "center" }}>
              <Image src="/logo-mark.png" alt="" width={40} height={43} style={{ filter: "brightness(0) invert(1)" }} />
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, letterSpacing: "-.03em" }}>DIVINEESOFT</div>
                <div style={{ fontSize: 8, letterSpacing: ".32em", opacity: 0.85 }}>TECHNOLOGIES</div>
              </div>
            </div>
            <div style={{ textAlign: "right", fontSize: 11, lineHeight: 1.6, opacity: 0.95 }}>
              {CO.address}<br />{CO.email} · {CO.phone}<br />{CO.site}
            </div>
          </div>

          <div className="slip-body">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 10, letterSpacing: ".2em", color: "#5A6884", fontWeight: 600 }}>SALARY SLIP</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 21, fontWeight: 600 }}>{MONTHS[slip.month - 1]} {slip.year}</div>
              </div>
              <div style={{ textAlign: "right", fontSize: 11.5, color: "#5A6884" }}>
                Paid {slip.paidAt ? fmtDate(slip.paidAt) : "—"}<br />
                <span style={{ color: "#0E9F6E", fontWeight: 700 }}>PAID · Bank transfer</span>
              </div>
            </div>

            <table style={{ marginBottom: 20 }}><tbody>
              <tr><td style={{ width: "25%", color: "#5A6884" }}>Employee</td><td style={{ fontWeight: 600 }}>{fullName(e)}</td>
                <td style={{ width: "25%", color: "#5A6884" }}>Employee ID</td><td className="num" style={{ fontWeight: 600 }}>{e.code}</td></tr>
              <tr><td style={{ color: "#5A6884" }}>Department</td><td>{dept}</td>
                <td style={{ color: "#5A6884" }}>Designation</td><td>{e.desig}</td></tr>
              <tr><td style={{ color: "#5A6884" }}>Joined</td><td className="num">{fmtDate(e.joined)}</td>
                <td style={{ color: "#5A6884" }}>Contract</td><td>{e.type}</td></tr>
            </tbody></table>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              <table><thead><tr><th>Earnings</th><th className="right">Amount</th></tr></thead><tbody>
                {earnings.map(([k, v]) => <tr key={k}><td>{k}</td><td className="right num">{money(v)}</td></tr>)}
                <tr className="tot"><td>Gross</td><td className="right num">{money(l.gross)}</td></tr>
              </tbody></table>
              <table><thead><tr><th>Deductions</th><th className="right">Amount</th></tr></thead><tbody>
                {deductions.map(([k, v]) => <tr key={k}><td>{k}</td><td className="right num">{money(v)}</td></tr>)}
                <tr className="tot"><td>Total deductions</td><td className="right num">{money(l.tax + l.loan + l.unpaid + l.other)}</td></tr>
              </tbody></table>
            </div>

            <div style={{ marginTop: 20, background: "#0A4BF1", color: "#fff", borderRadius: 10, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 10, letterSpacing: ".2em", opacity: 0.8 }}>NET PAY</div>
                <div style={{ fontSize: 11, opacity: 0.85, marginTop: 3 }}>Credited to HBL •••• 4471</div>
              </div>
              <div className="num" style={{ fontSize: 27, fontWeight: 600, fontFamily: "var(--font-display)" }}>{money(l.net)}</div>
            </div>

            <div style={{ marginTop: 18, fontSize: 10.5, color: "#8C99B2", textAlign: "center", lineHeight: 1.6 }}>
              Computer-generated document — no signature required. Questions? Write to {CO.email}.<br />
              {CO.name} · NTN {CO.ntn}
            </div>
          </div>
        </div>
      </div>
      <div className="modal-f noprint">
        <button className="btn" onClick={closeModal}>Close</button>
        <button className="btn" onClick={() => {
          actions.sendEmail(e.email, `Payslip for ${MONTHS[slip.month - 1]} ${slip.year}`, "Payslip Available");
          closeModal();
        }}>Email to {e.first}</button>
        <button className="btn pri" onClick={() => window.print()}>Download PDF</button>
      </div>
    </div>
  );
}

/* --------------------------------- confirm ---------------------------------- */
export function ConfirmModal({ title, body, label, danger, onConfirm }: {
  title: string; body: string; label: string; danger?: boolean; onConfirm: () => void;
}) {
  const { closeModal } = useStore();
  return (
    <div className="modal" style={{ width: "min(460px,100%)" }} onClick={e => e.stopPropagation()}>
      <div className="modal-h"><div><h3>{title}</h3><p>{body}</p></div></div>
      <div className="modal-f">
        <button className="btn" onClick={closeModal}>Cancel</button>
        <button className={`btn ${danger ? "danger" : "pri"}`} onClick={() => { onConfirm(); closeModal(); }}>{label}</button>
      </div>
    </div>
  );
}
