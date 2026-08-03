"use client";

import type { ReactElement } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Factory,
  Layers,
  Package,
  Shirt,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { formatWeightKg } from "@/lib/formatter";
import type { BrandProductionItem } from "@/services/brand-fashion/circularProductionService";

interface ProductionDetailModalProps {
  item: BrandProductionItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductionDetailModal({
  item,
  isOpen,
  onClose,
}: ProductionDetailModalProps): ReactElement | null {
  if (!isOpen || !item) return null;

  const isFinished =
    item.status === "finish" ||
    item.status === "finished" ||
    item.status === "Finished";

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in-0 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-brand-black/15 bg-canvas-pure cursor-default"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-brand-black/15 bg-canvas-warm/40 px-6 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-brand-lime text-brand-black font-bold">
              <Factory className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-lg font-bold text-brand-black">
                  {item.productionName}
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                    isFinished
                      ? "bg-brand-forest/10 text-brand-forest border border-brand-forest/20"
                      : "bg-amber-50 text-amber-800 border border-amber-200"
                  }`}
                >
                  {isFinished ? (
                    <>
                      <CheckCircle2 className="size-3 text-brand-forest" />
                      Selesai
                    </>
                  ) : (
                    <>
                      <Clock className="size-3 text-amber-800" />
                      Sedang Dibuat
                    </>
                  )}
                </span>
              </div>
              <p className="text-xs text-muted-moss">
                Target Produksi: {item.targetQuantity} Pcs
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

        {/* Content Body */}
        <div className="space-y-6 overflow-y-auto p-6 sm:p-8">
          {/* Production Specs */}
          <div className="grid gap-3 sm:grid-cols-2 rounded-xl border border-brand-black/15 bg-canvas-warm/40 p-4">
            <div>
              <p className="text-[10px] font-bold uppercase text-muted-moss">Target Unit Produksi</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm font-bold text-brand-black">
                <Shirt className="size-4 text-brand-emerald" />
                {item.targetQuantity} Pcs
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-muted-moss">Total Alokasi Limbah</p>
              <p className="mt-0.5 font-display text-sm font-bold text-brand-forest">
                {formatWeightKg(item.totalWeightKg)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-muted-moss">Tanggal Mulai Produksi</p>
              <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-brand-black">
                <Calendar className="size-3 text-muted-moss" />
                {formatDate(item.startedAt)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-muted-moss">Tanggal Selesai Produksi</p>
              <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-brand-black">
                <Calendar className="size-3 text-muted-moss" />
                {item.finishedAt ? formatDate(item.finishedAt) : "Sedang Berjalan"}
              </p>
            </div>
          </div>

          {/* Allocated Waste Materials Table */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-brand-black mb-3">
              <Layers className="size-4 text-brand-emerald" />
              <span>Daftar Material Limbah Teralokasi</span>
            </div>

            <div className="overflow-hidden rounded-xl border border-brand-black/15 bg-canvas-pure">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-brand-black/15 bg-canvas-warm/50 text-muted-moss">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">Purchase ID</th>
                    <th className="px-4 py-2.5 font-medium">Nama Limbah / Material</th>
                    <th className="px-4 py-2.5 font-medium text-right">Berat Teralokasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-black/10">
                  {item.materials.length > 0 ? (
                    item.materials.map((mat, idx) => (
                      <tr key={idx} className="hover:bg-canvas-warm/30">
                        <td className="px-4 py-3 font-mono font-bold text-brand-forest">
                          {mat.purchaseId}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Package className="size-3.5 text-muted-moss shrink-0" />
                            <div>
                              <p className="font-semibold text-brand-black">{mat.fabricName}</p>
                              <span className="text-[10px] text-muted-moss">{mat.categoryName}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-brand-black">
                          {mat.allocatedWeightKg} Kg
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="p-4 text-center text-muted-moss text-xs italic">
                        Limbah perca sirkular teralokasi.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 flex items-center justify-between border-t border-brand-black/15 bg-canvas-warm/40 px-6 py-4 sm:px-8">
          <p className="text-[10px] text-muted-moss">
            Production ID: <span className="font-mono font-bold text-brand-black">{item.id}</span>
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
