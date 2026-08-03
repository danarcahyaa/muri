"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth/AuthProvider";
import { useDebounce } from "@/hooks/useDebounce";
import { supabase } from "@/lib/supabaseClient";
import {
  getPurchasedInventory,
  getPurchasedMaterialDetail,
  softDeletePurchasedMaterial,
  type PurchasedInventoryDetail,
  type PurchasedInventoryItem,
} from "@/services/brand-fashion/purchasedInventoryService";

export interface UsePurchasedInventoryReturn {
  items: PurchasedInventoryItem[];
  isLoading: boolean;
  error: string | null;
  searchInput: string;
  setSearchInput: (value: string) => void;
  refetch: () => Promise<void>;

  // Detail Modal State
  selectedDetailItem: PurchasedInventoryDetail | null;
  isDetailLoading: boolean;
  handleOpenDetail: (item: PurchasedInventoryItem) => Promise<void>;
  handleCloseDetail: () => void;

  // Delete Dialog State
  selectedDeleteItem: PurchasedInventoryItem | null;
  isDeleting: boolean;
  handleOpenDelete: (item: PurchasedInventoryItem) => void;
  handleCloseDelete: () => void;
  handleConfirmDelete: () => Promise<void>;
}

export function usePurchasedInventory(): UsePurchasedInventoryReturn {
  const { user } = useAuth();

  const [items, setItems] = useState<PurchasedInventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState<string>("");
  const debouncedSearch = useDebounce<string>(searchInput, 400);

  // Detail Modal state
  const [selectedDetailItem, setSelectedDetailItem] =
    useState<PurchasedInventoryDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);

  // Delete Dialog state
  const [selectedDeleteItem, setSelectedDeleteItem] =
    useState<PurchasedInventoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getPurchasedInventory({
        brandId: user?.id,
        searchQuery: debouncedSearch,
      });

      if (res.success && res.data) {
        setItems(res.data);
      } else {
        setItems([]);
        setError(res.error || "Gagal memuat material limbah terbeli.");
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Terjadi kesalahan sistem saat memuat data.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, debouncedSearch]);

  // Initial load & when debounced search changes
  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Realtime updates subscription on waste_purchases table
  useEffect(() => {
    const channel = supabase
      .channel("waste_purchases_realtime_inventory")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "waste_purchases",
        },
        () => {
          void loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadData]);

  const handleOpenDetail = async (item: PurchasedInventoryItem): Promise<void> => {
    setIsDetailLoading(true);
    try {
      const res = await getPurchasedMaterialDetail(item.id || item.purchaseId);
      if (res.success && res.data) {
        setSelectedDetailItem(res.data);
      } else {
        toast.error(res.error || "Gagal mengambil detail material.");
      }
    } catch {
      toast.error("Terjadi kesalahan saat memuat detail.");
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleCloseDetail = (): void => {
    setSelectedDetailItem(null);
  };

  const handleOpenDelete = (item: PurchasedInventoryItem): void => {
    if (item.weightBoughtKg > 0) {
      toast.error("Material hanya dapat dihapus jika sisa stok sudah 0 kg");
      return;
    }
    setSelectedDeleteItem(item);
  };

  const handleCloseDelete = (): void => {
    setSelectedDeleteItem(null);
  };

  const handleConfirmDelete = async (): Promise<void> => {
    if (!selectedDeleteItem) return;

    setIsDeleting(true);
    try {
      const res = await softDeletePurchasedMaterial(
        selectedDeleteItem.id || selectedDeleteItem.purchaseId
      );

      if (res.success) {
        toast.success(`Material ${selectedDeleteItem.fabricName} (${selectedDeleteItem.purchaseId}) berhasil dihapus.`);
        setSelectedDeleteItem(null);
        void loadData();
      } else {
        toast.error(res.error || "Gagal menghapus material.");
      }
    } catch {
      toast.error("Terjadi kesalahan saat menghapus material.");
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    items,
    isLoading,
    error,
    searchInput,
    setSearchInput,
    refetch: loadData,

    selectedDetailItem,
    isDetailLoading,
    handleOpenDetail,
    handleCloseDetail,

    selectedDeleteItem,
    isDeleting,
    handleOpenDelete,
    handleCloseDelete,
    handleConfirmDelete,
  };
}
