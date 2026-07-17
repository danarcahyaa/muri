"use client";

import { useEffect, useState, type ReactElement } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getWastePurchases, confirmWastePurchase, rejectWastePurchase } from "@/services/waste-providers/purchaseService";
import { WastePurchaseItem } from "@/types/wasteProvider";
import { PurchaseToolbar } from "@/components/waste-providers/orders/PurchaseToolbar";
import { PurchaseTable } from "@/components/waste-providers/orders/PurchaseTable";
import { PurchaseDetailDialog } from "@/components/waste-providers/orders/PurchaseDetailDialog";
import { PurchaseSummaryMetrics } from "@/components/waste-providers/orders/Metrics";
import { ALL_STATUSES } from "@/constants/constant";

export default function WasteProviderOrderPage(): ReactElement {
  const { user } = useAuth();

  // State Data
  const [purchases, setPurchases] = useState<WastePurchaseItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialEmpty, setIsInitialEmpty] = useState<boolean | null>(null);

  // Pagination & Filtering
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>(ALL_STATUSES);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Dialog State
  const [selectedPurchase, setSelectedPurchase] = useState<WastePurchaseItem | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Load purchase data
  useEffect(() => {
    const userId = user?.id;
    if (!userId) return;

    async function loadPurchases() {

      const hasSearchOrDateFilter = searchQuery.trim() !== "" || dateFrom !== "" || dateTo !== "";
      if (isInitialEmpty === true && !hasSearchOrDateFilter) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const res = await getWastePurchases(userId as string, {
          page: currentPage,
          pageSize,
          searchQuery: searchQuery.trim() || undefined,
          statusFilter: statusFilter.length === ALL_STATUSES.length ? undefined : statusFilter,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
        });

        if (res.success && res.data) {
          setPurchases(res.data.purchases);
          setTotalCount(res.data.totalCount);

          // Initial check
          if (
            isInitialEmpty === null &&
            statusFilter.length === ALL_STATUSES.length &&
            !dateFrom &&
            !dateTo &&
            !searchQuery.trim()
          ) {
            if (res.data.totalCount === 0) {
              setIsInitialEmpty(true);
            } else {
              setIsInitialEmpty(false);
            }
          }
        } else {
          setError(res.error || "Gagal memuat daftar pesanan.");
        }
      } catch (err: any) {
        setError(err.message || "Terjadi kesalahan sistem saat memuat data.");
      } finally {
        setIsLoading(false);
      }
    }

    loadPurchases();
  }, [user?.id, currentPage, searchQuery, statusFilter, dateFrom, dateTo, refreshTrigger]);

  // Handle confirming a purchase
  const handleConfirmPurchase = async (purchaseId: string) => {
    try {
      const res = await confirmWastePurchase(purchaseId);
      if (res.success) {
        toast.success("Pesanan berhasil dikonfirmasi!");
        // Refresh local purchase status instantly
        setRefreshTrigger((prev) => prev + 1);
      } else {
        toast.error(res.error || "Gagal mengonfirmasi pesanan.");
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan saat mengonfirmasi.");
    }
  };

  // Handle rejecting a purchase
  const handleRejectPurchase = async (purchaseId: string) => {
    try {
      const res = await rejectWastePurchase(purchaseId);
      if (res.success) {
        toast.success("Pesanan berhasil ditolak!");
        setRefreshTrigger((prev) => prev + 1);
      } else {
        toast.error(res.error || "Gagal menolak pesanan.");
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan saat menolak.");
    }
  };

  // Handle viewing purchase details
  const handleViewDetail = (purchase: WastePurchaseItem) => {
    setSelectedPurchase(purchase);
    setDetailDialogOpen(true);
  };

  // Reset pagination to first page when filtering parameters change
  const handleFilterSearchExecute = () => {
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (statuses: string[]) => {
    setStatusFilter(statuses);
    setCurrentPage(1);
  };

  return (
    <div className="mx-auto w-full max-w-[1320px] px-5 py-10 sm:px-6 lg:px-8 lg:py-14 font-body">
      {/* Page Header */}
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
        {/* Metrics */}
        <PurchaseSummaryMetrics
          providerId={user?.id || ""}
          refreshTrigger={refreshTrigger}
        />

        {/* Toolbar filter */}
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

        {/* Data Table */}
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

      {/* Detail Dialog Modal */}
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
