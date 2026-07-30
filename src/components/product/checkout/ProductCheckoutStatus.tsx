"use client";

import { LoaderCircle, RefreshCw } from "lucide-react";

export function ProductCheckoutLoading() {
  return (
    <div
      className="flex min-h-[480px] items-center justify-center rounded-3xl border border-brand-black/15 bg-canvas-pure"
      role="status"
      aria-live="polite"
    >
      <div className="text-center">
        <LoaderCircle className="mx-auto size-8 animate-spin text-brand-emerald" />

        <p className="mt-4 text-xs text-muted-moss">
          Menyiapkan checkout...
        </p>
      </div>
    </div>
  );
}

export function ProductCheckoutLoadError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => Promise<void>;
}) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-brand-black/15 bg-canvas-pure px-6 text-center">
      <RefreshCw className="size-9 text-muted-moss/50" />

      <h1 className="mt-5 font-display text-3xl font-medium text-brand-black">
        Checkout tidak tersedia
      </h1>

      <p className="mt-3 text-xs text-muted-moss">{message}</p>

      <button
        type="button"
        onClick={() => {
          void onRetry();
        }}
        className="mt-6 rounded-md bg-brand-forest px-5 py-3 text-xs font-bold text-white"
      >
        Coba Lagi
      </button>
    </div>
  );
}
