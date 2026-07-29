"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Coins,
  Eye,
  MapPin,
  Presentation,
  RefreshCw,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { WorkshopRegistrationStatus } from "@/enums/enums";
import { formatWorkshopDate, formatWorkshopTime } from "@/lib/workshop";
import { getMyWorkshopHistory } from "@/services/customer";
import type { CustomerWorkshopHistoryItem } from "@/types/customerWorkshop";
import CustomerWorkshopDetailModal from "./workshops/CustomerWorkshopDetailModal";

export default function CustomerWorkshopHistorySection() {
  const [history, setHistory] = useState<CustomerWorkshopHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] =
    useState<CustomerWorkshopHistoryItem | null>(null);

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await getMyWorkshopHistory();

      if (!result.success) {
        setHistory([]);
        setErrorMessage("Riwayat workshop belum dapat dimuat.");
        return;
      }

      setHistory(result.data ?? []);
    } catch {
      setHistory([]);
      setErrorMessage("Terjadi kesalahan saat memuat riwayat workshop.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  return (
    <section className="mt-8 overflow-hidden rounded-3xl border border-line-trace bg-canvas-pure">
      <div className="flex items-center justify-between border-b border-line-trace px-6 py-5 sm:px-8">
        <div>
          <h2 className="font-display text-xl font-medium text-brand-black">
            Riwayat Workshop ({history.length})
          </h2>
          <p className="mt-1 text-xs text-muted-moss">
            Pendaftaran aktif dan workshop yang pernah Anda ikuti.
          </p>
        </div>

        <Link
          href="/edukasi"
          className="group inline-flex items-center gap-1.5 text-xs font-bold text-brand-emerald transition-colors hover:text-brand-forest"
        >
          Cari Workshop
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {isLoading ? (
        <WorkshopHistorySkeleton />
      ) : errorMessage ? (
        <WorkshopHistoryError message={errorMessage} onRetry={loadHistory} />
      ) : history.length === 0 ? (
        <EmptyWorkshopHistory />
      ) : (
        <>
          <Table>
            <TableHeader className="bg-canvas-warm/60">
              <TableRow className="border-line-trace">
                <TableHead className="py-4 pl-6 text-xs font-bold uppercase tracking-wider text-muted-moss sm:pl-8">
                  Workshop & Pemateri
                </TableHead>
                <TableHead className="py-4 text-xs font-bold uppercase tracking-wider text-muted-moss">
                  Jadwal & Waktu
                </TableHead>
                <TableHead className="py-4 text-xs font-bold uppercase tracking-wider text-muted-moss">
                  Lokasi
                </TableHead>
                <TableHead className="py-4 text-xs font-bold uppercase tracking-wider text-muted-moss">
                  Biaya / Poin
                </TableHead>
                <TableHead className="py-4 text-xs font-bold uppercase tracking-wider text-muted-moss">
                  Status
                </TableHead>
                <TableHead className="py-4 pr-6 text-right text-xs font-bold uppercase tracking-wider text-muted-moss sm:pr-8">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-line-trace">
              {history.map((item) => {
                const workshop = item.workshop;
                const statusMeta = getStatusMeta(item.status);

                return (
                  <TableRow
                    key={item.id}
                    className="border-line-trace transition-colors hover:bg-canvas-warm/40"
                  >
                    {/* Title & Speaker */}
                    <TableCell className="py-5 pl-6 sm:pl-8">
                      {workshop ? (
                        <div>
                          <p className="font-display text-sm font-bold text-brand-black line-clamp-1">
                            {workshop.title}
                          </p>
                          <p className="mt-1 text-xs font-semibold text-brand-emerald">
                            {workshop.speakerName}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-moss">
                          Workshop tidak tersedia
                        </span>
                      )}
                    </TableCell>

                    {/* Schedule */}
                    <TableCell className="py-5">
                      {workshop ? (
                        <div>
                          <div className="flex items-center gap-1.5 text-xs text-brand-black">
                            <CalendarDays className="size-3.5 shrink-0 text-muted-moss" />
                            <span>{formatWorkshopDate(workshop.heldAt)}</span>
                          </div>
                          <p className="mt-1 text-[11px] text-muted-moss">
                            {formatWorkshopTime(workshop.heldAt)}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-moss">-</span>
                      )}
                    </TableCell>

                    {/* Location */}
                    <TableCell className="py-5">
                      {workshop ? (
                        <div className="flex items-center gap-1.5 max-w-[200px]">
                          <MapPin className="size-3.5 shrink-0 text-muted-moss" />
                          <span className="text-xs text-brand-black truncate">
                            {workshop.location}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-moss">-</span>
                      )}
                    </TableCell>

                    {/* Points Spent */}
                    <TableCell className="py-5">
                      <div className="inline-flex items-center gap-1 text-xs font-bold text-brand-forest">
                        <Coins className="size-3.5" />
                        <span>
                          {item.pointsSpent === 0 ? "Gratis" : `${item.pointsSpent} poin`}
                        </span>
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="py-5">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase ${statusMeta.className}`}
                      >
                        {statusMeta.label}
                      </span>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="py-5 pr-6 text-right sm:pr-8">
                      <button
                        type="button"
                        onClick={() => setSelectedItem(item)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-line-trace bg-canvas-pure px-3 py-2 text-xs font-bold text-brand-black transition hover:border-brand-forest hover:bg-canvas-warm"
                      >
                        <Eye className="size-3.5 text-brand-emerald" />
                        Detail
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Detail Modal */}
          <CustomerWorkshopDetailModal
            item={selectedItem}
            isOpen={Boolean(selectedItem)}
            onClose={() => setSelectedItem(null)}
          />
        </>
      )}
    </section>
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

function WorkshopHistorySkeleton() {
  return (
    <div className="p-6 space-y-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-14 animate-pulse rounded-xl bg-canvas-warm" />
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
      <RefreshCw className="size-9 text-muted-moss/50" />
      <h3 className="mt-5 font-display text-xl font-medium text-brand-black">
        Riwayat gagal dimuat
      </h3>
      <p className="mt-2 text-xs text-muted-moss">{message}</p>
      <button
        type="button"
        onClick={() => void onRetry()}
        className="mt-6 rounded-md bg-brand-forest px-5 py-3 text-xs font-bold text-white transition hover:bg-brand-black"
      >
        Coba Lagi
      </button>
    </div>
  );
}

function EmptyWorkshopHistory() {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
      <Presentation className="size-10 text-muted-moss/40" />
      <h3 className="mt-5 font-display text-xl font-medium text-brand-black">
        Belum ada workshop
      </h3>
      <p className="mt-2 max-w-sm text-xs leading-5 text-muted-moss">
        Workshop yang Anda daftarkan akan muncul di bagian ini.
      </p>
    </div>
  );
}
