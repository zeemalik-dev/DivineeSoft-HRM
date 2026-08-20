"use client";
import { useState } from "react";
import Image from "next/image";
import { Card, CardHead, CardBody, PageHead } from "@/components/ui/Card";
import Pill from "@/components/ui/Pill";
import { useStore } from "@/lib/store";
import { CO } from "@/lib/seed";
import { PERMISSIONS, ROLES } from "@/lib/rbac";

const TABS = [["company", "Company"], ["payroll", "Payroll"], ["leave", "Leave"],
  ["email", "Email"], ["roles", "Roles"], ["security", "Security"]] as const;

export default function SettingsPage() {
  const { data, actions, toast } = useStore();
  const [tab, setTab] = useState<string>("company");
  const s = data.settings;

  return (
    <>
      <PageHead eyebrow="Workspace" title="Settings"
        sub="Configure the company once — payroll, leave and email all read from here." />

      <Card style={{ marginBottom: 16 }}>
        <div className="tabs">
          {TABS.map(([k, l]) => (
            <button key={k} className={`tab ${tab === k ? "on" : ""}`} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>
      </Card>

      {tab === "company" && (
        <Card>
          <CardHead title="Company" sub="Shown on payslips, reports and outgoing email" />
          <CardBody>
            <div className="form">
              <div className="f2">
                <div><label className="lb">Company name</label><input className="in" defaultValue={CO.name} /></div>
                <div><label className="lb">Website</label><input className="in" defaultValue={CO.site} /></div>
              </div>
              <div className="f2">
                <div><label className="lb">Contact email</label><input className="in" defaultValue={CO.email} /></div>
                <div><label className="lb">Phone</label><input className="in num" defaultValue={CO.phone} /></div>
              </div>
              <div><label className="lb">Registered address</label><input className="in" defaultValue={CO.address} /></div>
              <div className="f3">
                <div><label className="lb">Currency</label>
                  <select className="in" value={s.currency} onChange={e => actions.setCurrency(e.target.value as "PKR" | "USD")}>
                    <option>PKR</option><option>USD</option>
                  </select></div>
                <div><label className="lb">Timezone</label><input className="in" defaultValue={s.tz} /></div>
                <div><label className="lb">National tax number</label><input className="in num" defaultValue={CO.ntn} /></div>
              </div>
              <div>
                <label className="lb">Logo</label>
                <div style={{ display: "flex", alignItems: "center", gap: 14, padding: 14, border: "1px dashed var(--line)", borderRadius: 11 }}>
                  <Image src="/logo-mark.png" alt="" width={40} height={43} />
                  <div><b style={{ fontSize: 13 }}>logo-mark.png</b>
                    <div className="mini">Used on payslips and the sign-in screen</div></div>
                  <button className="btn sm" style={{ marginLeft: "auto" }}>Replace</button>
                </div>
              </div>
              <div><button className="btn pri" onClick={() => toast("Settings saved")}>Save changes</button></div>
            </div>
          </CardBody>
        </Card>
      )}

      {tab === "payroll" && (
        <Card>
          <CardHead title="Payroll rules" sub="Applied to every new run" />
          <CardBody><div className="form">
            <div className="f2">
              <div><label className="lb">Cycle</label><select className="in"><option>Monthly</option><option>Bi-weekly</option></select></div>
              <div><label className="lb">Payday</label><select className="in">
                <option>Last working day</option><option>1st of next month</option><option>5th of next month</option></select></div>
            </div>
            <div className="f3">
              <div><label className="lb">House rent (% of basic)</label><input className="in num" defaultValue="20" /></div>
              <div><label className="lb">Transport (% of basic)</label><input className="in num" defaultValue="8" /></div>
              <div><label className="lb">Medical (% of basic)</label><input className="in num" defaultValue="6" /></div>
            </div>
            <div className="f2">
              <div><label className="lb">Default tax rate</label><input className="in num" defaultValue="5%" />
                <div className="hint">Individual rates override this on the salary structure.</div></div>
              <div><label className="lb">Overtime multiplier</label><input className="in num" defaultValue="1.5×" />
                <div className="hint">Hourly rate = basic ÷ 176 working hours.</div></div>
            </div>
            <div><label className="lb">Unpaid leave deduction</label><input className="in" defaultValue="Basic ÷ 26 per day" /></div>
            <div><button className="btn pri" onClick={() => toast("Payroll rules saved")}>Save changes</button></div>
          </div></CardBody>
        </Card>
      )}

      {tab === "leave" && (
        <Card>
          <CardHead title="Leave policy" sub="Balances reset each January"
            action={<button className="btn sm pri" onClick={() => toast("Leave type form opens here")}>Add type</button>} />
          <div className="tablewrap">
            <table>
              <thead><tr><th>Type</th><th className="right">Days per year</th><th>Paid</th>
                <th className="right">Carry forward</th><th>Approval</th><th /></tr></thead>
              <tbody>{data.leaveTypes.map(l => (
                <tr key={l.id}>
                  <td><b>{l.name}</b></td>
                  <td className="right num">{l.days || "—"}</td>
                  <td><Pill value={l.paid ? "Paid" : "Rejected"} tone={l.paid ? "ok" : "bad"} /></td>
                  <td className="right num">{l.carry || "—"}</td>
                  <td className="mini">Manager → HR</td>
                  <td className="right"><button className="btn sm">Edit</button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === "email" && (
        <Card>
          <CardHead title="Outgoing mail" sub="The system sends as your own domain, never a third-party address"
            action={<Pill value="Delivered" tone="ok" />} />
          <CardBody>
            <div className="form">
              <div className="f2">
                <div><label className="lb">SMTP host</label><input className="in num" defaultValue={s.smtp.host} /></div>
                <div><label className="lb">Port</label><input className="in num" defaultValue={s.smtp.port} />
                  <div className="hint">465 for SSL, 587 for STARTTLS.</div></div>
              </div>
              <div className="f2">
                <div><label className="lb">Username</label><input className="in num" defaultValue={s.smtp.user} /></div>
                <div><label className="lb">Password</label><input className="in num" type="password" defaultValue="••••••••••••" />
                  <div className="hint">Encrypted with AES-256 and never returned by the API — even to a Super Admin.</div></div>
              </div>
              <div className="f2">
                <div><label className="lb">Sender name</label><input className="in" defaultValue={s.smtp.from} /></div>
                <div><label className="lb">Sender address</label><input className="in num" defaultValue={s.smtp.fromEmail} /></div>
              </div>
              <div style={{ display: "flex", gap: 9 }}>
                <button className="btn" onClick={() => toast(`Test email sent to ${CO.email}`)}>Send a test email</button>
                <button className="btn pri" onClick={() => toast("SMTP settings saved")}>Save changes</button>
              </div>
            </div>
            <div className="sep" />
            <h3 style={{ fontSize: 14, marginBottom: 10 }}>Templates</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {["Welcome", "Account created", "Password reset", "Leave approved", "Leave rejected",
                "Payroll generated", "Payslip available", "Salary paid", "Project assignment",
                "Task assignment", "Deadline reminder", "Suspension", "Termination", "Announcement"]
                .map(t => <span key={t} className="chip">{t}</span>)}
            </div>
          </CardBody>
        </Card>
      )}

      {tab === "roles" && (
        <Card>
          <CardHead title="Roles & permissions" sub="Switch the role in the top bar to see the sidebar change"
            action={<button className="btn sm pri" onClick={() => toast("Custom role builder opens here")}>Create role</button>} />
          <div className="tablewrap">
            <table>
              <thead><tr><th>Role</th><th>People</th><th>Can reach</th></tr></thead>
              <tbody>{ROLES.map(r => (
                <tr key={r}>
                  <td><b>{r}</b></td>
                  <td className="num">{data.employees.filter(e => e.role === r).length}</td>
                  <td>{PERMISSIONS[r][0] === "*"
                    ? <span className="pill bad"><i />Everything</span>
                    : PERMISSIONS[r].map(p => <span key={p} className="pill mute" style={{ margin: 2 }}>{p}</span>)}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === "security" && (
        <Card>
          <CardHead title="Security" sub="Applies to everyone including Super Admins" />
          <CardBody><div className="form">
            <div className="f3">
              <div><label className="lb">Minimum password length</label><input className="in num" defaultValue={s.security.minLen} /></div>
              <div><label className="lb">Password expiry (days)</label><input className="in num" defaultValue={s.security.expiry} /></div>
              <div><label className="lb">Idle session timeout (min)</label><input className="in num" defaultValue={s.security.session} /></div>
            </div>
            {[["Two-factor authentication", "Required for Super Admin, HR Manager and Finance Manager"],
              ["Suspended accounts", "Sessions are revoked immediately and refresh tokens invalidated"]]
              .map(([t, d]) => (
                <div key={t} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 14, border: "1px solid var(--line)", borderRadius: 11 }}>
                  <div><b style={{ fontSize: 13.5 }}>{t}</b><div className="mini">{d}</div></div>
                  <Pill value="Active" />
                </div>
              ))}
            <div>
              <label className="lb">Recent sign-ins</label>
              <div className="tablewrap" style={{ border: "1px solid var(--line)", borderRadius: 11 }}>
                <table><tbody>
                  {[["Zeeshan Haider", "Chrome · Lahore", "203.135.44.9", "Today 08:41", false],
                    ["Maryam Khan", "Safari · Lahore", "203.135.44.18", "Today 08:12", false],
                    ["Unknown", "Firefox · Karachi", "119.73.98.2", "18 Aug 23:04 · blocked", true]]
                    .map((r, i) => (
                      <tr key={i}>
                        <td><b>{r[0] as string}</b><div className="mini">{r[1] as string}</div></td>
                        <td className="num mini">{r[2] as string}</td>
                        <td className="right mini" style={r[4] ? { color: "var(--rose)" } : undefined}>{r[3] as string}</td>
                      </tr>
                    ))}
                </tbody></table>
              </div>
            </div>
            <div><button className="btn pri" onClick={() => toast("Security settings saved")}>Save changes</button></div>
          </div></CardBody>
        </Card>
      )}
    </>
  );
}
