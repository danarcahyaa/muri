"use client";

/* eslint-disable @next/next/no-img-element */

import * as React from "react";
import { ImageIcon, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/Field";
import {
  FileDropzone,
  FileInput,
  type FilePickerHandle,
} from "@/components/ui/file-upload";
import {
  BANNER_IMAGE_TYPES,
  formatFileSize,
  validateFile,
} from "@/lib/fileValidation";
import { cn } from "@/lib/utils";

const MAX_SIZE_MB = 5;

interface BannerUploadProps {
  file: File | null;
  previewUrl: string | null;
  onChange: (file: File | null, previewUrl: string | null) => void;
  className?: string;
  disabled?: boolean;
}

export function BannerUpload({
  file,
  previewUrl,
  onChange,
  className,
  disabled = false,
}: BannerUploadProps) {
  const inputId = React.useId();
  const pickerRef = React.useRef<FilePickerHandle>(null);
  const ownedObjectUrlsRef = React.useRef(new Set<string>());

  React.useEffect(() => {
    const ownedUrls = ownedObjectUrlsRef.current;

    return () => {
      for (const url of ownedUrls) URL.revokeObjectURL(url);
      ownedUrls.clear();
    };
  }, []);

  function revokeOwnedUrl(url: string | null) {
    if (!url || !ownedObjectUrlsRef.current.has(url)) return;

    URL.revokeObjectURL(url);
    ownedObjectUrlsRef.current.delete(url);
  }

  function handleFilesSelected(files: File[]) {
    const selectedFile = files[0];
    if (!selectedFile) return;

    const validationError = validateFile(selectedFile, {
      acceptedTypes: BANNER_IMAGE_TYPES,
      maxSizeMB: MAX_SIZE_MB,
    });

    if (validationError) {
      toast.error(validationError.message);
      return;
    }

    revokeOwnedUrl(previewUrl);

    const nextPreviewUrl = URL.createObjectURL(selectedFile);
    ownedObjectUrlsRef.current.add(nextPreviewUrl);
    onChange(selectedFile, nextPreviewUrl);
  }

  function handleRemove() {
    revokeOwnedUrl(previewUrl);
    onChange(null, null);
  }

  return (
    <Field
      data-disabled={disabled || undefined}
      className={cn("w-full", className)}
    >
      <FieldLabel htmlFor={inputId}>Banner Workshop</FieldLabel>

      {previewUrl ? (
        <>
          <FileInput
            ref={pickerRef}
            id={inputId}
            accept={BANNER_IMAGE_TYPES.join(",")}
            disabled={disabled}
            onFilesSelected={handleFilesSelected}
          />

          <div className="group relative w-full overflow-hidden rounded-sm border border-brand-black/15/60 bg-canvas-warm/20">
            <img
              src={previewUrl}
              alt="Preview banner workshop"
              className="max-h-48 w-full object-cover"
            />

            <div className="absolute inset-0 flex items-center justify-center bg-brand-black/0 transition-colors group-hover:bg-brand-black/30 group-focus-within:bg-brand-black/30">
              <Button
                type="button"
                variant="destructive"
                size="icon-sm"
                disabled={disabled}
                aria-label="Hapus banner"
                title="Hapus banner"
                onClick={handleRemove}
                className="opacity-0 shadow-md transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
              >
                <X />
              </Button>
            </div>

            {file ? (
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-brand-black/60 px-3 py-1.5">
                <span className="min-w-0 truncate text-[10px] text-white">
                  {file.name}
                </span>
                <span className="shrink-0 text-[10px] text-white/70">
                  {formatFileSize(file.size)}
                </span>
              </div>
            ) : null}
          </div>

          <Button
            type="button"
            variant="link"
            size="xs"
            disabled={disabled}
            onClick={() => pickerRef.current?.open()}
            className="w-fit gap-1 text-[10px]"
          >
            <ImageIcon className="size-3" />
            Ganti gambar
          </Button>
        </>
      ) : (
        <FileDropzone
          ref={pickerRef}
          inputId={inputId}
          accept={BANNER_IMAGE_TYPES.join(",")}
          disabled={disabled}
          onFilesSelected={handleFilesSelected}
          ariaLabel="Unggah banner workshop"
          className="min-h-[90px] py-3.5 px-4 hover:border-brand-emerald/50 hover:bg-muted/10"
        >
          <span className="flex flex-col items-center justify-center gap-2">
            <UploadCloud className="size-6 text-muted-moss" />

            <span className="text-center">
              <span className="block text-xs font-semibold text-brand-black">
                Klik untuk unggah atau seret gambar
              </span>
              <span className="mt-0.5 block text-[9px] text-muted-moss">
                JPEG, PNG, WebP, GIF · Maks. {MAX_SIZE_MB} MB
              </span>
            </span>
          </span>
        </FileDropzone>
      )}

      <FieldDescription>
        Gunakan banner horizontal dengan komposisi visual yang tetap terbaca pada
        layar kecil.
      </FieldDescription>
    </Field>
  );
}
