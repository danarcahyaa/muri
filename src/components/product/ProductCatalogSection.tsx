"use client";

import * as React from "react";
import type { ComponentType } from "react";
import { Leaf, PackageSearch, RefreshCw } from "lucide-react";

import ProductCard from "@/components/product/ProductCard";
import ProductCatalogToolbar, {
  type ProductSortOption,
} from "@/components/product/ProductCatalogToolbar";
import type { ProductCatalogItem } from "@/types/product";

const ALL_FILTER = "Semua";

interface ProductCatalogSectionProps {
  products: ProductCatalogItem[];
  hasLoadError?: boolean;
}

export default function ProductCatalogSection({
  products,
  hasLoadError = false,
}: ProductCatalogSectionProps) {
  const [query, setQuery] = React.useState("");
  const [brand, setBrand] =
    React.useState(ALL_FILTER);
  const [category, setCategory] =
    React.useState(ALL_FILTER);
  const [sort, setSort] =
    React.useState<ProductSortOption>("default");

  const brands = React.useMemo(
    () => [
      ALL_FILTER,
      ...Array.from(
        new Set(
          products.map(
            (product) => product.brandName,
          ),
        ),
      ).sort((first, second) =>
        first.localeCompare(second, "id"),
      ),
    ],
    [products],
  );

  const categories = React.useMemo(
    () => [
      ALL_FILTER,
      ...Array.from(
        new Set(
          products.map(
            (product) => product.categoryName,
          ),
        ),
      ).sort((first, second) =>
        first.localeCompare(second, "id"),
      ),
    ],
    [products],
  );

  const filteredProducts = React.useMemo(() => {
    const normalizedQuery = query
      .trim()
      .toLowerCase();

    const result = products.filter((product) => {
      const searchableContent = [
        product.name,
        product.brandName,
        product.categoryName,
        product.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !normalizedQuery ||
        searchableContent.includes(normalizedQuery);

      const matchesBrand =
        brand === ALL_FILTER ||
        product.brandName === brand;

      const matchesCategory =
        category === ALL_FILTER ||
        product.categoryName === category;

      return (
        matchesSearch &&
        matchesBrand &&
        matchesCategory
      );
    });

    return [...result].sort((first, second) => {
      if (sort === "price-low") {
        return first.priceIdr - second.priceIdr;
      }

      if (sort === "price-high") {
        return second.priceIdr - first.priceIdr;
      }

      if (sort === "name-az") {
        return first.name.localeCompare(
          second.name,
          "id",
        );
      }

      return compareNewest(first, second);
    });
  }, [brand, category, products, query, sort]);

  function resetFilters() {
    setQuery("");
    setBrand(ALL_FILTER);
    setCategory(ALL_FILTER);
    setSort("default");
  }

  return (
    <section
      id="katalog-produk"
      className="bg-canvas-pure"
    >
      <ProductCatalogToolbar
        query={query}
        onQueryChange={setQuery}
        brand={brand}
        brands={brands}
        onBrandChange={setBrand}
        category={category}
        categories={categories}
        onCategoryChange={setCategory}
        sort={sort}
        onSortChange={setSort}
      />

      <div
        className="
          mx-auto
          w-[min(1320px,calc(100%_-_48px))]
          py-[clamp(80px,9vw,130px)]
        "
      >
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div className="flex items-center gap-3 text-brand-emerald">
            <Leaf
              className="size-4"
              strokeWidth={2}
            />

            <span className="text-sm font-bold uppercase tracking-tight">
              Jelajahi Produk Sirkular
            </span>
          </div>

          <p className="text-sm text-muted-moss">
            {filteredProducts.length} dari{" "}
            {products.length} produk
          </p>
        </div>

        {hasLoadError ? (
          <CatalogMessage
            icon={RefreshCw}
            title="Katalog belum dapat dimuat"
            description="Terjadi kendala saat mengambil produk dari database. Silakan muat ulang halaman."
          />
        ) : filteredProducts.length > 0 ? (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <CatalogMessage
            icon={PackageSearch}
            title="Belum ada produk"
            description="Produk publik dari Supabase akan tampil otomatis di bagian ini."
          />
        ) : (
          <CatalogMessage
            icon={PackageSearch}
            title="Produk tidak ditemukan"
            description="Coba gunakan kata pencarian atau filter yang berbeda."
            actionLabel="Reset pencarian"
            onAction={resetFilters}
          />
        )}
      </div>
    </section>
  );
}

interface CatalogMessageProps {
  icon: ComponentType<{
    className?: string;
    strokeWidth?: number;
  }>;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

function CatalogMessage({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: CatalogMessageProps) {
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
      <Icon
        className="size-10 text-muted-moss/50"
        strokeWidth={1.5}
      />

      <h3 className="mt-5 font-display text-2xl font-medium text-brand-black">
        {title}
      </h3>

      <p className="mt-2 max-w-md text-xs leading-relaxed text-muted-moss">
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="
            mt-6 text-xs font-bold
            text-brand-emerald
            transition-colors
            hover:text-brand-forest
          "
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function compareNewest(
  first: ProductCatalogItem,
  second: ProductCatalogItem,
): number {
  const firstDate = first.createdAt
    ? new Date(first.createdAt).getTime()
    : 0;

  const secondDate = second.createdAt
    ? new Date(second.createdAt).getTime()
    : 0;

  return secondDate - firstDate;
}
