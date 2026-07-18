"use client";

import { type ReactElement } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { WasteBatchMetrics } from "@/components/waste-providers/waste-batch/Metrics";
import { WasteBatchToolbar } from "@/components/waste-providers/waste-batch/Toolbar";
import { WasteBatchTable } from "@/components/waste-providers/waste-batch/Table";
import { WasteBatchDetailDialog } from "@/components/waste-providers/waste-batch/DetailDialog";
import { useWasteBatch } from "@/hooks/waste-providers/useWasteBatch";
import { useAuth } from "@/components/auth/AuthProvider";

export default function WasteFootprintPage(): ReactElement {
  const { user } = useAuth();
  const providerId = user?.id || "";

  const {
    batches,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    selectedBatch,
    detailOpen,
    setDetailOpen,
    handleSearch,
    handleViewDetail,
  } = useWasteBatch(providerId);


  return (
    <div className="mx-auto w-full max-w-[1320px] px-5 py-10 sm:px-6 lg:px-8 lg:py-14">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold tracking-tight text-brand-black sm:text-5xl">
          Jejak Limbah
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-moss">
          Pantau riwayat pencatatan batch limbah kain Anda yang digunakan oleh pihak brand sebagai bukti asal-usul bahan baku ramah lingkungan.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6 max-w-xl">
          <AlertTitle>Kesalahan</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {/* Metrics Section */}
        <WasteBatchMetrics providerId={providerId} />

        {/* Filters Toolbar */}
        <WasteBatchToolbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          dateFrom={dateFrom}
          setDateFrom={setDateFrom}
          dateTo={dateTo}
          setDateTo={setDateTo}
          onSearch={handleSearch}
        />

        {/* Data Table */}
        <WasteBatchTable
          batches={batches}
          isLoading={isLoading}
          onViewClick={handleViewDetail}
        />
      </div>

      {/* Details Dialog */}
      <WasteBatchDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        batch={selectedBatch}
      />
    </div>
  );
}
