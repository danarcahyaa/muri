import { supabase } from "@/lib/supabaseClient";
import { translateSupabaseError } from "@/lib/supabaseError";
import { BaseResponse } from "@/types/common";
import { FabricCategoryItem } from "@/types/wasteProvider";

/**
 * Fetches all fabric categories available.
 */
export async function getFabricCategories(): Promise<BaseResponse<FabricCategoryItem[]>> {
  try {
    const { data, error } = await supabase
      .from("fabric_categories")
      .select("id, name");

    if (error) {
      return {
        success: false,
        error: translateSupabaseError(error),
      };
    }

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    return {
      success: false,
      error: translateSupabaseError(error),
    };
  }
}
