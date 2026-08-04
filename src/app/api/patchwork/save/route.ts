import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_IMAGES = 4;
const MAX_TOTAL_UPLOAD_BYTES = 4 * 1024 * 1024;
const MAX_PERSISTED_IMAGE_BYTES = 15 * 1024 * 1024;
const MAX_INPUT_PIXELS = 40_000_000;
const RESULT_DOWNLOAD_TIMEOUT_MS = 30_000;
const PATCHWORK_STORAGE_BUCKET =
  process.env.PATCHWORK_STORAGE_BUCKET?.trim() || "ai-patchwork";

class RouteError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "RouteError";
    this.status = status;
  }
}

type AuthContext = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any;
  brandId: string;
};

type SavedPattern = {
  id: string;
  brandId: string;
  generatedDesignUrl: string;
  createdAt: string | null;
};

function isUploadedFile(value: unknown): value is File {
  return Boolean(
    value &&
      typeof value !== "string" &&
      typeof (value as File).arrayBuffer === "function" &&
      typeof (value as File).size === "number" &&
      (value as File).size > 0,
  );
}

function normalizeString(value: FormDataEntryValue | null, max = 500): string {
  if (typeof value !== "string") return "";
  return value.replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, max);
}

function getBearerToken(request: Request): string {
  const authorization = request.headers.get("authorization")?.trim() || "";
  if (!authorization.toLowerCase().startsWith("bearer ")) {
    throw new RouteError(401, "Sesi login brand tidak ditemukan.");
  }

  const token = authorization.slice(7).trim();
  if (!token) throw new RouteError(401, "Sesi login brand tidak valid.");
  return token;
}

async function authenticateBrand(request: Request): Promise<AuthContext> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!supabaseUrl || (!publishableKey && !anonKey && !serviceRoleKey)) {
    throw new RouteError(
      500,
      "Konfigurasi Supabase belum lengkap untuk menyimpan hasil.",
    );
  }

  const accessToken = getBearerToken(request);
  const databaseKey = serviceRoleKey || publishableKey || anonKey!;
  const supabase = createClient(supabaseUrl, databaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    ...(serviceRoleKey
      ? {}
      : {
          global: {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        }),
  });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(accessToken);

  if (userError || !user) {
    throw new RouteError(401, "Sesi login sudah berakhir. Silakan login ulang.");
  }

  const { data: brand, error: brandError } = await supabase
    .from("brands")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (brandError) {
    throw new RouteError(500, `Gagal memverifikasi akun brand: ${brandError.message}`);
  }
  if (!brand) {
    throw new RouteError(403, "Fitur penyimpanan hanya tersedia untuk akun brand.");
  }

  return { supabase, brandId: user.id };
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
  if (/^169\.254\./.test(host)) return true;
  return false;
}

function validateRemoteImageUrl(value: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new RouteError(400, "URL gambar hasil AI tidak valid.");
  }

  if (parsed.protocol !== "https:" || parsed.username || parsed.password) {
    throw new RouteError(400, "URL gambar hasil AI tidak diizinkan.");
  }
  if (isPrivateHostname(parsed.hostname)) {
    throw new RouteError(400, "Host gambar hasil AI tidak diizinkan.");
  }
  return parsed;
}

