import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Coins,
  Leaf,
  MapPin,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  formatWorkshopDate,
  formatWorkshopTime,
} from "@/lib/workshop";
import type { WorkshopCatalogItem } from "@/types/workshop";

interface WorkshopBookingCardProps {
  workshop: WorkshopCatalogItem;
  loginHref: string;
}

export default function WorkshopBookingCard({
  workshop,
  loginHref,
}: WorkshopBookingCardProps) {
  const bookingPercentage = getBookingPercentage(workshop);

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
            style={{ width: `${bookingPercentage}%` }}
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

        <p className="mt-4 text-[11px] opacity-70">
          Untuk satu peserta
        </p>
      </div>

      {/* <div className="mt-6 divide-y divide-line-trace">
        <CheckoutFact
          icon={CalendarDays}
          label="Tanggal"
          value={formatWorkshopDate(workshop.heldAt)}
        />

        <CheckoutFact
          icon={Clock3}
          label="Waktu"
          value={formatWorkshopTime(workshop.heldAt)}
        />

        <CheckoutFact
          icon={MapPin}
          label="Lokasi"
          value={workshop.location}
        />
      </div> */}

      {workshop.isFull ? (
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
        <Link
          href={loginHref}
          className="
            group mt-7 flex w-full items-center
            justify-center gap-3 rounded-sm
            bg-brand-forest px-6 py-4
            text-xs font-bold text-canvas-pure
            transition duration-300 hover:bg-brand-black
          "
        >
          Daftar Workshop

          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      )}

      <p className="mt-4 text-center text-[10px] leading-relaxed text-muted-moss">
        Masuk atau buat akun untuk melanjutkan pendaftaran.
      </p>
    </aside>
  );
}

interface CheckoutFactProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

function CheckoutFact({
  icon: Icon,
  label,
  value,
}: CheckoutFactProps) {
  return (
    <div className="flex gap-4 py-4 first:pt-0 last:pb-0">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-canvas-warm text-brand-emerald">
        <Icon className="size-4" strokeWidth={1.8} />
      </div>

      <div className="min-w-0">
        <p className="text-[9px] uppercase tracking-wide text-muted-moss">
          {label}
        </p>

        <p className="mt-1 text-xs font-bold leading-5 text-brand-black">
          {value}
        </p>
      </div>
    </div>
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
