import { ImageOff, Leaf } from "lucide-react";

import { formatMaterialStatus } from "@/lib/materialDetail";
import type { MaterialDetailItem } from "@/types/material";

interface MaterialVisualCardProps {
  material: MaterialDetailItem;
}

export default function MaterialVisualCard({
  material,
}: MaterialVisualCardProps) {
  return (
    <section className="rounded-2xl border border-line-trace bg-canvas-pure p-4 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-4 px-1 pb-5">
        <div className="flex items-center gap-3 text-brand-emerald">
          <Leaf className="size-4" strokeWidth={2} />

          <p className="text-xs font-bold uppercase tracking-tight">
            Dokumentasi Utama
          </p>
        </div>

        <span className="rounded-full bg-brand-lime px-5 py-2.5 text-[11px] font-bold text-brand-forest">
          {formatMaterialStatus(material.status)}
        </span>
      </div>

      <div className="relative aspect-[16/7.2] overflow-hidden rounded-xl bg-canvas-warm">
        {material.primaryImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={material.primaryImageUrl}
            alt={material.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-muted-moss/50">
            <ImageOff className="size-10" strokeWidth={1.4} />

            <span className="text-xs">
              Foto material belum tersedia
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
