import type {
  Employee, Department, Project, Task, LeaveRequest, LeaveType, AttendanceRow,
  PayrollRun, Payslip, Announcement, EmailLog, AuditRow, Notification,
  CompanyData, PayLine, EmploymentType, WorkType, EmploymentStatus, RoleName,
} from "./types";

export const CO = {
  name: "Divineesoft Technologies",
  site: "www.divineesoft.com",
  email: "info@divineesoft.com",
  phone: "+92 314 6256754",
  address: "Johar Town, Lahore, Punjab, Pakistan",
  ntn: "7841235-6",
};

export const AV = ["#0A4BF1", "#6D4AFF", "#0E9F6E", "#C97E06", "#DC3A40", "#0B1B4D", "#1F8FA8", "#B2457E"];
export const MONTHS = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];
export const TASK_STATUSES = ["To Do", "In Progress", "In Review", "Completed", "Blocked"] as const;
export const PAYROLL_STEPS = ["Draft", "Processing", "Pending Approval", "Approved", "Paid"] as const;

/** The demo company is pinned to this date so figures stay reproducible. */
export const TODAY = new Date(2026, 7, 19);
const D = (y: number, m: number, d: number) => new Date(y, m - 1, d);

export const departments: Department[] = [
  { id: "d1", name: "Engineering", code: "ENG", head: "e1", budget: 4_200_000 },
  { id: "d2", name: "Product Design", code: "DSN", head: "e5", budget: 1_600_000 },
  { id: "d3", name: "Quality Assurance", code: "QA", head: "e8", budget: 980_000 },
  { id: "d4", name: "People & Culture", code: "HR", head: "e10", budget: 760_000 },
  { id: "d5", name: "Finance", code: "FIN", head: "e12", budget: 820_000 },
  { id: "d6", name: "Growth & Sales", code: "GRW", head: "e13", budget: 1_450_000 },
  { id: "d7", name: "Client Support", code: "SUP", head: "e15", budget: 640_000 },
];

export const designations = ["Chief Technology Officer", "Senior Software Engineer", "Software Engineer",
  "Associate Engineer", "Lead Product Designer", "UI/UX Designer", "QA Lead", "QA Engineer",
  "HR Manager", "HR Executive", "Finance Manager", "Accounts Officer", "Growth Lead",
  "Business Development Executive", "Support Lead", "Support Engineer"];

export function makeEmployee(
  i: number, code: string, first: string, last: string, deptId: string, desig: string,
  role: RoleName, basic: number, joined: Date, type: EmploymentType, work: WorkType,
  status: EmploymentStatus, mgrId: string | null,
): Employee {
  return {
    id: "e" + i, code, first, last,
    email: `${first}.${last}`.toLowerCase() + "@divineesoft.com",
    phone: "+92 3" + (10 + i) + " " + (1000000 + i * 13457).toString().slice(0, 7),
    dob: D(1988 + (i % 10), ((i * 3) % 12) + 1, ((i * 5) % 27) + 1),
    gender: i % 3 === 1 ? "Female" : "Male",
    address: ["Model Town", "DHA Phase 5", "Johar Town", "Gulberg III", "Bahria Town"][i % 5] + ", Lahore",
    emergency: {
      name: ["Ahmed", "Sana", "Bilal", "Hina", "Usman"][i % 5] + " " + last,
      rel: i % 2 ? "Spouse" : "Sibling",
      phone: "+92 300 " + (4000000 + i * 971).toString().slice(0, 7),
    },
    joined, type, deptId, desig, mgrId, role, location: "Lahore HQ", work, status,
    color: AV[i % AV.length],
    salary: {
      basic, housing: Math.round(basic * 0.2), transport: Math.round(basic * 0.08),
      medical: Math.round(basic * 0.06), other: 0,
      taxRate: i % 4 === 0 ? 0.08 : 0.05, loan: i === 7 ? 18000 : 0,
    },
    leave: {
      annual: { total: 20, used: (i * 3) % 13 },
      sick: { total: 10, used: i % 6 },
      casual: { total: 8, used: (i * 2) % 7 },
    },
    docs: [
      { n: "Employment contract", t: "Contract", exp: null, at: joined },
      { n: "CNIC copy", t: "National ID", exp: D(2031, 4, 12), at: joined },
      { n: "Offer letter", t: "Offer", exp: null, at: joined },
      ...(i % 4 === 0 ? [{ n: "AWS Solutions Architect", t: "Certificate", exp: D(2027, 2, 1), at: D(2024, 2, 1) }] : []),
    ],
  };
}

