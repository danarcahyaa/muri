import { supabase } from "@/lib/supabaseClient";
import { translateSupabaseError } from "@/lib/supabaseError";
import type { BaseResponse } from "@/types/common";
import type { Json } from "@/types/database";
import type {
  SourcingFilterInput,
  SourcingWastePostItem,
  SavedWastePostItem,
  SourcingWastePostDetailItem,
  SourcingMediaItem,
} from "@/types/sourcing";

interface DbSourcingMedia {
  media_url: string;
  media_type: string;
}

interface DbSourcingRow {
  id: string;
  custom_fabric_name: string | null;
  details_and_conditions: string | null;
  minimum_order_kg: number;
  price_per_kg: number;
  weight_kg: number;
  status: string;
  created_at: string;
  fabric_categories: { name: string } | { name: string }[] | null;
  waste_providers:
    | { company_name: string; address?: string | null }
    | { company_name: string; address?: string | null }[]
    | null;
  waste_post_media: DbSourcingMedia[] | null;
}

function unwrapRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  if (Array.isArray(value)) {
    return value.length > 0 ? value[0] : null;
  }
  return value;
}

/**
 * Fetches active waste posts for brand sourcing based on filter criteria.
 *
 * @param filters Sourcing search and filter options
 * @returns Array of SourcingWastePostItem
 */
