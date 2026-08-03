"use client";

import type { ReactElement } from "react";
import { CheckCircle2, Shirt, X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { formatWeightKg } from "@/lib/formatter";
import type { BrandProductionItem } from "@/services/brand-fashion/circularProductionService";

interface FinishProductionDialogProps {
  item: BrandProductionItem | null;
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function FinishProductionDialog({
  item,
  isOpen,
  isSubmitting,
  onClose,
  onConfirm,
}: FinishProductionDialogProps): ReactElement | null {
  if (!isOpen || !item) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in-0 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-brand-black/15 bg-canvas-pure cursor-default"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-brand-black/15 bg-canvas-warm/40 px-6 py-4">
          <div className="flex items-center gap-2.5 text-brand-forest">
            <CheckCircle2 className="size-5" />
            <h3 className="font-display text-base font-bold text-brand-black">
              Konfirmasi Penyelesaian Produksi
            </h3>
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            aria-label="Tutup modal"
            className="flex size-7 items-center justify-center rounded-full bg-canvas-warm text-brand-black transition hover:bg-brand-black/10 cursor-pointer disabled:opacity-50"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-brand-black leading-relaxed">
            Apakah Anda yakin ingin menyelesaikan batch produksi{" "}
            <span className="font-bold text-brand-forest">{item.productionName}</span>?
          </p>

          <div className="rounded-xl border border-brand-black/15 bg-canvas-warm/50 p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between text-muted-moss">
              <span>Target Hasil Produksi:</span>
              <span className="font-bold text-brand-black flex items-center gap-1">
                <Shirt className="size-3.5 text-brand-emerald" />
                {item.targetQuantity} Pcs
              </span>
            </div>
            <div className="flex items-center justify-between text-muted-moss">
              <span>Total Limbah Kain Terpakai:</span>
              <span className="font-bold text-brand-forest">
                {formatWeightKg(item.totalWeightKg)}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-brand-forest/20 bg-brand-forest/5 p-3.5 flex items-start gap-2.5 text-xs text-brand-forest">
            <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
            <span>
              Status produksi akan dipindahkan ke kolom <strong>Selesai</strong> dan tercatat secara permanen di riwayat sirkular brand Anda.
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-brand-black/15 bg-canvas-warm/40 px-6 py-4">
          <Button
            variant="outline"
            size="md"
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
          >
            Batal
          </Button>
          <Button
            variant="default"
            size="md"
            loading={isSubmitting}
            disabled={isSubmitting}
            onClick={() => void onConfirm()}
            className="bg-brand-forest text-white hover:bg-brand-forest/90 border-transparent font-bold"
          >
            {isSubmitting ? "Menyelesaikan..." : "Ya, Selesaikan Produksi"}
          </Button>
        </div>
      </div>
    </div>
  );
}
