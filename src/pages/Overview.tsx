import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useI18n } from "../i18n/I18nContext";
import { Badge, Card, PageHeader, Progress } from "../components/ui";
import { courseById, enrollments, monthly, sessions, TODAY, trainees } from "../data/mock";
import { useCssColors, type Theme } from "../hooks";
import type { CategoryId, Course } from "../types";

const CATS: CategoryId[] = ["tech", "management", "languages", "design", "finance"];

function monthTotal(offset: number) {
  const d = new Date(TODAY.getFullYear(), TODAY.getMonth() + offset, 1);
  const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  return enrollments.filter((e) => e.status === "paid" && e.date.startsWith(key)).reduce((s, e) => s + e.amount, 0);
}

export function Overview({ courses, theme }: { courses: Course[]; theme: Theme }) {
  const { m, dir, num, money, date, loc, name, lang } = useI18n();
  const c = useCssColors(["accent", "accent-2", "line", "muted", "surface", "fg"], theme);

  const active = trainees.filter((t) => t.status === "active");
  const running = courses.filter((x) => x.status === "running").length;
  const avgProgress = Math.round(active.reduce((s, t) => s + t.progress, 0) / active.length);
  const thisMonth = monthTotal(0), lastMonth = monthTotal(-1);
  const delta = lastMonth ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : 0;

  const byCat = CATS.map((cat) => ({
    cat,
    n: courses.filter((x) => x.category === cat).reduce((s, x) => s + x.enrolled, 0),
  })).sort((a, b) => b.n - a.n);
  const maxCat = Math.max(...byCat.map((b) => b.n));

  const fullest = [...courses].filter((x) => x.status !== "completed")
    .sort((a, b) => b.enrolled / b.capacity - a.enrolled / a.capacity).slice(0, 5);

  const chartData = monthly.map((p) => ({
    ...p,
    label: date(`${p.month}-01`, { month: "short" }),
  }));

  const kpis = [
    { label: m.overview.activeTrainees, value: num(active.length), note: null },
    { label: m.overview.runningCourses, value: num(running), note: null },
    { label: m.overview.completionRate, value: `${num(avgProgress)}%`, note: null },
    { label: m.overview.revenue, value: money(thisMonth), note: delta },
  ];

  return (
    <>
      <PageHeader title={m.overview.title} subtitle={`${m.overview.subtitle} · ${date(TODAY.toISOString(), { day: "numeric", month: "long", year: "numeric" })}`} />

      <div className="kpis">
        {kpis.map((k) => (
          <div className="kpi" key={k.label}>
            <span className="kpi-label">{k.label}</span>
            <strong className="kpi-value num">{k.value}</strong>
            {k.note !== null && (
              <span className={`kpi-delta ${k.note >= 0 ? "up" : "down"}`}>
                <span className="num">{k.note >= 0 ? "+" : ""}{num(k.note)}%</span> {m.overview.vsLast}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="grid-2">
        <Card title={m.overview.trend} className="span-2">
          <div className="chart" dir="ltr">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={c.accent} stopOpacity={0.28} />
                    <stop offset="100%" stopColor={c.accent} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={c.line} vertical={false} />
                <XAxis dataKey="label" reversed={dir === "rtl"} tick={{ fill: c.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis orientation={dir === "rtl" ? "right" : "left"} width={36} tick={{ fill: c.muted, fontSize: 12 }} axisLine={false} tickLine={false}
                  tickFormatter={(v: number) => num(v)} />
                <Tooltip
                  contentStyle={{ background: c.surface, border: `1px solid ${c.line}`, borderRadius: 10, color: c.fg, direction: dir }}
                  labelStyle={{ color: c.muted }}
                  formatter={(v: number) => num(v)} />
                <Legend wrapperStyle={{ direction: dir, fontSize: 13 }} />
                <Area type="monotone" dataKey="enrollments" name={m.overview.enrollmentsSeries} stroke={c.accent} strokeWidth={2.2} fill="url(#gA)" dot={false} activeDot={{ r: 4 }} />
                <Area type="monotone" dataKey="completions" name={m.overview.completionsSeries} stroke={c["accent-2"]} strokeWidth={2} strokeDasharray="5 4" fill="none" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title={m.overview.byCategory}>
          <ul className="bars">
            {byCat.map((b) => (
              <li key={b.cat}>
                <div className="bars-row">
                  <span>{m.category[b.cat]}</span>
                  <span className="num muted">{num(b.n)}</span>
                </div>
                <Progress value={(b.n / maxCat) * 100} label={m.category[b.cat]} />
              </li>
            ))}
          </ul>
        </Card>

        <Card title={m.overview.upcoming}>
          <ul className="sessions">
            {sessions.slice(0, 5).map((s) => {
              const course = courseById(s.courseId);
              const d = new Date(s.date);
              return (
                <li key={s.id}>
                  <div className="cal">
                    <span>{date(s.date, { month: "short" })}</span>
                    <strong className="num">{num(d.getDate())}</strong>
                  </div>
                  <div className="sess-body">
                    <strong>{loc(course.title)}</strong>
                    <span className="muted">
                      {new Intl.DateTimeFormat(lang === "ar" ? "ar-SA-u-nu-latn-ca-gregory" : lang, { hour: "numeric", minute: "2-digit" }).format(d)} · {loc(s.room)} · {name(course.instructor)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card title={m.overview.topCourses} className="span-2">
          <ul className="fullest">
            {fullest.map((x) => {
              const pct = Math.round((x.enrolled / x.capacity) * 100);
              return (
                <li key={x.id}>
                  <div className="fullest-title">
                    <strong>{loc(x.title)}</strong>
                    <span className="muted">{m.category[x.category]} · {name(x.instructor)}</span>
                  </div>
                  <div className="fullest-meter">
                    <Progress value={pct} tone={pct >= 90 ? "warn" : "accent"} label={loc(x.title)} />
                    <span className="num muted">{num(x.enrolled)}/{num(x.capacity)} {m.overview.seatsFilled}</span>
                  </div>
                  <Badge tone={x.status === "running" ? "green" : "blue"}>{m.status[x.status]}</Badge>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </>
  );
}
