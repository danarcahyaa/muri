"use client";

import type { ReactElement } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
    handleOpenAddDialog,
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
