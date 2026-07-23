import ProductOrderCard from "@/components/product/ProductOrderCard";
import type {
  ProductBonusSummary,
  ProductPaymentOption,
} from "@/types/product";

interface ProductOrderSidebarProps {
  slug: string;
  productName: string;

  paymentOption: ProductPaymentOption;
  priceIdr: number;
  priceCoin: number | null;

  stock: number;

  bonusProduct: ProductBonusSummary | null;
  bonusProductQty: number;
  bonusCoinCost: number;
}

export default function ProductOrderSidebar(props: ProductOrderSidebarProps) {
  return (
    <aside className="self-start lg:sticky lg:top-24">
      <ProductOrderCard {...props} />
    </aside>
  );
}
