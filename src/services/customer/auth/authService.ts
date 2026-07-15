import { supabase } from "@/lib/supabaseClient";
import {
  type AuthInput,
  type AuthResponse,
  type PasswordResetResponse,
} from "@/types/auth";
import { translateSupabaseError } from "@/lib/supabaseError";

/**
 * Mendaftarkan customer baru.
 *
 * User dibuat melalui Supabase Auth, kemudian profilnya
 * disimpan ke tabel public.users.
 */
export async function signUpWithEmail(input: AuthInput): Promise<AuthResponse> {
  const { email, password, name } = input;

  const normalizedEmail = email?.trim();
  const normalizedName = name?.trim();

  if (!normalizedEmail || !password || !normalizedName) {
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
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          name: normalizedName,
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
        error: "Gagal membuat akun customer baru.",
      };
    }

    const { error: profileError } = await supabase.from("users").insert({
      id: authUser.id,
      full_name: normalizedName,
    });

    if (profileError) {
      console.error("Gagal membuat profil customer:", profileError);

      /*
       * Membersihkan session lokal apabila Auth berhasil
       * tetapi pembuatan profil gagal.
       */
      await supabase.auth.signOut();

      return {
        success: false,
        error: translateSupabaseError(profileError),
      };
    }

    return {
      success: true,
      message: "Pendaftaran akun berhasil.",
      data: {
        user: {
          id: authUser.id,
          email: authUser.email ?? normalizedEmail,
          name: normalizedName,
        },
      },
    };
  } catch (error: unknown) {
    console.error("Error saat mendaftarkan customer:", error);

    return {
      success: false,
      error: translateSupabaseError(error),
    };
  }
}

/**
 * Login khusus customer.
 *
 * Kredensial diperiksa melalui Supabase Auth.
 * Setelah itu user wajib ditemukan di tabel public.users.
 *
 * Akun brand atau waste provider yang mencoba login
 * melalui halaman customer akan langsung dikeluarkan.
 */
export async function signInWithEmail(
  input: Omit<AuthInput, "name">,
): Promise<AuthResponse> {
  const normalizedEmail = input.email?.trim();

  const { password } = input;

  if (!normalizedEmail || !password) {
    return {
      success: false,
      error: "Email dan kata sandi wajib diisi.",
    };
  }

  try {
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
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

    /*
     * Pastikan akun memang merupakan customer.
     */
    const { data: customerProfile, error: customerError } = await supabase
      .from("users")
      .select("full_name")
      .eq("id", authUser.id)
      .maybeSingle();

    if (customerError) {
      console.error("Gagal mengambil profil customer:", customerError);

      await supabase.auth.signOut();

      return {
        success: false,
        error: translateSupabaseError(customerError),
      };
    }

    if (!customerProfile) {
      await supabase.auth.signOut();

      return {
        success: false,
        error:
          "Akun ini tidak terdaftar sebagai customer. Silakan masuk melalui halaman yang sesuai.",
      };
    }

    const metadataName =
      typeof authUser.user_metadata?.name === "string"
        ? authUser.user_metadata.name
        : "";

    const customerName =
      customerProfile.full_name || metadataName || "Pengguna";

    return {
      success: true,
      message: "Berhasil masuk ke akun Anda.",
      data: {
        user: {
          id: authUser.id,
          email: authUser.email ?? normalizedEmail,
          name: customerName,
        },
      },
    };
  } catch (error: unknown) {
    console.error("Error saat login customer:", error);

    /*
     * Bersihkan session parsial jika terjadi error
     * setelah proses autentikasi.
     */
    await supabase.auth.signOut();

    return {
      success: false,
      error: translateSupabaseError(error),
    };
  }
}

/**
 * Mengirim email pemulihan password.
 */
export async function requestPasswordReset(
  email: string,
): Promise<PasswordResetResponse> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    return {
      success: false,
      error: "Email wajib diisi.",
    };
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(normalizedEmail)) {
    return {
      success: false,
      error: "Format email tidak valid.",
    };
  }

  try {
    const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(
      /\/$/,
      "",
    );

    const siteUrl =
      configuredSiteUrl ||
      (typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000");

    const { error } = await supabase.auth.resetPasswordForEmail(
      normalizedEmail,
      {
        redirectTo: `${siteUrl}/reset-password`,
      },
    );

    if (error) {
      return {
        success: false,
        error: translateSupabaseError(error),
      };
    }

    return {
      success: true,
      message:
        "Jika email tersebut terdaftar, tautan untuk mengatur ulang password akan segera dikirim.",
      data: null,
    };
  } catch (error: unknown) {
    console.error("Error saat meminta reset password:", error);

    return {
      success: false,
      error: translateSupabaseError(error),
    };
  }
}

/**
 * Memperbarui password dari halaman recovery.
 */
export async function updatePassword(
  newPassword: string,
): Promise<PasswordResetResponse> {
  if (!newPassword) {
    return {
      success: false,
      error: "Password baru wajib diisi.",
    };
  }

  if (newPassword.length < 8) {
    return {
      success: false,
      error: "Password baru harus minimal 8 karakter.",
    };
  }

  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      return {
        success: false,
        error: translateSupabaseError(sessionError),
      };
    }

    if (!session) {
      return {
        success: false,
        error:
          "Tautan reset password tidak valid atau sudah kedaluwarsa. Silakan minta tautan baru.",
      };
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      return {
        success: false,
        error: translateSupabaseError(updateError),
      };
    }

    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      console.error(
        "Password berhasil diperbarui, tetapi gagal logout:",
        signOutError,
      );
    }

    return {
      success: true,
      message: "Password berhasil diperbarui. Silakan masuk kembali.",
      data: null,
    };
  } catch (error: unknown) {
    console.error("Error saat memperbarui password:", error);

    return {
      success: false,
      error: translateSupabaseError(error),
    };
  }
}

/**
 * Memulai autentikasi customer dengan Google.
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
    console.error("Error saat memulai Google Sign In:", error);

    throw new Error(`Gagal masuk menggunakan Google: ${error.message}`);
  }
}
