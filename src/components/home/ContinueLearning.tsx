"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { roadmaps } from "@/lib/data";
import { readDone, roadmapDoneKey } from "@/lib/progress";

/** Shows only when the learner has started a roadmap and not finished it. */
export default function ContinueLearning() {
  const [item, setItem] = useState<{ id: string; title: string; next: string; done: number; total: number } | null>(null);

  useEffect(() => {
    for (const r of roadmaps) {
      const done = new Set(readDone(roadmapDoneKey(r.id)));
      const topics = r.phases.flatMap((p) => p.topics);
      const next = topics.find((t) => !done.has(t.id));
      if (done.size > 0 && next) {
        setItem({ id: r.id, title: r.title, next: next.title, done: done.size, total: topics.length });
        return;
      }
    }
  }, []);

  if (!item) return null;

  return (
    <section className="container" style={{ marginBottom: 72 }}>
      <Link href={`/roadmaps/${item.id}`} className="card card-hover" style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "space-between", alignItems: "center", padding: "18px 22px" }}>
        <div>
          <p className="label" style={{ marginBottom: 2 }}>Pick up where you left off</p>
          <p style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 700, letterSpacing: "-0.02em" }}>{item.title}: {item.next}</p>
        </div>
        <span className="label">{item.done} of {item.total} topics done</span>
      </Link>
    </section>
  );
}
