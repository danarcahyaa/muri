import type { Metadata } from "next";
import type {
  ComponentType,
  ReactNode,
} from "react";
import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarDays,
  ImageOff,
  Leaf,
  MapPin,
  PackageCheck,
  Ruler,
  UserRound,
  Warehouse,
} from "lucide-react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MaterialOrderCard from "@/components/material/MaterialOrderCard";
import RichTextContent from "@/components/ui/RichTextContent";
import {
  sanitizeRichTextAsPlainHtml,
} from "@/lib/richText";
import {
  getMaterialBatchByCode,
} from "@/services/material";
import type {
  MaterialDetailItem,
} from "@/types/material";

interface MaterialDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Stok dan harga dapat berubah,
 * jadi halaman tidak dibuat sebagai static page.
 */
export const dynamic = "force-dynamic";

const getMaterial = cache(
  async (batchCode: string) =>
    getMaterialBatchByCode(batchCode),
);

export async function generateMetadata({
  params,
}: MaterialDetailPageProps): Promise<Metadata> {
  const { slug } = await params;

  const result = await getMaterial(slug);

  if (!result.success || !result.data) {
    return {
      title:
        "Material Tidak Ditemukan | Muri",
    };
  }

  const description =
    sanitizeRichTextAsPlainHtml(
      result.data.descriptionHtml,
    ).slice(0, 160);

  return {
    title: `${result.data.title} | Material Sirkular Muri`,
    description:
      description ||
      `Detail batch material ${result.data.batchCode} dari ${result.data.providerName}.`,
  };
}

