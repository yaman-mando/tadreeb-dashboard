import { useMemo, useState } from "react";
import { useI18n } from "../i18n/I18nContext";
import { DataTable, type Column } from "../components/DataTable";
import { Badge, Card, Icon, PageHeader, Segmented } from "../components/ui";
import { courseById, enrollments, traineeById } from "../data/mock";
import type { Enrollment, EnrollmentStatus } from "../types";

const tone = { paid: "green", pending: "amber", cancelled: "red" } as const;

export function Enrollments() {
  const { m, num, money, date, loc, name } = useI18n();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<EnrollmentStatus | "all">("all");

  const totals = useMemo(() => {
    const sum = (s: EnrollmentStatus) => enrollments.filter((e) => e.status === s);
    return {
      paid: sum("paid").reduce((a, e) => a + e.amount, 0),
      pending: sum("pending").reduce((a, e) => a + e.amount, 0),
      pendingN: sum("pending").length,
      cancelledN: sum("cancelled").length,
    };
  }, []);

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return enrollments.filter((e) => {
      if (status !== "all" && e.status !== status) return false;
      if (!s) return true;
      const t = traineeById(e.traineeId), c = courseById(e.courseId);
      return [e.id, t.name.ar, t.name.latin, c.title.en, c.title.ar, c.title.tr].some((v) => v.toLowerCase().includes(s));
    });
  }, [q, status]);

  const cols: Column<Enrollment>[] = [
    { key: "id", header: m.enrollments.id, hideOnMobile: true, sortValue: (e) => e.id, render: (e) => <span className="num muted">{e.id}</span> },
    {
      key: "trainee", header: m.enrollments.trainee, sortValue: (e) => name(traineeById(e.traineeId).name),
      render: (e) => (
        <div className="cell-main">
          <strong>{name(traineeById(e.traineeId).name)}</strong>
          <span className="muted show-sm">{loc(courseById(e.courseId).title)} · <span className="num">{date(e.date)}</span></span>
        </div>
      ),
    },
    { key: "course", header: m.enrollments.course, hideOnMobile: true, sortValue: (e) => loc(courseById(e.courseId).title), render: (e) => loc(courseById(e.courseId).title) },
    { key: "date", header: m.enrollments.date, hideOnMobile: true, sortValue: (e) => e.date, render: (e) => <span className="num">{date(e.date)}</span> },
    { key: "amount", header: m.enrollments.amount, align: "end", sortValue: (e) => e.amount, render: (e) => <span className="num">{money(e.amount)}</span> },
    { key: "status", header: m.enrollments.status, sortValue: (e) => e.status, render: (e) => <Badge tone={tone[e.status]}>{m.status[e.status]}</Badge> },
  ];

  return (
    <>
      <PageHeader title={m.enrollments.title} subtitle={m.enrollments.subtitle} />
      <div className="kpis kpis-3">
        <div className="kpi"><span className="kpi-label">{m.enrollments.totalPaid}</span><strong className="kpi-value num">{money(totals.paid)}</strong></div>
        <div className="kpi"><span className="kpi-label">{m.enrollments.totalPending}</span><strong className="kpi-value num tone-amber">{money(totals.pending)}</strong><span className="kpi-delta"><span className="num">{num(totals.pendingN)}</span> {m.nav.enrollments}</span></div>
        <div className="kpi"><span className="kpi-label">{m.enrollments.cancelled}</span><strong className="kpi-value num">{num(totals.cancelledN)}</strong></div>
      </div>
      <Card>
        <div className="filters">
          <label className="search">
            <Icon name="search" />
            <input id="enr-search" type="search" placeholder={m.search} value={q} onChange={(e) => setQ(e.target.value)} aria-label={m.search} />
          </label>
          <Segmented label={m.enrollments.status} value={status} onChange={setStatus}
            options={[{ value: "all", label: m.all }, ...(["paid", "pending", "cancelled"] as const).map((s) => ({ value: s, label: m.status[s] }))]} />
        </div>
        <DataTable rows={rows} columns={cols} rowKey={(e) => e.id} initialSort={{ key: "date", dir: "desc" }} />
      </Card>
    </>
  );
}
