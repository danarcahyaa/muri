import type { Metadata } from "next";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MaterialHero from "@/components/material/MaterialHero";
import MaterialCatalogSection from "@/components/material/MaterialCatalogSection";

export const metadata: Metadata = {
  title: "Katalog Material Sirkular | Muri",
  description:
    "Temukan kain deadstock dan material sisa produksi terverifikasi untuk kebutuhan brand fashion sirkular Anda.",
};

export default function MaterialPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-canvas-pure text-brand-black">
      <Header />

      <main className="pt-16">
        <MaterialHero />
        <MaterialCatalogSection />
      </main>

      <Footer />
    </div>
  );
}