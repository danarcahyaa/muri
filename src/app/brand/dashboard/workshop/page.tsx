"use client";

import { useState, type ReactElement } from "react";
import { useBrandWorkshops } from "@/hooks/brand/useBrandWorkshops";
import { WorkshopToolbar } from "@/components/brand/workshop/WorkshopToolbar";
import { WorkshopTable } from "@/components/brand/workshop/WorkshopTable";
import { WorkshopDetailDialog } from "@/components/brand/workshop/WorkshopDetailDialog";
import { WorkshopCreateDialog } from "@/components/brand/workshop/WorkshopCreateDialog";
import { WorkshopDeleteDialog } from "@/components/brand/workshop/WorkshopDeleteDialog";
import type { BrandWorkshopItem } from "@/types/brandWorkshop";

export default function BrandWorkshopPage(): ReactElement {
  const {
    workshops,
    isLoading,
    error,
    localSearch,
    setLocalSearch,
    statusFilter,
    setStatusFilter,
    handleSearchExecute,
    refresh,
  } = useBrandWorkshops();

  const [selectedWorkshop, setSelectedWorkshop] =
    useState<BrandWorkshopItem | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState<boolean>(false);
  const [createDialogOpen, setCreateDialogOpen] = useState<boolean>(false);

  const [workshopToDelete, setWorkshopToDelete] =
    useState<BrandWorkshopItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);

  const handleViewDetail = (workshop: BrandWorkshopItem) => {
    setSelectedWorkshop(workshop);
    setDetailDialogOpen(true);
  };

  const handleDeleteClick = (workshop: BrandWorkshopItem) => {
    setWorkshopToDelete(workshop);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="mx-auto w-full max-w-[1320px] px-5 py-8 sm:px-6 lg:px-8 lg:py-10 space-y-8 font-body">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-brand-black tracking-tight font-display">
              Manajemen Workshop
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-moss mt-1.5">
            Kelola daftar workshop brand, pantau ketersediaan kuota pendaftaran, dan sesuaikan status publikasi.
          </p>
        </div>
      </div>

      {/* Error State Banner */}
      {error && (
        <div className="p-4 rounded-sm bg-error-rust/10 border border-error-rust/20 text-error-rust text-xs font-medium">
          {error}
        </div>
      )}

      {/* Filter & Toolbar */}
      <WorkshopToolbar
        localSearch={localSearch}
        setLocalSearch={setLocalSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onSearchExecute={handleSearchExecute}
        onCreateClick={() => setCreateDialogOpen(true)}
      />

      {/* Workshop List Table */}
      <WorkshopTable
        workshops={workshops}
        isLoading={isLoading}
        onViewDetail={handleViewDetail}
        onDeleteClick={handleDeleteClick}
      />

      {/* Detail / Edit Dialog */}
      <WorkshopDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        workshop={selectedWorkshop}
        onUpdated={refresh}
      />

      {/* Create Dialog */}
      <WorkshopCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreated={refresh}
      />

      {/* Delete Alert Dialog */}
      <WorkshopDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        workshop={workshopToDelete}
        onDeleted={refresh}
      />
    </div>
  );
}
