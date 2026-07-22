"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Coins,
  Leaf,
  LoaderCircle,
} from "lucide-react";

import { supabase } from "@/lib/supabaseClient";
import type { WorkshopCatalogItem } from "@/types/workshop";
import type { CustomerWorkshopRegistration } from "@/types/customerWorkshop";
import {
  getMyActiveWorkshopRegistration,
  getWorkshopRegistrationErrorMessage,
  registerWorkshop,
} from "@/services/customer";

interface WorkshopBookingCardProps {
  workshop: WorkshopCatalogItem;
  loginHref: string;
}

type FeedbackState = {
  type: "success" | "error";
  message: string;
} | null;

export default function WorkshopBookingCard({
  workshop,
  loginHref,
}: WorkshopBookingCardProps) {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const [activeRegistration, setActiveRegistration] =
    useState<CustomerWorkshopRegistration | null>(null);

  const [isCheckingRegistration, setIsCheckingRegistration] = useState(true);

  const bookingPercentage = getBookingPercentage(workshop);

  useEffect(() => {
    let isCancelled = false;

    async function checkRegistration() {
      setIsCheckingRegistration(true);

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          if (!isCancelled) {
            setActiveRegistration(null);
          }

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

          return;
        }

        setActiveRegistration(result.data ?? null);
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

  async function handleRegister() {
    if (isSubmitting || workshop.isFull) {
      return;
    }

    setFeedback(null);
    setIsSubmitting(true);

    try {
      /*
       * Cek apakah customer sudah login.
       * Bila belum, arahkan ke login dan kembali
       * ke detail workshop setelah berhasil login.
       */
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push(loginHref);
        return;
      }

      const confirmed = window.confirm(
        workshop.pointCost > 0
          ? `Daftar workshop ini menggunakan ${workshop.pointCost} poin. Lanjutkan?`
          : "Daftar workshop ini sekarang?",
      );

      if (!confirmed) {
        return;
      }

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

        return;
      }

      setFeedback({
        type: "success",
        message:
          workshop.pointCost > 0
            ? `Pendaftaran berhasil. Sisa poin Anda ${registration.remainingPoints}.`
            : "Pendaftaran workshop berhasil.",
      });

      /*
       * Memuat ulang server component agar jumlah slot
       * dan peserta diperbarui dari database.
       */
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

  return (
    <aside
      className="
        self-start rounded-2xl border border-line-trace
        bg-canvas-pure p-6 sm:p-7
        lg:sticky lg:top-24
      "
    >
      <div className="flex items-center gap-3 text-brand-emerald">
        <Leaf className="size-4" strokeWidth={2} />

        <h2 className="text-xs font-bold uppercase tracking-tight">
          Ringkasan Pendaftaran
        </h2>
      </div>

      <div className="mt-7 rounded-xl bg-canvas-warm p-5">
        <div className="flex items-center justify-between gap-4">
          <p className="text-[11px] text-muted-moss">Ketersediaan</p>

          <p className="text-[11px] font-bold text-brand-black">
            {workshop.remainingSlots} dari {workshop.quota} slot
          </p>
        </div>

        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-line-trace">
          <div
            className="h-full rounded-full bg-brand-emerald transition-[width]"
            style={{
              width: `${bookingPercentage}%`,
            }}
          />
        </div>

        <p className="mt-3 text-[10px] text-muted-moss">
          {workshop.registeredCount} peserta telah terdaftar
        </p>
      </div>

      <div className="mt-5 rounded-xl bg-brand-lime p-6 text-brand-forest">
        <p className="text-[10px] uppercase tracking-wide opacity-70">
          Biaya Workshop
        </p>

        <div className="mt-7 flex items-center gap-3">
          <Coins className="size-7" strokeWidth={1.7} />

          <p className="font-display text-5xl font-medium tracking-[-0.05em]">
            {workshop.pointCost === 0 ? "Gratis" : workshop.pointCost}
          </p>

          {workshop.pointCost > 0 && (
            <p className="mt-4 text-xl font-bold">POIN</p>
          )}
        </div>

        <p className="mt-4 text-[11px] opacity-70">Untuk satu peserta</p>
      </div>

      {isCheckingRegistration ? (
        <button
          type="button"
          disabled
          className="
      mt-7 flex w-full cursor-wait
      items-center justify-center gap-3
      rounded-sm bg-brand-forest/70
      px-6 py-4 text-xs font-bold
      text-canvas-pure
    "
        >
          <LoaderCircle className="size-4 animate-spin" />
          Memeriksa Pendaftaran...
        </button>
      ) : activeRegistration ? (
        <button
          type="button"
          disabled
          className="
      mt-7 flex w-full cursor-default
      items-center justify-center gap-3
      rounded-sm bg-brand-lime
      px-6 py-4 text-xs font-bold
      text-brand-forest
    "
        >
          <CheckCircle2 className="size-4" />
          Sudah Terdaftar
        </button>
      ) : workshop.isFull ? (
        <button
          type="button"
          disabled
          className="
      mt-7 flex w-full cursor-not-allowed
      items-center justify-center rounded-sm
      bg-muted-moss/25 px-6 py-4
      text-xs font-bold text-muted-moss
    "
        >
          Kuota Penuh
        </button>
      ) : (
        <button
          type="button"
          disabled={isSubmitting}
          onClick={handleRegister}
          className="
      group mt-7 flex w-full items-center
      justify-center gap-3 rounded-sm
      bg-brand-forest px-6 py-4
      text-xs font-bold text-canvas-pure
      transition duration-300
      hover:bg-brand-black
      disabled:cursor-not-allowed
      disabled:opacity-60
    "
        >
          {isSubmitting ? (
            <>
              <LoaderCircle className="size-4 animate-spin" />
              Memproses...
            </>
          ) : (
            <>
              Daftar Workshop
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      )}

      {feedback && (
        <div
          role={feedback.type === "error" ? "alert" : "status"}
          className={`
            mt-4 rounded-lg border px-4 py-3
            text-xs leading-5
            ${
              feedback.type === "success"
                ? "border-brand-emerald/20 bg-brand-lime/40 text-brand-forest"
                : "border-red-200 bg-red-50 text-red-700"
            }
          `}
        >
          <div className="flex items-start gap-2">
            {feedback.type === "success" && (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
            )}

            <p>{feedback.message}</p>
          </div>
        </div>
      )}

      {!feedback && activeRegistration && (
        <p className="mt-4 text-center text-[10px] leading-relaxed text-muted-moss">
          Pendaftaran tersimpan dan dapat dilihat kembali melalui dashboard.
        </p>
      )}

      {!feedback && !activeRegistration && !isCheckingRegistration && (
        <p className="mt-4 text-center text-[10px] leading-relaxed text-muted-moss">
          Masuk atau buat akun untuk melanjutkan pendaftaran.
        </p>
      )}
    </aside>
  );
}

function getBookingPercentage(workshop: WorkshopCatalogItem): number {
  if (workshop.quota <= 0) {
    return 100;
  }

  return Math.min(
    Math.max((workshop.registeredCount / workshop.quota) * 100, 0),
    100,
  );
}
