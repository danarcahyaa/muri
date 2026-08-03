"use client";

import { useState, type ReactElement } from "react";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Layers,
  Package,
  Scale,
  Shirt,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { formatWeightKg } from "@/lib/formatter";
import type { BrandProductionItem } from "@/services/brand-fashion/circularProductionService";

interface HiddenProductionsCollapsibleProps {
  hiddenItems: BrandProductionItem[];
  onOpenDetail: (item: BrandProductionItem) => void;
  onUnhide: (item: BrandProductionItem) => Promise<void>;
}

export function HiddenProductionsCollapsible({
  hiddenItems,
  onOpenDetail,
  onUnhide,
}: HiddenProductionsCollapsibleProps): ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const [unhidingId, setUnhidingId] = useState<string | null>(null);

  const handleUnhideItem = async (item: BrandProductionItem): Promise<void> => {
    setUnhidingId(item.id);
    try {
      await onUnhide(item);
    } finally {
      setUnhidingId(null);
    }
  };

  return (
    <div className="rounded-2xl border border-brand-black/15 bg-canvas-pure overflow-hidden font-body">
      {/* Collapsible Header Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between bg-canvas-warm/40 px-6 py-4 transition hover:bg-canvas-warm/70 cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-canvas-warm border border-brand-black/15 text-muted-moss">
            <EyeOff className="size-4 text-brand-black" />
          </div>
          <div className="text-left">
            <h3 className="font-display text-sm font-bold text-brand-black flex items-center gap-2">
              <span>Produksi Disembunyikan</span>
              <span className="inline-flex items-center rounded-full bg-brand-black/10 px-2 py-0.5 text-xs font-semibold text-brand-black">
                {hiddenItems.length}
              </span>
            </h3>
            <p className="text-[11px] text-muted-moss">
              Daftar histori produksi pakaian yang disembunyikan dari papan Kanban utama.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-muted-moss">
          <span>{isOpen ? "Tutup" : "Lihat Semua"}</span>
          {isOpen ? (
            <ChevronUp className="size-4" />
          ) : (
            <ChevronDown className="size-4" />
          )}
        </div>
      </button>

      {/* Collapsible Body */}
      {isOpen && (
        <div className="border-t border-brand-black/15 p-6 space-y-4 bg-canvas-pure">
          {hiddenItems.length === 0 ? (
            <div className="flex h-36 flex-col items-center justify-center rounded-xl border border-dashed border-brand-black/20 bg-canvas-warm/20 p-6 text-center">
              <EyeOff className="size-6 text-muted-moss" />
              <p className="mt-2 text-xs font-semibold text-brand-black">
                Tidak ada produksi yang disembunyikan.
              </p>
              <p className="text-[11px] text-muted-moss">
                Produksi selesai yang Anda sembunyikan akan muncul di daftar ini.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {hiddenItems.map((item) => {
                const isProcessing = unhidingId === item.id;
                return (
                  <article
                    key={item.id}
                    className="flex flex-col justify-between rounded-xl border border-brand-black/15 bg-canvas-warm/20 p-4 transition hover:border-brand-forest/40"
                  >
                    <div>
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h4
                            className="font-display text-sm font-bold text-brand-black truncate"
                            title={item.productionName}
                          >
                            {item.productionName}
                          </h4>
                          <p className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-muted-moss">
                            <Shirt className="size-3 text-brand-emerald" />
                            Target:{" "}
                            <span className="text-brand-black">
                              {item.targetQuantity} Pcs
                            </span>
                          </p>
                        </div>

                        <span className="inline-flex items-center gap-1 rounded-full bg-brand-black/10 border border-brand-black/15 px-2.5 py-0.5 text-[10px] font-bold uppercase text-muted-moss">
                          Disembunyikan
                        </span>
                      </div>

                      {/* Waste Material Badges */}
                      <div className="mt-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-moss flex items-center gap-1">
                          <Layers className="size-3 text-brand-emerald" />
                          Material Limbah Terpakai:
                        </p>

                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {item.materials.length > 0 ? (
                            item.materials.map((mat, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1 rounded-md bg-canvas-pure border border-brand-black/10 px-2 py-0.5 text-[10px] font-semibold text-brand-black"
                              >
                                <Package className="size-2.5 text-muted-moss" />
                                {mat.fabricName} ({mat.allocatedWeightKg} Kg)
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-muted-moss italic">
                              Limbah Perca Sirkular
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Total Weight */}
                      <div className="mt-3 flex items-center justify-between border-t border-brand-black/10 pt-2 text-xs">
                        <span className="text-[11px] text-muted-moss flex items-center gap-1 font-medium">
                          <Scale className="size-3 text-brand-forest" /> Total Limbah:
                        </span>
                        <span className="font-display font-bold text-brand-forest">
                          {formatWeightKg(item.totalWeightKg)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-3 flex items-center justify-end gap-2 pt-2 border-t border-brand-black/10">
                      {/* Detail Button */}
                      <button
                        type="button"
                        onClick={() => onOpenDetail(item)}
                        className="inline-flex items-center gap-1.5 rounded-sm border border-brand-black/15 bg-canvas-pure px-3 py-1.5 text-xs font-semibold text-brand-black transition hover:border-brand-forest hover:bg-canvas-warm cursor-pointer"
                      >
                        <Eye className="size-3.5 text-brand-forest" />
                        <span>Detail</span>
                      </button>

                      {/* Unhide CTA Button */}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isProcessing}
                        loading={isProcessing}
                        onClick={() => void handleUnhideItem(item)}
                        className="inline-flex items-center gap-1.5 border-brand-forest text-brand-forest hover:bg-brand-forest hover:text-white font-bold"
                      >
                        <Eye className="size-3.5" />
                        <span>Tampilkan Kembali</span>
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
