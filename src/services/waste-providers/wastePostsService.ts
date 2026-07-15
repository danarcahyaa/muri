import { supabase } from "@/lib/supabaseClient";
import { translateSupabaseError } from "@/lib/supabaseError";
import { BaseResponse } from "@/types/common";
import { WastePostStatus, MediaType } from "@/enums/enum";
import { WastePostItem, WasteInput, WasteFilterInput } from "@/types/wasteProvider";
import { uploadMediaFile } from "./wasteMediaService";

/**
 * Fetches all waste posts for a specific provider.
 */
export async function getWastePosts(
  providerId: string,
  filters?: WasteFilterInput
): Promise<BaseResponse<WastePostItem[]>> {
  try {
    let query = supabase
      .from("waste_posts")
      .select(`
        id,
        custom_fabric_name,
        details_and_conditions,
        fabric_category_id,
        fabric_categories (
          name
        ),
        minimum_order_kg,
        price_per_kg,
        status,
        weight_kg,
        created_at,
        waste_post_media (
          media_url,
          media_type
        )
      `)
      .eq("provider_id", providerId);

    // Apply search filter (case-insensitive ILIKE)
    if (filters?.searchQuery) {
      query = query.ilike("custom_fabric_name", `%${filters.searchQuery}%`);
    }

    // Apply category ID filters
    if (filters?.categoryIds && filters.categoryIds.length > 0) {
      query = query.in("fabric_category_id", filters.categoryIds);
    }

    // Apply status filters (only if it doesn't include 'all')
    if (filters?.statuses && filters.statuses.length > 0 && !filters.statuses.includes("all")) {
      query = query.in("status", filters.statuses as any);
    }

    const sortBy = filters?.sortBy || "created_at";
    const ascending = filters?.sortOrder === "asc";

    const { data, error } = await query.order(sortBy, { ascending });

    if (error) {
      return {
        success: false,
        error: translateSupabaseError(error),
      };
    }

    const posts: WastePostItem[] = (data || []).map((post: any) => {
      // Calculate carbon and water saved mock metrics based on weight (e.g. 1 kg fabric saves ~2.5kg CO2 and ~10L water)
      const weight = post.weight_kg || 0;
      const carbon = parseFloat((weight * 2.5).toFixed(1));
      const water = Math.round(weight * 10);

      return {
        id: post.id,
        custom_fabric_name: post.custom_fabric_name,
        details_and_conditions: post.details_and_conditions,
        fabric_category_id: post.fabric_category_id,
        category_name: post.fabric_categories?.name || "Kain",
        minimum_order_kg: post.minimum_order_kg,
        price_per_kg: post.price_per_kg,
        status: post.status as WastePostStatus,
        weight_kg: weight,
        created_at: post.created_at,
        media_url: post.waste_post_media?.[0]?.media_url || undefined,
        media_list: (post.waste_post_media || []).map((m: any) => ({
          url: m.media_url,
          type: m.media_type as MediaType,
        })),
        carbon_saved_kg: carbon,
        water_saved_liter: water,
      };
    });

    return {
      success: true,
      data: posts,
    };
  } catch (error) {
    return {
      success: false,
      error: translateSupabaseError(error),
    };
  }
}

/**
 * Fetches the total count of waste posts for a specific provider.
 */
export async function getWastePostsCount(
  providerId: string
): Promise<BaseResponse<number>> {
  try {
    const { count, error } = await supabase
      .from("waste_posts")
      .select("*", { count: "exact", head: true })
      .eq("provider_id", providerId);

    if (error) {
      return {
        success: false,
        error: translateSupabaseError(error),
      };
    }

    return {
      success: true,
      data: count || 0,
    };
  } catch (error) {
    return {
      success: false,
      error: translateSupabaseError(error),
    };
  }
}

/**
 * Creates a new waste post.
 */
export async function createWastePost(
  providerId: string,
  post: WasteInput
): Promise<BaseResponse<void>> {
  try {
    const { data: insertedPost, error } = await supabase
      .from("waste_posts")
      .insert({
        provider_id: providerId,
        custom_fabric_name: post.custom_fabric_name,
        fabric_category_id: post.fabric_category_id,
        weight_kg: post.weight_kg,
        price_per_kg: post.price_per_kg,
        minimum_order_kg: post.minimum_order_kg,
        details_and_conditions: post.details_and_conditions,
        status: post.status,
      })
      .select("id")
      .single();

    if (error || !insertedPost) {
      return {
        success: false,
        error: translateSupabaseError(error || new Error("Gagal mengambil ID post")),
      };
    }

    const postId = insertedPost.id;

    if (post.media && post.media.length > 0) {
      const mediaRows = [];
      for (const item of post.media) {
        let mediaUrl = item.url;
        if (item.file) {
          mediaUrl = await uploadMediaFile(providerId, item.file);
        }
        mediaRows.push({
          waste_post_id: postId,
          media_url: mediaUrl,
          media_type: item.type,
        });
      }

      if (mediaRows.length > 0) {
        const { error: mediaError } = await supabase
          .from("waste_post_media")
          .insert(mediaRows);

        if (mediaError) {
          return {
            success: false,
            error: translateSupabaseError(mediaError),
          };
        }
      }
    }

    return {
      success: true,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || translateSupabaseError(error),
    };
  }
}

/**
 * Updates an existing waste post details.
 */
export async function updateWastePost(
  postId: string,
  updates: WasteInput,
  providerId: string
): Promise<BaseResponse<void>> {
  try {
    const { error } = await supabase
      .from("waste_posts")
      .update({
        custom_fabric_name: updates.custom_fabric_name,
        fabric_category_id: updates.fabric_category_id,
        weight_kg: updates.weight_kg,
        price_per_kg: updates.price_per_kg,
        minimum_order_kg: updates.minimum_order_kg,
        details_and_conditions: updates.details_and_conditions,
        status: updates.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", postId);

    if (error) {
      return {
        success: false,
        error: translateSupabaseError(error),
      };
    }

    // Sync media: delete all old ones, insert currently selected ones
    const { error: deleteError } = await supabase
      .from("waste_post_media")
      .delete()
      .eq("waste_post_id", postId);

    if (deleteError) {
      return {
        success: false,
        error: translateSupabaseError(deleteError),
      };
    }

    if (updates.media && updates.media.length > 0) {
      const mediaRows = [];
      for (const item of updates.media) {
        let mediaUrl = item.url;
        if (item.file) {
          mediaUrl = await uploadMediaFile(providerId, item.file);
        }
        mediaRows.push({
          waste_post_id: postId,
          media_url: mediaUrl,
          media_type: item.type,
        });
      }

      if (mediaRows.length > 0) {
        const { error: mediaInsertError } = await supabase
          .from("waste_post_media")
          .insert(mediaRows);

        if (mediaInsertError) {
          return {
            success: false,
            error: translateSupabaseError(mediaInsertError),
          };
        }
      }
    }

    return {
      success: true,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || translateSupabaseError(error),
    };
  }
}

/**
 * Soft deletes / archives a waste post by setting status to inactive.
 */
export async function deleteWastePost(
  postId: string
): Promise<BaseResponse<void>> {
  try {
    const { error } = await supabase
      .from("waste_posts")
      .update({
        status: WastePostStatus.INACTIVE,
        updated_at: new Date().toISOString(),
      })
      .eq("id", postId);

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
