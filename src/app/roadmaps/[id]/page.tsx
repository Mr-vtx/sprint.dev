"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronDown, ChevronRight, Clock, CheckCircle2, Circle, ExternalLink } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { roadmaps } from "@/lib/data";

const phaseColors: Record<string, string> = {
  blue: "var(--c-blue)", green: "var(--c-green)", amber: "var(--c-amber)",
};
const phaseDimColors: Record<string, string> = {
  blue: "var(--c-blue-dim)", green: "var(--c-green-dim)", amber: "var(--c-amber-dim)",
};
const phaseTags: Record<string, string> = {
  blue: "tag-blue", green: "tag-green", amber: "tag-amber",
};

export default async function RoadmapPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;  
const roadmap = roadmaps.find((r) => r.id === id);  if (!roadmap) notFound();

  const [expandedTopics, setExpandedTopics] = useState<string[]>([]);
  const [completedTopics, setCompletedTopics] = useState<string[]>([]);
  const [activePhase, setActivePhase] = useState(roadmap.phases[0].id);

  const toggleTopic = (id: string) =>
    setExpandedTopics((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const toggleComplete = (id: string) =>
    setCompletedTopics((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  const totalTopics = roadmap.phases.flatMap((p) => p.topics).length;
  const overallProgress = Math.round((completedTopics.length / totalTopics) * 100);

  return (
    <div style={{ minHeight: "100vh", background: "var(--c-bg)" }} className="dark:bg-[var(--c-dark-bg)]">
      <Navbar />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 24px 64px" }}>

        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 24, fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--c-ink3)" }}
          className="dark:text-[var(--c-dark-ink3)]">
          <Link href="/roadmaps" style={{ display: "flex", alignItems: "center", gap: 4, color: "inherit", textDecoration: "none" }}
            className="hover:text-[var(--c-ink)] dark:hover:text-[var(--c-dark-ink)] transition-colors">
            <ArrowLeft size={12} /> roadmaps
          </Link>
          <ChevronRight size={12} style={{ opacity: 0.4 }} />
          <span className="truncate max-w-[200px]" style={{ color: "var(--c-ink2)" }}>{roadmap.title}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="card" style={{ padding: 20, position: "sticky", top: 72 }}>
              <div style={{ display: "flex", gap: 3, marginBottom: 16 }}>
                {roadmap.phases.map((p) => (
                  <div key={p.id} style={{ height: 2, flex: 1, borderRadius: 99, background: phaseColors[p.color] }} />
                ))}
              </div>

              <h1 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, letterSpacing: "-0.025em", lineHeight: 1.2, marginBottom: 6 }}
                className="text-[var(--c-ink)] dark:text-[var(--c-dark-ink)]">
                {roadmap.title}
              </h1>
              <p style={{ fontSize: 13, lineHeight: 1.65, color: "var(--c-ink2)", marginBottom: 16 }} className="dark:text-[var(--c-dark-ink2)]">
                {roadmap.description}
              </p>

              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--c-ink3)" }} className="dark:text-[var(--c-dark-ink3)]">overall progress</span>
                  <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--c-blue)", fontWeight: 600 }}>{overallProgress}%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${overallProgress}%` }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 11.5, fontFamily: "var(--font-mono)", borderTop: "1px solid var(--c-border)", paddingTop: 14 }}
                className="dark:border-[var(--c-dark-border)]">
                {[
                  ["duration", roadmap.duration],
                  ["per week", roadmap.hoursPerWeek],
                  ["total hrs", `${roadmap.totalHours}h`],
                  ["phases", `${roadmap.phases.length}`],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p style={{ color: "var(--c-ink3)", marginBottom: 1, fontSize: 10 }} className="dark:text-[var(--c-dark-ink3)]">{k}</p>
                    <p style={{ color: "var(--c-ink)", fontWeight: 600 }} className="dark:text-[var(--c-dark-ink)]">{v}</p>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 16, borderTop: "1px solid var(--c-border)", paddingTop: 14 }} className="dark:border-[var(--c-dark-border)]">
                <p style={{ fontSize: 10.5, fontFamily: "var(--font-mono)", color: "var(--c-ink3)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}
                  className="dark:text-[var(--c-dark-ink3)]">prerequisites</p>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                  {roadmap.prerequisites.map((p) => (
                    <li key={p} style={{ fontSize: 12.5, color: "var(--c-ink2)", lineHeight: 1.5, display: "flex", gap: 6 }} className="dark:text-[var(--c-dark-ink2)]">
                      <span style={{ color: "var(--c-blue)", flexShrink: 0, marginTop: 2 }}>›</span> {p}
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ marginTop: 16, borderTop: "1px solid var(--c-border)", paddingTop: 14, display: "flex", flexDirection: "column", gap: 5 }}
                className="dark:border-[var(--c-dark-border)]">
                <p style={{ fontSize: 10.5, fontFamily: "var(--font-mono)", color: "var(--c-ink3)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}
                  className="dark:text-[var(--c-dark-ink3)]">phases</p>
                {roadmap.phases.map((p) => {
                  const pDone = p.topics.filter((t) => completedTopics.includes(t.id)).length;
                  const isActive = activePhase === p.id;
                  return (
                    <button key={p.id} onClick={() => setActivePhase(p.id)}
                      style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: "var(--radius-sm)", border: "none", cursor: "pointer", textAlign: "left", background: isActive ? phaseDimColors[p.color] : "transparent", transition: "background 0.12s" }}
                      className="hover:bg-[var(--c-surface2)] dark:hover:bg-[var(--c-dark-surface2)]">
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: phaseColors[p.color], flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--c-ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                          className="dark:text-[var(--c-dark-ink)]">{p.title}</p>
                        <p style={{ fontSize: 10.5, fontFamily: "var(--font-mono)", color: "var(--c-ink3)" }} className="dark:text-[var(--c-dark-ink3)]">
                          {pDone}/{p.topics.length} done
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2" style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {roadmap.phases.map((phase) => {
              if (activePhase !== phase.id) return null;
              const phaseDone = phase.topics.filter((t) => completedTopics.includes(t.id)).length;

              return (
                <div key={phase.id}>
                  <div style={{ padding: "20px 24px", borderRadius: "var(--radius-md)", background: phaseDimColors[phase.color], border: `1px solid ${phaseColors[phase.color]}22`, marginBottom: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <span className={`tag ${phaseTags[phase.color]}`}>Phase {phase.number}</span>
                      <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--c-ink3)" }}>{phase.weekRange} · {phase.totalHours}h</span>
                    </div>
                    <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, letterSpacing: "-0.025em", marginBottom: 8 }}
                      className="text-[var(--c-ink)] dark:text-[var(--c-dark-ink)]">
                      {phase.title}
                    </h2>
                    <p style={{ fontSize: 13.5, lineHeight: 1.7, color: "var(--c-ink2)", marginBottom: 14 }} className="dark:text-[var(--c-dark-ink2)]">
                      {phase.summary}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ flex: 1, height: 3, background: "rgba(0,0,0,0.1)", borderRadius: 99, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${(phaseDone / phase.topics.length) * 100}%`, background: phaseColors[phase.color], borderRadius: 99, transition: "width 0.4s" }} />
                      </div>
                      <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: phaseColors[phase.color], fontWeight: 600, whiteSpace: "nowrap" }}>
                        {phaseDone}/{phase.topics.length}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {phase.topics.map((topic, tIdx) => {
                      const isExpanded = expandedTopics.includes(topic.id);
                      const isDone = completedTopics.includes(topic.id);

                      return (
                        <div key={topic.id} className="card" style={{ overflow: "hidden" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", cursor: "pointer", background: isDone ? "var(--c-surface)" : "transparent" }}
                            className="dark:bg-[var(--c-dark-surface)] hover:bg-[var(--c-surface)] dark:hover:bg-[var(--c-dark-surface)]"
                            onClick={() => toggleTopic(topic.id)}>

                            <button onClick={(e) => { e.stopPropagation(); toggleComplete(topic.id); }}
                              style={{ flexShrink: 0, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", color: isDone ? "var(--c-green)" : "var(--c-ink3)", transition: "color 0.12s" }}>
                              {isDone ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                            </button>

                            <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: phaseColors[phase.color], fontWeight: 600, width: 20, flexShrink: 0 }}>
                              {String(tIdx + 1).padStart(2, "0")}
                            </span>

                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.01em", fontFamily: "var(--font-display)", color: isDone ? "var(--c-ink3)" : "var(--c-ink)", textDecoration: isDone ? "line-through" : "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                                className="dark:text-[var(--c-dark-ink)]">
                                {topic.title}
                              </p>
                              <p style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--c-ink3)", marginTop: 1 }} className="dark:text-[var(--c-dark-ink3)]">
                                ~{topic.estimatedHours}h
                              </p>
                            </div>

                            <ChevronDown size={15} style={{ color: "var(--c-ink3)", transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }} />
                          </div>

                          {isExpanded && (
                            <div style={{ borderTop: "1px solid var(--c-border)", padding: "16px 16px 16px 46px" }}
                              className="dark:border-[var(--c-dark-border)]">

                              <div style={{ marginBottom: 16 }}>
                                <p style={{ fontSize: 10.5, fontFamily: "var(--font-mono)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--c-ink3)", marginBottom: 6 }}
                                  className="dark:text-[var(--c-dark-ink3)]">why this matters</p>
                                <p style={{ fontSize: 13.5, lineHeight: 1.7, color: "var(--c-ink2)" }} className="dark:text-[var(--c-dark-ink2)]">{topic.why}</p>
                              </div>

                              <div style={{ marginBottom: 16 }}>
                                <p style={{ fontSize: 10.5, fontFamily: "var(--font-mono)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--c-ink3)", marginBottom: 8 }}
                                  className="dark:text-[var(--c-dark-ink3)]">what to learn</p>
                                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 5 }}>
                                  {topic.subtopics.map((s) => (
                                    <li key={s} style={{ fontSize: 13, color: "var(--c-ink)", lineHeight: 1.55, display: "flex", gap: 8 }}
                                      className="dark:text-[var(--c-dark-ink)]">
                                      <span style={{ color: phaseColors[phase.color], fontFamily: "var(--font-mono)", fontSize: 11, marginTop: 3, flexShrink: 0 }}>›</span>
                                      {s}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div style={{ marginBottom: topic.milestone ? 16 : 0 }}>
                                <p style={{ fontSize: 10.5, fontFamily: "var(--font-mono)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--c-ink3)", marginBottom: 8 }}
                                  className="dark:text-[var(--c-dark-ink3)]">resources</p>
                                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
                                  {topic.resources.map((r) => (
                                    <li key={r} style={{ fontSize: 12.5, fontFamily: "var(--font-mono)", color: "var(--c-blue)", display: "flex", alignItems: "center", gap: 5 }}
                                      className="dark:text-[var(--c-blue-dk)]">
                                      <ExternalLink size={10} /> {r}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {topic.milestone && (
                                <div style={{ marginTop: 16, padding: "12px 14px", borderRadius: "var(--radius-sm)", background: phaseDimColors[phase.color], border: `1px solid ${phaseColors[phase.color]}30` }}>
                                  <p style={{ fontSize: 10.5, fontFamily: "var(--font-mono)", color: phaseColors[phase.color], letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 5 }}>milestone</p>
                                  <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--c-ink)" }} className="dark:text-[var(--c-dark-ink)]">{topic.milestone}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <div className="card" style={{ padding: 20, borderStyle: "dashed" }}>
              <p style={{ fontSize: 10.5, fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--c-blue)", marginBottom: 10 }}
                className="dark:text-[var(--c-blue-dk)]">final project</p>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--c-ink)" }} className="dark:text-[var(--c-dark-ink)]">
                {roadmap.finalProject}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
