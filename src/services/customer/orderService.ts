import type { QueryData } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabaseClient";
import { translateSupabaseError } from "@/lib/supabaseError";
import type { BaseResponse } from "@/types/common";
import type {
  CustomerOrder,
  CustomerOrderItem,
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
  )
` as const;

const customerOrderTypeQuery = supabase
  .from("orders")
  .select(CUSTOMER_ORDER_SELECT);

type CustomerOrderQueryRow = QueryData<
  typeof customerOrderTypeQuery
>[number];

/**
 * Mengambil seluruh pesanan customer yang sedang login.
 *
 * Filter user_id tetap diberikan secara eksplisit,
 * selain proteksi RLS pada database.
 */
export async function getMyOrders(): Promise<
  BaseResponse<CustomerOrder[]>
> {
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

    if (error) {
      return {
        success: false,
        error: translateSupabaseError(error),
      };
    }

    return {
      success: true,
      data: (data ?? []).map(mapCustomerOrder),
    };
  } catch (error) {
    return {
      success: false,
      error: translateSupabaseError(error),
    };
  }
}

function mapCustomerOrder(
  row: CustomerOrderQueryRow,
): CustomerOrder {
  return {
    id: row.id,
    status:
      row.order_status as CustomerOrderStatus,

    receiverName: row.receiver_name,
    phoneNumber: row.phone_number,
    shippingAddress: row.shipping_address,

    totalPriceIdr: toNonNegativeNumber(
      row.total_price_idr,
    ),

    totalCoinsRedeemed: toNonNegativeNumber(
      row.total_coins_redeemed,
    ),

    pointsEarned: toNonNegativeNumber(
      row.points_earned,
    ),

    createdAt: row.created_at,
    updatedAt: row.updated_at,

    items: (row.order_items ?? []).map(
      mapCustomerOrderItem,
    ),
  };
}

function mapCustomerOrderItem(
  row: CustomerOrderQueryRow["order_items"][number],
): CustomerOrderItem {
  return {
    id: row.id,
    productId: row.product_id,

    productName:
      row.product_name_snapshot,

    priceIdr: toNonNegativeNumber(
      row.price_snapshot_idr,
    ),

    quantity: toNonNegativeInteger(
      row.quantity,
    ),

    coinsRedeemed: toNonNegativeNumber(
      row.coins_redeemed_snapshot,
    ),

    isBonusClaimed:
      row.is_bonus_claimed,

    createdAt: row.created_at,
  };
}

function toNonNegativeNumber(
  value: unknown,
): number {
  const parsed =
    typeof value === "number"
      ? value
      : Number(value);

  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return Math.max(0, parsed);
}

function toNonNegativeInteger(
  value: unknown,
): number {
  return Math.floor(
    toNonNegativeNumber(value),
  );
}