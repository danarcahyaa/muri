import type { Metadata } from "next";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import BrandMaterialCheckout from "@/components/material/BrandMaterialCheckout";

interface MaterialCheckoutPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    quantity?: string | string[];
  }>;
}

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout Material Sirkular | Muri",
  description: "Selesaikan pengajuan pembelian material/limbah kain dari Waste Provider.",
};

export default async function MaterialCheckoutPage({
  params,
  searchParams,
}: MaterialCheckoutPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const requestedWeightKg = parseRequestedWeight(query.quantity);

  return (
    <div className="min-h-screen overflow-x-clip bg-canvas-warm/45 text-brand-black">
      <Header />

      <main className="pt-16">
        <section className="py-[clamp(48px,7vw,96px)]">
          <div className="mx-auto w-[min(1320px,calc(100%_-_48px))]">
            <BrandMaterialCheckout
              batchCode={slug}
              requestedWeightKg={requestedWeightKg}
            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function parseRequestedWeight(
  value: string | string[] | undefined,
): number {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const parsedValue = Number(rawValue ?? "10");

  return Number.isFinite(parsedValue) && parsedValue >= 1
    ? parsedValue
    : 10;
}
