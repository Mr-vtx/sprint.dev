"use client";

import { useState, useEffect, useRef } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock,
  Users,
  Star,
  BookOpen,
  ChevronRight,
  ExternalLink,
  Search,
  FileText,
  Keyboard,
  ListVideo,
  ChevronUp,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import VideoPlayer from "@/components/ui/VideoPlayer";
import LessonNotes from "@/components/ui/LessonNotes";
import SuggestVideo from "@/components/ui/SuggestVideo";
import {
  useKeyboardShortcuts,
  ShortcutsPanel,
} from "@/components/ui/KeyboardShortcuts";
import { getMergedCourses } from "@/lib/courseStore";
import { courses as STATIC } from "@/lib/data";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const ACCENT: Record<string, { bar: string; tag: string; dim: string }> = {
  blue: { bar: "var(--c-blue)", tag: "tag-blue", dim: "var(--c-blue-dim)" },
  green: { bar: "var(--c-green)", tag: "tag-green", dim: "var(--c-green-dim)" },
  amber: { bar: "var(--c-amber)", tag: "tag-amber", dim: "var(--c-amber-dim)" },
};

type SideTab = "outline" | "notes" | "resources" | "shortcuts";

export default function CoursePage({ id }: { id: string }) {
  const [courses, setCourses] = useState(STATIC);
  useEffect(() => {
    setCourses(getMergedCourses());
  }, []);

  const course = courses.find((c) => c.id === id);
  if (!course && STATIC.find((c) => c.id === id) === undefined) notFound();
  const c = course ?? STATIC.find((c) => c.id === id)!;
  const a = ACCENT[c.color] ?? ACCENT.blue;

  const [activeIdx, setActiveIdx] = useState(0);
  const [completed, setCompleted] = useLocalStorage<string[]>(
    `vs-done-${c.id}`,
    [],
  );
  const [sideTab, setSideTab] = useState<SideTab>("outline");
  const [lessonSearch, setLessonSearch] = useState("");
  const [mobileTab, setMobileTab] = useState<"lessons" | "notes" | "resources">(
    "lessons",
  );
  const contentRef = useRef<HTMLDivElement>(null);

  const activeLesson = c.lessons[activeIdx] ?? c.lessons[0];
  const progress =
    c.lessons.length > 0
      ? Math.round((completed.length / c.lessons.length) * 100)
      : 0;

  const toggleDone = (id: string) =>
    setCompleted((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id],
    );

  const goNext = () =>
    setActiveIdx((i) => Math.min(i + 1, c.lessons.length - 1));
  const goPrev = () => setActiveIdx((i) => Math.max(i - 1, 0));

  // On mobile: scroll content into view when lesson changes
  useEffect(() => {
    if (window.innerWidth < 768) {
      contentRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [activeIdx]);

  useKeyboardShortcuts(
    {
      arrowleft: goPrev,
      arrowright: goNext,
      m: () => activeLesson && toggleDone(activeLesson.id),
      "1": () => setSideTab("outline"),
      "2": () => setSideTab("notes"),
      "3": () => setSideTab("resources"),
    },
    [activeIdx, activeLesson],
  );

  const filtered = c.lessons.filter(
    (l) =>
      !lessonSearch ||
      l.title.toLowerCase().includes(lessonSearch.toLowerCase()),
  );

  const hasYt = c.lessons.filter((l) => l.youtubeId).length;
  const coverage = Math.round((hasYt / c.lessons.length) * 100);

  if (!activeLesson) return null;

  return (
    <div style={{ minHeight: "100vh", background: "var(--c-bg)" }}>
      <Navbar />

      {/* ═══════════════════════════════ MOBILE LAYOUT ═══════════════════════════════ */}
      {/* Sticky video + fixed bottom tabs — only on mobile */}
      <div className="md:hidden" style={{ paddingTop: 56 }}>
        {/* Sticky video wrapper */}
        <div
          style={{
            position: "sticky",
            top: 56,
            zIndex: 30,
            background: "#000",
            boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
          }}
        >
          <VideoPlayer
            youtubeId={activeLesson.youtubeId}
            videoUrl={activeLesson.videoUrl}
            title={activeLesson.title}
          />

          {/* Lesson title bar below video */}
          <div
            style={{
              background: "var(--c-surface)",
              borderBottom: "1px solid var(--c-border)",
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: 13.5,
                  color: "var(--c-ink)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {activeLesson.title}
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 2,
                }}
              >
                <span
                  style={{
                    fontSize: 10.5,
                    fontFamily: "var(--font-mono)",
                    color: "var(--c-ink3)",
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                  }}
                >
                  <Clock size={9} /> {activeLesson.duration}
                </span>
                <span
                  style={{
                    fontSize: 10.5,
                    fontFamily: "var(--font-mono)",
                    color: "var(--c-ink3)",
                  }}
                >
                  {activeIdx + 1}/{c.lessons.length}
                </span>
              </div>
            </div>

            {/* Compact prev/next + mark done */}
            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              <button
                onClick={goPrev}
                disabled={activeIdx === 0}
                style={{
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "var(--c-surface2)",
                  border: "1px solid var(--c-border)",
                  borderRadius: "var(--radius-sm)",
                  cursor: activeIdx === 0 ? "not-allowed" : "pointer",
                  opacity: activeIdx === 0 ? 0.35 : 1,
                }}
              >
                <ArrowLeft size={13} style={{ color: "var(--c-ink2)" }} />
              </button>
              <button
                onClick={goNext}
                disabled={activeIdx === c.lessons.length - 1}
                style={{
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "var(--c-surface2)",
                  border: "1px solid var(--c-border)",
                  borderRadius: "var(--radius-sm)",
                  cursor:
                    activeIdx === c.lessons.length - 1
                      ? "not-allowed"
                      : "pointer",
                  opacity: activeIdx === c.lessons.length - 1 ? 0.35 : 1,
                }}
              >
                <ChevronRight size={13} style={{ color: "var(--c-ink2)" }} />
              </button>
              <button
                onClick={() => toggleDone(activeLesson.id)}
                style={{
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: completed.includes(activeLesson.id)
                    ? "var(--c-green)"
                    : "var(--c-surface2)",
                  border: `1px solid ${completed.includes(activeLesson.id) ? "var(--c-green)" : "var(--c-border)"}`,
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {completed.includes(activeLesson.id) ? (
                  <CheckCircle2 size={14} style={{ color: "#fff" }} />
                ) : (
                  <Circle size={14} style={{ color: "var(--c-ink3)" }} />
                )}
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ height: 3, background: "var(--c-surface2)" }}>
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                background: a.bar,
                transition: "width 0.4s ease",
              }}
            />
          </div>
        </div>

        {/* Scrollable content area */}
        <div ref={contentRef} style={{ paddingBottom: 80 }}>
          {/* Mobile tabs */}
          <div
            style={{
              display: "flex",
              borderBottom: "1px solid var(--c-border)",
              background: "var(--c-surface)",
              position: "sticky",
              top: "calc(56px + var(--video-height, 220px))",
              zIndex: 20,
            }}
          >
            {(
              [
                {
                  id: "lessons",
                  label: "Lessons",
                  icon: <ListVideo size={13} />,
                },
                { id: "notes", label: "Notes", icon: <FileText size={13} /> },
                {
                  id: "resources",
                  label: "Resources",
                  icon: <ExternalLink size={12} />,
                },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setMobileTab(t.id)}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 5,
                  padding: "11px 4px",
                  fontSize: 11.5,
                  fontFamily: "var(--font-mono)",
                  fontWeight: 600,
                  background: "none",
                  border: "none",
                  borderBottom: `2px solid ${mobileTab === t.id ? a.bar : "transparent"}`,
                  color: mobileTab === t.id ? a.bar : "var(--c-ink3)",
                  cursor: "pointer",
                  transition: "all 0.12s",
                  marginBottom: -1,
                }}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* Mobile: Lessons list */}
          {mobileTab === "lessons" && (
            <div>
              {/* Stats row */}
              <div
                style={{
                  display: "flex",
                  gap: 0,
                  borderBottom: "1px solid var(--c-border)",
                }}
              >
                {[
                  {
                    label: "done",
                    value: `${completed.length}/${c.lessons.length}`,
                    color: a.bar,
                  },
                  { label: "progress", value: `${progress}%`, color: a.bar },
                  {
                    label: "linked",
                    value: `${hasYt}/${c.lessons.length}`,
                    color: "var(--c-ink2)",
                  },
                ].map((s, i) => (
                  <div
                    key={s.label}
                    style={{
                      flex: 1,
                      padding: "12px 14px",
                      borderRight: i < 2 ? "1px solid var(--c-border)" : "none",
                      textAlign: "center",
                    }}
                  >
                    <p
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 800,
                        fontSize: 18,
                        color: s.color,
                        letterSpacing: "-0.03em",
                      }}
                    >
                      {s.value}
                    </p>
                    <p
                      style={{
                        fontSize: 10,
                        fontFamily: "var(--font-mono)",
                        color: "var(--c-ink3)",
                        marginTop: 2,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                      }}
                    >
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Search */}
              <div
                style={{
                  padding: "10px 14px",
                  borderBottom: "1px solid var(--c-border)",
                  position: "relative",
                }}
              >
                <Search
                  size={13}
                  style={{
                    position: "absolute",
                    left: 26,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--c-ink3)",
                    pointerEvents: "none",
                  }}
                />
                <input
                  value={lessonSearch}
                  onChange={(e) => setLessonSearch(e.target.value)}
                  placeholder="Search lessons…"
                  style={{
                    width: "100%",
                    padding: "8px 10px 8px 32px",
                    fontSize: 13,
                    fontFamily: "var(--font-mono)",
                    background: "var(--c-surface)",
                    border: "1px solid var(--c-border)",
                    borderRadius: "var(--radius-sm)",
                    color: "var(--c-ink)",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Lesson rows */}
              {filtered.map((lesson) => {
                const ri = c.lessons.indexOf(lesson);
                const isActive = ri === activeIdx;
                const isDone = completed.includes(lesson.id);

                return (
                  <div
                    key={lesson.id}
                    onClick={() => setActiveIdx(ri)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "13px 16px",
                      background: isActive ? a.dim : "transparent",
                      borderBottom: "1px solid var(--c-border)",
                      cursor: "pointer",
                      transition: "background 0.12s",
                    }}
                  >
                    {/* Done toggle */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDone(lesson.id);
                      }}
                      style={{
                        flexShrink: 0,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        display: "flex",
                        color: isDone ? "var(--c-green)" : "var(--c-ink3)",
                      }}
                    >
                      {isDone ? (
                        <CheckCircle2 size={18} />
                      ) : (
                        <Circle size={18} />
                      )}
                    </button>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: 13.5,
                          fontWeight: isActive ? 700 : 500,
                          color: isActive
                            ? a.bar
                            : isDone
                              ? "var(--c-ink3)"
                              : "var(--c-ink)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          textDecoration: isDone ? "line-through" : "none",
                          fontFamily: "var(--font-body)",
                          lineHeight: 1.35,
                          marginBottom: 3,
                        }}
                      >
                        {lesson.title}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            fontFamily: "var(--font-mono)",
                            color: "var(--c-ink3)",
                            display: "flex",
                            alignItems: "center",
                            gap: 3,
                          }}
                        >
                          <Clock size={9} /> {lesson.duration}
                        </span>
                        {lesson.youtubeId && (
                          <span
                            style={{
                              fontSize: 9.5,
                              fontFamily: "var(--font-mono)",
                              color: "#fff",
                              background: "#ff0000cc",
                              padding: "1px 5px",
                              borderRadius: 2,
                              fontWeight: 700,
                              letterSpacing: "0.04em",
                            }}
                          >
                            YT
                          </span>
                        )}
                        <span
                          style={{
                            fontSize: 11,
                            fontFamily: "var(--font-mono)",
                            color: "var(--c-ink3)",
                            marginLeft: "auto",
                          }}
                        >
                          {String(ri + 1).padStart(2, "0")}
                        </span>
                      </div>
                    </div>

                    {isActive && (
                      <div
                        style={{
                          width: 3,
                          height: 36,
                          borderRadius: 99,
                          background: a.bar,
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </div>
                );
              })}

              {/* Suggest video */}
              <div style={{ padding: "16px" }}>
                <div
                  style={{
                    padding: "14px",
                    background: "var(--c-surface)",
                    border: "1px solid var(--c-border)",
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  <p
                    style={{
                      fontSize: 12,
                      fontFamily: "var(--font-mono)",
                      color: "var(--c-ink3)",
                      marginBottom: 10,
                    }}
                  >
                    {activeLesson.youtubeId
                      ? "Know a better video for this lesson?"
                      : "No video linked yet for this lesson."}
                  </p>
                  <SuggestVideo
                    courseId={c.id}
                    lessonId={activeLesson.id}
                    lessonTitle={activeLesson.title}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Mobile: Notes */}
          {mobileTab === "notes" && (
            <div style={{ minHeight: 400 }}>
              <LessonNotes
                lessonId={activeLesson.id}
                lessonTitle={activeLesson.title}
              />
            </div>
          )}

          {/* Mobile: Resources */}
          {mobileTab === "resources" && (
            <div style={{ padding: "16px" }}>
              {c.resources && c.resources.length > 0 ? (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  {c.resources.map((r) => (
                    <a
                      key={r.url}
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "14px 16px",
                        borderRadius: "var(--radius-md)",
                        background: "var(--c-surface)",
                        border: "1px solid var(--c-border)",
                        textDecoration: "none",
                      }}
                    >
                      <ExternalLink
                        size={16}
                        style={{ color: "var(--c-blue)", flexShrink: 0 }}
                      />
                      <span
                        style={{
                          fontSize: 14,
                          color: "var(--c-ink)",
                          fontWeight: 500,
                          flex: 1,
                        }}
                      >
                        {r.label}
                      </span>
                      <ChevronRight
                        size={14}
                        style={{ color: "var(--c-ink3)" }}
                      />
                    </a>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <BookOpen
                    size={28}
                    style={{
                      color: "var(--c-ink3)",
                      margin: "0 auto 10px",
                      opacity: 0.3,
                    }}
                  />
                  <p
                    style={{
                      fontSize: 13,
                      fontFamily: "var(--font-mono)",
                      color: "var(--c-ink3)",
                    }}
                  >
                    No resources yet.
                  </p>
                </div>
              )}

              {/* Tags */}
              <div
                style={{
                  marginTop: 20,
                  paddingTop: 16,
                  borderTop: "1px solid var(--c-border)",
                }}
              >
                <p className="label" style={{ marginBottom: 10 }}>
                  topics covered
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {c.tags.map((t) => (
                    <span
                      key={t}
                      className={`tag ${a.tag}`}
                      style={{ fontSize: 11 }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════ DESKTOP LAYOUT ═══════════════════════════════ */}
      <div
        className="hidden md:block"
        style={{ maxWidth: 1280, margin: "0 auto", padding: "72px 24px 48px" }}
      >
        {/* Breadcrumb */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 22,
            fontSize: 12,
            fontFamily: "var(--font-mono)",
            color: "var(--c-ink3)",
          }}
        >
          <Link
            href="/courses"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              color: "inherit",
              textDecoration: "none",
            }}
            className="hover:text-[var(--c-ink)] transition-colors"
          >
            <ArrowLeft size={12} /> courses
          </Link>
          <ChevronRight size={11} style={{ opacity: 0.4 }} />
          <span
            style={{ color: "var(--c-ink2)" }}
            className="truncate max-w-[180px]"
          >
            {c.title}
          </span>
          <ChevronRight size={11} style={{ opacity: 0.4 }} />
          <span
            className="truncate max-w-[240px]"
            style={{ color: "var(--c-ink)" }}
          >
            {activeLesson.title}
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 360px",
            gap: 24,
            alignItems: "start",
          }}
        >
          {/* ── Desktop: Left/Main ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <VideoPlayer
              youtubeId={activeLesson.youtubeId}
              videoUrl={activeLesson.videoUrl}
              title={activeLesson.title}
            />

            {/* Lesson meta + nav */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h1
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(18px, 2.2vw, 24px)",
                    fontWeight: 800,
                    letterSpacing: "-0.025em",
                    color: "var(--c-ink)",
                    marginBottom: 6,
                    lineHeight: 1.2,
                  }}
                >
                  {activeLesson.title}
                </h1>
                <p
                  style={{
                    fontSize: 12.5,
                    fontFamily: "var(--font-mono)",
                    color: "var(--c-ink3)",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <span
                    style={{ display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <Clock size={11} /> {activeLesson.duration}
                  </span>
                  <span style={{ opacity: 0.3 }}>·</span>
                  <span>
                    Lesson {activeIdx + 1} of {c.lessons.length}
                  </span>
                  <span style={{ opacity: 0.3 }}>·</span>
                  <span style={{ color: a.bar, fontWeight: 600 }}>
                    {progress}% complete
                  </span>
                </p>
              </div>

              {/* Nav buttons */}
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexShrink: 0,
                  alignItems: "center",
                }}
              >
                <button
                  onClick={goPrev}
                  disabled={activeIdx === 0}
                  style={{
                    padding: "8px 14px",
                    fontSize: 12,
                    fontFamily: "var(--font-mono)",
                    fontWeight: 600,
                    background: "none",
                    border: "1px solid var(--c-border)",
                    borderRadius: "var(--radius-sm)",
                    cursor: activeIdx === 0 ? "not-allowed" : "pointer",
                    color: "var(--c-ink2)",
                    opacity: activeIdx === 0 ? 0.35 : 1,
                    transition: "all 0.12s",
                  }}
                >
                  ← prev
                </button>
                <button
                  onClick={goNext}
                  disabled={activeIdx === c.lessons.length - 1}
                  style={{
                    padding: "8px 14px",
                    fontSize: 12,
                    fontFamily: "var(--font-mono)",
                    fontWeight: 600,
                    background: "none",
                    border: "1px solid var(--c-border)",
                    borderRadius: "var(--radius-sm)",
                    cursor:
                      activeIdx === c.lessons.length - 1
                        ? "not-allowed"
                        : "pointer",
                    color: "var(--c-ink2)",
                    opacity: activeIdx === c.lessons.length - 1 ? 0.35 : 1,
                    transition: "all 0.12s",
                  }}
                >
                  next →
                </button>
                <button
                  onClick={() => toggleDone(activeLesson.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 16px",
                    fontSize: 12,
                    fontFamily: "var(--font-mono)",
                    fontWeight: 700,
                    background: completed.includes(activeLesson.id)
                      ? "var(--c-green)"
                      : "none",
                    border: `1.5px solid ${completed.includes(activeLesson.id) ? "var(--c-green)" : "var(--c-border)"}`,
                    borderRadius: "var(--radius-sm)",
                    cursor: "pointer",
                    color: completed.includes(activeLesson.id)
                      ? "#fff"
                      : "var(--c-ink2)",
                    transition: "all 0.15s",
                  }}
                >
                  {completed.includes(activeLesson.id) ? (
                    <CheckCircle2 size={13} />
                  ) : (
                    <Circle size={13} />
                  )}
                  {completed.includes(activeLesson.id) ? "done" : "mark done"}
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: "var(--font-mono)",
                    color: "var(--c-ink3)",
                  }}
                >
                  {completed.length} of {c.lessons.length} completed
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: "var(--font-mono)",
                    color: a.bar,
                    fontWeight: 700,
                  }}
                >
                  {progress}%
                </span>
              </div>
              <div className="progress-track" style={{ height: 4 }}>
                <div
                  className="progress-fill"
                  style={{
                    width: `${progress}%`,
                    background: a.bar,
                    height: "100%",
                  }}
                />
              </div>
            </div>

            {/* Suggest video strip */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                background: "var(--c-surface)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--c-border)",
              }}
            >
              <p
                style={{
                  fontSize: 12.5,
                  fontFamily: "var(--font-mono)",
                  color: "var(--c-ink3)",
                  flex: 1,
                }}
              >
                {activeLesson.youtubeId
                  ? "Know a better video for this lesson?"
                  : "No video linked yet — suggest one."}
              </p>
              <SuggestVideo
                courseId={c.id}
                lessonId={activeLesson.id}
                lessonTitle={activeLesson.title}
              />
            </div>
          </div>

          {/* ── Desktop: Sidebar ── */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              position: "sticky",
              top: 80,
            }}
          >
            {/* Course card */}
            <div className="card" style={{ overflow: "hidden" }}>
              <div style={{ height: 3, background: a.bar }} />
              <div style={{ padding: "14px 16px" }}>
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 15,
                    fontWeight: 700,
                    color: "var(--c-ink)",
                    marginBottom: 10,
                    lineHeight: 1.3,
                  }}
                >
                  {c.title}
                </h2>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 8,
                    marginBottom: 12,
                  }}
                >
                  {[
                    { icon: <Clock size={11} />, val: c.duration },
                    {
                      icon: <BookOpen size={11} />,
                      val: `${c.totalLessons} lessons`,
                    },
                    {
                      icon: <Users size={11} />,
                      val: c.students.toLocaleString(),
                    },
                    {
                      icon: (
                        <Star
                          size={11}
                          style={{
                            fill: "var(--c-amber)",
                            color: "var(--c-amber)",
                          }}
                        />
                      ),
                      val: `${c.rating} / 5`,
                    },
                  ].map(({ icon, val }) => (
                    <div
                      key={val}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        fontSize: 11.5,
                        fontFamily: "var(--font-mono)",
                        color: "var(--c-ink2)",
                      }}
                    >
                      <span style={{ color: "var(--c-ink3)" }}>{icon}</span>{" "}
                      {val}
                    </div>
                  ))}
                </div>
                {/* Coverage bar */}
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        fontFamily: "var(--font-mono)",
                        color: "var(--c-ink3)",
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                      }}
                    >
                      YouTube linked
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        fontFamily: "var(--font-mono)",
                        color: coverage > 0 ? a.bar : "var(--c-ink3)",
                        fontWeight: 700,
                      }}
                    >
                      {hasYt}/{c.lessons.length}
                    </span>
                  </div>
                  <div
                    style={{
                      height: 3,
                      background: "var(--c-surface2)",
                      borderRadius: 99,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${coverage}%`,
                        background: a.bar,
                        borderRadius: 99,
                        transition: "width 0.4s",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Tabbed panel */}
            <div className="card" style={{ overflow: "hidden" }}>
              {/* Tab bar */}
              <div
                style={{
                  display: "flex",
                  borderBottom: "1px solid var(--c-border)",
                }}
              >
                {(
                  ["outline", "notes", "resources", "shortcuts"] as SideTab[]
                ).map((t) => (
                  <button
                    key={t}
                    onClick={() => setSideTab(t)}
                    style={{
                      flex: 1,
                      padding: "9px 2px",
                      fontSize: 10.5,
                      fontFamily: "var(--font-mono)",
                      fontWeight: 600,
                      cursor: "pointer",
                      background: "none",
                      border: "none",
                      borderBottom: `2px solid ${sideTab === t ? a.bar : "transparent"}`,
                      color: sideTab === t ? a.bar : "var(--c-ink3)",
                      transition: "all 0.12s",
                      marginBottom: -1,
                      textTransform: "capitalize",
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Outline */}
              {sideTab === "outline" && (
                <div>
                  <div
                    style={{
                      padding: "8px 10px",
                      borderBottom: "1px solid var(--c-border)",
                      position: "relative",
                    }}
                  >
                    <Search
                      size={12}
                      style={{
                        position: "absolute",
                        left: 20,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "var(--c-ink3)",
                        pointerEvents: "none",
                      }}
                    />
                    <input
                      value={lessonSearch}
                      onChange={(e) => setLessonSearch(e.target.value)}
                      placeholder="Filter lessons…"
                      style={{
                        width: "100%",
                        padding: "6px 10px 6px 28px",
                        fontSize: 12,
                        fontFamily: "var(--font-mono)",
                        background: "var(--c-surface)",
                        border: "1px solid var(--c-border)",
                        borderRadius: "var(--radius-sm)",
                        color: "var(--c-ink)",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                  <div style={{ maxHeight: 420, overflowY: "auto" }}>
                    {filtered.map((lesson) => {
                      const ri = c.lessons.indexOf(lesson);
                      const isActive = ri === activeIdx;
                      const isDone = completed.includes(lesson.id);
                      return (
                        <div
                          key={lesson.id}
                          onClick={() => setActiveIdx(ri)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "9px 12px",
                            cursor: "pointer",
                            background: isActive ? a.dim : "transparent",
                            borderBottom: "1px solid var(--c-border)",
                            transition: "background 0.1s",
                          }}
                          className="hover:bg-[var(--c-surface)]"
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleDone(lesson.id);
                            }}
                            style={{
                              flexShrink: 0,
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              display: "flex",
                              color: isDone
                                ? "var(--c-green)"
                                : "var(--c-ink3)",
                              padding: 0,
                            }}
                          >
                            {isDone ? (
                              <CheckCircle2 size={14} />
                            ) : (
                              <Circle size={14} />
                            )}
                          </button>
                          <span
                            style={{
                              fontSize: 10,
                              fontFamily: "var(--font-mono)",
                              fontWeight: 700,
                              color: isActive ? a.bar : "var(--c-ink3)",
                              width: 18,
                              flexShrink: 0,
                            }}
                          >
                            {String(ri + 1).padStart(2, "0")}
                          </span>
                          <p
                            style={{
                              flex: 1,
                              fontSize: 12.5,
                              fontWeight: isActive ? 700 : 400,
                              color: isActive ? a.bar : "var(--c-ink)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              textDecoration: isDone ? "line-through" : "none",
                            }}
                          >
                            {lesson.title}
                          </p>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              flexShrink: 0,
                            }}
                          >
                            {lesson.youtubeId && (
                              <div
                                style={{
                                  width: 5,
                                  height: 5,
                                  borderRadius: "50%",
                                  background: "#ff0000",
                                }}
                                title="YouTube"
                              />
                            )}
                            <span
                              style={{
                                fontSize: 10,
                                fontFamily: "var(--font-mono)",
                                color: "var(--c-ink3)",
                              }}
                            >
                              {lesson.duration}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Notes */}
              {sideTab === "notes" && (
                <div style={{ minHeight: 360 }}>
                  <LessonNotes
                    lessonId={activeLesson.id}
                    lessonTitle={activeLesson.title}
                  />
                </div>
              )}

              {/* Resources */}
              {sideTab === "resources" && (
                <div style={{ padding: "14px" }}>
                  {c.resources && c.resources.length > 0 ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      {c.resources.map((r) => (
                        <a
                          key={r.url}
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "10px 12px",
                            borderRadius: "var(--radius-sm)",
                            background: "var(--c-surface)",
                            border: "1px solid var(--c-border)",
                            textDecoration: "none",
                          }}
                          className="hover:border-[var(--c-blue)]"
                        >
                          <ExternalLink
                            size={13}
                            style={{ color: "var(--c-blue)", flexShrink: 0 }}
                          />
                          <span
                            style={{
                              fontSize: 13,
                              color: "var(--c-ink)",
                              fontWeight: 500,
                              flex: 1,
                            }}
                          >
                            {r.label}
                          </span>
                          <ChevronRight
                            size={11}
                            style={{ color: "var(--c-ink3)" }}
                          />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p
                      style={{
                        fontSize: 13,
                        fontFamily: "var(--font-mono)",
                        color: "var(--c-ink3)",
                        textAlign: "center",
                        padding: "24px 0",
                      }}
                    >
                      No resources added yet.
                    </p>
                  )}
                  <div
                    style={{
                      marginTop: 14,
                      paddingTop: 12,
                      borderTop: "1px solid var(--c-border)",
                    }}
                  >
                    <p className="label" style={{ marginBottom: 8 }}>
                      topics
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {c.tags.map((t) => (
                        <span key={t} className={`tag ${a.tag}`}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Shortcuts */}
              {sideTab === "shortcuts" && (
                <div style={{ padding: "16px" }}>
                  <p
                    style={{
                      fontSize: 12,
                      fontFamily: "var(--font-mono)",
                      color: "var(--c-ink3)",
                      marginBottom: 14,
                      lineHeight: 1.7,
                    }}
                  >
                    Active when you&apos;re not focused on an input field.
                  </p>
                  <ShortcutsPanel
                    shortcuts={[
                      { key: "←", desc: "Previous lesson" },
                      { key: "→", desc: "Next lesson" },
                      { key: "M", desc: "Mark done" },
                      { key: "1", desc: "Outline tab" },
                      { key: "2", desc: "Notes tab" },
                      { key: "3", desc: "Resources tab" },
                      { key: "⌘K", desc: "Search" },
                    ]}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
