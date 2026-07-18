"use client";

import { useState, useEffect, useCallback } from "react";
import { getWasteBatches } from "@/services/waste-providers/wasteBatchService";
import type { WasteBatchItem } from "@/types/wasteProvider";
import type { UseWasteBatchReturn } from "@/types/hooks";

export function useWasteBatch(providerId: string): UseWasteBatchReturn {
  const [batches, setBatches] = useState<WasteBatchItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Detail dialog
  const [selectedBatch, setSelectedBatch] = useState<WasteBatchItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Re-fetch count to force reload if needed
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!providerId) return;

    async function loadBatches() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await getWasteBatches(providerId, {
          searchQuery: searchQuery.trim() || undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
        });
        if (res.success && res.data) {
          setBatches(res.data);
        } else {
          setError(res.error ?? "Gagal memuat data jejak limbah.");
        }
      } catch {
        setError("Terjadi kesalahan sistem saat memuat jejak limbah.");
      } finally {
        setIsLoading(false);
      }
    }

    loadBatches();
  }, [providerId, searchQuery, dateFrom, dateTo, refreshTrigger]);

  const handleSearch = useCallback(() => {
    // Increment refresh trigger to reload even if parameters are identical
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const handleViewDetail = useCallback((batch: WasteBatchItem) => {
    setSelectedBatch(batch);
    setDetailOpen(true);
  }, []);

  return {
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
  };
}
