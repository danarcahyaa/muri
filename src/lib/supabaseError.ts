/**
 * Translates Supabase Auth or database errors into friendly Indonesian messages.
 * Uses status codes and specific error messages for identification.
 * 
 * @param error The error object from Supabase (AuthError, PostgrestError, or generic Error)
 * @returns A user-friendly Indonesian error message string
 */
export function translateSupabaseError(error: any): string {
  if (!error) return "Terjadi kesalahan yang tidak diketahui.";

  // If it's a string, just return it
  if (typeof error === "string") {
    return error;
  }

  // Extract common error indicators
  const status = error.status || (error as any).statusCode;
  const message = error.message || "";
  const code = error.code || "";

  // Handle Postgres Database Errors (PostgrestError)
  if (code && typeof code === "string" && !isNaN(Number(code))) {
    switch (code) {
      case "23505": // unique_violation
        return "Data sudah terdaftar di dalam sistem (duplikasi data).";
      case "23503": // foreign_key_violation
        return "Data referensi tidak ditemukan atau tidak valid.";
      case "23502": // not_null_violation
        return "Kolom wajib tidak boleh kosong.";
      case "22P02": // invalid_text_representation
        return "Format data yang dimasukkan tidak valid.";
      default:
        break;
    }
  }

  // Handle Auth Errors based on specific English messages or error codes
  const msgLower = message.toLowerCase();
  
  if (msgLower.includes("invalid login credentials") || msgLower.includes("invalid credentials")) {
    return "Email atau kata sandi Anda salah.";
  }
  if (msgLower.includes("already registered") || msgLower.includes("email already in use") || msgLower.includes("email_taken")) {
    return "Email sudah terdaftar. Silakan gunakan email lain atau langsung masuk.";
  }
  if (msgLower.includes("user already exists") || msgLower.includes("user_already_exists")) {
    return "Pengguna dengan identitas ini sudah terdaftar.";
  }
  if (msgLower.includes("email not confirmed") || msgLower.includes("email_not_confirmed")) {
    return "Email Anda belum dikonfirmasi. Silakan periksa kotak masuk email Anda.";
  }
  if (msgLower.includes("password should be") || msgLower.includes("weak_password") || msgLower.includes("password is too short")) {
    return "Kata sandi terlalu lemah atau terlalu pendek. Gunakan minimal 8 karakter.";
  }
  if (msgLower.includes("rate limit") || msgLower.includes("too many requests") || status === 429) {
    return "Terlalu banyak permintaan masuk. Silakan tunggu beberapa saat sebelum mencoba lagi.";
  }
  if (msgLower.includes("token is expired") || msgLower.includes("session expired") || msgLower.includes("jwt expired")) {
    return "Sesi Anda telah berakhir. Silakan masuk kembali.";
  }

  // Handle HTTP Status Codes (as fallback)
  if (status) {
    switch (status) {
      case 400:
        return "Permintaan tidak valid. Silakan periksa kembali data yang Anda masukkan.";
      case 401:
        return "Sesi tidak sah. Silakan masuk terlebih dahulu.";
      case 403:
        return "Anda tidak memiliki izin untuk melakukan tindakan ini.";
      case 404:
        return "Data atau halaman yang Anda cari tidak ditemukan.";
      case 409:
        return "Terjadi konflik data. Data tersebut mungkin sudah digunakan.";
      case 422:
        return "Data yang dikirim tidak dapat diproses. Silakan hubungi admin.";
      case 429:
        return "Terlalu banyak permintaan. Silakan tunggu beberapa saat sebelum mencoba lagi.";
      case 500:
      case 502:
      case 503:
      case 504:
        return "Terjadi kesalahan internal pada server kami. Silakan coba sesaat lagi.";
      default:
        break;
    }
  }

  // Default generic error message in Indonesian
  return message || "Terjadi kesalahan sistem. Silakan coba lagi.";
}
