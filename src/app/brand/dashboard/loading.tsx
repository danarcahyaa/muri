import { Leaf } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";

export default function BrandDashboardLoading() {
  return (
    <div className="mx-auto w-full max-w-[1320px] px-5 py-10 sm:px-6 lg:px-8 lg:py-14 space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-8 space-y-4">
        <div className="flex items-center gap-3 text-brand-emerald">
          <Leaf className="size-4" strokeWidth={2} />
          <span className="text-xs font-bold uppercase tracking-tight">
            Dashboard Brand
          </span>
        </div>
        <Skeleton className="h-12 w-80 sm:w-[460px] rounded-lg" />
        <Skeleton className="h-5 w-full max-w-xl rounded-md" />
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-2xl" />
        ))}
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="lg:col-span-2 h-72 w-full rounded-2xl" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    </div>
  );
}
