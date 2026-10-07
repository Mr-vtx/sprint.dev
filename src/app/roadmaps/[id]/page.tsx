import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import RoadmapView from "@/components/roadmap/RoadmapView";
import { roadmaps } from "@/lib/data";

type Params = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return roadmaps.map((r) => ({ id: r.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const r = roadmaps.find((x) => x.id === id);
  return r ? { title: r.title, description: r.tagline } : {};
}

export default async function RoadmapPage({ params }: Params) {
  const { id } = await params;
  const roadmap = roadmaps.find((r) => r.id === id);
  if (!roadmap) notFound();

  return (
    <>
      <Navbar />
      <main className="container page">
        <Link href="/roadmaps" className="label hover:text-[var(--c-ink)]" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 28 }}>
          <ArrowLeft size={13} /> All roadmaps
        </Link>
        <RoadmapView roadmap={roadmap} />
      </main>
      <Footer />
    </>
  );
}
