"use client";

import { type ReactElement } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Bookmark, Store } from "lucide-react";
import { formatCurrencyIDR, formatWeightKg } from "@/lib/formatter";
import type { SourcingWastePostItem } from "@/types/sourcing";

interface MaterialCardProps {
  item: SourcingWastePostItem;
  isSaved?: boolean;
  onToggleSave?: (item: SourcingWastePostItem) => void;
  onSelect?: (item: SourcingWastePostItem) => void;
}

export function MaterialCard({
  item,
  isSaved = false,
  onToggleSave,
  onSelect,
}: MaterialCardProps): ReactElement {
  const fallbackImage =
    "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=600&auto=format&fit=crop";

  return (
    <Card
      onClick={() => onSelect?.(item)}
      className="group overflow-hidden flex flex-col rounded-md border border-brand-black/15 bg-canvas-pure hover:border-brand-forest/60 transition-all duration-200 shadow-none cursor-pointer"
    >
      {/* Thumbnail Image Container */}
      <div className="relative w-full aspect-3/2 bg-canvas-warm/50 overflow-hidden">
        <img
          src={item.imageUrl || fallbackImage}
          alt={item.customFabricName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = fallbackImage;
          }}
        />

        {/* Fabric Category Badge Top-Left */}
        <div className="absolute top-2.5 left-2.5">
          <Badge variant="secondary" className="bg-canvas-pure/90 text-brand-black backdrop-blur-xs font-bold border border-brand-black/15 rounded-sm shadow-none">
            {item.categoryName}
          </Badge>
        </div>

        {/* Bookmark Button Top-Right */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave?.(item);
          }}
          title={isSaved ? "Hapus dari simpanan" : "Simpan material"}
          aria-label={isSaved ? "Hapus dari simpanan" : "Simpan material"}
          className={`absolute top-2.5 right-2.5 p-1.5 rounded-sm backdrop-blur-md transition-all ${
            isSaved
              ? "bg-brand-black text-white shadow-none"
              : "bg-canvas-pure/90 text-brand-black hover:bg-canvas-pure hover:text-brand-forest border border-brand-black/15 shadow-none"
          }`}
        >
          <Bookmark
            className={`size-4 ${isSaved ? "fill-current" : ""} cursor-pointer`}
          />
        </button>
      </div>

      {/* Card Content */}
      <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Provider Name */}
          <div className="flex items-center gap-1.5 text-[11px] text-muted-moss font-medium mb-1">
            <Store className="size-2.5 text-brand-forest shrink-0" />
            <span className="truncate">{item.providerName}</span>
          </div>

          {/* Fabric Title */}
          <h3 className="font-display font-bold text-sm text-brand-black line-clamp-1 group-hover:text-brand-forest transition-colors">
            {item.customFabricName}
          </h3>

          {/* Price per Kg */}
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-base font-bold text-brand-forest">
              {formatCurrencyIDR(item.pricePerKg)}
            </span>
            <span className="text-[11px] text-muted-moss">/ kg</span>
          </div>
        </div>

        {/* Specs Weight & Min Order */}
        <div className="flex justify-between gap-2 pt-2 border-t border-line-trace/40 text-[11px] text-brand-black/80">
            <span>Stok <strong className="font-semibold text-brand-black">{formatWeightKg(item.weightKg)}</strong></span>
            <span>Min.beli <strong className="font-semibold text-brand-black">{formatWeightKg(item.minimumOrderKg)}</strong></span>
        </div>
      </CardContent>

     
    </Card>
  );
}
