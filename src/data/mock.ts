import type {
  CategoryId, Course, CourseStatus, Enrollment, EnrollmentStatus, Localized, Person, Session, Trainee,
} from "../types";

// Deterministic sample data: the same seed always produces the same center.
function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(20261117);
const int = (min: number, max: number) => Math.floor(rnd() * (max - min + 1)) + min;
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rnd() * arr.length)];

// "Today" for the demo is fixed so charts and dates stay stable.
export const TODAY = new Date("2026-11-17T09:00:00");
const daysFrom = (d: number) => {
  const x = new Date(TODAY); x.setDate(x.getDate() + d); return x;
};
const iso = (d: Date) => d.toISOString().slice(0, 10);

const FIRST: Person[] = [
  { ar: "أحمد", latin: "Ahmed" }, { ar: "محمد", latin: "Mohammed" }, { ar: "سارة", latin: "Sara" },
  { ar: "نور", latin: "Nour" }, { ar: "خالد", latin: "Khaled" }, { ar: "ليلى", latin: "Layla" },
  { ar: "عمر", latin: "Omar" }, { ar: "ريم", latin: "Reem" }, { ar: "يوسف", latin: "Yousef" },
  { ar: "هدى", latin: "Huda" }, { ar: "فيصل", latin: "Faisal" }, { ar: "مريم", latin: "Maryam" },
  { ar: "عبدالله", latin: "Abdullah" }, { ar: "دانة", latin: "Dana" }, { ar: "سلمان", latin: "Salman" },
  { ar: "لمى", latin: "Lama" }, { ar: "طارق", latin: "Tariq" }, { ar: "جود", latin: "Joud" },
];
const LAST: Person[] = [
  { ar: "العتيبي", latin: "Al-Otaibi" }, { ar: "الحربي", latin: "Al-Harbi" }, { ar: "الزهراني", latin: "Al-Zahrani" },
  { ar: "القحطاني", latin: "Al-Qahtani" }, { ar: "البلوشي", latin: "Al-Balushi" }, { ar: "النعيمي", latin: "Al-Nuaimi" },
  { ar: "الخطيب", latin: "Al-Khatib" }, { ar: "الشمري", latin: "Al-Shammari" }, { ar: "حداد", latin: "Haddad" },
  { ar: "المصري", latin: "Al-Masri" }, { ar: "السالم", latin: "Al-Salem" }, { ar: "الكندي", latin: "Al-Kindi" },
];
const CITIES: Localized[] = [
  { en: "Riyadh", ar: "الرياض", tr: "Riyad" }, { en: "Jeddah", ar: "جدة", tr: "Cidde" },
  { en: "Dubai", ar: "دبي", tr: "Dubai" }, { en: "Muscat", ar: "مسقط", tr: "Maskat" },
  { en: "Amman", ar: "عمّان", tr: "Amman" }, { en: "Doha", ar: "الدوحة", tr: "Doha" },
  { en: "Istanbul", ar: "إسطنبول", tr: "İstanbul" }, { en: "Kuwait City", ar: "الكويت", tr: "Kuveyt" },
];
export const ROOMS: Localized[] = [
  { en: "Hall A", ar: "القاعة أ", tr: "Salon A" }, { en: "Hall B", ar: "القاعة ب", tr: "Salon B" },
  { en: "Lab 2", ar: "المختبر 2", tr: "Laboratuvar 2" }, { en: "Online", ar: "عن بُعد", tr: "Çevrim içi" },
];

const person = (): Person => {
  const f = pick(FIRST), l = pick(LAST);
  return { ar: `${f.ar} ${l.ar}`, latin: `${f.latin} ${l.latin}` };
};

