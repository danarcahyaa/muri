import DOMPurify from "isomorphic-dompurify";
import type { Config } from "isomorphic-dompurify";

const RICH_TEXT_CONFIG: Config = {
  ALLOWED_TAGS: [
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
  ],

  // Tidak menerima style, class, data-subtree,
  // data-copy-service-computed-style, dan atribut lainnya.
  ALLOWED_ATTR: [],

  ALLOW_DATA_ATTR: false,
  ALLOW_ARIA_ATTR: false,

  // Isi dari tag yang dibuang tetap dipertahankan.
  // Contoh: <span>Text</span> menjadi Text.
  KEEP_CONTENT: true,
};

/**
 * Membersihkan HTML rich-text tetapi tetap mempertahankan
 * formatting dasar seperti bold, italic, underline, dan list.
 */
export function sanitizeRichTextHtml(
  value: string | null | undefined,
): string {
  if (!value) {
    return "";
  }

  return DOMPurify.sanitize(
    value,
    RICH_TEXT_CONFIG,
  ).trim();
}

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

  return DOMPurify.sanitize(value, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    ALLOW_DATA_ATTR: false,
    ALLOW_ARIA_ATTR: false,
    KEEP_CONTENT: true,
  })
    .replace(/\s+/g, " ")
    .trim();
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