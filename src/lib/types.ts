/** Domain model. These mirror prisma/schema.prisma one-to-one, so swapping the
 *  in-memory store for the database is a change of data source, not of shape. */

export type EmploymentType = "Full Time" | "Part Time" | "Contract" | "Internship" | "Freelance";
export type WorkType = "Remote" | "Hybrid" | "On-site";
export type EmploymentStatus = "Active" | "On Leave" | "Suspended" | "Terminated" | "Resigned" | "Probation";
export type RoleName = "Super Admin" | "HR Manager" | "Finance Manager" | "Project Manager" | "Team Lead" | "Employee";
export type LeaveStatus = "Pending" | "Approved" | "Rejected";
export type PayrollStatus = "Draft" | "Processing" | "Pending Approval" | "Approved" | "Paid" | "Cancelled";
export type TaskStatus = "To Do" | "In Progress" | "In Review" | "Completed" | "Blocked";
export type ProjectStatus = "Planning" | "Active" | "On Hold" | "Completed" | "Cancelled";
export type Priority = "Low" | "Medium" | "High" | "Critical";
export type AttendanceStatus = "Present" | "Late" | "Absent" | "On Leave";

export interface Department {
  id: string; name: string; code: string; head: string; budget: number;
}

export interface SalaryStructure {
  basic: number; housing: number; transport: number; medical: number;
  other: number; taxRate: number; loan: number;
}

export interface LeaveBucket { total: number; used: number }

export interface EmployeeDoc { n: string; t: string; exp: Date | null; at: Date }

export interface Employee {
  id: string; code: string; first: string; last: string;
  email: string; phone: string; dob: Date; gender: string; address: string;
  emergency: { name: string; rel: string; phone: string };
  joined: Date; type: EmploymentType; deptId: string; desig: string;
  mgrId: string | null; role: RoleName; location: string; work: WorkType;
  status: EmploymentStatus; color: string; salary: SalaryStructure;
  leave: Record<string, LeaveBucket>; docs: EmployeeDoc[];
  statusMeta?: { reason: string; at: Date; by: string };
}

export interface Project {
  id: string; name: string; code: string; client: string; desc: string;
  start: Date; due: Date; status: ProjectStatus; priority: Priority;
  budget: number; spent: number; pm: string; team: string[]; progress: number;
}

export interface TaskComment { by: string; at: Date; text: string }

export interface Task {
  id: string; title: string; pid: string; assignee: string; priority: Priority;
  start: Date; due: Date; status: TaskStatus; comments: TaskComment[];
}

export interface LeaveRequest {
  id: string; eid: string; type: string; from: Date; to: Date; reason: string;
  status: LeaveStatus; at: Date; by: string | null; note?: string;
}

export interface LeaveType {
  id: string; name: string; days: number; paid: boolean; carry: number;
}

export interface AttendanceRow {
  eid: string; date: Date; in: string | null; out: string | null;
  status: AttendanceStatus; hours: number; overtime?: number;
}

export interface PayLine {
  eid: string; basic: number; housing: number; transport: number; medical: number;
  bonus: number; commission: number; overtime: number; gross: number;
  tax: number; loan: number; other: number; unpaid: number; net: number;
}

export interface PayrollRun {
  id: string; month: number; year: number; items: PayLine[];
  status: PayrollStatus; createdAt: Date; paidAt: Date | null; by: string;
}

export interface Payslip {
  id: string; runId: string; eid: string; month: number; year: number;
  line: PayLine; paidAt: Date | null; emailed: boolean;
}

export interface Announcement {
  id: string; title: string; body: string; audience: string; dept?: string;
  publish: Date; expiry: Date; channel: "In-app" | "Email" | "Both"; by: string;
}

export interface EmailLog {
  id: string; to: string; subject: string; tpl: string; at: Date;
  status: "Delivered" | "Queued" | "Bounced" | "Failed"; err?: string;
}

export interface AuditRow {
  id: string; who: string; act: string; target: string; at: Date;
  ip: string; detail: string;
}

export interface Notification {
  id: string; text: string; at: Date; read: boolean; go: string;
}

export interface Settings {
  currency: "PKR" | "USD"; tz: string; cycle: string; payday: string;
  smtp: { host: string; port: number; user: string; secure: boolean; from: string; fromEmail: string };
  security: { minLen: number; expiry: number; session: number; twoFA: boolean };
}

export interface CompanyData {
  employees: Employee[]; departments: Department[]; projects: Project[];
  tasks: Task[]; leaves: LeaveRequest[]; leaveTypes: LeaveType[];
  attendance: AttendanceRow[]; payrolls: PayrollRun[]; payslips: Payslip[];
  announcements: Announcement[]; emails: EmailLog[]; audit: AuditRow[];
  notifications: Notification[]; settings: Settings;
}
