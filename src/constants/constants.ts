import { OrderStatus as PurchaseStatus, WastePostStatus } from "@/enums/enums";
import { WorkshopPublishStatusFilter } from "@/types/brandWorkshop";

export const ALL_CATEGORIES = ["Katun", "Denim", "Linen", "Rayon", "Polyester", "Sutra", "Sintetis", "Campuran"];

/** All possible statuses for a waste inventory post. */
export const ALL_WASTE_STATUSES = [
  WastePostStatus.ACTIVE,
  WastePostStatus.SOLD_OUT,
  WastePostStatus.INACTIVE,
];

/** All possible statuses for a purchase/order. */
export const ALL_STATUSES = [
  PurchaseStatus.PENDING,
  PurchaseStatus.PROCESSING,
  PurchaseStatus.SHIPPED,
  PurchaseStatus.COMPLETE,
  PurchaseStatus.CANCELLED,
  PurchaseStatus.REJECTED,
];


export const WORKSHOP_STATUS_OPTIONS: { value: WorkshopPublishStatusFilter; label: string }[] = [
  { value: "all", label: "Semua Status" },
  { value: "published", label: "Dipublikasikan" },
  { value: "draft", label: "Draft" },
];