const CATALOG: { title: Localized; category: CategoryId; price: number }[] = [
  { category: "tech", price: 1800, title: { en: "Modern Web Development with Vue 3", ar: "تطوير الويب الحديث باستخدام Vue 3", tr: "Vue 3 ile Modern Web Geliştirme" } },
  { category: "tech", price: 2200, title: { en: "React & TypeScript Bootcamp", ar: "معسكر React وTypeScript", tr: "React ve TypeScript Kampı" } },
  { category: "tech", price: 1500, title: { en: "Data Analysis with Python", ar: "تحليل البيانات باستخدام Python", tr: "Python ile Veri Analizi" } },
  { category: "tech", price: 2600, title: { en: "Cybersecurity Fundamentals", ar: "أساسيات الأمن السيبراني", tr: "Siber Güvenliğin Temelleri" } },
  { category: "management", price: 2400, title: { en: "Project Management (PMP Prep)", ar: "إدارة المشاريع (التحضير لـ PMP)", tr: "Proje Yönetimi (PMP Hazırlık)" } },
  { category: "management", price: 1200, title: { en: "Leadership for New Managers", ar: "القيادة للمديرين الجدد", tr: "Yeni Yöneticiler için Liderlik" } },
  { category: "management", price: 950, title: { en: "Effective Communication at Work", ar: "التواصل الفعّال في بيئة العمل", tr: "İş Yerinde Etkili İletişim" } },
  { category: "languages", price: 900, title: { en: "Business English", ar: "الإنجليزية لبيئة الأعمال", tr: "İş İngilizcesi" } },
  { category: "languages", price: 850, title: { en: "Turkish for Beginners", ar: "اللغة التركية للمبتدئين", tr: "Yeni Başlayanlar için Türkçe" } },
  { category: "design", price: 1400, title: { en: "UI/UX Design with Figma", ar: "تصميم الواجهات وتجربة المستخدم بـ Figma", tr: "Figma ile UI/UX Tasarımı" } },
  { category: "design", price: 1100, title: { en: "Graphic Design Essentials", ar: "أساسيات التصميم الجرافيكي", tr: "Grafik Tasarımın Temelleri" } },
  { category: "finance", price: 1700, title: { en: "Financial Analysis & Modeling", ar: "التحليل والنمذجة المالية", tr: "Finansal Analiz ve Modelleme" } },
  { category: "finance", price: 1300, title: { en: "Accounting for Non-Accountants", ar: "المحاسبة لغير المحاسبين", tr: "Muhasebeci Olmayanlar için Muhasebe" } },
  { category: "tech", price: 1900, title: { en: "AI Tools for Professionals", ar: "أدوات الذكاء الاصطناعي للمهنيين", tr: "Profesyoneller için Yapay Zekâ Araçları" } },
];

export const courses: Course[] = CATALOG.map((c, i) => {
  const offset = i % 3 === 0 ? int(5, 40) : i % 3 === 1 ? int(-40, -3) : int(-110, -20);
  const weeks = pick([4, 6, 8, 10, 12]);
  const end = offset + weeks * 7;
  const status: CourseStatus = offset > 0 ? "upcoming" : end < 0 ? "completed" : "running";
  const capacity = pick([20, 25, 30, 40]);
  const enrolled = status === "upcoming" ? int(Math.round(capacity * 0.3), capacity) : int(Math.round(capacity * 0.6), capacity);
  return {
    id: `C-${String(101 + i)}`,
    title: c.title, category: c.category, instructor: person(),
    mode: rnd() > 0.45 ? "online" : "onsite",
    start: iso(daysFrom(offset)), weeks, capacity, enrolled,
    price: c.price, rating: Math.round((3.9 + rnd() * 1.1) * 10) / 10, status,
  };
});

export const trainees: Trainee[] = Array.from({ length: 64 }, (_, i) => {
  const name = person();
  const last = int(0, 60);
  return {
    id: `T-${String(1001 + i)}`,
    name,
    email: `${name.latin.toLowerCase().replace(/[^a-z]+/g, ".")}${int(1, 99)}@example.com`,
    city: pick(CITIES),
    courses: int(1, 4),
    progress: int(5, 100),
    lastActive: iso(daysFrom(-last)),
    status: last > 30 ? "inactive" : "active",
  };
});

const ESTATUS: EnrollmentStatus[] = ["paid", "paid", "paid", "paid", "pending", "pending", "cancelled"];
export const enrollments: Enrollment[] = Array.from({ length: 140 }, (_, i) => {
  const c = pick(courses);
  return {
    id: `E-${String(5001 + i)}`,
    traineeId: pick(trainees).id,
    courseId: c.id,
    date: iso(daysFrom(-int(0, 360))),
    amount: c.price,
    status: pick(ESTATUS),
  };
}).sort((a, b) => b.date.localeCompare(a.date));

export const sessions: Session[] = courses
  .filter((c) => c.status !== "completed")
  .flatMap((c) => [int(0, 6), int(7, 13)].map((d, k) => {
    const dt = daysFrom(d); dt.setHours(pick([9, 11, 14, 17, 19]), 0, 0, 0);
    return { id: `${c.id}-${k}`, courseId: c.id, date: dt.toISOString(), room: c.mode === "online" ? ROOMS[3] : pick(ROOMS.slice(0, 3)) };
  }))
  .sort((a, b) => a.date.localeCompare(b.date));

// Monthly enrollments for the last 12 months, shaped with a gentle seasonal curve.
export const monthly = Array.from({ length: 12 }, (_, i) => {
  const d = new Date(TODAY.getFullYear(), TODAY.getMonth() - 11 + i, 1);
  const base = 48 + i * 4 + Math.round(Math.sin((i / 11) * Math.PI * 2) * 9);
  const n = base + int(-5, 6);
  return { month: d.toISOString().slice(0, 7), enrollments: n, completions: Math.round(n * (0.62 + rnd() * 0.15)) };
});

export const courseById = (id: string) => courses.find((c) => c.id === id)!;
export const traineeById = (id: string) => trainees.find((t) => t.id === id)!;
