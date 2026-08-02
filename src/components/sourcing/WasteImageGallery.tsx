"use client";

import { useState, useEffect, type ReactElement } from "react";
import { Badge } from "@/components/ui/Badge";
import { Film, ImageOff } from "lucide-react";
import type { SourcingMediaItem } from "@/types/sourcing";

interface WasteImageGalleryProps {
  mediaList: SourcingMediaItem[];
  customFabricName: string;
  categoryName: string;
  fallbackImageUrl?: string;
}

const DEFAULT_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=1200&auto=format&fit=crop";

export function WasteImageGallery({
  mediaList,
  customFabricName,
  categoryName,
  fallbackImageUrl = DEFAULT_FALLBACK_IMAGE,
}: WasteImageGalleryProps): ReactElement {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [hasImageError, setHasImageError] = useState<boolean>(false);

  useEffect(() => {
    setSelectedIndex(0);
    setHasImageError(false);
  }, [mediaList]);

  const activeMedia: SourcingMediaItem | undefined = mediaList[selectedIndex];
  const activeUrl = activeMedia?.url || fallbackImageUrl;
  const isVideo = activeMedia?.type === "video";

  return (
    <div className="space-y-4">
      {/* Main Display Container */}
      <div className="relative w-full aspect-4/3 sm:aspect-16/10 rounded-md border border-brand-black/15 bg-canvas-warm/50 overflow-hidden group">
        {isVideo ? (
          <video
            src={activeUrl}
            controls
            autoPlay
            muted
            className="w-full h-full object-cover"
          />
        ) : hasImageError ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-canvas-warm text-muted-moss p-6">
            <ImageOff className="size-12 mb-2 stroke-[1.5]" />
            <p className="text-xs font-medium">Gambar tidak tersedia</p>
          </div>
        ) : (
          <img
            src={activeUrl}
            alt={customFabricName}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setHasImageError(true)}
          />
        )}

        {/* Category Badge Top Left */}
        <div className="absolute top-4 left-4 z-10">
          <Badge className="bg-canvas-pure/95 text-brand-black backdrop-blur-md font-bold px-3 py-1 text-xs border border-brand-black/15 rounded-sm shadow-none">
            {categoryName}
          </Badge>
        </div>
      </div>

      {/* Thumbnails Row */}
      {mediaList.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {mediaList.map((item, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSelectedIndex(idx);
                  setHasImageError(false);
                }}
                className={`relative w-20 h-20 aspect-square rounded-sm overflow-hidden shrink-0 border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "border-brand-forest ring-2 ring-brand-forest/30 scale-95"
                    : "border-brand-black/15 opacity-70 hover:opacity-100 hover:border-brand-forest/60"
                }`}
                title={`Lihat media ${idx + 1}`}
              >
                {item.type === "video" ? (
                  <div className="relative size-full bg-black/40">
                    <video
                      src={item.url}
                      className="size-full object-cover"
                      muted
                      preload="metadata"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <Film className="size-5 text-white" />
                    </div>
                  </div>
                ) : (
                  <img
                    src={item.url}
                    alt={`${customFabricName} thumbnail ${idx + 1}`}
                    className="size-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = fallbackImageUrl;
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
