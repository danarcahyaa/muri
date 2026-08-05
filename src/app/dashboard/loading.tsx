import { Leaf } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";

export default function CustomerDashboardLoading() {
  return (
    <div className="mx-auto w-full max-w-[1320px] px-5 py-10 sm:px-6 lg:px-8 lg:py-14 space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-8 space-y-4">
        <div className="flex items-center gap-3 text-brand-emerald">
          <Leaf className="size-4" strokeWidth={2} />
          <span className="text-xs font-bold uppercase tracking-tight">
            Dashboard Customer
          </span>
        </div>
        <Skeleton className="h-12 w-80 sm:w-[420px] rounded-lg" />
        <Skeleton className="h-5 w-full max-w-md rounded-md" />
      </div>

      {/* Cards Skeleton */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-2xl" />
        ))}
      </div>

      {/* Content Section Skeleton */}
      <div className="rounded-2xl border border-brand-black/15 bg-canvas-pure p-6 sm:p-8 space-y-4">
        <Skeleton className="h-8 w-48 rounded-md" />
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </div>
  );
}
