import {
  ExternalLink,
  MapPin,
  Store,
} from "lucide-react";

import DetailCard from "@/components/ui/detail/DetailCard";
import type { ProductBrandDetail } from "@/types/product";

interface ProductBrandCardProps {
  brand: ProductBrandDetail;
}

export default function ProductBrandCard({
  brand,
}: ProductBrandCardProps) {
  const address =
    brand.warehouseAddress || brand.address;

  return (
    <DetailCard
      eyebrow="Brand Produk"
      title="Tentang Brand"
      icon={Store}
    >
      <div className="grid gap-6 rounded-2xl border border-line-trace p-6 sm:grid-cols-[72px_minmax(0,1fr)] sm:p-7">
        <div className="flex size-[72px] items-center justify-center rounded-full bg-brand-lime font-display text-3xl font-semibold text-brand-forest">
          {brand.name.charAt(0).toUpperCase() || "M"}
        </div>

        <div className="min-w-0">
          <h3 className="font-display text-2xl font-medium tracking-[-0.035em] text-brand-black">
            {brand.name}
          </h3>

          {brand.shortStory && (
            <p className="mt-4 text-sm leading-7 text-muted-moss">
              {brand.shortStory}
            </p>
          )}

          {address && (
            <div className="mt-5 flex gap-3 text-xs leading-relaxed text-muted-moss">
              <MapPin className="mt-0.5 size-4 shrink-0 text-brand-emerald" />
              <span>{address}</span>
            </div>
          )}

          {brand.warehouseMapsUrl && (
            <a
              href={brand.warehouseMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-brand-emerald transition-colors hover:text-brand-forest"
            >
              Buka lokasi warehouse
              <ExternalLink className="size-3.5" />
            </a>
          )}
        </div>
      </div>
    </DetailCard>
  );
}
