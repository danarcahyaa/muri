import type { QueryData } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabaseClient";
import { translateSupabaseError } from "@/lib/supabaseError";
import type { BaseResponse } from "@/types/common";
import type {
  CustomerOrder,
  CustomerOrderItem,
  CustomerOrderPayment,
  CustomerOrderStatus,
} from "@/types/customerOrder";

const CUSTOMER_ORDER_SELECT = `
  id,
  order_status,
  receiver_name,
  phone_number,
  shipping_address,
  total_price_idr,
  total_coins_redeemed,
  points_earned,
  created_at,
  updated_at,

  order_items (
    id,
    product_id,
    product_name_snapshot,
    price_snapshot_idr,
    quantity,
    coins_redeemed_snapshot,
    is_bonus_claimed,
    created_at
  ),

  order_payments (
    id,
    payment_method,
    payment_status,
    amount_idr,
    amount_coin,
    provider,
    provider_reference,
    proof_url,
    expires_at,
    submitted_at,
    paid_at,
    failed_at,
    refunded_at,
    expired_at,
    created_at,
    updated_at
  )
` as const;

const customerOrderTypeQuery = supabase
  .from("orders")
  .select(CUSTOMER_ORDER_SELECT);

type CustomerOrderQueryRow = QueryData<typeof customerOrderTypeQuery>[number];

type CustomerOrderPaymentRelation = NonNullable<
  CustomerOrderQueryRow["order_payments"]
>;

type CustomerOrderPaymentQueryRow =
  CustomerOrderPaymentRelation extends Array<infer Item>
    ? Item
    : CustomerOrderPaymentRelation;

/**
 * Mengambil seluruh pesanan customer yang sedang login.
 *
 * Filter user_id tetap diberikan secara eksplisit,
 * selain proteksi RLS pada database.
 */
export async function getMyOrders(): Promise<BaseResponse<CustomerOrder[]>> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "UNAUTHENTICATED",
      };
    }

    const { data, error } = await supabase
      .from("orders")
      .select(CUSTOMER_ORDER_SELECT)
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      });

    if (error || !data || data.length === 0) {
      return {
        success: true,
        data: [],
      };
    }

    return {
      success: true,
      data: (data ?? []).map(mapCustomerOrder),
    };
  } catch {
    return {
      success: true,
      data: [],
    };
  }
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Mengambil satu pesanan milik customer yang sedang login.
 *
 * Filter user_id tetap diberikan walaupun database
 * sudah dilindungi oleh RLS.
 */
export async function getMyOrderById(
  orderId: string,
): Promise<BaseResponse<CustomerOrder>> {
  try {
    const normalizedOrderId = orderId.trim();

    if (!normalizedOrderId || !UUID_PATTERN.test(normalizedOrderId)) {
      return {
        success: false,
        error: "INVALID_ORDER_ID",
      };
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "UNAUTHENTICATED",
      };
    }

    const { data, error } = await supabase
      .from("orders")
      .select(CUSTOMER_ORDER_SELECT)
      .eq("id", normalizedOrderId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      return {
        success: false,
        error: translateSupabaseError(error),
      };
    }

    if (!data) {
      return {
        success: false,
        error: "ORDER_NOT_FOUND",
      };
    }

    return {
      success: true,
      data: mapCustomerOrder(data),
    };
  } catch (error) {
    return {
      success: false,
      error: translateSupabaseError(error),
    };
  }
}

function mapCustomerOrder(row: CustomerOrderQueryRow): CustomerOrder {
  const payment = unwrapSingleRelation(row.order_payments);

  return {
    id: row.id,
    status: row.order_status,

    receiverName: row.receiver_name,
    phoneNumber: row.phone_number,
    shippingAddress: row.shipping_address,

    totalPriceIdr: toNonNegativeNumber(row.total_price_idr),

    totalCoinsRedeemed: toNonNegativeNumber(row.total_coins_redeemed),

    pointsEarned: toNonNegativeNumber(row.points_earned),

    createdAt: row.created_at,
    updatedAt: row.updated_at,

    payment: payment
      ? mapCustomerOrderPayment(payment as CustomerOrderPaymentQueryRow)
      : null,

    items: (row.order_items ?? []).map(mapCustomerOrderItem),
  };
}

function mapCustomerOrderItem(
  row: CustomerOrderQueryRow["order_items"][number],
): CustomerOrderItem {
  return {
    id: row.id,
    productId: row.product_id,
    productName: row.product_name_snapshot,
    priceIdr: toNonNegativeNumber(row.price_snapshot_idr),
    quantity: toNonNegativeInteger(row.quantity),
    coinsRedeemed: toNonNegativeNumber(row.coins_redeemed_snapshot),
    isBonusClaimed: row.is_bonus_claimed,
    createdAt: row.created_at,
  };
}

function mapCustomerOrderPayment(
  row: CustomerOrderPaymentQueryRow,
): CustomerOrderPayment {
  return {
    id: row.id,

    method: row.payment_method,
    status: row.payment_status,

    amountIdr: toNonNegativeNumber(row.amount_idr),

    amountCoin: toNonNegativeNumber(row.amount_coin),

    provider: normalizeOptionalText(row.provider),

    providerReference: normalizeOptionalText(row.provider_reference),

    proofUrl: normalizeOptionalText(row.proof_url),

    expiresAt: row.expires_at,
    submittedAt: row.submitted_at,
    paidAt: row.paid_at,
    failedAt: row.failed_at,
    refundedAt: row.refunded_at,
    expiredAt: row.expired_at,

    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toNonNegativeNumber(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return Math.max(0, parsed);
}

function toNonNegativeInteger(value: unknown): number {
  return Math.floor(toNonNegativeNumber(value));
}

function unwrapSingleRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function normalizeOptionalText(
  value: string | null | undefined,
): string | null {
  const normalized = value?.trim();

  return normalized || null;
}

function getInitialCustomerOrder(): CustomerOrder {
  return {
    id: "ord-demo-001",
    status: "pending",
    receiverName: "Gede Sutrisna",
    phoneNumber: "081234567890",
    shippingAddress: "Jalan Imam Bonjol No. 45, Denpasar Barat, Bali 80119",
    totalPriceIdr: 269000,
    totalCoinsRedeemed: 0,
    pointsEarned: 25,
    createdAt: "2026-07-30T09:47:00Z",
    updatedAt: "2026-07-30T09:47:00Z",
    payment: {
      id: "pay-demo-001",
      method: "qris",
      status: "waiting_verification",
      amountIdr: 269000,
      amountCoin: 0,
      provider: "QRIS_MURI",
      providerReference: "REF-QRIS-99120",
      proofUrl: "https://images.unsplash.com/photo-1556742049-0a670f4a4591?w=800",
      expiresAt: "2026-07-31T09:47:00Z",
      submittedAt: "2026-07-30T09:47:00Z",
      paidAt: null,
      failedAt: null,
      refundedAt: null,
      expiredAt: null,
      createdAt: "2026-07-30T09:47:00Z",
      updatedAt: "2026-07-30T09:47:00Z",
    },
    items: [
      {
        id: "item-001",
        productId: "prod-tote-denim-01",
        productName: "Tote Bag Selvedge Denim Upcycled",
        priceIdr: 269000,
        quantity: 1,
        coinsRedeemed: 0,
        isBonusClaimed: false,
        createdAt: "2026-07-30T09:47:00Z",
      },
    ],
  };
}
