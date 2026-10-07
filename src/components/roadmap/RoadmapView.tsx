"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, Clock, ExternalLink, Hammer } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useStreak } from "@/hooks/useStreak";
import { roadmapDoneKey } from "@/lib/progress";
import { courses, type Roadmap } from "@/lib/data";

const isUrl = (s: string) => /^(https?:\/\/|[a-z0-9-]+\.[a-z]{2,}(\/|$))/i.test(s);
const href = (s: string) => (s.startsWith("http") ? s : `https://${s}`);

export default function RoadmapView({ roadmap }: { roadmap: Roadmap }) {
  const [done, setDone, hydrated] = useLocalStorage<string[]>(roadmapDoneKey(roadmap.id), []);
  const [open, setOpen] = useState<string | null>(null);
  const { recordLesson, undoLesson } = useStreak();

  const topics = roadmap.phases.flatMap((p) => p.topics);
  const doneSet = new Set(done);
  const count = topics.filter((t) => doneSet.has(t.id)).length;
  const pct = Math.round((count / topics.length) * 100);
  const hoursDone = topics.filter((t) => doneSet.has(t.id)).reduce((n, t) => n + t.estimatedHours, 0);
  const next = topics.find((t) => !doneSet.has(t.id));
  const course = courses.find((c) => c.id === roadmap.id);

  // Open the next unfinished topic once saved progress has loaded.
  useEffect(() => {
    if (hydrated) setOpen(next?.id ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const toggleDone = (id: string) => {
    const wasDone = done.includes(id);
    setDone((prev) => (wasDone ? prev.filter((x) => x !== id) : [...prev, id]));
    if (wasDone) undoLesson(); else recordLesson();
  };

  return (
    <div className="grid lg:grid-cols-[320px_1fr] gap-12 items-start">
      {/* Summary */}
      <aside className="lg:sticky lg:top-24" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div>
          <h1 style={{ fontSize: "clamp(28px, 3.4vw, 38px)", fontWeight: 800, marginBottom: 10 }}>{roadmap.title}</h1>
          <p style={{ color: "var(--c-ink2)", fontSize: 15, lineHeight: 1.65 }}>{roadmap.description}</p>
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 }}>
            <span style={{ fontWeight: 600 }}>{count} of {topics.length} topics</span>
            <span className="label">{pct}%</span>
          </div>
          <div className="progress-track" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Roadmap progress">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <p className="label" style={{ marginTop: 8 }}>{hoursDone} of {roadmap.totalHours} hours</p>
        </div>

        {next && count > 0 && (
          <button className="btn btn-primary" onClick={() => { setOpen(next.id); document.getElementById(next.id)?.scrollIntoView({ behavior: "smooth", block: "center" }); }}>
            Resume: {next.title}
          </button>
        )}

        <dl style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px 18px", fontSize: 14, borderTop: "1px solid var(--c-border)", paddingTop: 20 }}>
          <dt style={{ color: "var(--c-ink3)" }}>Length</dt><dd>{roadmap.duration}</dd>
          <dt style={{ color: "var(--c-ink3)" }}>Pace</dt><dd>{roadmap.hoursPerWeek} a week</dd>
          <dt style={{ color: "var(--c-ink3)" }}>Level</dt><dd>{roadmap.level}</dd>
          <dt style={{ color: "var(--c-ink3)" }}>For</dt><dd>{roadmap.targetAudience}</dd>
        </dl>

        <div style={{ borderTop: "1px solid var(--c-border)", paddingTop: 20 }}>
          <h2 style={{ fontSize: 15, marginBottom: 10 }}>Before you start</h2>
          <ul style={{ listStyle: "none", display: "grid", gap: 6, fontSize: 14, color: "var(--c-ink2)" }}>
            {roadmap.prerequisites.map((p) => <li key={p}>{p}</li>)}
          </ul>
        </div>

        <div style={{ borderTop: "1px solid var(--c-border)", paddingTop: 20 }}>
          <h2 style={{ fontSize: 15, marginBottom: 10 }}>Phases</h2>
          <nav style={{ display: "grid", gap: 2 }} aria-label="Phases">
            {roadmap.phases.map((p) => {
              const d = p.topics.filter((t) => doneSet.has(t.id)).length;
              return (
                <a key={p.id} href={`#${p.id}`} className="hover:bg-[var(--c-surface2)]" style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "7px 10px", margin: "0 -10px", borderRadius: "var(--radius-sm)", fontSize: 14 }}>
                  <span>{p.title}</span>
                  <span className="label">{d}/{p.topics.length}</span>
                </a>
              );
            })}
          </nav>
        </div>

        {course && (
          <Link href={`/courses/${course.id}`} className="btn btn-outline">Watch the matching course</Link>
        )}
      </aside>

      {/* The route */}
      <div>
        {roadmap.phases.map((phase) => {
          const phaseDone = phase.topics.filter((t) => doneSet.has(t.id)).length;
          return (
            <section key={phase.id} id={phase.id} style={{ scrollMarginTop: 90, marginBottom: 56 }}>
              <header style={{ marginBottom: 22 }}>
                <p className="label" style={{ marginBottom: 6 }}>{phase.weekRange} · {phase.totalHours} hours · {phaseDone}/{phase.topics.length} done</p>
                <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>{phase.title}</h2>
                <p style={{ color: "var(--c-ink2)", fontSize: 15, maxWidth: 560 }}>{phase.summary}</p>
              </header>

              <div className="route" style={{ display: "grid", gap: 6 }}>
                {phase.topics.map((t) => {
                  const isDone = doneSet.has(t.id);
                  const isOpen = open === t.id;
                  const isNext = hydrated && next?.id === t.id;
                  return (
                    <div key={t.id} id={t.id} className="route-row" style={{ scrollMarginTop: 90 }}>
                      <button
                        className="node"
                        aria-pressed={isDone}
                        aria-label={`${isDone ? "Mark incomplete" : "Mark complete"}: ${t.title}`}
                        onClick={() => toggleDone(t.id)}
                        style={isNext && !isDone ? { borderColor: "var(--c-blue)", boxShadow: "0 0 0 4px var(--c-blue-dim)" } : undefined}
                      >
                        <Check strokeWidth={4} />
                      </button>

                      <button
                        onClick={() => setOpen(isOpen ? null : t.id)}
                        aria-expanded={isOpen}
                        style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "2px 0 6px", background: "none", border: "none", cursor: "pointer", textAlign: "left", color: "inherit" }}
                      >
                        <span style={{ flex: 1 }}>
                          <span style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 700, letterSpacing: "-0.02em", color: isDone ? "var(--c-ink3)" : "var(--c-ink)", textDecoration: isDone ? "line-through" : "none", textDecorationThickness: 1 }}>
                            {t.title}
                          </span>
                          {isNext && !isDone && <span className="tag tag-blue" style={{ marginLeft: 10 }}>Next</span>}
                        </span>
                        <span className="label" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Clock size={12} /> {t.estimatedHours}h</span>
                        <ChevronDown size={16} style={{ color: "var(--c-ink3)", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
                      </button>

                      {isOpen && (
                        <div style={{ paddingBottom: 14, display: "grid", gap: 18 }}>
                          <p style={{ color: "var(--c-ink2)", fontSize: 15, lineHeight: 1.7, maxWidth: 620 }}>{t.why}</p>

                          <div className="grid sm:grid-cols-2 gap-6">
                            <div>
                              <h3 style={{ fontSize: 14, marginBottom: 8 }}>Learn</h3>
                              <ul style={{ listStyle: "disc", paddingLeft: 18, display: "grid", gap: 4, fontSize: 14, color: "var(--c-ink2)" }}>
                                {t.subtopics.map((s) => <li key={s}>{s}</li>)}
                              </ul>
                            </div>
                            <div>
                              <h3 style={{ fontSize: 14, marginBottom: 8 }}>Read</h3>
                              <ul style={{ listStyle: "none", display: "grid", gap: 5, fontSize: 14 }}>
                                {t.resources.map((r) =>
                                  isUrl(r) ? (
                                    <li key={r}><a href={href(r)} target="_blank" rel="noopener noreferrer" style={{ color: "var(--c-blue)", display: "inline-flex", gap: 5, alignItems: "center" }}>{r.replace(/^https?:\/\//, "")} <ExternalLink size={11} /></a></li>
                                  ) : (
                                    <li key={r} style={{ color: "var(--c-ink2)" }}>{r}</li>
                                  ),
                                )}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}

                      {t.milestone && (
                        <div style={{ position: "relative", margin: "4px 0 14px", padding: "10px 14px", background: isDone ? "transparent" : "var(--c-amber-dim)", border: `1px solid ${isDone ? "var(--c-border)" : "transparent"}`, borderRadius: "var(--radius-sm)", display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14 }}>
                          <Hammer size={15} style={{ color: "var(--c-amber)", flexShrink: 0, marginTop: 3 }} />
                          <span><strong style={{ fontWeight: 600 }}>Build:</strong> <span style={{ color: "var(--c-ink2)" }}>{t.milestone}</span></span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

        <div style={{ borderTop: "1px solid var(--c-border)", paddingTop: 28 }}>
          <p className="label" style={{ marginBottom: 8 }}>Final project</p>
          <p style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", maxWidth: 620 }}>{roadmap.finalProject}</p>
        </div>
      </div>
    </div>
  );
}
