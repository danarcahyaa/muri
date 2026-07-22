export type WorkshopRegistrationStatus =
  | "registered"
  | "attended"
  | "cancelled";

export interface WorkshopCatalogItem {
  id: string;
  brandId: string;

  title: string;
  descriptionHtml: string;

  speakerName: string;
  speakerRole: string;

  location: string;
  bannerUrl: string | null;

  pointCost: number;
  quota: number;

  registeredCount: number;
  remainingSlots: number;
  isFull: boolean;

  heldAt: string;

  createdAt: string | null;
  updatedAt: string | null;
}