import type { WorkshopRegistrationStatus } from "@/enums/enums";

export type WorkshopRegistrationErrorCode =
  | "UNAUTHENTICATED"
  | "INVALID_WORKSHOP_ID"
  | "WORKSHOP_NOT_FOUND"
  | "WORKSHOP_ALREADY_STARTED"
  | "WORKSHOP_FULL"
  | "ALREADY_REGISTERED"
  | "INSUFFICIENT_POINTS"
  | "USER_PROFILE_NOT_FOUND"
  | "REGISTRATION_FAILED";

export interface RegisterWorkshopResult {
  registrationId: string;
  workshopId: string;

  status: WorkshopRegistrationStatus;

  pointsSpent: number;
  remainingPoints: number;

  registeredAt: string;
}

export interface CustomerWorkshopRegistration {
  id: string;
  workshopId: string;

  status: WorkshopRegistrationStatus;

  pointsSpent: number;

  createdAt: string | null;
  updatedAt: string;

  attendedAt: string | null;
  cancelledAt: string | null;
}

export interface CustomerWorkshopSummary {
  id: string;

  title: string;

  speakerName: string;
  speakerRole: string;

  location: string;
  heldAt: string;

  bannerUrl: string | null;
}

export interface CustomerWorkshopHistoryItem extends CustomerWorkshopRegistration {
  /**
   * Bisa null apabila workshop tidak dapat dibaca lagi,
   * misalnya workshop dihapus atau aksesnya berubah.
   */
  workshop: CustomerWorkshopSummary | null;
}
