import { supabase } from "@/lib/supabaseClient";
import { translateSupabaseError } from "@/lib/supabaseError";
import type { BaseResponse } from "@/types/common";
import type {
  SourcingFilterInput,
  SourcingWastePostItem,
  SavedWastePostItem,
} from "@/types/sourcing";

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
          company_name
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

    let items: SourcingWastePostItem[] = (data || []).map((row: any) => {
      const mediaList = row.waste_post_media || [];
      const firstImage =
        mediaList.find((m: any) => m.media_type === "image")?.media_url ||
        mediaList[0]?.media_url ||
        null;

      return {
        id: row.id,
        customFabricName:
          row.custom_fabric_name ||
          row.fabric_categories?.name ||
          "Limbah Kain Perca",
        categoryName: row.fabric_categories?.name || "Lainnya",
        pricePerKg: Number(row.price_per_kg) || 0,
        minimumOrderKg: Number(row.minimum_order_kg) || 0,
        weightKg: Number(row.weight_kg) || 0,
        detailsAndConditions: row.details_and_conditions || "",
        status: row.status,
        providerName: row.waste_providers?.company_name || "Waste Provider",
        imageUrl: firstImage,
        createdAt: row.created_at,
      };
    });

    // Client-side filtering for searchQuery and multi-select categoryNames
    if (filters.searchQuery?.trim()) {
      const q = filters.searchQuery.trim().toLowerCase();
      items = items.filter(
        (item) =>
          item.customFabricName.toLowerCase().includes(q) ||
          item.categoryName.toLowerCase().includes(q) ||
          item.providerName.toLowerCase().includes(q) ||
          item.detailsAndConditions.toLowerCase().includes(q)
      );
    }

    if (filters.categoryNames && filters.categoryNames.length > 0) {
      const activeCats = filters.categoryNames.map((c) => c.toLowerCase());
      items = items.filter((item) =>
        activeCats.some((cat) => item.categoryName.toLowerCase().includes(cat))
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
 * Fetches saved waste posts for the given brand user.
 *
 * @param brandId Auth User ID of the brand
 * @returns Array of SavedWastePostItem
 */
export async function getSavedWastePosts(
  brandId: string
): Promise<BaseResponse<SavedWastePostItem[]>> {
  try {
    const { data, error } = await (supabase as any)
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

    const savedItems: SavedWastePostItem[] = (data || []).map((row: any) => {
      const wp = row.waste_posts || {};
      const mediaList = wp.waste_post_media || [];
      const firstImage =
        mediaList.find((m: any) => m.media_type === "image")?.media_url ||
        mediaList[0]?.media_url ||
        null;

      return {
        id: row.id,
        brandId: row.brand_id,
        wastePostId: row.waste_post_id,
        createdAt: row.created_at,
        wastePost: {
          id: wp.id || row.waste_post_id,
          customFabricName:
            wp.custom_fabric_name ||
            wp.fabric_categories?.name ||
            "Limbah Kain Perca",
          categoryName: wp.fabric_categories?.name || "Lainnya",
          pricePerKg: Number(wp.price_per_kg) || 0,
          minimumOrderKg: Number(wp.minimum_order_kg) || 0,
          weightKg: Number(wp.weight_kg) || 0,
          detailsAndConditions: wp.details_and_conditions || "",
          status: wp.status || "active",
          providerName: wp.waste_providers?.company_name || "Waste Provider",
          imageUrl: firstImage,
          createdAt: wp.created_at,
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
    const { data, error } = await (supabase as any)
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
      data: data.id,
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
    const { error } = await (supabase as any)
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
