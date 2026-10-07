"use client";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { roadmapDoneKey } from "@/lib/progress";
import type { Roadmap } from "@/lib/data";

/** One dot per topic, grouped by phase. Fills in as the learner completes topics. */
export default function TopicDots({ roadmap }: { roadmap: Roadmap }) {
  const [done] = useLocalStorage<string[]>(roadmapDoneKey(roadmap.id), []);
  const total = roadmap.phases.reduce((n, p) => n + p.topics.length, 0);
  const count = roadmap.phases.reduce(
    (n, p) => n + p.topics.filter((t) => done.includes(t.id)).length,
    0,
  );

  return (
    <div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }} role="img" aria-label={`${count} of ${total} topics complete`}>
        {roadmap.phases.map((p) => (
          <div key={p.id} style={{ display: "flex", gap: 4 }}>
            {p.topics.map((t) => (
              <span
                key={t.id}
                style={{
                  width: 10, height: 10, borderRadius: "50%",
                  background: done.includes(t.id) ? "var(--c-green)" : "transparent",
                  border: `2px solid ${done.includes(t.id) ? "var(--c-green)" : "var(--c-border)"}`,
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <p className="label" style={{ marginTop: 8 }}>
        {count === 0 ? `${total} topics` : `${count} of ${total} topics done`}
      </p>
    </div>
  );
}
