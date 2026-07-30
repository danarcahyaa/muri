"use client";

import type { ReactNode } from "react";
import { ChevronDown, Search } from "lucide-react";

import type { ProductSortOption } from "@/hooks/product/useProductCatalogFilters";

export type { ProductSortOption } from "@/hooks/product/useProductCatalogFilters";

interface ProductCatalogToolbarProps {
  query: string;
  onQueryChange: (value: string) => void;

  brand: string;
  brands: string[];
  onBrandChange: (value: string) => void;

  category: string;
  categories: string[];
  onCategoryChange: (value: string) => void;

  sort: ProductSortOption;
  onSortChange: (value: ProductSortOption) => void;
}

export default function ProductCatalogToolbar({
  query,
  onQueryChange,
  brand,
  brands,
  onBrandChange,
  category,
  categories,
  onCategoryChange,
  sort,
  onSortChange,
}: ProductCatalogToolbarProps) {
  return (
    <div className="border-b border-line-trace">
      <div
        className="
          mx-auto grid
          w-[min(1320px,calc(100%_-_48px))]
          gap-4 py-8
          lg:grid-cols-[minmax(260px,1fr)_auto_auto]
          lg:items-center
        "
      >
        <label className="relative block">
          <span className="sr-only">
            Cari produk
          </span>

          <input
            type="search"
            value={query}
            onChange={(event) =>
              onQueryChange(event.target.value)
            }
            placeholder="Cari produk, brand, kategori, atau SKU"
            className="
              h-12 w-full rounded-sm
              border border-brand-black/15
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

        <div
          className="
            flex max-w-full overflow-x-auto
            rounded-sm border border-brand-black/15 p-1
          "
          aria-label="Filter brand produk"
        >
          {brands.map((item) => {
            const isActive = brand === item;

            return (
              <button
                key={item}
                type="button"
                aria-pressed={isActive}
                onClick={() =>
                  onBrandChange(item)
                }
                className={`
                  shrink-0 rounded-sm px-4 py-2.5
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

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <SelectField
            label="Filter kategori"
            value={category}
            onChange={onCategoryChange}
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </SelectField>

          <SelectField
            label="Urutkan produk"
            value={sort}
            onChange={(value) =>
              onSortChange(
                value as ProductSortOption,
              )
            }
          >
            <option value="default">
              Terbaru
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
          </SelectField>
        </div>
      </div>
    </div>
  );
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}

function SelectField({
  label,
  value,
  onChange,
  children,
}: SelectFieldProps) {
  return (
    <label className="relative block">
      <span className="sr-only">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="
          h-12 w-full min-w-44
          appearance-none rounded-sm
          border border-brand-black/15
          bg-canvas-pure px-5 pr-11
          text-xs font-medium text-brand-black
          outline-none transition
          focus:border-brand-emerald
          focus:ring-2
          focus:ring-brand-emerald/10
        "
      >
        {children}
      </select>

      <ChevronDown
        aria-hidden="true"
        className="
          pointer-events-none absolute
          right-4 top-1/2 size-4
          -translate-y-1/2 text-muted-moss
        "
        strokeWidth={1.8}
      />
    </label>
  );
}
