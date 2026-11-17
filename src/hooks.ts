import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const s = localStorage.getItem("tadreeb.theme");
      if (s === "light" || s === "dark") return s;
    } catch { /* ignore */ }
    return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem("tadreeb.theme", theme); } catch { /* ignore */ }
  }, [theme]);
  return [theme, setTheme] as const;
}

export type Route = "overview" | "courses" | "trainees" | "enrollments";
const ROUTES: Route[] = ["overview", "courses", "trainees", "enrollments"];

export function useRoute() {
  const read = (): Route => {
    const h = location.hash.replace(/^#\/?/, "") as Route;
    return ROUTES.includes(h) ? h : "overview";
  };
  const [route, setRoute] = useState<Route>(read);
  useEffect(() => {
    const on = () => { setRoute(read()); window.scrollTo({ top: 0 }); };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return route;
}

/** Reads chart colors from CSS tokens so charts follow the active theme. */
export function useCssColors(keys: string[], dep: unknown) {
  const get = () => {
    const cs = getComputedStyle(document.documentElement);
    return Object.fromEntries(keys.map((k) => [k, cs.getPropertyValue(`--${k}`).trim()]));
  };
  const [colors, setColors] = useState<Record<string, string>>(get);
  useEffect(() => {
    // Wait a frame so the parent's theme attribute is applied before reading.
    const id = requestAnimationFrame(() => setColors(get()));
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dep]);
  return colors;
}
