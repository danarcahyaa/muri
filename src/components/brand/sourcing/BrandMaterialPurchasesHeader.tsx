"use client";

import type { ReactElement } from "react";
import { RefreshCw } from "lucide-react";

interface BrandMaterialPurchasesHeaderProps {
  totalCount: number;
  onRefresh: () => void;
}

export function BrandMaterialPurchasesHeader({
  totalCount,
  onRefresh,
}: BrandMaterialPurchasesHeaderProps): ReactElement {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="font-display text-xl font-bold text-brand-black flex items-center gap-2">
          <span>Daftar Pesanan Material Limbah</span>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-forest/10 text-brand-forest">
            {totalCount} Pesanan
          </span>
        </h2>
        <p className="mt-1 text-xs text-muted-moss">
          Pantau status pengadaan limbah kain, data penerima, dan riwayat pesanan aktif dari penyuplai.
        </p>
      </div>

      <button
        type="button"
        onClick={onRefresh}
        className="inline-flex items-center justify-center gap-2 rounded-sm border border-brand-black/15 bg-canvas-pure px-4 py-2 text-xs font-bold text-brand-black transition hover:border-brand-forest hover:bg-canvas-warm cursor-pointer"
      >
        <RefreshCw className="size-3.5" />
        <span>Muat Ulang Data</span>
      </button>
    </div>
  );
}
