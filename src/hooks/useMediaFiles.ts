"use client";

import * as React from "react";
import { toast } from "sonner";

import { MediaType } from "@/enums/enums";
import {
  getFileFingerprint,
  MEDIA_TYPES,
  validateFile,
} from "@/lib/fileValidation";
import type { MediaItem } from "@/types/common";

interface UseMediaFilesOptions {
  value: MediaItem[];
  onChange: (value: MediaItem[]) => void;
  maxFiles: number;
  maxImageSizeMB: number;
  maxVideoSizeMB: number;
}

function getMediaType(file: File) {
  return file.type.startsWith("video/") ? MediaType.VIDEO : MediaType.IMAGE;
}

export function useMediaFiles({
  value,
  onChange,
  maxFiles,
  maxImageSizeMB,
  maxVideoSizeMB,
}: UseMediaFilesOptions) {
  const ownedObjectUrlsRef = React.useRef(new Set<string>());

  React.useEffect(() => {
    const activeUrls = new Set(value.map((item) => item.url));

    for (const url of ownedObjectUrlsRef.current) {
      if (!activeUrls.has(url)) {
        URL.revokeObjectURL(url);
        ownedObjectUrlsRef.current.delete(url);
      }
    }
  }, [value]);

  React.useEffect(() => {
    const ownedUrls = ownedObjectUrlsRef.current;

    return () => {
      for (const url of ownedUrls) URL.revokeObjectURL(url);
      ownedUrls.clear();
    };
  }, []);

  const addFiles = React.useCallback(
    (files: File[]) => {
      const remainingSlots = Math.max(maxFiles - value.length, 0);

      if (remainingSlots === 0) {
        toast.error(`Maksimal ${maxFiles} file dapat diunggah.`);
        return;
      }

      if (files.length > remainingSlots) {
        toast.error(
          `Hanya ${remainingSlots} file lagi yang dapat ditambahkan dari maksimal ${maxFiles} file.`,
        );
      }

      const existingFingerprints = new Set(
        value
          .map((item) => item.file)
          .filter((file): file is File => Boolean(file))
          .map(getFileFingerprint),
      );

      const newItems: MediaItem[] = [];

      for (const file of files.slice(0, remainingSlots)) {
        const fingerprint = getFileFingerprint(file);

        if (existingFingerprints.has(fingerprint)) {
          toast.error(`File “${file.name}” sudah dipilih.`);
          continue;
        }

        const type = getMediaType(file);
        const maxSizeMB =
          type === MediaType.VIDEO ? maxVideoSizeMB : maxImageSizeMB;
        const validationError = validateFile(file, {
          acceptedTypes: MEDIA_TYPES,
          maxSizeMB,
        });

        if (validationError) {
          toast.error(validationError.message);
          continue;
        }

        const url = URL.createObjectURL(file);
        ownedObjectUrlsRef.current.add(url);
        existingFingerprints.add(fingerprint);

        newItems.push({
          id: crypto.randomUUID(),
          url,
          file,
          type,
          name: file.name,
        });
      }

      if (newItems.length > 0) {
        onChange([...value, ...newItems]);
      }
    }, [
      maxFiles,
      maxImageSizeMB,
      maxVideoSizeMB,
      onChange,
      value,
    ],
  );

  const removeFile = React.useCallback(
    (id: string) => {
      const item = value.find((currentItem) => currentItem.id === id);

      if (item && ownedObjectUrlsRef.current.has(item.url)) {
        URL.revokeObjectURL(item.url);
        ownedObjectUrlsRef.current.delete(item.url);
      }

      onChange(value.filter((currentItem) => currentItem.id !== id));
    },
    [onChange, value],
  );

  const clearFiles = React.useCallback(() => {
    for (const item of value) {
      if (ownedObjectUrlsRef.current.has(item.url)) {
        URL.revokeObjectURL(item.url);
        ownedObjectUrlsRef.current.delete(item.url);
      }
    }

    onChange([]);
  }, [onChange, value]);

  return {
    addFiles,
    removeFile,
    clearFiles,
    remainingSlots: Math.max(maxFiles - value.length, 0),
    canAddMore: value.length < maxFiles,
  };
}
