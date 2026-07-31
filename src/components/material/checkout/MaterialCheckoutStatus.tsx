"use client";

import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";

export function MaterialCheckoutLoading() {
  return (
    <Card
      className="flex min-h-[480px] items-center justify-center rounded-2xl"
      role="status"
      aria-live="polite"
    >
      <div className="text-center">
        <Spinner className="mx-auto size-8 text-brand-emerald" />
        <p className="mt-4 text-xs text-muted-moss">
          Menyiapkan secure checkout...
        </p>
      </div>
    </Card>
  );
}

export function MaterialCheckoutLoadError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void | Promise<void>;
}) {
  return (
    <Card className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl px-6 text-center">
      <RefreshCw className="size-9 text-muted-moss/50" />

      <h1 className="mt-5 font-display text-3xl font-medium text-brand-black">
        Checkout tidak tersedia
      </h1>

      <p className="mt-3 max-w-lg text-xs leading-5 text-muted-moss">
        {message}
      </p>

      <Button
        type="button"
        className="mt-6"
        onClick={() => {
          void onRetry();
        }}
      >
        Coba Lagi
      </Button>
    </Card>
  );
}
