"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { useBrandDashboard } from "@/hooks/brand/useBrandDashboard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { BrandDashboardHeader } from "@/components/brand/dashboard/BrandDashboardHeader";
import { BrandKPICards } from "@/components/brand/dashboard/BrandKPICards";
import { EarthImpactMetrics } from "@/components/brand/dashboard/EarthImpactMetrics";
import { QuickActionsNav } from "@/components/brand/dashboard/QuickActionsNav";
import { StartSourcingCTA } from "@/components/brand/dashboard/StartSourcingCTA";

/**
 * BrandDashboardPage renders the primary dashboard overview for Brand accounts.
 */
export default function BrandDashboardPage() {
  const { user, fullName } = useAuth();
  const { stats, isLoading, error } = useBrandDashboard(user?.id);

  const showSkeleton = isLoading || !stats;

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
    <div className="mx-auto w-full max-w-[1320px] px-5 py-10 sm:px-6 lg:px-8 lg:py-14 space-y-10">
      {/* Greeting Header */}
      <BrandDashboardHeader fullName={fullName} />

      {/* Primary KPI Cards Grid */}
      <BrandKPICards stats={stats} showSkeleton={showSkeleton} />

      {/* Earth Impact Metrics & Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        <EarthImpactMetrics stats={stats} showSkeleton={showSkeleton} />
        <QuickActionsNav />
      </div>

      {/* Material Sourcing Call-To-Action */}
      <StartSourcingCTA />
    </div>
  );
}
