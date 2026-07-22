import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import WorkshopBookingCard from "@/components/education/WorkshopBookingCard";
import WorkshopDetailContent from "@/components/education/WorkshopDetailContent";
import WorkshopHero from "@/components/education/WorkshopHero";
import { sanitizeRichTextAsPlainHtml } from "@/lib/richText";
import { getWorkshopById } from "@/services/workshop";

interface WorkshopDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Kuota workshop dapat berubah karena registrasi baru.
 */
export const dynamic = "force-dynamic";

/**
 * Mencegah query yang sama dijalankan dua kali dalam satu request,
 * yaitu saat generateMetadata dan saat page dirender.
 */
const getWorkshop = cache((workshopId: string) =>
  getWorkshopById(workshopId),
);

export async function generateMetadata({
  params,
}: WorkshopDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getWorkshop(slug);

  if (!result.success || !result.data) {
    return {
      title: "Workshop Tidak Ditemukan | Muri",
      description: "Workshop yang Anda cari tidak tersedia.",
    };
  }

  const description = sanitizeRichTextAsPlainHtml(
    result.data.descriptionHtml,
  ).slice(0, 160);

  return {
    title: `${result.data.title} | Workshop Muri`,
    description:
      description ||
      `Ikuti workshop ${result.data.title} bersama Muri.`,
  };
}

export default async function WorkshopDetailPage({
  params,
}: WorkshopDetailPageProps) {
  const { slug } = await params;
  const result = await getWorkshop(slug);

  if (!result.success) {
    throw new Error(
      typeof result.error === "string"
        ? result.error
        : "Gagal mengambil detail workshop.",
    );
  }

  if (!result.data) {
    notFound();
  }

  const workshop = result.data;
  // maps_url column was removed from the workshops table; always null for now
  const mapsUrl = null;
  const loginHref = `/auth/login?redirect=${encodeURIComponent(
    `/edukasi/workshop/${workshop.id}`,
  )}`;

  return (
    <div className="min-h-screen overflow-x-clip bg-canvas-pure text-brand-black">
      <Header />

      <main className="pt-16">
        <WorkshopHero title={workshop.title} />

        <section className="bg-canvas-warm">
          <div
            className="
              mx-auto grid
              w-[min(1320px,calc(100%_-_48px))]
              gap-9 py-[clamp(64px,8vw,110px)]
              lg:grid-cols-[minmax(0,1fr)_390px]
              lg:items-start
            "
          >
            <WorkshopDetailContent
              workshop={workshop}
              mapsUrl={mapsUrl}
            />

            <WorkshopBookingCard
              workshop={workshop}
              loginHref={loginHref}
            />
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}

function normalizeExternalUrl(value: string | null): string | null {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}
