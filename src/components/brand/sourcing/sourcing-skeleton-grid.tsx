"use client";

import { type ReactElement } from "react";
import { Skeleton } from "@/components/ui/Skeleton";

interface SourcingSkeletonGridProps {
  count?: number;
}

export function SourcingSkeletonGrid({
  count = 8,
}: SourcingSkeletonGridProps): ReactElement {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 font-body">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border border-line-trace bg-canvas-pure p-4 space-y-3">
          <Skeleton className="w-full aspect-4/3 rounded-md" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-9 w-full rounded-sm" />
        </div>
      ))}
    </div>
  );
}
