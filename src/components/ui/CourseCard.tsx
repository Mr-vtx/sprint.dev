"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { courseDoneKey } from "@/lib/progress";
import { publishedCount, type Course } from "@/lib/data";

/** A course as a ruled row, not a card. Progress comes from this device's storage. */
export default function CourseCard({ course }: { course: Course }) {
  const [done] = useLocalStorage<string[]>(courseDoneKey(course.id), []);
  const total = course.lessons.length;
  const ready = publishedCount(course);
  const doneCount = course.lessons.filter((l) => done.includes(l.id)).length;
  const pct = total ? Math.round((doneCount / total) * 100) : 0;

  return (
    <Link
      href={`/courses/${course.id}`}
      className="group grid md:grid-cols-[1fr_260px] gap-x-12 gap-y-4"
      style={{ padding: "26px 0", borderBottom: "1px solid var(--c-border)" }}
    >
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <h3 style={{ fontSize: 22, fontWeight: 700 }} className="group-hover:text-[var(--c-blue)] transition-colors">{course.title}</h3>
          <ArrowUpRight size={17} style={{ color: "var(--c-ink3)" }} />
        </div>
        <p style={{ fontSize: 15, color: "var(--c-ink2)", maxWidth: 580, marginBottom: 12 }} className="line-clamp-2">{course.description}</p>
        <p className="label">{course.tags.join(" · ")}</p>
      </div>

      <div style={{ display: "grid", gap: 10, alignContent: "start" }}>
        <p className="label">{course.level} · {course.duration}</p>
        <p style={{ fontSize: 14, color: "var(--c-ink2)" }}>
          {total} lessons{ready < total ? `, ${ready} with video` : ""}
        </p>
        {doneCount > 0 && (
          <div>
            <div className="progress-track"><div className="progress-fill" style={{ width: `${pct}%`, background: "var(--c-green)" }} /></div>
            <p className="label" style={{ marginTop: 6 }}>{doneCount} of {total} done</p>
          </div>
        )}
      </div>
    </Link>
  );
}
