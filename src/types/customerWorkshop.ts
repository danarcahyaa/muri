import type {
  WorkshopRegistrationStatus,
} from "@/enums/enum";

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