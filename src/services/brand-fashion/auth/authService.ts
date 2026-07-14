import { supabase } from "@/lib/supabaseClient";
import { translateSupabaseError } from "@/lib/supabaseError";
import { Json } from "@/types/database";
import { BrandRegisterInput, BrandRegisterResponse } from "@/types/brand";
import { hashPassword } from "@/lib/crypto";
import { AuthInput, AuthResponse } from "@/types/auth";

/**
 * Registers a new brand account.
 * Checks for email uniqueness in the brands table,
 * signs up the user in Supabase Auth, then inserts the profile into the brands table.
 * 
 * @param input Brand registration data (name, email, password, social links, short story)
 * @returns BrandRegisterResponse with status and optional data or error message
 */
export async function registerBrand(
  input: BrandRegisterInput
): Promise<BrandRegisterResponse> {
  const { brandName, email, password, socialMediaLinks, shortStory } = input;

  if (!brandName.trim() || !email.trim() || !password) {
    return {
      success: false,
      error: "Nama brand, email bisnis, dan kata sandi wajib diisi.",
    };
  }

  try {
    // Verify email is unique in the brands table
    const { data: existingBrand, error: checkError } = await supabase
      .from("brands")
      .select("id")
      .eq("email", email.trim())
      .maybeSingle();

    if (checkError) {
      console.error("Error checking brand email uniqueness:", checkError);
    }

    if (existingBrand) {
      return {
        success: false,
        error: "Email sudah terdaftar. Silakan gunakan email lain.",
      };
    }

    // Sign up the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password: password,
      options: {
        data: {
          name: brandName.trim(),
          role: "brand",
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
        error: "Gagal membuat sesi autentikasi brand baru.",
      };
    }

    // Hash the password before inserting into the public database
    const hashedPassword = await hashPassword(password);

    // Insert the brand profile into the public `brands` table
    const { error: dbError } = await supabase.from("brands").insert({
      id: authUser.id,
      brand_name: brandName.trim(),
      email: email.trim(),
      password: hashedPassword,
      short_story: shortStory?.trim() || null,
      social_media_links: socialMediaLinks as unknown as Json,
      whatsapp_number: "", // default value
      warehouse_address: null, // nullable now in database.ts
      address: null, // nullable now in database.ts
    });

    if (dbError) {
      console.error("Error inserting brand profile:", dbError);
      return {
        success: false,
        error: translateSupabaseError(dbError),
      };
    }

    return {
      success: true,
      message: "Pendaftaran brand berhasil.",
      data: {
        brand: {
          id: authUser.id,
          brandName: brandName.trim(),
          email: authUser.email as string,
        },
      },
    };
  } catch (err: unknown) {
    console.error("Error in registerBrand service:", err);
    return {
      success: false,
      error: translateSupabaseError(err),
    };
  }
}

/**
 * Signs in a brand account using email and password.
 * Also verifies if the authenticated user has a record in the public brands table.
 * 
 * @param input Brand login credentials (email, password)
 * @returns AuthResponse with session data or error message
 */
export async function loginBrand(
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
        error: "Gagal memuat sesi autentikasi brand.",
      };
    }

    // Verify if the user profile exists in the brands table
    const { data: brandProfile, error: brandError } = await supabase
      .from("brands")
      .select("brand_name")
      .eq("id", authUser.id)
      .maybeSingle();

    if (brandError) {
      console.error("Error retrieving brand profile:", brandError);
    }

    if (!brandProfile) {
      // Sign out to clean up the invalid brand session
      await supabase.auth.signOut();
      return {
        success: false,
        error: "Akun ini tidak terdaftar sebagai brand.",
      };
    }

    return {
      success: true,
      message: "Berhasil masuk ke akun brand.",
      data: {
        user: {
          id: authUser.id,
          email: authUser.email as string,
          name: brandProfile.brand_name,
        },
      },
    };
  } catch (err: unknown) {
    console.error("Error in loginBrand service:", err);
    return {
      success: false,
      error: translateSupabaseError(err),
    };
  }
}