"use client";

import { useEffect, useRef } from "react";
import { lastNDays } from "@/hooks/useStreak";

const level = (n: number) => (n === 0 ? 0 : n === 1 ? 1 : n <= 3 ? 2 : n <= 6 ? 3 : 4);
const BG = [
  "var(--c-surface2)",
  ...[28, 52, 76, 100].map((p) => `color-mix(in srgb, var(--c-blue) ${p}%, var(--c-surface2))`),
];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const CELL = 14;
const GAP = 3;

/** Completions per day. Cells are decorative; the figure label carries the summary. */
export default function ActivityHeatmap({ activity, weeks = 26 }: { activity: Record<string, number>; weeks?: number }) {
  const scroller = useRef<HTMLDivElement>(null);
  const days = lastNDays(weeks * 7);
  const lead = new Date(days[0]).getUTCDay();
  const cells: (string | null)[] = [...Array(lead).fill(null), ...days];
  const cols = Math.ceil(cells.length / 7);

  useEffect(() => {
    if (scroller.current) scroller.current.scrollLeft = scroller.current.scrollWidth;
  }, []);

  const months: { label: string; col: number }[] = [];
  let prev = -1;
  for (let c = 0; c < cols; c++) {
    const d = cells.slice(c * 7, c * 7 + 7).find(Boolean);
    if (!d) continue;
    const m = new Date(d).getUTCMonth();
    if (m !== prev) { months.push({ label: MONTHS[m], col: c }); prev = m; }
  }

  const total = days.reduce((n, d) => n + (activity[d] ?? 0), 0);
  const active = days.filter((d) => (activity[d] ?? 0) > 0).length;

  return (
    <figure>
      <div ref={scroller} style={{ overflowX: "auto", paddingBottom: 6 }}>
        <div style={{ display: "inline-grid", gridTemplateColumns: `24px auto`, columnGap: 6 }}>
          <span />
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, ${CELL}px)`, columnGap: GAP, height: 18 }} aria-hidden>
            {months.map((m) => (
              <span key={m.col} className="label" style={{ gridColumn: m.col + 1, whiteSpace: "nowrap", fontSize: 11 }}>{m.label}</span>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateRows: `repeat(7, ${CELL}px)`, rowGap: GAP }} aria-hidden>
            {["", "Mon", "", "Wed", "", "Fri", ""].map((d, i) => (
              <span key={i} className="label" style={{ fontSize: 11, lineHeight: `${CELL}px` }}>{d}</span>
            ))}
          </div>
          <div style={{ display: "grid", gridAutoFlow: "column", gridTemplateRows: `repeat(7, ${CELL}px)`, gridAutoColumns: `${CELL}px`, gap: GAP }} role="img" aria-label={`${total} completions on ${active} days in the last ${weeks} weeks`}>
            {cells.map((d, i) =>
              d ? (
                <span
                  key={d}
                  title={`${activity[d] ?? 0} completed on ${new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", timeZone: "UTC" })}`}
                  style={{ borderRadius: 3, background: BG[level(activity[d] ?? 0)] }}
                />
              ) : (
                <span key={`pad-${i}`} />
              ),
            )}
          </div>
        </div>
      </div>
      <figcaption style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 8, marginTop: 10 }}>
        <span className="label">{total} completed on {active} days in the last {weeks} weeks</span>
        <span className="label" style={{ display: "inline-flex", alignItems: "center", gap: 4 }} aria-hidden>
          Less {BG.map((b, i) => <span key={i} style={{ width: 11, height: 11, borderRadius: 2, background: b }} />)} More
        </span>
      </figcaption>
    </figure>
  );
}
