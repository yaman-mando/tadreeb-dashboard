import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useI18n } from "../i18n/I18nContext";
import { DataTable, type Column } from "../components/DataTable";
import { Badge, Card, Icon, PageHeader, Progress, Segmented } from "../components/ui";
import { TODAY } from "../data/mock";
import type { CategoryId, Course, CourseStatus, Mode } from "../types";

const CATS: CategoryId[] = ["tech", "management", "languages", "design", "finance"];
const tone = { running: "green", upcoming: "blue", completed: "gray" } as const;

export function Courses({ courses, onAdd }: { courses: Course[]; onAdd: (c: Course) => void }) {
  const { m, fmt, loc, name, num, money, date } = useI18n();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<CategoryId | "all">("all");
  const [status, setStatus] = useState<CourseStatus | "all">("all");
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState("");

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return courses.filter((c) =>
      (cat === "all" || c.category === cat) &&
      (status === "all" || c.status === status) &&
      (!s || [c.title.en, c.title.ar, c.title.tr, c.instructor.ar, c.instructor.latin, c.id].some((v) => v.toLowerCase().includes(s))));
  }, [courses, q, cat, status]);

  const cols: Column<Course>[] = [
    {
      key: "title", header: m.courses.course, sortValue: (c) => loc(c.title),
      render: (c) => (
        <div className="cell-main">
          <strong>{loc(c.title)}</strong>
          <span className="muted">{c.id} · {m.mode[c.mode]}</span>
        </div>
      ),
    },
    { key: "instructor", header: m.courses.instructor, hideOnMobile: true, sortValue: (c) => name(c.instructor), render: (c) => name(c.instructor) },
    { key: "cat", header: m.courses.category, hideOnMobile: true, sortValue: (c) => m.category[c.category], render: (c) => m.category[c.category] },
    { key: "start", header: m.courses.start, hideOnMobile: true, sortValue: (c) => c.start, render: (c) => <span className="num">{date(c.start)}</span> },
    {
      key: "seats", header: m.courses.seats, sortValue: (c) => c.enrolled / c.capacity,
      render: (c) => (
        <div className="seats">
          <Progress value={(c.enrolled / c.capacity) * 100} tone={c.enrolled / c.capacity >= 0.9 ? "warn" : "accent"} label={m.courses.seats} />
          <span className="num muted">{num(c.enrolled)}/{num(c.capacity)}</span>
        </div>
      ),
    },
    { key: "price", header: m.courses.price, align: "end", hideOnMobile: true, sortValue: (c) => c.price, render: (c) => <span className="num">{money(c.price)}</span> },
    { key: "rating", header: m.courses.rating, align: "end", hideOnMobile: true, sortValue: (c) => c.rating, render: (c) => <span className="num">★ {num(c.rating, { minimumFractionDigits: 1 })}</span> },
    { key: "status", header: m.courses.status, sortValue: (c) => c.status, render: (c) => <Badge tone={tone[c.status]}>{m.status[c.status]}</Badge> },
  ];

  return (
    <>
      <PageHeader
        title={m.courses.title}
        subtitle={fmt(m.courses.subtitle, { n: num(courses.length) })}
        action={<button type="button" className="btn btn-primary" onClick={() => setOpen(true)}><Icon name="plus" />{m.courses.add}</button>}
      />
      <Card>
        <div className="filters">
          <label className="search">
            <Icon name="search" />
            <input id="course-search" type="search" placeholder={m.search} value={q} onChange={(e) => setQ(e.target.value)} aria-label={m.search} />
          </label>
          <select id="course-cat" value={cat} onChange={(e) => setCat(e.target.value as CategoryId | "all")} aria-label={m.courses.category}>
            <option value="all">{m.courses.category}: {m.all}</option>
            {CATS.map((c) => <option key={c} value={c}>{m.category[c]}</option>)}
          </select>
          <Segmented label={m.courses.status} value={status} onChange={setStatus}
            options={[{ value: "all", label: m.all }, ...(["running", "upcoming", "completed"] as const).map((s) => ({ value: s, label: m.status[s] }))]} />
        </div>
        <DataTable rows={rows} columns={cols} rowKey={(c) => c.id} initialSort={{ key: "start", dir: "desc" }} />
      </Card>

      {open && (
        <NewCourse
          nextId={`C-${101 + courses.length}`}
          onClose={() => setOpen(false)}
          onSave={(c) => { onAdd(c); setOpen(false); setToast(m.courses.added); setTimeout(() => setToast(""), 2400); }}
        />
      )}
      <div className="toast" role="status" aria-live="polite">{toast}</div>
    </>
  );
}

