import type { Metadata } from "next";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import EducationHero from "@/components/education/EducationHero";
import EducationOutcomeSection from "@/components/education/EducationOutcomeSection";
import EducationWorkshopSection from "@/components/education/EducationWorkshopSection";

export const metadata: Metadata = {
  title: "Edukasi & Workshop | Muri",
  description:
    "Ikuti workshop pengolahan limbah tekstil, upcycling, dan pengembangan bisnis fashion sirkular bersama Muri.",
};

export default function EducationPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-canvas-pure text-brand-black">
      <Header />

      <main className="pt-16">
        <EducationHero />
        <EducationWorkshopSection />
        <EducationOutcomeSection />
      </main>

      <Footer />
    </div>
  );
}