import Link from "next/link";
import {
  ArrowRight,
  Factory,
  QrCode,
  ScanLine,
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

        <div className="flex min-h-44 items-center justify-center rounded-xl border border-line-trace bg-canvas-warm p-5">
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
                QR produk belum tersedia
              </p>
            </div>
          )}
        </div>
      </div>

      <Link
        href={buildTraceabilityHref(productionId)}
        className="group mt-6 inline-flex items-center gap-3 text-xs font-bold text-brand-emerald transition-colors hover:text-brand-forest"
      >
        Lihat perjalanan bahan baku

        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </DetailCard>
  );
}
