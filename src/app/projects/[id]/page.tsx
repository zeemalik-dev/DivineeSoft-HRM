"use client";
import { use } from "react";
import Link from "next/link";
import { Card, CardHead, CardBody, PageHead, Stat, Empty } from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import Pill from "@/components/ui/Pill";
import { useStore, useLookups } from "@/lib/store";
import { fullName, fmtDate, short } from "@/lib/format";
import { TODAY } from "@/lib/seed";

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data } = useStore();
  const { employeeById } = useLookups();

  const p = data.projects.find(x => x.id === id);
  if (!p) return <Empty title="Project not found" body="It may have been archived." />;
  const projectTasks = data.tasks.filter(t => t.pid === p.id);

  return (
    <>
      <Link className="btn sm" href="/projects" style={{ marginBottom: 14 }}>← All projects</Link>
      <PageHead eyebrow={`${p.code} · ${p.client}`} title={p.name} sub={p.desc}
        actions={<><Pill value={p.status} /><Pill value={p.priority} /></>} />

      <div className="stats" style={{ marginBottom: 16 }}>
        <Stat label="Progress" value={`${p.progress}%`} foot="Weighted by completed tasks" />
        <Stat label="Budget" value={short(p.budget)} foot={`${Math.round((p.spent / p.budget) * 100)}% consumed`} />
        <Stat label="Deadline" value={fmtDate(p.due).slice(0, 6)} foot={p.due < TODAY ? "Past due" : "On the calendar"} />
        <Stat label="Team" value={p.team.length} foot={`Led by ${fullName(employeeById(p.pm))}`} />
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1.4fr 1fr" }}>
        <Card>
          <CardHead title="Tasks" sub={`${projectTasks.filter(t => t.status === "Completed").length} of ${projectTasks.length} done`}
            action={<Link className="btn sm" href="/tasks">Open board</Link>} />
          <div className="tablewrap">
            <table>
              <thead><tr><th>Task</th><th>Owner</th><th>Due</th><th>Status</th></tr></thead>
              <tbody>
                {projectTasks.length ? projectTasks.map(t => (
                  <tr key={t.id}>
                    <td><b>{t.title}</b><div className="mini"><Pill value={t.priority} /></div></td>
                    <td><div className="who"><Avatar e={employeeById(t.assignee)} size="sm" />
                      <div><b>{fullName(employeeById(t.assignee))}</b></div></div></td>
                    <td className="num">{fmtDate(t.due)}</td>
                    <td><Pill value={t.status} /></td>
                  </tr>
                )) : <tr><td colSpan={4} className="mini">No tasks yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHead title="Team" />
          <CardBody>
            <div className="who" style={{ marginBottom: 14 }}>
              <Avatar e={employeeById(p.pm)} />
              <div><b>{fullName(employeeById(p.pm))}</b><span>Project manager</span></div>
            </div>
            <div className="sep" />
            {p.team.map(mid => {
              const e = employeeById(mid)!;
              return (
                <div className="who" key={mid} style={{ marginBottom: 11 }}>
                  <Avatar e={e} size="sm" />
                  <div><b>{fullName(e)}</b><span>{e.desig}</span></div>
                  <span className="mini" style={{ marginLeft: "auto" }}>
                    {data.tasks.filter(t => t.pid === p.id && t.assignee === mid && t.status !== "Completed").length} open
                  </span>
                </div>
              );
            })}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
