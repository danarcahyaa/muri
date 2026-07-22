import type { Database } from "@/types/database";

export type CustomerOrderStatus =
  Database["public"]["Enums"]["order_status"];

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

  items: CustomerOrderItem[];
}