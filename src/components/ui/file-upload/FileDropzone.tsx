"use client";

import * as React from "react";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

import {
  FileInput,
  type FileInputProps,
  type FilePickerHandle,
} from "./FileInput";

export interface FileDropzoneProps
  extends Pick<FileInputProps, "accept" | "multiple" | "name"> {
  inputId?: string;
  children: React.ReactNode;
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
  describedBy?: string;
}

const FileDropzone = React.forwardRef<FilePickerHandle, FileDropzoneProps>(
  function FileDropzone(
    {
      inputId,
      children,
      onFilesSelected,
      accept,
      multiple = false,
      name,
      disabled = false,
      className,
      ariaLabel = "Unggah file",
      describedBy,
    },
    forwardedRef,
  ) {
    const pickerRef = React.useRef<FilePickerHandle>(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const dragDepthRef = React.useRef(0);

    React.useImperativeHandle(
      forwardedRef,
      () => ({
        open: () => pickerRef.current?.open(),
        reset: () => pickerRef.current?.reset(),
      }),
      [],
    );

    function handleDragEnter(event: React.DragEvent<HTMLButtonElement>) {
      event.preventDefault();
      event.stopPropagation();
      dragDepthRef.current += 1;
      setIsDragging(true);
    }

    function handleDragLeave(event: React.DragEvent<HTMLButtonElement>) {
      event.preventDefault();
      event.stopPropagation();
      dragDepthRef.current -= 1;

      if (dragDepthRef.current <= 0) {
        dragDepthRef.current = 0;
        setIsDragging(false);
      }
    }

    function handleDrop(event: React.DragEvent<HTMLButtonElement>) {
      event.preventDefault();
      event.stopPropagation();

      dragDepthRef.current = 0;
      setIsDragging(false);

      if (disabled) return;

      const files = Array.from(event.dataTransfer.files ?? []);
      if (files.length > 0) onFilesSelected(files);
    }

    return (
      <>
        <FileInput
          ref={pickerRef}
          id={inputId}
          name={name}
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onFilesSelected={onFilesSelected}
        />

        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          aria-label={ariaLabel}
          aria-describedby={describedBy}
          data-dragging={isDragging || undefined}
          onClick={() => pickerRef.current?.open()}
          onDragEnter={handleDragEnter}
          onDragOver={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            `
              h-auto w-full whitespace-normal
              border-dashed p-0 font-normal

              data-[dragging=true]:border-brand-emerald
              data-[dragging=true]:bg-brand-emerald/[0.05]
              data-[dragging=true]:ring-2
              data-[dragging=true]:ring-brand-emerald/10
            `,
            className,
          )}
        >
          {children}
        </Button>
      </>
    );
  },
);

FileDropzone.displayName = "FileDropzone";

export { FileDropzone };
