"use client";
import { useState } from "react";
import { Card, PageHead } from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import Pill from "@/components/ui/Pill";
import { useStore, useLookups } from "@/lib/store";
import { fmtDate } from "@/lib/format";
import { TASK_STATUSES, TODAY } from "@/lib/seed";
import type { TaskStatus } from "@/lib/types";

export default function TasksPage() {
  const { data, me, actions, toast } = useStore();
  const { employeeById, projectById } = useLookups();
  const [pid, setPid] = useState("");
  const [mine, setMine] = useState(false);
  const [dragOver, setDragOver] = useState<string | null>(null);

  const list = data.tasks
    .filter(t => !pid || t.pid === pid)
    .filter(t => !mine || t.assignee === me.id);

  return (
    <>
      <PageHead eyebrow="Delivery" title="Task board"
        sub="Drag a card to move it. Every move is logged and the owner is notified."
        actions={<button className="btn pri" onClick={() => toast("Task form opens here")}>New task</button>} />

      <Card style={{ marginBottom: 16 }}>
        <div className="toolbar">
          <select className="field" value={pid} onChange={e => setPid(e.target.value)}>
            <option value="">All projects</option>
            {data.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <button className={`btn sm ${mine ? "pri" : ""}`} onClick={() => setMine(v => !v)}>Only mine</button>
          <span className="mini" style={{ marginLeft: "auto" }}>
            {list.length} tasks · {list.filter(t => t.due < TODAY && t.status !== "Completed").length} overdue
          </span>
        </div>
      </Card>

      <div className="board">
        {TASK_STATUSES.map(status => (
          <div key={status}
            className={`col ${dragOver === status ? "over" : ""}`}
            onDragOver={e => { e.preventDefault(); setDragOver(status); }}
            onDragLeave={() => setDragOver(null)}
            onDrop={e => {
              e.preventDefault(); setDragOver(null);
              const id = e.dataTransfer.getData("text");
              if (id) actions.moveTask(id, status as TaskStatus);
            }}>
            <div className="col-h">
              <span>{status}</span>
              <span className="n num">{list.filter(t => t.status === status).length}</span>
            </div>
            {list.filter(t => t.status === status).map(t => {
              const e = employeeById(t.assignee);
              if (!e) return null;
              const late = t.due < TODAY && t.status !== "Completed";
              return (
                <div key={t.id} className="tcard" draggable
                  onDragStart={ev => ev.dataTransfer.setData("text", t.id)}>
                  <div className="mini num" style={{ marginBottom: 5 }}>{projectById(t.pid)?.code}</div>
                  <h4>{t.title}</h4>
                  <Pill value={t.priority} />
                  <div className="meta">
                    <div className="who"><Avatar e={e} size="sm" /><span className="mini">{e.first}</span></div>
                    <span className="mini num" style={late ? { color: "var(--rose)", fontWeight: 600 } : undefined}>
                      {fmtDate(t.due).slice(0, 6)}</span>
                  </div>
                  {t.comments.length > 0 && (
                    <div className="mini" style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--line)" }}>
                      💬 {t.comments[0].text}
                    </div>
                  )}
                </div>
              );
            })}
            {list.filter(t => t.status === status).length === 0 && (
              <div className="mini" style={{ padding: "12px 4px", color: "var(--faint)" }}>Nothing here</div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
