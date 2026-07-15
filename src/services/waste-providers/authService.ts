import { supabase } from "@/lib/supabaseClient";
import { translateSupabaseError } from "@/lib/supabaseError";
import { WasteProviderRegisterInput, WasteProviderRegisterResponse } from "@/types/wasteProvider";
import { AuthInput, AuthResponse } from "@/types/auth";

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
  const { companyName, email, password, activeNumber, address } = input;

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
      address: (address ? address : null) as any,
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

/**
 * Signs in a waste provider account using email and password.
 * Also verifies if the authenticated user has a record in the public waste_providers table.
 * 
 * @param input Waste provider login credentials (email, password)
 * @returns AuthResponse with session data or error message
 */
export async function loginWasteProvider(
  input: Omit<AuthInput, "name">
): Promise<AuthResponse> {
  const { email, password } = input;

  if (!email || !password) {
    return {
      success: false,
      error: "Email bisnis dan kata sandi wajib diisi.",
    };
  }

  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
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
        error: "Gagal memuat sesi autentikasi penyedia limbah.",
      };
    }

    // Verify if the user profile exists in the waste_providers table
    const { data: providerProfile, error: providerError } = await supabase
      .from("waste_providers")
      .select("company_name")
      .eq("id", authUser.id)
      .maybeSingle();

    if (providerError) {
      console.error("Error retrieving waste provider profile:", providerError);
    }

    if (!providerProfile) {
      // Sign out to clean up the invalid session
      await supabase.auth.signOut();
      return {
        success: false,
        error: "Akun ini tidak terdaftar sebagai penyedia limbah.",
      };
    }

    return {
      success: true,
      message: "Berhasil masuk ke akun penyedia limbah.",
      data: {
        user: {
          id: authUser.id,
          email: authUser.email as string,
          name: providerProfile.company_name,
        },
      },
    };
  } catch (err: unknown) {
    console.error("Error in loginWasteProvider service:", err);
    return {
      success: false,
      error: translateSupabaseError(err),
    };
  }
}
