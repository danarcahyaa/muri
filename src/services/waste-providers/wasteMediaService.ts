import { supabase } from "@/lib/supabaseClient";

/**
 * Helper function to upload a media file to Supabase storage bucket "Muri"
 * inside the "waste_post_media/{providerId}/" folder.
 */
export async function uploadMediaFile(providerId: string, file: File): Promise<string> {
  const sanitizedOriginalName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
  const fileName = `${providerId}/waste_post_media/${Date.now()}_${Math.random().toString(36).substring(2, 9)}_${sanitizedOriginalName}`;

  const { error } = await supabase.storage
    .from("Muri")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(`Gagal mengunggah file ${file.name}: ${error.message}`);
  }

  const { data } = supabase.storage
    .from("Muri")
    .getPublicUrl(fileName);

  return data.publicUrl;
}
