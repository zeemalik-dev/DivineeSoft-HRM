import type { RoleName } from "./types";

/** Which screens each role may reach. "*" means everything.
 *  The server must repeat these checks — this copy only shapes the UI. */
export const PERMISSIONS: Record<RoleName, string[]> = {
  "Super Admin": ["*"],
  "HR Manager": ["dashboard", "employees", "departments", "attendance", "leaves",
    "documents", "announcements", "email", "notifications", "reports", "audit", "portal", "settings"],
  "Finance Manager": ["dashboard", "employees", "salary", "payroll", "payslips",
    "reports", "notifications", "portal", "settings"],
  "Project Manager": ["dashboard", "employees", "projects", "tasks", "reports",
    "notifications", "portal", "settings"],
  "Team Lead": ["dashboard", "employees", "attendance", "projects", "tasks",
    "notifications", "portal"],
  "Employee": ["portal", "notifications"],
};

export const ROLES = Object.keys(PERMISSIONS) as RoleName[];

export function can(role: RoleName, screen: string): boolean {
  const list = PERMISSIONS[role] || [];
  return list.includes("*") || list.includes(screen);
}