async function fetchImageBuffer(
  imageUrl: string,
): Promise<{ buffer: Buffer; contentType: string }> {
  if (imageUrl.startsWith("data:")) {
    const match = imageUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,([\s\S]+)$/);
    if (!match) throw new RouteError(400, "Format gambar hasil AI tidak valid.");

    const buffer = Buffer.from(match[2], "base64");
    if (!buffer.length || buffer.length > MAX_PERSISTED_IMAGE_BYTES) {
      throw new RouteError(400, "Ukuran gambar hasil AI tidak valid.");
    }
    return { buffer, contentType: match[1] };
  }

  const parsed = validateRemoteImageUrl(imageUrl);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), RESULT_DOWNLOAD_TIMEOUT_MS);

  try {
    const response = await fetch(parsed, {
      method: "GET",
      cache: "no-store",
      redirect: "follow",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new RouteError(502, `Gagal mengunduh gambar hasil AI (${response.status}).`);
    }

    const contentType = response.headers.get("content-type")?.split(";")[0] || "";
    if (!contentType.startsWith("image/")) {
      throw new RouteError(502, "URL hasil tidak mengembalikan file gambar.");
    }

    const declaredSize = Number(response.headers.get("content-length") || "0");
    if (declaredSize > MAX_PERSISTED_IMAGE_BYTES) {
      throw new RouteError(413, "Gambar hasil AI terlalu besar untuk disimpan.");
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    if (!buffer.length || buffer.length > MAX_PERSISTED_IMAGE_BYTES) {
      throw new RouteError(502, "Ukuran gambar hasil AI tidak valid.");
    }

    return { buffer, contentType };
  } catch (error) {
    if (error instanceof RouteError) throw error;
    if (
      error instanceof Error &&
      (error.name === "AbortError" || error.name === "TimeoutError")
    ) {
      throw new RouteError(504, "Pengunduhan gambar hasil AI mengalami timeout.");
    }
    throw new RouteError(502, "Gambar hasil AI tidak dapat diunduh untuk disimpan.");
  } finally {
    clearTimeout(timeoutId);
  }
}

async function normalizeGeneratedImage(imageUrl: string): Promise<Buffer> {
  const { buffer } = await fetchImageBuffer(imageUrl);
  try {
    return await sharp(buffer, {
      failOn: "error",
      limitInputPixels: MAX_INPUT_PIXELS,
    })
      .rotate()
      .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 92, effort: 4 })
      .toBuffer();
  } catch {
    throw new RouteError(502, "File gambar hasil AI rusak atau tidak didukung.");
  }
}

async function normalizeInputImage(file: File): Promise<Buffer> {
  const source = Buffer.from(await file.arrayBuffer());
  try {
    return await sharp(source, {
      failOn: "error",
      limitInputPixels: MAX_INPUT_PIXELS,
    })
      .rotate()
      .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 88, effort: 4 })
      .toBuffer();
  } catch {
    throw new RouteError(400, `Foto "${file.name || "material"}" tidak dapat disimpan.`);
  }
}

