"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import CourseCard from "@/components/ui/CourseCard";
import { courses } from "@/lib/data";

const LEVELS = ["All", "Beginner", "Intermediate", "Advanced"] as const;

export default function CourseBrowser() {
  const [q, setQ] = useState("");
  const [level, setLevel] = useState<(typeof LEVELS)[number]>("All");

  const needle = q.trim().toLowerCase();
  const list = courses.filter(
    (c) =>
      (level === "All" || c.level === level) &&
      (!needle || c.title.toLowerCase().includes(needle) || c.tags.some((t) => t.toLowerCase().includes(needle))),
  );

  return (
    <>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 28 }}>
        <div style={{ position: "relative", flex: "1 1 260px", maxWidth: 380 }}>
          <Search size={15} style={{ position: "absolute", left: 14, top: 13, color: "var(--c-ink3)" }} aria-hidden />
          <input className="search-input" placeholder="Search by title or topic" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search courses" />
        </div>
        <div role="group" aria-label="Level" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {LEVELS.map((l) => (
            <button key={l} onClick={() => setLevel(l)} aria-pressed={level === l} className={level === l ? "btn btn-primary btn-sm" : "btn btn-outline btn-sm"}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div style={{ borderTop: "1px solid var(--c-border)" }}>
        {list.map((c) => <CourseCard key={c.id} course={c} />)}
      </div>

      {list.length === 0 && (
        <p style={{ padding: "56px 0", color: "var(--c-ink2)" }}>
          No courses match that. Clear the search or pick another level.
        </p>
      )}
    </>
  );
}
