import type { Database } from "@/types/database";

export type CustomerOrderStatus = Database["public"]["Enums"]["order_status"];

export type CustomerOrderPaymentMethod =
  Database["public"]["Enums"]["order_payment_method"];

export type CustomerOrderPaymentStatus =
  Database["public"]["Enums"]["order_payment_status"];

export interface CustomerOrderItem {
  id: string;
  productId: string;

  productName: string;

  priceIdr: number;
  quantity: number;

  coinsRedeemed: number;
  isBonusClaimed: boolean;

  createdAt: string | null;
}

export interface CustomerOrder {
  id: string;
  status: CustomerOrderStatus;

  receiverName: string;
  phoneNumber: string | null;
  shippingAddress: string;

  totalPriceIdr: number;
  totalCoinsRedeemed: number;
  pointsEarned: number;

  createdAt: string | null;
  updatedAt: string | null;

  payment: CustomerOrderPayment | null;
  items: CustomerOrderItem[];
}

export interface CustomerOrderPayment {
  id: string;

  method: CustomerOrderPaymentMethod;
  status: CustomerOrderPaymentStatus;

  amountIdr: number;
  amountCoin: number;

  provider: string | null;
  providerReference: string | null;
  proofUrl: string | null;

  expiresAt: string | null;
  submittedAt: string | null;
  paidAt: string | null;
  failedAt: string | null;
  refundedAt: string | null;
  expiredAt: string | null;

  createdAt: string;
  updatedAt: string;
}