function seedEmployees(): Employee[] {
  const list = [
    makeEmployee(1, "DST-001", "Zeeshan", "Haider", "d1", "Chief Technology Officer", "Super Admin", 480000, D(2019, 3, 4), "Full Time", "Hybrid", "Active", null),
    makeEmployee(2, "DST-002", "Ayesha", "Malik", "d1", "Senior Software Engineer", "Team Lead", 265000, D(2020, 7, 15), "Full Time", "Hybrid", "Active", "e1"),
    makeEmployee(3, "DST-003", "Hamza", "Sheikh", "d1", "Software Engineer", "Employee", 185000, D(2022, 1, 10), "Full Time", "On-site", "Active", "e2"),
    makeEmployee(4, "DST-004", "Fatima", "Noor", "d1", "Software Engineer", "Employee", 172000, D(2023, 4, 3), "Full Time", "Remote", "On Leave", "e2"),
    makeEmployee(5, "DST-005", "Bilal", "Raza", "d2", "Lead Product Designer", "Team Lead", 228000, D(2021, 2, 22), "Full Time", "Hybrid", "Active", "e1"),
    makeEmployee(6, "DST-006", "Iqra", "Javed", "d2", "UI/UX Designer", "Employee", 148000, D(2023, 9, 1), "Full Time", "Remote", "Active", "e5"),
    makeEmployee(7, "DST-007", "Usman", "Tariq", "d1", "Associate Engineer", "Employee", 96000, D(2025, 6, 16), "Internship", "On-site", "Probation", "e2"),
    makeEmployee(8, "DST-008", "Sana", "Aslam", "d3", "QA Lead", "Team Lead", 196000, D(2021, 11, 8), "Full Time", "On-site", "Active", "e1"),
    makeEmployee(9, "DST-009", "Danish", "Iqbal", "d3", "QA Engineer", "Employee", 124000, D(2024, 3, 18), "Contract", "On-site", "Suspended", "e8"),
    makeEmployee(10, "DST-010", "Maryam", "Khan", "d4", "HR Manager", "HR Manager", 235000, D(2020, 1, 6), "Full Time", "On-site", "Active", "e1"),
    makeEmployee(11, "DST-011", "Ali", "Hassan", "d4", "HR Executive", "Employee", 112000, D(2024, 8, 12), "Full Time", "On-site", "Active", "e10"),
    makeEmployee(12, "DST-012", "Nimra", "Shahid", "d5", "Finance Manager", "Finance Manager", 245000, D(2020, 5, 4), "Full Time", "Hybrid", "Active", "e1"),
    makeEmployee(13, "DST-013", "Faisal", "Anwar", "d6", "Growth Lead", "Project Manager", 258000, D(2021, 6, 21), "Full Time", "Hybrid", "Active", "e1"),
    makeEmployee(14, "DST-014", "Hira", "Zaman", "d6", "Business Development Executive", "Employee", 108000, D(2024, 10, 2), "Full Time", "On-site", "Active", "e13"),
    makeEmployee(15, "DST-015", "Omar", "Siddiqui", "d7", "Support Lead", "Team Lead", 165000, D(2022, 8, 29), "Full Time", "On-site", "Active", "e1"),
    makeEmployee(16, "DST-016", "Rabia", "Nawaz", "d7", "Support Engineer", "Employee", 92000, D(2025, 2, 17), "Part Time", "Remote", "Active", "e15"),
  ];
  list[8].statusMeta = { reason: "Repeated unapproved absence — pending investigation", at: D(2026, 8, 4), by: "Maryam Khan" };
  list[3].statusMeta = { reason: "Annual leave 17–24 Aug", at: D(2026, 8, 17), by: "Maryam Khan" };
  return list;
}

