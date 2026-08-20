"use client";
import { Card, PageHead } from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import { useStore } from "@/lib/store";
import { SalaryModal } from "@/components/modals/Modals";
import { payLine, grossOf } from "@/lib/seed";
import { fullName } from "@/lib/format";

export default function SalaryPage() {
  const { data, money, openModal, toast } = useStore();
  return (
    <>
      <PageHead eyebrow="Payroll" title="Salary structures"
        sub="Allowances are percentages of basic, so a raise flows through the whole package."
        actions={<button className="btn" onClick={() => toast("Exporting salary data")}>Export CSV</button>} />
      <Card>
        <div className="tablewrap">
          <table>
            <thead><tr>
              <th>Person</th><th className="right">Basic</th><th className="right hide-sm">House rent</th>
              <th className="right hide-sm">Transport</th><th className="right hide-sm">Medical</th>
              <th className="right">Gross</th><th className="right">Tax</th><th className="right">Net</th><th />
            </tr></thead>
            <tbody>
              {data.employees.map(e => {
                const l = payLine(e);
                return (
                  <tr key={e.id}>
                    <td><div className="who"><Avatar e={e} size="sm" /><div><b>{fullName(e)}</b><span>{e.desig}</span></div></div></td>
                    <td className="right num">{money(l.basic)}</td>
                    <td className="right num hide-sm">{money(l.housing)}</td>
                    <td className="right num hide-sm">{money(l.transport)}</td>
                    <td className="right num hide-sm">{money(l.medical)}</td>
                    <td className="right num"><b>{money(l.gross)}</b></td>
                    <td className="right num" style={{ color: "var(--rose)" }}>−{money(l.tax)}</td>
                    <td className="right num" style={{ color: "var(--jade)" }}><b>{money(l.net)}</b></td>
                    <td><div className="rowact"><button className="btn sm" onClick={() => openModal(<SalaryModal employee={e} />)}>Revise</button></div></td>
                  </tr>
                );
              })}
              <tr style={{ background: "var(--panel-2)" }}>
                <td><b>Company total</b></td>
                <td className="right num"><b>{money(data.employees.reduce((s, e) => s + e.salary.basic, 0))}</b></td>
                <td className="hide-sm" /><td className="hide-sm" /><td className="hide-sm" />
                <td className="right num"><b>{money(data.employees.reduce((s, e) => s + grossOf(e), 0))}</b></td>
                <td />
                <td className="right num"><b>{money(data.employees.reduce((s, e) => s + payLine(e).net, 0))}</b></td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
