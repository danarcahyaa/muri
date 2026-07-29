import { supabase } from "@/lib/supabaseClient";
import { translateSupabaseError } from "@/lib/supabaseError";
import type { BaseResponse } from "@/types/common";
import type {
  CustomerProfileData,
  UpdateCustomerProfileInput,
} from "@/types/customerProfile";

/**
 * Mengambil profil customer yang sedang login.
 */
export async function getCustomerProfile(): Promise<
  BaseResponse<CustomerProfileData>
> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "UNAUTHENTICATED",
      };
    }

    const { data: userRow, error: userError } = await supabase
      .from("users")
      .select("id, full_name, phone_number, shipping_address, total_points, created_at")
      .eq("id", user.id)
      .maybeSingle();

    if (userError) {
      return {
        success: false,
        error: translateSupabaseError(userError),
      };
    }

    const email = user.email ?? "";
    const fullName =
      userRow?.full_name ||
      (typeof user.user_metadata?.name === "string"
        ? user.user_metadata.name
        : "") ||
      "Pengguna MURI";

    return {
      success: true,
      data: {
        id: user.id,
        email,
        fullName,
        phoneNumber: userRow?.phone_number ?? null,
        shippingAddress: userRow?.shipping_address ?? null,
        totalPoints: userRow?.total_points ?? 0,
        createdAt: userRow?.created_at ?? user.created_at ?? null,
      },
    };
  } catch (error: unknown) {
    console.error("[profileService] Failed to get profile:", error);
    return {
      success: false,
      error: translateSupabaseError(error),
    };
  }
}

/**
 * Memperbarui data profil customer (nama, nomor telepon, alamat pengiriman).
 */
export async function updateCustomerProfile(
  input: UpdateCustomerProfileInput,
): Promise<BaseResponse<CustomerProfileData>> {
  const normalizedName = input.fullName.trim();
  const normalizedPhone = input.phoneNumber?.trim() || null;
  const normalizedAddress = input.shippingAddress?.trim() || null;

  if (!normalizedName) {
    return {
      success: false,
      error: "Nama lengkap wajib diisi.",
    };
  }

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "UNAUTHENTICATED",
      };
    }

    // Update public.users table
    const { error: updateError } = await supabase
      .from("users")
      .update({
        full_name: normalizedName,
        phone_number: normalizedPhone,
        shipping_address: normalizedAddress,
      })
      .eq("id", user.id);

    if (updateError) {
      return {
        success: false,
        error: translateSupabaseError(updateError),
      };
    }

    // Update user_metadata in auth
    await supabase.auth.updateUser({
      data: {
        name: normalizedName,
      },
    });

    return getCustomerProfile();
  } catch (error: unknown) {
    console.error("[profileService] Failed to update profile:", error);
    return {
      success: false,
      error: translateSupabaseError(error),
    };
  }
}
