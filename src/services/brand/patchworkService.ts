import { supabase } from "@/lib/supabaseClient";
import { translateSupabaseError } from "@/lib/supabaseError";
import type { BaseResponse } from "@/types/common";

const PATCHWORK_STORAGE_BUCKET = "ai-patchwork";
const MAX_IMAGES = 4;
const MAX_TOTAL_UPLOAD_BYTES = 4 * 1024 * 1024;
const MAX_PERSISTED_IMAGE_BYTES = 15 * 1024 * 1024;

export interface SavedBrandPattern {
  id: string;
  brandId: string;
  generatedDesignUrl: string;
  createdAt: string | null;
}

export interface SaveBrandPatchworkInput {
  outputUrl: string;
  promptText: string;
  images: File[];
  sourceMode: string;
  materialTitle?: string | null;
  providerName?: string | null;
  materialSourceId?: string | null;
  fabricType: string;
  pieceFormat: string;
  materialCondition: string;
  targetProduct: string;
  productionLevel: string;
  visualDirection: string;
  customNote: string;
}

function sanitizeStorageSegment(value: string): string {
  const normalized = value
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "")
    .slice(0, 80);

  return normalized || "material";
}

function isPrivateHostname(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (host === "localhost" || host === "::1" || host.endsWith(".local")) return true;
  if (/^127\./.test(host) || /^10\./.test(host) || /^192\.168\./.test(host)) return true;

  const match = host.match(/^172\.(\d+)\./);
  if (match) {
    const second = Number(match[1]);
    if (second >= 16 && second <= 31) return true;
  }

  return /^169\.254\./.test(host);
}

function guessExtension(mimeType: string): string {
  switch (mimeType) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/avif":
      return "avif";
    case "image/jpeg":
    default:
      return "jpg";
  }
}

