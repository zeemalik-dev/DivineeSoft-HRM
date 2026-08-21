"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Card, PageHead, Empty } from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import Pill from "@/components/ui/Pill";
import Icon from "@/components/ui/Icon";
import { useStore, useLookups } from "@/lib/store";
import { NewEmployeeModal, StatusModal } from "@/components/modals/Modals";
import { fullName, fmtDate } from "@/lib/format";
import { grossOf } from "@/lib/seed";

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url);
}

function EmployeesInner() {
  const { data, money, openModal, toast } = useStore();
  const { departmentName } = useLookups();
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");
  const [dept, setDept] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");

  const rows = data.employees.filter(e => {
    const hay = `${fullName(e)} ${e.code} ${e.email} ${e.desig}`.toLowerCase();
    return (!q || hay.includes(q.toLowerCase()))
      && (!dept || e.deptId === dept)
      && (!status || e.status === status)
      && (!type || e.type === type);
  });

  return (
    <>
      <PageHead eyebrow="HR management" title="People"
        sub={`${data.employees.length} on the books · ${data.employees.filter(e => e.status === "Active").length} active · ${data.employees.filter(e => e.type !== "Full Time").length} on non-permanent contracts`}
        actions={<>
          <button className="btn" onClick={() => {
            downloadCsv("divineesoft-employees.csv", [
              ["Name", "Employee ID", "Email", "Department", "Designation", "Contract", "Status", "Monthly Gross"],
              ...rows.map(e => [fullName(e), e.code, e.email, departmentName(e.deptId), e.desig, e.type, e.status, String(grossOf(e))]),
            ]);
            toast(`${rows.length} employees exported`);
          }}>Export CSV</button>
          <button className="btn pri" onClick={() => openModal(<NewEmployeeModal />)}>Add person</button>
        </>} />

      <Card>
        <div className="toolbar">
          <input className="field" style={{ minWidth: 230 }} placeholder="Search name, ID, role…"
            value={q} onChange={e => setQ(e.target.value)} />
          <select className="field" value={dept} onChange={e => setDept(e.target.value)}>
            <option value="">All departments</option>
            {data.departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select className="field" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">Any status</option>
            {["Active", "On Leave", "Probation", "Suspended", "Terminated"].map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="field" value={type} onChange={e => setType(e.target.value)}>
            <option value="">Any contract</option>
            {["Full Time", "Part Time", "Contract", "Internship", "Freelance"].map(s => <option key={s}>{s}</option>)}
          </select>
          <span className="mini" style={{ marginLeft: "auto" }}>{rows.length} of {data.employees.length}</span>
        </div>

        {rows.length ? (
          <>
            <div className="tablewrap">
              <table>
                <thead><tr>
                  <th>Person</th><th>ID</th><th>Department</th><th className="hide-sm">Contract</th>
                  <th className="hide-sm">Joined</th><th>Status</th><th className="right">Monthly gross</th><th />
                </tr></thead>
                <tbody>
                  {rows.map(e => (
                    <tr key={e.id} style={{ cursor: "pointer" }} onClick={() => router.push(`/employees/${e.id}`)}>
                      <td><div className="who"><Avatar e={e} /><div><b>{fullName(e)}</b><span>{e.desig}</span></div></div></td>
                      <td className="num">{e.code}</td>
                      <td>{departmentName(e.deptId)}</td>
                      <td className="hide-sm">{e.type}<div className="mini">{e.work}</div></td>
                      <td className="hide-sm num">{fmtDate(e.joined)}</td>
                      <td><Pill value={e.status} /></td>
                      <td className="right num">{money(grossOf(e))}</td>
                      <td onClick={ev => ev.stopPropagation()}>
                        <div className="rowact">
                          <button className="btn sm" onClick={() => router.push(`/employees/${e.id}`)}>View</button>
                          {e.status !== "Terminated" && (
                            <button className="btn sm danger" onClick={() => openModal(<StatusModal employee={e} />)}>Change status</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pager"><span>Showing {rows.length} people</span>
              <span className="mini">Rows update live as you filter</span></div>
          </>
        ) : (
          <Empty icon={<Icon name="people" size={34} />} title="No one matches those filters"
            body="Clear a filter or add the person you're looking for." />
        )}
      </Card>
    </>
  );
}

export default function EmployeesPage() {
  return <Suspense fallback={<div className="mini">Loading…</div>}><EmployeesInner /></Suspense>;
}
