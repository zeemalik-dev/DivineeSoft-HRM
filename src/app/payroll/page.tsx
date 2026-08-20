"use client";
import { Card, CardHead, CardBody, PageHead, Steps } from "@/components/ui/Card";
import Pill from "@/components/ui/Pill";
import { useStore } from "@/lib/store";
import { RunDetailModal, ConfirmModal } from "@/components/modals/Modals";
import { MONTHS, PAYROLL_STEPS } from "@/lib/seed";
import { fmtDate } from "@/lib/format";
import type { PayrollRun } from "@/lib/types";

const NEXT: Record<string, string> = {
  "Draft": "Processing", "Processing": "Pending Approval",
  "Pending Approval": "Approved", "Approved": "Paid",
};

export default function PayrollPage() {
  const { data, money, actions, openModal, toast } = useStore();

  const advance = (p: PayrollRun) => {
    if (NEXT[p.status] === "Paid") {
      openModal(<ConfirmModal
        title="Mark payroll as paid?"
        body={`${money(p.items.reduce((s, i) => s + i.net, 0))} will be recorded as disbursed to ${p.items.length} people, and payslips will be generated and emailed. This cannot be undone.`}
        label="Yes, mark as paid"
        onConfirm={() => actions.advancePayroll(p.id)} />);
    } else {
      actions.advancePayroll(p.id);
    }
  };

  return (
    <>
      <PageHead eyebrow="Payroll" title="Payroll runs"
        sub="One run per month per person — the system blocks a second run for a month already processed."
        actions={<button className="btn pri" onClick={() => toast("August 2026 already has a run — duplicates are blocked")}>
          Start a run</button>} />

      {data.payrolls.slice().reverse().map(p => {
        const next = NEXT[p.status];
        return (
          <Card key={p.id} style={{ marginBottom: 14 }}>
            <CardHead
              title={`${MONTHS[p.month - 1]} ${p.year}`}
              sub={`${p.items.length} people · created ${fmtDate(p.createdAt)}${p.paidAt ? ` · paid ${fmtDate(p.paidAt)}` : ""}`}
              action={
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <Pill value={p.status} />
                  {next && <button className="btn pri sm" onClick={() => advance(p)}>
                    {next === "Paid" ? "Mark as paid" : `Move to ${next.toLowerCase()}`}</button>}
                  <button className="btn sm" onClick={() => openModal(<RunDetailModal run={p} />)}>Breakdown</button>
                </div>
              } />
            <CardBody>
              <div style={{ marginBottom: 16 }}><Steps steps={PAYROLL_STEPS} current={p.status} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
                <div><div className="mini">Gross</div><div className="num" style={{ fontSize: 19, fontWeight: 600 }}>{money(p.items.reduce((s, i) => s + i.gross, 0))}</div></div>
                <div><div className="mini">Tax withheld</div><div className="num" style={{ fontSize: 19, fontWeight: 600 }}>{money(p.items.reduce((s, i) => s + i.tax, 0))}</div></div>
                <div><div className="mini">Other deductions</div><div className="num" style={{ fontSize: 19, fontWeight: 600 }}>{money(p.items.reduce((s, i) => s + i.loan + i.unpaid, 0))}</div></div>
                <div><div className="mini">Net payable</div><div className="num" style={{ fontSize: 19, fontWeight: 600, color: "var(--jade)" }}>{money(p.items.reduce((s, i) => s + i.net, 0))}</div></div>
              </div>
            </CardBody>
          </Card>
        );
      })}
    </>
  );
}
