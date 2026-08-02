"use client";

import type { ReactElement } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface BrandMaterialPurchasesPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export function BrandMaterialPurchasesPagination({
  currentPage,
  totalPages,
  totalItems,
  startIndex,
  itemsPerPage,
  onPageChange,
}: BrandMaterialPurchasesPaginationProps): ReactElement | null {
  if (totalItems === 0) return null;

  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-muted-moss">
        Menampilkan{" "}
        <span className="font-bold text-brand-black">
          {startIndex + 1}-{Math.min(startIndex + itemsPerPage, totalItems)}
        </span>{" "}
        dari <span className="font-bold text-brand-black">{totalItems}</span> pesanan
      </p>

      <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="inline-flex items-center gap-1 rounded-sm border border-brand-black/15 bg-canvas-pure px-3 py-1.5 text-xs font-bold text-brand-black transition hover:border-brand-forest disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <ChevronLeft className="size-3.5" />
          <span>Sebelumnya</span>
        </button>

        <span className="px-2 text-xs font-bold text-brand-black">
          {currentPage} / {totalPages}
        </span>

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="inline-flex items-center gap-1 rounded-sm border border-brand-black/15 bg-canvas-pure px-3 py-1.5 text-xs font-bold text-brand-black transition hover:border-brand-forest disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <span>Berikutnya</span>
          <ChevronRight className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
