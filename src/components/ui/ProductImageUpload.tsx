"use client";

/* eslint-disable @next/next/no-img-element */

import * as React from "react";
import { ImageIcon, LoaderCircle, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";

import {
  FileDropzone,
  FileInput,
  type FilePickerHandle,
} from "@/components/ui/file-upload";
import { uploadProductImage } from "@/services/brand/productManagementService";
import { cn } from "@/lib/utils";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_MB = 5;

interface ProductImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  brandId?: string;
  className?: string;
  disabled?: boolean;
}

export function ProductImageUpload({
  value,
  onChange,
  brandId,
  className,
  disabled = false,
}: ProductImageUploadProps) {
  const inputId = React.useId();
  const pickerRef = React.useRef<FilePickerHandle>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  async function handleFilesSelected(files: File[]) {
    const selectedFile = files[0];
    if (!selectedFile) return;

    if (selectedFile.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`Ukuran file foto produk maksimal ${MAX_SIZE_MB} MB.`);
      return;
    }

    setIsUploading(true);

    try {
      const publicUrl = await uploadProductImage(selectedFile, brandId);
      onChange(publicUrl);
      toast.success("Foto produk berhasil diunggah ke storage.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal mengunggah foto produk.";
      toast.error(msg);
    } finally {
      setIsUploading(false);
    }
  }

  function handleRemove() {
    onChange("");
  }

  return (
    <div className={cn("w-full space-y-2", className)}>
      <label className="block text-xs font-bold text-brand-black">
        Foto / Gambar Produk <span className="font-normal text-muted-moss">(Opsional)</span>
      </label>

      {value ? (
        <div className="space-y-2">
          <FileInput
            ref={pickerRef}
            id={inputId}
            accept={ACCEPTED_TYPES.join(",")}
            disabled={disabled || isUploading}
            onFilesSelected={handleFilesSelected}
          />

          <div className="group relative flex items-center gap-4 rounded-xl border border-line-trace bg-canvas-warm/50 p-3">
            <div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line-trace bg-white shadow-xs">
              {isUploading ? (
                <LoaderCircle className="size-6 animate-spin text-brand-emerald" />
              ) : (
                <img
                  src={value}
                  alt="Pratinjau foto produk"
                  className="size-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-brand-black flex items-center gap-1.5">
                <ImageIcon className="size-4 text-brand-emerald" />
                Foto Produk Terpilih
              </p>
              <p className="mt-1 truncate text-[11px] text-muted-moss">
                {value.startsWith("blob:")
                  ? "File gambar lokal (siap disimpan)"
                  : value}
              </p>
              <div className="mt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => pickerRef.current?.open()}
                  disabled={disabled || isUploading}
                  className="text-[11px] font-semibold text-brand-forest underline hover:text-brand-emerald cursor-pointer disabled:opacity-50"
                >
                  Ganti Foto
                </button>
                <span className="text-[10px] text-muted-moss">•</span>
                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={disabled || isUploading}
                  className="text-[11px] font-semibold text-error-rust underline hover:text-red-700 cursor-pointer disabled:opacity-50"
                >
                  Hapus Foto
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <FileDropzone
          ref={pickerRef}
          inputId={inputId}
          accept={ACCEPTED_TYPES.join(",")}
          disabled={disabled || isUploading}
          onFilesSelected={handleFilesSelected}
          ariaLabel="Unggah foto produk"
          className="min-h-[110px] py-4 px-4 hover:border-brand-emerald/60 hover:bg-canvas-warm/70"
        >
          <span className="flex flex-col items-center justify-center gap-2 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-brand-lime/40 text-brand-forest">
              {isUploading ? (
                <LoaderCircle className="size-5 animate-spin text-brand-emerald" />
              ) : (
                <UploadCloud className="size-5" />
              )}
            </div>

            <span>
              <span className="block text-xs font-semibold text-brand-black">
                {isUploading
                  ? "Sedang mengunggah foto..."
                  : "Klik untuk unggah atau seret foto produk ke sini"}
              </span>
              <span className="mt-0.5 block text-[10px] text-muted-moss">
                PNG, JPG, WebP, GIF · Maksimal {MAX_SIZE_MB} MB
              </span>
            </span>
          </span>
        </FileDropzone>
      )}
    </div>
  );
}
