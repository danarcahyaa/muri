"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  getSavedWastePosts,
  saveWastePost,
  unsaveWastePost,
} from "@/services/sourcing.service";
import type { SavedWastePostItem, SourcingWastePostItem } from "@/types/sourcing";
import { toast } from "sonner";

export interface UseSavedMaterialsReturn {
  savedItems: SavedWastePostItem[];
  savedPostIds: Set<string>;
  isLoading: boolean;
  error: string | null;
  toggleSave: (item: SourcingWastePostItem) => Promise<void>;
  unsave: (wastePostId: string) => Promise<void>;
  refresh: () => void;
}

export function useSavedMaterials(): UseSavedMaterialsReturn {
  const { user } = useAuth();
  const [savedItems, setSavedItems] = useState<SavedWastePostItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const fetchSaved = useCallback(async () => {
    const brandId = user?.id;
    if (!brandId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const res = await getSavedWastePosts(brandId);
      if (res.success && res.data) {
        setSavedItems(res.data);
      }
    } catch {
      setError("Gagal memuat daftar material tersimpan.");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, refreshTrigger]);

  useEffect(() => {
    fetchSaved();
  }, [fetchSaved]);

  const savedPostIds = useMemo(() => {
    return new Set(savedItems.map((item) => item.wastePostId));
  }, [savedItems]);

  const toggleSave = useCallback(
    async (item: SourcingWastePostItem) => {
      const brandId = user?.id;
      if (!brandId) {
        toast.error("Silakan login terlebih dahulu untuk menyimpan material.");
        return;
      }

      const isCurrentlySaved = savedPostIds.has(item.id);

      if (isCurrentlySaved) {
        // Optimistic UI update
        setSavedItems((prev) => prev.filter((s) => s.wastePostId !== item.id));
        toast.success(`"${item.customFabricName}" dihapus dari simpanan.`);

        const res = await unsaveWastePost(brandId, item.id);
        if (!res.success) {
          // Rollback if server fails
          fetchSaved();
          toast.error("Gagal menghapus simpanan.");
        }
      } else {
        // Optimistic UI update
        const tempSavedItem: SavedWastePostItem = {
          id: `temp-${Date.now()}`,
          brandId,
          wastePostId: item.id,
          createdAt: new Date().toISOString(),
          wastePost: { ...item, isSaved: true },
        };
        setSavedItems((prev) => [tempSavedItem, ...prev]);
        toast.success(`"${item.customFabricName}" berhasil disimpan!`);

        const res = await saveWastePost(brandId, item.id);
        if (!res.success) {
          // Rollback if server fails
          fetchSaved();
          toast.error("Gagal menyimpan material.");
        } else if (res.data) {
          // Update temp id with real id
          setSavedItems((prev) =>
            prev.map((s) =>
              s.wastePostId === item.id ? { ...s, id: res.data! } : s
            )
          );
        }
      }
    },
    [user?.id, savedPostIds, fetchSaved]
  );

  const unsave = useCallback(
    async (wastePostId: string) => {
      const brandId = user?.id;
      if (!brandId) return;

      const target = savedItems.find((s) => s.wastePostId === wastePostId);
      const name = target?.wastePost.customFabricName || "Material";

      setSavedItems((prev) => prev.filter((s) => s.wastePostId !== wastePostId));
      toast.success(`"${name}" dihapus dari simpanan.`);

      const res = await unsaveWastePost(brandId, wastePostId);
      if (!res.success) {
        fetchSaved();
        toast.error("Gagal menghapus simpanan.");
      }
    },
    [user?.id, savedItems, fetchSaved]
  );

  const refresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return {
    savedItems,
    savedPostIds,
    isLoading,
    error,
    toggleSave,
    unsave,
    refresh,
  };
}
