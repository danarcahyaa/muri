"use client";

import * as React from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";

import { FileDropzone } from "@/components/ui/file-upload";
import {
  MATERIAL_IMAGE_TYPES,
  validateFile,
} from "@/lib/fileValidation";

interface UploadMaterialPanelProps {
  inputId: string;
  file: File | null;
  onChange: (file: File | null) => void;
  maxSizeMB?: number;
  disabled?: boolean;
}

export default function UploadMaterialPanel({
  inputId,
  file,
  onChange,
  maxSizeMB = 10,
  disabled = false,
}: UploadMaterialPanelProps) {
  function handleFilesSelected(files: File[]) {
    const selectedFile = files[0];
    if (!selectedFile) return;

    const validationError = validateFile(selectedFile, {
      acceptedTypes: MATERIAL_IMAGE_TYPES,
      maxSizeMB,
    });

    if (validationError) {
      toast.error(validationError.message);
      return;
    }

    onChange(selectedFile);
  }

  return (
    <FileDropzone
      inputId={inputId}
      accept={MATERIAL_IMAGE_TYPES.join(",")}
      disabled={disabled}
      onFilesSelected={handleFilesSelected}
      ariaLabel="Unggah foto material"
      className="h-[320px] min-w-0 rounded-2xl border-line-trace bg-canvas-warm/35 p-6 text-left hover:border-brand-emerald/40 hover:bg-canvas-warm/55 sm:h-[340px]"
    >
      <span className="flex size-full min-w-0 flex-col items-start justify-between">
        <span className="flex size-16 items-center justify-center rounded-full bg-brand-lime text-brand-black">
          <Upload className="size-7" strokeWidth={2.1} />
        </span>

        <span className="min-w-0">
          <span className="block font-display text-2xl font-medium leading-tight tracking-tight text-brand-black">
            Tarik atau unggah foto material
          </span>

          <span className="mt-6 block text-xs font-medium text-muted-moss">
            JPG, PNG, atau HEIC · Maks. {maxSizeMB} MB
          </span>

          {file ? (
            <span className="mt-3 block truncate text-xs font-bold text-brand-emerald">
              {file.name}
            </span>
          ) : null}
        </span>
      </span>
    </FileDropzone>
  );
}
