"use client";

import type { ReactElement } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { PurchaseToolbar } from "@/components/waste-providers/orders/PurchaseToolbar";
import { PurchaseTable } from "@/components/waste-providers/orders/PurchaseTable";
import { PurchaseDetailDialog } from "@/components/waste-providers/orders/PurchaseDetailDialog";
import { PurchaseSummaryMetrics } from "@/components/waste-providers/orders/Metrics";
import { useWastePurchases } from "@/hooks/waste-providers/useWastePurchases";
import { useAuth } from "@/components/auth/AuthProvider";

export default function WasteProviderOrderPage(): ReactElement {
  const { user } = useAuth();
  const {
    purchases,
    totalCount,
    isLoading,
    error,
    refreshTrigger,
    currentPage,
    setCurrentPage,
    pageSize,
    searchQuery,
    setSearchQuery,
    statusFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    selectedPurchase,
    detailDialogOpen,
    setDetailDialogOpen,
    handleConfirmPurchase,
    handleRejectPurchase,
    handleViewDetail,
    handleFilterSearchExecute,
    handleStatusFilterChange,
  } = useWastePurchases();

  return (
    <div className="mx-auto w-full max-w-[1320px] px-5 py-10 sm:px-6 lg:px-8 lg:py-14 font-body">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold tracking-tight text-brand-black sm:text-5xl">
          Daftar Transaksi Pesanan
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-moss">
          Pantau riwayat order sisa kain perca dari brand fesyen, saring data transaksi berdasarkan status dan tanggal, serta lakukan konfirmasi pengiriman material.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6 max-w-xl">
          <AlertTitle>Kesalahan</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        <PurchaseSummaryMetrics
          providerId={user?.id || ""}
          refreshTrigger={refreshTrigger}
        />

        <PurchaseToolbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={handleStatusFilterChange}
          dateFrom={dateFrom}
          setDateFrom={setDateFrom}
          dateTo={dateTo}
          setDateTo={setDateTo}
          onSearchExecute={handleFilterSearchExecute}
        />

        <PurchaseTable
          purchases={purchases}
          isLoading={isLoading}
          totalCount={totalCount}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onViewDetail={handleViewDetail}
        />
      </div>

      <PurchaseDetailDialog
        purchase={selectedPurchase}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        onConfirmPurchase={handleConfirmPurchase}
        onRejectPurchase={handleRejectPurchase}
      />
    </div>
  );
}
