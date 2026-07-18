import { supabase } from "@/lib/supabaseClient";
import { translateSupabaseError } from "@/lib/supabaseError";
import { BaseResponse } from "@/types/common";
import { WasteBatchItem, WasteBatchFilterInput } from "@/types/wasteProvider";

/**
 * Fetches all waste batches for a specific provider with optional filters.
 * Joins waste_posts to filter by provider_id.
 */
export async function getWasteBatches(
  providerId: string,
  filters?: WasteBatchFilterInput
): Promise<BaseResponse<WasteBatchItem[]>> {
  try {
    let query = supabase
      .from("waste_batches")
      .select(`
        id,
        batch_code,
        initial_weight_kg,
        origin_city,
        fabric_name_snapshot,
        fabric_category_snapshot,
        media_urls_snapshot,
        created_at,
        waste_posts!inner (
          provider_id
        )
      `)
      .eq("waste_posts.provider_id", providerId)
      .order("created_at", { ascending: false });

    if (filters?.searchQuery) {
      const q = `%${filters.searchQuery}%`;
      query = query.or(
        `batch_code.ilike.${q},fabric_name_snapshot.ilike.${q},origin_city.ilike.${q}`
      );
    }

    if (filters?.dateFrom) {
      query = query.gte("created_at", filters.dateFrom);
    }

    if (filters?.dateTo) {
      // Include the full end day by extending to the next day
      const nextDay = new Date(filters.dateTo);
      nextDay.setDate(nextDay.getDate() + 1);
      query = query.lt("created_at", nextDay.toISOString().split("T")[0]);
    }

    const { data, error } = await query;

    if (error) {
      return { success: false, error: translateSupabaseError(error) };
    }

    const batches: WasteBatchItem[] = (data ?? []).map((row) => ({
      id: row.id as string,
      batch_code: row.batch_code as string,
      initial_weight_kg: row.initial_weight_kg as number,
      origin_city: row.origin_city as string,
      fabric_name_snapshot: row.fabric_name_snapshot as string,
      fabric_category_snapshot: row.fabric_category_snapshot as string,
      media_urls_snapshot: (row.media_urls_snapshot as { url: string; type: string }[]) ?? [],
      created_at: row.created_at as string | null,
    }));

    return { success: true, data: batches };
  } catch (error) {
    return { success: false, error: translateSupabaseError(error) };
  }
}

/**
 * Returns the total initial weight (kg) of all batches for a provider.
 */
export async function getTotalBatchWeight(
  providerId: string
): Promise<BaseResponse<number>> {
  try {
    const { data, error } = await supabase
      .from("waste_batches")
      .select(`
        initial_weight_kg,
        waste_posts!inner (
          provider_id
        )
      `)
      .eq("waste_posts.provider_id", providerId);

    if (error) {
      return { success: false, error: translateSupabaseError(error) };
    }

    const total = (data ?? []).reduce(
      (sum, row) => sum + (row.initial_weight_kg as number),
      0
    );

    return { success: true, data: total };
  } catch (error) {
    return { success: false, error: translateSupabaseError(error) };
  }
}

/**
 * Returns the total number of batch records for a provider.
 */
export async function getTotalBatchCount(
  providerId: string
): Promise<BaseResponse<number>> {
  try {
    const { count, error } = await supabase
      .from("waste_batches")
      .select(
        `id, waste_posts!inner ( provider_id )`,
        { count: "exact", head: true }
      )
      .eq("waste_posts.provider_id", providerId);

    if (error) {
      return { success: false, error: translateSupabaseError(error) };
    }

    return { success: true, data: count ?? 0 };
  } catch (error) {
    return { success: false, error: translateSupabaseError(error) };
  }
}
