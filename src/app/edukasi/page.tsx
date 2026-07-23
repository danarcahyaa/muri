import type { Metadata } from "next";

import EducationHero from "@/components/education/EducationHero";
import EducationOutcomeSection from "@/components/education/EducationOutcomeSection";
import EducationWorkshopSection from "@/components/education/EducationWorkshopSection";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { getWorkshops } from "@/services/workshop";

export const metadata: Metadata = {
  title: "Edukasi & Workshop | Muri",
  description:
    "Ikuti workshop pengolahan limbah tekstil, upcycling, pengembangan produk, dan bisnis fashion sirkular bersama Muri.",
};

export const dynamic = "force-dynamic";

export default async function EducationPage() {
  const workshopResponse = await getWorkshops();
  const hasWorkshopLoadError = !workshopResponse.success;
  const workshops = workshopResponse.success
    ? (workshopResponse.data ?? [])
    : [];

  const activeWorkshopCount = workshops.filter(
    (workshop) => workshop.remainingSlots > 0,
  ).length;

  if (!workshopResponse.success) {
    console.error(
      "[EducationPage] Failed to fetch workshops:",
      workshopResponse.error,
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-canvas-pure text-brand-black">
      <Header />

      <main className="pt-16">
        <EducationHero
          activeWorkshopCount={activeWorkshopCount}
          hasLoadError={hasWorkshopLoadError}
        />

        <EducationWorkshopSection
          workshops={workshops}
          hasLoadError={hasWorkshopLoadError}
        />

        <EducationOutcomeSection />
      </main>

      <Footer />
    </div>
  );
}
