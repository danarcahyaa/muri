"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { getBrandWorkshops } from "@/services/brand-fashion/workshopService";
import type {
  BrandWorkshopItem,
  WorkshopPublishStatusFilter,
} from "@/types/brandWorkshop";

export interface UseBrandWorkshopsReturn {
  workshops: BrandWorkshopItem[];
  isLoading: boolean;
  error: string | null;
  localSearch: string;
  setLocalSearch: (q: string) => void;
  searchQuery: string;
  statusFilter: WorkshopPublishStatusFilter;
  setStatusFilter: (status: WorkshopPublishStatusFilter) => void;
  handleSearchExecute: () => void;
  refresh: () => void;
}

export function useBrandWorkshops(): UseBrandWorkshopsReturn {
  const { user } = useAuth();

  const [workshops, setWorkshops] = useState<BrandWorkshopItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [localSearch, setLocalSearch] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] =
    useState<WorkshopPublishStatusFilter>("all");

  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const fetchWorkshops = useCallback(async () => {
    const brandId = user?.id;
    if (!brandId) return;

    try {
      setIsLoading(true);
      setError(null);

      const res = await getBrandWorkshops(brandId, {
        searchQuery: searchQuery.trim() || undefined,
        statusFilter,
      });

      if (res.success && res.data) {
        setWorkshops(res.data);
      } else {
        setError(res.error ?? "Gagal memuat data workshop.");
      }
    } catch {
      setError("Terjadi kesalahan sistem saat memuat daftar workshop.");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, searchQuery, statusFilter, refreshTrigger]);

  useEffect(() => {
    fetchWorkshops();
  }, [fetchWorkshops]);

  // Automatically reset searchQuery when input is cleared
  useEffect(() => {
    if (localSearch.trim() === "" && searchQuery !== "") {
      setSearchQuery("");
    }
  }, [localSearch, searchQuery]);

  const handleSearchExecute = useCallback(() => {
    setSearchQuery(localSearch);
  }, [localSearch]);

  const refresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return {
    workshops,
    isLoading,
    error,
    localSearch,
    setLocalSearch,
    searchQuery,
    statusFilter,
    setStatusFilter,
    handleSearchExecute,
    refresh,
  };
}
