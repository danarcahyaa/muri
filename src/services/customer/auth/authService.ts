import { supabase } from "@/lib/supabaseClient";
import { AuthInput, AuthResponse } from "@/types/auth";
import { translateSupabaseError } from "@/lib/supabaseError";

/**
 * Registers a new user with email, password, and name.
 * Performs registration through Supabase Auth, then saves profile.
 *
 * @param input Registration input data (email, password, name)
 * @returns AuthResponse containing the status of the registration
 */
export async function signUpWithEmail(input: AuthInput): Promise<AuthResponse> {
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
      email: email.trim(),
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
      message: "Pendaftaran akun berhasil.",
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
 * Signs in a user with email and password.
 *
 * @param input Login input data (email, password)
 * @returns AuthResponse containing the status of the sign in
 */
export async function signInWithEmail(
  input: Omit<AuthInput, "name">,
): Promise<AuthResponse> {
  const { email, password } = input;

  if (!email || !password) {
    return {
      success: false,
      error: "Email dan kata sandi wajib diisi.",
    };
  }

  try {
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
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
        error: "Gagal memuat informasi pengguna setelah masuk.",
      };
    }

    // Get name from user_metadata or public `users` table
    let name = authUser.user_metadata?.name || "";

    if (!name) {
      const { data: profile } = await supabase
        .from("users")
        .select("full_name")
        .eq("id", authUser.id)
        .single();
      if (profile && profile.full_name) {
        name = profile.full_name;
      }
    }

    return {
      success: true,
      message: "Berhasil masuk ke akun Anda.",
      data: {
        user: {
          id: authUser.id,
          email: authUser.email as string,
          name: name || "Pengguna",
        },
      },
    };
  } catch (err: any) {
    console.error("Error during signInWithEmail:", err);
    return {
      success: false,
      error: translateSupabaseError(err),
    };
  }
}

/**
 * Initiates the login/register flow using Google OAuth.
 */
export async function signInWithGoogle(
  from: "login" | "register" = "login",
  nextPath = "/dashboard",
): Promise<void> {
  const baseUrl =
    process.env.NEXT_PUBLIC_REDIRECT_URL ||
    (typeof window !== "undefined"
      ? `${window.location.origin}/google/auth/callback`
      : "http://localhost:3000/google/auth/callback");

  const callbackUrl = new URL(baseUrl);

  callbackUrl.searchParams.set("from", from);

  if (nextPath.startsWith("/") && !nextPath.startsWith("//")) {
    callbackUrl.searchParams.set("next", nextPath);
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl.toString(),
    },
  });

  if (error) {
    console.error("Error initiating Google sign in:", error);

    throw new Error(`Gagal masuk menggunakan Google: ${error.message}`);
  }
}
