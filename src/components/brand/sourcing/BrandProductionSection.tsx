"use client";

import type { ReactElement } from "react";
import {
  Factory,
  Plus,
  RefreshCw,
  Scale,
  Scissors,
  Search,
  Shirt,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCircularProduction } from "@/hooks/brand/useCircularProduction";
import { ProductionKanbanBoard } from "@/components/brand/production/ProductionKanbanBoard";
import { CreateProductionModal } from "@/components/brand/production/CreateProductionModal";
import { ProductionDetailModal } from "@/components/brand/production/ProductionDetailModal";
import { formatWeightKg } from "@/lib/formatter";

import { CancelProductionDialog } from "@/components/brand/production/CancelProductionDialog";

import { FinishProductionDialog } from "@/components/brand/production/FinishProductionDialog";

import { HiddenProductionsCollapsible } from "@/components/brand/production/HiddenProductionsCollapsible";
import { Skeleton } from "@/components/ui/Skeleton";

export default function BrandProductionSection(): ReactElement {
  const {
    onProgressItems,
    finishedItems,
    hiddenItems,
    availableWasteList,
    isLoading,
    isSubmitting,
    searchQuery,
    setSearchQuery,
    refetch,

    isCreateModalOpen,
    handleOpenCreateModal,
    handleCloseCreateModal,
    handleCreateProduction,

    selectedDetailItem,
    handleOpenDetailModal,
    handleCloseDetailModal,

    cancelTargetItem,
    handleOpenCancelModal,
    handleCloseCancelModal,
    handleConfirmCancelProduction,

    finishTargetItem,
    handleOpenFinishModal,
    handleCloseFinishModal,
    handleConfirmFinishProduction,

    handleHideProduction,
    handleUnhideProduction,
  } = useCircularProduction();

  const totalProductionsCount =
    onProgressItems.length + finishedItems.length + hiddenItems.length;

  const totalWasteUsedKg = [
    ...onProgressItems,
    ...finishedItems,
    ...hiddenItems,
  ].reduce((sum, item) => sum + (item.totalWeightKg || 0), 0);

  return (
    <section className="mt-8 font-body space-y-8">
      {/* Metrics Header Summary Cards */}
      <section className="overflow-hidden rounded-2xl border border-brand-black/15 bg-canvas-pure">
        <div className="grid divide-y divide-line-trace sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {/* Metric 1 */}
          <article className="flex flex-col p-6 sm:p-7">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-moss">
                Total Limbah Terpakai
              </p>
              <div className="flex size-9 items-center justify-center rounded-lg bg-brand-lime text-brand-forest">
                <Scale className="size-4" strokeWidth={1.8} />
              </div>
            </div>
            <div className="mt-6">
              {isLoading ? (
                <Skeleton className="h-9 w-32 rounded-md bg-canvas-warm" />
              ) : (
                <p className="font-display text-3xl font-medium tracking-tight text-brand-black">
                  {formatWeightKg(totalWasteUsedKg)}
                </p>
              )}
              <p className="mt-2 text-xs text-muted-moss">
                Total limbah kain dialokasikan ke produksi
              </p>
            </div>
          </article>

          {/* Metric 2 */}
          <article className="flex flex-col p-6 sm:p-7">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-moss">
                Produksi
              </p>
              <div className="flex size-9 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
                <Scissors className="size-4" strokeWidth={1.8} />
              </div>
            </div>
            <div className="mt-6">
              {isLoading ? (
                <Skeleton className="h-9 w-20 rounded-md bg-canvas-warm" />
              ) : (
                <p className="font-display text-3xl font-medium tracking-tight text-brand-black">
                  {onProgressItems.length}
                </p>
              )}
              <p className="mt-2 text-xs text-muted-moss">
                Pakaian sirkular sedang diproses
              </p>
            </div>
          </article>

          {/* Metric 3 */}
          <article className="flex flex-col p-6 sm:p-7">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-moss">
                Selesai
              </p>
              <div className="flex size-9 items-center justify-center rounded-lg bg-brand-lime text-brand-forest">
                <Shirt className="size-4" strokeWidth={1.8} />
              </div>
            </div>
            <div className="mt-6">
              {isLoading ? (
                <Skeleton className="h-9 w-20 rounded-md bg-canvas-warm" />
              ) : (
                <p className="font-display text-3xl font-medium tracking-tight text-brand-black">
                  {finishedItems.length}
                </p>
              )}
              <p className="mt-2 text-xs text-muted-moss">
                Produksi pakaian yang telah rampung
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* Hidden Productions Collapsible Section (Right below metrics) */}
      <HiddenProductionsCollapsible
        hiddenItems={hiddenItems}
        onOpenDetail={handleOpenDetailModal}
        onUnhide={handleUnhideProduction}
      />

      {/* Main Kanban Board Container Card */}
      <div className="rounded-2xl border border-brand-black/15 bg-canvas-pure p-6 sm:p-8 space-y-6">
        {/* Top Action Bar: Title, "+ Buat Produksi Baru", Refresh */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-brand-black/15 pb-6">
          <div>
            <h2 className="font-display text-xl font-bold text-brand-black flex items-center gap-2">
              <Factory className="size-5 text-brand-emerald" />
              <span>Kanban Produksi</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-forest/10 text-brand-forest">
                {onProgressItems.length + finishedItems.length}
              </span>
            </h2>
            <p className="mt-1 text-xs text-muted-moss">
              Lacak status alur produksi baju sirkular secara visual dan alokasikan stok limbah terbeli.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              onClick={() => void refetch()}
              disabled={isLoading}
              variant="outline"
              size="md"
              className="inline-flex items-center justify-center gap-2 rounded-sm border border-brand-black/15 bg-canvas-pure px-3.5 py-2 text-xs font-bold text-brand-black transition hover:border-brand-forest hover:bg-canvas-warm cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Muat Ulang</span>
            </Button>

            {/* "+ Buat Produksi Baru" CTA Button */}
            <Button
              variant="solid-black"
              size="md"
              onClick={() => void handleOpenCreateModal()}
            >
              <Plus className="size-4" strokeWidth={2.5} />
              <span>Buat Produksi Baru</span>
            </Button>
          </div>
        </div>

        {/* Responsive Kanban Board (2 Columns: On Progress & Finished) */}
        <ProductionKanbanBoard
          onProgressItems={onProgressItems}
          finishedItems={finishedItems}
          isLoading={isLoading}
          onOpenDetail={handleOpenDetailModal}
          onFinishProduction={handleOpenFinishModal}
          onCancelProduction={handleOpenCancelModal}
          onHideProduction={handleHideProduction}
        />
      </div>

      {/* Create Production Modal */}
      <CreateProductionModal
        isOpen={isCreateModalOpen}
        isSubmitting={isSubmitting}
        availableWasteList={availableWasteList}
        onClose={handleCloseCreateModal}
        onSubmit={handleCreateProduction}
      />

      {/* Production Detail Modal */}
      <ProductionDetailModal
        item={selectedDetailItem}
        isOpen={Boolean(selectedDetailItem)}
        onClose={handleCloseDetailModal}
      />

      {/* Finish Production Confirmation Dialog */}
      <FinishProductionDialog
        item={finishTargetItem}
        isOpen={Boolean(finishTargetItem)}
        isSubmitting={isSubmitting}
        onClose={handleCloseFinishModal}
        onConfirm={handleConfirmFinishProduction}
      />

      {/* Cancel Production Confirmation Dialog */}
      <CancelProductionDialog
        item={cancelTargetItem}
        isOpen={Boolean(cancelTargetItem)}
        isSubmitting={isSubmitting}
        onClose={handleCloseCancelModal}
        onConfirm={handleConfirmCancelProduction}
      />
    </section>
  );
}
