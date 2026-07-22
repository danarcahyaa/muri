/**
 * View-model material yang digunakan komponen UI.
 *
 * Tipe ini sengaja tidak mengekspos bentuk mentah jsonb
 * media_urls_snapshot. Service menormalisasikannya menjadi array
 * MaterialCatalogMedia agar komponen tidak perlu memahami format database.
 */

export interface MaterialCatalogMedia {
  id: string;
  url: string;
  type: string;
  createdAt: string | null;
}

export interface MaterialCatalogItem {
  batchId: string;
  batchCode: string;
  wastePostId: string;

  title: string;
  description: string;

  categoryId: number;
  categoryName: string;

  /**
   * Nilai immutable yang disalin ketika batch dibuat.
   * title dan categoryName saat ini menggunakan nilai snapshot ini.
   */
  fabricNameSnapshot: string;
  fabricCategorySnapshot: string;

  providerId: string;
  providerName: string;

  originCity: string;

  initialWeightKg: number;
  availableWeightKg: number;
  minimumOrderKg: number;
  pricePerKg: number;

  status: string;

  media: MaterialCatalogMedia[];
  imageUrl: string | null;

  createdAt: string | null;
}

export interface MaterialDetailItem {
  batchId: string;
  batchCode: string;
  wastePostId: string;

  title: string;
  descriptionHtml: string;

  categoryId: number;
  categoryName: string;

  /**
   * Nilai immutable yang disalin ketika batch dibuat.
   * title dan categoryName saat ini menggunakan nilai snapshot ini.
   */
  fabricNameSnapshot: string;
  fabricCategorySnapshot: string;

  providerId: string;
  providerName: string;
  providerCreatedAt: string | null;

  originCity: string;

  postWeightKg: number;
  initialWeightKg: number;
  availableWeightKg: number;
  minimumOrderKg: number;
  pricePerKg: number;

  status: string;

  media: MaterialCatalogMedia[];
  primaryImageUrl: string | null;

  batchCreatedAt: string | null;
  postCreatedAt: string | null;
  postUpdatedAt: string | null;
}