async function persistResult({
  auth,
  outputUrl,
  promptText,
  images,
  metadata,
}: {
  auth: AuthContext;
  outputUrl: string;
  promptText: string;
  images: File[];
  metadata: Record<string, string | null>;
}): Promise<SavedPattern> {
  const patternId = crypto.randomUUID();
  const uploadedPaths: string[] = [];

  try {
    const generatedBuffer = await normalizeGeneratedImage(outputUrl);
    const generatedPath = `${auth.brandId}/${patternId}/generated-design.webp`;
    const { error: generatedUploadError } = await auth.supabase.storage
      .from(PATCHWORK_STORAGE_BUCKET)
      .upload(generatedPath, generatedBuffer, {
        contentType: "image/webp",
        cacheControl: "31536000",
        upsert: false,
      });

    if (generatedUploadError) {
      throw new RouteError(
        500,
        `Gagal menyimpan hasil ke Supabase Storage: ${generatedUploadError.message}`,
      );
    }
    uploadedPaths.push(generatedPath);

    const {
      data: { publicUrl: generatedDesignUrl },
    } = auth.supabase.storage
      .from(PATCHWORK_STORAGE_BUCKET)
      .getPublicUrl(generatedPath);

    const inputRows: Array<{
      ai_pattern_id: string;
      uploaded_waste_image_url: string;
      fabric_notes: string;
    }> = [];

    for (const [index, image] of images.entries()) {
      const inputBuffer = await normalizeInputImage(image);
      const originalName = sanitizeStorageSegment(image.name || `material-${index + 1}`);
      const inputPath = `${auth.brandId}/${patternId}/inputs/${String(index + 1).padStart(2, "0")}-${originalName}.webp`;

      const { error: inputUploadError } = await auth.supabase.storage
        .from(PATCHWORK_STORAGE_BUCKET)
        .upload(inputPath, inputBuffer, {
          contentType: "image/webp",
          cacheControl: "31536000",
          upsert: false,
        });

      if (inputUploadError) {
        throw new RouteError(500, `Gagal menyimpan referensi material: ${inputUploadError.message}`);
      }
      uploadedPaths.push(inputPath);

      const {
        data: { publicUrl: inputPublicUrl },
      } = auth.supabase.storage.from(PATCHWORK_STORAGE_BUCKET).getPublicUrl(inputPath);

      inputRows.push({
        ai_pattern_id: patternId,
        uploaded_waste_image_url: inputPublicUrl,
        fabric_notes: JSON.stringify({
          ...metadata,
          originalFileName: image.name || null,
        }),
      });
    }

    const { data: savedPattern, error: patternError } = await auth.supabase
      .from("brand_ai_patterns")
      .insert({
        id: patternId,
        brand_id: auth.brandId,
        generated_design_url: generatedDesignUrl,
        prompt_text: promptText,
      })
      .select("id, brand_id, generated_design_url, created_at")
      .single();

    if (patternError || !savedPattern) {
      throw new RouteError(
        500,
        `Gagal menyimpan hasil AI ke database: ${patternError?.message || "data kosong"}`,
      );
    }

    if (inputRows.length > 0) {
      const { error: inputRowsError } = await auth.supabase
        .from("ai_input_materials")
        .insert(inputRows);

      if (inputRowsError) {
        await auth.supabase
          .from("brand_ai_patterns")
          .delete()
          .eq("id", patternId)
          .eq("brand_id", auth.brandId);

        throw new RouteError(
          500,
          `Hasil AI dibuat tetapi referensi material gagal dicatat: ${inputRowsError.message}`,
        );
      }
    }

    return {
      id: savedPattern.id as string,
      brandId: savedPattern.brand_id as string,
      generatedDesignUrl: savedPattern.generated_design_url as string,
      createdAt: (savedPattern.created_at as string | null) ?? null,
    };
  } catch (error) {
    if (uploadedPaths.length > 0) {
      await auth.supabase.storage
        .from(PATCHWORK_STORAGE_BUCKET)
        .remove(uploadedPaths)
        .catch(() => undefined);
    }
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const auth = await authenticateBrand(request);
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      throw new RouteError(415, "Content-Type harus multipart/form-data.");
    }

    const form = await request.formData().catch(() => null);
    if (!form) throw new RouteError(400, "Form penyimpanan tidak valid.");

    const outputUrl = typeof form.get("outputUrl") === "string"
      ? String(form.get("outputUrl")).trim()
      : "";
    const promptText = typeof form.get("promptText") === "string"
      ? String(form.get("promptText")).trim().slice(0, 12_000)
      : "";

    if (!outputUrl) throw new RouteError(400, "URL hasil AI tidak ditemukan.");
    if (!promptText) throw new RouteError(400, "Prompt hasil AI tidak ditemukan.");

    const images = form.getAll("images").filter(isUploadedFile);
    if (images.length > MAX_IMAGES) {
      throw new RouteError(400, `Maksimal ${MAX_IMAGES} foto referensi.`);
    }
    const totalBytes = images.reduce((sum, image) => sum + image.size, 0);
    if (totalBytes > MAX_TOTAL_UPLOAD_BYTES) {
      throw new RouteError(413, "Total foto referensi maksimal 4 MB.");
    }

    const metadata: Record<string, string | null> = {
      sourceMode: normalizeString(form.get("sourceMode"), 40) || null,
      materialTitle: normalizeString(form.get("materialTitle"), 160) || null,
      providerName: normalizeString(form.get("providerName"), 120) || null,
      materialSourceId: normalizeString(form.get("materialSourceId"), 100) || null,
      fabricType: normalizeString(form.get("fabricType"), 40) || null,
      pieceFormat: normalizeString(form.get("pieceFormat"), 40) || null,
      materialCondition: normalizeString(form.get("materialCondition"), 40) || null,
      targetProduct: normalizeString(form.get("targetProduct"), 40) || null,
      productionLevel: normalizeString(form.get("productionLevel"), 40) || null,
      visualDirection: normalizeString(form.get("visualDirection"), 40) || null,
      customNote: normalizeString(form.get("customNote"), 240) || null,
    };

    const savedPattern = await persistResult({
      auth,
      outputUrl,
      promptText,
      images,
      metadata,
    });

    return NextResponse.json(
      { success: true, savedPattern },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  } catch (error) {
    const status = error instanceof RouteError ? error.status : 500;
    const message = error instanceof Error ? error.message : "Gagal menyimpan hasil AI.";

    console.error("[patchwork/save] Error:", { status, message, cause: error });

    return NextResponse.json(
      {
        success: false,
        error: status >= 500 ? "Gagal menyimpan hasil AI." : message,
        detail:
          status < 500 || process.env.NODE_ENV !== "production"
            ? message
            : undefined,
      },
      {
        status,
        headers: {
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  }
}
