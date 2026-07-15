"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  Leaf,
  Search,
} from "lucide-react";

import {
  circularProducts,
  type CircularProduct,
} from "@/data/products";

type SortOption =
  | "default"
  | "price-low"
  | "price-high"
  | "name-az";

const productBrands = [
  "Semua",
  ...Array.from(
    new Set(
      circularProducts.map((product) => product.brand),
    ),
  ),
];

export default function ProductCatalogSection() {
  const [query, setQuery] = React.useState("");
  const [brand, setBrand] = React.useState("Semua");
  const [sort, setSort] =
    React.useState<SortOption>("default");

  const filteredProducts = React.useMemo(() => {
    const normalizedQuery = query
      .trim()
      .toLowerCase();

    const result = circularProducts.filter(
      (product) => {
        const searchableContent = [
          product.name,
          product.brand,
          product.badge,
          product.description,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchesSearch =
          !normalizedQuery ||
          searchableContent.includes(normalizedQuery);

        const matchesBrand =
          brand === "Semua" ||
          product.brand === brand;

        return matchesSearch && matchesBrand;
      },
    );

    return [...result].sort((first, second) => {
      if (sort === "price-low") {
        return first.price - second.price;
      }

      if (sort === "price-high") {
        return second.price - first.price;
      }

      if (sort === "name-az") {
        return first.name.localeCompare(
          second.name,
          "id",
        );
      }

      return 0;
    });
  }, [brand, query, sort]);

  function resetFilters() {
    setQuery("");
    setBrand("Semua");
    setSort("default");
  }

  return (
    <section
      id="katalog-produk"
      className="bg-canvas-pure"
    >
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
            <span className="sr-only">
              Cari produk
            </span>

            <input
              type="search"
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Cari nama produk atau brand"
              className="
                h-12 w-full rounded-sm
                border border-line-trace
                bg-transparent px-5 pr-12
                font-body text-xs text-brand-black
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

          {/* Brand filters */}
          <div
            className="
              flex overflow-x-auto rounded-sm
              border border-line-trace p-1
            "
            aria-label="Filter brand produk"
          >
            {productBrands.map((item) => {
              const isActive = brand === item;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setBrand(item)}
                  className={`
                    shrink-0 rounded-sm
                    px-4 py-2.5
                    text-[11px] font-semibold
                    transition-colors
                    ${
                      isActive
                        ? `
                          bg-brand-forest
                          text-canvas-pure
                        `
                        : `
                          text-brand-black
                          hover:bg-canvas-warm
                        `
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
            <span className="sr-only">
              Urutkan produk
            </span>

            <select
              value={sort}
              onChange={(event) =>
                setSort(
                  event.target.value as SortOption,
                )
              }
              className="
                h-12 w-full min-w-48
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
              <option value="default">
                Urutkan produk
              </option>

              <option value="price-low">
                Harga terendah
              </option>

              <option value="price-high">
                Harga tertinggi
              </option>

              <option value="name-az">
                Nama A–Z
              </option>
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
        {/* Header */}
        <div className="flex items-end justify-between gap-8">
          <div className="flex items-center gap-3 text-brand-emerald">
            <Leaf
              className="size-4"
              strokeWidth={2}
            />

            <span className="text-sm font-bold uppercase tracking-tight">
              Jelajahi Produk Sirkular
            </span>
          </div>

          <p className="shrink-0 text-sm text-muted-moss">
            {filteredProducts.length} dari{" "}
            {circularProducts.length} Produk
          </p>
        </div>

        {/* Results */}
        {filteredProducts.length > 0 ? (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.slug}
                product={product}
              />
            ))}
          </div>
        ) : (
          <EmptyProductState
            onReset={resetFilters}
          />
        )}
      </div>
    </section>
  );
}

interface ProductCardProps {
  product: CircularProduct;
}

function ProductCard({
  product,
}: ProductCardProps) {
  const productHref = `/produk/${product.slug}`;

  return (
    <article
      className="
        group flex flex-col overflow-hidden
        rounded-2xl border border-line-trace
        bg-canvas-pure p-4
        transition duration-300

        hover:-translate-y-1
        hover:border-brand-emerald
        hover:shadow-2xl
        hover:shadow-brand-black/5

        sm:p-6
      "
    >
      {/* Image */}
      <Link
        href={productHref}
        className="
          relative block aspect-[16/9]
          overflow-hidden rounded-lg
          bg-canvas-warm
        "
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="
            (max-width: 768px) 100vw,
            (max-width: 1024px) 50vw,
            33vw
          "
          className="
            object-cover transition duration-500
            group-hover:scale-[1.025]
          "
        />
      </Link>

      {/* Brand and badge */}
      <div
        className="
          mt-6 flex items-center justify-between
          gap-4 text-[11px] font-bold
          text-brand-emerald
        "
      >
        <span className="truncate">
          {product.brand}
        </span>

        <span className="shrink-0">
          {product.badge}
        </span>
      </div>

      {/* Product information */}
      <div className="mt-7 flex-1">
        <Link
          href={productHref}
          className="block"
        >
          <h2
            className="
              truncate font-display
              text-2xl font-medium
              leading-tight tracking-[-0.035em]
              text-brand-black
              transition-colors

              group-hover:text-brand-emerald
            "
          >
            {product.name}
          </h2>
        </Link>

        <p className="mt-3 line-clamp-2 min-h-10 text-xs leading-relaxed text-muted-moss">
          {product.description}
        </p>
      </div>

      {/* Footer */}
      <div
        className="
          mt-7 flex items-center
          justify-between gap-5
          border-t border-line-trace pt-5
        "
      >
        <p className="font-display text-2xl font-bold tracking-tight text-brand-black">
          {formatCompactRupiah(product.price)}
        </p>

        <Link
          href={productHref}
          className="
            group/action inline-flex
            items-center gap-3
            text-xs font-bold
            text-brand-emerald
            transition-colors
            hover:text-brand-forest
          "
        >
          <span>Beli Sekarang</span>

          <ArrowRight
            className="
              size-4 transition-transform
              duration-300
              group-hover/action:translate-x-1
            "
          />
        </Link>
      </div>
    </article>
  );
}

interface EmptyProductStateProps {
  onReset: () => void;
}

function EmptyProductState({
  onReset,
}: EmptyProductStateProps) {
  return (
    <div
      className="
        mt-10 flex min-h-72 flex-col
        items-center justify-center
        rounded-2xl border border-dashed
        border-line-trace bg-canvas-warm/30
        px-6 text-center
      "
    >
      <Search
        className="size-10 text-muted-moss/50"
        strokeWidth={1.5}
      />

      <h3 className="mt-5 font-display text-2xl font-medium text-brand-black">
        Produk tidak ditemukan
      </h3>

      <p className="mt-2 max-w-md text-xs leading-relaxed text-muted-moss">
        Coba gunakan kata pencarian atau brand
        yang berbeda.
      </p>

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
    </div>
  );
}

function formatCompactRupiah(value: number) {
  if (value >= 1_000_000) {
    const million = value / 1_000_000;

    return `IDR ${
      Number.isInteger(million)
        ? million
        : million.toFixed(1)
    }M`;
  }

  if (value >= 1_000) {
    return `IDR ${Math.round(value / 1_000)}K`;
  }

  return `IDR ${value}`;
}