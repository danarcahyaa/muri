import type { Metadata } from "next";

import EducationHero from "@/components/education/EducationHero";
import EducationOutcomeSection from "@/components/education/EducationOutcomeSection";
import EducationWorkshopSection from "@/components/education/EducationWorkshopSection";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "Edukasi & Workshop | Muri",

  description:
    "Ikuti workshop pengolahan limbah tekstil, upcycling, pengembangan produk, dan bisnis fashion sirkular bersama Muri.",
};

export default function EducationPage() {
  return (
    <div
      className="
        min-h-screen overflow-x-hidden
        bg-canvas-pure
        text-brand-black
      "
    >
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
