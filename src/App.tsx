import { useState } from "react";
import { useI18n } from "./i18n/I18nContext";
import { Icon } from "./components/ui";
import { courses as seed } from "./data/mock";
import { useRoute, useTheme, type Route } from "./hooks";
import { Overview } from "./pages/Overview";
import { Courses } from "./pages/Courses";
import { Trainees } from "./pages/Trainees";
import { Enrollments } from "./pages/Enrollments";
import type { Course, Lang } from "./types";

const NAV: { route: Route; icon: "grid" | "book" | "users" | "receipt" }[] = [
  { route: "overview", icon: "grid" },
  { route: "courses", icon: "book" },
  { route: "trainees", icon: "users" },
  { route: "enrollments", icon: "receipt" },
];

const LANGS: { value: Lang; label: string }[] = [
  { value: "en", label: "EN" },
  { value: "ar", label: "عربي" },
  { value: "tr", label: "TR" },
];

export default function App() {
  const { m, lang, setLang } = useI18n();
  const [theme, setTheme] = useTheme();
  const route = useRoute();
  const [courses, setCourses] = useState<Course[]>(seed);

  return (
    <div className="shell">
      <aside className="sidebar">
        <a className="brand" href="#/overview">
          <span className="brand-mark" aria-hidden="true">ت</span>
          <span className="brand-text">
            <strong>{m.appName}</strong>
            <small>{m.appTag}</small>
          </span>
        </a>
        <nav className="nav" aria-label="Main">
          {NAV.map((n) => (
            <a key={n.route} href={`#/${n.route}`} aria-current={route === n.route ? "page" : undefined}>
              <Icon name={n.icon} />
              <span>{m.nav[n.route]}</span>
            </a>
          ))}
        </nav>
        <p className="demo-note">{m.demo}</p>
      </aside>

      <div className="main">
        <header className="topbar">
          <a className="brand brand-sm" href="#/overview">
            <span className="brand-mark" aria-hidden="true">ت</span>
            <strong>{m.appName}</strong>
          </a>
          <div className="topbar-tools">
            <div className="lang" role="group" aria-label="Language">
              {LANGS.map((l) => (
                <button key={l.value} type="button" lang={l.value} aria-pressed={lang === l.value} onClick={() => setLang(l.value)}>
                  {l.label}
                </button>
              ))}
            </div>
            <button type="button" className="icon-btn" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label={theme === "dark" ? m.theme.light : m.theme.dark} title={theme === "dark" ? m.theme.light : m.theme.dark}>
              <Icon name={theme === "dark" ? "sun" : "moon"} />
            </button>
          </div>
        </header>

        <main className="content">
          {route === "overview" && <Overview courses={courses} theme={theme} />}
          {route === "courses" && <Courses courses={courses} onAdd={(c) => setCourses((cs) => [c, ...cs])} />}
          {route === "trainees" && <Trainees />}
          {route === "enrollments" && <Enrollments />}
        </main>
      </div>

      <nav className="tabbar" aria-label="Main">
        {NAV.map((n) => (
          <a key={n.route} href={`#/${n.route}`} aria-current={route === n.route ? "page" : undefined}>
            <Icon name={n.icon} />
            <span>{m.nav[n.route]}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}
