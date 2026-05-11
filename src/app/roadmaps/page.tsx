"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { roadmaps } from "@/lib/data";

const phaseColors: Record<string, string> = {
  blue: "var(--c-blue)", green: "var(--c-green)", amber: "var(--c-amber)",
};

const levelColors: Record<string, string> = {
  Beginner: "tag-green", Intermediate: "tag-blue", Advanced: "tag-amber",
};

export default function RoadmapsPage() {
  const [search, setSearch] = useState("");
  const filtered = roadmaps.filter(
    (r) => !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.tagline.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--c-bg)" }} className="dark:bg-[var(--c-dark-bg)]">
      <Navbar onSearch={setSearch} />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "96px 24px 64px" }}>

        <div style={{ marginBottom: 48 }}>
          <span className="label" style={{ display: "block", marginBottom: 12 }}>learning paths</span>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 4.5vw, 52px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.05, marginBottom: 16 }}
            className="text-[var(--c-ink)] dark:text-[var(--c-dark-ink)]">
            Week-by-week roadmaps
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: "var(--c-ink2)", maxWidth: 520 }} className="dark:text-[var(--c-dark-ink2)]">
            Structured paths for self-taught devs. Every roadmap breaks down exactly what to learn, why, how long it takes, and what to build.
          </p>
        </div>

        {filtered.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((r) => (
              <Link key={r.id} href={`/roadmaps/${r.id}`} className="block group">
                <div className="card card-hover h-full flex flex-col" style={{ overflow: "hidden" }}>
                  <div style={{ display: "flex" }}>
                    {r.phases.map((p) => (
                      <div key={p.id} style={{ height: 3, flex: 1, background: phaseColors[p.color] }} />
                    ))}
                  </div>

                  <div style={{ padding: "20px 20px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <span className={`tag ${levelColors[r.level]}`}>{r.level}</span>
                    </div>

                    <div style={{ flex: 1 }}>
                      <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.25, marginBottom: 8 }}
                        className="text-[var(--c-ink)] dark:text-[var(--c-dark-ink)] group-hover:text-[var(--c-blue)] dark:group-hover:text-[var(--c-blue-dk)] transition-colors">
                        {r.title}
                      </h2>
                      <p style={{ fontSize: 13.5, lineHeight: 1.65, color: "var(--c-ink2)" }} className="dark:text-[var(--c-dark-ink2)]">
                        {r.tagline}
                      </p>
                    </div>

                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {r.phases.map((p) => (
                        <span key={p.id} style={{ fontSize: 10.5, fontFamily: "var(--font-mono)", padding: "2px 8px", borderRadius: 2, background: "var(--c-surface2)", color: "var(--c-ink3)", border: "1px solid var(--c-border)" }}
                          className="dark:bg-[var(--c-dark-surface2)] dark:text-[var(--c-dark-ink3)] dark:border-[var(--c-dark-border)]">
                          {p.weekRange}: {p.title}
                        </span>
                      ))}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--c-border)", paddingTop: 12 }}
                      className="dark:border-[var(--c-dark-border)]">
                      <div style={{ display: "flex", gap: 14, fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--c-ink3)" }}
                        className="dark:text-[var(--c-dark-ink3)]">
                        <span>{r.duration}</span>
                        <span>{r.hoursPerWeek}/wk</span>
                        <span>{r.totalHours}h total</span>
                      </div>
                      <ChevronRight size={14} style={{ color: "var(--c-blue)", opacity: 0.7 }} className="group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{ padding: "80px 0", textAlign: "center" }}>
            <p style={{ fontSize: 14, color: "var(--c-ink3)", fontFamily: "var(--font-mono)" }} className="dark:text-[var(--c-dark-ink3)]">
              No roadmaps match &quot;{search}&quot;
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
