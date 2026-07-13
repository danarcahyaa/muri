import { supabase } from "@/lib/supabaseClient";
import { RegisterInput, AuthResponse } from "@/types/auth";
import { translateSupabaseError } from "@/lib/supabaseError";

/**
 * Registers a new user with email, password, and name.
 * Performs registration through Supabase Auth, then saves profile.
 * 
 * @param input Registration input data (email, password, name)
 * @returns AuthResponse containing the status of the registration
 */
export async function signUpWithEmail(input: RegisterInput): Promise<AuthResponse> {
  const { email, password, name } = input;

  if (!email || !password || !name) {
    return {
      success: false,
      error: "Semua kolom input (Nama, Email, Password) wajib diisi.",
    };
  }

  if (password.length < 8) {
    return {
      success: false,
      error: "Kata sandi harus minimal 8 karakter.",
    };
  }

  try {
    // Sign up using Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password: password,
      options: {
        data: {
          name: name.trim(),
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
        error: "Gagal membuat sesi autentikasi pengguna baru.",
      };
    }

    // Insert the new user's profile into the public `users` table
    const { error: dbError } = await supabase.from("users").insert({
      id: authUser.id,
      full_name: name.trim(),
    });

    if (dbError) {
      console.error("Error inserting user profile:", dbError);
      return {
        success: false,
        error: `${translateSupabaseError(dbError)}`,
      };
    }

    return {
      success: true,
      message: "Pendaftaran berhasil! Silakan periksa email Anda untuk konfirmasi atau langsung masuk.",
      data: {
        user: {
          id: authUser.id,
          email: authUser.email as string,
          name: name.trim(),
        },
      },
    };
  } catch (err: any) {
    console.error("Error during signUpWithEmail:", err);
    return {
      success: false,
      error: translateSupabaseError(err),
    };
  }
}

/**
 * Initiates the login/register flow using Google OAuth.
 */
export async function signInWithGoogle(from: "login" | "register" = "login"): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_REDIRECT_URL || 
                  (typeof window !== "undefined" 
                    ? `${window.location.origin}/google/auth/callback` 
                    : "http://localhost:3000/google/auth/callback");

  const redirectUrl = `${baseUrl}?from=${from}`;

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectUrl,
    },
  });

  if (error) {
    console.error("Error initiating Google sign in:", error);
    throw new Error(`Gagal masuk menggunakan Google: ${error.message}`);
  }
}
