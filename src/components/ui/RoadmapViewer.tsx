"use client";

import { useState } from "react";
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Flag, Clock, BookOpen, Lightbulb } from "lucide-react";
import type { Roadmap } from "@/lib/data";

const accent = {
  violet: {
    bar: "var(--c-purple)",
    tag: "tag-violet",
    dot: "var(--c-purple)",
    dimBg: "#ede9fe",
    dimDark: "#2e1065",
    textDark: "var(--c-purple-dk)"
  },

  blue: {
    bar: "var(--c-blue)",
    tag: "tag-blue",
    dot: "var(--c-blue)",
    dimBg: "#dbeafe",
    dimDark: "#172554",
    textDark: "var(--c-blue-dk)"
  },

  green: {
    bar: "var(--c-green)",
    tag: "tag-green",
    dot: "var(--c-green)",
    dimBg: "#dcfce7",
    dimDark: "#052e16",
    textDark: "var(--c-green-dk)"
  },

  amber: {
    bar: "var(--c-amber)",
    tag: "tag-amber",
    dot: "var(--c-amber)",
    dimBg: "#fef3c7",
    dimDark: "#1c0a00",
    textDark: "var(--c-amber-dk)"
  },
};

export default function RoadmapViewer({ roadmap }: { roadmap: Roadmap }) {
  const [expanded, setExpanded] = useState<string[]>([roadmap.phases[0]?.id]);
  const [done, setDone] = useState<string[]>([]);

  const totalTopics = roadmap.phases.reduce((s, p) => s + p.topics.length, 0);
  const progress = totalTopics ? Math.round((done.length / totalTopics) * 100) : 0;

  const togglePhase = (id: string) =>
    setExpanded((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  const toggleTopic = (id: string) =>
    setDone((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  return (
    <div className="space-y-3">
      <div className="card p-4 flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontSize: 13 }} className="font-medium text-[var(--c-ink)] dark:text-[var(--c-dark-ink)]">Your progress</span>
            <span style={{ fontSize: 13, color: "var(--c-purple)" }} className="font-semibold">{progress}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <p style={{ fontSize: 11.5 }} className="text-[var(--c-ink3)] dark:text-[var(--c-dark-ink3)] mt-1.5">
            {done.length} of {totalTopics} topics marked complete
          </p>
        </div>
      </div>

      {roadmap.phases.map((phase) => {
        const a = accent[phase.color];
        const isOpen = expanded.includes(phase.id);
        const phaseDone = phase.topics.filter((t) => done.includes(t.id)).length;

        return (
          <div key={phase.id} className="card overflow-hidden">
            <button
              onClick={() => togglePhase(phase.id)}
              className="w-full text-left"
              style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderBottom: isOpen ? `1px solid var(--c-border)` : "none" }}
            >
              <div style={{
                width: 30, height: 30, borderRadius: 6, background: a.bar,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, color: "white", fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700
              }}>
                {phase.number}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em" }}
                    className="text-[var(--c-ink)] dark:text-[var(--c-dark-ink)]">
                    {phase.title}
                  </span>
                  <span className={`tag ${a.tag}`} style={{ fontSize: 10 }}>{phase.weekRange}</span>
                </div>
                <p style={{ fontSize: 12 }} className="text-[var(--c-ink3)] dark:text-[var(--c-dark-ink3)] mt-0.5">
                  {phaseDone}/{phase.topics.length} topics · ~{phase.totalHours}h total
                </p>
              </div>

              <div className="shrink-0 text-[var(--c-ink3)] dark:text-[var(--c-dark-ink3)]">
                {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </div>
            </button>

            {isOpen && (
              <div>
                <div style={{ padding: "12px 16px 0", borderBottom: "1px solid var(--c-border)", paddingBottom: 12 }}
                  className="dark:border-[var(--c-dark-border)]">
                  <p style={{ fontSize: 13, lineHeight: 1.65 }} className="text-[var(--c-ink2)] dark:text-[var(--c-dark-ink2)]">
                    {phase.summary}
                  </p>
                </div>

                {phase.topics.map((topic, ti) => {
                  const isDone = done.includes(topic.id);

                  return (
                    <div key={topic.id} style={{ borderBottom: ti < phase.topics.length - 1 ? "1px solid var(--c-border)" : "none" }}
                      className="dark:border-[var(--c-dark-border)]">
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px" }}>
                        <button
                          onClick={() => toggleTopic(topic.id)}
                          style={{ marginTop: 2, flexShrink: 0, color: isDone ? "var(--c-green)" : "var(--c-ink3)" }}
                          className="hover:opacity-70 transition-opacity"
                        >
                          {isDone
                            ? <CheckCircle2 size={17} />
                            : <Circle size={17} />
                          }
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <p style={{ fontSize: 14, fontWeight: 600, fontFamily: "var(--font-display)", textDecoration: isDone ? "line-through" : "none", opacity: isDone ? 0.45 : 1 }}
                              className="text-[var(--c-ink)] dark:text-[var(--c-dark-ink)]">
                              {topic.title}
                            </p>
                            <span className="flex items-center gap-1 shrink-0 text-[var(--c-ink3)] dark:text-[var(--c-dark-ink3)]" style={{ fontSize: 11 }}>
                              <Clock size={10} /> ~{topic.estimatedHours}h
                            </span>
                          </div>

                          <p style={{ fontSize: 12.5, lineHeight: 1.6, marginTop: 4 }} className="text-[var(--c-ink2)] dark:text-[var(--c-dark-ink2)]">
                            {topic.why}
                          </p>

                          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 4 }}>
                            {topic.subtopics.map((s, si) => (
                              <div key={si} style={{ display: "flex", alignItems: "flex-start", gap: 7, fontSize: 12.5 }}>
                                <span style={{ width: 4, height: 4, borderRadius: "50%", background: a.dot, flexShrink: 0, marginTop: 5 }} />
                                <span className="text-[var(--c-ink2)] dark:text-[var(--c-dark-ink2)]">{s}</span>
                              </div>
                            ))}
                          </div>

                          {topic.resources.length > 0 && (
                            <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
                              {topic.resources.map((r, ri) => (
                                <span key={ri} className="tag tag-stone" style={{ fontSize: 11 }}>
                                  <BookOpen size={10} /> {r}
                                </span>
                              ))}
                            </div>
                          )}

                          {topic.milestone && (
                            <div style={{ marginTop: 10, padding: "9px 12px", borderRadius: 7, border: `1px dashed ${a.bar}`, background: "transparent", display: "flex", alignItems: "flex-start", gap: 7 }}>
                              <Flag size={12} style={{ color: a.bar, flexShrink: 0, marginTop: 2 }} />
                              <div>
                                <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: a.bar, marginBottom: 2 }}>Milestone</p>
                                <p style={{ fontSize: 12.5, lineHeight: 1.55 }} className="text-[var(--c-ink2)] dark:text-[var(--c-dark-ink2)]">
                                  {topic.milestone}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
