import { useEffect, useState, useCallback } from "react";
import { getBrandDashboardStats, type BrandDashboardStats } from "@/services/brand-fashion/dashboardService";

export interface UseBrandDashboardReturn {
  stats: BrandDashboardStats | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom React hook for fetching and managing Brand Dashboard statistics state.
 *
 * @param userId - Auth User ID of the brand
 * @returns State object containing stats, isLoading, error, and refetch handler
 */
export function useBrandDashboard(userId?: string | null): UseBrandDashboardReturn {
  const [stats, setStats] = useState<BrandDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await getBrandDashboardStats(userId);
      if (response.success && response.data) {
        setStats(response.data.stats);
      } else {
        setError(response.error || "Gagal memuat statistik dashboard.");
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan sistem saat memuat dashboard.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchDashboardData,
  };
}
