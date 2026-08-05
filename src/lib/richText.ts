/**
 * Menghilangkan seluruh tag HTML tetapi mempertahankan teks.
 *
 * Cocok untuk card katalog, search, metadata, dan excerpt.
 */
export function sanitizeRichTextAsPlainHtml(
  value: string | null | undefined,
): string {
  if (!value) {
    return "";
  }

  return value
    .replace(/<script\b[^<]*>([\s\S]*?)<\/script>/gi, "")
    .replace(/<style\b[^<]*>([\s\S]*?)<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Membersihkan HTML rich-text tetapi tetap mempertahankan
 * formatting dasar seperti bold, italic, underline, dan list.
 *
 * Dibuat murni tanpa jsdom / isomorphic-dompurify untuk mencegah
 * ERR_REQUIRE_ESM pada Vercel Serverless SSR.
 */
export function sanitizeRichTextHtml(
  value: string | null | undefined,
): string {
  if (!value) {
    return "";
  }

  // 1. Buang tag berbahaya beserta seluruh isinya
  let clean = value
    .replace(/<script\b[^<]*>([\s\S]*?)<\/script>/gi, "")
    .replace(/<style\b[^<]*>([\s\S]*?)<\/style>/gi, "")
    .replace(/<iframe\b[^<]*>([\s\S]*?)<\/iframe>/gi, "")
    .replace(/<object\b[^<]*>([\s\S]*?)<\/object>/gi, "")
    .replace(/<embed\b[^<]*>([\s\S]*?)<\/embed>/gi, "")
    .replace(/<svg\b[^<]*>([\s\S]*?)<\/svg>/gi, "");

  const allowedTags = [
    "p",
    "br",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "ul",
    "ol",
    "li",
  ];

  // 2. Filter tag tersisa: hapus atribut & buang tag non-izinkan (isinya tetap dipertahankan)
  clean = clean.replace(/<\/?([a-z0-9]+)\b[^>]*>/gi, (match, tagName) => {
    const lower = tagName.toLowerCase();

    if (allowedTags.includes(lower)) {
      if (match.startsWith("</")) {
        return `</${lower}>`;
      }
      if (lower === "br") {
        return "<br />";
      }
      return `<${lower}>`;
    }

    return "";
  });

  return clean.trim();
}

/**
 * Memeriksa apakah rich text benar-benar memiliki isi.
 */
export function isRichTextEmpty(
  value: string | null | undefined,
): boolean {
  return (
    sanitizeRichTextAsPlainHtml(value)
      .replace(/&nbsp;/gi, "")
      .trim().length === 0
  );
}