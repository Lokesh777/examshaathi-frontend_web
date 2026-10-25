import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Stats } from "@/components/landing/Stats";
import { CtaBanner } from "@/components/landing/CtaBanner";
import { Faq, GuideTeaser } from "@/components/landing/Faq";
import { Footer } from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <GuideTeaser />
        <Stats />
        <Faq />
        <CtaBanner />
      </main>
      <Footer />
    </div>
  );
}
