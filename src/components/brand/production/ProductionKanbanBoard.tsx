"use client";

import type { ReactElement } from "react";
import { CheckCircle2, Clock, Factory } from "lucide-react";

import { ProductionCard } from "./ProductionCard";
import type { BrandProductionItem } from "@/services/brand-fashion/circularProductionService";

interface ProductionKanbanBoardProps {
  onProgressItems: BrandProductionItem[];
  finishedItems: BrandProductionItem[];
  isLoading: boolean;
  onOpenDetail: (item: BrandProductionItem) => void;
  onFinishProduction: (item: BrandProductionItem) => void;
  onCancelProduction?: (item: BrandProductionItem) => void;
  onHideProduction?: (item: BrandProductionItem) => void;
}

export function ProductionKanbanBoard({
  onProgressItems,
  finishedItems,
  isLoading,
  onOpenDetail,
  onFinishProduction,
  onCancelProduction,
  onHideProduction,
}: ProductionKanbanBoardProps): ReactElement {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Kolom 1: On Progress */}
      <div className="flex flex-col rounded-2xl border border-brand-black/15 bg-canvas-warm/30 p-5 sm:p-6 min-h-[450px]">
        {/* Column Header */}
        <div className="flex items-center justify-between border-b border-brand-black/15 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
              <Clock className="size-4" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-brand-black">
                On Progress
              </h3>
              <p className="text-[11px] text-muted-moss">
                Proses produksi baju sedang berlangsung
              </p>
            </div>
          </div>

          <span className="inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-3 py-0.5 text-xs font-bold text-amber-800">
            {onProgressItems.length} Produksi
          </span>
        </div>

        {/* Column Content */}
        <div className="mt-4 flex-1 space-y-4">
          {isLoading ? (
            <KanbanColumnSkeleton />
          ) : onProgressItems.length === 0 ? (
            <EmptyKanbanColumn
              title="Belum Ada Produksi"
              description="Ayo mulai mulai mengalokasikan stok limbah kainmu untuk mulai produksi."
            />
          ) : (
            onProgressItems.map((item) => (
              <ProductionCard
                key={item.id}
                item={item}
                onOpenDetail={onOpenDetail}
                onFinish={onFinishProduction}
                onCancel={onCancelProduction}
              />
            ))
          )}
        </div>
      </div>

      {/* Kolom 2: Finished */}
      <div className="flex flex-col rounded-2xl border border-brand-black/15 bg-canvas-warm/30 p-5 sm:p-6 min-h-[450px]">
        {/* Column Header */}
        <div className="flex items-center justify-between border-b border-brand-black/15 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-brand-lime/50 text-brand-forest">
              <CheckCircle2 className="size-4" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-brand-black">
                Selesai
              </h3>
              <p className="text-[11px] text-muted-moss">
                Daftar produksi baju yang telah rampung
              </p>
            </div>
          </div>

          <span className="inline-flex items-center rounded-full bg-brand-forest/10 border border-brand-forest/20 px-3 py-0.5 text-xs font-bold text-brand-forest">
            {finishedItems.length} Selesai
          </span>
        </div>

        {/* Column Content */}
        <div className="mt-4 flex-1 space-y-4">
          {isLoading ? (
            <KanbanColumnSkeleton />
          ) : finishedItems.length === 0 ? (
            <EmptyKanbanColumn
              title="Belum Ada Produksi Selesai"
              description="Produksi yang telah rampung diproses di kolom On Progress akan ditampilkan di sini."
            />
          ) : (
            finishedItems.map((item) => (
              <ProductionCard
                key={item.id}
                item={item}
                onOpenDetail={onOpenDetail}
                onHide={onHideProduction}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function KanbanColumnSkeleton(): ReactElement {
  return (
    <div className="space-y-4">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="h-44 w-full animate-pulse rounded-xl border border-brand-black/10 bg-canvas-pure p-5"
        >
          <div className="h-5 w-2/3 rounded bg-canvas-warm" />
          <div className="mt-3 h-4 w-1/3 rounded bg-canvas-warm/70" />
          <div className="mt-6 h-8 w-full rounded bg-canvas-warm/50" />
        </div>
      ))}
    </div>
  );
}

function EmptyKanbanColumn({
  title,
  description,
}: {
  title: string;
  description: string;
}): ReactElement {
  return (
    <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-brand-black/20 bg-canvas-pure p-8 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-canvas-warm text-muted-moss">
        <Factory className="size-6 text-brand-emerald" />
      </div>
      <h4 className="mt-3 font-display text-sm font-bold text-brand-black">
        {title}
      </h4>
      <p className="mt-1 max-w-xs text-xs text-muted-moss leading-relaxed">
        {description}
      </p>
    </div>
  );
}
