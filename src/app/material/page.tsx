import type { Metadata } from "next";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MaterialHero from "@/components/material/MaterialHero";
import MaterialCatalogSection from "@/components/material/MaterialCatalogSection";
import { getActiveMaterialBatches } from "@/services/material";

export const metadata: Metadata = {
  title: "Katalog Material Sirkular | Muri",
  description:
    "Temukan kain deadstock dan material sisa produksi terverifikasi untuk kebutuhan brand fashion sirkular Anda.",
};

export const dynamic = "force-dynamic";

export default async function MaterialPage() {
  const materialResponse = await getActiveMaterialBatches();

  const hasLoadError = !materialResponse.success;

  const materials = materialResponse.success
    ? (materialResponse.data ?? [])
    : [];

  if (!materialResponse.success) {
    console.error(
      "[MaterialPage] Failed to fetch materials:",
      materialResponse.error,
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-canvas-pure text-brand-black">
      <Header />

      <main className="pt-16">
        <MaterialHero />

        <MaterialCatalogSection
          materials={materials}
          hasLoadError={hasLoadError}
        />
      </main>

      <Footer />
    </div>
  );
}
