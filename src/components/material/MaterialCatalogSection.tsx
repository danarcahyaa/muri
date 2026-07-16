"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  ImageOff,
  Leaf,
  MapPin,
  Search,
  UserRound,
} from "lucide-react";

import type { MaterialCatalogItem } from "@/types/material";
import RichTextContent from "../ui/RichTextContent";

type SortOption = "default" | "price-low" | "price-high";

interface MaterialCatalogSectionProps {
  materials: MaterialCatalogItem[];
  hasLoadError?: boolean;
}

export default function MaterialCatalogSection({
  materials,
  hasLoadError = false,
}: MaterialCatalogSectionProps) {
  const [query, setQuery] = React.useState("");

  const [location, setLocation] = React.useState("Semua");

  const [sort, setSort] = React.useState<SortOption>("default");

  /**
   * Kota dibuat dinamis berdasarkan batch
   * yang dikembalikan Supabase.
   */
  const locations = React.useMemo(() => {
    const uniqueLocations = Array.from(
      new Set(
        materials.map((material) => material.originCity.trim()).filter(Boolean),
      ),
    ).sort((first, second) => first.localeCompare(second, "id"));

    return ["Semua", ...uniqueLocations];
  }, [materials]);

  const filteredMaterials = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const result = materials.filter((material) => {
      const matchesSearch =
        !normalizedQuery ||
        material.title.toLowerCase().includes(normalizedQuery) ||
        material.categoryName.toLowerCase().includes(normalizedQuery) ||
        material.providerName.toLowerCase().includes(normalizedQuery) ||
        material.batchCode.toLowerCase().includes(normalizedQuery) ||
        material.originCity.toLowerCase().includes(normalizedQuery);

      const matchesLocation =
        location === "Semua" || material.originCity === location;

      return matchesSearch && matchesLocation;
    });

    return [...result].sort((first, second) => {
      if (sort === "price-low") {
        return first.pricePerKg - second.pricePerKg;
      }

      if (sort === "price-high") {
        return second.pricePerKg - first.pricePerKg;
      }

      return 0;
    });
  }, [location, materials, query, sort]);

  function resetFilters() {
    setQuery("");
    setLocation("Semua");
    setSort("default");
  }

  return (
    <section id="katalog-material" className="bg-canvas-pure">
      {/* Filter toolbar */}
      <div className="border-b border-line-trace">
        <div
          className="
            mx-auto grid
            w-[min(1320px,calc(100%_-_48px))]
            gap-4 py-8
            lg:grid-cols-[minmax(0,1fr)_auto_auto]
            lg:items-center
          "
        >
          {/* Search */}
          <label className="relative block">
            <span className="sr-only">Cari material</span>

            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari material kain"
              className="
                h-12 w-full rounded-sm
                border border-line-trace
                bg-transparent px-5 pr-12
                font-body text-xs
                text-brand-black
                outline-none transition
                placeholder:text-muted-moss/65
                focus:border-brand-emerald
                focus:ring-2
                focus:ring-brand-emerald/10
              "
            />

            <Search
              aria-hidden="true"
              className="
                pointer-events-none absolute
                right-4 top-1/2 size-4
                -translate-y-1/2
                text-muted-moss
              "
              strokeWidth={1.8}
            />
          </label>

          {/* Location filters */}
          <div
            className="
              flex overflow-x-auto rounded-sm
              border border-line-trace p-1
            "
            aria-label="Filter lokasi material"
          >
            {locations.map((item) => {
              const isActive = location === item;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setLocation(item)}
                  className={`
                    shrink-0 rounded-sm
                    px-4 py-2.5
                    text-[11px] font-semibold
                    transition-colors
                    ${
                      isActive
                        ? "bg-brand-forest text-canvas-pure"
                        : "text-brand-black hover:bg-canvas-warm"
                    }
                  `}
                >
                  {item}
                </button>
              );
            })}
          </div>

          {/* Sort */}
          <label className="relative block">
            <span className="sr-only">Urutkan material</span>

            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortOption)}
              className="
                h-12 w-full min-w-44
                appearance-none rounded-sm
                border border-line-trace
                bg-canvas-pure px-5 pr-11
                text-xs font-medium
                text-brand-black
                outline-none transition
                focus:border-brand-emerald
                focus:ring-2
                focus:ring-brand-emerald/10
              "
            >
              <option value="default">Urutkan harga</option>

              <option value="price-low">Harga terendah</option>

              <option value="price-high">Harga tertinggi</option>
            </select>

            <ChevronDown
              aria-hidden="true"
              className="
                pointer-events-none absolute
                right-4 top-1/2 size-4
                -translate-y-1/2
                text-muted-moss
              "
              strokeWidth={1.8}
            />
          </label>
        </div>
      </div>

      {/* Catalog */}
      <div
        className="
          mx-auto
          w-[min(1320px,calc(100%_-_48px))]
          py-[clamp(80px,9vw,130px)]
        "
      >
        {/* Heading */}
        <div
          className="
            grid gap-10
            lg:grid-cols-[1.35fr_0.85fr]
            lg:items-end lg:gap-20
          "
        >
          <div>
            <div className="mb-5 flex items-center gap-3 text-brand-emerald">
              <Leaf className="size-4" strokeWidth={2} />

              <span className="text-sm font-bold uppercase tracking-tight">
                Pilihan Material
              </span>
            </div>

            <h2
              className="
                max-w-3xl font-display
                text-[clamp(3.5rem,6vw,5.8rem)]
                font-normal leading-[0.94]
                tracking-[-0.06em]
                text-brand-black
              "
            >
              Gunakan Kembali Kain Sisa.
            </h2>
          </div>

          <p className="max-w-lg text-sm leading-relaxed text-muted-moss 2xl:text-base">
            Kain sisa gulungan atau deadstock berkualitas premium, siap
            diproduksi ulang tanpa mengorbankan estetika desain Anda.
          </p>
        </div>

        {filteredMaterials.length > 0 ? (
          <div className="mt-16 grid gap-6 lg:grid-cols-2">
            {filteredMaterials.map((material) => (
              <MaterialCard key={material.batchId} material={material} />
            ))}
          </div>
        ) : (
          <EmptyMaterialState
            hasLoadError={hasLoadError}
            hasActiveFilters={
              query.length > 0 || location !== "Semua" || sort !== "default"
            }
            onReset={resetFilters}
          />
        )}
      </div>
    </section>
  );
}

