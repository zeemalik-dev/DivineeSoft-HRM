"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Icon from "@/components/ui/Icon";
import Avatar from "@/components/ui/Avatar";
import { useStore } from "@/lib/store";
import { can } from "@/lib/rbac";
import { fullName } from "@/lib/format";

const NAV: { group: string | null; items: [string, string, string][] }[] = [
  { group: null, items: [["/", "Dashboard", "dashboard"]] },
  { group: "HR management", items: [
    ["/employees", "People", "people"], ["/departments", "Departments", "building"],
    ["/attendance", "Attendance", "clock"], ["/leaves", "Leave requests", "calendar"],
    ["/documents", "Documents", "doc"]] },
  { group: "Payroll", items: [
    ["/salary", "Salary structures", "coins"], ["/payroll", "Payroll runs", "wallet"],
    ["/payslips", "Payslips", "receipt"]] },
  { group: "Delivery", items: [["/projects", "Projects", "folder"], ["/tasks", "Task board", "check"]] },
  { group: "Communication", items: [
    ["/announcements", "Announcements", "mega"], ["/email", "Email history", "mail"],
    ["/notifications", "Notifications", "bell"]] },
  { group: "Insight", items: [["/reports", "Reports", "chart"], ["/audit", "Audit log", "shield"]] },
  { group: "Workspace", items: [["/portal", "My workspace", "user"], ["/settings", "Settings", "gear"]] },
];

const SCREEN: Record<string, string> = {
  "/": "dashboard", "/employees": "employees", "/departments": "departments",
  "/attendance": "attendance", "/leaves": "leaves", "/documents": "documents",
  "/salary": "salary", "/payroll": "payroll", "/payslips": "payslips",
  "/projects": "projects", "/tasks": "tasks", "/announcements": "announcements",
  "/email": "email", "/notifications": "notifications", "/reports": "reports",
  "/audit": "audit", "/portal": "portal", "/settings": "settings",
};

export default function Sidebar({ open, onNavigate }: { open: boolean; onNavigate: () => void }) {
  const path = usePathname();
  const { me, data, toast } = useStore();
  const pending = data.leaves.filter(l => l.status === "Pending").length;

  return (
    <aside className={`rail ${open ? "open" : ""}`}>
      <div className="brandbar">
        <Image src="/logo-mark.png" alt="Divineesoft" width={34} height={37} priority />
        <div className="wm"><b>DIVINEESOFT</b><span>Technologies</span></div>
      </div>

      <nav className="nav">
        {NAV.map((g, gi) => {
          const items = g.items.filter(([href]) =>
            me.role === "Employee" ? ["/portal", "/notifications"].includes(href) : true);
          if (!items.length) return null;
          return (
            <div key={gi}>
              {g.group && <div className="navgrp">{g.group}</div>}
              {items.map(([href, label, icon]) => {
                const active = href === "/" ? path === "/" : path.startsWith(href);
                const locked = !can(me.role, SCREEN[href]);
                return (
                  <Link key={href} href={href} onClick={onNavigate}
                    className={`navitem ${active ? "on" : ""}`}
                    style={locked ? { opacity: 0.42 } : undefined}
                    title={locked ? "Your role cannot open this" : undefined}>
                    <Icon name={icon} />
                    <span>{label}</span>
                    {href === "/leaves" && pending > 0 && <span className="tag">{pending}</span>}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div className="railfoot">
        <div className="who">
          <Avatar e={me} />
          <div style={{ minWidth: 0 }}>
            <b>{fullName(me)}</b>
            <span>{me.role}</span>
          </div>
          <button className="iconbtn hide-sm" style={{ marginLeft: "auto", width: 32, height: 32 }}
            title="Sign out" onClick={() => toast("Signed out — session token revoked")}>
            <Icon name="logout" size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
