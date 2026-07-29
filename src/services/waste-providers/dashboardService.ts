import { supabase } from "@/lib/supabaseClient";
import { translateSupabaseError } from "@/lib/supabaseError";
import { DashboardStatsResponse } from "@/types/wasteProvider";
import { OrderStatus as PurchaseStatus, WastePostStatus } from "@/enums/enums";

/**
 * Fetches waste provider dashboard statistics.
 * Calculates current fabric weight and pending orders directly via database aggregates.
 * 
 * @param providerId ID of the waste provider (corresponds to user auth ID)
 * @returns DashboardStatsResponse wrapping stats
 */
export async function getDashboardStats(
  providerId: string
): Promise<DashboardStatsResponse> {
  try {
    // Fetch provider profile details
    const { data: profile, error: profileError } = await supabase
      .from("waste_providers")
      .select("total_distributed_waste, total_income, total_transaction")
      .eq("id", providerId)
      .single();

    if (profileError) {
      return {
        success: false,
        error: translateSupabaseError(profileError),
      };
    }

    // Fetch all active waste posts' weights to sum them locally
    const { data: weightData, error: weightError } = await supabase
      .from("waste_posts")
      .select("weight_kg")
      .eq("provider_id", providerId)
      .eq("status", WastePostStatus.ACTIVE);

    if (weightError) {
      return {
        success: false,
        error: translateSupabaseError(weightError),
      };
    }

    const currentFabricWeight = (weightData || []).reduce(
      (sum: number, post: { weight_kg: number }) => sum + (post.weight_kg || 0),
      0
    );

    // Count pending orders using exact count with an inner join
    const { count: pendingOrdersCount, error: purchasesError } = await supabase
      .from("waste_purchases")
      .select("id, waste_posts!inner(provider_id)", { count: "exact", head: true })
      .eq("purchase_status", PurchaseStatus.PENDING)
      .eq("waste_posts.provider_id", providerId);

    if (purchasesError) {
      return {
        success: false,
        error: translateSupabaseError(purchasesError),
      };
    }

    return {
      success: true,
      data: {
        stats: {
          totalDistributedWaste: profile.total_distributed_waste || 0,
          totalIncome: profile.total_income || 0,
          totalTransaction: profile.total_transaction || 0,
          currentFabricWeight,
          pendingOrdersCount: pendingOrdersCount || 0,
        },
      },
    };
  } catch (error) {
    return {
      success: false,
      error: translateSupabaseError(error),
    };
  }
}

