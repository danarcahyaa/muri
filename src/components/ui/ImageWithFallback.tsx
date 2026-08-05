"use client";

import { useState, useEffect } from "react";
import Image, { type ImageProps } from "next/image";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageWithFallbackProps extends Omit<ImageProps, "src"> {
  src: string | null | undefined;
  fallbackTitle?: string;
  containerClassName?: string;
}

export function ImageWithFallback({
  src,
  alt,
  fallbackTitle,
  className,
  containerClassName,
  ...props
}: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!src || hasError) {
    return (
      <div
        className={cn(
          "flex size-full min-h-[140px] flex-col items-center justify-center bg-canvas-warm p-4 text-center text-muted-moss",
          containerClassName
        )}
      >
        <div className="flex size-10 items-center justify-center rounded-full bg-brand-black/5 text-muted-moss/70">
          <ImageOff className="size-5" strokeWidth={1.5} />
        </div>
        <p className="mt-2.5 text-[11px] font-medium text-brand-black/70 line-clamp-1">
          {fallbackTitle || alt || "Gambar Tidak Tersedia"}
        </p>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt || "Gambar produk"}
      className={className}
      onError={() => setHasError(true)}
      {...props}
    />
  );
}
