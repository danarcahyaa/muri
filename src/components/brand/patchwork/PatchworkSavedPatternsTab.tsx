"use client";

import { Check, Layers, LoaderCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { SavedBrandPattern } from "@/services/brand/patchworkService";
import { PatchworkGallerySkeleton } from "./PatchworkGallerySkeleton";

interface PatchworkSavedPatternsTabProps {
  patterns: SavedBrandPattern[];
  isLoading: boolean;
  activePatternId: string | null;
  onSelectPattern: (pattern: SavedBrandPattern) => void;
  onDeletePattern: (patternId: string) => Promise<void>;
  deletingId: string | null;
}

export function PatchworkSavedPatternsTab({
  patterns,
  isLoading,
  activePatternId,
  onSelectPattern,
  onDeletePattern,
  deletingId,
}: PatchworkSavedPatternsTabProps) {
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
          Belum Ada Pola Patchwork Tersimpan
        </h4>
        <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-moss">
          Unggah foto kain limbah di panel kiri dan klik{" "}
          <strong className="text-brand-black">"Generate Patchwork Pattern"</strong>{" "}
          untuk membuat dan menyimpan koleksi pola pertama Anda.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-body">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-moss">
          Total <span className="font-bold text-brand-black">{patterns.length}</span> pola patchwork tersimpan di akun brand Anda.
        </p>
      </div>

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
                    ? "border-brand-emerald ring-2 ring-brand-emerald/30 shadow-md"
                    : "border-brand-black/15 hover:border-brand-forest hover:shadow-sm"
                }
              `}
            >
              {/* Image Container */}
              <div className="relative aspect-square w-full overflow-hidden bg-canvas-warm/50">
                <img
                  src={pattern.generatedDesignUrl}
                  alt={pattern.promptText ?? "Pola Patchwork AI"}
                  className="size-full object-cover transition duration-300 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Badge if applied */}
                {isApplied && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-brand-forest px-2.5 py-1 text-[10px] font-bold text-white shadow-xs">
                    <Check className="size-3 text-brand-lime" />
                    <span>Aktif di Siluet</span>
                  </div>
                )}

                {/* Delete Button overlay */}
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => void onDeletePattern(pattern.id)}
                  title="Hapus Pola"
                  className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-xs transition hover:bg-error-rust cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                </button>
              </div>

              {/* Content & Actions */}
              <div className="flex flex-1 flex-col justify-between p-3.5 space-y-3">
                {pattern.promptText && (
                  <p className="line-clamp-2 text-xs leading-relaxed text-brand-black">
                    {pattern.promptText}
                  </p>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-line-trace/60">
                  <span className="text-[10px] text-muted-moss">
                    {pattern.createdAt
                      ? new Date(pattern.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "Baru saja"}
                  </span>

                  <Button
                    type="button"
                    variant={isApplied ? "solid-lime" : "outline"}
                    size="sm"
                    onClick={() => onSelectPattern(pattern)}
                    className="text-[11px] font-bold py-1 px-2.5 h-7"
                  >
                    {isApplied ? "Terapkan" : "Terapkan ke Siluet"}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
