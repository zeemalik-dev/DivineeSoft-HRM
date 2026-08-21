"use client";
import { useState } from "react";
import { Card, CardHead, CardBody, PageHead, Empty } from "@/components/ui/Card";
import { BarChart, Donut } from "@/components/charts/Charts";
import Avatar from "@/components/ui/Avatar";
import Pill from "@/components/ui/Pill";
import Icon from "@/components/ui/Icon";
import { useStore, useLookups } from "@/lib/store";
import { fullName } from "@/lib/format";
import { TODAY } from "@/lib/seed";

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url);
}

export default function AttendancePage() {
  const { data, actions, toast } = useStore();
  const { employeeById, departmentName } = useLookups();
  const [day, setDay] = useState(iso(TODAY));
  const [dept, setDept] = useState("");

  const rows = data.employees
    .filter(e => !dept || e.deptId === dept)
    .map(e => ({ employee: e, attendance: data.attendance.find(a => a.eid === e.id && iso(a.date) === day) }))
    .filter(row => row.employee.status !== "Terminated");

  const trend = Array.from({ length: 10 }, (_, i) => {
    const d = new Date(2026, 7, i + 8);
    const set = data.attendance.filter(a => +a.date === +d);
    return { l: String(i + 8), v: set.filter(a => a.status !== "Absent" && a.status !== "On Leave").length,
      c: d.getDay() % 6 === 0 ? "var(--slate-bg)" : "var(--brand)" };
  });

  const total = data.attendance.length;
  const late = data.attendance.filter(a => a.status === "Late").length;
  const absent = data.attendance.filter(a => a.status === "Absent").length;

  return (
    <>
      <PageHead eyebrow="HR management" title="Attendance"
        sub="Manual check-in today. The record shape already fits biometric and mobile clock-in feeds."
        actions={<>
          <button className="btn" onClick={() => {
            downloadCsv(`attendance-${day}.csv`, [
              ["Date", "Name", "Employee ID", "Department", "Check in", "Check out", "Hours", "Status"],
              ...rows.map(({ employee, attendance }) => [day, fullName(employee), employee.code, departmentName(employee.deptId), attendance?.in || "", attendance?.out || "", String(attendance?.hours || 0), attendance?.status || "Unmarked"]),
            ]);
            toast(`${rows.length} attendance rows exported`);
          }}>Export CSV</button>
          <button className="btn pri" onClick={() => actions.checkIn()}>Check in now</button>
        </>} />

      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", marginBottom: 16 }}>
        <Card>
          <CardHead title="Daily turnout" sub="8–19 August, people who clocked in" />
          <CardBody><BarChart data={trend} height={150} /></CardBody>
        </Card>
        <Card>
          <CardHead title="Punctuality this month" sub="Late = arrival after 09:15" />
          <CardBody style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <Donut size={150} thick={18}
              data={[{ l: "On time", v: total - late - absent, c: "var(--jade)" },
                     { l: "Late", v: late, c: "var(--amber)" },
                     { l: "Absent", v: absent, c: "var(--rose)" }]}
              center={[`${Math.round(((total - late - absent) / total) * 100)}%`, "ON TIME"]} />
            <div className="legend" style={{ flexDirection: "column", gap: 9 }}>
              <span><i style={{ background: "var(--jade)" }} />On time <b className="num">{total - late - absent}</b></span>
              <span><i style={{ background: "var(--amber)" }} />Late <b className="num">{late}</b></span>
              <span><i style={{ background: "var(--rose)" }} />Absent <b className="num">{absent}</b></span>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <div className="toolbar">
          <input type="date" className="field" value={day} onChange={e => setDay(e.target.value)} />
          <select className="field" value={dept} onChange={e => setDept(e.target.value)}>
            <option value="">All departments</option>
            {data.departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <span className="mini" style={{ marginLeft: "auto" }}>
            {rows.filter(r => r.attendance?.status && r.attendance.status !== "Absent").length} clocked in · {rows.filter(r => !r.attendance || r.attendance.status === "Absent").length} missing
          </span>
        </div>
        {rows.length ? (
          <div className="tablewrap">
            <table>
              <thead><tr><th>Person</th><th>Department</th><th>Check in</th><th>Check out</th>
                <th>Hours</th><th>Overtime</th><th>Status</th></tr></thead>
              <tbody>
                {rows.map(({ employee: e, attendance: a }) => {
                  return (
                    <tr key={e.id}>
                      <td><div className="who"><Avatar e={e} size="sm" /><div><b>{fullName(e)}</b></div></div></td>
                      <td>{departmentName(e.deptId)}</td>
                      <td className="num">{a?.in || "—"}</td><td className="num">{a?.out || "—"}</td>
                      <td className="num">{a?.hours || "—"}</td>
                      <td className="num">{a?.overtime ? a.overtime + "h" : "—"}</td>
                      <td>
                        <select className="field" value={a?.status || "Absent"}
                          onChange={event => actions.markAttendance(e.id, new Date(`${day}T00:00:00`), event.target.value as "Present" | "Late" | "Absent" | "On Leave")}>
                          {(["Present", "Late", "Absent", "On Leave"] as const).map(status => <option key={status}>{status}</option>)}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : <Empty icon={<Icon name="clock" size={34} />} title="Nothing recorded for that day"
          body="Weekends and public holidays stay empty by design." />}
      </Card>
    </>
  );
}
