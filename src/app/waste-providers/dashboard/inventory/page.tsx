"use client";

import { useState, useEffect, type ReactElement } from "react";
import { createPortal } from "react-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { AlertTriangle, Leaf, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { WasteSummaryMetrics } from "@/components/waste-providers/waste-inventory/Metrics";
import { WasteTableToolbar } from "@/components/waste-providers/waste-inventory/Toolbar";
import { WasteDataTable } from "@/components/waste-providers/waste-inventory/Table";
import { WasteDialogForm } from "@/components/waste-providers/waste-inventory/DialogForm";
import { useWasteInventory } from "@/hooks/waste-providers/useWasteInventory";
import { useAuth } from "@/components/auth/AuthProvider";

export default function WasteInventoryPage(): ReactElement {
  const { user } = useAuth();
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const {
    filteredPosts,
    categories,
    isLoading,
    error,
    refreshTrigger,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedStatus,
    setSelectedStatus,
    sortBy,
    setSortBy,
    dialogOpen,
    setDialogOpen,
    selectedPost,
    batchWarningOpen,
    setBatchWarningOpen,
    handleOpenAddDialog,
    handleConfirmAddDialog,
    handleViewClick,
    handleArchiveClick,
    handlePermanentDeleteClick,
    handleSubmitPost,
  } = useWasteInventory();

  return (
    <div className="mx-auto w-full max-w-[1320px] px-5 py-10 sm:px-6 lg:px-8 lg:py-14">
      {/* Page header */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-3 text-brand-emerald">
          <Leaf className="size-4" strokeWidth={2} />
          <span className="text-xs font-bold uppercase tracking-tight">
            Dashboard Waste Provider
          </span>
        </div>
        <h1 className="font-display text-5xl font-medium leading-none tracking-[-0.04em] text-brand-black sm:text-6xl">
          Inventaris
        </h1>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-moss">
          Kelola sisa kain perca garmen, atur detail kategori serat kain, serta perbarui status dan berat ketersediaan kain Anda di sini.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6 max-w-xl">
          <AlertTitle>Kesalahan</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        <WasteSummaryMetrics
          providerId={user?.id || ""}
          refreshTrigger={refreshTrigger}
        />

        <WasteTableToolbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onAddClick={handleOpenAddDialog}
        />

        <WasteDataTable
          posts={filteredPosts}
          isLoading={isLoading}
          onViewClick={handleViewClick}
          onArchiveClick={handleArchiveClick}
          onPermanentDeleteClick={handlePermanentDeleteClick}
        />
      </div>

      {/* Modal Warning Jejak Limbah */}
      {mounted &&
        batchWarningOpen &&
        createPortal(
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setBatchWarningOpen(false);
              }
            }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in-0 cursor-pointer"
          >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex w-full max-w-md flex-col overflow-hidden rounded-xl border border-line-trace bg-canvas-pure cursor-default shadow-xl"
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-line-trace px-6 py-5 sm:px-8">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
                  <AlertTriangle className="size-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-brand-black">
                    Perhatian: Jejak Limbah Permanen
                  </h3>
                  <p className="text-xs text-muted-moss">
                    Informasi penting sebelum menambah limbah
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setBatchWarningOpen(false)}
                aria-label="Tutup modal"
                className="flex size-8 items-center justify-center rounded-full bg-canvas-warm text-brand-black transition hover:bg-line-trace cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 sm:p-8 space-y-4">
              <p className="text-xs leading-relaxed text-brand-black/80">
                Limbah yang Anda tambahkan akan secara otomatis membuat{" "}
                <strong className="text-brand-black">jejak limbah</strong> yang digunakan oleh pihak
                brand untuk melacak asal-usul bahan baku mereka. Jejak limbah ini bersifat{" "}
                <strong className="text-brand-black">permanen dan tidak dapat diubah maupun dihapus</strong>{" "}
                setelah limbah berhasil ditambahkan. Pastikan informasi yang Anda masukkan sudah benar sebelum melanjutkan.
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-line-trace bg-canvas-warm/55 px-6 py-5 sm:px-8">
              <Button
                id="batch-warning-cancel"
                size="md"
                variant="outline"
                type="button"
                onClick={() => setBatchWarningOpen(false)}
              >
                Batal
              </Button>
              <Button
                id="batch-warning-confirm"
                size="md"
                variant="default"
                type="button"
                onClick={handleConfirmAddDialog}
              >
                Mengerti, Lanjutkan
              </Button>
            </div>
          </div>
        </div>,
        document.body,
      )}

      <WasteDialogForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        post={selectedPost}
        categories={categories}
        onSubmit={handleSubmitPost}
      />
    </div>
  );
}
