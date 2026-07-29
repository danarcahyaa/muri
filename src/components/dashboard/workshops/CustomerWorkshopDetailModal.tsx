"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Coins,
  MapPin,
  Presentation,
  User,
  X,
} from "lucide-react";
import { WorkshopRegistrationStatus } from "@/enums/enums";
import { formatWorkshopDate, formatWorkshopTime } from "@/lib/workshop";
import type { CustomerWorkshopHistoryItem } from "@/types/customerWorkshop";

interface CustomerWorkshopDetailModalProps {
  item: CustomerWorkshopHistoryItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CustomerWorkshopDetailModal({
  item,
  isOpen,
  onClose,
}: CustomerWorkshopDetailModalProps) {
  if (!isOpen || !item) {
    return null;
  }

  const workshop = item.workshop;
  const statusMeta = getStatusMeta(item.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in-0">
      <div className="relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-line-trace bg-canvas-pure">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line-trace px-6 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-brand-lime/50 text-brand-forest">
              <Presentation className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-lg font-bold text-brand-black">
                  Detail Workshop
                </span>
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-bold uppercase ${statusMeta.className}`}
                >
                  {statusMeta.label}
                </span>
              </div>
              <p className="text-xs text-muted-moss">
                Terdaftar pada {formatRegistrationDate(item.createdAt)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal"
            className="flex size-9 items-center justify-center rounded-full bg-canvas-warm text-brand-black transition hover:bg-line-trace"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-6 overflow-y-auto p-6 sm:p-8">
          {/* Workshop Main Info */}
          {workshop ? (
            <>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-emerald">
                  Workshop Edukasi
                </span>
                <h3 className="mt-1 font-display text-2xl font-medium tracking-tight text-brand-black">
                  {workshop.title}
                </h3>
              </div>

              {/* Speaker Card */}
              <div className="flex items-center gap-3 rounded-xl border border-line-trace bg-canvas-warm/40 p-4">
                <div className="flex size-10 items-center justify-center rounded-full bg-brand-emerald/10 text-brand-emerald">
                  <User className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-brand-black">
                    {workshop.speakerName}
                  </p>
                  <p className="text-[11px] text-muted-moss">
                    {workshop.speakerRole}
                  </p>
                </div>
              </div>

              {/* Schedule & Location */}
              <div className="grid gap-3 sm:grid-cols-2">
                <DetailFactCard
                  icon={CalendarDays}
                  label="Tanggal Pelaksanaan"
                  value={formatWorkshopDate(workshop.heldAt)}
                />
                <DetailFactCard
                  icon={Clock3}
                  label="Waktu Pelaksanaan"
                  value={formatWorkshopTime(workshop.heldAt)}
                />
                <div className="sm:col-span-2">
                  <DetailFactCard
                    icon={MapPin}
                    label="Lokasi / Venue"
                    value={workshop.location}
                  />
                </div>
              </div>

              {/* Fee / Points */}
              <div className="flex items-center justify-between rounded-xl border border-line-trace bg-canvas-warm/40 p-4 text-xs">
                <div className="flex items-center gap-2 text-muted-moss">
                  <Coins className="size-4 text-brand-emerald" />
                  <span>Biaya / Poin Digunakan</span>
                </div>
                <span className="font-display text-sm font-bold text-brand-forest">
                  {item.pointsSpent === 0 ? "Gratis" : `${item.pointsSpent} poin`}
                </span>
              </div>
            </>
          ) : (
            <div className="rounded-xl bg-canvas-warm p-6 text-center text-xs text-muted-moss">
              Detail workshop tidak tersedia atau sudah dihapus.
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-line-trace bg-canvas-warm px-6 py-4 sm:px-8">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-line-trace bg-canvas-pure px-4 py-2.5 text-xs font-bold text-brand-black transition hover:border-brand-forest"
          >
            Tutup
          </button>

          {workshop && (
            <Link
              href={`/edukasi/workshop/${workshop.id}`}
              className="inline-flex items-center gap-2 rounded-md bg-brand-forest px-4 py-2.5 text-xs font-bold text-white transition hover:bg-brand-black"
            >
              Buka Halaman Workshop
              <ArrowRight className="size-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailFactCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-line-trace bg-canvas-warm/40 p-4">
      <div className="flex items-center gap-1.5 text-muted-moss">
        <Icon className="size-3.5 shrink-0" />
        <span className="text-[9px] uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-1.5 text-xs font-bold text-brand-black">{value}</p>
    </div>
  );
}

function getStatusMeta(status: WorkshopRegistrationStatus) {
  switch (status) {
    case WorkshopRegistrationStatus.ATTENDED:
      return {
        label: "Sudah Hadir",
        className: "bg-brand-lime/50 text-brand-forest",
      };
    case WorkshopRegistrationStatus.CANCELLED:
      return {
        label: "Dibatalkan",
        className: "bg-red-50 text-red-700",
      };
    case WorkshopRegistrationStatus.REGISTERED:
    default:
      return {
        label: "Terdaftar",
        className: "bg-brand-emerald/10 text-brand-emerald",
      };
  }
}

function formatRegistrationDate(value: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
