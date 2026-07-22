import type { Database } from "@/types/database";

export type CustomerPurchaseOrderStatus =
  Database["public"]["Enums"]["order_status"];

export type ProductPurchaseErrorCode =
  | "UNAUTHENTICATED"
  | "INVALID_PRODUCT_ID"
  | "INVALID_QUANTITY"
  | "QUANTITY_LIMIT_EXCEEDED"
  | "INVALID_RECEIVER_NAME"
  | "RECEIVER_NAME_TOO_LONG"
  | "PHONE_NUMBER_TOO_LONG"
  | "INVALID_SHIPPING_ADDRESS"
  | "SHIPPING_ADDRESS_TOO_LONG"
  | "PRODUCT_NOT_FOUND"
  | "PRODUCT_NOT_AVAILABLE"
  | "INSUFFICIENT_STOCK"
  | "USER_PROFILE_NOT_FOUND"
  | "BONUS_NOT_AVAILABLE"
  | "INVALID_BONUS_CONFIGURATION"
  | "BONUS_PRODUCT_NOT_FOUND"
  | "INSUFFICIENT_BONUS_STOCK"
  | "INSUFFICIENT_POINTS"
  | "PURCHASE_FAILED";

export interface PurchaseCustomerProductInput {
  productId: string;
  quantity: number;

  receiverName: string;
  phoneNumber: string;
  shippingAddress: string;

  claimBonus: boolean;
}

export interface PurchaseCustomerProductResult {
  orderId: string;
  orderStatus: CustomerPurchaseOrderStatus;

  totalPriceIdr: number;
  totalCoinsRedeemed: number;

  remainingPoints: number;
  pointsEarned: number;

  createdAt: string;
}

export type CheckoutPreparationErrorCode =
  | "UNAUTHENTICATED"
  | "INVALID_PRODUCT_SKU"
  | "INVALID_QUANTITY"
  | "QUANTITY_LIMIT_EXCEEDED"
  | "PRODUCT_NOT_FOUND"
  | "PRODUCT_NOT_AVAILABLE"
  | "INSUFFICIENT_STOCK"
  | "USER_PROFILE_NOT_FOUND"
  | "CHECKOUT_LOAD_FAILED";

export interface CustomerCheckoutProfile {
  fullName: string;
  phoneNumber: string | null;
  shippingAddress: string | null;
  totalPoints: number;
}

export interface CustomerCheckoutProduct {
  id: string;
  slug: string;
  name: string;

  priceIdr: number;
  stock: number;

  brandName: string;
  categoryName: string;
}

export interface CustomerCheckoutBonus {
  productId: string;
  productName: string;

  quantityPerProduct: number;
  totalQuantity: number;

  coinCostPerProduct: number;
  totalCoinCost: number;

  availableStock: number;

  hasEnoughStock: boolean;
  hasEnoughPoints: boolean;
  canClaim: boolean;
}

export interface CustomerCheckoutData {
  quantity: number;
  totalPriceIdr: number;

  profile: CustomerCheckoutProfile;
  product: CustomerCheckoutProduct;

  bonus: CustomerCheckoutBonus | null;
}