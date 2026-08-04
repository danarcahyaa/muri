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

export type CustomerCheckoutPaymentMethod =
  Database["public"]["Enums"]["order_payment_method"];

export type CustomerCheckoutPaymentStatus =
  Database["public"]["Enums"]["order_payment_status"];

export type SecureCheckoutErrorCode =
  | "UNAUTHENTICATED"
  | "CONFIRMATION_REQUIRED"
  | "INVALID_CHECKOUT_TOKEN"
  | "INVALID_PRODUCT_ID"
  | "INVALID_PAYMENT_METHOD"
  | "INVALID_QUANTITY"
  | "QUANTITY_LIMIT_EXCEEDED"
  | "INVALID_RECEIVER_NAME"
  | "RECEIVER_NAME_TOO_LONG"
  | "PHONE_NUMBER_TOO_LONG"
  | "INVALID_SHIPPING_ADDRESS"
  | "SHIPPING_ADDRESS_TOO_LONG"
  | "IDEMPOTENCY_CONFLICT"
  | "PAYMENT_RECORD_NOT_FOUND"
  | "USER_PROFILE_NOT_FOUND"
  | "PRODUCT_NOT_FOUND"
  | "PRODUCT_CONFIGURATION_CHANGED"
  | "PRODUCT_NOT_AVAILABLE"
  | "INSUFFICIENT_STOCK"
  | "INVALID_BONUS_COIN_REWARD"
  | "POINT_REWARD_TOO_LARGE"
  | "INVALID_BONUS_CONFIGURATION"
  | "BONUS_PRODUCT_NOT_FOUND"
  | "BONUS_PRODUCT_NOT_AVAILABLE"
  | "BONUS_QUANTITY_TOO_LARGE"
  | "INSUFFICIENT_BONUS_STOCK"
  | "PAYMENT_METHOD_NOT_ALLOWED"
  | "INVALID_PRODUCT_PRICE"
  | "COIN_AMOUNT_TOO_LARGE"
  | "INSUFFICIENT_POINTS"
  | "CHECKOUT_LOAD_FAILED"
  | "CHECKOUT_FAILED";

export interface CustomerCheckoutPreviewProfile {
  fullName: string;
  phoneNumber: string | null;
  shippingAddress: string | null;
  totalPoints: number;
}

export interface CustomerCheckoutPreviewProduct {
  id: string;
  slug: string;
  name: string;

  paymentOption: Database["public"]["Enums"]["product_payment_option"];

  priceIdr: number;
  stock: number;

  brandName: string;
  categoryName: string;
}

export interface CustomerCheckoutPreviewProductBonus {
  productId: string;
  productName: string;

  quantityPerProduct: number;
  totalQuantity: number;

  availableStock: number;
  hasEnoughStock: boolean;
}

export interface CustomerCheckoutPreviewReward {
  productBonus: CustomerCheckoutPreviewProductBonus | null;

  coinRewardPerProduct: number;
  totalCoinReward: number;
}

export interface CustomerCheckoutPreview {
  quantity: number;

  profile: CustomerCheckoutPreviewProfile;
  product: CustomerCheckoutPreviewProduct;

  availablePaymentMethods: CustomerCheckoutPaymentMethod[];

  totalPriceIdr: number | null;

  hasEnoughCoinBalance: boolean;

  reward: CustomerCheckoutPreviewReward | null;
}

export interface CreateCustomerCheckoutOrderInput {
  productId: string;
  quantity: number;

  receiverName: string;
  phoneNumber: string;
  shippingAddress: string;

  paymentMethod: CustomerCheckoutPaymentMethod;

  checkoutToken: string;
  confirmationAccepted: boolean;
}

export interface CreateCustomerCheckoutOrderResult {
  orderId: string;
  checkoutToken: string;

  orderStatus: Database["public"]["Enums"]["order_status"];

  paymentMethod: CustomerCheckoutPaymentMethod;

  paymentStatus: CustomerCheckoutPaymentStatus;

  amountIdr: number;
  amountCoin: number;

  totalCoinsRedeemed: number;
  pointsEarned: number;
  remainingPoints: number;

  expiresAt: string | null;
  createdAt: string;

  isExisting: boolean;
}
