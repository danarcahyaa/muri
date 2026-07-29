"use client";

import { type ReactElement } from "react";
import { SavedMaterialCard } from "./saved-material-card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Bookmark, PanelRightClose } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { SavedWastePostItem } from "@/types/sourcing";

interface SavedMaterialsListProps {
  items: SavedWastePostItem[];
  isLoading: boolean;
  onUnsave: (wastePostId: string) => void;
  onHide?: () => void;
}

export function SavedMaterialsList({
  items,
  isLoading,
  onUnsave,
  onHide,
}: SavedMaterialsListProps): ReactElement {
  return (
    <div className="flex flex-col h-full bg-canvas-pure  sm:p-3 font-body space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-line-trace/60 pb-3">
        <div className="flex items-center gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-base text-brand-black tracking-tight">
                Disimpan
              </h2>
              <Badge variant="secondary" className="px-2 py-0.5 text-[10px] font-bold font-mono">
                {items.length}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-moss">
              Daftar bahan baku limbah pilihan Anda
            </p>
          </div>
        </div>

        {onHide && (
          <button
            type="button"
            onClick={onHide}
            title="Tutup panel simpanan"
            aria-label="Tutup panel simpanan"
            className="p-1.5 rounded-sm text-muted-moss hover:text-brand-black hover:bg-canvas-warm transition-colors"
          >
            <PanelRightClose className="size-4" />
          </button>
        )}
      </div>

      {/* Content Body */}
      <div className="flex-1 min-h-[300px] overflow-y-auto space-y-2.5 pr-1 muri-scrollbar">
        {isLoading ? (
          /* Loading Skeleton */
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 border border-line-trace/40 rounded-lg">
              <Skeleton className="size-16 rounded-md shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))
        ) : items.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center text-center p-8 min-h-[280px] space-y-3">
            <div className="size-12 rounded-full bg-muted-moss/5 flex items-center justify-center ">
              <Bookmark className="size-6 text-muted-moss/90" />
            </div>
            <div className="max-w-xs space-y-1">
              <h3 className="font-display font-bold text-sm text-brand-black">
                Belum Ada Limbah Tersimpan
              </h3>
              <p className="text-xs text-muted-moss leading-relaxed">
                Klik ikon bookmark pada card material di sebelah kanan untuk menyimpannya di sini.
              </p>
            </div>
          </div>
        ) : (
          /* List Items */
          items.map((savedItem) => (
            <SavedMaterialCard
              key={savedItem.id}
              item={savedItem}
              onUnsave={onUnsave}
            />
          ))
        )}
      </div>
    </div>
  );
}