async function fetchOutputAsBlob(outputUrl: string): Promise<Blob> {
  if (outputUrl.startsWith("data:")) {
    const response = await fetch(outputUrl);
    const blob = await response.blob();

    if (!blob.size || blob.size > MAX_PERSISTED_IMAGE_BYTES) {
      throw new Error("Ukuran gambar hasil AI tidak valid.");
    }

    return blob;
  }

  let parsed: URL;
  try {
    parsed = new URL(outputUrl);
  } catch {
    throw new Error("URL gambar hasil AI tidak valid.");
  }

  if (parsed.protocol !== "https:" || isPrivateHostname(parsed.hostname)) {
    throw new Error("URL gambar hasil AI tidak diizinkan.");
  }

  const response = await fetch(outputUrl, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Gagal mengunduh gambar hasil AI (${response.status}).`);
  }

  const contentType = response.headers.get("content-type")?.split(";")[0] || "";
  if (!contentType.startsWith("image/")) {
    throw new Error("URL hasil tidak mengembalikan file gambar.");
  }

  const blob = await response.blob();
  if (!blob.size || blob.size > MAX_PERSISTED_IMAGE_BYTES) {
    throw new Error("Ukuran gambar hasil AI tidak valid.");
  }

  return blob;
}

/**
 * Menyimpan hasil generate patchwork AI langsung dari client ke Supabase
 * Storage + database, tanpa melalui API route internal.
 */
export async function saveBrandPatchwork(
  input: SaveBrandPatchworkInput,
): Promise<BaseResponse<SavedBrandPattern>> {
  const uploadedPaths: string[] = [];

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "UNAUTHENTICATED" };
    }

    if (!input.outputUrl) {
      return { success: false, error: "URL hasil AI tidak ditemukan." };
    }

    if (!input.promptText) {
      return { success: false, error: "Prompt hasil AI tidak ditemukan." };
    }

    if (input.images.length > MAX_IMAGES) {
      return { success: false, error: `Maksimal ${MAX_IMAGES} foto referensi.` };
    }

    const totalBytes = input.images.reduce((sum, image) => sum + image.size, 0);
    if (totalBytes > MAX_TOTAL_UPLOAD_BYTES) {
      return { success: false, error: "Total foto referensi maksimal 4 MB." };
    }

    const brandId = user.id;
    const patternId = crypto.randomUUID();

    let outputBlob: Blob;
    try {
      outputBlob = await fetchOutputAsBlob(input.outputUrl);
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gambar hasil AI tidak dapat diunduh untuk disimpan.",
      };
    }

    const generatedExtension = guessExtension(outputBlob.type);
    const generatedPath = `${brandId}/${patternId}/generated-design.${generatedExtension}`;

    const { error: generatedUploadError } = await supabase.storage
      .from(PATCHWORK_STORAGE_BUCKET)
      .upload(generatedPath, outputBlob, {
        contentType: outputBlob.type || "image/jpeg",
        cacheControl: "31536000",
        upsert: false,
      });

    if (generatedUploadError) {
      return { success: false, error: translateSupabaseError(generatedUploadError) };
    }
    uploadedPaths.push(generatedPath);

    const {
      data: { publicUrl: generatedDesignUrl },
    } = supabase.storage.from(PATCHWORK_STORAGE_BUCKET).getPublicUrl(generatedPath);

    const metadata = {
      sourceMode: input.sourceMode || null,
      materialTitle: input.materialTitle || null,
      providerName: input.providerName || null,
      materialSourceId: input.materialSourceId || null,
      fabricType: input.fabricType || null,
      pieceFormat: input.pieceFormat || null,
      materialCondition: input.materialCondition || null,
      targetProduct: input.targetProduct || null,
      productionLevel: input.productionLevel || null,
      visualDirection: input.visualDirection || null,
      customNote: input.customNote || null,
    };

    const inputRows: Array<{
      ai_pattern_id: string;
      uploaded_waste_image_url: string;
      fabric_notes: string;
    }> = [];

    for (const [index, image] of input.images.entries()) {
      const originalName = sanitizeStorageSegment(image.name || `material-${index + 1}`);
      const extension = guessExtension(image.type);
      const inputPath = `${brandId}/${patternId}/inputs/${String(index + 1).padStart(2, "0")}-${originalName}.${extension}`;

      const { error: inputUploadError } = await supabase.storage
        .from(PATCHWORK_STORAGE_BUCKET)
        .upload(inputPath, image, {
          contentType: image.type || "image/jpeg",
          cacheControl: "31536000",
          upsert: false,
        });

      if (inputUploadError) {
        await supabase.storage.from(PATCHWORK_STORAGE_BUCKET).remove(uploadedPaths);
        return { success: false, error: translateSupabaseError(inputUploadError) };
      }
      uploadedPaths.push(inputPath);

      const {
        data: { publicUrl: inputPublicUrl },
      } = supabase.storage.from(PATCHWORK_STORAGE_BUCKET).getPublicUrl(inputPath);

      inputRows.push({
        ai_pattern_id: patternId,
        uploaded_waste_image_url: inputPublicUrl,
        fabric_notes: JSON.stringify({ ...metadata, originalFileName: image.name || null }),
      });
    }

    const { data: savedPattern, error: patternError } = await supabase
      .from("brand_ai_patterns")
      .insert({
        id: patternId,
        brand_id: brandId,
        generated_design_url: generatedDesignUrl,
        prompt_text: input.promptText,
      })
      .select("id, brand_id, generated_design_url, created_at")
      .single();

    if (patternError || !savedPattern) {
      await supabase.storage.from(PATCHWORK_STORAGE_BUCKET).remove(uploadedPaths);
      return { success: false, error: translateSupabaseError(patternError) };
    }

    if (inputRows.length > 0) {
      const { error: inputRowsError } = await supabase
        .from("ai_input_materials")
        .insert(inputRows);

      if (inputRowsError) {
        await supabase
          .from("brand_ai_patterns")
          .delete()
          .eq("id", patternId)
          .eq("brand_id", brandId);
        await supabase.storage.from(PATCHWORK_STORAGE_BUCKET).remove(uploadedPaths);

        return { success: false, error: translateSupabaseError(inputRowsError) };
      }
    }

    return {
      success: true,
      data: {
        id: savedPattern.id as string,
        brandId: savedPattern.brand_id as string,
        generatedDesignUrl: savedPattern.generated_design_url as string,
        createdAt: (savedPattern.created_at as string | null) ?? null,
      },
    };
  } catch (error) {
    if (uploadedPaths.length > 0) {
      await supabase.storage
        .from(PATCHWORK_STORAGE_BUCKET)
        .remove(uploadedPaths)
        .catch(() => undefined);
    }

    return { success: false, error: translateSupabaseError(error) };
  }
}