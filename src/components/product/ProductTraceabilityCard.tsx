import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Factory,
  Leaf,
  Package,
  QrCode,
  ScanLine,
  Scissors,
} from "lucide-react";

import DetailCard from "@/components/ui/detail/DetailCard";
import DetailInfoItem from "@/components/ui/detail/DetailInfoItem";
import { buildTraceabilityHref } from "@/lib/productDetail";

interface ProductTraceabilityCardProps {
  sku: string;
  productionId: string;
  qrCodeUrl: string | null;
}

export default function ProductTraceabilityCard({
  sku,
  productionId,
  qrCodeUrl,
}: ProductTraceabilityCardProps) {
  return (
    <DetailCard
      eyebrow="Traceability"
      title="Perjalanan Bahan Baku"
      icon={ScanLine}
    >
      {/* Top Details & QR Section */}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_180px]">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <DetailInfoItem
            icon={QrCode}
            label="SKU Produk"
            value={sku}
          />

          <DetailInfoItem
            icon={Factory}
            label="ID Produksi"
            value={productionId}
          />
        </div>

        <div className="flex min-h-44 items-center justify-center rounded-xl border border-line-trace bg-canvas-warm/50 p-5">
          {qrCodeUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrCodeUrl}
              alt={`QR traceability ${sku}`}
              className="size-32 object-contain"
            />
          ) : (
            <div className="text-center text-muted-moss/55">
              <QrCode
                className="mx-auto size-10"
                strokeWidth={1.4}
              />
              <p className="mt-3 text-[10px] leading-relaxed">
                QR produk terverifikasi MURI
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 3-Stage Circular Tracing Timeline */}
      <div className="mt-6 space-y-3 rounded-xl border border-line-trace bg-canvas-warm/40 p-4 sm:p-5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-moss">
          Alur Penelusuran Material Sirkular
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
          {/* Step 1: Waste Source */}
          <div className="rounded-lg border border-line-trace bg-canvas-pure p-3.5 space-y-1.5">
            <div className="flex items-center gap-2 text-brand-emerald">
              <Package className="size-4 shrink-0" />
              <span className="text-[10px] font-bold uppercase">1. Asal Limbah</span>
            </div>
            <p className="text-xs font-bold text-brand-black">PT Tekstil Jaya Limbah</p>
            <p className="text-[11px] text-muted-moss">Kain Denim & Cotton Deadstock 14oz</p>
          </div>

          {/* Step 2: Brand Crafting */}
          <div className="rounded-lg border border-line-trace bg-canvas-pure p-3.5 space-y-1.5">
            <div className="flex items-center gap-2 text-brand-emerald">
              <Scissors className="size-4 shrink-0" />
              <span className="text-[10px] font-bold uppercase">2. Pengolahan</span>
            </div>
            <p className="text-xs font-bold text-brand-black">Memuai Sustainable</p>
            <p className="text-[11px] text-muted-moss">Teknik Patchwork & Zero-Waste</p>
          </div>

          {/* Step 3: Product Impact */}
          <div className="rounded-lg border border-line-trace bg-canvas-pure p-3.5 space-y-1.5">
            <div className="flex items-center gap-2 text-brand-forest">
              <CheckCircle2 className="size-4 shrink-0 text-brand-forest" />
              <span className="text-[10px] font-bold uppercase">3. Dampak Sirkular</span>
            </div>
            <p className="text-xs font-bold text-brand-black flex items-center gap-1">
              <Leaf className="size-3 text-brand-emerald" /> 1.8 kg CO₂e Saved
            </p>
            <p className="text-[11px] text-muted-moss">450 Liter Air Hemat</p>
          </div>
        </div>
      </div>

      <Link
        href={buildTraceabilityHref(productionId)}
        className="group mt-6 inline-flex items-center gap-3 text-xs font-bold text-brand-emerald transition-colors hover:text-brand-forest"
      >
        Lihat detail lengkap perjalanan bahan baku
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </DetailCard>
  );
}
