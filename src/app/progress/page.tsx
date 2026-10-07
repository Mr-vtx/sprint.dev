import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProgressView from "@/components/progress/ProgressView";

export const metadata: Metadata = {
  title: "Progress",
  description: "Your streak, roadmap and course progress, stored on your device.",
};

export default function ProgressPage() {
  return (
    <>
      <Navbar />
      <main className="container page">
        <ProgressView />
      </main>
      <Footer />
    </>
  );
}