export const projects: Project[] = [
  { id: "p1", name: "Meridian Banking Portal", code: "DST-PRJ-01", client: "Meridian Bank", desc: "Customer onboarding and account portal with KYC automation.", start: D(2026, 2, 2), due: D(2026, 10, 30), status: "Active", priority: "High", budget: 9800000, spent: 6120000, pm: "e13", team: ["e2", "e3", "e5", "e8", "e7"], progress: 64 },
  { id: "p2", name: "Rehmat Retail POS", code: "DST-PRJ-02", client: "Rehmat Group", desc: "Multi-branch point of sale with offline sync.", start: D(2026, 4, 14), due: D(2026, 9, 15), status: "Active", priority: "Critical", budget: 5400000, spent: 4310000, pm: "e13", team: ["e3", "e4", "e6", "e9"], progress: 78 },
  { id: "p3", name: "Divineesoft HRM Suite", code: "DST-PRJ-03", client: "Internal", desc: "This platform — people, payroll and delivery in one console.", start: D(2026, 6, 1), due: D(2026, 12, 20), status: "Active", priority: "High", budget: 3200000, spent: 980000, pm: "e1", team: ["e2", "e5", "e6", "e8"], progress: 38 },
  { id: "p4", name: "Cedar Clinic Booking", code: "DST-PRJ-04", client: "Cedar Health", desc: "Appointment scheduling and patient reminders.", start: D(2025, 11, 3), due: D(2026, 5, 29), status: "Completed", priority: "Medium", budget: 2600000, spent: 2480000, pm: "e13", team: ["e4", "e6", "e16"], progress: 100 },
  { id: "p5", name: "Falcon Logistics Tracker", code: "DST-PRJ-05", client: "Falcon Freight", desc: "Fleet telemetry dashboard and driver mobile app.", start: D(2026, 3, 10), due: D(2026, 8, 10), status: "On Hold", priority: "Medium", budget: 4100000, spent: 2210000, pm: "e13", team: ["e3", "e7"], progress: 45 },
  { id: "p6", name: "Aurora Storefront", code: "DST-PRJ-06", client: "Aurora Apparel", desc: "Headless commerce build with in-house CMS.", start: D(2026, 8, 4), due: D(2027, 1, 16), status: "Planning", priority: "Low", budget: 3700000, spent: 150000, pm: "e13", team: ["e5", "e6"], progress: 8 },
];

