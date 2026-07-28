import type { Database } from "@/types/database";

export type BrandOrderFulfillmentAction =
  Database["public"]["Enums"]["order_fulfillment_action"];

export type BrandOrderStatus =
  Database["public"]["Enums"]["order_status"];

export type BrandOrderPaymentMethod =
  Database["public"]["Enums"]["order_payment_method"];

export type BrandOrderPaymentStatus =
  Database["public"]["Enums"]["order_payment_status"];

export interface BrandFulfillmentOrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  priceIdr: number;
  coinsRedeemed: number;
  isBonus: boolean;
}

export interface BrandFulfillmentOrder {
  orderId: string;
  orderStatus: BrandOrderStatus;

  receiverName: string;
  phoneNumber: string | null;
  shippingAddress: string;

  totalPriceIdr: number;
  totalCoinsRedeemed: number;
  pointsEarned: number;

  orderCreatedAt: string | null;
  processingAt: string | null;
  shippedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  pointsAwardedAt: string | null;

  trackingNumber: string | null;
  shippingNote: string | null;

  impactCarbonSavedKg: number;
  impactWaterSavedLiters: number;
  impactMaterialSavedGrams: number;
  impactsAwardedAt: string | null;

  paymentMethod: BrandOrderPaymentMethod;
  paymentStatus: BrandOrderPaymentStatus;
  amountIdr: number;
  amountCoin: number;
  paidAt: string | null;
  refundedAt: string | null;

  items: BrandFulfillmentOrderItem[];
}

export interface AdvanceBrandOrderFulfillmentInput {
  orderId: string;
  action: BrandOrderFulfillmentAction;
  trackingNumber?: string;
  shippingNote?: string;
}

export interface AdvanceBrandOrderFulfillmentResult {
  orderId: string;
  orderStatus: BrandOrderStatus;
  processingAt: string | null;
  shippedAt: string | null;
  processingBy: string | null;
  shippedBy: string | null;
  trackingNumber: string | null;
  shippingNote: string | null;
  updatedAt: string | null;
  isExisting: boolean;
}

export interface CompleteBrandOrderResult {
  orderId: string;
  orderStatus: BrandOrderStatus;
  completedAt: string | null;
  completedBy: string | null;
  pointsEarned: number;
  pointsAwardedAt: string | null;
  customerTotalPoints: number;
  impactCarbonSavedKg: number;
  impactWaterSavedLiters: number;
  impactMaterialSavedGrams: number;
  impactsAwardedAt: string | null;
  isExisting: boolean;
}

export interface CancelAndRefundBrandOrderInput {
  orderId: string;
  reason: string;
}

export interface CancelAndRefundBrandOrderResult {
  orderId: string;
  orderStatus: BrandOrderStatus;
  paymentStatus: BrandOrderPaymentStatus;
  cancelledAt: string | null;
  cancellationReason: string | null;
  stockReleasedAt: string | null;
  coinRefundedAt: string | null;
  coinsRefunded: number;
  customerTotalPoints: number;
  isExisting: boolean;
}
