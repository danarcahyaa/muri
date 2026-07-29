"use client";

import { useState, useRef, useEffect, type ReactElement } from "react";
import { useSourcingMaterials } from "@/hooks/useSourcingMaterials";
import { useSavedMaterials } from "@/hooks/useSavedMaterials";
import { SourcingToolbar } from "@/components/brand/sourcing/SourcingToolbar";
import { SourcingActiveFilters } from "@/components/brand/sourcing/sourcing-active-filters";
import { SourcingEmptyState } from "@/components/brand/sourcing/sourcing-empty-state";
import { SourcingSkeletonGrid } from "@/components/brand/sourcing/sourcing-skeleton-grid";
import { MaterialCard } from "@/components/brand/sourcing/material-card";
import { SavedMaterialsList } from "@/components/brand/sourcing/saved-materials-list";
import { Sheet, SheetContent } from "@/components/ui/Sheet";
import { Bookmark, Loader2 } from "lucide-react";

export default function BrandSourcingSearchPage(): ReactElement {
  const {
    wastePosts,
    isLoading: isLoadingPosts,
    isLoadingMore,
    error: postsError,
    filters,
    setFilters,
    localSearch,
    setLocalSearch,
    handleSearchExecute,
    hasMore,
    loadMore,
  } = useSourcingMaterials();

  const {
    savedItems,
    savedPostIds,
    isLoading: isLoadingSaved,
    toggleSave,
    unsave,
  } = useSavedMaterials();

  const [savedDrawerOpen, setSavedDrawerOpen] = useState<boolean>(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Infinite Scroll IntersectionObserver
  useEffect(() => {
    if (!sentinelRef.current || !hasMore || isLoadingPosts || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: "120px" }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoadingPosts, isLoadingMore, loadMore]);

  const handleClearAllFilters = () => {
    setLocalSearch("");
    setFilters({
      searchQuery: "",
      minPrice: undefined,
      maxPrice: undefined,
      minOrderKg: undefined,
      categoryNames: [],
    });
  };

  const hasActiveFilters =
    Boolean(filters.searchQuery) ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    filters.minOrderKg !== undefined ||
    (filters.categoryNames?.length || 0) > 0;

  return (
    <div className="mx-auto w-full max-w-[1320px] px-5 py-8 sm:px-6 lg:px-8 lg:py-10 space-y-8 font-body">
      {/* Right Edge Sticky Bookmark Drawer Trigger Tab */}
      <button
        type="button"
        onClick={() => setSavedDrawerOpen(true)}
        className="fixed right-0 top-15 z-40 flex items-center gap-2 rounded-l-lg border border-r-0 border-line-trace bg-brand-black text-white px-3.5 py-3 text-xs font-semibold shadow-xl hover:bg-brand-forest transition-all cursor-pointer group select-none"
        title="Lihat Limbah Tersimpan"
        aria-label="Tampilkan Limbah Tersimpan"
      >
        <Bookmark className="size-4 fill-current group-hover:scale-110 transition-transform" />
        <span className="font-display font-medium tracking-wide">
          Disimpan ({savedItems.length})
        </span>
      </button>

      {/* Saved Waste Right-Side Drawer (Sheet) */}
      <Sheet open={savedDrawerOpen} onOpenChange={setSavedDrawerOpen}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="bg-canvas-pure border-l border-line-trace p-0 font-body w-full sm:max-w-md"
        >
          <div className="h-full flex flex-col p-4 sm:p-5">
            <SavedMaterialsList
              items={savedItems}
              isLoading={isLoadingSaved}
              onUnsave={unsave}
              onHide={() => setSavedDrawerOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-brand-black tracking-tight font-display">
              Cari Limbah
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-moss mt-1.5">
            Temukan sisa bahan baku limbah kain dari pabrik atau garmen.
          </p>
        </div>
      </div>

      {/* Error Banner */}
      {postsError && (
        <div className="p-4 rounded-md bg-error-rust/10 border border-error-rust/20 text-error-rust text-xs font-medium">
          {postsError}
        </div>
      )}

      {/* Full-Width Explore & Search Section */}
      <div className="space-y-5">
        {/* Toolbar */}
        <SourcingToolbar
          localSearch={localSearch}
          setLocalSearch={setLocalSearch}
          filters={filters}
          setFilters={setFilters}
          onSearchExecute={handleSearchExecute}
        />

        {/* Active Filter Tags Component */}
        {hasActiveFilters && (
          <SourcingActiveFilters
            filters={filters}
            setFilters={setFilters}
            setLocalSearch={setLocalSearch}
            onClearAll={handleClearAllFilters}
          />
        )}

        {/* Material Cards Grid / Skeleton / Empty State */}
        {isLoadingPosts ? (
          <SourcingSkeletonGrid count={8} />
        ) : wastePosts.length === 0 ? (
          <SourcingEmptyState
            hasActiveFilters={hasActiveFilters}
            onResetFilters={handleClearAllFilters}
          />
        ) : (
          /* Material Cards List & Scroll Pagination Sentinel */
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {wastePosts.map((post) => (
                <MaterialCard
                  key={post.id}
                  item={post}
                  isSaved={savedPostIds.has(post.id)}
                  onToggleSave={toggleSave}
                />
              ))}
            </div>

            {/* Infinite Scroll Sentinel & Loading Indicator */}
            <div
              ref={sentinelRef}
              className="py-4 flex flex-col items-center justify-center text-center space-y-2 min-h-[48px]"
            >
              {isLoadingMore && (
                <div className="flex items-center gap-2 text-xs text-muted-moss font-medium">
                  <Loader2 className="size-4 animate-spin text-brand-forest" />
                  <span>Memuat material lainnya...</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
