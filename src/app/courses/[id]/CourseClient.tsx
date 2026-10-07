"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight, ExternalLink, Search } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import VideoPlayer, { OfflineControls } from "@/components/ui/VideoPlayer";
import LessonNotes from "@/components/ui/LessonNotes";
import SuggestVideo from "@/components/ui/SuggestVideo";
import LessonOutline from "@/components/course/LessonOutline";
import { useKeyboardShortcuts, ShortcutsPanel } from "@/components/ui/KeyboardShortcuts";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useStreak } from "@/hooks/useStreak";
import { courseDoneKey } from "@/lib/progress";
import { courses, roadmaps, type Lesson } from "@/lib/data";

type Tab = "lessons" | "notes" | "resources" | "keys";

const SHORTCUTS = [
  { key: "← →", desc: "Previous / next lesson" },
  { key: "M", desc: "Mark complete" },
  { key: "1", desc: "Lessons tab" },
  { key: "2", desc: "Notes tab" },
  { key: "3", desc: "Resources tab" },
  { key: "⌘K", desc: "Search everything" },
];

export default function CourseClient({ id }: { id: string }) {
  const c = courses.find((x) => x.id === id)!;
  const roadmap = roadmaps.find((r) => r.id === c.id);

  const [done, setDone] = useLocalStorage<string[]>(courseDoneKey(c.id), []);
  const [lastId, setLastId, lastLoaded] = useLocalStorage<string | null>(`vs-last-${c.id}`, null);
  const { recordLesson, undoLesson } = useStreak();

  const [activeId, setActiveId] = useState(c.lessons[0].id);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>("lessons");
  const [query, setQuery] = useState("");

  // Open the lesson from ?lesson=, else the last one viewed, else the first.
  useEffect(() => {
    if (!lastLoaded || ready) return;
    const fromUrl = new URLSearchParams(window.location.search).get("lesson");
    const pick = [fromUrl, lastId].find((x) => x && c.lessons.some((l) => l.id === x));
    if (pick) setActiveId(pick);
    setReady(true);
  }, [lastLoaded, ready, lastId, c.lessons]);

  const idx = Math.max(0, c.lessons.findIndex((l) => l.id === activeId));
  const lesson = c.lessons[idx];
  const isDone = done.includes(lesson.id);
  const doneCount = c.lessons.filter((l) => done.includes(l.id)).length;
  const pct = Math.round((doneCount / c.lessons.length) * 100);
  const finished = doneCount === c.lessons.length;
  const withVideo = c.lessons.filter((l) => l.youtubeId || l.videoUrl).length;

  const select = (lid: string) => {
    setActiveId(lid);
    setLastId(lid);
    window.history.replaceState(null, "", `?lesson=${lid}`);
    if (tab === "lessons" && window.innerWidth < 1024) window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const go = (delta: number) => {
    const next = c.lessons[idx + delta];
    if (next) select(next.id);
  };
  const toggle = (lid: string) => {
    const wasDone = done.includes(lid);
    setDone((p) => (wasDone ? p.filter((x) => x !== lid) : [...p, lid]));
    if (wasDone) undoLesson(); else recordLesson();
  };
  const completeAndContinue = () => {
    if (!isDone) toggle(lesson.id);
    go(1);
  };

  useKeyboardShortcuts(
    {
      arrowleft: () => go(-1),
      arrowright: () => go(1),
      m: () => toggle(lesson.id),
      "1": () => setTab("lessons"),
      "2": () => setTab("notes"),
      "3": () => setTab("resources"),
      "shift+?": () => setTab("keys"),
    },
    [idx, lesson.id, done],
  );

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? c.lessons.filter((l) => l.title.toLowerCase().includes(q)) : c.lessons;
  }, [c.lessons, query]);

  const tabs: { id: Tab; label: string; mobileOnly?: boolean }[] = [
    { id: "lessons", label: "Lessons", mobileOnly: true },
    { id: "notes", label: "Notes" },
    { id: "resources", label: "Resources" },
    { id: "keys", label: "Shortcuts" },
  ];
  const bodyTab: Tab = tab; // on desktop the sidebar lists lessons, so "lessons" renders notes there

  return (
    <>
      <Navbar />
      <main className="container" style={{ paddingTop: 76, paddingBottom: 80 }}>
        {/* Course header */}
        <header style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px 24px", marginBottom: 20 }}>
          <Link href="/courses" className="label hover:text-[var(--c-ink)]" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <ArrowLeft size={13} /> Courses
          </Link>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, letterSpacing: "-0.02em", flex: "1 1 auto" }}>{c.title}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 200 }}>
            <div className="progress-track" style={{ flex: 1 }} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Course progress">
              <div className="progress-fill" style={{ width: `${pct}%`, background: "var(--c-green)" }} />
            </div>
            <span className="label" style={{ whiteSpace: "nowrap" }}>{doneCount} of {c.lessons.length} done</span>
          </div>
        </header>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_340px] gap-x-10 gap-y-6 items-start">
          {/* Main column */}
          <div style={{ minWidth: 0 }}>
            {/* Player: sticks under the navbar on small screens */}
            <div className="max-lg:sticky max-lg:top-[60px] max-lg:z-30 max-lg:-mx-6" style={{ borderRadius: "var(--radius-md)", overflow: "hidden" }}>
              {ready ? (
                <VideoPlayer youtubeId={lesson.youtubeId} videoUrl={lesson.videoUrl} title={lesson.title} />
              ) : (
                <div className="skeleton" style={{ aspectRatio: "16 / 9" }} />
              )}
            </div>

            <section style={{ paddingTop: 22 }} aria-label="Current lesson">
              <p className="label" style={{ marginBottom: 6 }}>Lesson {idx + 1} of {c.lessons.length}</p>
              <h1 style={{ fontSize: "clamp(24px, 3vw, 34px)", fontWeight: 800, marginBottom: 16 }}>{lesson.title}</h1>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                {isDone ? (
                  <button onClick={() => toggle(lesson.id)} className="btn btn-outline" style={{ color: "var(--c-green)", borderColor: "var(--c-green)" }}>
                    Completed. Undo
                  </button>
                ) : (
                  <button onClick={completeAndContinue} className="btn btn-primary">
                    {idx < c.lessons.length - 1 ? "Mark complete and continue" : "Mark complete"}
                  </button>
                )}
                <button onClick={() => go(-1)} disabled={idx === 0} className="btn btn-outline" style={{ padding: 10 }} aria-label="Previous lesson"><ChevronLeft size={18} /></button>
                <button onClick={() => go(1)} disabled={idx === c.lessons.length - 1} className="btn btn-outline" style={{ padding: 10 }} aria-label="Next lesson"><ChevronRight size={18} /></button>
                {lesson.videoUrl && <div style={{ marginLeft: 8 }}><OfflineControls videoUrl={lesson.videoUrl} /></div>}
              </div>

              {finished && (
                <p style={{ marginTop: 18, padding: "14px 16px", background: "var(--c-green-dim)", borderRadius: "var(--radius-sm)", fontSize: 15 }}>
                  <strong style={{ color: "var(--c-green)" }}>Course complete.</strong>{" "}
                  {roadmap ? <>Build the milestones on the <Link href={`/roadmaps/${roadmap.id}`} style={{ color: "var(--c-blue)", textDecoration: "underline" }}>roadmap</Link> next.</> : "Pick your next one from the course list."}
                </p>
              )}

              {!(lesson.youtubeId || lesson.videoUrl) && (
                <div style={{ marginTop: 18 }}>
                  <SuggestVideo courseId={c.id} lessonId={lesson.id} lessonTitle={lesson.title} />
                </div>
              )}
            </section>

            {/* Tabs */}
            <div style={{ marginTop: 32 }}>
              <div role="tablist" aria-label="Lesson tools" style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--c-border)", marginBottom: 20 }}>
                {tabs.map((t) => {
                  const selected = bodyTab === t.id || (t.id === "notes" && bodyTab === "lessons");
                  return (
                    <button
                      key={t.id}
                      role="tab"
                      aria-selected={selected}
                      onClick={() => setTab(t.id)}
                      className={t.mobileOnly ? "lg:hidden" : undefined}
                      style={{
                        padding: "10px 14px", background: "none", border: "none", cursor: "pointer", fontSize: 14.5, fontWeight: 600,
                        color: bodyTab === t.id ? "var(--c-ink)" : "var(--c-ink3)",
                        borderBottom: `2px solid ${bodyTab === t.id ? "var(--c-blue)" : "transparent"}`, marginBottom: -1,
                      }}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {bodyTab === "lessons" && (
                <>
                  <div className="lg:hidden">
                    <LessonList {...{ shown, lesson, done, select, toggle, query, setQuery, total: c.lessons.length }} />
                  </div>
                  <div className="hidden lg:block"><LessonNotes lessonId={lesson.id} /></div>
                </>
              )}
              {bodyTab === "notes" && <LessonNotes lessonId={lesson.id} />}
              {bodyTab === "resources" && (
                <ul style={{ listStyle: "none", borderTop: "1px solid var(--c-border)" }}>
                  {(c.resources ?? []).map((r) => (
                    <li key={r.url} style={{ borderBottom: "1px solid var(--c-border)" }}>
                      <a href={r.url} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--c-blue)]" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "14px 2px", fontSize: 16, fontWeight: 500 }}>
                        {r.label} <ExternalLink size={14} style={{ color: "var(--c-ink3)" }} />
                      </a>
                    </li>
                  ))}
                  {roadmap && (
                    <li style={{ borderBottom: "1px solid var(--c-border)" }}>
                      <Link href={`/roadmaps/${roadmap.id}`} className="hover:text-[var(--c-blue)]" style={{ display: "flex", justifyContent: "space-between", padding: "14px 2px", fontSize: 16, fontWeight: 500 }}>
                        Roadmap with milestones <ChevronRight size={16} style={{ color: "var(--c-ink3)" }} />
                      </Link>
                    </li>
                  )}
                  {!c.resources?.length && !roadmap && <li style={{ padding: "20px 2px", color: "var(--c-ink2)" }}>No resources for this course yet.</li>}
                </ul>
              )}
              {bodyTab === "keys" && <div style={{ maxWidth: 480 }}><ShortcutsPanel shortcuts={SHORTCUTS} /></div>}
            </div>
          </div>

          {/* Sidebar outline: desktop only (mobile uses the Lessons tab) */}
          <aside className="hidden lg:block lg:sticky lg:top-[84px]" aria-label="Lessons">
            <LessonList {...{ shown, lesson, done, select, toggle, query, setQuery, total: c.lessons.length, scroll: true }} />
            <p className="label" style={{ marginTop: 14 }}>{withVideo} of {c.lessons.length} lessons have video</p>
          </aside>
        </div>
      </main>
    </>
  );
}

function LessonList({
  shown, lesson, done, select, toggle, query, setQuery, total, scroll,
}: {
  shown: Lesson[];
  lesson: { id: string };
  done: string[];
  select: (id: string) => void;
  toggle: (id: string) => void;
  query: string;
  setQuery: (q: string) => void;
  total: number;
  scroll?: boolean;
}) {
  return (
    <div>
      {total > 8 && (
        <div style={{ position: "relative", marginBottom: 14 }}>
          <Search size={14} style={{ position: "absolute", left: 14, top: 13, color: "var(--c-ink3)" }} aria-hidden />
          <input className="search-input" placeholder="Filter lessons" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Filter lessons" />
        </div>
      )}
      {shown.length ? (
        <LessonOutline lessons={shown} activeId={lesson.id} done={done} onSelect={select} onToggle={toggle} maxHeight={scroll ? "calc(100vh - 230px)" : undefined} />
      ) : (
        <p style={{ fontSize: 14, color: "var(--c-ink2)" }}>No lessons match &quot;{query}&quot;.</p>
      )}
    </div>
  );
}
