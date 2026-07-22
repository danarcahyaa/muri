import type { BaseResponse } from "./common";

/**
 * Metric summary statistics for the Brand fashion dashboard.
 */
export interface BrandDashboardStats {
  /** Accumulation of saved fabric waste (in Kg) from purchase_traces */
  totalDistributedWaste: number;
  /** Environmental impact metric: Carbon emission offset (in Kg CO2) */
  carbonSavedKg: number;
  /** Environmental impact metric: Clean water saved (in Liters) */
  waterSavedLiters: number;
  /** Total active products count owned by the brand */
  totalProductsCount: number;
  /** Total incoming orders count containing the brand's products */
  totalOrdersCount: number;
}

/**
 * Recent material purchase item structure.
 */
export interface RecentPurchase {
  id: string;
  fabric_name_snapshot: string;
  weight_bought_kg: number;
  final_price_idr: number;
  created_at: string;
  purchase_status: string;
}

/**
 * Payload data returned by the brand dashboard service.
 */
export interface BrandDashboardData {
  stats: BrandDashboardStats;
}

export type BrandDashboardResponse = BaseResponse<BrandDashboardData>;
