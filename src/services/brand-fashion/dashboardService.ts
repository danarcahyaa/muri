import { supabase } from "@/lib/supabaseClient";
import { translateSupabaseError } from "@/lib/supabaseError";
import { calculateCarbonSaved, calculateWaterSaved } from "@/lib/impactCalculator";
import type { BrandDashboardResponse, BrandDashboardStats } from "@/types/brandDashboard";

export type { BrandDashboardResponse, BrandDashboardStats };

/**
 * Fetches metric statistics for a brand dashboard.
 *
 * 1. Total Waste Saved (Limbah Terselamatkan): Calculated from purchase_traces via RPC or fallback trace query.
 * 2. Carbon Offset & Water Saved: Computed using life-cycle impact conversion formulas.
 * 3. Total Products: Aggregated via Supabase HEAD count query without fetching product records.
 * 4. Incoming Orders: Counted via RPC or order_items join matching product brand ID.
 *
 * @param brandId - Auth User ID of the brand
 * @returns BrandDashboardResponse containing metric statistics
 */
export async function getBrandDashboardStats(
  brandId: string
): Promise<BrandDashboardResponse> {
  try {
    // Fetch Total Saved Waste from purchase_traces via RPC (get_brand_total_waste_saved) or fallback query
    let totalDistributedWaste = 0;

    // Attempt RPC call first
    const { data: rpcWaste, error: rpcWasteError } = await (
      supabase.rpc as unknown as (
        fn: string,
        args: Record<string, unknown>
      ) => Promise<{ data: number | null; error: unknown }>
    )("get_brand_total_waste_saved", { p_brand_id: brandId });

    if (!rpcWasteError && typeof rpcWaste === "number") {
      totalDistributedWaste = rpcWaste;
    } else {
      // Fallback query if RPC has not been executed in Supabase yet
      const { data: purchaseTraces, error: traceError } = await (supabase as any)
        .from("purchase_traces")
        .select("weight_bought_kg, waste_purchases!inner(brand_id)")
        .eq("waste_purchases.brand_id", brandId);

      if (!traceError && purchaseTraces && purchaseTraces.length > 0) {
        totalDistributedWaste = purchaseTraces.reduce(
          (sum: number, item: { weight_bought_kg: number }) => sum + (item.weight_bought_kg || 0),
          0
        );
      } else {
        // Backup fallback to waste_purchases table directly
        const { data: directPurchases } = await supabase
          .from("waste_purchases")
          .select("weight_bought_kg")
          .eq("brand_id", brandId)
          .eq("purchase_status", "complete");

        if (directPurchases) {
          totalDistributedWaste = directPurchases.reduce(
            (sum: number, item: { weight_bought_kg: number }) => sum + (item.weight_bought_kg || 0),
            0
          );
        }
      }
    }

    // Compute Environmental Impact Metrics (CO2 & Water Saved)
    let carbonSavedKg = calculateCarbonSaved(totalDistributedWaste);
    let waterSavedLiters = calculateWaterSaved(totalDistributedWaste);

    // Optional check for manual overrides in entity_environmental_impacts
    const { data: impact } = await supabase
      .from("entity_environmental_impacts")
      .select("carbon_saved_kg, water_saved_liters")
      .eq("user_id", brandId)
      .eq("entity_type", "brand")
      .maybeSingle();

    if (impact) {
      if (impact.carbon_saved_kg && impact.carbon_saved_kg > 0) {
        carbonSavedKg = impact.carbon_saved_kg;
      }
      if (impact.water_saved_liters && impact.water_saved_liters > 0) {
        waterSavedLiters = impact.water_saved_liters;
      }
    }

    // Aggregate Total Products count via HEAD request
    const { count: productCount, error: productError } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("brand_id", brandId);

    if (productError) {
      return {
        success: false,
        error: translateSupabaseError(productError),
      };
    }

    // Aggregate Incoming Orders count for this brand's products
    let totalOrdersCount = 0;

    // Attempt RPC call first for incoming orders
    const { data: rpcOrders, error: rpcOrdersError } = await (
      supabase.rpc as unknown as (
        fn: string,
        args: Record<string, unknown>
      ) => Promise<{ data: number | null; error: unknown }>
    )("get_brand_incoming_orders_count", { p_brand_id: brandId });

    if (!rpcOrdersError && typeof rpcOrders === "number") {
      totalOrdersCount = rpcOrders;
    } else {
      // Fallback count query directly via Supabase HEAD count without row fetching
      try {
        const { count: orderCount, error: orderError } = await supabase
          .from("order_items")
          .select("id, products!inner(brand_id)", { count: "exact", head: true })
          .eq("products.brand_id", brandId);

        if (!orderError && typeof orderCount === "number") {
          totalOrdersCount = orderCount;
        }
      } catch (err) {
        console.warn("Could not query order_items count, fallback to 0", err);
      }
    }

    return {
      success: true,
      data: {
        stats: {
          totalDistributedWaste,
          carbonSavedKg,
          waterSavedLiters,
          totalProductsCount: productCount || 0,
          totalOrdersCount,
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
