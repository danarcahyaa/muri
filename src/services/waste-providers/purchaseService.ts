import { supabase } from "@/lib/supabaseClient";
import { translateSupabaseError } from "@/lib/supabaseError";
import { BaseResponse } from "@/types/common";
import { OrderStatus as PurchaseStatus } from "@/enums/enums";
import { WastePurchaseItem, PurchaseListResponse, PurchaseMetricsResponse } from "@/types/wasteProvider";
import { getStoredMaterialOrders, updateMaterialOrderStatus } from "@/services/material/materialOrderService";

function getMaterialOrdersAsWastePurchases(): WastePurchaseItem[] {
  const materialOrders = getStoredMaterialOrders();
  return materialOrders.map((ord) => ({
    id: ord.id,
    brand_id: ord.buyerUserId,
    category_name_snapshot: "Kain Sirkular",
    fabric_name_snapshot: ord.batchTitle,
    original_price_per_kg: ord.pricePerKg,
    final_price_idr: ord.totalPriceIdr,
    weight_bought_kg: ord.weightKg,
    purchase_status:
      ord.status === "completed" || ord.status === "shipped"
        ? PurchaseStatus.COMPLETE
        : ord.status === "cancelled"
          ? PurchaseStatus.CANCELLED
          : PurchaseStatus.PENDING,
    media_urls_snapshot: null,
    waste_post_id: ord.batchCode,
    created_at: ord.createdAt,
    updated_at: ord.updatedAt,
    brands: {
      id: ord.buyerUserId,
      brand_name: ord.brandName,
    },
    waste_posts: {
      id: ord.batchCode,
      provider_id: "provider-1",
      custom_fabric_name: ord.batchTitle,
    },
  }));
}

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

    let dbPurchases: WastePurchaseItem[] = [];

    try {
      const { data, error } = await (
        supabase.rpc as unknown as (
          fn: string,
          args: Record<string, unknown>
        ) => Promise<{ data: { result_row: WastePurchaseItem }[] | null; error: unknown }>
      )("get_waste_purchases_rpc", {
        p_provider_id: providerId,
        p_search_query: options.searchQuery || null,
        p_status_filter: statuses && statuses.length > 0 ? statuses : null,
        p_date_from: options.dateFrom ? `${options.dateFrom}T00:00:00Z` : null,
        p_date_to: options.dateTo ? `${options.dateTo}T23:59:59Z` : null,
      });

      if (!error && data) {
        const rawRows = data as unknown as { result_row: WastePurchaseItem }[];
        dbPurchases = rawRows.map((row) => row.result_row);
      }
    } catch {
      // Continue with local orders fallback
    }

    const localPurchases = getMaterialOrdersAsWastePurchases();

    // Merge duplicate IDs prioritizing DB
    const dbIds = new Set(dbPurchases.map((p) => p.id));
    const mergedPurchases = [...dbPurchases, ...localPurchases.filter((p) => !dbIds.has(p.id))];

    // Filter merged purchases by search query & status
    let filteredPurchases = mergedPurchases;

    if (statuses && statuses.length > 0) {
      filteredPurchases = filteredPurchases.filter((p) => statuses.includes(p.purchase_status));
    }

    const q = (options.searchQuery || "").trim().toLowerCase();
    if (q) {
      filteredPurchases = filteredPurchases.filter(
        (p) =>
          p.fabric_name_snapshot.toLowerCase().includes(q) ||
          p.brands.brand_name.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.waste_post_id.toLowerCase().includes(q),
      );
    }

    const sortedPurchases = filteredPurchases.sort((a, b) => {
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
    await supabase
      .from("waste_purchases")
      .update({ purchase_status: PurchaseStatus.COMPLETE as "complete" })
      .eq("id", purchaseId);

    void updateMaterialOrderStatus({
      orderId: purchaseId,
      status: "completed",
    });

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
    await supabase
      .from("waste_purchases")
      .update({ purchase_status: PurchaseStatus.REJECTED as "rejected" })
      .eq("id", purchaseId);

    void updateMaterialOrderStatus({
      orderId: purchaseId,
      status: "cancelled",
    });

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
 * - Rejected
 */
export async function getPurchaseMetrics(
  providerId: string
): Promise<PurchaseMetricsResponse> {
  try {
    const listRes = await getWastePurchases(providerId, {
      page: 1,
      pageSize: 1000,
    });

    const purchases = listRes.data?.purchases || [];

    const waitingCount = purchases.filter((p) => p.purchase_status === PurchaseStatus.PENDING).length;
    const completedCount = purchases.filter((p) => p.purchase_status === PurchaseStatus.COMPLETE).length;
    const cancelledCount = purchases.filter((p) => p.purchase_status === PurchaseStatus.CANCELLED).length;
    const rejectedCount = purchases.filter((p) => p.purchase_status === PurchaseStatus.REJECTED).length;

    return {
      success: true,
      data: {
        waitingCount,
        completedCount,
        cancelledCount,
        rejectedCount,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: translateSupabaseError(error),
    };
  }
}
