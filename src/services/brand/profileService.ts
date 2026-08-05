import { supabase } from "@/lib/supabaseClient";
import { translateSupabaseError } from "@/lib/supabaseError";
import type { BaseResponse } from "@/types/common";
import type { BrandLink } from "@/types/brandLink";
import type { Json } from "@/types/database";

export interface BrandProfileData {
  id: string;
  brandName: string;
  email: string;
  activeNumber: string;
  warehouseAddress: string | null;
  warehouseMapsUrl: string | null;
  socialMediaLinks: BrandLink[];
  shortStory: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface UpdateBrandProfileInput {
  brandName: string;
  activeNumber: string;
  warehouseAddress: string;
  warehouseMapsUrl?: string;
  socialMediaLinks?: BrandLink[];
  shortStory?: string;
}

export async function getBrandProfile(): Promise<BaseResponse<BrandProfileData>> {
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user) {
      return {
        success: false,
        error: "Akun belum terautentikasi.",
      };
    }

    const userId = authData.user.id;
    const email = authData.user.email ?? "";

    const { data, error } = await supabase
      .from("brands")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      return {
        success: false,
        error: translateSupabaseError(error),
      };
    }

    let socialLinks: BrandLink[] = [];
    if (Array.isArray(data.social_media_links)) {
      socialLinks = data.social_media_links as unknown as BrandLink[];
    }

    return {
      success: true,
      data: {
        id: data.id,
        brandName: data.brand_name,
        email,
        activeNumber: data.active_number,
        warehouseAddress: data.warehouse_address || data.address || null,
        warehouseMapsUrl: data.warehouse_maps_url,
        socialMediaLinks: socialLinks,
        shortStory: data.short_story,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: translateSupabaseError(error),
    };
  }
}

export async function updateBrandProfile(
  input: UpdateBrandProfileInput,
): Promise<BaseResponse<BrandProfileData>> {
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user) {
      return {
        success: false,
        error: "Akun belum terautentikasi.",
      };
    }

    const userId = authData.user.id;
    const email = authData.user.email ?? "";

    const normalizedBrandName = input.brandName.trim();
    const normalizedActiveNumber = input.activeNumber.trim();
    const normalizedAddress = input.warehouseAddress.trim();
    const mapsUrl = input.warehouseMapsUrl?.trim() || null;
    const shortStory = input.shortStory?.trim() || null;

    const { data, error } = await supabase
      .from("brands")
      .update({
        brand_name: normalizedBrandName,
        active_number: normalizedActiveNumber,
        warehouse_address: normalizedAddress,
        address: normalizedAddress,
        warehouse_maps_url: mapsUrl,
        social_media_links: (input.socialMediaLinks ?? []) as unknown as Json,
        short_story: shortStory,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select("*")
      .single();

    if (error) {
      return {
        success: false,
        error: translateSupabaseError(error),
      };
    }

    let socialLinks: BrandLink[] = [];
    if (Array.isArray(data.social_media_links)) {
      socialLinks = data.social_media_links as unknown as BrandLink[];
    }

    return {
      success: true,
      data: {
        id: data.id,
        brandName: data.brand_name,
        email,
        activeNumber: data.active_number,
        warehouseAddress: data.warehouse_address || data.address || null,
        warehouseMapsUrl: data.warehouse_maps_url,
        socialMediaLinks: socialLinks,
        shortStory: data.short_story,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: translateSupabaseError(error),
    };
  }
}
