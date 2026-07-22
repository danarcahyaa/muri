export type { WorkshopRegistrationStatus } from "@/enums/enum";

export interface WorkshopCatalogItem {
  id: string;
  brandId: string;

  title: string;
  descriptionHtml: string;

  speakerName: string;
  speakerRole: string;

  location: string;
  mapsUrl: string | null;

  pointCost: number;
  quota: number;

  registeredCount: number;
  remainingSlots: number;
  isFull: boolean;

  heldAt: string;

  createdAt: string | null;
  updatedAt: string | null;
}
