"use client";

import type { ReactElement } from "react";
import { CheckCircle2, Eye, EyeOff, Layers, Package, Scale, Shirt } from "lucide-react";

import { formatWeightKg } from "@/lib/formatter";
import type { BrandProductionItem } from "@/services/brand-fashion/circularProductionService";

interface ProductionCardProps {
  item: BrandProductionItem;
  onOpenDetail: (item: BrandProductionItem) => void;
  onFinish?: (item: BrandProductionItem) => void;
  onCancel?: (item: BrandProductionItem) => void;
  onHide?: (item: BrandProductionItem) => void;
}

export function ProductionCard({
  item,
  onOpenDetail,
  onFinish,
  onCancel,
  onHide,
}: ProductionCardProps): ReactElement {
  const isFinished =
    item.status === "finish" ||
    item.status === "finished" ||
    item.status === "Finished";

  return (
    <article className="flex flex-col justify-between rounded-xl border border-brand-black/15 bg-canvas-pure p-5 transition hover:border-brand-forest/40">
      <div>
        {/* Header: Title & Status pill */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h4 className="font-display text-sm font-bold text-brand-black truncate" title={item.productionName}>
              {item.productionName}
            </h4>
            <p className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-muted-moss">
              <Shirt className="size-3 text-brand-emerald" />
              Target: <span className="text-brand-black">{item.targetQuantity} Pcs</span>
            </p>
          </div>

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
              "Sedang Dibuat"
            )}
          </span>
        </div>

        {/* Waste Materials Badges */}
        <div className="mt-3.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-moss flex items-center gap-1">
            <Layers className="size-3 text-brand-emerald" />
            Material Limbah Terpakai:
          </p>

          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {item.materials.length > 0 ? (
              item.materials.map((mat, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 rounded-md bg-canvas-warm/70 border border-brand-black/10 px-2 py-0.5 text-[10px] font-semibold text-brand-black"
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

        {/* Total Weight Used */}
        <div className="mt-3.5 flex items-center justify-between border-t border-brand-black/10 pt-2.5 text-xs">
          <span className="text-[11px] text-muted-moss flex items-center gap-1 font-medium">
            <Scale className="size-3 text-brand-forest" /> Total Limbah:
          </span>
          <span className="font-display font-bold text-brand-forest">
            {formatWeightKg(item.totalWeightKg)}
          </span>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-4 flex items-center justify-end gap-2 pt-2 border-t border-brand-black/10">
        {/* Cancel Button (only for ongoing productions) */}
        {!isFinished && onCancel && (
          <button
            type="button"
            onClick={() => onCancel(item)}
            className="inline-flex items-center gap-1 rounded-sm border border-error-rust/30 bg-canvas-pure px-2.5 py-1.5 text-xs font-semibold text-error-rust transition hover:bg-error-rust hover:text-white cursor-pointer"
          >
            <span>Batalkan</span>
          </button>
        )}

        {/* Hide Button (only for finished productions) */}
        {isFinished && onHide && (
          <button
            type="button"
            onClick={() => onHide(item)}
            className="inline-flex items-center gap-1.5 rounded-sm border border-brand-black/15 bg-canvas-pure px-2.5 py-1.5 text-xs font-semibold text-muted-moss transition hover:border-error-rust/40 hover:text-error-rust cursor-pointer"
            title="Sembunyikan dari papan Kanban"
          >
            <EyeOff className="size-3.5" />
            <span>Sembunyikan</span>
          </button>
        )}

        {/* Detail Button */}
        <button
          type="button"
          onClick={() => onOpenDetail(item)}
          className="inline-flex items-center gap-1.5 rounded-sm border border-brand-black/15 bg-canvas-pure px-3 py-1.5 text-xs font-semibold text-brand-black transition hover:border-brand-forest hover:bg-canvas-warm cursor-pointer"
        >
          <Eye className="size-3.5 text-brand-forest" />
          <span>Detail</span>
        </button>

        {/* Move to Finished Button (if in On Progress column) */}
        {!isFinished && onFinish && (
          <button
            type="button"
            onClick={() => onFinish(item)}
            className="inline-flex items-center gap-1.5 rounded-sm bg-brand-forest px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-forest/90 cursor-pointer"
          >
            <CheckCircle2 className="size-3.5 text-brand-lime" />
            <span>Selesaikan</span>
          </button>
        )}
      </div>
    </article>
  );
}
