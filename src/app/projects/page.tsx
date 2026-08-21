"use client";
import { useRouter } from "next/navigation";
import { Card, CardBody, PageHead, Bar } from "@/components/ui/Card";
import Pill from "@/components/ui/Pill";
import { useStore } from "@/lib/store";
import { fmtDate, short, initials } from "@/lib/format";
import { TODAY } from "@/lib/seed";

export default function ProjectsPage() {
  const { data, money, toast } = useStore();
  const router = useRouter();

  return (
    <>
      <PageHead eyebrow="Delivery" title="Projects"
        sub={`${data.projects.filter(p => p.status === "Active").length} active builds · ${money(data.projects.reduce((s, p) => s + p.budget, 0))} contracted`}
        actions={<button className="btn pri" onClick={() => toast("Project form opens here")}>New project</button>} />

      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(330px,1fr))" }}>
        {data.projects.map(p => {
          const late = p.status !== "Completed" && p.due < TODAY;
          const projectTasks = data.tasks.filter(t => t.pid === p.id);
          return (
            <Card key={p.id} style={{ cursor: "pointer" }} onClick={() => router.push(`/projects/${p.id}`)}>
              <CardBody>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
                  <div>
                    <div className="eyebrow num">{p.code}</div>
                    <h3 style={{ fontSize: 16, marginTop: 2 }}>{p.name}</h3>
                    <div className="mini">{p.client}</div>
                  </div>
                  <Pill value={p.status} />
                </div>
                <p className="mini" style={{ margin: "12px 0 14px", minHeight: 34 }}>{p.desc}</p>
                <Bar pct={p.progress} color={late ? "var(--rose)" : undefined} />
                <div className="mini" style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                  <span className="num">{p.progress}% complete</span>
                  <span className="num" style={late ? { color: "var(--rose)" } : undefined}>
                    {late ? "Overdue · " : "Due "}{fmtDate(p.due)}</span>
                </div>
                <div className="sep" />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                  <div><div className="mini">Budget used</div>
                    <div className="num" style={{ fontWeight: 600 }}>{Math.round((p.spent / p.budget) * 100)}% <span className="mini">of {short(p.budget)}</span></div></div>
                  <div><div className="mini">Open tasks</div>
                    <div className="num" style={{ fontWeight: 600 }}>{projectTasks.filter(t => t.status !== "Completed").length} of {projectTasks.length}</div></div>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex" }}>
                    {p.team.slice(0, 5).map((id, k) => {
                      const e = data.employees.find(x => x.id === id);
                      if (!e) return null;
                      return <div key={id} className="avatar sm"
                        style={{ background: e.color, marginLeft: k ? -7 : 0, border: "2px solid var(--panel)" }}>{initials(e)}</div>;
                    })}
                  </div>
                  <Pill value={p.priority} />
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </>
  );
}
