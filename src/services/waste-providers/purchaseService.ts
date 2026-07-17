import { supabase } from "@/lib/supabaseClient";
import { translateSupabaseError } from "@/lib/supabaseError";
import { BaseResponse } from "@/types/common";
import { OrderStatus as PurchaseStatus } from "@/enums/enum";
import { WastePurchaseItem, PurchaseListResponse, PurchaseMetricsResponse } from "@/types/wasteProvider";

/**
 * Fetches the paginated list of waste purchases matching the search and status filters.
 */
export async function getWastePurchases(
  providerId: string,
  options: {
    page: number;
    pageSize: number;
    searchQuery?: string;
    statusFilter?: string | string[];
    dateFrom?: string;
    dateTo?: string;
  }
): Promise<PurchaseListResponse> {
  try {
    const from = (options.page - 1) * options.pageSize;
    const to = from + options.pageSize - 1;

    const statuses = options.statusFilter
      ? (Array.isArray(options.statusFilter) ? options.statusFilter : [options.statusFilter]).filter((s) => s !== "all")
      : null;

    const { data, error } = await (supabase as any).rpc("get_waste_purchases_rpc", {
      p_provider_id: providerId,
      p_search_query: options.searchQuery || null,
      p_status_filter: statuses && statuses.length > 0 ? statuses : null,
      p_date_from: options.dateFrom ? `${options.dateFrom}T00:00:00Z` : null,
      p_date_to: options.dateTo ? `${options.dateTo}T23:59:59Z` : null,
    });

    if (error) {
      return {
        success: false,
        error: translateSupabaseError(error),
      };
    }

    const allPurchases = (data || []).map((row: any) => row.result_row) as WastePurchaseItem[];

    const sortedPurchases = allPurchases.sort((a, b) => {
      const aPending = a.purchase_status === PurchaseStatus.PENDING ? 0 : 1;
      const bPending = b.purchase_status === PurchaseStatus.PENDING ? 0 : 1;

      if (aPending !== bPending) {
        return aPending - bPending;
      }

      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    const paginatedPurchases = sortedPurchases.slice(from, to + 1);

    return {
      success: true,
      data: {
        purchases: paginatedPurchases,
        totalCount: sortedPurchases.length,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: translateSupabaseError(error),
    };
  }
}

/**
 * Confirms a brand purchase by setting status to 'completed'
 */
export async function confirmWastePurchase(
  purchaseId: string
): Promise<BaseResponse> {
  try {
    const { error } = await supabase
      .from("waste_purchases")
      .update({ purchase_status: PurchaseStatus.COMPLETE as "complete" })
      .eq("id", purchaseId);

    if (error) {
      return {
        success: false,
        error: translateSupabaseError(error),
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: translateSupabaseError(error),
    };
  }
}

/**
 * Rejects a brand purchase by setting status to 'rejected'
 */
export async function rejectWastePurchase(
  purchaseId: string
): Promise<BaseResponse> {
  try {
    const { error } = await supabase
      .from("waste_purchases")
      .update({ purchase_status: PurchaseStatus.REJECTED as "rejected" })
      .eq("id", purchaseId);

    if (error) {
      return {
        success: false,
        error: translateSupabaseError(error),
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: translateSupabaseError(error),
    };
  }
}

/**
 * Calculates aggregated counts for purchases of the waste provider:
 * - Waiting Confirmation
 * - Completed
 * - Cancelled
 */
export async function getPurchaseMetrics(
  providerId: string
): Promise<PurchaseMetricsResponse> {
  try {
    const [waitingRes, completedRes, cancelledRes, rejectRes] = await Promise.all([
      supabase
        .from("waste_purchases")
        .select("id, waste_posts!inner(provider_id)", { count: "exact", head: true })
        .eq("purchase_status", PurchaseStatus.PENDING)
        .eq("waste_posts.provider_id", providerId),
      supabase
        .from("waste_purchases")
        .select("id, waste_posts!inner(provider_id)", { count: "exact", head: true })
        .eq("purchase_status", PurchaseStatus.COMPLETE)
        .eq("waste_posts.provider_id", providerId),
      supabase
        .from("waste_purchases")
        .select("id, waste_posts!inner(provider_id)", { count: "exact", head: true })
        .eq("purchase_status", PurchaseStatus.CANCELLED)
        .eq("waste_posts.provider_id", providerId),
      supabase
        .from("waste_purchases")
        .select("id, waste_posts!inner(provider_id)", { count: "exact", head: true })
        .eq("purchase_status", PurchaseStatus.REJECTED)
        .eq("waste_posts.provider_id", providerId)
    ]);

    if (waitingRes.error) throw waitingRes.error;
    if (completedRes.error) throw completedRes.error;
    if (cancelledRes.error) throw cancelledRes.error;
    if (rejectRes.error) throw rejectRes.error;

    return {
      success: true,
      data: {
        waitingCount: waitingRes.count || 0,
        completedCount: completedRes.count || 0,
        cancelledCount: cancelledRes.count || 0,
        rejectedCount: rejectRes.count || 0,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: translateSupabaseError(error),
    };
  }
}

