"use client";
import { Card, CardBody, PageHead } from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import Pill from "@/components/ui/Pill";
import { useStore, useLookups } from "@/lib/store";
import { fullName, fmtDate } from "@/lib/format";
import { TODAY } from "@/lib/seed";

export default function AnnouncementsPage() {
  const { data, toast } = useStore();
  const { employeeById, departmentName } = useLookups();
  return (
    <>
      <PageHead eyebrow="Communication" title="Announcements"
        sub="Post once — it lands in the app, in inboxes, or both."
        actions={<button className="btn pri" onClick={() => toast("Announcement editor opens here")}>Write announcement</button>} />
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))" }}>
        {data.announcements.map(a => (
          <Card key={a.id}><CardBody>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
              <h3 style={{ fontSize: 16 }}>{a.title}</h3>
              <Pill value={a.expiry < TODAY ? "Expired" : "Live"} />
            </div>
            <p className="mini" style={{ lineHeight: 1.6 }}>{a.body}</p>
            <div className="sep" />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
              <div className="who"><Avatar e={employeeById(a.by)} size="sm" />
                <div><b>{fullName(employeeById(a.by))}</b><span>{fmtDate(a.publish)}</span></div></div>
              <span className="pill info"><i />{a.audience === "Department" ? departmentName(a.dept) : a.audience} · {a.channel}</span>
            </div>
          </CardBody></Card>
        ))}
      </div>
    </>
  );
}
