import { useMemo, useState } from "react";
import { useI18n } from "../i18n/I18nContext";
import { DataTable, type Column } from "../components/DataTable";
import { Badge, Card, Icon, PageHeader, Progress, Segmented } from "../components/ui";
import { TODAY, trainees } from "../data/mock";
import type { Trainee, TraineeStatus } from "../types";

function initials(s: string) {
  return s.split(" ").filter(Boolean).slice(0, 2).map((w) => w.replace(/^(Al-|ال)/, "")[0]).join("");
}

export function Trainees() {
  const { m, fmt, num, loc, name, lang } = useI18n();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<TraineeStatus | "all">("all");

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return trainees.filter((t) =>
      (status === "all" || t.status === status) &&
      (!s || [t.name.ar, t.name.latin, t.email, t.city.en, t.city.ar, t.city.tr, t.id].some((v) => v.toLowerCase().includes(s))));
  }, [q, status]);

  const ago = (iso: string) => {
    const d = Math.round((TODAY.getTime() - new Date(iso).getTime()) / 86400000);
    return d <= 0 ? m.todayShort : fmt(m.daysAgo, { n: num(d) });
  };

  const cols: Column<Trainee>[] = [
    {
      key: "name", header: m.trainees.name, sortValue: (t) => name(t.name),
      render: (t) => (
        <div className="person">
          <span className="avatar" aria-hidden="true">{initials(name(t.name))}</span>
          <div className="cell-main">
            <strong>{name(t.name)}</strong>
            <span className="muted hide-sm" dir="ltr">{t.email}</span>
            <span className="muted show-sm">{loc(t.city)} · <span className="num">{num(t.progress)}%</span></span>
          </div>
        </div>
      ),
    },
    { key: "city", header: m.trainees.city, hideOnMobile: true, sortValue: (t) => loc(t.city), render: (t) => loc(t.city) },
    { key: "courses", header: m.trainees.courses, align: "end", hideOnMobile: true, sortValue: (t) => t.courses, render: (t) => <span className="num">{num(t.courses)}</span> },
    {
      key: "progress", header: m.trainees.progress, hideOnMobile: true, sortValue: (t) => t.progress,
      render: (t) => (
        <div className="seats">
          <Progress value={t.progress} tone={t.progress >= 80 ? "good" : "accent"} label={m.trainees.progress} />
          <span className="num muted">{num(t.progress)}%</span>
        </div>
      ),
    },
    { key: "last", header: m.trainees.lastActive, hideOnMobile: true, sortValue: (t) => t.lastActive, render: (t) => <span className="muted">{ago(t.lastActive)}</span> },
    { key: "status", header: m.trainees.status, sortValue: (t) => t.status, render: (t) => <Badge tone={t.status === "active" ? "green" : "gray"}>{m.status[t.status]}</Badge> },
  ];

  return (
    <>
      <PageHeader title={m.trainees.title} subtitle={fmt(m.trainees.subtitle, { n: num(trainees.length) })} />
      <Card>
        <div className="filters">
          <label className="search">
            <Icon name="search" />
            <input id="trainee-search" type="search" placeholder={m.search} value={q} onChange={(e) => setQ(e.target.value)} aria-label={m.search} />
          </label>
          <Segmented label={m.trainees.status} value={status} onChange={setStatus}
            options={[{ value: "all", label: m.all }, { value: "active", label: m.status.active }, { value: "inactive", label: m.status.inactive }]} />
        </div>
        <DataTable key={lang} rows={rows} columns={cols} rowKey={(t) => t.id} initialSort={{ key: "last", dir: "desc" }} />
      </Card>
    </>
  );
}
