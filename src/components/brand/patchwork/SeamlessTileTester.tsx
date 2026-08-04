"use client";

import { useState } from "react";
import {
  Check,
  Copy,
  Download,
  Eye,
  Grid,
  Maximize2,
  Minimize2,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface SeamlessTileTesterProps {
  imageUrl: string;
  patternTitle?: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SeamlessTileTester({
  imageUrl,
  patternTitle,
  isOpen,
  onClose,
}: SeamlessTileTesterProps) {
  const [repeatCount, setRepeatCount] = useState<number>(3); // 3x3 grid by default
  const [showGridLines, setShowGridLines] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(imageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownloadHD = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `muri-seamless-pattern-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in-0 cursor-pointer font-body"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-brand-black/20 bg-canvas-pure cursor-default shadow-2xl"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-line-trace bg-canvas-warm/60 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-brand-forest text-brand-lime">
              <Grid className="size-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-brand-black">
                Pola Patchwork
              </h3>
              <p className="text-xs text-muted-moss">
                Uji kontinuitas sambungan seamless pola dalam kisi pengulangan real-time.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal"
            className="flex size-8 items-center justify-center rounded-full bg-canvas-warm text-brand-black transition hover:bg-line-trace cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Seamless Grid Viewport */}
        <div className="relative flex-1 overflow-auto bg-canvas-warm/40 p-6 flex items-center justify-center min-h-[380px]">
          <div
            className={`grid gap-0 overflow-hidden rounded-xl border transition-all duration-300 shadow-md ${
              showGridLines ? "border-dashed border-brand-emerald" : "border-transparent"
            }`}
            style={{
              gridTemplateColumns: `repeat(${repeatCount}, minmax(0, 1fr))`,
              width: "100%",
              maxWidth: repeatCount === 1 ? "360px" : repeatCount === 2 ? "520px" : "680px",
            }}
          >
            {Array.from({ length: repeatCount * repeatCount }).map((_, idx) => (
              <div
                key={idx}
                className={`relative aspect-square overflow-hidden ${
                  showGridLines ? "border border-brand-emerald/40" : ""
                }`}
              >
                <img
                  src={imageUrl}
                  alt={`Tile ${idx + 1}`}
                  className="size-full object-cover select-none pointer-events-none"
                />
              </div>
            ))}
          </div>

          {/* Floating Live Badge */}
          <div className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full bg-black/65 px-3 py-1 text-xs font-semibold text-white backdrop-blur-xs">
            <Sparkles className="size-3.5 text-brand-lime" />
            <span>Kisi {repeatCount}x{repeatCount} ({repeatCount * repeatCount} Ubin)</span>
          </div>
        </div>

        {/* Toolbar Controls & Actions */}
        <div className="shrink-0 flex flex-col gap-4 border-t border-line-trace bg-canvas-pure px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-4 text-xs">
            {/* Grid Count Selector */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-brand-black">Repetisi:</span>
              <div className="inline-flex rounded-lg border border-brand-black/15 bg-canvas-warm p-0.5">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setRepeatCount(num)}
                    className={`rounded-md px-2.5 py-1 font-mono font-bold transition cursor-pointer ${
                      repeatCount === num
                        ? "bg-brand-forest text-white shadow-2xs"
                        : "text-muted-moss hover:text-brand-black"
                    }`}
                  >
                    {num}x{num}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid Lines Toggle */}
            <button
              type="button"
              onClick={() => setShowGridLines(!showGridLines)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-bold transition cursor-pointer ${
                showGridLines
                  ? "border-brand-emerald bg-brand-lime/30 text-brand-forest"
                  : "border-brand-black/15 bg-canvas-warm text-brand-black hover:bg-canvas-pure"
              }`}
            >
              <Grid className="size-3.5" />
              <span>{showGridLines ? "Aktif" : "Tidak Aktif"}</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
           
            <Button
              variant="solid-lime"
              size="sm"
              type="button"
              onClick={handleDownloadHD}
              className="text-xs font-bold"
            >
              <Download className="size-3.5" /> Unduh Gambar HD
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
