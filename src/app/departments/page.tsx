"use client";
import { Card, CardBody, PageHead, Bar } from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import { useStore, useLookups } from "@/lib/store";
import { AV, grossOf } from "@/lib/seed";
import { fullName, initials } from "@/lib/format";

export default function DepartmentsPage() {
  const { data, money, toast } = useStore();
  const { employeeById } = useLookups();

  return (
    <>
      <PageHead eyebrow="HR management" title="Departments"
        sub="Seven teams, each with a head who approves leave for their people."
        actions={<button className="btn pri" onClick={() => toast("Department form opens here")}>Add department</button>} />

      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(290px,1fr))" }}>
        {data.departments.map((d, i) => {
          const people = data.employees.filter(e => e.deptId === d.id);
          const cost = people.reduce((s, e) => s + grossOf(e), 0);
          return (
            <Card key={d.id}>
              <CardBody>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div className="eyebrow" style={{ color: AV[i % AV.length] }}>{d.code}</div>
                    <h3 style={{ fontSize: 16 }}>{d.name}</h3>
                  </div>
                  <div className="avatar" style={{ background: AV[i % AV.length] }}>{d.code.slice(0, 2)}</div>
                </div>
                <div className="sep" />
                <div className="who" style={{ marginBottom: 12 }}>
                  <Avatar e={employeeById(d.head)} size="sm" />
                  <div><b>{fullName(employeeById(d.head))}</b><span>Department head</span></div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div><div className="mini">People</div><div className="num" style={{ fontSize: 19, fontWeight: 600 }}>{people.length}</div></div>
                  <div><div className="mini">Monthly cost</div><div className="num" style={{ fontSize: 19, fontWeight: 600 }}>{money(cost)}</div></div>
                </div>
                <div style={{ marginTop: 12 }}>
                  <div className="mini">Budget used {Math.round((cost / d.budget) * 100)}%</div>
                  <Bar pct={(cost / d.budget) * 100} color={cost > d.budget ? "var(--rose)" : undefined} />
                </div>
                <div style={{ display: "flex", marginTop: 14 }}>
                  {people.slice(0, 6).map((p, k) => (
                    <div key={p.id} className="avatar sm"
                      style={{ background: p.color, marginLeft: k ? -7 : 0, border: "2px solid var(--panel)" }}>{initials(p)}</div>
                  ))}
                  {people.length > 6 && (
                    <div className="avatar sm" style={{ background: "var(--slate-bg)", color: "var(--muted)", marginLeft: -7, border: "2px solid var(--panel)" }}>
                      +{people.length - 6}</div>
                  )}
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </>
  );
}
