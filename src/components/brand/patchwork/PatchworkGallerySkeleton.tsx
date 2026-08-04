import { Skeleton } from "@/components/ui/Skeleton";

interface PatchworkGallerySkeletonProps {
  /** Number of skeleton cards to display. Defaults to 6. */
  count?: number;
}

/**
 * Skeleton loading view for saved Patchwork pattern galleries.
 */
export function PatchworkGallerySkeleton({
  count = 6,
}: PatchworkGallerySkeletonProps) {
  return (
    <div className="space-y-4 font-body">
      {/* Header skeleton */}
      <div className="flex items-center justify-between border-b border-line-trace/60 pb-3">
        <Skeleton className="h-4 w-52 rounded-md" />
      </div>

      {/* Grid pattern card skeletons */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col overflow-hidden rounded-xl border border-brand-black/15 bg-canvas-pure"
          >
            {/* Image Thumbnail Skeleton */}
            <div className="relative aspect-square w-full overflow-hidden bg-canvas-warm/50">
              <Skeleton className="size-full rounded-none" />
            </div>

            {/* Card Content Footer Skeleton */}
            <div className="flex flex-1 flex-col justify-between p-3.5 space-y-3">
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-full rounded" />
                <Skeleton className="h-3 w-2/3 rounded" />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-line-trace/60">
                <Skeleton className="h-3 w-16 rounded" />
                <Skeleton className="h-7 w-24 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