export const tasks: Task[] = [
  { id: "t1", title: "KYC document upload flow", pid: "p1", assignee: "e3", priority: "High", start: D(2026, 8, 4), due: D(2026, 8, 22), status: "In Progress", comments: [{ by: "e2", at: D(2026, 8, 12), text: "Use the shared uploader — don't rebuild it." }] },
  { id: "t2", title: "Account statement PDF export", pid: "p1", assignee: "e2", priority: "Medium", start: D(2026, 8, 1), due: D(2026, 8, 26), status: "In Review", comments: [] },
  { id: "t3", title: "Branch offline sync conflicts", pid: "p2", assignee: "e3", priority: "Critical", start: D(2026, 7, 28), due: D(2026, 8, 20), status: "Blocked", comments: [{ by: "e3", at: D(2026, 8, 14), text: "Waiting on the client's SQL Server credentials." }] },
  { id: "t4", title: "Receipt printer driver test matrix", pid: "p2", assignee: "e9", priority: "Medium", start: D(2026, 8, 6), due: D(2026, 8, 25), status: "To Do", comments: [] },
  { id: "t5", title: "Payroll calculation engine", pid: "p3", assignee: "e2", priority: "Critical", start: D(2026, 8, 10), due: D(2026, 9, 2), status: "In Progress", comments: [] },
  { id: "t6", title: "Payslip PDF template", pid: "p3", assignee: "e5", priority: "High", start: D(2026, 8, 12), due: D(2026, 8, 28), status: "In Progress", comments: [] },
  { id: "t7", title: "Leave approval workflow", pid: "p3", assignee: "e6", priority: "Medium", start: D(2026, 8, 14), due: D(2026, 9, 5), status: "To Do", comments: [] },
  { id: "t8", title: "Regression suite for release 2.4", pid: "p3", assignee: "e8", priority: "High", start: D(2026, 8, 8), due: D(2026, 8, 21), status: "In Review", comments: [] },
  { id: "t9", title: "Driver app push notifications", pid: "p5", assignee: "e7", priority: "Low", start: D(2026, 7, 15), due: D(2026, 8, 30), status: "To Do", comments: [] },
  { id: "t10", title: "Storefront design system", pid: "p6", assignee: "e5", priority: "High", start: D(2026, 8, 11), due: D(2026, 9, 12), status: "In Progress", comments: [] },
  { id: "t11", title: "Product grid and filters", pid: "p6", assignee: "e6", priority: "Medium", start: D(2026, 8, 18), due: D(2026, 9, 20), status: "To Do", comments: [] },
  { id: "t12", title: "Loan deduction rules", pid: "p3", assignee: "e2", priority: "Medium", start: D(2026, 7, 20), due: D(2026, 8, 8), status: "Completed", comments: [] },
  { id: "t13", title: "Fraud rules v1", pid: "p1", assignee: "e8", priority: "High", start: D(2026, 7, 1), due: D(2026, 8, 5), status: "Completed", comments: [] },
  { id: "t14", title: "Onboarding email templates", pid: "p3", assignee: "e6", priority: "Low", start: D(2026, 8, 15), due: D(2026, 9, 8), status: "To Do", comments: [] },
];

export const leaveTypes: LeaveType[] = [
  { id: "lt1", name: "Annual Leave", days: 20, paid: true, carry: 5 },
  { id: "lt2", name: "Sick Leave", days: 10, paid: true, carry: 0 },
  { id: "lt3", name: "Casual Leave", days: 8, paid: true, carry: 0 },
  { id: "lt4", name: "Unpaid Leave", days: 0, paid: false, carry: 0 },
  { id: "lt5", name: "Maternity Leave", days: 90, paid: true, carry: 0 },
  { id: "lt6", name: "Paternity Leave", days: 10, paid: true, carry: 0 },
];

export const leaves: LeaveRequest[] = [
  { id: "l1", eid: "e4", type: "Annual Leave", from: D(2026, 8, 17), to: D(2026, 8, 24), reason: "Family wedding in Islamabad.", status: "Approved", at: D(2026, 8, 9), by: "e10" },
  { id: "l2", eid: "e6", type: "Sick Leave", from: D(2026, 8, 20), to: D(2026, 8, 21), reason: "Dengue test advised by doctor.", status: "Pending", at: D(2026, 8, 18), by: null },
  { id: "l3", eid: "e3", type: "Casual Leave", from: D(2026, 8, 25), to: D(2026, 8, 25), reason: "NADRA appointment.", status: "Pending", at: D(2026, 8, 17), by: null },
  { id: "l4", eid: "e14", type: "Annual Leave", from: D(2026, 9, 1), to: D(2026, 9, 5), reason: "Northern areas trip, booked in advance.", status: "Pending", at: D(2026, 8, 15), by: null },
  { id: "l5", eid: "e16", type: "Unpaid Leave", from: D(2026, 8, 10), to: D(2026, 8, 12), reason: "Personal matter.", status: "Approved", at: D(2026, 8, 7), by: "e10" },
  { id: "l6", eid: "e7", type: "Sick Leave", from: D(2026, 8, 3), to: D(2026, 8, 4), reason: "Flu.", status: "Approved", at: D(2026, 8, 3), by: "e10" },
  { id: "l7", eid: "e11", type: "Annual Leave", from: D(2026, 7, 14), to: D(2026, 7, 18), reason: "Eid holidays extension.", status: "Rejected", at: D(2026, 7, 4), by: "e10", note: "Two people were already off that week." },
  { id: "l8", eid: "e15", type: "Paternity Leave", from: D(2026, 9, 8), to: D(2026, 9, 17), reason: "Newborn.", status: "Pending", at: D(2026, 8, 16), by: null },
];

