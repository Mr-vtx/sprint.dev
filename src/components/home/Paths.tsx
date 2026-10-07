import Link from "next/link";
import { ArrowRight } from "lucide-react";
import TopicDots from "@/components/roadmap/TopicDots";
import { roadmaps } from "@/lib/data";

export default function Paths() {
  return (
    <section className="container" style={{ marginBottom: 112 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 28, gap: 16, flexWrap: "wrap" }}>
        <h2 style={{ fontSize: "clamp(28px, 3.6vw, 40px)", fontWeight: 800 }}>Pick a path</h2>
        <Link href="/roadmaps" className="btn btn-ghost" style={{ color: "var(--c-blue)" }}>All roadmaps <ArrowRight size={14} /></Link>
      </div>
      <div className="grid md:grid-cols-2 gap-5">
        {roadmaps.map((r) => (
          <Link key={r.id} href={`/roadmaps/${r.id}`} className="card card-hover group" style={{ padding: 28, display: "grid", gap: 20, alignContent: "space-between" }}>
            <div>
              <p className="label" style={{ marginBottom: 10 }}>{r.duration} · {r.level}</p>
              <h3 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }} className="group-hover:text-[var(--c-blue)] transition-colors">{r.title}</h3>
              <p style={{ color: "var(--c-ink2)", fontSize: 15.5 }}>{r.tagline}</p>
            </div>
            <TopicDots roadmap={r} />
          </Link>
        ))}
      </div>
    </section>
  );
}
