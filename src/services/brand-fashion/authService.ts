import { supabase } from "@/lib/supabaseClient";
import { translateSupabaseError } from "@/lib/supabaseError";
import { Json } from "@/types/database";
import { BrandRegisterInput, BrandRegisterResponse } from "@/types/brand";
import { hashPassword } from "@/lib/crypto";

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
  } catch (err: any) {
    console.error("Error in registerBrand service:", err);
    return {
      success: false,
      error: translateSupabaseError(err),
    };
  }
}