function seedAttendance(employees: Employee[]): AttendanceRow[] {
  const rows: AttendanceRow[] = [];
  employees.forEach((e, i) => {
    for (let d = 1; d <= 19; d++) {
      const day = D(2026, 8, d);
      const wd = day.getDay();
      if (wd === 0 || wd === 6) continue;
      if (e.status === "Suspended" && d >= 4) continue;
      const onLeave = leaves.some(l => l.eid === e.id && l.status === "Approved" && day >= l.from && day <= l.to);
      if (onLeave) { rows.push({ eid: e.id, date: day, in: null, out: null, status: "On Leave", hours: 0 }); continue; }
      if ((i * d) % 37 === 0) { rows.push({ eid: e.id, date: day, in: null, out: null, status: "Absent", hours: 0 }); continue; }
      const lateMin = (i * 7 + d * 11) % 40 > 31 ? 10 + ((i + d) % 35) : 0;
      const worked = 8 + (((i + d) % 9) === 0 ? 2 : 0) - (((i * d) % 23) === 0 ? 1.5 : 0);
      rows.push({
        eid: e.id, date: day,
        in: `09:${String(lateMin).padStart(2, "0")}`,
        out: `${String(Math.floor(17 + worked - 8)).padStart(2, "0")}:${String((lateMin + 18) % 60).padStart(2, "0")}`,
        status: lateMin ? "Late" : "Present",
        hours: +worked.toFixed(1),
        overtime: worked > 8 ? +(worked - 8).toFixed(1) : 0,
      });
    }
  });
  return rows;
}

/* ------------------------------- payroll engine ------------------------------- */

export function grossOf(e: Employee, extra: Partial<PayLine> = {}): number {
  const s = e.salary;
  return s.basic + s.housing + s.transport + s.medical + s.other
    + (extra.bonus || 0) + (extra.commission || 0) + (extra.overtime || 0);
}

export function payLine(e: Employee, extra: Partial<PayLine> = {}): PayLine {
  const s = e.salary;
  const gross = grossOf(e, extra);
  const tax = Math.round(gross * s.taxRate);
  const loan = s.loan || 0;
  const other = extra.other || 0;
  const unpaid = extra.unpaid || 0;
  return {
    eid: e.id, basic: s.basic, housing: s.housing, transport: s.transport, medical: s.medical,
    bonus: extra.bonus || 0, commission: extra.commission || 0, overtime: extra.overtime || 0,
    gross, tax, loan, other, unpaid, net: gross - tax - loan - other - unpaid,
  };
}

const daysBetween = (a: Date, b: Date) => Math.round((+new Date(b) - +new Date(a)) / 864e5) + 1;

