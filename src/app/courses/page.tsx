import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CourseBrowser from "@/components/courses/CourseBrowser";
import { courses } from "@/lib/data";

export const metadata: Metadata = {
  title: "Courses",
  description: "Video courses that pair with the roadmaps.",
};

export default function CoursesPage() {
  return (
    <>
      <Navbar />
      <main className="container page">
        <header style={{ marginBottom: 40, maxWidth: 640 }}>
          <h1 style={{ fontSize: "clamp(34px, 5vw, 54px)", fontWeight: 800, marginBottom: 14 }}>Courses</h1>
          <p style={{ fontSize: 17, color: "var(--c-ink2)", lineHeight: 1.65 }}>
            {courses.length} courses. Lessons without a video yet are marked, so you always know what you can watch today.
          </p>
        </header>
        <CourseBrowser />
      </main>
      <Footer />
    </>
  );
}
