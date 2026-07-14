import { supabase } from "@/lib/supabaseClient";
import { translateSupabaseError } from "@/lib/supabaseError";
import { WasteProviderRegisterInput, WasteProviderRegisterResponse } from "@/types/wasteProvider";

/**
 * Registers a new waste provider account.
 * Checks for email uniqueness in the waste_providers table,
 * signs up the user in Supabase Auth, then inserts the profile into the waste_providers table.
 * 
 * @param input Waste provider registration data (companyName, email, password, activeNumber)
 * @returns WasteProviderRegisterResponse with status and optional data or error message
 */
export async function registerWasteProvider(
  input: WasteProviderRegisterInput
): Promise<WasteProviderRegisterResponse> {
  const { companyName, email, password, activeNumber } = input;

  if (!companyName.trim() || !email.trim() || !password || !activeNumber.trim()) {
    return {
      success: false,
      error: "Nama pabrik/garmen, email bisnis, nomor aktif, dan kata sandi wajib diisi.",
    };
  }

  try {
    // Sign up the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password: password,
      options: {
        data: {
          name: companyName.trim(),
          role: "waste_provider",
        },
      },
    });

    if (authError) {
      return {
        success: false,
        error: translateSupabaseError(authError),
      };
    }

    const authUser = authData.user;
    if (!authUser) {
      return {
        success: false,
        error: "Gagal membuat sesi autentikasi penyedia limbah baru.",
      };
    }

    // Insert the waste provider profile into the public `waste_providers` table (email and password columns have been removed)
    const { error: dbError } = await supabase.from("waste_providers").insert({
      id: authUser.id,
      company_name: companyName.trim(),
      active_number: activeNumber.trim(),
      address: null,
      pickup_address: null,
      pickup_maps_url: null,
    });

    if (dbError) {
      console.error("Error inserting waste provider profile:", dbError);
      return {
        success: false,
        error: translateSupabaseError(dbError),
      };
    }

    return {
      success: true,
      message: "Pendaftaran penyedia limbah berhasil.",
      data: {
        wasteProvider: {
          id: authUser.id,
          companyName: companyName.trim(),
          email: authUser.email as string,
        },
      },
    };
  } catch (err: unknown) {
    console.error("Error in registerWasteProvider service:", err);
    return {
      success: false,
      error: translateSupabaseError(err),
    };
  }
}
