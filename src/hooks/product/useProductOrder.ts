"use client";

import { useMemo, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import type {
  ProductBonusSummary,
  ProductPaymentOption,
} from "@/types/product";

interface UseProductOrderOptions {
  slug: string;
  paymentOption: ProductPaymentOption;
  priceIdr: number;
  priceCoin: number | null;
  stock: number;
  bonusProduct: ProductBonusSummary | null;
  bonusProductQty: number;
}

export function useProductOrder({
  slug,
  paymentOption,
  priceIdr,
  priceCoin,
  stock,
  bonusProduct,
  bonusProductQty,
}: UseProductOrderOptions) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const availableStock = Math.max(0, Math.floor(stock));
  const [quantity, setQuantity] = useState(availableStock > 0 ? 1 : 0);
  const isSoldOut = availableStock === 0;

  const acceptsIdr =
    paymentOption === "idr" || paymentOption === "idr_or_coin";

  const acceptsCoin =
    paymentOption === "coin" || paymentOption === "idr_or_coin";

  /*
   * Checkout saat ini hanya memproses pembayaran IDR.
   * Opsi coin tetap ditampilkan, tetapi tombol checkout ditahan sampai
   * alur pembayaran baru tersedia.
   */
  const requiresNewPaymentFlow = paymentOption !== "idr";

  const totalPriceIdr = priceIdr * quantity;
  const totalPriceCoin =
    priceCoin === null ? null : priceCoin * quantity;

  const totalBonusQty =
    bonusProduct && bonusProductQty > 0
      ? quantity * bonusProductQty
      : 0;

  const checkoutPath = useMemo(
    () =>
      `/produk/${encodeURIComponent(slug)}/checkout?quantity=${quantity}`,
    [quantity, slug],
  );

  const checkoutHref = user
    ? checkoutPath
    : `/auth/login?redirect=${encodeURIComponent(checkoutPath)}`;

  function decreaseQuantity() {
    setQuantity((current) => Math.max(1, current - 1));
  }

  function increaseQuantity() {
    setQuantity((current) => Math.min(availableStock, current + 1));
  }

  return {
    user,
    isAuthLoading,
    quantity,
    isSoldOut,
    availableStock,
    acceptsIdr,
    acceptsCoin,
    requiresNewPaymentFlow,
    totalPriceIdr,
    totalPriceCoin,
    totalBonusQty,
    checkoutHref,
    decreaseQuantity,
    increaseQuantity,
  };
}
