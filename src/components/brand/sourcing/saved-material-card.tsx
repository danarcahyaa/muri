"use client";

import { type ReactElement } from "react";
import { Button } from "@/components/ui/Button";
import { Trash2, Store, Package, Bookmark, BookMarkedIcon, BookmarkX } from "lucide-react";
import { formatCurrencyIDR, formatWeightKg } from "@/lib/formatter";
import type { SavedWastePostItem } from "@/types/sourcing";

interface SavedMaterialCardProps {
  item: SavedWastePostItem;
  onUnsave: (wastePostId: string) => void;
}

export function SavedMaterialCard({
  item,
  onUnsave,
}: SavedMaterialCardProps): ReactElement {
  const wp = item.wastePost;
  const fallbackImage =
    "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=600&auto=format&fit=crop";

  return (
    <div className="flex items-center gap-3 py-2 pb-4 bg-canvas-pure hover:border-brand-emerald/40 transition-colors group font-body">
      {/* Thumbnail */}
      <div className="relative size-16 shrink-0 rounded-md overflow-hidden bg-canvas-warm/60">
        <img
          src={wp.imageUrl || fallbackImage}
          alt={wp.customFabricName}
          className="size-full object-cover group-hover:scale-105 transition-transform duration-200"
          onError={(e) => {
            (e.target as HTMLImageElement).src = fallbackImage;
          }}
        />
      </div>

      {/* Content Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <Store className="size-2.5 text-brand-forest" />
          <span className="text-xs text-brand-forest font-display">{wp.providerName}</span>
        </div>
        <h4 className="font-display font-bold text-sm text-brand-black truncate mt-0.5" title={wp.customFabricName}>
          {wp.customFabricName}
        </h4>

        <div className="flex items-center justify-between gap-2 mt-1">
          <span className="text-xs font-bold text-brand-forest font-display">
            {formatCurrencyIDR(wp.pricePerKg)} <span className="font-light text-muted-moss">/kg</span>
          </span>
          <span className="text-[12px] text-muted-moss">
            Min.beli <span className="font-bold">{formatWeightKg(wp.minimumOrderKg)}</span>
          </span>
        </div>
      </div>

      {/* Unsave Button */}
      {/* <div className="px-3.5 py-1.5 rounded-md bg-black"> */}
        <Bookmark className="size-5 fill-current cursor-pointer" onClick={() => onUnsave(wp.id)}/>
      {/* </div> */}
    </div>
  );
}
