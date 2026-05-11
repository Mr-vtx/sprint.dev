"use client";

import { lastNDays } from "@/hooks/useStreak";

interface Props {
  activity: Record<string, number>;
  weeks?: number;
}

function getLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count <= 3)  return 2;
  if (count <= 6)  return 3;
  return 4;
}

const COLORS = {
  0: "var(--c-surface2)",
  1: "#bfdbfe",
  2: "#60a5fa",
  3: "#2563eb",
  4: "#1e40af",
};

const COLORS_DARK = {
  0: "var(--c-surface2)",
  1: "#1e3a5f",
  2: "#1d4ed8",
  3: "#2563eb",
  4: "#60a5fa",
};

const DAY_NAMES = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function ActivityHeatmap({ activity, weeks = 16 }: Props) {
  const days  = lastNDays(weeks * 7);
  const today = new Date().toISOString().slice(0, 10);

  const firstDay  = new Date(days[0]).getDay(); // 0=Sun
  const padded    = [...Array(firstDay).fill(null), ...days];

  const cols: (string | null)[][] = [];
  for (let i = 0; i < padded.length; i += 7) {
    cols.push(padded.slice(i, i + 7));
  }

  const monthLabels: { label: string; col: number }[] = [];
  let lastMonth = -1;
  cols.forEach((col, ci) => {
    const firstReal = col.find(Boolean);
    if (firstReal) {
      const m = new Date(firstReal).getMonth();
      if (m !== lastMonth) { monthLabels.push({ label: MONTH_NAMES[m], col: ci }); lastMonth = m; }
    }
  });

  return (
    <div>
      <div style={{ display: "flex", marginBottom: 4, marginLeft: 20 }}>
        {cols.map((_, ci) => {
          const lbl = monthLabels.find((m) => m.col === ci);
          return (
            <div key={ci} style={{ width: 14, flexShrink: 0, fontSize: 9, fontFamily: "var(--font-mono)", color: "var(--c-ink3)", whiteSpace: "nowrap" }}>
              {lbl ? lbl.label : ""}
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 0 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2, marginRight: 4 }}>
          {DAY_NAMES.map((d, i) => (
            <div key={i} style={{ height: 12, fontSize: 9, fontFamily: "var(--font-mono)", color: "var(--c-ink3)", lineHeight: "12px", opacity: i % 2 === 1 ? 1 : 0 }}>
              {d}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 2 }}>
          {cols.map((col, ci) => (
            <div key={ci} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {col.map((date, di) => {
                if (!date) return <div key={di} style={{ width: 12, height: 12 }} />;
                const count = activity[date] ?? 0;
                const level = getLevel(count);
                const isToday = date === today;
                return (
                  <div
                    key={date}
                    title={`${date}: ${count} lesson${count !== 1 ? "s" : ""}`}
                    style={{
                      width: 12, height: 12, borderRadius: 2,
                      background: COLORS[level],
                      outline: isToday ? "2px solid var(--c-blue)" : "none",
                      outlineOffset: 1,
                      transition: "opacity 0.12s",
                      cursor: "default",
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, justifyContent: "flex-end" }}>
        <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--c-ink3)" }}>less</span>
        {([0, 1, 2, 3, 4] as const).map((l) => (
          <div key={l} style={{ width: 12, height: 12, borderRadius: 2, background: COLORS[l] }} />
        ))}
        <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--c-ink3)" }}>more</span>
      </div>
    </div>
  );
}
