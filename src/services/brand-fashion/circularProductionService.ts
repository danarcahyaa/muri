import { supabase } from "@/lib/supabaseClient";
import { translateSupabaseError } from "@/lib/supabaseError";
import type { BaseResponse } from "@/types/common";

export interface AllocatedWasteMaterial {
  wastePurchaseId: string;
  purchaseId: string;
  fabricName: string;
  categoryName: string;
  allocatedWeightKg: number;
}

export interface BrandProductionItem {
  id: string;
  brandId: string;
  productionName: string;
  targetQuantity: number;
  status: "on_progress" | "finished" | string;
  startedAt: string;
  finishedAt: string | null;
  createdAt: string;
  materials: AllocatedWasteMaterial[];
  totalWeightKg: number;
  isHide?: boolean;
}

export interface AvailableWasteMaterialItem {
  id: string;
  purchaseId: string;
  fabricName: string;
  categoryName: string;
  availableWeightKg: number;
  pricePerKg: number;
  imageUrl: string | null;
}

export interface WasteMaterialAllocationInput {
  wastePurchaseId: string;
  allocatedWeightKg: number;
}

export interface CreateBrandProductionInput {
  brandId?: string;
  productionName: string;
  targetQuantity: number;
  allocations: WasteMaterialAllocationInput[];
}

/**
 * Fetches available completed waste material inventory for a brand (weight_bought_kg > 0).
 */
