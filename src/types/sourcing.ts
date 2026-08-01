export interface SourcingFilterInput {
  searchQuery?: string;
  minPrice?: number;
  maxPrice?: number;
  minOrderKg?: number;
  categoryNames?: string[];
  location?: string;
  page?: number;
}

export interface SourcingWastePostItem {
  id: string;
  customFabricName: string;
  categoryName: string;
  pricePerKg: number;
  minimumOrderKg: number;
  weightKg: number;
  detailsAndConditions: string;
  status: string;
  providerName: string;
  providerLocation?: string;
  imageUrl: string | null;
  createdAt: string | null;
  isSaved?: boolean;
  savedId?: string;
}

export interface SavedWastePostItem {
  id: string;
  brandId: string;
  wastePostId: string;
  createdAt: string | null;
  wastePost: SourcingWastePostItem;
}
