"use client";

import type { ReactElement } from "react";
import { Leaf, Droplets, Layers } from "lucide-react";

import { Skeleton } from "@/components/ui/Skeleton";
import { formatWeightKg } from "@/lib/formatter";
import type { PurchasedInventoryItem } from "@/services/brand-fashion/purchasedInventoryService";

export interface PurchasedInventoryMetricsProps {
  items: PurchasedInventoryItem[];
  isLoading: boolean;
}

/**
 * PurchasedInventoryMetrics renders the 3 key sustainability KPI cards:
 * 1. Emisi CO₂
 * 2. Air yang Dihemat
 * 3. Total Material Limbah
 */
export function PurchasedInventoryMetrics({
  items,
  isLoading,
}: PurchasedInventoryMetricsProps): ReactElement {
  const totalWeightKg = items.reduce((sum, item) => sum + (item.weightBoughtKg || 0), 0);
  const carbonSavedKg = parseFloat((totalWeightKg * 2.5).toFixed(1));
  const waterSavedLiter = Math.round(totalWeightKg * 10);

  return (
    <section className="grid gap-5 grid-cols-1 sm:grid-cols-3">
      {/* 1. Emisi CO₂ */}
      <article className="flex min-h-[180px] flex-col justify-between rounded-2xl border border-brand-black/15 bg-gradient-to-br from-brand-forest to-[#315F35] p-6 text-white">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-medium uppercase tracking-wider text-white/70">
            Emisi CO₂
          </p>
          <div className="flex size-8 items-center justify-center rounded-lg bg-brand-lime/20 text-brand-lime">
            <Leaf className="size-4" />
          </div>
        </div>
        <div className="mt-4">
          <div className="font-display text-4xl font-medium leading-none tracking-tight text-brand-lime sm:text-5xl">
            {isLoading ? (
              <Skeleton className="h-10 w-28 bg-white/20" />
            ) : (
              formatWeightKg(carbonSavedKg)
            )}
          </div>
          <p className="mt-2.5 text-xs text-white/60">
            Estimasi emisi CO₂e yang berhasil dicegah
          </p>
        </div>
      </article>

      {/* 2. Air yang Dihemat */}
      <article className="flex min-h-[180px] flex-col justify-between rounded-2xl border border-brand-black/15 bg-canvas-pure p-6 text-brand-black">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-moss">
            Air yang Dihemat
          </p>
          <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Droplets className="size-4" />
          </div>
        </div>
        <div className="mt-4">
          <div className="font-display text-4xl font-medium leading-none tracking-tight text-brand-black sm:text-5xl">
            {isLoading ? (
              <Skeleton className="h-10 w-28" />
            ) : (
              `${waterSavedLiter.toLocaleString("id-ID")} L`
            )}
          </div>
          <p className="mt-2.5 text-xs text-muted-moss">
            Total volume air bersih yang dihemat
          </p>
        </div>
      </article>

      {/* 3. Total Material Limbah */}
      <article className="flex min-h-[180px] flex-col justify-between rounded-2xl border border-brand-black/15 bg-canvas-pure p-6 text-brand-black">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-moss">
            Total Material Limbah
          </p>
          <div className="flex size-8 items-center justify-center rounded-lg bg-brand-lime/30 text-brand-emerald">
            <Layers className="size-4" />
          </div>
        </div>
        <div className="mt-4">
          <div className="font-display text-4xl font-medium leading-none tracking-tight text-brand-black sm:text-5xl">
            {isLoading ? (
              <Skeleton className="h-10 w-28" />
            ) : (
              formatWeightKg(totalWeightKg)
            )}
          </div>
          <p className="mt-2.5 text-xs text-muted-moss">
            Total kuantitas sisa stok material kain
          </p>
        </div>
      </article>
    </section>
  );
}
