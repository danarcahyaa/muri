import { supabase } from "@/lib/supabaseClient";
import { translateSupabaseError } from "@/lib/supabaseError";
import type { BaseResponse } from "@/types/common";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface ConfirmDeliveryResult {
  orderId: string;
  orderStatus: string;
  completedAt: string;
  pointsEarned: number;
  customerTotalPoints: number;
}

/**
 * Mengonfirmasi bahwa pesanan yang sedang dikirim (shipped) telah diterima oleh customer.
 * Mengubah status pesanan menjadi 'complete', mencairkan bonus coin, dan mencatat dampak lingkungan.
 */
export async function confirmCustomerOrderDelivery(
  orderId: string,
): Promise<BaseResponse<ConfirmDeliveryResult>> {
  try {
    const normalizedOrderId = orderId.trim();

    if (!normalizedOrderId || !UUID_PATTERN.test(normalizedOrderId)) {
      return {
        success: false,
        error: "ID pesanan tidak valid.",
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

    // Call RPC complete_brand_order or update order directly if shipped
    const { data, error } = await supabase.rpc("complete_brand_order", {
      p_order_id: normalizedOrderId,
    });

    if (error) {
      console.error("[confirmCustomerOrderDelivery] RPC error:", error);
      return {
        success: false,
        error: translateSupabaseError(error),
      };
    }

    const result = data?.[0];

    if (!result) {
      return {
        success: false,
        error: "Gagal mengonfirmasi penerimaan pesanan.",
      };
    }

    return {
      success: true,
      data: {
        orderId: result.order_id,
        orderStatus: result.order_status,
        completedAt: result.completed_at,
        pointsEarned: Number(result.points_earned ?? 0),
        customerTotalPoints: Number(result.customer_total_points ?? 0),
      },
    };
  } catch (error: unknown) {
    console.error("[confirmCustomerOrderDelivery] Unexpected error:", error);
    return {
      success: false,
      error: translateSupabaseError(error),
    };
  }
}
