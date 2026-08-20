"use client";

import React, { createContext, useContext, useMemo, useReducer, useRef, useState, useCallback } from "react";
import { buildCompany, MONTHS, TODAY, makeEmployee, grossOf, payLine } from "./seed";
import { fullName, uid, daysBetween, makeMoney } from "./format";
import type {
  CompanyData, Employee, RoleName, LeaveStatus, EmploymentStatus, TaskStatus, PayrollRun,
} from "./types";

/**
 * The company lives in memory on the client. Every mutation below is the exact
 * operation a server action will perform once DATABASE_URL is set — same inputs,
 * same audit row, same notification. Swapping the data source does not change
 * any component in this app.
 */

interface Ctx {
  data: CompanyData;
  me: Employee & { role: RoleName };
  money: (n: number) => string;
  theme: "light" | "dark";
  toggleTheme: () => void;
  setRole: (role: RoleName) => void;
  toast: (text: string) => void;
  toasts: { id: string; text: string }[];
  modal: React.ReactNode;
  openModal: (node: React.ReactNode) => void;
  closeModal: () => void;
  aiOpen: boolean;
  setAiOpen: (v: boolean) => void;
  actions: Actions;
}

interface Actions {
  decideLeave: (leaveId: string, decision: Extract<LeaveStatus, "Approved" | "Rejected">) => void;
  advancePayroll: (runId: string) => void;
  changeStatus: (employeeId: string, status: EmploymentStatus, reason: string) => void;
  reviseSalary: (employeeId: string, newBasic: number) => void;
  addEmployee: (input: {
    first: string; last: string; deptId: string; desig: string;
    role: RoleName; basic: number; type: Employee["type"]; work: Employee["work"]; email?: string;
  }) => Employee;
  requestLeave: (input: { type: string; from: Date; to: Date; reason: string }) => void;
  moveTask: (taskId: string, status: TaskStatus) => void;
  sendEmail: (to: string, subject: string, template?: string) => void;
  markAllRead: () => void;
  readNotification: (id: string) => void;
  checkIn: () => void;
  setCurrency: (c: "PKR" | "USD") => void;
}

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const ref = useRef<CompanyData | null>(null);
  if (!ref.current) ref.current = buildCompany();
  const data = ref.current;

  const [, bump] = useReducer((x: number) => x + 1, 0);
  const [roleName, setRoleName] = useState<RoleName>("Super Admin");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [toasts, setToasts] = useState<{ id: string; text: string }[]>([]);
  const [modal, setModal] = useState<React.ReactNode>(null);
  const [aiOpen, setAiOpen] = useState(false);

  const me = useMemo(() => {
    const person = data.employees.find(e => e.role === roleName) || data.employees[0];
    return { ...person, role: roleName };
  }, [data.employees, roleName, /* re-derive after mutations */ toasts.length]);

  const money = useMemo(() => makeMoney(data.settings.currency), [data.settings.currency, toasts.length]);

  const toast = useCallback((text: string) => {
    const id = uid("t");
    setToasts(t => [...t, { id, text }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2800);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === "light" ? "dark" : "light";
      document.documentElement.dataset.theme = next;
      return next;
    });
  }, []);

  const log = useCallback((act: string, target: string, detail: string) => {
    data.audit.unshift({
      id: uid("g"), who: fullName(data.employees.find(e => e.role === roleName) || data.employees[0]),
      act, target, at: TODAY, ip: "203.135.44.9", detail,
    });
  }, [data, roleName]);

  const notify = useCallback((text: string, go: string) => {
    data.notifications.unshift({ id: uid("n"), text, at: TODAY, read: false, go });
  }, [data]);

  const actions: Actions = useMemo(() => ({
    decideLeave(leaveId, decision) {
      const l = data.leaves.find(x => x.id === leaveId);
      if (!l) return;
      const e = data.employees.find(x => x.id === l.eid)!;
      l.status = decision;
      l.by = me.id;
      if (decision === "Approved") {
        const bucket = l.type.split(" ")[0].toLowerCase();
        if (e.leave[bucket]) e.leave[bucket].used += daysBetween(l.from, l.to);
      }
      data.emails.unshift({
        id: uid("m"), to: e.email, subject: `Your leave request was ${decision.toLowerCase()}`,
        tpl: `Leave ${decision}`, at: TODAY, status: "Queued",
      });
      notify(`${fullName(e)}'s ${l.type.toLowerCase()} was ${decision.toLowerCase()}`, "/leaves");
      log(`Leave ${decision.toLowerCase()}`, `${fullName(e)} · ${l.type}`, `${daysBetween(l.from, l.to)} days`);
      bump(); toast(`${decision} — ${e.first} has been emailed`);
    },

    advancePayroll(runId) {
      const p = data.payrolls.find(x => x.id === runId);
      if (!p) return;
      const next: Record<string, PayrollRun["status"]> = {
        "Draft": "Processing", "Processing": "Pending Approval",
        "Pending Approval": "Approved", "Approved": "Paid",
      };
      const to = next[p.status];
      if (!to) return;
      p.status = to;
      if (to === "Paid") {
        p.paidAt = TODAY;
        p.items.forEach(it => data.payslips.push({
          id: uid("ps"), runId: p.id, eid: it.eid, month: p.month, year: p.year,
          line: it, paidAt: TODAY, emailed: true,
        }));
        log("Payroll marked paid", `${MONTHS[p.month - 1]} ${p.year} · ${p.items.length} people`,
          `Net ${makeMoney(data.settings.currency)(p.items.reduce((s, i) => s + i.net, 0))}`);
        bump(); toast(`${p.items.length} payslips generated and emailed`);
      } else {
        log("Payroll updated", `${MONTHS[p.month - 1]} ${p.year}`, `Status → ${to}`);
        bump(); toast(`Moved to ${to.toLowerCase()}`);
      }
    },

    changeStatus(employeeId, status, reason) {
      const e = data.employees.find(x => x.id === employeeId);
      if (!e || e.status === status) return;
      e.status = status;
      e.statusMeta = { reason: reason || "No reason given", at: TODAY, by: fullName(me) };
      data.emails.unshift({
        id: uid("m"), to: e.email, subject: "Change to your employment status",
        tpl: status === "Suspended" ? "Suspension Notification"
          : status === "Terminated" ? "Termination Notification" : "Account Updated",
        at: TODAY, status: "Queued",
      });
      notify(`${fullName(e)} is now ${status.toLowerCase()}`, "/employees");
      log(`Employee ${status.toLowerCase()}`, `${fullName(e)} (${e.code})`, `Reason: ${reason}`);
      bump(); toast(`${fullName(e)} is now ${status.toLowerCase()}`);
    },

    reviseSalary(employeeId, newBasic) {
      const e = data.employees.find(x => x.id === employeeId);
      if (!e) return;
      const fmt = makeMoney(data.settings.currency);
      const old = e.salary.basic;
      e.salary.basic = newBasic;
      e.salary.housing = Math.round(newBasic * 0.2);
      e.salary.transport = Math.round(newBasic * 0.08);
      e.salary.medical = Math.round(newBasic * 0.06);
      log("Salary changed", `${fullName(e)} (${e.code})`, `Basic ${fmt(old)} → ${fmt(newBasic)}`);
      bump(); toast("Salary revised — history updated");
    },

    addEmployee(input) {
      const i = data.employees.length + 1;
      const e = makeEmployee(i, `DST-0${i}`, input.first, input.last, input.deptId, input.desig,
        input.role, input.basic, TODAY, input.type, input.work, "Probation", "e1");
      if (input.email) e.email = input.email;
      data.employees.push(e);
      data.emails.unshift({
        id: uid("m"), to: e.email, subject: "Welcome to Divineesoft Technologies",
        tpl: "Welcome Email", at: TODAY, status: "Queued",
      });
      log("Employee created", `${fullName(e)} (${e.code})`, `${e.type} · ${input.deptId}`);
      bump(); toast(`${e.first} added — welcome email queued`);
      return e;
    },

    requestLeave(input) {
      data.leaves.unshift({
        id: uid("l"), eid: me.id, type: input.type, from: input.from, to: input.to,
        reason: input.reason || "—", status: "Pending", at: TODAY, by: null,
      });
      log("Leave requested", `${fullName(me)} · ${input.type}`, `${daysBetween(input.from, input.to)} days`);
      bump(); toast("Request sent to your manager");
    },

    moveTask(taskId, status) {
      const t = data.tasks.find(x => x.id === taskId);
      if (!t || t.status === status) return;
      const from = t.status;
      t.status = status;
      const owner = data.employees.find(e => e.id === t.assignee);
      log("Task updated", t.title, `${from} → ${status}`);
      notify(`“${t.title}” moved to ${status}`, "/tasks");
      bump(); toast(`Moved to ${status} — ${owner?.first} notified`);
    },

    sendEmail(to, subject, template = "Custom") {
      data.emails.unshift({ id: uid("m"), to, subject: subject || "(no subject)", tpl: template, at: TODAY, status: "Queued" });
      log("Email sent", to, template);
      bump(); toast(`Sent from info@divineesoft.com`);
    },

    markAllRead() { data.notifications.forEach(n => { n.read = true; }); bump(); toast("All caught up"); },
    readNotification(id) { const n = data.notifications.find(x => x.id === id); if (n) n.read = true; bump(); },
    checkIn() { log("Attendance recorded", fullName(me), "Check-in 09:04"); bump(); toast("Checked in at 09:04 · Lahore HQ"); },
    setCurrency(c) { data.settings.currency = c; log("Settings updated", "Company settings", `Currency → ${c}`); bump(); toast("Settings saved"); },
  }), [data, me, log, notify, toast]);

  const value: Ctx = {
    data, me, money, theme, toggleTheme,
    setRole: (r) => { setRoleName(r); toast(`Now viewing as ${r}`); },
    toast, toasts,
    modal, openModal: setModal, closeModal: () => setModal(null),
    aiOpen, setAiOpen, actions,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}

/* Convenience selectors used across screens. */
export function useLookups() {
  const { data } = useStore();
  return useMemo(() => ({
    employeeById: (id?: string | null) => data.employees.find(e => e.id === id),
    departmentName: (id?: string | null) => data.departments.find(d => d.id === id)?.name ?? "—",
    projectById: (id?: string | null) => data.projects.find(p => p.id === id),
    gross: grossOf,
    line: payLine,
  }), [data]);
}
