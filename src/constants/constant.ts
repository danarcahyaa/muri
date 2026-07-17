import { OrderStatus as PurchaseStatus } from "@/enums/enum";
export const ALL_CATEGORIES = ["Katun", "Denim", "Linen", "Rayon", "Polyester", "Sutra", "Sintetis", "Campuran"];
export const ALL_STATUSES = [
  PurchaseStatus.PENDING,
  PurchaseStatus.COMPLETE,
  PurchaseStatus.CANCELLED,
  PurchaseStatus.REJECTED,
];