"use client";

import type { ReactElement } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import type { PurchasedInventoryItem } from "@/services/brand-fashion/purchasedInventoryService";

interface PurchasedMaterialDeleteDialogProps {
  item: PurchasedInventoryItem | null;
  isOpen: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function PurchasedMaterialDeleteDialog({
  item,
  isOpen,
  isDeleting,
  onClose,
  onConfirm,
}: PurchasedMaterialDeleteDialogProps): ReactElement | null {
  if (!isOpen || !item) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in-0 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-brand-black/15 bg-canvas-pure p-6 shadow-2xl cursor-default"
      >
        <button
          type="button"
          disabled={isDeleting}
          onClick={onClose}
          aria-label="Tutup dialog"
          className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full bg-canvas-warm text-brand-black transition hover:bg-brand-black/10 cursor-pointer disabled:opacity-50"
        >
          <X className="size-4" />
        </button>

        <div className="flex items-center gap-3 text-error-rust">
          <div className="flex size-10 items-center justify-center rounded-full bg-error-rust/10">
            <AlertTriangle className="size-5" />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-brand-black">
              Konfirmasi Soft Delete Material
            </h3>
            <p className="text-[11px] font-mono text-muted-moss">
              {item.purchaseId}
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2 text-xs text-brand-black">
          <p>
            Apakah Anda yakin ingin menghapus data material limbah{" "}
            <span className="font-bold text-brand-forest">{item.fabricName}</span> ini?
          </p>
          <div className="rounded-lg bg-canvas-warm/60 p-3 border border-brand-black/10 text-muted-moss text-[11px] leading-relaxed">
            Aksi ini akan menyembunyikan material dari tabel kelola (soft delete `deleted_at`). Karena sisa stok sudah <strong className="text-brand-black">0 Kg</strong>, penghapusan lunak aman dilakukan.
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <Button
            variant="outline"
            size="md"
            disabled={isDeleting}
            onClick={onClose}
          >
            Batal
          </Button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="inline-flex items-center gap-1.5 rounded-sm bg-error-rust px-4 py-2 text-xs font-semibold text-white transition hover:bg-error-rust/90 disabled:opacity-50 cursor-pointer"
          >
            <Trash2 className="size-3.5" />
            <span>{isDeleting ? "Menghapus..." : "Ya, Hapus Material"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