interface MaterialCardProps {
  material: MaterialCatalogItem;
}

function MaterialCard({ material }: MaterialCardProps) {
  const materialHref = `/material/${encodeURIComponent(material.batchCode)}`;

  return (
    <article
      className="
        group overflow-hidden rounded-2xl
        border border-line-trace
        bg-canvas-pure p-4
        transition duration-300
        hover:-translate-y-1
        hover:border-brand-emerald
        hover:shadow-2xl
        hover:shadow-brand-black/5
        sm:p-7
      "
    >
      {/* Image */}
      <Link
        href={materialHref}
        className="
          relative block aspect-[16/7.5]
          overflow-hidden rounded-lg
          bg-canvas-warm
        "
      >
        {material.imageUrl ? (
          <>
            {/* Supabase Storage URL dapat langsung ditampilkan
                tanpa konfigurasi remotePatterns Next Image. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={material.imageUrl}
              alt={material.title}
              loading="lazy"
              className="
                h-full w-full object-cover
                transition duration-500
                group-hover:scale-[1.025]
              "
            />
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-muted-moss/50">
            <ImageOff className="size-9" strokeWidth={1.4} />

            <span className="text-[10px] font-medium">Foto belum tersedia</span>
          </div>
        )}
      </Link>

      {/* Metadata */}
      <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] font-bold text-brand-emerald">
        <MaterialMeta icon={UserRound} value={material.providerName} />

        <span aria-hidden="true" className="text-muted-moss/40">
          ·
        </span>

        <MaterialMeta icon={MapPin} value={material.originCity} />
      </div>

      {/* Content */}
      <div className="mt-5">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-moss">
          {material.categoryName}
        </p>

        <Link href={materialHref} className="block">
          <h3
            className="
              font-display text-3xl
              font-medium leading-tight
              tracking-[-0.035em]
              text-brand-black
              transition-colors
              group-hover:text-brand-emerald
            "
          >
            {material.title}
          </h3>
        </Link>

        <RichTextContent
          html={material.description}
          mode="plain"
          className="mt-3 line-clamp-3 text-xs leading-relaxed text-muted-moss"
        />
      </div>

      {/* Statistics */}
      <div className="mt-7 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <MaterialStat
          label="Tersedia"
          value={`${formatWeight(material.availableWeightKg)} kg`}
        />

        <MaterialStat
          label="Harga"
          value={`${formatRupiah(material.pricePerKg)}/kg`}
        />

        <MaterialStat label="ID Batch" value={material.batchCode} />
      </div>

      {/* Action */}
      <div className="mt-7">
        <Link
          href={materialHref}
          className="
            group/action inline-flex
            items-center justify-center
            gap-3 rounded-sm
            bg-brand-forest px-6 py-4
            text-xs font-bold
            text-canvas-pure
            transition duration-300
            hover:-translate-y-0.5
            hover:bg-brand-black
          "
        >
          Detail &amp; Ajukan Penawaran
          <ArrowRight
            className="
              size-4 transition-transform
              group-hover/action:translate-x-1
            "
          />
        </Link>
      </div>
    </article>
  );
}

interface MaterialMetaProps {
  icon: React.ComponentType<{
    className?: string;
    strokeWidth?: number;
  }>;
  value: string;
}

function MaterialMeta({ icon: Icon, value }: MaterialMetaProps) {
  return (
    <span className="inline-flex items-center gap-2">
      <Icon className="size-3.5" strokeWidth={2} />

      <span>{value}</span>
    </span>
  );
}

interface MaterialStatProps {
  label: string;
  value: string;
}

function MaterialStat({ label, value }: MaterialStatProps) {
  return (
    <div className="rounded-lg bg-canvas-warm px-4 py-3">
      <p className="text-[10px] text-muted-moss">{label}</p>

      <p className="mt-1 truncate text-xs font-bold text-brand-black">
        {value}
      </p>
    </div>
  );
}

interface EmptyMaterialStateProps {
  hasLoadError: boolean;
  hasActiveFilters: boolean;
  onReset: () => void;
}

function EmptyMaterialState({
  hasLoadError,
  hasActiveFilters,
  onReset,
}: EmptyMaterialStateProps) {
  const title = hasLoadError
    ? "Katalog gagal dimuat"
    : "Material tidak ditemukan";

  const description = hasLoadError
    ? "Data material belum dapat diambil. Silakan muat ulang halaman."
    : hasActiveFilters
      ? "Coba gunakan kata pencarian atau lokasi yang berbeda."
      : "Belum ada batch material aktif yang tersedia.";

  return (
    <div
      className="
        mt-16 flex min-h-72
        flex-col items-center
        justify-center rounded-2xl
        border border-dashed
        border-line-trace
        bg-canvas-warm/30
        px-6 text-center
      "
    >
      <Search className="size-10 text-muted-moss/50" strokeWidth={1.5} />

      <h3 className="mt-5 font-display text-2xl font-medium text-brand-black">
        {title}
      </h3>

      <p className="mt-2 max-w-md text-xs leading-relaxed text-muted-moss">
        {description}
      </p>

      {!hasLoadError && hasActiveFilters && (
        <button
          type="button"
          onClick={onReset}
          className="
            mt-6 text-xs font-bold
            text-brand-emerald
            transition-colors
            hover:text-brand-forest
          "
        >
          Reset pencarian
        </button>
      )}
    </div>
  );
}

function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatWeight(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2,
  }).format(value);
}
