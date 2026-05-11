"use client";

import { useState } from "react";
import { BookOpen } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import CourseCard from "@/components/ui/CourseCard";
import { courses } from "@/lib/data";

const levels = ["All", "Beginner", "Intermediate", "Advanced"] as const;
const tags = ["All", ...Array.from(new Set(courses.flatMap((c) => c.tags))).slice(0, 8)];

export default function CoursesPage() {
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState<string>("All");
  const [tag, setTag] = useState<string>("All");

  const filtered = courses.filter((c) => {
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchLevel = level === "All" || c.level === level;
    const matchTag = tag === "All" || c.tags.includes(tag);
    return matchSearch && matchLevel && matchTag;
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--c-bg)" }} className="dark:bg-[var(--c-dark-bg)]">
      <Navbar onSearch={setSearch} />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "96px 24px 64px" }}>
        <div style={{ marginBottom: 40 }}>
          <span className="label" style={{ display: "block", marginBottom: 12 }}>curriculum</span>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 4.5vw, 52px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.05 }}
            className="text-[var(--c-ink)] dark:text-[var(--c-dark-ink)]">
            {courses.length} courses,<br />no fluff.
          </h1>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 36 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--c-ink3)", letterSpacing: "0.08em", textTransform: "uppercase", minWidth: 42 }}
              className="dark:text-[var(--c-dark-ink3)]">level</span>
            {levels.map((l) => (
              <button key={l} onClick={() => setLevel(l)}
                style={{
                  padding: "5px 12px", borderRadius: "var(--radius-sm)", fontSize: 12.5, fontWeight: 600,
                  cursor: "pointer", transition: "all 0.12s", fontFamily: "var(--font-body)",
                  background: level === l ? "var(--c-ink)" : "transparent",
                  color: level === l ? "var(--c-bg)" : "var(--c-ink2)",
                  border: `1px solid ${level === l ? "var(--c-ink)" : "var(--c-border)"}`,
                }}
                className="dark:border-[var(--c-dark-border)] dark:text-[var(--c-dark-ink2)]">
                {l}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--c-ink3)", letterSpacing: "0.08em", textTransform: "uppercase", minWidth: 42 }}
              className="dark:text-[var(--c-dark-ink3)]">topic</span>
            {tags.map((t) => (
              <button key={t} onClick={() => setTag(t)}
                style={{
                  padding: "4px 10px", borderRadius: "var(--radius-sm)", fontSize: 11.5, fontWeight: 500,
                  cursor: "pointer", transition: "all 0.12s", fontFamily: "var(--font-mono)",
                  background: tag === t ? "var(--c-blue)" : "transparent",
                  color: tag === t ? "#fff" : "var(--c-ink3)",
                  border: `1px solid ${tag === t ? "var(--c-blue)" : "var(--c-border)"}`,
                }}
                className="dark:border-[var(--c-dark-border)] dark:text-[var(--c-dark-ink3)]">
                {t}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--c-ink3)" }}
            className="dark:text-[var(--c-dark-ink3)]">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
          {(level !== "All" || tag !== "All" || search) && (
            <button onClick={() => { setLevel("All"); setTag("All"); setSearch(""); }}
              style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--c-blue)", background: "none", border: "none", cursor: "pointer" }}
              className="dark:text-[var(--c-blue-dk)]">
              clear filters
            </button>
          )}
        </div>

        {filtered.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((c) => <CourseCard key={c.id} course={c} />)}
          </div>
        ) : (
          <div style={{ padding: "80px 0", textAlign: "center" }}>
            <BookOpen size={36} style={{ margin: "0 auto 14px", color: "var(--c-ink3)", opacity: 0.3 }} />
            <p style={{ fontSize: 14, color: "var(--c-ink3)" }} className="dark:text-[var(--c-dark-ink3)]">
              No courses match.
            </p>
            <button onClick={() => { setSearch(""); setLevel("All"); setTag("All"); }}
              style={{ marginTop: 10, fontSize: 12.5, fontFamily: "var(--font-mono)", color: "var(--c-blue)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
              className="dark:text-[var(--c-blue-dk)]">
              clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
