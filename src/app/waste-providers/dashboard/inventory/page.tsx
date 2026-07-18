"use client";

import type { ReactElement } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { WasteSummaryMetrics } from "@/components/waste-providers/waste-inventory/Metrics";
import { WasteTableToolbar } from "@/components/waste-providers/waste-inventory/Toolbar";
import { WasteDataTable } from "@/components/waste-providers/waste-inventory/Table";
import { WasteDialogForm } from "@/components/waste-providers/waste-inventory/DialogForm";
import { useWasteInventory } from "@/hooks/waste-providers/useWasteInventory";
import { useAuth } from "@/components/auth/AuthProvider";

export default function WasteInventoryPage(): ReactElement {
  const { user } = useAuth();
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
        <h1 className="font-display text-4xl font-bold tracking-tight text-brand-black sm:text-5xl">
          Inventaris
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-moss">
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

      <AlertDialog open={batchWarningOpen} onOpenChange={setBatchWarningOpen}>
        <AlertDialogPortal>
          <AlertDialogOverlay />
          <AlertDialogContent>
            <AlertDialogTitle>Perhatian: Jejak Limbah Permanen</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Limbah yang Anda tambahkan akan secara otomatis membuat{" "}
                  <strong className="text-foreground">jejak limbah </strong> yang digunakan
                  oleh pihak brand untuk melacak asal-usul bahan baku mereka.
                </p>
                <p>
                  Jejak limbah ini bersifat{" "}
                  <strong className="text-foreground">permanen dan tidak dapat diubah maupun dihapus</strong>{" "}
                  setelah limbah berhasil ditambahkan.
                </p>
                <p>Pastikan informasi yang Anda masukkan sudah benar sebelum melanjutkan.</p>
              </div>
            </AlertDialogDescription>
            <div className="flex justify-end gap-3 mt-2">
              <AlertDialogCancel id="batch-warning-cancel">Batal</AlertDialogCancel>
              <AlertDialogAction id="batch-warning-confirm" onClick={handleConfirmAddDialog}>
                Mengerti, Lanjutkan
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialogPortal>
      </AlertDialog>

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
