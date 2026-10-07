import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TopicDots from "@/components/roadmap/TopicDots";
import { roadmaps } from "@/lib/data";

export const metadata: Metadata = {
  title: "Roadmaps",
  description: "Step-by-step learning paths. Each topic ends with something you build.",
};

export default function RoadmapsPage() {
  return (
    <>
      <Navbar />
      <main className="container page">
        <header style={{ marginBottom: 48, maxWidth: 640 }}>
          <h1 style={{ fontSize: "clamp(34px, 5vw, 54px)", fontWeight: 800, marginBottom: 14 }}>Roadmaps</h1>
          <p style={{ fontSize: 17, color: "var(--c-ink2)", lineHeight: 1.65 }}>
            Each roadmap says what to learn, why it matters, how long it takes, and what to build to show you got it.
          </p>
        </header>

        <div style={{ borderTop: "1px solid var(--c-border)" }}>
          {roadmaps.map((r) => (
            <Link key={r.id} href={`/roadmaps/${r.id}`} className="group grid md:grid-cols-[1fr_280px] gap-x-12 gap-y-6" style={{ padding: "32px 0", borderBottom: "1px solid var(--c-border)" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <h2 style={{ fontSize: 28, fontWeight: 800 }} className="group-hover:text-[var(--c-blue)] transition-colors">{r.title}</h2>
                  <ArrowUpRight size={20} style={{ color: "var(--c-ink3)" }} />
                </div>
                <p style={{ fontSize: 16, color: "var(--c-ink2)", marginBottom: 14 }}>{r.tagline}</p>
                <p style={{ fontSize: 14, color: "var(--c-ink2)", maxWidth: 560 }}>
                  <strong style={{ fontWeight: 600, color: "var(--c-ink)" }}>You&apos;ll build:</strong> {r.finalProject}
                </p>
              </div>
              <div style={{ display: "grid", gap: 18, alignContent: "start" }}>
                <p className="label">{r.duration} · {r.hoursPerWeek} a week · {r.level}</p>
                <TopicDots roadmap={r} />
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