function NewCourse({ nextId, onClose, onSave }: { nextId: string; onClose: () => void; onSave: (c: Course) => void }) {
  const { m } = useI18n();
  const ref = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const d = ref.current;
    d?.showModal();
    return () => d?.close();
  }, []);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const g = (k: string) => String(f.get(k) ?? "").trim();
    const en = g("en"), ar = g("ar"), tr = g("tr");
    if (!en && !ar && !tr) { setError(m.courses.required); return; }
    const fallback = en || ar || tr;
    const start = g("start");
    const startDate = new Date(start);
    const weeks = Number(g("weeks"));
    const endDate = new Date(startDate); endDate.setDate(endDate.getDate() + weeks * 7);
    onSave({
      id: nextId,
      title: { en: en || fallback, ar: ar || fallback, tr: tr || fallback },
      category: g("category") as CategoryId,
      instructor: { ar: g("instructor") || "—", latin: g("instructor") || "—" },
      mode: g("mode") as Mode,
      start, weeks,
      capacity: Number(g("capacity")),
      enrolled: 0,
      price: Number(g("price")),
      rating: 0,
      status: startDate > TODAY ? "upcoming" : endDate < TODAY ? "completed" : "running",
    });
  };

  const defStart = new Date(TODAY); defStart.setDate(defStart.getDate() + 14);

  return (
    <dialog ref={ref} className="modal" onClose={onClose} aria-labelledby="new-course-title">
      <form onSubmit={submit}>
        <header className="modal-head">
          <h2 id="new-course-title">{m.courses.add}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label={m.courses.cancel}><Icon name="close" /></button>
        </header>
        <div className="form-grid">
          <label className="full">{m.courses.titleEn}<input id="nc-en" name="en" dir="ltr" /></label>
          <label className="full">{m.courses.titleAr}<input id="nc-ar" name="ar" dir="rtl" lang="ar" /></label>
          <label className="full">{m.courses.titleTr}<input id="nc-tr" name="tr" dir="ltr" lang="tr" /></label>
          <label>{m.courses.category}
            <select id="nc-cat" name="category" defaultValue="tech">
              {CATS.map((c) => <option key={c} value={c}>{m.category[c]}</option>)}
            </select>
          </label>
          <label>{m.courses.mode}
            <select id="nc-mode" name="mode" defaultValue="online">
              <option value="online">{m.mode.online}</option>
              <option value="onsite">{m.mode.onsite}</option>
            </select>
          </label>
          <label>{m.courses.instructor}<input id="nc-inst" name="instructor" /></label>
          <label>{m.courses.start}<input id="nc-start" name="start" type="date" required defaultValue={defStart.toISOString().slice(0, 10)} /></label>
          <label>{m.courses.weeks}<input id="nc-weeks" name="weeks" type="number" min={1} max={52} required defaultValue={6} /></label>
          <label>{m.courses.capacity}<input id="nc-cap" name="capacity" type="number" min={1} max={500} required defaultValue={25} /></label>
          <label>{m.courses.price} (SAR)<input id="nc-price" name="price" type="number" min={0} step={50} required defaultValue={1200} /></label>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <footer className="modal-foot">
          <button type="button" className="btn btn-ghost" onClick={onClose}>{m.courses.cancel}</button>
          <button type="submit" className="btn btn-primary">{m.courses.save}</button>
        </footer>
      </form>
    </dialog>
  );
}
