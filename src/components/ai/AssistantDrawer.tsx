"use client";
import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/Icon";
import { useStore } from "@/lib/store";
import { fullName, fmtDate, daysBetween } from "@/lib/format";
import { MONTHS, TODAY, grossOf } from "@/lib/seed";

const SUGGESTIONS = [
  "Who is off this week?",
  "Is the August payroll ready?",
  "Which projects are behind?",
  "Explain the overtime rule",
];

export default function AssistantDrawer() {
  const { aiOpen, setAiOpen, data, me, money } = useStore();
  const [log, setLog] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log, busy]);

  if (!aiOpen) return null;

  const buildContext = () => {
    const run = data.payrolls.find(p => p.month === 8)!;
    const visible = me.role === "Employee"
      ? data.employees.filter(e => e.id === me.id)
      : data.employees;
    return [
      `TODAY: 19 August 2026. Company: Divineesoft Technologies, Lahore. Currency ${data.settings.currency}.`,
      `Signed in as ${fullName(me)} (${me.role}).`,
      `HEADCOUNT ${visible.length}: ` + visible.map(e =>
        `${fullName(e)} [${e.code}] ${e.desig}, ${data.departments.find(d => d.id === e.deptId)?.name}, ${e.type}, ${e.status}, gross ${grossOf(e)}, joined ${fmtDate(e.joined)}`).join(" | "),
      `LEAVE: ` + data.leaves.map(l =>
        `${fullName(data.employees.find(e => e.id === l.eid))} ${l.type} ${fmtDate(l.from)}–${fmtDate(l.to)} ${l.status}`).join(" | "),
      `PAYROLL: August run is ${run.status}, ${run.items.length} people, gross ${run.items.reduce((s, i) => s + i.gross, 0)}, net ${run.items.reduce((s, i) => s + i.net, 0)}. June and July are Paid.`,
      `PROJECTS: ` + data.projects.map(p =>
        `${p.name} (${p.client}) ${p.status} ${p.progress}% due ${fmtDate(p.due)} budget ${p.budget} spent ${p.spent}`).join(" | "),
      `TASKS: ` + data.tasks.map(t =>
        `${t.title} → ${fullName(data.employees.find(e => e.id === t.assignee))} ${t.status} due ${fmtDate(t.due)}`).join(" | "),
      `ATTENDANCE: ${data.attendance.length} records this month, ${data.attendance.filter(a => a.status === "Late").length} late, ${data.attendance.filter(a => a.status === "Absent").length} absent.`,
    ].join("\n");
  };

  /** Used when no API key is configured, or the call fails. */
  const localAnswer = (q: string) => {
    const s = q.toLowerCase();
    if (s.includes("off") || s.includes("leave")) {
      const running = data.leaves.filter(l => l.status === "Approved" && l.to >= TODAY);
      const pending = data.leaves.filter(l => l.status === "Pending");
      return `Approved and still running: ${running.map(l =>
        `${fullName(data.employees.find(e => e.id === l.eid))} (${l.type}, to ${fmtDate(l.to)})`).join("; ") || "nobody"}.\n` +
        `${pending.length} requests are waiting — ${pending.map(l => fullName(data.employees.find(e => e.id === l.eid))).join(", ")}. Open Leave requests to decide.`;
    }
    if (s.includes("payroll") || s.includes("pay")) {
      const r = data.payrolls.find(p => p.month === 8)!;
      return `The August run is a ${r.status} covering ${r.items.length} people. Gross ${money(r.items.reduce((a, i) => a + i.gross, 0))}, net ${money(r.items.reduce((a, i) => a + i.net, 0))}. It moves through Processing, Pending Approval and Approved before you can mark it paid — payday is 31 August.`;
    }
    if (s.includes("behind") || s.includes("project") || s.includes("late")) {
      const late = data.projects.filter(p => p.status !== "Completed" && p.due < TODAY);
      const risk = data.projects.filter(p => p.status === "Active" && p.spent / p.budget > p.progress / 100);
      return `Past deadline: ${late.map(p => p.name).join(", ") || "none"}.\nBurning budget faster than progress: ${risk.map(p => `${p.name} (${Math.round(p.spent / p.budget * 100)}% spent, ${p.progress}% done)`).join("; ") || "none"}.`;
    }
    if (s.includes("overtime")) {
      return "Overtime pays 1.5× the hourly rate, where hourly = basic ÷ 176. It is calculated from approved attendance and added to the payroll run automatically — you never enter it by hand.";
    }
    return "I answered from the data on screen because the model was not reachable. Try asking about leave, the August payroll, attendance, or project status.";
  };

  const ask = async (text: string) => {
    const q = text.trim();
    if (!q || busy) return;
    const next = [...log, { role: "user" as const, content: q }];
    setLog(next); setInput(""); setBusy(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next, context: buildContext() }),
      });
      const json = await res.json();
      setLog([...next, { role: "assistant", content: json.text || localAnswer(q) }]);
    } catch {
      setLog([...next, { role: "assistant", content: localAnswer(q) }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="scrim" style={{ placeItems: "stretch", padding: 0 }}
      onClick={e => { if (e.target === e.currentTarget) setAiOpen(false); }}>
      <aside className="ai">
        <div className="ai-h">
          <div className="ai-orb"><Icon name="sparkle" size={17} style={{ color: "#fff", strokeWidth: 2 } as React.CSSProperties} /></div>
          <div style={{ flex: 1 }}>
            <b style={{ fontSize: 14, fontWeight: 600 }}>Divineesoft HR assistant</b>
            <div className="mini">Always on · reads live company data</div>
          </div>
          <button className="iconbtn" onClick={() => setAiOpen(false)} aria-label="Close"><Icon name="close" /></button>
        </div>

        <div className="ai-log" ref={logRef}>
          {log.length === 0 && (
            <div className="msg a">Hello {me.first} — I can see today&apos;s attendance, the August payroll,
              every leave request and all six projects. What do you need?</div>
          )}
          {log.map((m, i) => (
            <div key={i} className={`msg ${m.role === "user" ? "u" : "a"}`}>{m.content}</div>
          ))}
          {busy && <div className="msg a typing"><i /><i /><i /></div>}
        </div>

        <div className="ai-sug">
          {SUGGESTIONS.map(s => (
            <button key={s} className="chip" onClick={() => ask(s)}>{s}</button>
          ))}
        </div>

        <form className="ai-f" onSubmit={e => { e.preventDefault(); ask(input); }}>
          <input value={input} onChange={e => setInput(e.target.value)} autoComplete="off"
            placeholder="Ask about people, pay or projects…" />
          <button className="btn pri" type="submit" disabled={busy}>Send</button>
        </form>
      </aside>
    </div>
  );
}
