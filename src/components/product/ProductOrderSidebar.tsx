"use client";

import { useState } from "react";

import ProductOrderCard from "@/components/product/ProductOrderCard";
import type {
  ProductBonusSummary,
  ProductPaymentOption,
} from "@/types/product";
import ProductTraceabilitySidebar from "./ProductTraceabilitySidebar";

interface ProductOrderSidebarProps {
  productId?: string;
  slug: string;
  productName: string;

  paymentOption: ProductPaymentOption;
  priceIdr: number;

  stock: number;

  bonusProduct: ProductBonusSummary | null;
  bonusProductQty: number;
  bonusCoinCost: number;

  productionId: string;
  qrCodeUrl: string | null;
  brandName: string;
  carbonSavedKg: number;
  waterSavedLiter: number;
}

export default function ProductOrderSidebar({
  productionId,
  qrCodeUrl,
  brandName,
  carbonSavedKg,
  waterSavedLiter,
  ...orderProps
}: ProductOrderSidebarProps) {
  const [isTraceabilityOpen, setIsTraceabilityOpen] = useState(false);

  return (
    <>
      <aside className="self-start lg:sticky lg:top-24">
        <ProductOrderCard
          {...orderProps}
          onOpenTraceability={() => setIsTraceabilityOpen(true)}
        />
      </aside>

      <ProductTraceabilitySidebar
        open={isTraceabilityOpen}
        onOpenChange={setIsTraceabilityOpen}
        sku={orderProps.slug}
        productionId={productionId}
        qrCodeUrl={qrCodeUrl}
        brandName={brandName}
        carbonSavedKg={carbonSavedKg}
        waterSavedLiter={waterSavedLiter}
      />
    </>
  );
}
