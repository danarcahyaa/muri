import { Leaf } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";

export default function WasteDetailLoading() {
  return (
    <div className="mx-auto w-full max-w-[1320px] px-5 py-10 sm:px-6 lg:px-8 lg:py-14 space-y-8 animate-pulse">
      {/* Canonical Header Skeleton */}
      <div className="mb-8 space-y-4">
        <div className="flex items-center gap-3 text-brand-emerald">
          <Leaf className="size-4" strokeWidth={2} />
          <span className="text-xs font-bold uppercase tracking-tight">
            Brand Sourcing
          </span>
        </div>
        <Skeleton className="h-12 w-80 sm:w-[480px] rounded-lg" />
        <Skeleton className="h-5 w-full max-w-xl rounded-md" />
      </div>

      {/* Navigation Skeleton */}
      <div className="flex items-center justify-between gap-4 border-b border-brand-black/10 pb-4">
        <Skeleton className="h-9 w-44 rounded-md" />
        <Skeleton className="h-4 w-64 rounded-md hidden sm:block" />
      </div>

      {/* Detail Columns Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Main Content */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <Skeleton className="w-full aspect-[4/3] rounded-xl" />
          <Skeleton className="h-28 w-full rounded-md" />
          <Skeleton className="h-36 w-full rounded-md" />
          <Skeleton className="h-48 w-full rounded-md" />
        </div>

        {/* Right Checkout Panel */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          <Skeleton className="h-96 w-full rounded-md" />
        </div>
      </div>
    </div>
  );
}
