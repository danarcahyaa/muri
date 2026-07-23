"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabaseClient";
import {
  getMyActiveWorkshopRegistration,
  getWorkshopRegistrationErrorMessage,
  registerWorkshop,
} from "@/services/customer";
import type { CustomerWorkshopRegistration } from "@/types/customerWorkshop";
import type { WorkshopCatalogItem } from "@/types/workshop";

export type WorkshopBookingFeedback = {
  type: "success" | "error";
  message: string;
} | null;

interface UseWorkshopBookingParams {
  workshop: WorkshopCatalogItem;
  loginHref: string;
}

interface UseWorkshopBookingResult {
  activeRegistration: CustomerWorkshopRegistration | null;
  bookingPercentage: number;
  closeConfirmation: () => void;
  feedback: WorkshopBookingFeedback;
  handleConfirmRegistration: () => Promise<void>;
  handleRegisterClick: () => Promise<void>;
  isCheckingRegistration: boolean;
  isConfirmOpen: boolean;
  isSubmitting: boolean;
}

export function useWorkshopBooking({
  workshop,
  loginHref,
}: UseWorkshopBookingParams): UseWorkshopBookingResult {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<WorkshopBookingFeedback>(null);
  const [activeRegistration, setActiveRegistration] =
    useState<CustomerWorkshopRegistration | null>(null);
  const [isCheckingRegistration, setIsCheckingRegistration] = useState(true);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const bookingPercentage = calculateBookingPercentage(workshop);

  useEffect(() => {
    let isCancelled = false;

    async function checkRegistration() {
      setIsCheckingRegistration(true);

      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (isCancelled) {
          return;
        }

        if (authError) {
          setFeedback({
            type: "error",
            message: "Status akun belum dapat diperiksa.",
          });
          setActiveRegistration(null);
          return;
        }

        if (!user) {
          setActiveRegistration(null);
          return;
        }

        const result = await getMyActiveWorkshopRegistration(workshop.id);

        if (isCancelled) {
          return;
        }

        if (!result.success) {
          setFeedback({
            type: "error",
            message: "Status pendaftaran belum dapat diperiksa.",
          });
          setActiveRegistration(null);
          return;
        }

        setActiveRegistration(result.data ?? null);
      } catch {
        if (!isCancelled) {
          setFeedback({
            type: "error",
            message: "Status pendaftaran belum dapat diperiksa.",
          });
          setActiveRegistration(null);
        }
      } finally {
        if (!isCancelled) {
          setIsCheckingRegistration(false);
        }
      }
    }

    void checkRegistration();

    return () => {
      isCancelled = true;
    };
  }, [workshop.id]);

  useEffect(() => {
    if (!isConfirmOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSubmitting) {
        setIsConfirmOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isConfirmOpen, isSubmitting]);

  async function handleRegisterClick() {
    if (isSubmitting || workshop.isFull || activeRegistration) {
      return;
    }

    setFeedback(null);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push(loginHref);
        return;
      }

      setIsConfirmOpen(true);
    } catch {
      setFeedback({
        type: "error",
        message: "Status akun belum dapat diperiksa. Silakan coba kembali.",
      });
    }
  }

  async function handleConfirmRegistration() {
    if (isSubmitting) {
      return;
    }

    setFeedback(null);
    setIsSubmitting(true);

    try {
      const result = await registerWorkshop(workshop.id);

      if (!result.success) {
        setFeedback({
          type: "error",
          message: getWorkshopRegistrationErrorMessage(result.error),
        });
        return;
      }

      const registration = result.data;

      if (!registration) {
        setFeedback({
          type: "error",
          message:
            "Pendaftaran berhasil diproses, tetapi data hasil tidak ditemukan.",
        });
        return;
      }

      setActiveRegistration({
        id: registration.registrationId,
        workshopId: registration.workshopId,
        status: registration.status,
        pointsSpent: registration.pointsSpent,
        createdAt: registration.registeredAt,
        updatedAt: registration.registeredAt,
        attendedAt: null,
        cancelledAt: null,
      });

      setFeedback({
        type: "success",
        message:
          workshop.pointCost > 0
            ? `Pendaftaran berhasil. Sisa poin Anda ${registration.remainingPoints}.`
            : "Pendaftaran workshop berhasil.",
      });

      setIsConfirmOpen(false);
      router.refresh();
    } catch {
      setFeedback({
        type: "error",
        message: "Terjadi kesalahan saat mendaftar. Silakan coba kembali.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function closeConfirmation() {
    if (!isSubmitting) {
      setIsConfirmOpen(false);
    }
  }

  return {
    activeRegistration,
    bookingPercentage,
    closeConfirmation,
    feedback,
    handleConfirmRegistration,
    handleRegisterClick,
    isCheckingRegistration,
    isConfirmOpen,
    isSubmitting,
  };
}

function calculateBookingPercentage(workshop: WorkshopCatalogItem): number {
  if (workshop.quota <= 0) {
    return 100;
  }

  return Math.min(
    Math.max((workshop.registeredCount / workshop.quota) * 100, 0),
    100,
  );
}
