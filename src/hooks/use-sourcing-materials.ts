"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { getWastePosts } from "@/services/sourcing.service";
import type { SourcingFilterInput, SourcingWastePostItem } from "@/types/sourcing";

const INITIAL_PAGE_SIZE = 8;
const LOAD_MORE_STEP = 8;

export interface UseSourcingMaterialsReturn {
  /** All items matching current search and filters */
  allPosts: SourcingWastePostItem[];
  /** Currently displayed paginated posts */
  wastePosts: SourcingWastePostItem[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  filters: SourcingFilterInput;
  setFilters: React.Dispatch<React.SetStateAction<SourcingFilterInput>>;
  localSearch: string;
  setLocalSearch: (q: string) => void;
  handleSearchExecute: () => void;
  refresh: () => void;
  hasMore: boolean;
  loadMore: () => void;
}

export function useSourcingMaterials(): UseSourcingMaterialsReturn {
  const [allPosts, setAllPosts] = useState<SourcingWastePostItem[]>([]);
  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_PAGE_SIZE);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [localSearch, setLocalSearch] = useState<string>("");
  const [filters, setFilters] = useState<SourcingFilterInput>({
    searchQuery: "",
    minPrice: undefined,
    maxPrice: undefined,
    minOrderKg: undefined,
    categoryNames: [],
  });

  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const fetchWastePosts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await getWastePosts(filters);

      if (res.success && res.data) {
        setAllPosts(res.data);
        setVisibleCount(INITIAL_PAGE_SIZE);
      } else {
        setError(res.error ?? "Gagal memuat material limbah kain.");
      }
    } catch {
      setError("Terjadi kesalahan sistem saat memuat material.");
    } finally {
      setIsLoading(false);
    }
  }, [filters, refreshTrigger]);

  useEffect(() => {
    fetchWastePosts();
  }, [fetchWastePosts]);

  // Auto reset searchQuery when localSearch is cleared
  useEffect(() => {
    if (localSearch.trim() === "" && filters.searchQuery !== "") {
      setFilters((prev) => ({ ...prev, searchQuery: "" }));
    }
  }, [localSearch, filters.searchQuery]);

  const handleSearchExecute = useCallback(() => {
    setFilters((prev) => ({ ...prev, searchQuery: localSearch.trim() }));
  }, [localSearch]);

  const refresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const hasMore = visibleCount < allPosts.length;

  const wastePosts = useMemo(() => {
    return allPosts.slice(0, visibleCount);
  }, [allPosts, visibleCount]);

  const loadMore = useCallback(() => {
    if (isLoadingMore || visibleCount >= allPosts.length) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + LOAD_MORE_STEP);
      setIsLoadingMore(false);
    }, 250);
  }, [isLoadingMore, visibleCount, allPosts.length]);

  return {
    allPosts,
    wastePosts,
    isLoading,
    isLoadingMore,
    error,
    filters,
    setFilters,
    localSearch,
    setLocalSearch,
    handleSearchExecute,
    refresh,
    hasMore,
    loadMore,
  };
}
