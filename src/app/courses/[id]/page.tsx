"use client";

import { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, CheckCircle2, Circle, Clock, Users, Star,
  BookOpen, ChevronRight, FileText, ExternalLink, Keyboard,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import VideoPlayer from "@/components/ui/VideoPlayer";
import LessonNotes from "@/components/ui/LessonNotes";
import SuggestVideo from "@/components/ui/SuggestVideo";
import { useKeyboardShortcuts, ShortcutsPanel } from "@/components/ui/KeyboardShortcuts";
import { getMergedCourses } from "@/lib/courseStore";
import { courses as STATIC } from "@/lib/data";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const ACCENT: Record<string, { bar: string; tag: string }> = {
  blue:  { bar: "var(--c-blue)",  tag: "tag-blue"  },
  green: { bar: "var(--c-green)", tag: "tag-green" },
  amber: { bar: "var(--c-amber)", tag: "tag-amber" },
};

type SideTab = "outline" | "notes" | "resources" | "shortcuts";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
    const [courses, setCourses] = useState(STATIC);
  useEffect(() => { setCourses(getMergedCourses()); }, []);

const course = courses.find((c) => c.id === id);
if (!course && STATIC.find((c) => c.id === id) === undefined) notFound();
const c = course ?? STATIC.find((c) => c.id === id)!;
  const a = ACCENT[c.color];
  const [activeIdx,    setActiveIdx]    = useState(0);
  const [completed,    setCompleted]    = useLocalStorage<string[]>(`vs-done-${c.id}`, []);
  const [sideTab,      setSideTab]      = useState<SideTab>("outline");
  const [lessonSearch, setLessonSearch] = useState("");

  const activeLesson = c.lessons[activeIdx] ?? c.lessons[0];
  const progress = c.lessons.length > 0 ? Math.round((completed.length / c.lessons.length) * 100) : 0;

  const toggleDone = (id: string) =>
    setCompleted((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  const goNext = () => setActiveIdx((i) => Math.min(i + 1, c.lessons.length - 1));
  const goPrev = () => setActiveIdx((i) => Math.max(i - 1, 0));

  useKeyboardShortcuts({
    "arrowleft":  goPrev,
    "arrowright": goNext,
    "m":          () => activeLesson && toggleDone(activeLesson.id),
    "1":          () => setSideTab("outline"),
    "2":          () => setSideTab("notes"),
    "3":          () => setSideTab("resources"),
    "4":          () => setSideTab("shortcuts"),
  }, [activeIdx, activeLesson]);

  const filtered = c.lessons.filter((l) =>
    !lessonSearch || l.title.toLowerCase().includes(lessonSearch.toLowerCase())
  );

  const TABS: { id: SideTab; label: string }[] = [
    { id: "outline",   label: "Outline"   },
    { id: "notes",     label: "Notes"     },
    { id: "resources", label: "Resources" },
    { id: "shortcuts", label: "Keys"      },
  ];

  if (!activeLesson) return null;

  return (
    <div style={{ minHeight: "100vh", background: "var(--c-bg)" }}>
      <Navbar />

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "72px 20px 48px" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20, fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--c-ink3)" }}>
          <Link href="/courses" style={{ display: "flex", alignItems: "center", gap: 4, color: "inherit", textDecoration: "none" }}
            className="hover:text-[var(--c-ink)] transition-colors">
            <ArrowLeft size={12} /> courses
          </Link>
          <ChevronRight size={11} style={{ opacity: 0.4 }} />
          <span style={{ color: "var(--c-ink2)" }} className="truncate max-w-[160px]">{c.title}</span>
          <ChevronRight size={11} style={{ opacity: 0.4 }} />
          <span className="truncate max-w-[200px]">{activeLesson.title}</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20 }}>

          {/* ── Main ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <VideoPlayer youtubeId={activeLesson.youtubeId} videoUrl={activeLesson.videoUrl} title={activeLesson.title} />

            {/* Lesson header + nav */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(17px, 2.2vw, 22px)", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--c-ink)", marginBottom: 4 }}>
                  {activeLesson.title}
                </h1>
                <p style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--c-ink3)", display: "flex", alignItems: "center", gap: 8 }}>
                  <Clock size={11} /> {activeLesson.duration}
                  <span style={{ opacity: 0.4 }}>·</span>
                  lesson {activeIdx + 1} of {c.lessons.length}
                </p>
              </div>
              <div style={{ display: "flex", gap: 7, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
                <button onClick={goPrev} disabled={activeIdx === 0}
                  style={{ padding: "7px 12px", fontSize: 12, fontFamily: "var(--font-mono)", background: "none", border: "1px solid var(--c-border)", borderRadius: "var(--radius-sm)", cursor: activeIdx === 0 ? "not-allowed" : "pointer", color: "var(--c-ink2)", opacity: activeIdx === 0 ? 0.4 : 1 }}>
                  ← prev
                </button>
                <button onClick={goNext} disabled={activeIdx === c.lessons.length - 1}
                  style={{ padding: "7px 12px", fontSize: 12, fontFamily: "var(--font-mono)", background: "none", border: "1px solid var(--c-border)", borderRadius: "var(--radius-sm)", cursor: activeIdx === c.lessons.length - 1 ? "not-allowed" : "pointer", color: "var(--c-ink2)", opacity: activeIdx === c.lessons.length - 1 ? 0.4 : 1 }}>
                  next →
                </button>
                <button onClick={() => toggleDone(activeLesson.id)}
                  style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", fontSize: 12, fontFamily: "var(--font-mono)", fontWeight: 600, background: completed.includes(activeLesson.id) ? "var(--c-green)" : "none", border: `1px solid ${completed.includes(activeLesson.id) ? "var(--c-green)" : "var(--c-border)"}`, borderRadius: "var(--radius-sm)", cursor: "pointer", color: completed.includes(activeLesson.id) ? "#fff" : "var(--c-ink2)", transition: "all 0.15s" }}>
                  {completed.includes(activeLesson.id) ? <CheckCircle2 size={12} /> : <Circle size={12} />}
                  {completed.includes(activeLesson.id) ? "done" : "mark done"}
                </button>
              </div>
            </div>

            {/* Progress */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--c-ink3)" }}>{completed.length}/{c.lessons.length} completed</span>
                <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: a.bar, fontWeight: 700 }}>{progress}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${progress}%`, background: a.bar }} />
              </div>
            </div>

            {/* Suggest a video — shown only if lesson has no YouTube yet */}
            {!activeLesson.youtubeId && (
              <div style={{ padding: "14px 16px", background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: "var(--radius-md)" }}>
                <p style={{ fontSize: 12.5, fontFamily: "var(--font-mono)", color: "var(--c-ink3)", marginBottom: 10 }}>
                  No video linked yet for this lesson.
                </p>
                <SuggestVideo courseId={c.id} lessonId={activeLesson.id} lessonTitle={activeLesson.title} />
              </div>
            )}
            {/* Always show suggest button even when video exists */}
            {activeLesson.youtubeId && (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <SuggestVideo courseId={c.id} lessonId={activeLesson.id} lessonTitle={activeLesson.title} />
                <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--c-ink3)" }}>Know a better video for this topic?</span>
              </div>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Course meta */}
            <div className="card" style={{ overflow: "hidden" }}>
              <div style={{ height: 2, background: a.bar }} />
              <div style={{ padding: "14px 16px" }}>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "var(--c-ink)", marginBottom: 8, lineHeight: 1.3 }}>{c.title}</h2>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12, fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--c-ink3)" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={10} /> {c.duration}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}><BookOpen size={10} /> {c.totalLessons}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Users size={10} /> {c.students.toLocaleString()}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Star size={10} style={{ fill: "var(--c-amber)", color: "var(--c-amber)" }} /> {c.rating}</span>
                </div>
              </div>
            </div>

            {/* Tabbed panel */}
            <div className="card" style={{ overflow: "hidden" }}>
              <div style={{ display: "flex", borderBottom: "1px solid var(--c-border)" }}>
                {TABS.map((t) => (
                  <button key={t.id} onClick={() => setSideTab(t.id)}
                    style={{ flex: 1, padding: "9px 4px", fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 600, cursor: "pointer", background: "none", border: "none", borderBottom: `2px solid ${sideTab === t.id ? a.bar : "transparent"}`, color: sideTab === t.id ? a.bar : "var(--c-ink3)", transition: "all 0.12s", marginBottom: -1 }}>
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Outline */}
              {sideTab === "outline" && (
                <div>
                  <div style={{ padding: "8px 10px", borderBottom: "1px solid var(--c-border)" }}>
                    <input value={lessonSearch} onChange={(e) => setLessonSearch(e.target.value)}
                      placeholder="Filter lessons…"
                      style={{ width: "100%", padding: "6px 10px", fontSize: 12, fontFamily: "var(--font-mono)", background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: "var(--radius-sm)", color: "var(--c-ink)", outline: "none", boxSizing: "border-box" }} />
                  </div>
                  <div style={{ maxHeight: 460, overflowY: "auto" }}>
                    {filtered.map((lesson) => {
                      const ri      = c.lessons.indexOf(lesson);
                      const isActive = ri === activeIdx;
                      const isDone   = completed.includes(lesson.id);
                      return (
                        <div key={lesson.id} onClick={() => setActiveIdx(ri)}
                          style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", cursor: "pointer", background: isActive ? "var(--c-surface)" : "transparent", borderBottom: "1px solid var(--c-border)", transition: "background 0.1s" }}
                          className="hover:bg-[var(--c-surface)]">
                          <button onClick={(e) => { e.stopPropagation(); toggleDone(lesson.id); }}
                            style={{ flexShrink: 0, background: "none", border: "none", cursor: "pointer", display: "flex", color: isDone ? "var(--c-green)" : "var(--c-ink3)", padding: 0 }}>
                            {isDone ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                          </button>
                          <span style={{ fontSize: 10.5, fontFamily: "var(--font-mono)", fontWeight: 700, color: isActive ? a.bar : "var(--c-ink3)", width: 18, flexShrink: 0 }}>
                            {String(ri + 1).padStart(2, "0")}
                          </span>
                          <p style={{ flex: 1, fontSize: 12.5, fontWeight: isActive ? 600 : 400, color: isActive ? a.bar : "var(--c-ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {lesson.title}
                          </p>
                          <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                            {lesson.youtubeId && <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--c-red)" }} title="YouTube linked" />}
                            <span style={{ fontSize: 10.5, fontFamily: "var(--font-mono)", color: "var(--c-ink3)" }}>{lesson.duration}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Notes */}
              {sideTab === "notes" && (
                <div style={{ minHeight: 380 }}>
                  <LessonNotes lessonId={activeLesson.id} lessonTitle={activeLesson.title} />
                </div>
              )}

              {/* Resources */}
              {sideTab === "resources" && (
                <div style={{ padding: "14px" }}>
                  {c.resources && c.resources.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {c.resources.map((r) => (
                        <a key={r.url} href={r.url} target="_blank" rel="noopener noreferrer"
                          style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: "var(--radius-sm)", background: "var(--c-surface)", border: "1px solid var(--c-border)", textDecoration: "none", transition: "border-color 0.12s" }}
                          className="hover:border-[var(--c-blue)]">
                          <ExternalLink size={13} style={{ color: "var(--c-blue)", flexShrink: 0 }} />
                          <span style={{ fontSize: 13, color: "var(--c-ink)", fontWeight: 500, flex: 1 }}>{r.label}</span>
                          <ChevronRight size={11} style={{ color: "var(--c-ink3)" }} />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: 13, fontFamily: "var(--font-mono)", color: "var(--c-ink3)", textAlign: "center", padding: "24px 0" }}>
                      No resources added yet.
                    </p>
                  )}
                  <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--c-border)" }}>
                    <p className="label" style={{ marginBottom: 10 }}>topics</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {c.tags.map((t) => <span key={t} className={`tag ${a.tag}`}>{t}</span>)}
                    </div>
                  </div>
                </div>
              )}

              {/* Shortcuts */}
              {sideTab === "shortcuts" && (
                <div style={{ padding: "16px" }}>
                  <p style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--c-ink3)", marginBottom: 14, lineHeight: 1.6 }}>
                    Keyboard shortcuts — active when not typing in an input.
                  </p>
                  <ShortcutsPanel shortcuts={[
                    { key: "←",  desc: "Previous lesson" },
                    { key: "→",  desc: "Next lesson"     },
                    { key: "M",  desc: "Mark done"       },
                    { key: "1",  desc: "Outline tab"     },
                    { key: "2",  desc: "Notes tab"       },
                    { key: "3",  desc: "Resources tab"   },
                    { key: "⌘K", desc: "Search"          },
                  ]} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
