"use client";

import { useState, useEffect, type ReactElement } from "react";
import { Badge } from "@/components/ui/Badge";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { Film, ImageOff } from "lucide-react";
import type { SourcingMediaItem } from "@/types/sourcing";

interface WasteImageGalleryProps {
  mediaList: SourcingMediaItem[];
  customFabricName: string;
  categoryName: string;
  fallbackImageUrl?: string;
}

export function WasteImageGallery({
  mediaList,
  customFabricName,
  categoryName,
}: WasteImageGalleryProps): ReactElement {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [mediaList]);

  const activeMedia: SourcingMediaItem | undefined = mediaList[selectedIndex];
  const activeUrl = activeMedia?.url || null;
  const isVideo = activeMedia?.type === "video";

  return (
    <div className="space-y-4">
      {/* Main Display Container */}
      <div className="relative w-full aspect-4/3 sm:aspect-16/10 rounded-2xl border border-brand-black/15 bg-canvas-warm/50 overflow-hidden group">
        {isVideo ? (
          <video
            src={activeMedia?.url || ""}
            controls
            autoPlay
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          <ImageWithFallback
            src={activeUrl}
            alt={customFabricName}
            fallbackTitle={customFabricName}
            fill
            sizes="(min-width: 1024px) 600px, 100vw"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}

        {/* Category Badge Top Left */}
        <div className="absolute top-4 left-4 z-10">
          <Badge className="bg-canvas-pure/95 text-brand-black backdrop-blur-md font-bold px-3 py-1 text-xs border border-brand-black/15 rounded-full shadow-none">
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
                onClick={() => setSelectedIndex(idx)}
                className={`relative w-20 h-20 aspect-square rounded-xl overflow-hidden shrink-0 border transition-all duration-200 cursor-pointer ${
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
                  <ImageWithFallback
                    src={item.url}
                    alt={`${customFabricName} thumbnail ${idx + 1}`}
                    fill
                    sizes="80px"
                    className="size-full object-cover"
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
