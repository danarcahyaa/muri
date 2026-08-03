"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/lib/supabaseClient";
import {
  createBrandProduction,
  getAvailablePurchasedWaste,
  getBrandProductions,
  updateProductionStatus,
  type AvailableWasteMaterialItem,
  type BrandProductionItem,
  type CreateBrandProductionInput,
} from "@/services/brand-fashion/circularProductionService";

export interface UseCircularProductionReturn {
  onProgressItems: BrandProductionItem[];
  finishedItems: BrandProductionItem[];
  hiddenItems: BrandProductionItem[];
  availableWasteList: AvailableWasteMaterialItem[];
  isLoading: boolean;
  isSubmitting: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  refetch: () => Promise<void>;

  // Create Modal state
  isCreateModalOpen: boolean;
  handleOpenCreateModal: () => Promise<void>;
  handleCloseCreateModal: () => void;
  handleCreateProduction: (
    input: Omit<CreateBrandProductionInput, "brandId">
  ) => Promise<boolean>;

  // Detail Modal state
  selectedDetailItem: BrandProductionItem | null;
  handleOpenDetailModal: (item: BrandProductionItem) => void;
  handleCloseDetailModal: () => void;

  // Cancel Modal state
  cancelTargetItem: BrandProductionItem | null;
  handleOpenCancelModal: (item: BrandProductionItem) => void;
  handleCloseCancelModal: () => void;
  handleConfirmCancelProduction: () => Promise<void>;

  // Finish Modal state
  finishTargetItem: BrandProductionItem | null;
  handleOpenFinishModal: (item: BrandProductionItem) => void;
  handleCloseFinishModal: () => void;
  handleConfirmFinishProduction: () => Promise<void>;

  // Hide / Unhide Production handlers
  handleHideProduction: (item: BrandProductionItem) => Promise<void>;
  handleUnhideProduction: (item: BrandProductionItem) => Promise<void>;
}

