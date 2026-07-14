import Image from "next/image";
import { Check, PackageSearch } from "lucide-react";

import type { PurchasedMaterial } from "@/data/aiMaterial";

type PurchasedMaterialListProps = {
  materials: PurchasedMaterial[];
  selectedId: string;
  onSelect: (materialId: string) => void;
};

export default function PurchasedMaterialList({
  materials,
  selectedId,
  onSelect,
}: PurchasedMaterialListProps) {
  return (
    <div className="h-[320px] min-w-0 overflow-hidden rounded-2xl border border-line-trace bg-canvas-warm/25 p-4 sm:h-[340px]">
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-lime text-brand-black">
          <PackageSearch className="size-5" strokeWidth={1.8} />
        </div>

        <div className="min-w-0">
          <h4 className="text-sm font-bold text-brand-black">
            Material yang Dibeli
          </h4>

          <p className="mt-1 text-[11px] text-muted-moss">
            Pilih material yang ingin dipindai.
          </p>
        </div>
      </div>

      <div className="muri-scrollbar mt-4 h-[225px] space-y-2 overflow-y-auto pr-2 sm:h-[245px]">
        {materials.map((material) => {
          const isSelected = selectedId === material.id;

          return (
            <button
              key={material.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelect(material.id)}
              className={`group flex w-full min-w-0 items-center gap-3 rounded-xl border p-2.5 text-left transition ${
                isSelected
                  ? "border-brand-emerald bg-brand-emerald/[0.07]"
                  : "border-line-trace bg-canvas-pure hover:border-brand-emerald/40"
              }`}
            >
              <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-canvas-pure">
                <Image
                  src={material.image}
                  alt={material.alt}
                  fill
                  sizes="80px"
                  className="object-contain p-1"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-brand-black">
                  {material.name}
                </p>

                <p className="mt-1 text-[10px] font-bold uppercase text-brand-emerald">
                  {material.batchId}
                </p>

                <p className="mt-1 truncate text-[10px] text-muted-moss">
                  {material.description}
                </p>
              </div>

              <div
                className={`flex size-7 shrink-0 items-center justify-center rounded-full border transition ${
                  isSelected
                    ? "border-brand-emerald bg-brand-emerald text-white"
                    : "border-line-trace text-transparent"
                }`}
              >
                <Check className="size-3.5" strokeWidth={2.5} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}