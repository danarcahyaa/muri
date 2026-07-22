export type WorkshopPublishStatusFilter = "all" | "published" | "draft";

export interface BrandWorkshopItem {
  id: string;
  brandId: string;

  title: string;
  description: string;
  detail: string | null;

  speakerName: string;
  speakerRole: string;

  location: string;
  bannerUrl: string | null;

  heldAt: string;
  quota: number;
  registeredCount: number;
  remainingSlots: number;

  pointCost: number;
  isPublished: boolean;

  createdAt: string | null;
  updatedAt: string | null;
}

export interface BrandWorkshopFilterOptions {
  searchQuery?: string;
  statusFilter?: WorkshopPublishStatusFilter;
}