export default async function MaterialDetailPage({
  params,
}: MaterialDetailPageProps) {
  const { slug } = await params;

  const result = await getMaterial(slug);

  if (!result.success) {
    throw new Error(
      typeof result.error === "string"
        ? result.error
        : "Gagal mengambil detail material.",
    );
  }

  if (!result.data) {
    notFound();
  }

  const material = result.data;

  const imageMedia =
    material.media.filter((item) => {
      const type =
        String(item.type).toLowerCase();

      return (
        type === "image" ||
        type === "photo" ||
        type === "picture"
      );
    });

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
              pb-[clamp(72px,9vw,120px)]
              pt-[clamp(44px,6vw,82px)]
            "
          >
            <nav
              aria-label="Breadcrumb"
              className="
                flex flex-wrap items-center
                gap-4 text-xs
                text-canvas-pure/50
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
                href="/material"
                className="transition-colors hover:text-brand-lime"
              >
                Material
              </Link>

              <span aria-hidden="true">
                /
              </span>

              <span className="line-clamp-1">
                {material.categoryName}
              </span>
            </nav>

            <div
              className="
                mt-14 grid gap-12
                lg:grid-cols-[minmax(0,1fr)_320px]
                lg:items-center lg:gap-20
              "
            >
              <div>
                <div className="flex items-center gap-3 text-brand-lime">
                  <Leaf
                    className="size-4"
                    strokeWidth={2}
                  />

                  <span className="text-sm font-bold uppercase tracking-tight">
                    {material.providerName}
                  </span>
                </div>

                <h1
                  className="
                    mt-5 max-w-5xl
                    font-display
                    text-[clamp(3.6rem,7vw,7.2rem)]
                    font-normal leading-[0.93]
                    tracking-[-0.065em]
                  "
                >
                  {material.title}
                </h1>

                <RichTextContent
                  html={
                    material.descriptionHtml
                  }
                  mode="plain"
                  className="
                    mt-8 max-w-3xl
                    text-sm leading-relaxed
                    text-canvas-pure/60
                    sm:text-base
                  "
                />
              </div>

              <aside
                className="
                  rounded-2xl border
                  border-canvas-pure/15
                  bg-canvas-pure/[0.035]
                  p-7 backdrop-blur-sm
                "
              >
                <p className="text-[10px] uppercase tracking-wide text-canvas-pure/45">
                  Harga per kilogram
                </p>

                <p
                  className="
                    mt-8 font-display
                    text-[clamp(2.8rem,4.3vw,4.4rem)]
                    font-medium leading-none
                    tracking-[-0.055em]
                    text-brand-lime
                  "
                >
                  {formatIdr(
                    material.pricePerKg,
                  )}
                </p>

                <p className="mt-5 text-[11px] text-canvas-pure/45">
                  /kg
                </p>
              </aside>
            </div>
          </div>
        </section>

        {/* Main content */}
        <section className="bg-canvas-warm">
          <div
            className="
              mx-auto grid
              w-[min(1320px,calc(100%_-_48px))]
              gap-9
              py-[clamp(64px,8vw,110px)]
              lg:grid-cols-[minmax(0,1fr)_390px]
              lg:items-start
            "
          >
            <div className="space-y-8">
              {/* Main material card */}
              <article className="rounded-2xl border border-line-trace bg-canvas-pure p-5 sm:p-7">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3 text-brand-emerald">
                    <Leaf
                      className="size-4"
                      strokeWidth={2}
                    />

                    <h2 className="text-xs font-bold uppercase tracking-tight sm:text-sm">
                      Katalog Material
                      Sirkular
                    </h2>
                  </div>

                  <span className="rounded-full bg-brand-lime px-6 py-3 text-xs font-medium text-brand-forest">
                    Tersedia
                  </span>
                </div>

                <MaterialMainImage
                  material={material}
                />

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <MaterialStat
                    label="Stok tersedia"
                    value={`${formatWeight(
                      material.availableWeightKg,
                    )} kg`}
                  />

                  <MaterialStat
                    label="Harga"
                    value={`${formatIdr(
                      material.pricePerKg,
                    )}/kg`}
                  />

                  <MaterialStat
                    label="ID Pelacakan"
                    value={material.batchCode}
                  />
                </div>
              </article>

              {/* Description */}
              <ContentCard
                eyebrow="Detail Material"
                title="Detail & Kondisi"
                icon={PackageCheck}
              >
                <RichTextContent
                  html={
                    material.descriptionHtml
                  }
                  mode="rich"
                />
              </ContentCard>

              {/* Batch information */}
              <ContentCard
                eyebrow="Informasi Material"
                title="Informasi Batch"
                icon={Ruler}
              >
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <Specification
                    label="Kategori"
                    value={
                      material.categoryName
                    }
                  />

                  <Specification
                    label="Berat Awal Batch"
                    value={`${formatWeight(
                      material.initialWeightKg,
                    )} kg`}
                  />

                  <Specification
                    label="Stok Tersedia"
                    value={`${formatWeight(
                      material.availableWeightKg,
                    )} kg`}
                  />

                  <Specification
                    label="Minimum Order"
                    value={`${formatWeight(
                      material.minimumOrderKg,
                    )} kg`}
                  />

                  <Specification
                    label="Berat Waste Post"
                    value={`${formatWeight(
                      material.postWeightKg,
                    )} kg`}
                  />

                  <Specification
                    label="Status"
                    value={formatStatus(
                      material.status,
                    )}
                  />
                </div>

                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  <InfoStrip
                    icon={Warehouse}
                    label="Kota Asal"
                    value={
                      material.originCity
                    }
                  />

                  <InfoStrip
                    icon={CalendarDays}
                    label="Batch Dibuat"
                    value={formatDate(
                      material.batchCreatedAt,
                    )}
                  />

                  <InfoStrip
                    icon={PackageCheck}
                    label="Kode Batch"
                    value={
                      material.batchCode
                    }
                  />

                  <InfoStrip
                    icon={MapPin}
                    label="Lokasi Material"
                    value={
                      material.originCity
                    }
                  />
                </div>
              </ContentCard>

              {/* Gallery */}
              {imageMedia.length > 1 && (
                <ContentCard
                  eyebrow="Dokumentasi"
                  title="Galeri Material"
                  icon={ImageOff}
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    {imageMedia.map(
                      (media) => (
                        <div
                          key={media.id}
                          className="
                            aspect-[4/3]
                            overflow-hidden
                            rounded-xl
                            bg-canvas-warm
                          "
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={media.url}
                            alt={`${material.title} - dokumentasi`}
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ),
                    )}
                  </div>
                </ContentCard>
              )}

              {/* Provider */}
              <ContentCard
                eyebrow="Mitra Penyedia"
                title="Profil Penyedia Material"
                icon={UserRound}
              >
                <div
                  className="
                    grid gap-6
                    rounded-2xl border
                    border-line-trace p-6
                    sm:grid-cols-[72px_minmax(0,1fr)]
                    sm:p-7
                  "
                >
                  <div
                    className="
                      flex size-[72px]
                      items-center justify-center
                      rounded-full
                      bg-brand-lime
                      font-display text-3xl
                      font-semibold
                      text-brand-forest
                    "
                  >
                    {material.providerName
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <h3 className="font-display text-2xl font-medium tracking-[-0.035em]">
                      {material.providerName}
                    </h3>

                    <p className="mt-2 text-xs font-bold text-brand-emerald">
                      Penyedia Material
                      Sirkular
                    </p>

                    <div className="mt-5 flex flex-wrap gap-x-7 gap-y-2 text-xs text-muted-moss">
                      <span>
                        Material berasal dari{" "}
                        {material.originCity}
                      </span>

                      {material.providerCreatedAt && (
                        <span>
                          Terdaftar sejak{" "}
                          {formatDate(
                            material.providerCreatedAt,
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </ContentCard>
            </div>

            <MaterialOrderCard
              slug={material.batchCode}
              pricePerKg={
                material.pricePerKg
              }
              availableKg={
                material.availableWeightKg
              }
              minimumOrderKg={
                material.minimumOrderKg
              }
              orderStepKg={1}
            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function MaterialMainImage({
  material,
}: {
  material: MaterialDetailItem;
}) {
  return (
    <div className="relative mt-6 aspect-[16/7.2] overflow-hidden rounded-xl bg-canvas-warm">
      {material.primaryImageUrl ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={
              material.primaryImageUrl
            }
            alt={material.title}
            className="h-full w-full object-cover"
          />
        </>
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-muted-moss/50">
          <ImageOff
            className="size-10"
            strokeWidth={1.4}
          />

          <span className="text-xs">
            Foto material belum tersedia
          </span>
        </div>
      )}
    </div>
  );
}

interface MaterialStatProps {
  label: string;
  value: string;
}

function MaterialStat({
  label,
  value,
}: MaterialStatProps) {
  return (
    <div className="rounded-xl bg-canvas-warm px-4 py-3.5">
      <p className="text-[10px] text-muted-moss">
        {label}
      </p>

      <p className="mt-1 truncate text-xs font-bold text-brand-black">
        {value}
      </p>
    </div>
  );
}

interface ContentCardProps {
  eyebrow: string;
  title: string;
  icon: ComponentType<{
    className?: string;
    strokeWidth?: number;
  }>;
  children: ReactNode;
}

function ContentCard({
  eyebrow,
  title,
  icon: Icon,
  children,
}: ContentCardProps) {
  return (
    <section className="rounded-2xl border border-line-trace bg-canvas-pure p-6 sm:p-8">
      <div className="flex items-center gap-3 text-brand-emerald">
        <Icon
          className="size-4"
          strokeWidth={2}
        />

        <p className="text-[11px] font-bold uppercase tracking-tight">
          {eyebrow}
        </p>
      </div>

      <h2 className="mt-4 font-display text-3xl font-medium tracking-[-0.04em] text-brand-black sm:text-4xl">
        {title}
      </h2>

      <div className="mt-7">
        {children}
      </div>
    </section>
  );
}

interface SpecificationProps {
  label: string;
  value: string;
}

function Specification({
  label,
  value,
}: SpecificationProps) {
  return (
    <div className="rounded-xl bg-canvas-warm p-5">
      <p className="text-[10px] uppercase tracking-wide text-muted-moss">
        {label}
      </p>

      <p className="mt-2 text-sm font-bold leading-6 text-brand-black">
        {value}
      </p>
    </div>
  );
}

interface InfoStripProps {
  icon: ComponentType<{
    className?: string;
    strokeWidth?: number;
  }>;
  label: string;
  value: string;
}

function InfoStrip({
  icon: Icon,
  label,
  value,
}: InfoStripProps) {
  return (
    <div className="flex gap-4 rounded-xl border border-line-trace p-5">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-lime/45 text-brand-forest">
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

function formatIdr(
  value: number,
): string {
  return `IDR ${new Intl.NumberFormat(
    "id-ID",
    {
      maximumFractionDigits: 0,
    },
  ).format(value)}`;
}

function formatWeight(
  value: number,
): string {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(
  value: string | null,
): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (
    Number.isNaN(date.getTime())
  ) {
    return "-";
  }

  return new Intl.DateTimeFormat(
    "id-ID",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  ).format(date);
}

function formatStatus(
  status: string,
): string {
  switch (status) {
    case "active":
      return "Aktif";

    case "inactive":
      return "Tidak Aktif";

    case "sold_out":
      return "Habis";

    default:
      return status;
  }
}