"use client";

import { useState } from "react";
import {
  Check,
  Download,
  Grid,
  Layers,
  LoaderCircle,
  Maximize2,
  Shirt,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { SavedBrandPattern } from "@/services/brand/patchworkService";
import { PatchworkGallerySkeleton } from "./PatchworkGallerySkeleton";
import { SeamlessTileTester } from "./SeamlessTileTester";
import { SilhouetteMockupModal } from "./SilhouetteMockupModal";

interface PatternedAIPatternsTabProps {
  patterns: SavedBrandPattern[];
  isLoading: boolean;
  activePatternId: string | null;
  onSelectPattern: (pattern: SavedBrandPattern) => void;
  onDeletePattern: (patternId: string) => Promise<void>;
  deletingId: string | null;
}

export function PatternedAIPatternsTab({
  patterns,
  isLoading,
  activePatternId,
  onSelectPattern,
  onDeletePattern,
  deletingId,
}: PatternedAIPatternsTabProps) {
  const [testingPatternUrl, setTestingPatternUrl] = useState<string | null>(null);
  const [testingPatternTitle, setTestingPatternTitle] = useState<string | null>(null);
  const [mockupPattern, setMockupPattern] = useState<SavedBrandPattern | null>(null);
  const [viewMode, setViewMode] = useState<"card" | "repeat">("card");

  if (isLoading) {
    return <PatchworkGallerySkeleton count={6} />;
  }

  if (patterns.length === 0) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center rounded-xl border border-dashed border-brand-black/15 bg-canvas-warm/40 p-8 text-center font-body">
        <div className="flex size-12 items-center justify-center rounded-full bg-canvas-warm text-muted-moss">
          <Layers className="size-6" />
        </div>
        <h4 className="mt-4 font-display text-base font-bold text-brand-black">
          Belum Ada Pola Seamless Tersimpan
        </h4>
        <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-moss">
          Gunakan kontrol di panel kiri untuk me-generate pola *seamless tile* pertama Anda dengan kecerdasan AI.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-body">
      {/* Gallery Header Controls */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-line-trace/60 pb-3">
        <p className="text-xs text-muted-moss">
          Total <span className="font-bold text-brand-black">{patterns.length}</span> pola seamless tersimpan.
        </p>
      </div>

      {/* Grid Pattern Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {patterns.map((pattern) => {
          const isApplied = activePatternId === pattern.id;
          const isDeleting = deletingId === pattern.id;

          return (
            <div
              key={pattern.id}
              className={`
                group relative flex flex-col overflow-hidden rounded-xl border bg-canvas-pure transition duration-200
                ${
                  isApplied
                    ? "border-brand-emerald bg-brand-emerald/5 shadow-2xs"
                    : "border-brand-black/15 hover:border-brand-forest hover:shadow-2xs"
                }
              `}
            >
              {/* Pattern Image Preview (Supports Repeat 3x3 mode toggle) */}
              <div className="relative aspect-square w-full overflow-hidden bg-canvas-warm/50">
                {viewMode === "repeat" ? (
                  <div className="grid grid-cols-3 grid-rows-3 size-full">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <img
                        key={i}
                        src={pattern.generatedDesignUrl}
                        alt=""
                        className="size-full object-cover"
                      />
                    ))}
                  </div>
                ) : (
                  <img
                    src={pattern.generatedDesignUrl}
                    alt={pattern.promptText ?? "Seamless Pattern"}
                    className="size-full object-cover transition duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                )}

                {/* Badge if applied */}
                {isApplied && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-brand-forest px-2.5 py-1 text-[10px] font-bold text-white shadow-xs">
                    <Check className="size-3 text-brand-lime" />
                    <span>Aktif di Mockup</span>
                  </div>
                )}

                {/* Quick Actions Hover Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 p-2 backdrop-blur-2xs">
                  <button
                    type="button"
                    onClick={() => {
                      setTestingPatternUrl(pattern.generatedDesignUrl);
                      setTestingPatternTitle(pattern.promptText ?? null);
                    }}
                    title="Uji Seamless Tiling"
                    className="flex size-9 items-center justify-center rounded-full bg-white/90 text-brand-black hover:bg-brand-lime transition cursor-pointer shadow-sm"
                  >
                    <Grid className="size-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectPattern(pattern);
                      setMockupPattern(pattern);
                    }}
                    title="Pratinjau di Mockup 2D"
                    className="flex size-9 items-center justify-center rounded-full bg-brand-forest text-white hover:bg-brand-black transition cursor-pointer shadow-sm"
                  >
                    <Shirt className="size-4 text-brand-lime" />
                  </button>

                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => void onDeletePattern(pattern.id)}
                    title="Hapus Pola"
                    className="flex size-9 items-center justify-center rounded-full bg-error-rust text-white hover:bg-error-rust/90 transition cursor-pointer shadow-sm"
                  >
                    {isDeleting ? (
                      <LoaderCircle className="size-4 animate-spin" />
                    ) : (
                      <Trash2 className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Card Footer Info & Buttons */}
              <div className="flex flex-1 flex-col justify-between p-3.5 space-y-3">
                {pattern.promptText && (
                  <p className="line-clamp-2 text-xs leading-relaxed text-brand-black font-medium">
                    {pattern.promptText}
                  </p>
                )}

                <div className="flex items-center gap-2 pt-2 border-t border-line-trace/60">
                  <button
                    type="button"
                    onClick={() => {
                      setTestingPatternUrl(pattern.generatedDesignUrl);
                      setTestingPatternTitle(pattern.promptText ?? null);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-forest hover:underline cursor-pointer"
                  >
                    <Grid className="size-3" /> 
                  </button>

                  <Button
                    type="button"
                    variant="solid-lime"
                    size="sm"
                    onClick={() => {
                      onSelectPattern(pattern);
                      setMockupPattern(pattern);
                    }}
                    className="text-[11px] font-bold py-1 px-2.5 h-7 flex items-center gap-1"
                  >
                    <Shirt className="size-3" />
                    <span>Mockup 2D</span>
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Seamless Tile Tester Modal */}
      {testingPatternUrl && (
        <SeamlessTileTester
          imageUrl={testingPatternUrl}
          patternTitle={testingPatternTitle}
          isOpen={Boolean(testingPatternUrl)}
          onClose={() => setTestingPatternUrl(null)}
        />
      )}

      {/* Silhouette 2D Mockup Modal with Pattern Switcher */}
      {mockupPattern && (
        <SilhouetteMockupModal
          isOpen={Boolean(mockupPattern)}
          onClose={() => setMockupPattern(null)}
          patterns={patterns}
          initialPattern={mockupPattern}
          onSelectPattern={(pattern) => {
            onSelectPattern(pattern);
            setMockupPattern(pattern);
          }}
        />
      )}
    </div>
  );
}
