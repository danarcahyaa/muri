import type { Database } from "@/types/database";

export type ProductStatus = Database["public"]["Enums"]["product_status"];

export type ProductPaymentOption =
  Database["public"]["Enums"]["product_payment_option"];
export interface ProductCatalogItem {
  id: string;

  /** SKU dipakai sebagai slug publik karena tabel products belum memiliki kolom slug. */
  slug: string;

  name: string;
  description: string | null;

  paymentOption: ProductPaymentOption;
  priceIdr: number;

  brandId: string;
  brandName: string;

  categoryId: number;
  categoryName: string;

  createdAt: string | null;
}
export interface ProductBonusSummary {
  id: string;
  slug: string;
  name: string;
  priceIdr: number;
  stock: number;
  status: ProductStatus;
}

export interface ProductBrandDetail {
  id: string;
  name: string;
  shortStory: string | null;
  address: string | null;
  warehouseAddress: string | null;
  warehouseMapsUrl: string | null;
  socialMediaLinks: unknown | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface ProductDetailItem {
  id: string;
  slug: string;

  name: string;
  descriptionHtml: string | null;
  detailHtml: string;

  paymentOption: ProductPaymentOption;
  priceIdr: number;

  stock: number;
  carbonSavedKg: number;
  waterSavedLiter: number;

  status: ProductStatus;
  productionId: string;
  qrCodeUrl: string | null;

  brand: ProductBrandDetail;

  categoryId: number;
  categoryName: string;

  bonusProduct: ProductBonusSummary | null;
  bonusProductQty: number;
  bonusCoinCost: number;

  createdAt: string | null;
  updatedAt: string | null;
}
