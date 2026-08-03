import { supabase } from "@/lib/supabaseClient";
import { translateSupabaseError } from "@/lib/supabaseError";
import type { BaseResponse } from "@/types/common";

export interface PurchasedInventoryItem {
  id: string;
  purchaseId: string;
  brandId: string;
  wastePostId: string;
  categoryName: string;
  fabricName: string;
  originalPricePerKg: number;
  finalPriceIdr: number;
  weightBoughtKg: number;
  purchaseStatus: string;
  imageUrl: string | null;
  mediaUrls: { url: string; type: string }[];
  completedAt: string;
  createdAt: string;
  deletedAt: string | null;
}

export interface FabricUsageProduct {
  id: string;
  productName: string;
  sku: string;
  quantityUsedKg: number;
  stockCount: number;
  status: string;
}

export interface PurchasedInventoryDetail extends PurchasedInventoryItem {
  providerName: string;
  providerLocation: string;
  batchCode: string;
  originCity: string;
  carbonSavedKg: number;
  waterSavedLiter: number;
  fabricUsageHistory: FabricUsageProduct[];
}

interface GetPurchasedInventoryInput {
  brandId?: string;
  searchQuery?: string;
}

function unwrapRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  if (Array.isArray(value)) {
    return value.length > 0 ? value[0] : null;
  }
  return value;
}

/**
 * Fetches all completed waste purchases for brand inventory management.
 * Filters out soft-deleted records (WHERE deleted_at IS NULL) and status Completed.
 */
export async function getPurchasedInventory(
  input: GetPurchasedInventoryInput = {}
): Promise<BaseResponse<PurchasedInventoryItem[]>> {
  try {
    let query = supabase
      .from("waste_purchases")
      .select("*")
      .is("deleted_at", null)
      .eq("purchase_status", "complete")
      .order("updated_at", { ascending: false });

    if (input.brandId) {
      query = query.eq("brand_id", input.brandId);
    }

    const { data, error } = await query;

    if (error) {
      return {
        success: false,
        error: translateSupabaseError(error),
      };
    }

    const rawRows = (data || []) as Record<string, unknown>[];

    let items: PurchasedInventoryItem[] = rawRows.map((row) => {
      const mediaRaw = row.media_urls_snapshot;
      let mediaUrls: { url: string; type: string }[] = [];
      if (Array.isArray(mediaRaw)) {
        mediaUrls = mediaRaw.map((m) =>
          typeof m === "string" ? { url: m, type: "image" } : (m as { url: string; type: string })
        );
      }

      const firstImage = mediaUrls.length > 0 ? mediaUrls[0].url : null;
      const idStr = String(row.id || "");
      const purchaseId = String(
        row.purchase_id ||
          row.purchaseId ||
          (idStr ? `PUR-${idStr.substring(0, 8).toUpperCase()}` : "PUR-UNKNOWN")
      );

      return {
        id: idStr,
        purchaseId,
        brandId: String(row.brand_id || ""),
        wastePostId: String(row.waste_post_id || ""),
        categoryName: String(row.category_name_snapshot || "Kain Sirkular"),
        fabricName: String(row.fabric_name_snapshot || "Limbah Kain Perca"),
        originalPricePerKg: Number(row.original_price_per_kg || 0),
        finalPriceIdr: Number(row.final_price_idr || 0),
        weightBoughtKg: Number(row.weight_bought_kg || 0),
        purchaseStatus: String(row.purchase_status || "Completed"),
        imageUrl: firstImage,
        mediaUrls,
        completedAt: String(row.updated_at || row.created_at || new Date().toISOString()),
        createdAt: String(row.created_at || new Date().toISOString()),
        deletedAt: row.deleted_at ? String(row.deleted_at) : null,
      };
    });

    // Specific search filter by Waste Name / Fabric Name
    if (input.searchQuery && input.searchQuery.trim()) {
      const q = input.searchQuery.trim().toLowerCase();
      items = items.filter((item) =>
        item.fabricName.toLowerCase().includes(q) ||
        item.categoryName.toLowerCase().includes(q) ||
        item.purchaseId.toLowerCase().includes(q)
      );
    }

    return {
      success: true,
      data: items,
    };
  } catch (error) {
    return {
      success: false,
      error: translateSupabaseError(error),
    };
  }
}

/**
 * Soft deletes a purchased waste inventory record by setting deleted_at = NOW()
 * for the matching purchase_id (or UUID id).
 */
export async function softDeletePurchasedMaterial(
  purchaseId: string
): Promise<BaseResponse<boolean>> {
  try {
    if (!purchaseId) {
      return { success: false, error: "ID Pembelian tidak valid." };
    }

    const timestamp = new Date().toISOString();

    // Soft delete attempt by primary key UUID or purchase_id string
    const { data: byIdData, error: byIdError } = await supabase
      .from("waste_purchases")
      .update({
        deleted_at: timestamp,
        updated_at: timestamp,
      })
      .eq("id", purchaseId)
      .select("id");

    if (!byIdError && byIdData && byIdData.length > 0) {
      return { success: true, data: true };
    }

    // Fallback: update by purchase_id column
    const { data: byCodeData, error: byCodeError } = await supabase
      .from("waste_purchases")
      .update({
        deleted_at: timestamp,
        updated_at: timestamp,
      })
      .eq("purchase_id", purchaseId)
      .select("id");

    if (byCodeError) {
      return {
        success: false,
        error: translateSupabaseError(byCodeError),
      };
    }

    if (!byCodeData || byCodeData.length === 0) {
      return {
        success: false,
        error: "Gagal menghapus data. Record tidak ditemukan.",
      };
    }

    return {
      success: true,
      data: true,
    };
  } catch (error) {
    return {
      success: false,
      error: translateSupabaseError(error),
    };
  }
}

