"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Coins,
  MapPin,
  Presentation,
  RefreshCw,
} from "lucide-react";

import { WorkshopRegistrationStatus } from "@/enums/enum";
import {
  formatWorkshopDate,
  formatWorkshopTime,
} from "@/lib/workshop";
import { getMyWorkshopHistory } from "@/services/customer";
import type {
  CustomerWorkshopHistoryItem,
} from "@/types/customerWorkshop";

export default function CustomerWorkshopHistorySection() {
  const [history, setHistory] = useState<
    CustomerWorkshopHistoryItem[]
  >([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result =
        await getMyWorkshopHistory();

      if (!result.success) {
        setHistory([]);
        setErrorMessage(
          "Riwayat workshop belum dapat dimuat.",
        );

        return;
      }

      setHistory(result.data ?? []);
    } catch {
      setHistory([]);
      setErrorMessage(
        "Terjadi kesalahan saat memuat riwayat workshop.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  return (
    <section className="mt-6 overflow-hidden rounded-3xl border border-line-trace bg-canvas-pure">
      <div
        className="
          flex flex-col gap-5
          border-b border-line-trace
          px-6 py-6
          sm:flex-row sm:items-center
          sm:justify-between sm:px-8
        "
      >
        <div>
          <h2 className="font-display text-2xl font-medium tracking-tight text-brand-black">
            Workshop Saya
          </h2>

          <p className="mt-2 text-xs text-muted-moss">
            Riwayat pendaftaran dan workshop
            yang Anda ikuti.
          </p>
        </div>

        <Link
          href="/edukasi"
          className="
            group inline-flex w-fit
            items-center gap-2
            text-xs font-bold
            text-brand-emerald
            transition-colors
            hover:text-brand-forest
          "
        >
          Cari Workshop

          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {isLoading ? (
        <WorkshopHistorySkeleton />
      ) : errorMessage ? (
        <WorkshopHistoryError
          message={errorMessage}
          onRetry={loadHistory}
        />
      ) : history.length === 0 ? (
        <EmptyWorkshopHistory />
      ) : (
        <div className="grid gap-4 p-5 sm:p-6 xl:grid-cols-2">
          {history.map((item) => (
            <WorkshopHistoryCard
              key={item.id}
              item={item}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function WorkshopHistoryCard({
  item,
}: {
  item: CustomerWorkshopHistoryItem;
}) {
  const workshop = item.workshop;
  const status = getStatusMeta(item.status);

  if (!workshop) {
    return (
      <article className="rounded-2xl border border-line-trace bg-canvas-warm/40 p-6">
        <StatusBadge
          label={status.label}
          className={status.className}
        />

        <h3 className="mt-5 font-display text-xl font-medium text-brand-black">
          Workshop tidak tersedia
        </h3>

        <p className="mt-2 text-xs leading-5 text-muted-moss">
          Detail workshop ini sudah tidak dapat
          diakses, tetapi riwayat pendaftaran
          Anda tetap tersimpan.
        </p>
      </article>
    );
  }

  return (
    <article
      className="
        flex flex-col rounded-2xl
        border border-line-trace
        bg-canvas-pure p-5
        transition
        hover:border-brand-emerald
        hover:shadow-lg
        hover:shadow-brand-black/5
        sm:p-6
      "
    >
      <div className="flex items-start justify-between gap-4">
        <StatusBadge
          label={status.label}
          className={status.className}
        />

        <div className="inline-flex items-center gap-2 text-xs font-bold text-brand-forest">
          <Coins className="size-4" />

          {item.pointsSpent === 0
            ? "Gratis"
            : `${item.pointsSpent} poin`}
        </div>
      </div>

      <div className="mt-6">
        <div
          className="
            flex size-11 items-center
            justify-center rounded-xl
            bg-brand-lime/50
            text-brand-forest
          "
        >
          <Presentation
            className="size-5"
            strokeWidth={1.8}
          />
        </div>

        <h3 className="mt-5 font-display text-2xl font-medium leading-tight tracking-[-0.035em] text-brand-black">
          {workshop.title}
        </h3>

        <p className="mt-2 text-xs font-bold text-brand-emerald">
          {workshop.speakerName}
        </p>

        <p className="mt-1 text-xs text-muted-moss">
          {workshop.speakerRole}
        </p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <HistoryFact
          icon={CalendarDays}
          label="Tanggal"
          value={formatWorkshopDate(
            workshop.heldAt,
          )}
        />

        <HistoryFact
          icon={Clock3}
          label="Waktu"
          value={formatWorkshopTime(
            workshop.heldAt,
          )}
        />

        <div className="sm:col-span-2">
          <HistoryFact
            icon={MapPin}
            label="Lokasi"
            value={workshop.location}
          />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 border-t border-line-trace pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[10px] text-muted-moss">
          Terdaftar{" "}
          {formatRegistrationDate(
            item.createdAt,
          )}
        </p>

        <Link
          href={`/edukasi/workshop/${workshop.id}`}
          className="
            group inline-flex items-center
            gap-2 text-xs font-bold
            text-brand-emerald
            transition-colors
            hover:text-brand-forest
          "
        >
          Lihat Detail

          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}

function HistoryFact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-canvas-warm px-4 py-4">
      <div className="flex items-center gap-2 text-muted-moss">
        <Icon
          className="size-4 shrink-0"
          strokeWidth={1.8}
        />

        <span className="text-[9px] uppercase tracking-wide">
          {label}
        </span>
      </div>

      <p className="mt-2 text-xs font-bold leading-5 text-brand-black">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  return (
    <span
      className={`
        inline-flex rounded-full
        px-3 py-2
        text-[10px] font-bold
        uppercase
        ${className}
      `}
    >
      {label}
    </span>
  );
}

function getStatusMeta(
  status: WorkshopRegistrationStatus,
) {
  switch (status) {
    case WorkshopRegistrationStatus.ATTENDED:
      return {
        label: "Sudah Hadir",
        className:
          "bg-brand-lime/50 text-brand-forest",
      };

    case WorkshopRegistrationStatus.CANCELLED:
      return {
        label: "Dibatalkan",
        className:
          "bg-red-50 text-red-700",
      };

    case WorkshopRegistrationStatus.REGISTERED:
    default:
      return {
        label: "Terdaftar",
        className:
          "bg-brand-emerald/10 text-brand-emerald",
      };
  }
}

function WorkshopHistorySkeleton() {
  return (
    <div className="grid gap-4 p-5 sm:p-6 xl:grid-cols-2">
      {[0, 1].map((item) => (
        <div
          key={item}
          className="min-h-80 animate-pulse rounded-2xl bg-canvas-warm"
        />
      ))}
    </div>
  );
}

function WorkshopHistoryError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => Promise<void>;
}) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
      <RefreshCw
        className="size-9 text-muted-moss/50"
        strokeWidth={1.5}
      />

      <h3 className="mt-5 font-display text-xl font-medium text-brand-black">
        Riwayat gagal dimuat
      </h3>

      <p className="mt-2 text-xs text-muted-moss">
        {message}
      </p>

      <button
        type="button"
        onClick={() => {
          void onRetry();
        }}
        className="
          mt-6 rounded-md
          bg-brand-forest
          px-5 py-3
          text-xs font-bold
          text-white
          transition
          hover:bg-brand-black
        "
      >
        Coba Lagi
      </button>
    </div>
  );
}

function EmptyWorkshopHistory() {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
      <Presentation
        className="size-10 text-muted-moss/40"
        strokeWidth={1.4}
      />

      <h3 className="mt-5 font-display text-xl font-medium text-brand-black">
        Belum ada workshop
      </h3>

      <p className="mt-2 max-w-sm text-xs leading-5 text-muted-moss">
        Workshop yang Anda daftarkan akan muncul
        di bagian ini.
      </p>

      <Link
        href="/edukasi"
        className="
          mt-6 inline-flex items-center gap-2
          rounded-md bg-brand-forest
          px-5 py-3
          text-xs font-bold text-white
          transition hover:bg-brand-black
        "
      >
        Lihat Workshop
        <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}

function formatRegistrationDate(
  value: string | null,
): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}