"use client";

import type { ReactElement } from "react";
import {
  Layers,
  PackageCheck,
  Factory,
  Leaf,
  Droplets,
  X,
  MapPin,
  Calendar,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { formatIdr } from "@/lib/productDetail";
import type { PurchasedInventoryDetail } from "@/services/brand-fashion/purchasedInventoryService";

interface PurchasedMaterialDetailModalProps {
  detail: PurchasedInventoryDetail | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PurchasedMaterialDetailModal({
  detail,
  isOpen,
  onClose,
}: PurchasedMaterialDetailModalProps): ReactElement | null {
  if (!isOpen || !detail) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in-0 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-brand-black/15 bg-canvas-pure shadow-2xl cursor-default"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-brand-black/15 px-6 py-5 sm:px-8 bg-canvas-warm/40">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-brand-lime/50 text-brand-black font-bold">
              <Layers className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-lg font-bold text-brand-black">
                  {detail.purchaseId}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-forest/10 px-2.5 py-0.5 text-[10px] font-bold text-brand-forest uppercase">
                  <CheckCircle2 className="size-3" />
                  Selesai
                </span>
              </div>
              <p className="text-xs text-muted-moss">
                {detail.fabricName} ({detail.categoryName})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal"
            className="flex size-8 items-center justify-center rounded-full bg-canvas-warm text-brand-black transition hover:bg-brand-black/10 cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="space-y-6 overflow-y-auto p-6 sm:p-8">
          {/* Section 1: Silsilah Batch ID & Provider Origin */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-brand-black">
              <PackageCheck className="size-4 text-brand-emerald" />
              <span>Silsilah Batch & Asal Material</span>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2 rounded-xl border border-brand-black/15 bg-canvas-warm/40 p-4">
              <div>
                <p className="text-[10px] font-bold uppercase text-muted-moss">Batch Code</p>
                <p className="mt-0.5 font-mono text-sm font-bold text-brand-forest">
                  {detail.batchCode}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-muted-moss">Kota Asal Garment</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-brand-black">
                  <MapPin className="size-3 text-brand-emerald" />
                  {detail.originCity}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-muted-moss">Penyedia Limbah</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-brand-black">
                  <Factory className="size-3 text-muted-moss" />
                  {detail.providerName}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-muted-moss">Tanggal Selesai Sourcing</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-brand-black">
                  <Calendar className="size-3 text-muted-moss" />
                  {formatDate(detail.completedAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Data Ekologis (Ecological Metrics) */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-brand-black">
              <Leaf className="size-4 text-brand-emerald" />
              <span>Dampak Keberlanjutan & Ekologis</span>
            </div>

            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3.5 rounded-xl border border-brand-black/15 bg-gradient-to-br from-brand-forest to-[#315F35] p-4 text-white">
                <div className="flex size-10 items-center justify-center rounded-lg bg-brand-lime/20 text-brand-lime">
                  <Leaf className="size-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-brand-lime/80 font-bold">
                    Emisi CO₂ Terhindar
                  </p>
                  <p className="font-display text-2xl font-bold tracking-tight text-brand-lime">
                    {detail.carbonSavedKg} <span className="text-sm font-normal text-white">Kg</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 rounded-xl border border-brand-black/15 bg-canvas-warm/60 p-4">
                <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Droplets className="size-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-moss font-bold">
                    Air Bersih Dihemat
                  </p>
                  <p className="font-display text-2xl font-bold tracking-tight text-brand-black">
                    {detail.waterSavedLiter} <span className="text-sm font-normal text-muted-moss">Liter</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Ringkasan Nilai & Stok Material */}
          <div className="rounded-xl border border-brand-black/15 bg-canvas-warm/30 p-4 space-y-2">
            <div className="flex justify-between text-xs text-muted-moss">
              <span>Sisa Stok Terbeli</span>
              <span className="font-bold text-brand-black">{detail.weightBoughtKg} Kg</span>
            </div>
            <div className="flex justify-between text-xs text-muted-moss">
              <span>Harga per Kg</span>
              <span className="font-medium text-brand-black">
                {formatIdr(detail.originalPricePerKg)} / kg
              </span>
            </div>
            <div className="border-t border-brand-black/10 pt-2 flex justify-between text-xs font-bold">
              <span className="text-brand-black">Total Pembayaran Transaksi</span>
              <span className="font-display text-sm text-brand-forest">
                {formatIdr(detail.finalPriceIdr)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 flex items-center justify-between border-t border-brand-black/15 bg-canvas-warm/50 px-6 py-4 sm:px-8">
          <p className="text-[10px] text-muted-moss">
            Purchase ID: <span className="font-mono font-bold text-brand-black">{detail.purchaseId}</span>
          </p>
          <Button variant="outline" size="md" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
}

function formatDate(value: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
