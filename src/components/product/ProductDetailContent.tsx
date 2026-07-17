import {
  Droplets,
  Leaf,
  ListChecks,
} from "lucide-react";

import ProductBrandCard from "@/components/product/ProductBrandCard";
import ProductTraceabilityCard from "@/components/product/ProductTraceabilityCard";
import ProductVisualCard from "@/components/product/ProductVisualCard";
import DetailCard from "@/components/ui/detail/DetailCard";
import DetailInfoItem from "@/components/ui/detail/DetailInfoItem";
import RichTextContent from "@/components/ui/RichTextContent";
import { formatDecimal } from "@/lib/product-detail";
import type { ProductDetailItem } from "@/types/product";

interface ProductDetailContentProps {
  product: ProductDetailItem;
}

export default function ProductDetailContent({
  product,
}: ProductDetailContentProps) {
  const bonusText = product.bonusProduct
    ? `Bonus ${product.bonusProductQty}× ${product.bonusProduct.name}`
    : null;

  return (
    <div className="space-y-8">
      <ProductVisualCard
        title={product.name}
        brandName={product.brand.name}
        categoryName={product.categoryName}
        bonusText={bonusText}
      />

      <DetailCard
        eyebrow="Informasi Produk"
        title="Spesifikasi & Detail"
        icon={ListChecks}
      >
        {product.detailHtml ? (
          <RichTextContent
            html={product.detailHtml}
            mode="rich"
            className="text-sm leading-7 text-muted-moss"
          />
        ) : (
          <p className="text-sm leading-7 text-muted-moss">
            Detail produk belum tersedia.
          </p>
        )}
      </DetailCard>

      <DetailCard
        eyebrow="Dampak Produk"
        title="Dampak Lingkungan"
        icon={Leaf}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <DetailInfoItem
            icon={Leaf}
            label="Karbon Dihemat"
            value={`${formatDecimal(
              product.carbonSavedKg,
            )} kg CO₂e`}
          />

          <DetailInfoItem
            icon={Droplets}
            label="Air Dihemat"
            value={`${formatDecimal(
              product.waterSavedLiter,
              0,
            )} liter`}
          />
        </div>
      </DetailCard>

      <ProductTraceabilityCard
        sku={product.slug}
        productionId={product.productionId}
        qrCodeUrl={product.qrCodeUrl}
      />

      <ProductBrandCard brand={product.brand} />
    </div>
  );
}
