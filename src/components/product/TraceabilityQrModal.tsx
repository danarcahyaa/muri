"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, QrCode, ScanLine } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";

interface TraceabilityQrModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  qrUrl: string;
  batchOrSku: string;
  redirectUrl: string;
}

export function TraceabilityQrModal({
  open,
  onOpenChange,
  qrUrl,
  batchOrSku,
  redirectUrl,
}: TraceabilityQrModalProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(redirectUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 text-center sm:max-w-md rounded-2xl">
        <DialogHeader className="items-center text-center">
          <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-brand-lime/70 text-brand-forest">
            <ScanLine className="size-5" />
          </div>
          <DialogTitle className="mt-2 font-display text-xl font-bold text-brand-black">
            Paspor Sirkular Digital
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-moss">
            Arahkan kamera smartphone Anda ke QR Code di bawah untuk langsung membuka riwayat penelusuran.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 flex flex-col items-center justify-center">
          {/* Big crisp QR Container with gentle rounding so corners are NEVER cut off */}
          <div className="relative flex size-64 items-center justify-center rounded-lg border-2 border-brand-forest/20 bg-white p-3 shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrUrl}
              alt={`QR Code Traceability ${batchOrSku}`}
              className="size-full object-contain"
            />
          </div>

          <p className="mt-3 font-mono text-xs font-bold text-brand-forest bg-brand-lime/30 px-3 py-1 rounded-full">
            Batch #{batchOrSku}
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand-black/15 bg-canvas-warm px-4 py-2.5 text-xs font-semibold text-brand-black transition hover:bg-brand-forest/10"
          >
            {copied ? (
              <>
                <Check className="size-4 text-brand-emerald" />
                Link Tersalin!
              </>
            ) : (
              <>
                <Copy className="size-4" />
                Salin Link
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