export function useCircularProduction(): UseCircularProductionReturn {
  const { user } = useAuth();

  const [allProductions, setAllProductions] = useState<BrandProductionItem[]>([]);
  const [availableWasteList, setAvailableWasteList] = useState<
    AvailableWasteMaterialItem[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [selectedDetailItem, setSelectedDetailItem] =
    useState<BrandProductionItem | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getBrandProductions(user?.id);
      if (res.success && res.data) {
        setAllProductions(res.data);
      } else {
        setAllProductions([]);
      }
    } catch {
      setAllProductions([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Realtime subscription for brand_productions and waste_purchases
  useEffect(() => {
    const channel = supabase
      .channel("brand_productions_realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "brand_productions",
        },
        () => {
          void loadData();
        }
      )
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

  // Filtered productions by search query
  const filteredProductions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allProductions;
    return allProductions.filter((item) => {
      const pName = item.productionName.toLowerCase();
      const matNames = item.materials
        .map((m) => `${m.fabricName} ${m.categoryName}`)
        .join(" ")
        .toLowerCase();
      return pName.includes(q) || matNames.includes(q);
    });
  }, [allProductions, searchQuery]);

  // Group into On Progress, Finished, and Hidden Kanban items
  const onProgressItems = useMemo(() => {
    return filteredProductions.filter(
      (item) =>
        (item.status === "in_production" || item.status === "on_progress") &&
        !item.isHide
    );
  }, [filteredProductions]);

  const finishedItems = useMemo(() => {
    return filteredProductions.filter(
      (item) =>
        (item.status === "finish" ||
          item.status === "finished" ||
          item.status === "Finished") &&
        !item.isHide
    );
  }, [filteredProductions]);

  const hiddenItems = useMemo(() => {
    return filteredProductions.filter((item) => Boolean(item.isHide));
  }, [filteredProductions]);

  const handleOpenCreateModal = async (): Promise<void> => {
    try {
      const res = await getAvailablePurchasedWaste(user?.id);
      if (res.success && res.data) {
        setAvailableWasteList(res.data);
      } else {
        setAvailableWasteList([]);
      }
    } catch {
      setAvailableWasteList([]);
    }
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = (): void => {
    setIsCreateModalOpen(false);
  };

  const handleCreateProduction = async (
    input: Omit<CreateBrandProductionInput, "brandId">
  ): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      const res = await createBrandProduction({
        ...input,
        brandId: user?.id,
      });

      if (res.success && res.data) {
        toast.success(`Produksi ${res.data.productionName} berhasil dibuat & stok limbah terpotong!`);
        setIsCreateModalOpen(false);
        void loadData();
        return true;
      } else {
        toast.error(res.error || "Gagal membuat produksi baru.");
        return false;
      }
    } catch {
      toast.error("Terjadi kesalahan saat membuat produksi.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDetailModal = (item: BrandProductionItem): void => {
    setSelectedDetailItem(item);
  };

  const handleCloseDetailModal = (): void => {
    setSelectedDetailItem(null);
  };

  // Finish Modal state
  const [finishTargetItem, setFinishTargetItem] =
    useState<BrandProductionItem | null>(null);

  const handleOpenFinishModal = (item: BrandProductionItem): void => {
    setFinishTargetItem(item);
  };

  const handleCloseFinishModal = (): void => {
    setFinishTargetItem(null);
  };

  const handleConfirmFinishProduction = async (): Promise<void> => {
    if (!finishTargetItem) return;
    setIsSubmitting(true);
    try {
      const res = await updateProductionStatus(finishTargetItem.id, "finish");
      if (res.success) {
        toast.success(
          `Produksi ${finishTargetItem.productionName} berhasil diselesaikan!`
        );
        setFinishTargetItem(null);
        void loadData();
      } else {
        toast.error(res.error || "Gagal memperbarui status produksi.");
      }
    } catch {
      toast.error("Terjadi kesalahan saat memperbarui status.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel Modal state
  const [cancelTargetItem, setCancelTargetItem] =
    useState<BrandProductionItem | null>(null);

  const handleOpenCancelModal = (item: BrandProductionItem): void => {
    setCancelTargetItem(item);
  };

  const handleCloseCancelModal = (): void => {
    setCancelTargetItem(null);
  };

  const handleConfirmCancelProduction = async (): Promise<void> => {
    if (!cancelTargetItem) return;
    setIsSubmitting(true);
    try {
      const { cancelBrandProduction } = await import(
        "@/services/brand-fashion/circularProductionService"
      );
      const res = await cancelBrandProduction(cancelTargetItem.id);
      if (res.success) {
        toast.success(
          `Produksi ${cancelTargetItem.productionName} berhasil dibatalkan dan stok limbah telah dikembalikan ke inventaris!`
        );
        setCancelTargetItem(null);
        void loadData();
      } else {
        toast.error(res.error || "Gagal membatalkan produksi.");
      }
    } catch {
      toast.error("Terjadi kesalahan saat membatalkan produksi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHideProduction = async (item: BrandProductionItem): Promise<void> => {
    try {
      const { hideBrandProduction } = await import(
        "@/services/brand-fashion/circularProductionService"
      );
      const res = await hideBrandProduction(item.id);
      if (res.success) {
        toast.success(
          `Produksi "${item.productionName}" berhasil disembunyikan dari papan Kanban.`
        );
        void loadData();
      } else {
        toast.error(res.error || "Gagal menyembunyikan produksi.");
      }
    } catch {
      toast.error("Terjadi kesalahan saat menyembunyikan produksi.");
    }
  };

  const handleUnhideProduction = async (
    item: BrandProductionItem
  ): Promise<void> => {
    try {
      const { unhideBrandProduction } = await import(
        "@/services/brand-fashion/circularProductionService"
      );
      const res = await unhideBrandProduction(item.id);
      if (res.success) {
        toast.success(
          `Produksi "${item.productionName}" berhasil ditampilkan kembali di papan Kanban.`
        );
        void loadData();
      } else {
        toast.error(res.error || "Gagal menampilkan kembali produksi.");
      }
    } catch {
      toast.error("Terjadi kesalahan saat menampilkan kembali produksi.");
    }
  };

  return {
    onProgressItems,
    finishedItems,
    hiddenItems,
    availableWasteList,
    isLoading,
    isSubmitting,
    searchQuery,
    setSearchQuery,
    refetch: loadData,

    isCreateModalOpen,
    handleOpenCreateModal,
    handleCloseCreateModal,
    handleCreateProduction,

    selectedDetailItem,
    handleOpenDetailModal,
    handleCloseDetailModal,

    cancelTargetItem,
    handleOpenCancelModal,
    handleCloseCancelModal,
    handleConfirmCancelProduction,

    finishTargetItem,
    handleOpenFinishModal,
    handleCloseFinishModal,
    handleConfirmFinishProduction,

    handleHideProduction,
    handleUnhideProduction,
  };
}
