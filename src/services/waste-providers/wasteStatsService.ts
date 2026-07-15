import { supabase } from "@/lib/supabaseClient";
import { translateSupabaseError } from "@/lib/supabaseError";
import { BaseResponse } from "@/types/common";

/**
 * Fetches the total waste weight for a provider using the database RPC function.
 */
export async function getTotalWasteWeight(
  providerId: string
): Promise<BaseResponse<number>> {
  try {
    const { data, error } = await (supabase.rpc as any)("get_total_waste_weight", {
      provider_id: providerId,
    });

    if (error) {
      return {
        success: false,
        error: translateSupabaseError(error),
      };
    }

    return {
      success: true,
      data: typeof data === "number" ? data : Number(data) || 0,
    };
  } catch (error) {
    return {
      success: false,
      error: translateSupabaseError(error),
    };
  }
}
