import { supabase } from "@/lib/supabaseClient";
import { UserRow } from "@/types/user";
import { User } from "@supabase/supabase-js";

/**
 * Retrieves a user profile by user ID.
 * Used to check whether a user is already registered in the public users table.
 * 
 * @param id The user ID to look up
 * @returns UserRow or null if not found
 */
export async function getUserById(id: string): Promise<UserRow | null> {
  if (!id) return null;

  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching user by id:", error);
      throw new Error(`Gagal memverifikasi profil: ${error.message}`);
    }

    return (data as UserRow) || null;
  } catch (err) {
    console.error("Error in getUserById service:", err);
    throw err;
  }
}

/**
 * Syncs a Google OAuth user profile to the public users table.
 * Creates a user profile if they do not exist.
 * 
 * @param user The Supabase User object
 */
export async function syncGoogleUser(user: User): Promise<void> {
  if (!user) return;

  try {
    const existingUser = await getUserById(user.id);
    if (!existingUser) {
      const name = user.user_metadata.full_name || user.user_metadata.name || "Pengguna Google";
      const { error: insertError } = await supabase.from("users").insert({
        id: user.id,
        full_name: name,
      });

      if (insertError) {
        // Code 23505 indicates the user already exists in the table (unique key violation).
        // Since the profile exists, we can safely treat this as a success and return.
        if (insertError.code === "23505") {
          return;
        }
        console.error("Error inserting Google user profile:", insertError);
        throw insertError;
      }
    }
  } catch (error) {
    console.error("Error in syncGoogleUser service:", error);
    throw error;
  }
}

/**
 * Retrieves the email of the currently authenticated brand/user from the session.
 * 
 * @returns The email of the authenticated brand, or null if not authenticated.
 */
export async function getBrandEmail(): Promise<string | null> {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      return null;
    }
    return data.user.email || null;
  } catch (err) {
    console.error("Error in getBrandEmail:", err);
    return null;
  }
}
