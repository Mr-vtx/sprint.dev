import Link from "next/link";
import RoutePreview from "./RoutePreview";
import { roadmaps } from "@/lib/data";

export default function Hero() {
  return (
    <section className="container" style={{ paddingTop: 140, paddingBottom: 96 }}>
      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-16 items-center">
        <div>
          <h1 style={{ fontSize: "clamp(40px, 6vw, 72px)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.02, marginBottom: 24 }}>
            Learn by building the next milestone.
          </h1>
          <p style={{ fontSize: 19, lineHeight: 1.6, color: "var(--c-ink2)", maxWidth: 520, marginBottom: 32 }}>
            Roadmaps that tell you what to learn, why it matters, and what to build to prove it. Your progress is saved on your device. No account.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/roadmaps" className="btn btn-primary" style={{ padding: "12px 22px" }}>Browse roadmaps</Link>
            <Link href={`/roadmaps/${roadmaps[0].id}`} className="btn btn-outline" style={{ padding: "12px 22px" }}>Start with Rust</Link>
          </div>
        </div>
        <RoutePreview />
      </div>
    </section>
  );
}
