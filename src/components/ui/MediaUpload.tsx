"use client";

/* eslint-disable @next/next/no-img-element */

import * as React from "react";
import { Film, UploadCloud, X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/Field";
import { FileDropzone } from "@/components/ui/file-upload";
import { MediaType } from "@/enums/enums";
import { useMediaFiles } from "@/hooks/useMediaFiles";
import { cn } from "@/lib/utils";
import type { MediaItem } from "@/types/common";

interface MediaUploadProps {
  value: MediaItem[];
  onChange: (value: MediaItem[]) => void;
  maxFiles?: number;
  maxImageSizeMB?: number;
  maxVideoSizeMB?: number;
  className?: string;
  disabled?: boolean;
}

export function MediaUpload({
  value,
  onChange,
  maxFiles = 5,
  maxImageSizeMB = 5,
  maxVideoSizeMB = 20,
  className,
  disabled = false,
}: MediaUploadProps) {
  const inputId = React.useId();
  const descriptionId = React.useId();
  const { addFiles, removeFile, remainingSlots, canAddMore } = useMediaFiles({
    value,
    onChange,
    maxFiles,
    maxImageSizeMB,
    maxVideoSizeMB,
  });

  return (
    <Field
      data-disabled={disabled || undefined}
      className={cn("w-full", className)}
    >
      <FieldLabel htmlFor={inputId}>Foto &amp; Video Limbah</FieldLabel>

      {canAddMore ? (
        <FileDropzone
          inputId={inputId}
          accept="image/*,video/*"
          multiple
          disabled={disabled}
          describedBy={descriptionId}
          onFilesSelected={addFiles}
          ariaLabel="Unggah foto dan video limbah"
          className="min-h-[150px] p-5 hover:border-brand-emerald/50 hover:bg-muted/10"
        >
          <span className="flex flex-col items-center justify-center gap-2">
            <UploadCloud className="size-6 text-muted-moss" />

            <span className="text-center">
              <span className="block text-xs font-semibold text-brand-black">
                Klik untuk unggah atau seret file
              </span>
              <span className="mt-0.5 block text-[9px] text-muted-moss">
                Gambar maks. {maxImageSizeMB} MB · Video maks. {maxVideoSizeMB} MB
              </span>
              <span className="mt-1 block text-[9px] font-medium text-brand-emerald">
                Sisa {remainingSlots} dari {maxFiles} slot
              </span>
            </span>
          </span>
        </FileDropzone>
      ) : null}

      {value.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
          {value.map((item) => (
            <div
              key={item.id}
              className="group relative flex aspect-square items-center justify-center overflow-hidden rounded-sm border border-line-trace/60 bg-muted/20"
            >
              {item.type === MediaType.IMAGE ? (
                <img
                  src={item.url}
                  alt={item.name}
                  className="size-full object-cover"
                />
              ) : (
                <div className="relative size-full">
                  <video
                    src={item.url}
                    className="size-full object-cover"
                    muted
                    preload="metadata"
                    aria-label={item.name}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                    <Film className="size-5 text-white" />
                  </div>
                </div>
              )}

              <Button
                type="button"
                variant="destructive"
                size="icon-xs"
                disabled={disabled}
                aria-label={`Hapus ${item.name}`}
                title={`Hapus ${item.name}`}
                onClick={() => removeFile(item.id)}
                className="absolute right-1.5 top-1.5 shadow-md"
              >
                <X className="size-3.5" />
              </Button>

              <span className="absolute inset-x-0 bottom-0 truncate bg-brand-black/60 px-2 py-1 text-[9px] text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      ) : null}

      <FieldDescription id={descriptionId}>
        Maksimal {maxFiles} file. Unggah foto kondisi material dan video singkat
        yang membantu brand menilai kualitas limbah.
      </FieldDescription>
    </Field>
  );
}
