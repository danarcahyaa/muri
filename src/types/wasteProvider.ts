import { BaseResponse, MediaItem } from "./common";
import { WastePostStatus, MediaType } from "@/enums/enum";
export interface WasteProviderRegisterInput {
  companyName: string;
  email: string;
  password?: string;
  activeNumber: string;
  address?: { province: string; regency: string } | null;
}

export interface WasteProviderRegisterData {
  wasteProvider: {
    id: string;
    companyName: string;
    email: string;
  };
}

export type WasteProviderRegisterResponse = BaseResponse<WasteProviderRegisterData>;

export interface RecentWastePost {
  id: string;
  material: string;
  weight: string;
  status: string;
  date: string;
}

export interface DashboardStatsData {
  totalDistributedWaste: number;
  totalIncome: number;
  totalTransaction: number;
  currentFabricWeight: number;
  pendingOrdersCount: number;
}

export type DashboardStatsResponse = BaseResponse<{
  stats: DashboardStatsData;
}>;

export interface WastePostItem {
  id: string;
  custom_fabric_name: string | null;
  details_and_conditions: string;
  fabric_category_id: number;
  category_name: string;
  minimum_order_kg: number;
  price_per_kg: number;
  status: WastePostStatus;
  weight_kg: number;
  created_at: string | null;
  media_url?: string;
  media_list?: { url: string; type: MediaType }[];
  carbon_saved_kg?: number;
  water_saved_liter?: number;
  batch_code?: string;
  origin_city?: string;
}

export interface FabricCategoryItem {
  id: number;
  name: string;
}

export interface WasteInput {
  custom_fabric_name: string | null;
  fabric_category_id: number;
  weight_kg: number;
  price_per_kg: number;
  minimum_order_kg: number;
  details_and_conditions: string;
  status: WastePostStatus;
  media?: MediaItem[];
}

export interface WasteFilterInput {
  searchQuery?: string;
  categoryIds?: number[];
  statuses?: string[];
  sortBy?: "created_at" | "weight_kg" | "price_per_kg";
  sortOrder?: "asc" | "desc";
}

export interface WastePurchaseItem {
  id: string;
  brand_id: string;
  category_name_snapshot: string;
  fabric_name_snapshot: string;
  original_price_per_kg: number;
  final_price_idr: number;
  weight_bought_kg: number;
  purchase_status: string;
  media_urls_snapshot: any;
  waste_post_id: string;
  created_at: string;
  updated_at: string;
  brands: {
    id: string;
    brand_name: string;
  };
  waste_posts: {
    id: string;
    provider_id: string;
    custom_fabric_name: string;
  };
}

export interface PurchaseListResponse extends BaseResponse {
  data?: {
    purchases: WastePurchaseItem[];
    totalCount: number;
  };
}

export interface PurchaseMetricsData {
  waitingCount: number;
  completedCount: number;
  cancelledCount: number;
  rejectedCount: number;
}

export type PurchaseMetricsResponse = BaseResponse<PurchaseMetricsData>;


