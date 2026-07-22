"use client";

import * as React from "react";
import { UploadCloud, X, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const MAX_SIZE_MB = 5;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

interface BannerUploadProps {
  /** File object for local preview, or undefined if none selected */
  file: File | null;
  /** Preview URL (object URL or remote URL) */
  previewUrl: string | null;
  onChange: (file: File | null, previewUrl: string | null) => void;
  className?: string;
}

/**
 * Single-image banner uploader following the MURI MediaUpload design pattern.
 * Supports drag-and-drop and click-to-upload. Max 5 MB, images only.
 */
export function BannerUpload({
  file,
  previewUrl,
  onChange,
  className,
}: BannerUploadProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFile = (selectedFile: File) => {
    // Validate file type
    if (!ACCEPTED_TYPES.includes(selectedFile.type)) {
      toast.error("Format file tidak didukung. Gunakan JPEG, PNG, WebP, atau GIF.");
      return;
    }

    // Validate file size
    if (selectedFile.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`Ukuran file melebihi batas ${MAX_SIZE_MB}MB.`);
      return;
    }

    // Revoke previous object URL to avoid memory leaks
    if (previewUrl && file) {
      URL.revokeObjectURL(previewUrl);
    }

    const newPreviewUrl = URL.createObjectURL(selectedFile);
    onChange(selectedFile, newPreviewUrl);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) handleFile(selected);
    // Reset input so the same file can be re-selected after removal
    e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  };

  const handleRemove = () => {
    if (previewUrl && file) {
      URL.revokeObjectURL(previewUrl);
    }
    onChange(null, null);
  };

  return (
    <div className={cn("space-y-3 w-full", className)}>
      <label className="text-xs font-semibold text-brand-black/70">
        Banner Workshop
      </label>

      {/* Preview — shown when a file is selected */}
      {previewUrl ? (
        <div className="relative w-full rounded-sm overflow-hidden border border-line-trace/60 bg-canvas-warm/20 group">
          <img
            src={previewUrl}
            alt="Preview banner workshop"
            className="w-full object-cover max-h-48"
          />
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-brand-black/0 group-hover:bg-brand-black/30 transition-colors flex items-center justify-center">
            <button
              type="button"
              onClick={handleRemove}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full bg-error-rust text-white shadow-md"
              title="Hapus banner"
            >
              <X className="size-4" />
            </button>
          </div>
          {/* File info strip */}
          {file && (
            <div className="absolute bottom-0 inset-x-0 bg-brand-black/60 px-3 py-1.5 flex items-center justify-between">
              <span className="text-[10px] text-white truncate max-w-[70%]">
                {file.name}
              </span>
              <span className="text-[10px] text-white/70 shrink-0">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
          )}
        </div>
      ) : (
        /* Upload Zone — shown when no file selected */
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border border-dashed border-input rounded-sm p-5 min-h-[120px] flex flex-col items-center justify-center gap-2 cursor-pointer bg-canvas-pure hover:bg-muted/10 hover:border-brand-emerald/50 transition-colors"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            onChange={handleInputChange}
            className="hidden"
          />
          <UploadCloud className="size-6 text-muted-moss" />
          <div className="text-center">
            <p className="text-xs font-semibold text-brand-black">
              Klik untuk unggah atau seret gambar
            </p>
            <p className="text-[9px] text-muted-moss mt-0.5">
              JPEG, PNG, WebP, GIF · Maks. {MAX_SIZE_MB}MB
            </p>
          </div>
        </div>
      )}

      {/* Replace button — shown when file already selected */}
      {previewUrl && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-[10px] text-brand-forest hover:underline font-medium flex items-center gap-1"
        >
          <ImageIcon className="size-3" />
          Ganti gambar
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            onChange={handleInputChange}
            className="hidden"
          />
        </button>
      )}
    </div>
  );
}