export async function getAvailablePurchasedWaste(
  brandId?: string
): Promise<BaseResponse<AvailableWasteMaterialItem[]>> {
  try {
    let query = supabase
      .from("waste_purchases")
      .select("*")
      .is("deleted_at", null)
      .eq("purchase_status", "complete")
      .gt("weight_bought_kg", 0)
      .order("updated_at", { ascending: false });

    if (brandId) {
      query = query.eq("brand_id", brandId);
    }

    const { data, error } = await query;

    if (error) {
      return {
        success: false,
        error: translateSupabaseError(error),
      };
    }

    const rawRows = (data || []) as Record<string, unknown>[];
    const items: AvailableWasteMaterialItem[] = rawRows.map((row) => {
      const mediaRaw = row.media_urls_snapshot;
      let firstImage: string | null = null;
      if (Array.isArray(mediaRaw) && mediaRaw.length > 0) {
        firstImage =
          typeof mediaRaw[0] === "string"
            ? mediaRaw[0]
            : (mediaRaw[0] as { url?: string })?.url || null;
      }

      const idStr = String(row.id || "");
      const pId = String(
        row.purchase_id ||
          row.purchaseId ||
          (idStr ? `PUR-${idStr.substring(0, 8).toUpperCase()}` : "PUR-UNKNOWN")
      );

      return {
        id: idStr,
        purchaseId: pId,
        fabricName: String(row.fabric_name_snapshot || "Limbah Kain Perca"),
        categoryName: String(row.category_name_snapshot || "Kain Sirkular"),
        availableWeightKg: Number(row.weight_bought_kg || 0),
        pricePerKg: Number(row.original_price_per_kg || 0),
        imageUrl: firstImage,
      };
    });

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
 * Fetches all brand productions from database with material allocations.
 */
export async function getBrandProductions(
  brandId?: string
): Promise<BaseResponse<BrandProductionItem[]>> {
  try {
    let query = supabase
      .from("brand_productions")
      .select("*")
      .order("created_at", { ascending: false });

    if (brandId) {
      query = query.eq("brand_id", brandId);
    }

    const { data: prodData, error: prodError } = await query;

    if (prodError) {
      return {
        success: false,
        error: translateSupabaseError(prodError),
      };
    }

    const rawRows = (prodData || []) as Record<string, unknown>[];

    // Attempt to fetch material allocation mappings if available
    const { data: allocData } = await (
      supabase as unknown as {
        from: (table: string) => { select: (query: string) => Promise<{ data: unknown[] | null }> };
      }
    )
      .from("production_materials")
      .select(
        `
        production_id,
        material_id,
        weight_used_kg,
        waste_purchases:material_id (
          purchase_id,
          fabric_name_snapshot,
          category_name_snapshot
        )
      `
      );

    const allocMap = new Map<string, AllocatedWasteMaterial[]>();
    if (allocData && Array.isArray(allocData)) {
      allocData.forEach((itemRow: unknown) => {
        const row = itemRow as Record<string, unknown>;
        const prodId = String(row.production_id || "");
        const wp = (row.waste_purchases as Record<string, unknown>) || {};
        const matItem: AllocatedWasteMaterial = {
          wastePurchaseId: String(row.material_id || row.waste_purchase_id || ""),
          purchaseId: String(wp.purchase_id || "PUR-MATERIAL"),
          fabricName: String(wp.fabric_name_snapshot || "Limbah Kain Perca"),
          categoryName: String(wp.category_name_snapshot || "Kain Sirkular"),
          allocatedWeightKg: Number(row.weight_used_kg || row.allocated_weight_kg || 0),
        };

        if (!allocMap.has(prodId)) {
          allocMap.set(prodId, []);
        }
        allocMap.get(prodId)?.push(matItem);
      });
    }

    const items: BrandProductionItem[] = rawRows.map((row) => {
      const idStr = String(row.id || "");
      const mats = allocMap.get(idStr) || [];
      const totalWeightKg = mats.reduce(
        (sum, m) => sum + (m.allocatedWeightKg || 0),
        0
      );

      return {
        id: idStr,
        brandId: String(row.brand_id || ""),
        productionName: String(
          row.production_name || "Produk Pakaian Sirkular"
        ),
        targetQuantity: Number(row.target_quantity || 1),
        status: String(row.status || "in_progress"),
        startedAt: String(
          row.started_at || row.created_at || new Date().toISOString()
        ),
        finishedAt: row.finished_at ? String(row.finished_at) : null,
        createdAt: String(row.created_at || new Date().toISOString()),
        materials: mats,
        totalWeightKg,
        isHide: Boolean(row.is_hide),
      };
    });

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
 * Creates a new brand production, records waste material allocations,
 * and deducts allocated weights from purchased waste inventory in Supabase.
 */
export async function createBrandProduction(
  input: CreateBrandProductionInput
): Promise<BaseResponse<BrandProductionItem>> {
  try {
    if (!input.productionName.trim()) {
      return { success: false, error: "Nama produksi wajib diisi." };
    }
    if (input.targetQuantity <= 0) {
      return { success: false, error: "Jumlah produksi harus lebih dari 0 pcs." };
    }
    if (input.allocations.length === 0) {
      return { success: false, error: "Pilih setidaknya satu material limbah." };
    }

    // 1. Get brand_id if not explicitly passed
    let brandId = input.brandId;
    if (!brandId) {
      const { data: authData } = await supabase.auth.getUser();
      brandId = authData?.user?.id;
    }

    if (!brandId) {
      const { data: bData } = await supabase
        .from("brands")
        .select("id")
        .limit(1)
        .maybeSingle();
      brandId = bData?.id;
    }

    if (!brandId) {
      return { success: false, error: "ID Brand tidak ditemukan." };
    }

    // 2. Validate stock availability for each allocated material
    const materialDetails: AllocatedWasteMaterial[] = [];
    for (const alloc of input.allocations) {
      const { data: wpData, error: wpError } = await supabase
        .from("waste_purchases")
        .select("id, purchase_id, fabric_name_snapshot, category_name_snapshot, weight_bought_kg")
        .eq("id", alloc.wastePurchaseId)
        .single();

      if (wpError || !wpData) {
        return {
          success: false,
          error: `Material limbah dengan ID ${alloc.wastePurchaseId} tidak ditemukan.`,
        };
      }

      const currentStock = Number(wpData.weight_bought_kg || 0);
      if (alloc.allocatedWeightKg > currentStock) {
        return {
          success: false,
          error: `Alokasi berat untuk ${wpData.fabric_name_snapshot} (${alloc.allocatedWeightKg} Kg) melebihi stok yang tersedia (${currentStock} Kg).`,
        };
      }

      materialDetails.push({
        wastePurchaseId: wpData.id,
        purchaseId: String(wpData.purchase_id || "PUR-MATERIAL"),
        fabricName: String(wpData.fabric_name_snapshot || "Limbah Kain Perca"),
        categoryName: String(wpData.category_name_snapshot || "Kain Sirkular"),
        allocatedWeightKg: alloc.allocatedWeightKg,
      });
    }

    const formattedAllocations = input.allocations.map((a) => ({
      material_id: a.wastePurchaseId,
      weight_used_kg: a.allocatedWeightKg,
      wastePurchaseId: a.wastePurchaseId,
      allocatedWeightKg: a.allocatedWeightKg,
    }));

    // 3. Call Supabase RPC stored function for atomic creation & allocation transaction
    const { data: rpcData, error: rpcErr } = await (
      supabase as unknown as {
        rpc: (
          fnName: string,
          args: Record<string, unknown>
        ) => Promise<{ data: Record<string, unknown> | null; error: unknown }>;
      }
    ).rpc("create_brand_production", {
      p_brand_id: brandId,
      p_production_name: input.productionName.trim(),
      p_target_quantity: input.targetQuantity,
      p_allocations: formattedAllocations,
    });

    if (rpcErr) {
      return {
        success: false,
        error: translateSupabaseError(rpcErr),
      };
    }

    if (!rpcData || !rpcData.success || !rpcData.production_id) {
      return {
        success: false,
        error: "Gagal membuat produksi baru melalui stored procedure database.",
      };
    }

    const timestamp = new Date().toISOString();
    const createdItem: BrandProductionItem = {
      id: String(rpcData.production_id),
      brandId,
      productionName: input.productionName.trim(),
      targetQuantity: input.targetQuantity,
      status: "in_production",
      startedAt: timestamp,
      finishedAt: null,
      createdAt: timestamp,
      materials: materialDetails,
      totalWeightKg: materialDetails.reduce(
        (sum, m) => sum + m.allocatedWeightKg,
        0
      ),
    };

    return {
      success: true,
      data: createdItem,
    };
  } catch (error) {
    return {
      success: false,
      error: translateSupabaseError(error),
    };
  }
}

/**
 * Updates a production status (e.g. from in_production to finished).
 */
export async function updateProductionStatus(
  productionId: string,
  newStatus: "finish" | "finished" | "in_production"
): Promise<BaseResponse<boolean>> {
  try {
    if (!productionId) {
      return { success: false, error: "ID Produksi tidak valid." };
    }

    const isFinishing = newStatus === "finish" || newStatus === "finished";
    const dbStatus = isFinishing ? "finish" : "in_production";
    const timestamp = new Date().toISOString();
    const updatePayload: {
      status: string;
      updated_at: string;
      finished_at?: string | null;
    } = {
      status: dbStatus,
      updated_at: timestamp,
      finished_at: isFinishing ? timestamp : null,
    };

    const { error } = await supabase
      .from("brand_productions")
      .update(updatePayload)
      .eq("id", productionId);

    if (error) {
      return {
        success: false,
        error: translateSupabaseError(error),
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
 * Cancels an ongoing brand production via Supabase RPC, restores the allocated waste weights
 * back to waste_purchases, and deletes the production record.
 */
export async function cancelBrandProduction(
  productionId: string
): Promise<BaseResponse<boolean>> {
  try {
    if (!productionId) {
      return { success: false, error: "ID Produksi tidak valid." };
    }

    // Call Supabase RPC function for atomic cancellation & rollback transaction
    const { data: rpcData, error: rpcErr } = await (
      supabase as unknown as {
        rpc: (
          fnName: string,
          args: Record<string, unknown>
        ) => Promise<{ data: Record<string, unknown> | null; error: unknown }>;
      }
    ).rpc("cancel_brand_production", {
      p_production_id: productionId,
    });

    if (rpcErr) {
      return {
        success: false,
        error: translateSupabaseError(rpcErr),
      };
    }

    if (!rpcData || !rpcData.success) {
      return {
        success: false,
        error: "Gagal membatalkan produksi melalui stored procedure database.",
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
 * Hides a finished brand production record from the circular production Kanban board (is_hide = true).
 */
export async function hideBrandProduction(
  productionId: string
): Promise<BaseResponse<boolean>> {
  try {
    if (!productionId) {
      return { success: false, error: "ID Produksi tidak valid." };
    }

    const { error } = await supabase
      .from("brand_productions")
      .update({
        is_hide: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", productionId);

    if (error) {
      return {
        success: false,
        error: translateSupabaseError(error),
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
 * Unhides a finished brand production record, bringing it back to the circular production Kanban board (is_hide = false).
 */
export async function unhideBrandProduction(
  productionId: string
): Promise<BaseResponse<boolean>> {
  try {
    if (!productionId) {
      return { success: false, error: "ID Produksi tidak valid." };
    }

    const { error } = await supabase
      .from("brand_productions")
      .update({
        is_hide: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", productionId);

    if (error) {
      return {
        success: false,
        error: translateSupabaseError(error),
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
