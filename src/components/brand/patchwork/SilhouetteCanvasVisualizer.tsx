"use client";

import { useId, useState } from "react";
import {
  Grid,
  Layers,
  Minus,
  Plus,
  RefreshCw,
  Shirt,
  Sparkles,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface SilhouetteCanvasVisualizerProps {
  patternUrl: string | null;
  patternTitle?: string | null;
  onGoToGenerator?: () => void;
}

export function SilhouetteCanvasVisualizer({
  patternUrl,
  patternTitle,
  onGoToGenerator,
}: SilhouetteCanvasVisualizerProps) {
  const patternId = useId();

  const [zoomLevel, setZoomLevel] = useState<number>(100); // 50% to 200%
  const [tileRepeat, setTileRepeat] = useState<number>(3); // Pattern repeat count
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);

  // Fallback pattern image if patternUrl is null
  const activeImageUrl =
    patternUrl ??
    "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80";

  const resetView = () => {
    setZoomLevel(100);
    setTileRepeat(3);
    setOffsetX(0);
    setOffsetY(0);
  };

  // Calculate pattern tile size based on tileRepeat and zoomLevel
  const tileSize = (500 / tileRepeat) * (zoomLevel / 100);

  return (
    <div className="space-y-4 font-body">
      {/* Top Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-display text-base font-bold text-brand-black">
            2D T-Shirt Mockup Visualizer
          </h3>
          <p className="text-xs text-muted-moss">
            Proyeksi tekstur pola seamless presisi pada mockup t-shirt MURI.
          </p>
        </div>
      </div>

      {/* Top Zoom Control Bar (Minus on Left, Slider for Pattern Zoom, Plus on Right) */}
      <div className="flex items-center gap-3 rounded-xl border border-brand-black/15 bg-white px-4 py-2.5 shadow-xs">
        <ZoomOut className="size-4 shrink-0 text-muted-moss" />
        <span className="text-xs font-semibold text-brand-black shrink-0">Zoom Skala Motif:</span>
        <input
          type="range"
          min={50}
          max={200}
          value={zoomLevel}
          onChange={(e) => setZoomLevel(parseInt(e.target.value, 10))}
          className="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-line-trace accent-error-rust transition hover:accent-brand-forest"
          title="Zoom Skala Motif Pattern"
        />
        <ZoomIn className="size-4 shrink-0 text-muted-moss" />
        <span className="ml-2 min-w-[42px] font-mono text-xs font-bold text-brand-black">
          {zoomLevel}%
        </span>
      </div>

      {/* Viewport Canvas: Clean Pure White Background */}
      <div className="relative flex h-[480px] w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-brand-black/15 bg-white p-3 shadow-inner">
        <div className="relative flex size-full items-center justify-center">
          <svg
            width="500"
            height="500"
            viewBox="70 60 360 380"
            className="h-full w-auto drop-shadow-xl select-none max-h-[450px]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Pattern for Tiling Seamless Texture */}
              <pattern
                id={patternId}
                patternUnits="userSpaceOnUse"
                width={tileSize}
                height={tileSize}
                x={offsetX}
                y={offsetY}
              >
                <image
                  href={activeImageUrl}
                  width={tileSize}
                  height={tileSize}
                  preserveAspectRatio="xMidYMid slice"
                />
              </pattern>
            </defs>

            {/* 1. Seamless Pattern Fill Layer */}
            <rect
              width="500"
              height="500"
              fill={`url(#${patternId})`}
            />

            {/* 2. Real T-Shirt Cutout Mockup Frame Overlay (shirt.webp) */}
            <image
              href="/images/mockups/shirt.webp"
              width="500"
              height="500"
              preserveAspectRatio="xMidYMid meet"
            />
          </svg>
        </div>
      </div>


      {/* Additional Controls Bar */}
      <div className="rounded-xl border border-brand-black/15 bg-canvas-pure p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-line-trace pb-2.5 text-xs">
          <span className="font-bold text-brand-black">Pengaturan Repetisi Tekstur Seamless</span>
          <button
            type="button"
            onClick={resetView}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-emerald hover:underline cursor-pointer"
          >
            <RefreshCw className="size-3" /> Reset Mockup
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 text-xs">
          {/* Tile Repeat Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-muted-moss">
              <span className="font-medium">Ukuran Repetisi Motif</span>
              <span className="font-mono font-bold text-brand-black">{tileRepeat}x{tileRepeat}</span>
            </div>
            <input
              type="range"
              min={1}
              max={6}
              step={1}
              value={tileRepeat}
              onChange={(e) => setTileRepeat(parseInt(e.target.value, 10))}
              className="w-full accent-brand-forest cursor-pointer"
            />
          </div>

          {/* Offset Pan X */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-muted-moss">
              <span className="font-medium">Geser Posisi Motif (X)</span>
              <span className="font-mono font-bold text-brand-black">{offsetX}px</span>
            </div>
            <input
              type="range"
              min={-100}
              max={100}
              step={5}
              value={offsetX}
              onChange={(e) => setOffsetX(parseInt(e.target.value, 10))}
              className="w-full accent-brand-forest cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