export async function getWastePosts(
  filters: SourcingFilterInput = {}
): Promise<BaseResponse<SourcingWastePostItem[]>> {
  try {
    let query = supabase
      .from("waste_posts")
      .select(
        `
        id,
        custom_fabric_name,
        details_and_conditions,
        minimum_order_kg,
        price_per_kg,
        weight_kg,
        status,
        created_at,
        fabric_categories (
          name
        ),
        waste_providers (
          company_name,
          address
        ),
        waste_post_media (
          media_url,
          media_type
        )
      `
      )
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (filters.minPrice !== undefined && !isNaN(filters.minPrice)) {
      query = query.gte("price_per_kg", filters.minPrice);
    }
    if (filters.maxPrice !== undefined && !isNaN(filters.maxPrice)) {
      query = query.lte("price_per_kg", filters.maxPrice);
    }
    if (filters.minOrderKg !== undefined && !isNaN(filters.minOrderKg)) {
      query = query.lte("minimum_order_kg", filters.minOrderKg);
    }

    const { data, error } = await query;

    if (error) {
      return {
        success: false,
        error: translateSupabaseError(error),
      };
    }

    const rawRows = (data || []) as unknown as DbSourcingRow[];
    let items: SourcingWastePostItem[] = rawRows.map((row) => {
      const provider = unwrapRelation(row.waste_providers);
      const category = unwrapRelation(row.fabric_categories);
      const mediaList = row.waste_post_media || [];
      const firstImage =
        mediaList.find((m) => m.media_type === "image")?.media_url ||
        mediaList[0]?.media_url ||
        null;

      const providerName =
        typeof provider?.company_name === "string"
          ? provider.company_name
          : "Waste Provider";

      const providerLocation =
        typeof provider?.address === "string" && provider.address.trim()
          ? provider.address
          : "Denpasar, Bali";

      const categoryName =
        typeof category?.name === "string" ? category.name : "Lainnya";

      return {
        id: String(row.id),
        customFabricName:
          typeof row.custom_fabric_name === "string" && row.custom_fabric_name.trim()
            ? row.custom_fabric_name
            : categoryName !== "Lainnya"
            ? categoryName
            : "Limbah Kain Perca",
        categoryName,
        pricePerKg: Number(row.price_per_kg) || 0,
        minimumOrderKg: Number(row.minimum_order_kg) || 0,
        weightKg: Number(row.weight_kg) || 0,
        detailsAndConditions:
          typeof row.details_and_conditions === "string"
            ? row.details_and_conditions
            : "",
        status: String(row.status || "active"),
        providerName,
        providerLocation,
        imageUrl: firstImage,
        createdAt: row.created_at,
      };
    });

    // Client-side filtering for searchQuery, categoryNames, and location
    if (filters.searchQuery?.trim()) {
      const q = filters.searchQuery.trim().toLowerCase();
      items = items.filter((item) => {
        const fabricName = String(item.customFabricName || "").toLowerCase();
        const catName = String(item.categoryName || "").toLowerCase();
        const provName = String(item.providerName || "").toLowerCase();
        const provLoc = String(item.providerLocation || "").toLowerCase();
        const details = String(item.detailsAndConditions || "").toLowerCase();

        return (
          fabricName.includes(q) ||
          catName.includes(q) ||
          provName.includes(q) ||
          provLoc.includes(q) ||
          details.includes(q)
        );
      });
    }

    if (filters.categoryNames && filters.categoryNames.length > 0) {
      const activeCats = filters.categoryNames.map((c) => String(c).toLowerCase());
      items = items.filter((item) => {
        const catName = String(item.categoryName || "").toLowerCase();
        return activeCats.some((cat) => catName.includes(cat));
      });
    }

    if (filters.location?.trim()) {
      const loc = filters.location.trim().toLowerCase();
      items = items.filter((item) => {
        const provLoc = String(item.providerLocation || "").toLowerCase();
        return provLoc.includes(loc);
      });
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
 * Fetches saved waste posts for the given brand user.
 *
 * @param brandId Auth User ID of the brand
 * @returns Array of SavedWastePostItem
 */
interface DbSavedRow {
  id: string;
  brand_id: string;
  waste_post_id: string;
  created_at: string;
  waste_posts: DbSourcingRow | null;
}

export async function getSavedWastePosts(
  brandId: string
): Promise<BaseResponse<SavedWastePostItem[]>> {
  try {
    const { data, error } = await supabase
      .from("saved_waste_posts")
      .select(
        `
        id,
        brand_id,
        waste_post_id,
        created_at,
        waste_posts (
          id,
          custom_fabric_name,
          details_and_conditions,
          minimum_order_kg,
          price_per_kg,
          weight_kg,
          status,
          created_at,
          fabric_categories (
            name
          ),
          waste_providers (
            company_name
          ),
          waste_post_media (
            media_url,
            media_type
          )
        )
      `
      )
      .eq("brand_id", brandId)
      .order("created_at", { ascending: false });

    if (error) {
      // If table doesn't exist yet, return empty list gracefully
      return {
        success: true,
        data: [],
      };
    }

    const rawSaved = (data || []) as unknown as DbSavedRow[];
    const savedItems: SavedWastePostItem[] = rawSaved.map((row) => {
      const wp = row.waste_posts;
      const provider = wp ? unwrapRelation(wp.waste_providers) : null;
      const category = wp ? unwrapRelation(wp.fabric_categories) : null;
      const mediaList = wp?.waste_post_media || [];
      const firstImage =
        mediaList.find((m: DbSourcingMedia) => m.media_type === "image")?.media_url ||
        mediaList[0]?.media_url ||
        null;

      const categoryName = typeof category?.name === "string" ? category.name : "Lainnya";
      const providerName = typeof provider?.company_name === "string" ? provider.company_name : "Waste Provider";
      const providerLocation = typeof provider?.address === "string" && provider.address.trim() ? provider.address : "Denpasar, Bali";

      return {
        id: row.id,
        brandId: row.brand_id,
        wastePostId: row.waste_post_id,
        createdAt: row.created_at,
        wastePost: {
          id: wp?.id || row.waste_post_id,
          customFabricName:
            wp?.custom_fabric_name ||
            (categoryName !== "Lainnya" ? categoryName : "Limbah Kain Perca"),
          categoryName,
          pricePerKg: Number(wp?.price_per_kg) || 0,
          minimumOrderKg: Number(wp?.minimum_order_kg) || 0,
          weightKg: Number(wp?.weight_kg) || 0,
          detailsAndConditions: wp?.details_and_conditions || "",
          status: wp?.status || "active",
          providerName,
          providerLocation,
          imageUrl: firstImage,
          createdAt: wp?.created_at ?? null,
          isSaved: true,
          savedId: row.id,
        },
      };
    });

    return {
      success: true,
      data: savedItems,
    };
  } catch {
    return {
      success: true,
      data: [],
    };
  }
}

/**
 * Saves a waste post to brand's saved_waste_posts.
 *
 * @param brandId Auth User ID of the brand
 * @param wastePostId ID of the waste_post to save
 */
export async function saveWastePost(
  brandId: string,
  wastePostId: string
): Promise<BaseResponse<string>> {
  try {
    const { data, error } = await supabase
      .from("saved_waste_posts")
      .insert({
        brand_id: brandId,
        waste_post_id: wastePostId,
      })
      .select("id")
      .single();

    if (error) {
      return {
        success: false,
        error: translateSupabaseError(error),
      };
    }

    return {
      success: true,
      data: (data as { id: string }).id,
    };
  } catch (error) {
    return {
      success: false,
      error: translateSupabaseError(error),
    };
  }
}

/**
 * Removes a waste post from brand's saved_waste_posts.
 *
 * @param brandId Auth User ID of the brand
 * @param wastePostId ID of the waste_post to unsave
 */
export async function unsaveWastePost(
  brandId: string,
  wastePostId: string
): Promise<BaseResponse<boolean>> {
  try {
    const { error } = await supabase
      .from("saved_waste_posts")
      .delete()
      .eq("brand_id", brandId)
      .eq("waste_post_id", wastePostId);

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
 * Fetches a single waste post by its ID for detail and mini-checkout.
 *
 * @param id Waste post UUID
 * @returns SourcingWastePostDetailItem
 */
export async function getWastePostById(
  id: string
): Promise<BaseResponse<SourcingWastePostDetailItem | null>> {
  try {
    const { data, error } = await supabase
      .from("waste_posts")
      .select(
        `
        id,
        custom_fabric_name,
        details_and_conditions,
        minimum_order_kg,
        price_per_kg,
        weight_kg,
        status,
        created_at,
        fabric_categories (
          name
        ),
        waste_providers (
          company_name,
          address
        ),
        waste_post_media (
          media_url,
          media_type
        ),
        waste_batches (
          batch_code,
          origin_city
        )
      `
      )
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return {
        success: false,
        error: translateSupabaseError(error),
      };
    }

    if (!data) {
      return {
        success: true,
        data: null,
      };
    }

    const row = data as unknown as DbSourcingRow & {
      waste_batches?: { batch_code: string; origin_city: string }[] | null;
    };
    const provider = unwrapRelation(row.waste_providers);
    const category = unwrapRelation(row.fabric_categories);
    const rawMedia = row.waste_post_media || [];

    const mediaList: SourcingMediaItem[] = rawMedia.map((m) => ({
      url: m.media_url,
      type: m.media_type === "video" ? "video" : "image",
    }));

    const firstImage =
      mediaList.find((m) => m.type === "image")?.url ||
      mediaList[0]?.url ||
      null;

    const providerName =
      typeof provider?.company_name === "string" && provider.company_name.trim()
        ? provider.company_name
        : "Garment Supply Partner";

    let providerLocation = "Lokasi tidak diketahui";
    if (provider?.address) {
      if (typeof provider.address === "string") {
        try {
          const parsed = JSON.parse(provider.address);
          const regency = parsed.regency || parsed.city || "";
          const province = parsed.province || "";
          if (regency && province) {
            providerLocation = `${regency}, ${province}`;
          } else if (regency || province) {
            providerLocation = regency || province;
          } else {
            providerLocation = provider.address;
          }
        } catch {
          providerLocation = provider.address;
        }
      }
    }

    const categoryName =
      typeof category?.name === "string" ? category.name : "Limbah Kain Perca";

    const customFabricName =
      typeof row.custom_fabric_name === "string" && row.custom_fabric_name.trim()
        ? row.custom_fabric_name
        : categoryName;

    const weight = Number(row.weight_kg) || 0;
    const carbonSavedKg = parseFloat((weight * 2.5).toFixed(1));
    const waterSavedLiter = Math.round(weight * 10);

    const batchCode = row.waste_batches?.[0]?.batch_code;

    const detailItem: SourcingWastePostDetailItem = {
      id: String(row.id),
      customFabricName,
      categoryName,
      pricePerKg: Number(row.price_per_kg) || 0,
      minimumOrderKg: Number(row.minimum_order_kg) || 0,
      weightKg: weight,
      detailsAndConditions:
        typeof row.details_and_conditions === "string"
          ? row.details_and_conditions
          : "",
      status: String(row.status || "active"),
      providerName,
      providerLocation,
      imageUrl: firstImage,
      mediaList,
      fabricType: categoryName,
      wasteForm: "Perca Kain Potongan",
      carbonSavedKg,
      waterSavedLiter,
      createdAt: row.created_at,
      estimatedDeliveryDays: "2 - 4 Hari Kerja",
      batchCode,
    };

    return {
      success: true,
      data: detailItem,
    };
  } catch (error) {
    return {
      success: false,
      error: translateSupabaseError(error),
    };
  }
}

export interface RecipientSnapshot {
  name: string;
  phone: string;
  address: string;
}

export interface CreateWastePurchaseInput {
  brandId: string;
  wastePostId: string;
  categoryNameSnapshot: string;
  fabricNameSnapshot: string;
  originalPricePerKg: number;
  finalPriceIdr: number;
  weightBoughtKg: number;
  purchaseStatus?: "pending" | "processing" | "shipped" | "complete" | "cancelled" | "rejected";
  mediaUrlsSnapshot?: { url: string; type: string }[] | null;
  recipientSnapshot?: RecipientSnapshot | null;
}

/**
 * Inserts a new purchase record into the waste_purchases table.
 *
 * @param input Purchase transaction details
 * @returns ID of the created purchase
 */
export async function createWastePurchase(
  input: CreateWastePurchaseInput
): Promise<BaseResponse<string>> {
  try {
    const { data, error } = await supabase
      .from("waste_purchases")
      .insert({
        brand_id: input.brandId,
        waste_post_id: input.wastePostId,
        category_name_snapshot: input.categoryNameSnapshot,
        fabric_name_snapshot: input.fabricNameSnapshot,
        original_price_per_kg: input.originalPricePerKg,
        final_price_idr: input.finalPriceIdr,
        weight_bought_kg: input.weightBoughtKg,
        purchase_status: input.purchaseStatus || "pending",
        media_urls_snapshot: input.mediaUrlsSnapshot ?? [],
        recipient_snapshot: input.recipientSnapshot
          ? (input.recipientSnapshot as unknown as Json)
          : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) {
      return {
        success: false,
        error: translateSupabaseError(error),
      };
    }

    return {
      success: true,
      data: (data as { id: string }).id,
    };
  } catch (error) {
    return {
      success: false,
      error: translateSupabaseError(error),
    };
  }
}


