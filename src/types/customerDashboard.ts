export interface CustomerDashboardSummary {
  totalPoints: number;

  activeWorkshopCount: number;
  attendedWorkshopCount: number;

  totalOrders: number;

  carbonSavedKg: number;
  waterSavedLiters: number;
  materialSavedGrams: number;
}