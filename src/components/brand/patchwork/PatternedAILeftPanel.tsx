"use client";

import type { ChangeEvent, DragEvent, RefObject } from "react";
import { useState } from "react";
import {
  Grid,
  LoaderCircle,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { PatternedAIStyleSelector } from "./PatternedAIStyleSelector";

interface PatternedAILeftPanelProps {
  fileInputRef: RefObject<HTMLInputElement | null>;
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

export function PatternedAILeftPanel({
  fileInputRef,
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
}: PatternedAILeftPanelProps) {
  const [selectedStyleId, setSelectedStyleId] = useState<string>("");
  const isProcessing = status === "processing";

  const handleSelectStylePrefix = (prefix: string) => {
    if (!promptText) {
      setPromptText(prefix);
    } else {
      setPromptText(`${prefix}, ${promptText}`);
    }
  };

  return (
    <div className="space-y-6 font-body">
      {/* Upload Foto Kain Limbah (Tanpa Input Inventaris) */}
      <div className="rounded-2xl border border-brand-black/15 bg-canvas-pure p-5 sm:p-6 space-y-4">
        <div className="border-b border-line-trace pb-3">
          <h3 className="font-display text-base font-bold text-brand-black">
            Foto Limbah Kain Anda
          </h3>
          <p className="text-xs text-muted-moss">
            Unggah foto perca kain limbah daur ulang yang ingin diproses AI.
          </p>
        </div>

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
                flex min-h-[140px] flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 text-center transition cursor-pointer
                ${
                  dragActive
                    ? "border-brand-emerald bg-brand-lime/20"
                    : "border-brand-black/20 bg-canvas-warm/40 hover:border-brand-forest hover:bg-canvas-warm/70"
                }
              `}
            >
              <Upload className="size-6 text-brand-forest" />
              <p className="mt-2 text-xs font-bold text-brand-black">
                Tarik & lepas foto kain perca di sini
              </p>
              <p className="mt-0.5 text-[10px] text-muted-moss">
                Format JPG, PNG, WebP, AVIF (Maksimal 4 MB)
              </p>
            </label>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-brand-black">
                  Foto Kain Terpilih ({files.length}):
                </span>
                <button
                  type="button"
                  onClick={clearImages}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-error-rust hover:underline cursor-pointer"
                >
                  <Trash2 className="size-3" /> Hapus Foto
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
                      alt={`Kain ${index + 1}`}
                      className="size-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Text Prompt & Style Studio (Tanpa Nomor 1., 2.) */}
      <div className="rounded-2xl border border-brand-black/15 bg-canvas-pure p-5 sm:p-6 space-y-4">
        <div className="border-b border-line-trace pb-3">
          <h3 className="font-display text-base font-bold text-brand-black">
            Arahan Desain & Prompt Studio
          </h3>
          <p className="text-xs text-muted-moss">
            Tentukan instruksi teks dan pilihan gaya pola seamless.
          </p>
        </div>

        {/* Textarea Prompt */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-brand-black">
              Deskripsi Text Prompt Pola <span className="text-error-rust">*</span>
            </label>
            <span className="text-[11px] font-medium text-muted-moss">
              {promptText.length} / 1000 karakter
            </span>
          </div>
          <Textarea
            rows={4}
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="Contoh: Geometric herringbone patchwork pattern with denim & cotton contrast..."
            className="text-xs leading-relaxed"
          />
          {customNoteError && (
            <p className="text-[11px] font-medium text-error-rust">{customNoteError}</p>
          )}
        </div>

        {/* Style Selector Chips */}
        <PatternedAIStyleSelector
          selectedStyleId={selectedStyleId}
          onSelectStyle={(prefix) => handleSelectStylePrefix(prefix)}
        />
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="rounded-xl border border-error-rust/30 bg-error-rust/10 p-4 text-xs font-medium text-error-rust">
          {errorMsg}
        </div>
      )}

      {/* Generate Button */}
      <Button
        variant="solid-black"
        loading={isProcessing}
        type="button"
        disabled={!canGenerate || isProcessing}
        onClick={() => void handleGenerate()}
        className="w-full py-4 text-sm font-bold cursor-pointer"
      >
        {isProcessing ? (
          <span className="flex items-center gap-2">
            <span>Sedang Membuat Pola...</span>
          </span>
        ) : (
          <span className="flex items-center gap-2">
            Buat Pola Sekarang
          </span>
        )}
      </Button>
    </div>
  );
}
