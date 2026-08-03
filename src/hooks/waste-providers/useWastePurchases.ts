"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import {
  getWastePurchases,
  confirmWastePurchase,
  updateWastePurchaseLogistics,
  rejectWastePurchase,
} from "@/services/waste-providers/purchaseService";
import type { WastePurchaseItem, PickupAddress } from "@/types/wasteProvider";
import type { UseWastePurchasesReturn } from "@/types/hooks";
import { ALL_STATUSES } from "@/constants/constants";
import { OrderStatus } from "@/enums/enums";

const PAGE_SIZE = 5;

export function useWastePurchases(): UseWastePurchasesReturn {
  const { user } = useAuth();

  // Data state
  const [purchases, setPurchases] = useState<WastePurchaseItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // isInitialEmpty: tracks whether the provider has zero purchases at all,
  // allowing us to skip future fetches when no filters are active.
  const [isInitialEmpty, setIsInitialEmpty] = useState<boolean | null>(null);

  // Pagination & filter state
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>(ALL_STATUSES);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Increment to manually trigger a data re-fetch after a CRUD operation
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Dialog state
  const [selectedPurchase, setSelectedPurchase] = useState<WastePurchaseItem | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Supabase Realtime Subscription for real-time status updates
  useEffect(() => {
    const channel = supabase
      .channel("waste_purchases_realtime_provider")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "waste_purchases",
        },
        () => {
          setRefreshTrigger((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Sync selectedPurchase when purchases array is refreshed
  useEffect(() => {
    if (selectedPurchase) {
      const updated = purchases.find((p) => p.id === selectedPurchase.id);
      if (updated) {
        setSelectedPurchase(updated);
      }
    }
  }, [purchases]);

  // Load purchase data
  useEffect(() => {
    const userId = user?.id;
    if (!userId) return;

    async function loadPurchases() {
      const hasSearchOrDateFilter =
        searchQuery.trim() !== "" || dateFrom !== "" || dateTo !== "";

      // Skip network call when we know the list is empty and no filters are active
      if (isInitialEmpty === true && !hasSearchOrDateFilter) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const res = await getWastePurchases(userId as string, {
          page: currentPage,
          pageSize: PAGE_SIZE,
          searchQuery: searchQuery.trim() || undefined,
          statusFilter:
            statusFilter.length === ALL_STATUSES.length ? undefined : statusFilter,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
        });

        if (res.success && res.data) {
          setPurchases(res.data.purchases);
          setTotalCount(res.data.totalCount);

          // On first unfiltered load, record whether the list is empty
          if (
            isInitialEmpty === null &&
            statusFilter.length === ALL_STATUSES.length &&
            !dateFrom &&
            !dateTo &&
            !searchQuery.trim()
          ) {
            setIsInitialEmpty(res.data.totalCount === 0);
          }
        } else {
          setError(res.error || "Gagal memuat daftar pesanan.");
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Terjadi kesalahan sistem saat memuat data.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    }

    loadPurchases();
  }, [user?.id, currentPage, searchQuery, statusFilter, dateFrom, dateTo, refreshTrigger]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Increment refresh counter to re-fetch data after a CRUD operation. */
  function triggerRefresh() {
    setRefreshTrigger((prev) => prev + 1);
  }

  // --- Action Handlers ---

  const handleConfirmPurchase = async (purchaseId: string, pickupAddress: PickupAddress) => {
    try {
      const res = await confirmWastePurchase(purchaseId, pickupAddress);
      if (res.success) {
        toast.success("Pesanan berhasil dikonfirmasi! Status pesanan kini Diproses.");
        triggerRefresh();
      } else {
        toast.error(res.error || "Gagal mengonfirmasi pesanan.");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Terjadi kesalahan saat mengonfirmasi.";
      toast.error(message);
    }
  };

  const handleUpdateLogistics = async (
    purchaseId: string,
    newStatusStr: string,
    trackingNumber?: string
  ) => {
    try {
      const newStatus =
        newStatusStr === OrderStatus.SHIPPED ? OrderStatus.SHIPPED : OrderStatus.COMPLETE;

      const res = await updateWastePurchaseLogistics(purchaseId, newStatus, trackingNumber);
      if (res.success) {
        toast.success(`Status logistik pesanan berhasil diperbarui menjadi ${newStatusStr === OrderStatus.SHIPPED ? "Dikirim" : "Selesai"}!`);
        triggerRefresh();
      } else {
        toast.error(res.error || "Gagal memperbarui logistik pesanan.");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Terjadi kesalahan saat memperbarui status logistik.";
      toast.error(message);
    }
  };

  const handleRejectPurchase = async (purchaseId: string) => {
    try {
      const res = await rejectWastePurchase(purchaseId);
      if (res.success) {
        toast.success("Pesanan berhasil ditolak!");
        triggerRefresh();
      } else {
        toast.error(res.error || "Gagal menolak pesanan.");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Terjadi kesalahan saat menolak.";
      toast.error(message);
    }
  };

  const handleViewDetail = (purchase: WastePurchaseItem) => {
    setSelectedPurchase(purchase);
    setDetailDialogOpen(true);
  };

  /** Reset pagination to first page when filter parameters change. */
  const handleFilterSearchExecute = () => {
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (statuses: string[]) => {
    setStatusFilter(statuses);
    setCurrentPage(1);
  };

  return {
    purchases,
    totalCount,
    isLoading,
    error,
    refreshTrigger,
    currentPage,
    setCurrentPage,
    pageSize: PAGE_SIZE,
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
    handleUpdateLogistics,
    handleRejectPurchase,
    handleViewDetail,
    handleFilterSearchExecute,
    handleStatusFilterChange,
  };
}
