import { type ReactElement } from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export function WasteDetailSkeleton(): ReactElement {
  return (
    <div className="mx-auto w-full max-w-[1320px] px-5 py-8 sm:px-6 lg:px-8 lg:py-10 space-y-8">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-20 rounded" />
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-32 rounded" />
      </div>

      {/* Main 2-Column Grid Layout Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-8">
          {/* Gallery Skeleton */}
          <div className="space-y-4">
            <Skeleton className="w-full aspect-4/3 sm:aspect-16/10 rounded-2xl" />
            <div className="flex items-center gap-3">
              <Skeleton className="size-20 rounded-xl" />
              <Skeleton className="size-20 rounded-xl" />
              <Skeleton className="size-20 rounded-xl" />
            </div>
          </div>

          {/* Title & Info Skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-4 w-48 rounded" />
            <Skeleton className="h-8 w-3/4 rounded-md" />
            <Skeleton className="h-4 w-36 rounded" />
          </div>

          {/* Specs Grid Skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-5 rounded-2xl bg-canvas-pure border border-brand-black/10">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-20 rounded" />
                <Skeleton className="h-5 w-28 rounded" />
              </div>
            ))}
          </div>

          {/* Eco Impact Banner Skeleton */}
          <Skeleton className="h-32 w-full rounded-2xl" />

          {/* Description Skeleton */}
          <div className="space-y-4 p-5 rounded-2xl bg-canvas-pure border border-brand-black/10">
            <Skeleton className="h-5 w-48 rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-5/6 rounded" />
            <Skeleton className="h-4 w-4/6 rounded" />
          </div>
        </div>

        {/* Right Column (Checkout Card Skeleton) */}
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="p-6 rounded-2xl bg-canvas-pure border border-brand-black/15 space-y-6">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-10 w-48 rounded-md" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