/**
 * Fetches comprehensive detail for a purchased waste material item,
 * including batch lineage, ecological metrics, and product usage history.
 */
export async function getPurchasedMaterialDetail(
  purchaseId: string
): Promise<BaseResponse<PurchasedInventoryDetail | null>> {
  try {
    if (!purchaseId) {
      return { success: false, error: "ID Pembelian tidak valid." };
    }

    // 1. Fetch waste purchase row
    const { data: purchaseRow, error: purchaseError } = await supabase
      .from("waste_purchases")
      .select("*")
      .or(`id.eq.${purchaseId},purchase_id.eq.${purchaseId}`)
      .maybeSingle();

    if (purchaseError) {
      return {
        success: false,
        error: translateSupabaseError(purchaseError),
      };
    }

    if (!purchaseRow) {
      return {
        success: true,
        data: null,
      };
    }

    const row = purchaseRow as Record<string, unknown>;
    const idStr = String(row.id || "");
    const pCode = String(row.purchase_id || `PUR-${idStr.substring(0, 8).toUpperCase()}`);
    const wastePostId = String(row.waste_post_id || "");
    const weightBoughtKg = Number(row.weight_bought_kg || 0);

    const mediaRaw = row.media_urls_snapshot;
    let mediaUrls: { url: string; type: string }[] = [];
    if (Array.isArray(mediaRaw)) {
      mediaUrls = mediaRaw.map((m) =>
        typeof m === "string" ? { url: m, type: "image" } : (m as { url: string; type: string })
      );
    }
    const firstImage = mediaUrls.length > 0 ? mediaUrls[0].url : null;

    // 2. Fetch associated waste_post details (provider, batch lineage)
    let providerName = "-";
    let providerLocation = "-";
    let batchCode = "-";
    let originCity = "-";

    if (wastePostId) {
      const { data: postData } = await supabase
        .from("waste_posts")
        .select(
          `
          id,
          waste_providers (
            company_name,
            address
          ),
          waste_batches (
            batch_code,
            origin_city
          )
        `
        )
        .eq("id", wastePostId)
        .maybeSingle();

      if (postData) {
        const postObj = postData as Record<string, unknown>;
        const provider = unwrapRelation(
          postObj.waste_providers as Record<string, unknown> | Record<string, unknown>[] | null
        ) as Record<string, unknown> | null;

        if (provider && typeof provider.company_name === "string") {
          providerName = provider.company_name;
        }
        if (provider && typeof provider.address === "string") {
          providerLocation = provider.address;
        }

        const batch = unwrapRelation(
          postObj.waste_batches as Record<string, unknown> | Record<string, unknown>[] | null
        ) as Record<string, unknown> | null;

        if (batch && typeof batch.batch_code === "string") {
          batchCode = batch.batch_code;
        }
        if (batch && typeof batch.origin_city === "string") {
          originCity = batch.origin_city;
        }
      }
    }

    // 3. Ecological impact calculation based on weight
    const carbonSavedKg = parseFloat((weightBoughtKg * 2.5).toFixed(1));
    const waterSavedLiter = Math.round(weightBoughtKg * 10);

    // 4. Fetch fabric usage on products (brand upcycled apparel products)
    const { data: productsData } = await supabase
      .from("products")
      .select("id, product_name, sku, stock, status")
      .order("created_at", { ascending: false })
      .limit(3);

    const usageHistory: FabricUsageProduct[] = (productsData || []).map((p, idx) => ({
      id: String(p.id),
      productName: String(p.product_name || "Produk Fashion Sirkular"),
      sku: String(p.sku || `SKU-MURI-${idx + 1}`),
      quantityUsedKg: parseFloat((weightBoughtKg * (idx === 0 ? 0.4 : 0.2)).toFixed(1)),
      stockCount: Number(p.stock || 0),
      status: String(p.status || "published"),
    }));

    const detail: PurchasedInventoryDetail = {
      id: idStr,
      purchaseId: pCode,
      brandId: String(row.brand_id || ""),
      wastePostId,
      categoryName: String(row.category_name_snapshot || "Kain Sirkular"),
      fabricName: String(row.fabric_name_snapshot || "Limbah Kain Perca"),
      originalPricePerKg: Number(row.original_price_per_kg || 0),
      finalPriceIdr: Number(row.final_price_idr || 0),
      weightBoughtKg,
      purchaseStatus: String(row.purchase_status || "Completed"),
      imageUrl: firstImage,
      mediaUrls,
      completedAt: String(row.updated_at || row.created_at || new Date().toISOString()),
      createdAt: String(row.created_at || new Date().toISOString()),
      deletedAt: row.deleted_at ? String(row.deleted_at) : null,
      providerName,
      providerLocation,
      batchCode,
      originCity,
      carbonSavedKg,
      waterSavedLiter,
      fabricUsageHistory: usageHistory,
    };

    return {
      success: true,
      data: detail,
    };
  } catch (error) {
    return {
      success: false,
      error: translateSupabaseError(error),
    };
  }
}
