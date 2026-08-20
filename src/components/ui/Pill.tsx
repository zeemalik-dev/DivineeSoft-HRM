const TONE: Record<string, string> = {
  Active: "ok", "On Leave": "info", Suspended: "bad", Terminated: "bad", Resigned: "mute", Probation: "warn",
  Approved: "ok", Pending: "warn", Rejected: "bad", Paid: "ok", Draft: "mute", Processing: "info",
  "Pending Approval": "warn", Cancelled: "bad", Completed: "ok", "In Progress": "info", "To Do": "mute",
  "In Review": "vio", Blocked: "bad", "On Hold": "warn", Planning: "info", Delivered: "ok", Bounced: "bad",
  Queued: "warn", Failed: "bad", Present: "ok", Late: "warn", Absent: "bad",
  Critical: "bad", High: "warn", Medium: "info", Low: "mute", Live: "ok", Expired: "mute",
};

export default function Pill({ value, tone }: { value: string; tone?: string }) {
  return <span className={`pill ${tone || TONE[value] || "mute"}`}><i />{value}</span>;
}
