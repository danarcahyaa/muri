"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { getDashboardStats } from "@/services/waste-providers/dashboardService";
import { DashboardStatsData } from "@/types/wasteProvider";
import { WasteSummaryHeading } from "@/components/waste-providers/summary/Heading";
import { WasteSummaryStats } from "@/components/waste-providers/summary/Stats";
import { StartSellingCTA } from "@/components/waste-providers/summary/StartSellingCTA";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";

export default function WasteProviderDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    async function loadDashboardData() {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getDashboardStats(user!.id);

        if (response.success && response.data) {
          setStats(response.data.stats);
        } else {
          setError(response.error || "Gagal memuat data dasbor.");
        }
      } catch (err: any) {
        console.error(err);
        setError("Terjadi kesalahan sistem saat memuat dasbor.");
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, [user?.id]);

  if (error) {
    return (
      <div className="mx-auto w-full max-w-[1320px] px-5 py-10 sm:px-6 lg:px-8">
        <Alert variant="destructive" className="max-w-xl mx-auto">
          <AlertTitle>Kesalahan</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1320px] px-5 py-10 sm:px-6 lg:px-8 lg:py-14">
      <WasteSummaryHeading />

      <WasteSummaryStats stats={stats} isLoading={isLoading} />

      <StartSellingCTA />
    </div>
  );
}
