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
import { Button } from "@/components/ui/Button";
import { StatusBadge, type BadgeVariant } from "@/components/ui/StatusBadge";

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in-0 cursor-pointer"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-xl border border-line-trace bg-canvas-pure cursor-default">
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
                <StatusBadge variant={statusMeta.variant}>
                  {statusMeta.label}
                </StatusBadge>
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
            className="flex size-8 items-center justify-center rounded-full bg-canvas-warm text-brand-black transition hover:bg-line-trace cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-4 overflow-y-auto p-6 sm:p-8">
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
              <div className="flex items-center gap-3 rounded-lg border border-line-trace bg-canvas-warm/50 p-4">
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
              <div className="grid gap-3.5 sm:grid-cols-2">
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
              <div className="flex items-center justify-between rounded-lg border border-line-trace bg-canvas-warm/50 p-4 text-xs">
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
            <div className="rounded-lg bg-canvas-warm p-6 text-center text-xs text-muted-moss">
              Detail workshop tidak tersedia atau sudah dihapus.
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-line-trace bg-canvas-warm/55 px-6 py-4 sm:px-8">
          <Button
            variant="outline"
            size="md"
            onClick={onClose}
          >
            Tutup
          </Button>

          {workshop && (
            <Button
              variant="default"
              size="md"
              render={
                <Link href={`/edukasi/workshop/${workshop.id}`}>
                  Buka Halaman Workshop
                  <ArrowRight className="size-4" />
                </Link>
              }
            />
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
    <div className="rounded-lg border border-line-trace bg-canvas-warm/50 p-4">
      <div className="flex items-center gap-1.5 text-muted-moss">
        <Icon className="size-3.5 shrink-0" />
        <span className="text-[9px] uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-1.5 text-xs font-bold text-brand-black">{value}</p>
    </div>
  );
}

function getStatusMeta(status: WorkshopRegistrationStatus): { label: string; variant: BadgeVariant } {
  switch (status) {
    case WorkshopRegistrationStatus.ATTENDED:
      return {
        label: "Sudah Hadir",
        variant: "success",
      };
    case WorkshopRegistrationStatus.CANCELLED:
      return {
        label: "Dibatalkan",
        variant: "danger",
      };
    case WorkshopRegistrationStatus.REGISTERED:
    default:
      return {
        label: "Terdaftar",
        variant: "info",
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
