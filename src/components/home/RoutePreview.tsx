"use client";

import Link from "next/link";
import { Check, Hammer } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useStreak } from "@/hooks/useStreak";
import { roadmapDoneKey } from "@/lib/progress";
import { roadmaps } from "@/lib/data";

/**
 * Live slice of the first roadmap. The checkboxes write to the same
 * storage key as the full roadmap page, so this is real progress.
 */
export default function RoutePreview() {
  const roadmap = roadmaps[0];
  const phase = roadmap.phases[0];
  const [done, setDone] = useLocalStorage<string[]>(roadmapDoneKey(roadmap.id), []);
  const { recordLesson, undoLesson } = useStreak();
  const count = phase.topics.filter((t) => done.includes(t.id)).length;

  const toggle = (id: string) => {
    const wasDone = done.includes(id);
    setDone((p) => (wasDone ? p.filter((x) => x !== id) : [...p, id]));
    if (wasDone) undoLesson(); else recordLesson();
  };

  return (
    <div className="card" style={{ padding: "26px 26px 22px", boxShadow: "var(--shadow-pop)" }}>
      <p className="label" style={{ marginBottom: 4 }}>{roadmap.title} · {phase.weekRange}</p>
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 22 }}>{phase.title}</h2>

      <div className="route" style={{ display: "grid", gap: 18 }}>
        {phase.topics.map((t) => {
          const isDone = done.includes(t.id);
          return (
            <div key={t.id} className="route-row">
              <button className="node" aria-pressed={isDone} aria-label={`${isDone ? "Mark incomplete" : "Mark complete"}: ${t.title}`} onClick={() => toggle(t.id)}>
                <Check strokeWidth={4} />
              </button>
              <p style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em", color: isDone ? "var(--c-ink3)" : "var(--c-ink)", marginBottom: 4 }}>{t.title}</p>
              {t.milestone && (
                <p style={{ fontSize: 13.5, color: "var(--c-ink2)", display: "flex", gap: 7, alignItems: "flex-start", lineHeight: 1.5 }}>
                  <Hammer size={13} style={{ color: "var(--c-amber)", flexShrink: 0, marginTop: 3 }} />
                  {t.milestone}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--c-border)" }}>
        <span className="label">{count} of {phase.topics.length} done · saved on this device</span>
        <Link href={`/roadmaps/${roadmap.id}`} className="btn btn-ghost btn-sm" style={{ color: "var(--c-blue)" }}>Open roadmap</Link>
      </div>
    </div>
  );
}
