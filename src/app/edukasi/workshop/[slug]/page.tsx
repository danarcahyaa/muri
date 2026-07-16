import type { Metadata } from "next";
import type {
  ComponentType,
  ReactNode,
} from "react";
import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Coins,
  ExternalLink,
  Leaf,
  MapPin,
  Presentation,
  UserRound,
  UsersRound,
} from "lucide-react";

import EducationWorkshopSection from "@/components/education/EducationWorkshopSection";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import RichTextContent from "@/components/ui/RichTextContent";
import {
  sanitizeRichTextAsPlainHtml,
} from "@/lib/richText";
import {
  formatWorkshopDate,
  formatWorkshopTime,
} from "@/lib/workshop";
import {
  getWorkshopById,
} from "@/services/workshop";
import type {
  WorkshopCatalogItem,
} from "@/types/workshop";

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
 * Mencegah query Supabase dieksekusi dua kali
 * saat generateMetadata dan page meminta workshop yang sama.
 *
 * Cache ini hanya berlaku dalam request yang sama.
 */
const getWorkshop = cache(
  async (workshopId: string) =>
    getWorkshopById(workshopId),
);

export async function generateMetadata({
  params,
}: WorkshopDetailPageProps): Promise<Metadata> {
  const { slug } = await params;

  const result = await getWorkshop(slug);

  if (!result.success || !result.data) {
    return {
      title:
        "Workshop Tidak Ditemukan | Muri",
      description:
        "Workshop yang Anda cari tidak tersedia.",
    };
  }

  const description =
    sanitizeRichTextAsPlainHtml(
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

  const bookingPercentage =
    workshop.quota > 0
      ? Math.min(
          Math.max(
            (workshop.registeredCount /
              workshop.quota) *
              100,
            0,
          ),
          100,
        )
      : 100;

  const mapsUrl = normalizeExternalUrl(
    workshop.mapsUrl,
  );

  const loginHref = `/auth/login?redirect=${encodeURIComponent(
    `/edukasi/workshop/${workshop.id}`,
  )}`;

  return (
    <div className="min-h-screen overflow-x-hidden bg-canvas-pure text-brand-black">
      <Header />

      <main className="pt-16">
        {/* Hero */}
        <section className="bg-brand-forest text-canvas-pure">
          <div
            className="
              mx-auto
              w-[min(1320px,calc(100%_-_48px))]
              pb-[clamp(72px,8vw,110px)]
              pt-[clamp(42px,6vw,82px)]
            "
          >
            <nav
              aria-label="Breadcrumb"
              className="
                flex flex-wrap items-center
                gap-4 text-xs
                text-canvas-pure/55
              "
            >
              <Link
                href="/"
                className="transition-colors hover:text-brand-lime"
              >
                Beranda
              </Link>

              <span aria-hidden="true">
                /
              </span>

              <Link
                href="/edukasi"
                className="transition-colors hover:text-brand-lime"
              >
                Workshop
              </Link>

              <span aria-hidden="true">
                /
              </span>

              <span className="line-clamp-1">
                {workshop.title}
              </span>
            </nav>

            <div
              className="
                mt-14 grid gap-12
                lg:grid-cols-[minmax(0,1fr)_340px]
                lg:items-end
              "
            >
              <div>
                <div className="flex items-center gap-3 text-brand-lime">
                  <Leaf
                    className="size-4"
                    strokeWidth={2}
                  />

                  <span className="text-sm font-bold uppercase tracking-tight">
                    {workshop.speakerName}
                  </span>
                </div>

                <p className="mt-7 text-xs font-bold uppercase tracking-[0.14em] text-canvas-pure/55">
                  Workshop Muri
                </p>

                <h1
                  className="
                    mt-4 max-w-5xl
                    font-display
                    text-[clamp(3.5rem,6.5vw,6.5rem)]
                    font-normal leading-[0.94]
                    tracking-[-0.06em]
                  "
                >
                  {workshop.title}
                </h1>

                <RichTextContent
                  html={
                    workshop.descriptionHtml
                  }
                  mode="plain"
                  className="
                    mt-8 max-w-3xl
                    text-sm leading-relaxed
                    text-canvas-pure/65
                    sm:text-base
                  "
                />
              </div>

              {/* Hero quick facts */}
              <aside
                className="
                  rounded-2xl border
                  border-canvas-pure/15
                  bg-canvas-pure/5 p-6
                  backdrop-blur-sm
                "
              >
                <p className="text-[11px] font-bold uppercase tracking-wide text-brand-lime">
                  Informasi Workshop
                </p>

                <div className="mt-6 space-y-5">
                  <HeroFact
                    icon={CalendarDays}
                    label="Tanggal"
                    value={formatWorkshopDate(
                      workshop.heldAt,
                    )}
                  />

                  <HeroFact
                    icon={Clock3}
                    label="Waktu Mulai"
                    value={formatWorkshopTime(
                      workshop.heldAt,
                    )}
                  />

                  <HeroFact
                    icon={MapPin}
                    label="Lokasi"
                    value={workshop.location}
                  />

                  <HeroFact
                    icon={UsersRound}
                    label="Ketersediaan"
                    value={
                      workshop.isFull
                        ? "Kuota penuh"
                        : `${workshop.remainingSlots} slot tersisa`
                    }
                  />
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* Main detail */}
        <section className="bg-canvas-warm">
          <div
            className="
              mx-auto grid
              w-[min(1320px,calc(100%_-_48px))]
              gap-10
              py-[clamp(64px,8vw,110px)]
              lg:grid-cols-[minmax(0,1fr)_380px]
              lg:items-start
            "
          >
            {/* Main content */}
            <article
              className="
                overflow-hidden rounded-2xl
                border border-line-trace
                bg-canvas-pure
              "
            >
              {/* Workshop visual */}
              <div className="p-4 sm:p-7">
                <div
                  className="
                    relative flex
                    aspect-[16/8]
                    items-center justify-center
                    overflow-hidden
                    rounded-xl
                    bg-brand-forest
                  "
                >
                  <div
                    aria-hidden="true"
                    className="
                      absolute -right-16 -top-16
                      size-72 rounded-full
                      border border-brand-lime/15
                    "
                  />

                  <div
                    aria-hidden="true"
                    className="
                      absolute -bottom-24 -left-16
                      size-80 rounded-full
                      border border-brand-lime/10
                    "
                  />

                  <div className="relative z-10 flex flex-col items-center text-brand-lime">
                    <Presentation
                      className="size-24"
                      strokeWidth={1.1}
                    />

                    <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em]">
                      Workshop Muri
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <DetailTag
                    icon={UserRound}
                    value={
                      workshop.speakerName
                    }
                  />

                  <DetailTag
                    icon={CalendarDays}
                    value={formatWorkshopDate(
                      workshop.heldAt,
                    )}
                  />

                  <DetailTag
                    icon={Clock3}
                    value={formatWorkshopTime(
                      workshop.heldAt,
                    )}
                  />

                  <DetailTag
                    icon={MapPin}
                    value={workshop.location}
                  />
                </div>
              </div>

              <div className="border-t border-line-trace px-6 py-9 sm:px-10">
                {/* Description */}
                <ContentSection title="Tentang Workshop">
                  <RichTextContent
                    html={
                      workshop.descriptionHtml
                    }
                    mode="rich"
                    className="text-sm leading-7 text-muted-moss"
                  />
                </ContentSection>

                {/* Speaker */}
                <ContentSection title="Profil Pembicara">
                  <div
                    className="
                      grid items-start gap-5
                      rounded-2xl
                      border border-line-trace
                      p-5
                      sm:grid-cols-[64px_minmax(0,1fr)]
                      sm:gap-6 sm:p-7
                    "
                  >
                    <div
                      className="
                        flex size-16 shrink-0
                        items-center justify-center
                        rounded-full
                        bg-brand-lime
                        font-display text-2xl
                        font-bold
                        text-brand-forest
                      "
                    >
                      {getInitial(
                        workshop.speakerName,
                      )}
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-display text-2xl font-medium leading-tight text-brand-black">
                        {workshop.speakerName}
                      </h3>

                      <p className="mt-2 text-xs font-bold text-brand-emerald">
                        {workshop.speakerRole}
                      </p>

                      <p className="mt-5 text-sm leading-6 text-muted-moss">
                        Pembicara workshop
                        yang akan membagikan
                        pengalaman dan
                        pengetahuan mengenai
                        topik kelas ini.
                      </p>
                    </div>
                  </div>
                </ContentSection>

                {/* Schedule */}
                <ContentSection title="Jadwal Workshop">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <InformationBox
                      icon={CalendarDays}
                      label="Tanggal"
                      value={formatWorkshopDate(
                        workshop.heldAt,
                      )}
                    />

                    <InformationBox
                      icon={Clock3}
                      label="Waktu Mulai"
                      value={formatWorkshopTime(
                        workshop.heldAt,
                      )}
                    />

                    <InformationBox
                      icon={UsersRound}
                      label="Kapasitas"
                      value={`${workshop.quota} peserta`}
                    />

                    <InformationBox
                      icon={Coins}
                      label="Biaya"
                      value={
                        workshop.pointCost ===
                        0
                          ? "Gratis"
                          : `${workshop.pointCost} POIN`
                      }
                    />
                  </div>
                </ContentSection>

                {/* Location */}
                <ContentSection
                  title="Lokasi Workshop"
                  compact
                >
                  <div className="rounded-xl bg-canvas-warm p-5 sm:p-6">
                    <div className="flex gap-4">
                      <MapPin className="mt-0.5 size-5 shrink-0 text-brand-emerald" />

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-brand-black">
                          {workshop.location}
                        </p>

                        <p className="mt-2 text-xs leading-relaxed text-muted-moss">
                          Pastikan datang lebih
                          awal agar proses
                          registrasi dapat
                          dilakukan sebelum
                          workshop dimulai.
                        </p>

                        {mapsUrl && (
                          <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="
                              mt-5 inline-flex
                              items-center gap-2
                              text-xs font-bold
                              text-brand-emerald
                              transition-colors
                              hover:text-brand-forest
                            "
                          >
                            Buka Google Maps

                            <ExternalLink className="size-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </ContentSection>
              </div>
            </article>

            {/* Booking card */}
            <aside
              className="
                rounded-2xl border
                border-line-trace
                bg-canvas-pure p-6
                lg:sticky lg:top-24
                sm:p-7
              "
            >
              <div className="flex items-center gap-3 text-brand-emerald">
                <Leaf
                  className="size-4"
                  strokeWidth={2}
                />

                <h2 className="text-xs font-bold uppercase tracking-tight">
                  Ringkasan Pendaftaran
                </h2>
              </div>

              {/* Availability */}
              <div className="mt-7 rounded-xl bg-canvas-warm p-5">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-[11px] text-muted-moss">
                    Ketersediaan
                  </p>

                  <p className="text-[11px] font-bold text-brand-black">
                    {workshop.remainingSlots}{" "}
                    dari {workshop.quota} slot
                  </p>
                </div>

                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-line-trace">
                  <div
                    className="h-full rounded-full bg-brand-emerald transition-[width]"
                    style={{
                      width: `${bookingPercentage}%`,
                    }}
                  />
                </div>

                <p className="mt-3 text-[10px] text-muted-moss">
                  {
                    workshop.registeredCount
                  }{" "}
                  peserta telah terdaftar
                </p>
              </div>

              {/* Price */}
              <div className="mt-5 rounded-xl bg-brand-lime p-6 text-brand-forest">
                <p className="text-[10px] uppercase tracking-wide opacity-70">
                  Biaya Workshop
                </p>

                <div className="mt-7 flex items-center gap-3">
                  <Coins
                    className="size-7"
                    strokeWidth={1.7}
                  />

                  <p className="font-display text-5xl font-medium tracking-[-0.05em]">
                    {workshop.pointCost === 0
                      ? "Gratis"
                      : workshop.pointCost}
                  </p>

                  {workshop.pointCost >
                    0 && (
                    <p className="mt-4 text-xl font-bold">
                      POIN
                    </p>
                  )}
                </div>

                <p className="mt-4 text-[11px] opacity-70">
                  Untuk satu peserta
                </p>
              </div>

              {/* Booking facts */}
              <div className="mt-6 space-y-4">
                <BookingFact
                  icon={CalendarDays}
                  label="Tanggal"
                  value={formatWorkshopDate(
                    workshop.heldAt,
                  )}
                />

                <BookingFact
                  icon={Clock3}
                  label="Waktu Mulai"
                  value={formatWorkshopTime(
                    workshop.heldAt,
                  )}
                />

                <BookingFact
                  icon={MapPin}
                  label="Lokasi"
                  value={workshop.location}
                />

                <BookingFact
                  icon={UsersRound}
                  label="Sisa Kuota"
                  value={`${workshop.remainingSlots} slot`}
                />
              </div>

              {workshop.isFull ? (
                <button
                  type="button"
                  disabled
                  className="
                    mt-7 flex w-full
                    cursor-not-allowed
                    items-center justify-center
                    rounded-sm
                    bg-muted-moss/25
                    px-6 py-4
                    text-xs font-bold
                    text-muted-moss
                  "
                >
                  Kuota Penuh
                </button>
              ) : (
                <Link
                  href={loginHref}
                  className="
                    group mt-7 flex w-full
                    items-center justify-center
                    gap-3 rounded-sm
                    bg-brand-forest
                    px-6 py-4
                    text-xs font-bold
                    text-canvas-pure
                    transition duration-300
                    hover:bg-brand-black
                  "
                >
                  Daftar Workshop

                  <ArrowRight
                    className="
                      size-4
                      transition-transform
                      group-hover:translate-x-1
                    "
                  />
                </Link>
              )}

              <p className="mt-4 text-center text-[10px] leading-relaxed text-muted-moss">
                Masuk atau buat akun untuk
                melanjutkan pendaftaran.
              </p>
            </aside>
          </div>
        </section>

        {/* Other workshops */}
        <EducationWorkshopSection />
      </main>

      <Footer />
    </div>
  );
}

interface HeroFactProps {
  icon: ComponentType<{
    className?: string;
    strokeWidth?: number;
  }>;

  label: string;
  value: string;
}

function HeroFact({
  icon: Icon,
  label,
  value,
}: HeroFactProps) {
  return (
    <div className="flex gap-4">
      <Icon
        className="mt-0.5 size-4 shrink-0 text-brand-lime"
        strokeWidth={1.8}
      />

      <div className="min-w-0">
        <p className="text-[9px] uppercase tracking-wide text-canvas-pure/45">
          {label}
        </p>

        <p className="mt-1 text-xs font-bold text-canvas-pure">
          {value}
        </p>
      </div>
    </div>
  );
}

interface DetailTagProps {
  icon: ComponentType<{
    className?: string;
    strokeWidth?: number;
  }>;

  value: string;
}

function DetailTag({
  icon: Icon,
  value,
}: DetailTagProps) {
  return (
    <span
      className="
        inline-flex items-center gap-2
        rounded-full
        bg-canvas-warm
        px-4 py-2
        text-[10px] font-bold
        text-brand-emerald
      "
    >
      <Icon
        className="size-3.5"
        strokeWidth={1.8}
      />

      {value}
    </span>
  );
}

interface ContentSectionProps {
  title: string;
  children: ReactNode;
  compact?: boolean;
}

function ContentSection({
  title,
  children,
  compact = false,
}: ContentSectionProps) {
  return (
    <section
      className={`
        ${
          compact
            ? ""
            : `
                mb-10
                border-b border-line-trace
                pb-10
              `
        }

        last:mb-0
        last:border-b-0
        last:pb-0
      `}
    >
      <h2 className="mb-6 font-display text-3xl font-medium tracking-[-0.035em] text-brand-black">
        {title}
      </h2>

      {children}
    </section>
  );
}

interface InformationBoxProps {
  icon: ComponentType<{
    className?: string;
    strokeWidth?: number;
  }>;

  label: string;
  value: string;
}

function InformationBox({
  icon: Icon,
  label,
  value,
}: InformationBoxProps) {
  return (
    <div className="flex gap-4 rounded-xl bg-canvas-warm p-5">
      <div
        className="
          flex size-10 shrink-0
          items-center justify-center
          rounded-lg
          bg-brand-lime/50
          text-brand-forest
        "
      >
        <Icon
          className="size-4"
          strokeWidth={1.8}
        />
      </div>

      <div>
        <p className="text-[9px] uppercase tracking-wide text-muted-moss">
          {label}
        </p>

        <p className="mt-1.5 text-xs font-bold leading-5 text-brand-black">
          {value}
        </p>
      </div>
    </div>
  );
}

interface BookingFactProps {
  icon: ComponentType<{
    className?: string;
    strokeWidth?: number;
  }>;

  label: string;
  value: string;
}

function BookingFact({
  icon: Icon,
  label,
  value,
}: BookingFactProps) {
  return (
    <div className="flex gap-4">
      <div
        className="
          flex size-9 shrink-0
          items-center justify-center
          rounded-lg
          bg-canvas-warm
          text-brand-emerald
        "
      >
        <Icon
          className="size-4"
          strokeWidth={1.8}
        />
      </div>

      <div className="min-w-0">
        <p className="text-[9px] uppercase tracking-wide text-muted-moss">
          {label}
        </p>

        <p className="mt-1 text-xs font-bold text-brand-black">
          {value}
        </p>
      </div>
    </div>
  );
}

function getInitial(
  name: string,
): string {
  return (
    name.trim().charAt(0).toUpperCase() ||
    "M"
  );
}

function normalizeExternalUrl(
  value: string | null,
): string | null {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);

    if (
      url.protocol !== "http:" &&
      url.protocol !== "https:"
    ) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}