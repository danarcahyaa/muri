"use client";

import { type ReactElement } from "react";
import { Badge } from "@/components/ui/Badge";
import { X } from "lucide-react";
import { formatCurrencyIDR, formatWeightKg } from "@/lib/formatter";
import type { SourcingFilterInput } from "@/types/sourcing";

interface SourcingActiveFiltersProps {
  filters: SourcingFilterInput;
  setFilters: React.Dispatch<React.SetStateAction<SourcingFilterInput>>;
  setLocalSearch: (q: string) => void;
  onClearAll: () => void;
}

export function SourcingActiveFilters({
  filters,
  setFilters,
  setLocalSearch,
  onClearAll,
}: SourcingActiveFiltersProps): ReactElement {
  const activeCategoryFilters = filters.categoryNames || [];

  const handleRemoveCategoryFilter = (catName: string) => {
    setFilters((prev) => ({
      ...prev,
      categoryNames: (prev.categoryNames || []).filter((c) => c !== catName),
    }));
  };

  return (
    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-body">
      <span className="text-[11px] text-muted-moss font-semibold uppercase tracking-wider">
        Filter Aktif:
      </span>

      {filters.searchQuery && (
        <Badge variant="secondary" className="gap-1 font-medium bg-canvas-pure border border-line-trace">
          <span>Kata Kunci: "{filters.searchQuery}"</span>
          <button
            type="button"
            onClick={() => {
              setLocalSearch("");
              setFilters((prev) => ({ ...prev, searchQuery: "" }));
            }}
            className="hover:text-error-rust cursor-pointer"
          >
            <X className="size-3" />
          </button>
        </Badge>
      )}

      {filters.minPrice !== undefined && (
        <Badge variant="secondary" className="gap-1 font-medium bg-canvas-pure border border-line-trace">
          <span>&gt; {formatCurrencyIDR(filters.minPrice)}</span>
          <button
            type="button"
            onClick={() =>
              setFilters((prev) => ({ ...prev, minPrice: undefined }))
            }
            className="hover:text-error-rust cursor-pointer"
          >
            <X className="size-3" />
          </button>
        </Badge>
      )}

      {filters.maxPrice !== undefined && (
        <Badge variant="secondary" className="gap-1 font-medium bg-canvas-pure border border-line-trace">
          <span>&lt; {formatCurrencyIDR(filters.maxPrice)}</span>
          <button
            type="button"
            onClick={() =>
              setFilters((prev) => ({ ...prev, maxPrice: undefined }))
            }
            className="hover:text-error-rust cursor-pointer"
          >
            <X className="size-3" />
          </button>
        </Badge>
      )}

      {filters.minOrderKg !== undefined && (
        <Badge variant="secondary" className="gap-1 font-medium bg-canvas-pure border border-line-trace">
          <span>Maks Min. Beli: {formatWeightKg(filters.minOrderKg)}</span>
          <button
            type="button"
            onClick={() =>
              setFilters((prev) => ({ ...prev, minOrderKg: undefined }))
            }
            className="hover:text-error-rust cursor-pointer"
          >
            <X className="size-3" />
          </button>
        </Badge>
      )}

      {activeCategoryFilters.map((cat) => (
        <Badge
          key={cat}
          variant="secondary"
          className="gap-1 font-medium bg-canvas-pure border border-line-trace"
        >
          <span>{cat}</span>
          <button
            type="button"
            onClick={() => handleRemoveCategoryFilter(cat)}
            className="hover:text-error-rust cursor-pointer"
          >
            <X className="size-3" />
          </button>
        </Badge>
      ))}

      <button
        type="button"
        onClick={onClearAll}
        className="text-xs text-brand-forest hover:underline font-semibold ml-1 cursor-pointer"
      >
        Hapus Semua
      </button>
    </div>
  );
}
