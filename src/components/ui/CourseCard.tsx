import Link from "next/link";
import { Clock, BookOpen, Users, Star, ArrowRight } from "lucide-react";
import type { Course } from "@/lib/data";

const accent = {
  blue:  { bar: "var(--c-blue)",  tag: "tag-blue"  },
  green: { bar: "var(--c-green)", tag: "tag-green" },
  amber: { bar: "var(--c-amber)", tag: "tag-amber" },
};

export default function CourseCard({ course }: { course: Course }) {
  const a = accent[course.color];

  return (
    <Link href={`/courses/${course.id}`} className="block group">
      <div className="card card-hover h-full flex flex-col" style={{ overflow: "hidden" }}>
        <div style={{ height: 2, background: a.bar, flexShrink: 0 }} />

        <div className="flex flex-col flex-1 gap-3 p-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`tag ${a.tag}`}>{course.level}</span>
            {course.tags.slice(0, 2).map((t) => (
              <span key={t} style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--c-ink3)" }} className="dark:text-[var(--c-dark-ink3)]">{t}</span>
            ))}
          </div>

          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, lineHeight: 1.3, letterSpacing: "-0.01em" }}
            className="text-[var(--c-ink)] dark:text-[var(--c-dark-ink)] group-hover:text-[var(--c-blue)] dark:group-hover:text-[var(--c-blue-dk)] transition-colors flex-1">
            {course.title}
          </h3>

          <p style={{ fontSize: 12.5, lineHeight: 1.65, color: "var(--c-ink2)" }} className="dark:text-[var(--c-dark-ink2)] line-clamp-2">
            {course.description}
          </p>

          <div className="flex items-center gap-3" style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--c-ink3)" }}>
            <span className="flex items-center gap-1.5"><Clock size={10} /> {course.duration}</span>
            <span className="flex items-center gap-1.5"><BookOpen size={10} /> {course.totalLessons}</span>
            <span className="flex items-center gap-1.5"><Users size={10} /> {course.students.toLocaleString()}</span>
          </div>

          {course.progress !== undefined && course.progress > 0 ? (
            <div>
              <div className="flex justify-between mb-1.5">
                <span style={{ fontSize: 10.5, fontFamily: "var(--font-mono)", color: "var(--c-ink3)" }}>progress</span>
                <span style={{ fontSize: 10.5, fontFamily: "var(--font-mono)", color: a.bar, fontWeight: 600 }}>{course.progress}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${course.progress}%`, background: a.bar }} />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1" style={{ fontSize: 11.5, fontFamily: "var(--font-mono)" }}>
                <Star size={11} style={{ color: "var(--c-amber)", fill: "var(--c-amber)" }} />
                <span style={{ color: "var(--c-ink2)" }} className="dark:text-[var(--c-dark-ink2)]">{course.rating}</span>
              </span>
              <span style={{ fontSize: 11, color: a.bar, fontFamily: "var(--font-mono)", display: "flex", alignItems: "center", gap: 4 }}>
                start <ArrowRight size={10} />
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
