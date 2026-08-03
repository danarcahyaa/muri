"use client";

import type { ReactElement } from "react";
import { RefreshCw } from "lucide-react";

import { usePurchasedInventory } from "@/hooks/brand/usePurchasedInventory";
import { PurchasedInventoryMetrics } from "./PurchasedInventoryMetrics";
import { PurchasedMaterialToolbar } from "./PurchasedMaterialToolbar";
import { PurchasedMaterialTable } from "./PurchasedMaterialTable";
import { PurchasedMaterialDetailModal } from "./PurchasedMaterialDetailModal";
import { PurchasedMaterialDeleteDialog } from "./PurchasedMaterialDeleteDialog";

export default function PurchasedInventorySection(): ReactElement {
  const {
    items,
    isLoading,
    error,
    searchInput,
    setSearchInput,
    refetch,
    selectedDetailItem,
    handleOpenDetail,
    handleCloseDetail,
    selectedDeleteItem,
    isDeleting,
    handleOpenDelete,
    handleCloseDelete,
    handleConfirmDelete,
  } = usePurchasedInventory();

  return (
    <section className="mt-8 font-body space-y-6">
      {/* 3 Key Metrics Cards Component */}
      <PurchasedInventoryMetrics items={items} isLoading={isLoading} />

      {/* Main Table Container Card */}
      <div className="rounded-2xl border border-brand-black/15 bg-canvas-pure p-6 sm:p-8">
        {/* Header - Identical to Pembelian (Purchases) section header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-brand-black flex items-center gap-2">
              <span>Daftar Material Limbah Terbeli</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-forest/10 text-brand-forest">
                {items.length} Material
              </span>
            </h2>
            <p className="mt-1 text-xs text-muted-moss">
              Daftar stok kain sirkular terbeli (status Selesai). Lakukan pengolahan stok atau hapus material yang sudah terpakai 0 kg.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-sm border border-brand-black/15 bg-canvas-pure px-4 py-2 text-xs font-bold text-brand-black transition hover:border-brand-forest hover:bg-canvas-warm cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Muat Ulang Data</span>
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-error-rust/30 bg-error-rust/10 p-4 text-xs text-error-rust">
            {error}
          </div>
        )}

        {/* Toolbar - Search input debounced */}
        <PurchasedMaterialToolbar
          searchInput={searchInput}
          onSearchChange={setSearchInput}
        />

        {/* Data Table */}
        <PurchasedMaterialTable
          items={items}
          isLoading={isLoading}
          searchQuery={searchInput}
          onOpenDetail={(item) => void handleOpenDetail(item)}
          onOpenDelete={handleOpenDelete}
        />
      </div>

      {/* Detail Modal (without product history) */}
      <PurchasedMaterialDetailModal
        detail={selectedDetailItem}
        isOpen={Boolean(selectedDetailItem)}
        onClose={handleCloseDetail}
      />

      {/* Soft Delete Dialog */}
      <PurchasedMaterialDeleteDialog
        item={selectedDeleteItem}
        isOpen={Boolean(selectedDeleteItem)}
        isDeleting={isDeleting}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
      />
    </section>
  );
}
