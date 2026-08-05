"use client";

import { type ReactElement } from "react";
import {
  Building2,
  MapPin,
  Truck,
  Droplets,
  Leaf,
  Tag,
  Scale,
  DollarSign,
  ShieldCheck,
} from "lucide-react";
import { formatCurrencyIDR, formatWeightKg } from "@/lib/formatter";
import type { SourcingWastePostDetailItem } from "@/types/sourcing";

interface WasteMainInfoProps {
  material: SourcingWastePostDetailItem;
}

export function WasteMainInfo({ material }: WasteMainInfoProps): ReactElement {
  return (
    <div className="space-y-6">
      {/* Title & Provider Header */}
      <div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-moss mb-2">
          <span className="inline-flex items-center gap-1 font-medium text-brand-forest bg-brand-forest/10 px-2.5 py-1 rounded-full">
            <Building2 className="size-3.5" />
            {material.providerName}
          </span>
          <span>•</span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5 text-muted-moss" />
            {material.providerLocation}
          </span>
        
        </div>

        <h1 className="font-display font-bold text-2xl sm:text-3xl text-brand-black tracking-tight leading-tight">
          {material.customFabricName}
        </h1>

        {material.batchCode && (
          <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-moss font-mono bg-canvas-warm px-2.5 py-0.5 rounded-sm border border-brand-black/10">
            <ShieldCheck className="size-3.5 text-brand-forest" />
            <span>ID Batch: {material.batchCode}</span>
          </div>
        )}
      </div>

      {/* Main Material Specifications Grid */}
      <div className="grid grid-cols-2 gap-5 p-4 sm:p-5 rounded-xl bg-canvas-pure border border-brand-black/15">
        <div className="space-y-1">
          <span className="flex items-center gap-1 text-[11px] text-muted-moss uppercase tracking-wider font-semibold">
            <Tag className="size-3 text-brand-forest" />
            Jenis Material
          </span>
          <p className="font-display font-bold text-sm text-brand-black">
            {material.categoryName}
          </p>
        </div>

        <div className="space-y-1">
          <span className="flex items-center gap-1 text-[11px] text-muted-moss uppercase tracking-wider font-semibold">
            <Scale className="size-3 text-brand-forest" />
            Stok Tersedia
          </span>
          <p className="font-display font-bold text-sm text-brand-black">
            {formatWeightKg(material.weightKg)}
          </p>
        </div>

        <div className="space-y-1">
          <span className="flex items-center gap-1 text-[11px] text-muted-moss uppercase tracking-wider font-semibold">
            <DollarSign className="size-3 text-brand-forest" />
            Harga per Kg
          </span>
          <p className="font-display font-bold text-sm text-brand-forest">
            {formatCurrencyIDR(material.pricePerKg)}
          </p>
        </div>

        <div className="space-y-1">
          <span className="flex items-center gap-1 text-[11px] text-muted-moss uppercase tracking-wider font-semibold">
            <Scale className="size-3 text-brand-forest" />
            Minimum Order
          </span>
          <p className="font-display font-bold text-sm text-brand-black">
            {formatWeightKg(material.minimumOrderKg)}
          </p>
        </div>
      </div>

      {/* Ecological Impact Section */}
      <div className="rounded-xl p-5 bg-gradient-to-br from-brand-forest to-[#134939] text-white space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-sm bg-brand-lime/20 text-brand-lime">
            <Leaf className="size-5" />
          </div>
          <div>
            <h2 className="font-display font-bold text-sm sm:text-base text-white">
              Estimasi Dampak Ekologis
            </h2>
            <p className="text-xs text-brand-lime/90">
              Potensi kontribusi keberlanjutan jika material ini diselamatkan
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/15">
          <div className="space-y-0.5">
            <span className="flex items-center gap-1 text-xs text-white/80">
              <Droplets className="size-3.5 text-brand-lime" />
              Air Dihemat (H₂O)
            </span>
            <p className="font-display text-xl sm:text-2xl font-bold text-brand-lime">
              {material.waterSavedLiter.toLocaleString("id-ID")} <span className="text-xs font-normal text-white">Liter</span>
            </p>
          </div>

          <div className="space-y-0.5">
            <span className="flex items-center gap-1 text-xs text-white/80">
              <Leaf className="size-3.5 text-brand-lime" />
              Emisi Ditekan (CO₂)
            </span>
            <p className="font-display text-xl sm:text-2xl font-bold text-brand-lime">
              {material.carbonSavedKg.toLocaleString("id-ID")} <span className="text-xs font-normal text-white">Kg</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
