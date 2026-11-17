import { useMemo, useState, type ReactNode } from "react";
import { useI18n } from "../i18n/I18nContext";
import { Icon } from "./ui";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
  align?: "start" | "end";
  hideOnMobile?: boolean;
}

interface Props<T> {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  pageSize?: number;
  initialSort?: { key: string; dir: "asc" | "desc" };
}

export function DataTable<T>({ rows, columns, rowKey, pageSize = 10, initialSort }: Props<T>) {
  const { m, fmt, num, lang } = useI18n();
  const [sort, setSort] = useState(initialSort);
  const [page, setPage] = useState(0);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortValue) return rows;
    const collator = new Intl.Collator(lang);
    const out = [...rows].sort((a, b) => {
      const va = col.sortValue!(a), vb = col.sortValue!(b);
      const r = typeof va === "number" && typeof vb === "number" ? va - vb : collator.compare(String(va), String(vb));
      return sort.dir === "asc" ? r : -r;
    });
    return out;
  }, [rows, columns, sort, lang]);

  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = Math.min(page, pages - 1);
  const slice = sorted.slice(current * pageSize, current * pageSize + pageSize);

  const toggle = (key: string) => {
    setPage(0);
    setSort((s) => (s?.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
  };

  return (
    <div className="table-wrap">
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key} className={`${c.align === "end" ? "end" : ""} ${c.hideOnMobile ? "hide-sm" : ""}`}
                  aria-sort={sort?.key === c.key ? (sort.dir === "asc" ? "ascending" : "descending") : undefined}>
                  {c.sortValue ? (
                    <button type="button" className="th-btn" onClick={() => toggle(c.key)} title={fmt(m.table.sortBy, { col: c.header })}>
                      {c.header}
                      <span className={`sort-ind ${sort?.key === c.key ? "on" : ""}`}>
                        <Icon name={sort?.key === c.key && sort.dir === "desc" ? "down" : "up"} />
                      </span>
                    </button>
                  ) : c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.map((r) => (
              <tr key={rowKey(r)}>
                {columns.map((c) => (
                  <td key={c.key} className={`${c.align === "end" ? "end" : ""} ${c.hideOnMobile ? "hide-sm" : ""}`}>{c.render(r)}</td>
                ))}
              </tr>
            ))}
            {slice.length === 0 && (
              <tr><td colSpan={columns.length} className="empty">{m.table.empty}</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {sorted.length > pageSize && (
        <div className="pager">
          <span className="muted">
            {fmt(m.table.showing, { from: num(current * pageSize + 1), to: num(Math.min(sorted.length, (current + 1) * pageSize)), total: num(sorted.length) })}
          </span>
          <div className="pager-btns">
            <button type="button" className="btn btn-ghost" disabled={current === 0} onClick={() => setPage(current - 1)}>{m.table.prev}</button>
            <button type="button" className="btn btn-ghost" disabled={current >= pages - 1} onClick={() => setPage(current + 1)}>{m.table.next}</button>
          </div>
        </div>
      )}
    </div>
  );
}
