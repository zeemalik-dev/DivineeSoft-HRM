"use client";
import { Card, CardHead, CardBody, PageHead } from "@/components/ui/Card";
import { AreaChart, BarChart } from "@/components/charts/Charts";
import Pill from "@/components/ui/Pill";
import { useStore } from "@/lib/store";
import { grossOf } from "@/lib/seed";
import { daysBetween } from "@/lib/format";

export default function ReportsPage() {
  const { data, money, toast } = useStore();

  const payrollBars = [
    { l: "Mar", v: 2.31 }, { l: "Apr", v: 2.38 }, { l: "May", v: 2.52 },
    { l: "Jun", v: 2.64 }, { l: "Jul", v: 2.79 }, { l: "Aug", v: 2.86, c: "var(--violet)" },
  ];

  return (
    <>
      <PageHead eyebrow="Insight" title="Reports"
        sub="Every table below exports to CSV, Excel or PDF with the filters you have applied."
        actions={<>
          <button className="btn" onClick={() => toast("Exporting CSV")}>Export CSV</button>
          <button className="btn pri" onClick={() => toast("Building PDF")}>Export PDF</button>
        </>} />

      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", marginBottom: 16 }}>
        <Card>
          <CardHead title="Monthly payroll cost" sub="Net disbursed, millions ₨"
            action={<Pill value="Medium" tone="warn" />} />
          <CardBody><BarChart data={payrollBars} /></CardBody>
        </Card>
        <Card>
          <CardHead title="Leave days taken" sub="Rolling 12 months" />
          <CardBody><AreaChart points={[6, 9, 7, 12, 8, 14, 11, 9, 13, 7, 10, 8]}
            labels={["S", "O", "N", "D", "J", "F", "M", "A", "M", "J", "J", "A"]} /></CardBody>
        </Card>
      </div>

      <Card>
        <CardHead title="Department scorecard" sub="Cost, utilisation and delivery in one place" />
        <div className="tablewrap">
          <table>
            <thead><tr><th>Department</th><th className="right">People</th><th className="right">Monthly cost</th>
              <th className="right">Avg salary</th><th className="right">Leave days</th>
              <th className="right">Attendance</th><th className="right">Open tasks</th></tr></thead>
            <tbody>
              {data.departments.map(d => {
                const people = data.employees.filter(e => e.deptId === d.id);
                const cost = people.reduce((s, e) => s + grossOf(e), 0);
                const leaveDays = data.leaves
                  .filter(l => people.some(p => p.id === l.eid) && l.status === "Approved")
                  .reduce((s, l) => s + daysBetween(l.from, l.to), 0);
                const att = data.attendance.filter(a => people.some(p => p.id === a.eid));
                const rate = att.length ? Math.round((att.filter(a => a.status !== "Absent").length / att.length) * 100) : 100;
                return (
                  <tr key={d.id}>
                    <td><b>{d.name}</b><div className="mini num">{d.code}</div></td>
                    <td className="right num">{people.length}</td>
                    <td className="right num">{money(cost)}</td>
                    <td className="right num">{money(cost / (people.length || 1))}</td>
                    <td className="right num">{leaveDays}</td>
                    <td className="right num" style={{ color: rate < 92 ? "var(--amber)" : "var(--jade)" }}>{rate}%</td>
                    <td className="right num">{data.tasks.filter(t => people.some(p => p.id === t.assignee) && t.status !== "Completed").length}</td>
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
