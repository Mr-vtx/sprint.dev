import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import ContinueLearning from "@/components/home/ContinueLearning";
import Paths from "@/components/home/Paths";
import HowItWorks from "@/components/home/HowItWorks";
import Offline from "@/components/home/Offline";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ContinueLearning />
        <Paths />
        <HowItWorks />
        <Offline />
      </main>
      <Footer />
    </>
  );
}
