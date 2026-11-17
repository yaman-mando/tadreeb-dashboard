import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { messages, type Messages } from "./messages";
import type { Lang, Localized, Person } from "../types";

const LOCALES: Record<Lang, string> = { en: "en-GB", ar: "ar-SA-u-nu-latn-ca-gregory", tr: "tr-TR" };

interface I18n {
  lang: Lang;
  dir: "ltr" | "rtl";
  m: Messages;
  setLang: (l: Lang) => void;
  fmt: (template: string, vars: Record<string, string | number>) => string;
  loc: (v: Localized) => string;
  name: (p: Person) => string;
  num: (n: number, opts?: Intl.NumberFormatOptions) => string;
  money: (n: number) => string;
  date: (iso: string, opts?: Intl.DateTimeFormatOptions) => string;
}

const Ctx = createContext<I18n | null>(null);

function initialLang(): Lang {
  const q = new URLSearchParams(location.search).get("lang");
  if (q === "en" || q === "ar" || q === "tr") return q;
  try {
    const s = localStorage.getItem("tadreeb.lang");
    if (s === "en" || s === "ar" || s === "tr") return s;
  } catch { /* storage unavailable */ }
  const nav = navigator.language.slice(0, 2);
  return nav === "ar" || nav === "tr" ? nav : "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(initialLang);
  const dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    try { localStorage.setItem("tadreeb.lang", lang); } catch { /* ignore */ }
  }, [lang, dir]);

  const value = useMemo<I18n>(() => {
    const locale = LOCALES[lang];
    return {
      lang, dir, m: messages[lang], setLang,
      fmt: (t, vars) => t.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? "")),
      loc: (v) => v[lang] || v.en,
      name: (p) => (lang === "ar" ? p.ar : p.latin),
      num: (n, opts) => new Intl.NumberFormat(locale, opts).format(n),
      money: (n) => new Intl.NumberFormat(locale, { style: "currency", currency: "SAR", maximumFractionDigits: 0 }).format(n),
      date: (iso, opts) => new Intl.DateTimeFormat(locale, opts ?? { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso)),
    };
  }, [lang, dir]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useI18n must be used inside I18nProvider");
  return v;
}
