"use client";

import type { ChangeEvent, DragEvent, RefObject } from "react";
import {
  ImagePlus,
  LoaderCircle,
  Package,
  RotateCcw,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { PatchworkPromptPresets } from "./PatchworkPromptPresets";
import type { MaterialOrder } from "@/types/materialOrder";

interface PatchworkLeftPanelProps {
  fileInputRef: RefObject<HTMLInputElement | null>;
  sourceMode: "upload" | "purchased";
  switchMode: (mode: "upload" | "purchased") => void;
  materials: MaterialOrder[];
  isLoadingMaterials: boolean;
  selectedMaterialId: string;
  selectMaterial: (id: string) => void;
  files: File[];
  previews: string[];
  totalBytes: number;
  dragActive: boolean;
  setDragActive: (active: boolean) => void;
  handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleDrop: (e: DragEvent<HTMLLabelElement>) => void;
  clearImages: () => void;
  promptText: string;
  setPromptText: (val: string) => void;
  customNoteError: string | null;
  status: "idle" | "processing" | "done";
  canGenerate: boolean;
  errorMsg: string | null;
  handleGenerate: () => Promise<void>;
}

export function PatchworkLeftPanel({
  fileInputRef,
  sourceMode,
  switchMode,
  materials,
  isLoadingMaterials,
  selectedMaterialId,
  selectMaterial,
  files,
  previews,
  dragActive,
  setDragActive,
  handleFileChange,
  handleDrop,
  clearImages,
  promptText,
  setPromptText,
  customNoteError,
  status,
  canGenerate,
  errorMsg,
  handleGenerate,
}: PatchworkLeftPanelProps) {
  const isProcessing = status === "processing";

  return (
    <div className="space-y-6 font-body">
      {/* Panel Title & Source Switcher */}
      <div className="rounded-2xl border border-brand-black/15 bg-canvas-pure p-5 sm:p-6 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-line-trace pb-4">
          <div>
            <h3 className="font-display text-base font-bold text-brand-black">
              1. Sumber Material Kain Limbah
            </h3>
            <p className="text-xs text-muted-moss">
              Unggah foto perca atau pilih material dari riwayat transaksi sirkular Anda.
            </p>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="inline-flex rounded-lg border border-brand-black/15 bg-canvas-warm p-1">
            <button
              type="button"
              onClick={() => switchMode("purchased")}
              className={`rounded-md px-3 py-1 text-xs font-bold transition cursor-pointer ${
                sourceMode === "purchased"
                  ? "bg-brand-forest text-white shadow-2xs"
                  : "text-muted-moss hover:text-brand-black"
              }`}
            >
              Pembelian
            </button>
            <button
              type="button"
              onClick={() => switchMode("upload")}
              className={`rounded-md px-3 py-1 text-xs font-bold transition cursor-pointer ${
                sourceMode === "upload"
                  ? "bg-brand-forest text-white shadow-2xs"
                  : "text-muted-moss hover:text-brand-black"
              }`}
            >
              Upload Foto
            </button>
          </div>
        </div>

        {/* Source Content */}
        {sourceMode === "purchased" ? (
          <div className="space-y-3">
            <label className="block text-xs font-bold text-brand-black">
              Pilih Material Terverifikasi:
            </label>
            {isLoadingMaterials ? (
              <div className="flex items-center gap-2 p-3 text-xs text-muted-moss">
                <LoaderCircle className="size-4 animate-spin text-brand-emerald" />
                <span>Memuat inventaris material...</span>
              </div>
            ) : materials.length === 0 ? (
              <div className="rounded-xl border border-dashed border-brand-black/15 bg-canvas-warm/50 p-4 text-center text-xs text-muted-moss">
                Belum ada material limbah yang dibeli. Silakan switch ke opsi <strong>"Upload Foto"</strong>.
              </div>
            ) : (
              <div className="grid gap-2.5">
                {materials.map((mat) => {
                  const isSelected = selectedMaterialId === mat.id;
                  return (
                    <div
                      key={mat.id}
                      onClick={() => selectMaterial(mat.id)}
                      className={`
                        flex items-center justify-between rounded-xl border p-3 transition cursor-pointer
                        ${
                          isSelected
                            ? "border-brand-emerald bg-brand-lime/20 shadow-2xs"
                            : "border-brand-black/15 bg-canvas-pure hover:border-brand-forest hover:bg-canvas-warm/60"
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-forest/10 text-brand-forest font-bold">
                          <Package className="size-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-brand-black">{mat.batchTitle}</p>
                          <p className="text-[11px] text-muted-moss">{mat.providerName} • {mat.weightKg} Kg</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />

            {files.length === 0 ? (
              <label
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  flex min-h-[140px] flex-col items-center justify-center rounded-xl border-2 border-dashed p-5 text-center transition cursor-pointer
                  ${
                    dragActive
                      ? "border-brand-emerald bg-brand-lime/20"
                      : "border-brand-black/20 bg-canvas-warm/40 hover:border-brand-forest hover:bg-canvas-warm/70"
                  }
                `}
              >
                <div className="flex size-10 items-center justify-center rounded-full bg-brand-forest/10 text-brand-forest">
                  <Upload className="size-5" />
                </div>
                <p className="mt-2 text-xs font-bold text-brand-black">
                  Tarik & lepas foto kain perca di sini
                </p>
                <p className="mt-0.5 text-[11px] text-muted-moss">
                  atau klik untuk memilih file (JPG, PNG, WebP, max 4MB)
                </p>
              </label>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-brand-black">
                    Preview Foto Kain ({files.length}):
                  </span>
                  <button
                    type="button"
                    onClick={clearImages}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-error-rust hover:underline cursor-pointer"
                  >
                    <Trash2 className="size-3" /> Hapus Semua
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {previews.map((url, index) => (
                    <div
                      key={index}
                      className="relative aspect-square overflow-hidden rounded-lg border border-brand-black/15 bg-canvas-warm"
                    >
                      <img
                        src={url}
                        alt={`Preview Kain ${index + 1}`}
                        className="size-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Text Prompt & Preset Chips */}
      <div className="rounded-2xl border border-brand-black/15 bg-canvas-pure p-5 sm:p-6 space-y-4 shadow-2xs">
        <div>
          <h3 className="font-display text-base font-bold text-brand-black">
            2. Arahan Desain & Text Prompt
          </h3>
          <p className="text-xs text-muted-moss">
            Tuliskan instruksi motif patchwork atau gunakan template siap pakai.
          </p>
        </div>

        {/* Text Area */}
        <div className="space-y-2">
          <Textarea
            rows={4}
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="Contoh: Geometric herringbone pattern with denim & cotton contrast..."
            className="text-xs leading-relaxed"
          />
          {customNoteError && (
            <p className="text-[11px] font-medium text-error-rust">{customNoteError}</p>
          )}
        </div>

        {/* Quick Template Prompts */}
        <PatchworkPromptPresets
          activePrompt={promptText}
          onSelectPreset={(selectedText) => setPromptText(selectedText)}
        />
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="rounded-xl border border-error-rust/30 bg-error-rust/10 p-4 text-xs font-medium text-error-rust">
          {errorMsg}
        </div>
      )}

      {/* Action Button */}
      <Button
        variant="solid-lime"
        size="lg"
        type="button"
        disabled={!canGenerate || isProcessing}
        onClick={() => void handleGenerate()}
        className="w-full py-4 text-sm font-bold shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
      >
        {isProcessing ? (
          <span className="flex items-center gap-2">
            <LoaderCircle className="size-5 animate-spin" />
            <span>Kecerdasan AI Sedang Memproses Pola...</span>
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Sparkles className="size-5 text-brand-forest" />
            <span>Generate Patchwork Pattern</span>
          </span>
        )}
      </Button>
    </div>
  );
}
