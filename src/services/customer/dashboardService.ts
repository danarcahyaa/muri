import { EntityRole } from "@/enums/enums";
import { supabase } from "@/lib/supabaseClient";
import { translateSupabaseError } from "@/lib/supabaseError";
import type { BaseResponse } from "@/types/common";
import type {
  CustomerDashboardSummary,
} from "@/types/customerDashboard";

/**
 * Mengambil ringkasan dashboard customer yang sedang login.
 */
export async function getCustomerDashboardSummary(): Promise<
  BaseResponse<CustomerDashboardSummary>
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

    const [
      profileResponse,
      impactResponse,
      activeWorkshopResponse,
      attendedWorkshopResponse,
      ordersResponse,
    ] = await Promise.all([
      supabase
        .from("users")
        .select("total_points")
        .eq("id", user.id)
        .maybeSingle(),

      supabase
        .from("entity_environmental_impacts")
        .select(`
          carbon_saved_kg,
          water_saved_liters,
          material_saved_grams
        `)
        .eq("user_id", user.id)
        .eq("entity_type", EntityRole.CONSUMER)
        .maybeSingle(),

      supabase
        .from("workshop_registrations")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("user_id", user.id)
        .eq("status", "registered"),

      supabase
        .from("workshop_registrations")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("user_id", user.id)
        .eq("status", "attended"),

      supabase
        .from("orders")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("user_id", user.id),
    ]);

    const firstError =
      profileResponse.error ??
      impactResponse.error ??
      activeWorkshopResponse.error ??
      attendedWorkshopResponse.error ??
      ordersResponse.error;

    if (firstError) {
      return {
        success: false,
        error: translateSupabaseError(
          firstError,
        ),
      };
    }

    const impact = impactResponse.data;

    return {
      success: true,
      data: {
        totalPoints: toNonNegativeNumber(
          profileResponse.data?.total_points,
        ),

        activeWorkshopCount:
          activeWorkshopResponse.count ?? 0,

        attendedWorkshopCount:
          attendedWorkshopResponse.count ?? 0,

        totalOrders:
          ordersResponse.count ?? 0,

        carbonSavedKg: toNonNegativeNumber(
          impact?.carbon_saved_kg,
        ),

        waterSavedLiters:
          toNonNegativeNumber(
            impact?.water_saved_liters,
          ),

        materialSavedGrams:
          toNonNegativeNumber(
            impact?.material_saved_grams,
          ),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: translateSupabaseError(error),
    };
  }
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