function buildRun(
  employees: Employee[], attendance: AttendanceRow[],
  month: number, year: number, ids: string[], status: PayrollRun["status"], paidAt: Date | null,
): PayrollRun {
  const items = ids.map(id => {
    const e = employees.find(x => x.id === id)!;
    const otHours = attendance.filter(a => a.eid === id && a.overtime).reduce((s, a) => s + (a.overtime || 0), 0);
    const overtime = Math.round(otHours * (e.salary.basic / 176) * 1.5);
    const unpaidDays = leaves
      .filter(l => l.eid === id && l.status === "Approved" && l.type === "Unpaid Leave")
      .reduce((s, l) => s + daysBetween(l.from, l.to), 0);
    return payLine(e, {
      overtime,
      unpaid: Math.round(unpaidDays * (e.salary.basic / 26)),
      bonus: id === "e2" && month === 8 ? 60000 : 0,
    });
  });
  return { id: `pr_${year}_${month}`, month, year, items, status, createdAt: D(year, month, 25), paidAt, by: "e12" };
}

export const announcements: Announcement[] = [
  { id: "a1", title: "Independence Day office closure", body: "Offices stay closed on 14 August. Support engineers on the Meridian rota will work remotely and can claim a compensatory day off in September.", audience: "Everyone", publish: D(2026, 8, 11), expiry: D(2026, 8, 20), channel: "Both", by: "e10" },
  { id: "a2", title: "Health insurance moves to Jubilee Life", body: "From 1 September our panel changes to Jubilee Life. Dependant details must be confirmed in your profile before 27 August or coverage will start late.", audience: "Everyone", publish: D(2026, 8, 15), expiry: D(2026, 8, 27), channel: "Both", by: "e10" },
  { id: "a3", title: "Meridian go-live: code freeze from 28 Aug", body: "No merges to main after 28 August except approved hotfixes. QA sign-off runs through the weekend.", audience: "Department", dept: "d1", publish: D(2026, 8, 18), expiry: D(2026, 9, 1), channel: "In-app", by: "e1" },
];

export const emails: EmailLog[] = [
  { id: "m1", to: "fatima.noor@divineesoft.com", subject: "Your leave request was approved", tpl: "Leave Approved", at: D(2026, 8, 9), status: "Delivered" },
  { id: "m2", to: "all@divineesoft.com", subject: "Health insurance moves to Jubilee Life", tpl: "Company Announcement", at: D(2026, 8, 15), status: "Delivered" },
  { id: "m3", to: "danish.iqbal@divineesoft.com", subject: "Notice of suspension", tpl: "Suspension Notification", at: D(2026, 8, 4), status: "Delivered" },
  { id: "m4", to: "rabia.nawaz@divineesoft.com", subject: "Payslip for July 2026", tpl: "Payslip Available", at: D(2026, 7, 31), status: "Delivered" },
  { id: "m5", to: "usman.tariq@divineesoft.com", subject: "Welcome to Divineesoft Technologies", tpl: "Welcome Email", at: D(2025, 6, 16), status: "Delivered" },
  { id: "m6", to: "hira.zaman@divineesoft.com", subject: "New task assigned: Storefront research", tpl: "Task Assignment", at: D(2026, 8, 17), status: "Delivered" },
  { id: "m7", to: "omar.siddiqui@divineesoft.com", subject: "Payslip for July 2026", tpl: "Payslip Available", at: D(2026, 7, 31), status: "Bounced", err: "550 5.1.1 mailbox quota exceeded" },
  { id: "m8", to: "ali.hassan@divineesoft.com", subject: "Password reset request", tpl: "Password Reset", at: D(2026, 8, 12), status: "Delivered" },
  { id: "m9", to: "iqra.javed@divineesoft.com", subject: "Task deadline in 48 hours", tpl: "Task Deadline Reminder", at: D(2026, 8, 18), status: "Queued" },
  { id: "m10", to: "nimra.shahid@divineesoft.com", subject: "July payroll approved", tpl: "Payroll Generated", at: D(2026, 7, 29), status: "Delivered" },
];

