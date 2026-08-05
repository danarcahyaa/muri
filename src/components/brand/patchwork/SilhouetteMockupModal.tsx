"use client";

import { useState, useEffect } from "react";
import { Check, Grid, Layers, Shirt, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { SavedBrandPattern } from "@/services/brand/patchworkService";
import { SilhouetteCanvasVisualizer } from "./SilhouetteCanvasVisualizer";

interface SilhouetteMockupModalProps {
  isOpen: boolean;
  onClose: () => void;
  patterns: SavedBrandPattern[];
  initialPattern?: SavedBrandPattern | null;
  onSelectPattern?: (pattern: SavedBrandPattern) => void;
}

export function SilhouetteMockupModal({
  isOpen,
  onClose,
  patterns,
  initialPattern,
  onSelectPattern,
}: SilhouetteMockupModalProps) {
  const [activePattern, setActivePattern] = useState<SavedBrandPattern | null>(
    initialPattern ?? patterns[0] ?? null
  );

  useEffect(() => {
    if (initialPattern) {
      setActivePattern(initialPattern);
    } else if (patterns.length > 0 && !activePattern) {
      setActivePattern(patterns[0]);
    }
  }, [initialPattern, patterns]);

  if (!isOpen) return null;

  const handleSelect = (pattern: SavedBrandPattern) => {
    setActivePattern(pattern);
    if (onSelectPattern) {
      onSelectPattern(pattern);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 sm:p-6 backdrop-blur-sm animate-in fade-in-0 cursor-pointer font-body overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-brand-black/15 bg-canvas-pure shadow-2xl cursor-default my-auto max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-line-trace bg-canvas-warm/50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-brand-forest text-brand-lime shadow-xs">
              <Shirt className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-base font-bold text-brand-black">
                  2D Apparel Mockup Visualizer Studio
                </h3>
              </div>
              <p className="text-xs text-muted-moss">
                Proyeksi tekstur pola seamless pada mockup T-Shirt dan Sweatshirt MURI.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-full border border-brand-black/15 bg-white text-muted-moss hover:bg-canvas-warm hover:text-brand-black transition cursor-pointer"
            title="Tutup Modal"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Main Visualizer Area */}
          <SilhouetteCanvasVisualizer
            patternUrl={activePattern?.generatedDesignUrl ?? null}
            patternTitle={activePattern?.promptText ?? null}
          />

          {/* Pattern Selector Carousel / Grid Section */}
          {patterns.length > 0 && (
            <div className="rounded-xl border border-brand-black/15 bg-canvas-warm/40 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-line-trace/60 pb-2 text-xs">
                <div className="flex items-center gap-2">
                  <Grid className="size-4 text-brand-forest" />
                  <span className="font-bold text-brand-black">
                    Pilih Pola Seamless untuk Diproyeksikan ({patterns.length})
                  </span>
                </div>
                {activePattern && (
                  <span className="text-[11px] text-muted-moss truncate max-w-[240px]">
                    Aktif: <strong className="text-brand-black">{activePattern.promptText ?? "Pola Seamless"}</strong>
                  </span>
                )}
              </div>

              {/* Horizontal Scrollable Thumbnails List */}
              <div className="flex gap-3 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-brand-forest/20">
                {patterns.map((pattern) => {
                  const isSelected = activePattern?.id === pattern.id;

                  return (
                    <button
                      key={pattern.id}
                      type="button"
                      onClick={() => handleSelect(pattern)}
                      className={`
                        group relative flex shrink-0 w-24 flex-col overflow-hidden rounded-lg border bg-white p-1 text-left transition cursor-pointer
                        ${
                          isSelected
                            ? "border-brand-emerald bg-brand-emerald/5"
                            : "border-brand-black/15 hover:border-brand-forest"
                        }
                      `}
                    >
                      <div className="relative aspect-square w-full overflow-hidden rounded-md bg-canvas-warm">
                        <img
                          src={pattern.generatedDesignUrl}
                          alt={pattern.promptText ?? "Pola"}
                          className="size-full object-cover transition group-hover:scale-105"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-brand-forest/20 flex items-center justify-center">
                            <div className="flex size-6 items-center justify-center rounded-full bg-brand-forest text-brand-lime shadow-xs">
                              <Check className="size-3.5 stroke-[3]" />
                            </div>
                          </div>
                        )}
                      </div>
                      <span className="line-clamp-1 text-[10px] font-medium text-brand-black px-0.5">
                        {pattern.promptText ?? "Seamless Pattern"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-line-trace bg-canvas-warm/50 px-6 py-3">
          <span className="text-xs text-muted-moss">
            Klik pola di atas untuk mengganti motif proyeksi pada kaos secara langsung.
          </span>
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs font-bold px-4">
            Selesai
          </Button>
        </div>
      </div>
    </div>
  );
}
