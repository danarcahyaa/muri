import type { Database } from "@/types/database";

export type WastePostStatus =
  Database["public"]["Enums"]["waste_post_status"];

export type WasteMediaType =
  Database["public"]["Enums"]["media_type"];

export interface MaterialCatalogMedia {
  id: string;
  url: string;
  type: WasteMediaType;
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

  providerId: string;
  providerName: string;

  originCity: string;

  initialWeightKg: number;
  availableWeightKg: number;
  minimumOrderKg: number;
  pricePerKg: number;

  status: WastePostStatus;

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

  providerId: string;
  providerName: string;
  providerCreatedAt: string | null;

  originCity: string;

  postWeightKg: number;
  initialWeightKg: number;
  availableWeightKg: number;
  minimumOrderKg: number;
  pricePerKg: number;

  status: WastePostStatus;

  media: MaterialCatalogMedia[];
  primaryImageUrl: string | null;

  batchCreatedAt: string | null;
  postCreatedAt: string | null;
  postUpdatedAt: string | null;
}