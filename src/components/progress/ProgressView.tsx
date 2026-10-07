"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useStreak } from "@/hooks/useStreak";
import ActivityHeatmap from "@/components/ui/ActivityHeatmap";
import OfflineStorage from "./OfflineStorage";
import DataControls from "./DataControls";
import TopicDots from "@/components/roadmap/TopicDots";
import { countNotes } from "@/components/ui/LessonNotes";
import { courseDoneKey, readDone, roadmapDoneKey } from "@/lib/progress";
import { courses, roadmaps } from "@/lib/data";

interface Snapshot {
  courseDone: Record<string, string[]>;
  courseLast: Record<string, string | null>;
  topicDone: Record<string, string[]>;
  notes: number;
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 72 }}>
      <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: hint ? 6 : 20 }}>{title}</h2>
      {hint && <p style={{ color: "var(--c-ink2)", fontSize: 15, marginBottom: 20 }}>{hint}</p>}
      {children}
    </section>
  );
}

function Stat({ value, of, label, note }: { value: number; of?: number; label: string; note?: string }) {
  return (
    <div>
      <p style={{ fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1 }}>
        {value}
        {of !== undefined && <span style={{ fontSize: 20, color: "var(--c-ink3)", fontWeight: 600 }}> / {of}</span>}
      </p>
      <p style={{ fontSize: 15, marginTop: 8 }}>{label}</p>
      {note && <p className="label" style={{ marginTop: 2 }}>{note}</p>}
    </div>
  );
}

export default function ProgressView() {
  const { data: streak, mounted } = useStreak();
  const [snap, setSnap] = useState<Snapshot | null>(null);

  useEffect(() => {
    const read = () => {
      const s: Snapshot = { courseDone: {}, courseLast: {}, topicDone: {}, notes: 0 };
      courses.forEach((c) => {
        s.courseDone[c.id] = readDone(courseDoneKey(c.id));
        try { s.courseLast[c.id] = JSON.parse(localStorage.getItem(`vs-last-${c.id}`) ?? "null"); } catch { s.courseLast[c.id] = null; }
      });
      roadmaps.forEach((r) => (s.topicDone[r.id] = readDone(roadmapDoneKey(r.id))));
      s.notes = countNotes(courses.flatMap((c) => c.lessons.map((l) => l.id)));
      setSnap(s);
    };
    read();
    window.addEventListener("storage", read);
    return () => window.removeEventListener("storage", read);
  }, []);

  const totalLessons = courses.reduce((n, c) => n + c.lessons.length, 0);
  const lessonsDone = snap ? courses.reduce((n, c) => n + c.lessons.filter((l) => snap.courseDone[c.id].includes(l.id)).length, 0) : 0;
  const totalTopics = roadmaps.reduce((n, r) => n + r.phases.reduce((m, p) => m + p.topics.length, 0), 0);
  const topicsDone = snap ? roadmaps.reduce((n, r) => n + r.phases.flatMap((p) => p.topics).filter((t) => snap.topicDone[r.id].includes(t.id)).length, 0) : 0;
  const streakNow = mounted ? streak.current : 0;
  const started = lessonsDone + topicsDone > 0;

  return (
    <>
      <header style={{ marginBottom: 56, maxWidth: 640 }}>
        <h1 style={{ fontSize: "clamp(34px, 5vw, 54px)", fontWeight: 800, marginBottom: 14 }}>Progress</h1>
        <p style={{ fontSize: 17, color: "var(--c-ink2)", lineHeight: 1.65 }}>
          {started
            ? `${topicsDone} of ${totalTopics} roadmap topics and ${lessonsDone} of ${totalLessons} lessons done.`
            : "Nothing done yet. Finish a topic or a lesson and it shows up here."}{" "}
          Everything is stored on this device.
        </p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-10" style={{ borderTop: "1px solid var(--c-border)", paddingTop: 32, marginBottom: 72 }}>
        <Stat value={streakNow} label="day streak" note={mounted ? `longest ${streak.longest}. Counts days you complete something.` : undefined} />
        <Stat value={topicsDone} of={totalTopics} label="roadmap topics" />
        <Stat value={lessonsDone} of={totalLessons} label="course lessons" />
        <Stat value={snap?.notes ?? 0} label={snap?.notes === 1 ? "lesson with notes" : "lessons with notes"} />
      </div>

      <Section title="Roadmaps">
        <div style={{ borderTop: "1px solid var(--c-border)" }}>
          {roadmaps.map((r) => {
            const topics = r.phases.flatMap((p) => p.topics);
            const done = snap?.topicDone[r.id] ?? [];
            const next = topics.find((t) => !done.includes(t.id));
            const n = topics.filter((t) => done.includes(t.id)).length;
            const hours = topics.filter((t) => done.includes(t.id)).reduce((h, t) => h + t.estimatedHours, 0);
            return (
              <div key={r.id} className="grid md:grid-cols-[1fr_auto] gap-x-12 gap-y-4" style={{ padding: "24px 0", borderBottom: "1px solid var(--c-border)", alignItems: "center" }}>
                <div style={{ display: "grid", gap: 12 }}>
                  <h3 style={{ fontSize: 22, fontWeight: 700 }}>{r.title}</h3>
                  <TopicDots roadmap={r} />
                  <p style={{ fontSize: 14, color: "var(--c-ink2)" }}>
                    {n === 0 ? "Not started." : next ? `Next: ${next.title}. ` : "Finished. Build the final project."}
                    {n > 0 && ` ${hours} of ${r.totalHours} hours covered.`}
                  </p>
                </div>
                <Link href={`/roadmaps/${r.id}`} className={n > 0 && next ? "btn btn-primary" : "btn btn-outline"}>
                  {n === 0 ? "Start" : next ? "Resume" : "Review"}
                </Link>
              </div>
            );
          })}
        </div>
      </Section>

      <Section title="Courses">
        <div style={{ borderTop: "1px solid var(--c-border)" }}>
          {courses.map((c) => {
            const done = snap?.courseDone[c.id] ?? [];
            const n = c.lessons.filter((l) => done.includes(l.id)).length;
            const pct = Math.round((n / c.lessons.length) * 100);
            const last = snap?.courseLast[c.id];
            const status = n === 0 ? "Not started" : n === c.lessons.length ? "Complete" : `${n} of ${c.lessons.length} lessons`;
            return (
              <Link key={c.id} href={last ? `/courses/${c.id}?lesson=${last}` : `/courses/${c.id}`} className="group grid sm:grid-cols-[1fr_200px_90px] gap-x-8 gap-y-2 items-center" style={{ padding: "18px 0", borderBottom: "1px solid var(--c-border)" }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em" }} className="group-hover:text-[var(--c-blue)] transition-colors">{c.title}</span>
                <div>
                  <div className="progress-track"><div className="progress-fill" style={{ width: `${pct}%`, background: "var(--c-green)" }} /></div>
                  <p className="label" style={{ marginTop: 6 }}>{status}</p>
                </div>
                <span style={{ fontSize: 14, color: "var(--c-blue)", fontWeight: 600 }} className="sm:text-right">{n === 0 ? "Start" : n === c.lessons.length ? "Review" : "Resume"}</span>
              </Link>
            );
          })}
        </div>
      </Section>

      <Section title="Activity" hint="Lessons and roadmap topics you marked complete, by day.">
        <ActivityHeatmap activity={mounted ? streak.activity : {}} />
      </Section>

      <Section title="Offline videos">
        <OfflineStorage />
      </Section>

      <Section title="Your data">
        <DataControls />
      </Section>
    </>
  );
}
