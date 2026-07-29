export const BANNER_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export const MATERIAL_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
  ".heic",
  ".heif",
] as const;

export const MEDIA_TYPES = ["image/*", "video/*"] as const;

export type FileValidationOptions = {
  acceptedTypes: readonly string[];
  maxSizeMB: number;
};

export type FileValidationError = {
  code: "unsupported_type" | "file_too_large";
  message: string;
};

function getFileExtension(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase();
  return extension ? `.${extension}` : "";
}

export function matchesAcceptedType(
  file: File,
  acceptedTypes: readonly string[],
) {
  const extension = getFileExtension(file.name);

  return acceptedTypes.some((acceptedType) => {
    const normalized = acceptedType.toLowerCase();

    if (normalized.startsWith(".")) {
      return extension === normalized;
    }

    if (normalized.endsWith("/*")) {
      return file.type.startsWith(normalized.slice(0, -1));
    }

    return file.type.toLowerCase() === normalized;
  });
}

export function validateFile(
  file: File,
  { acceptedTypes, maxSizeMB }: FileValidationOptions,
): FileValidationError | null {
  if (!matchesAcceptedType(file, acceptedTypes)) {
    return {
      code: "unsupported_type",
      message: `Format file “${file.name}” tidak didukung.`,
    };
  }

  const maxBytes = maxSizeMB * 1024 * 1024;

  if (file.size > maxBytes) {
    return {
      code: "file_too_large",
      message: `Ukuran file “${file.name}” melebihi batas ${maxSizeMB} MB.`,
    };
  }

  return null;
}

export function formatFileSize(bytes: number) {
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  const unitIndex = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** unitIndex;

  return `${value.toFixed(unitIndex === 0 ? 0 : 2)} ${units[unitIndex]}`;
}

export function getFileFingerprint(file: File) {
  return `${file.name}:${file.size}:${file.lastModified}`;
}

export function isObjectUrl(url: string) {
  return url.startsWith("blob:");
}
