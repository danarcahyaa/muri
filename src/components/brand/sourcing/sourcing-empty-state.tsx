"use client";

import { type ReactElement } from "react";
import { SearchX } from "lucide-react";

interface SourcingEmptyStateProps {
  hasActiveFilters: boolean;
  onResetFilters: () => void;
}

export function SourcingEmptyState({
  hasActiveFilters,
  onResetFilters,
}: SourcingEmptyStateProps): ReactElement {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-canvas-pure border border-line-trace rounded-md space-y-3 font-body">
      <div className="size-12 rounded-full bg-canvas-warm flex items-center justify-center text-muted-moss">
        <SearchX className="size-6" />
      </div>
      <div className="max-w-md space-y-1">
        <h3 className="font-display font-bold text-base text-brand-black">
          Material Tidak Ditemukan
        </h3>
        <p className="text-xs text-muted-moss leading-relaxed">
          Tidak ada limbah kain yang cocok dengan kata kunci atau kriteria filter Anda. Coba atur ulang filter pencarian.
        </p>
      </div>
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onResetFilters}
          className="mt-2 text-xs font-bold text-brand-forest hover:underline cursor-pointer"
        >
          Reset Filter & Pencarian
        </button>
      )}
    </div>
  );
}