export const audit: AuditRow[] = [
  { id: "g1", who: "Maryam Khan", act: "Employee suspended", target: "Danish Iqbal (DST-009)", at: D(2026, 8, 4), ip: "203.135.44.18", detail: "Reason: repeated unapproved absence" },
  { id: "g2", who: "Nimra Shahid", act: "Payroll marked paid", target: "July 2026 run · 16 people", at: D(2026, 7, 31), ip: "203.135.44.9", detail: "Net disbursed ₨ 2,791,400" },
  { id: "g3", who: "Maryam Khan", act: "Leave approved", target: "Fatima Noor · Annual 17–24 Aug", at: D(2026, 8, 9), ip: "203.135.44.18", detail: "Balance after: 9 days" },
  { id: "g4", who: "Zeeshan Haider", act: "Salary changed", target: "Ayesha Malik (DST-002)", at: D(2026, 8, 1), ip: "39.51.7.204", detail: "Basic ₨ 240,000 → ₨ 265,000" },
  { id: "g5", who: "Faisal Anwar", act: "Project created", target: "Aurora Storefront (DST-PRJ-06)", at: D(2026, 8, 4), ip: "203.135.44.31", detail: "Budget ₨ 3,700,000" },
  { id: "g6", who: "Maryam Khan", act: "Employee created", target: "Rabia Nawaz (DST-016)", at: D(2025, 2, 17), ip: "203.135.44.18", detail: "Part Time · Client Support" },
  { id: "g7", who: "System", act: "Email sent", target: "omar.siddiqui@divineesoft.com", at: D(2026, 7, 31), ip: "—", detail: "Bounced: mailbox quota exceeded" },
  { id: "g8", who: "Ayesha Malik", act: "Task assigned", target: "Payroll calculation engine → Ayesha Malik", at: D(2026, 8, 10), ip: "39.51.7.88", detail: "Project DST-PRJ-03" },
];

export const notifications: Notification[] = [
  { id: "n1", text: "Iqra Javed requested 2 days sick leave", at: D(2026, 8, 18), read: false, go: "/leaves" },
  { id: "n2", text: "August payroll is still a draft — 5 days to payday", at: D(2026, 8, 19), read: false, go: "/payroll" },
  { id: "n3", text: "Task “Branch offline sync conflicts” is blocked", at: D(2026, 8, 14), read: false, go: "/tasks" },
  { id: "n4", text: "Payslip email to Omar Siddiqui bounced", at: D(2026, 7, 31), read: true, go: "/email" },
  { id: "n5", text: "Falcon Logistics Tracker passed its deadline", at: D(2026, 8, 11), read: true, go: "/projects" },
];

/** Builds one complete company. Called once on the client and once by prisma/seed.ts. */
export function buildCompany(): CompanyData {
  const employees = seedEmployees();
  const attendance = seedAttendance(employees);
  const activeIds = employees.filter(e => e.status !== "Terminated").map(e => e.id);
  const payrolls: PayrollRun[] = [
    buildRun(employees, attendance, 6, 2026, activeIds, "Paid", D(2026, 6, 30)),
    buildRun(employees, attendance, 7, 2026, activeIds, "Paid", D(2026, 7, 31)),
    buildRun(employees, attendance, 8, 2026, activeIds.filter(i => i !== "e9"), "Draft", null),
  ];
  const payslips: Payslip[] = [];
  payrolls.filter(p => p.status === "Paid").forEach(p =>
    p.items.forEach(it => payslips.push({
      id: `ps_${p.month}_${it.eid}`, runId: p.id, eid: it.eid,
      month: p.month, year: p.year, line: it, paidAt: p.paidAt, emailed: true,
    })));

  return {
    employees, departments, projects, tasks, leaves, leaveTypes, attendance,
    payrolls, payslips, announcements, emails, audit, notifications,
    settings: {
      currency: "PKR", tz: "Asia/Karachi (PKT)", cycle: "Monthly", payday: "Last working day",
      smtp: { host: "smtp.hostinger.com", port: 465, user: CO.email, secure: true, from: "Divineesoft HR", fromEmail: CO.email },
      security: { minLen: 12, expiry: 90, session: 60, twoFA: true },
    },
  };
}
