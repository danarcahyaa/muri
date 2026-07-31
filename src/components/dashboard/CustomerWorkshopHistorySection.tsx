"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Coins,
  Eye,
  MapPin,
  Presentation,
  RefreshCw,
  Search,
} from "lucide-react";
import { Table } from "@/components/ui/Table";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { WorkshopRegistrationStatus } from "@/enums/enums";
import { formatWorkshopDate, formatWorkshopTime } from "@/lib/workshop";
import { getMyWorkshopHistory } from "@/services/customer";
import type { CustomerWorkshopHistoryItem } from "@/types/customerWorkshop";
import CustomerWorkshopDetailModal from "./workshops/CustomerWorkshopDetailModal";

const PAGE_SIZE = 5;

type WorkshopStatusFilter = "all" | "registered" | "attended" | "cancelled";

const STATUS_TABS: Array<{ value: WorkshopStatusFilter; label: string }> = [
  { value: "all", label: "Semua" },
  { value: "registered", label: "Terdaftar" },
  { value: "attended", label: "Sudah Hadir" },
  { value: "cancelled", label: "Dibatalkan" },
];

export default function CustomerWorkshopHistorySection() {
  const [history, setHistory] = useState<CustomerWorkshopHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] =
    useState<CustomerWorkshopHistoryItem | null>(null);

  // Search, Filter & Pagination states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<WorkshopStatusFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);

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

  // Filter history by search query and status filter
  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const query = searchQuery.trim().toLowerCase();
      const workshop = item.workshop;

      const matchesSearch =
        !query ||
        (workshop &&
          (workshop.title.toLowerCase().includes(query) ||
            workshop.speakerName.toLowerCase().includes(query) ||
            workshop.location.toLowerCase().includes(query)));

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "registered" &&
          item.status === WorkshopRegistrationStatus.REGISTERED) ||
        (statusFilter === "attended" &&
          item.status === WorkshopRegistrationStatus.ATTENDED) ||
        (statusFilter === "cancelled" &&
          item.status === WorkshopRegistrationStatus.CANCELLED);

      return matchesSearch && matchesStatus;
    });
  }, [history, searchQuery, statusFilter]);

  // Reset page to 1 whenever search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredHistory.length / PAGE_SIZE));
  const paginatedHistory = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredHistory.slice(start, start + PAGE_SIZE);
  }, [currentPage, filteredHistory]);

  return (
    <section className="mt-8 overflow-hidden rounded-2xl border border-brand-black/15 bg-canvas-pure">
      {/* Section Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-line-trace px-6 py-5 sm:px-8">
        <div>
          <h2 className="font-display text-xl font-bold text-brand-black">
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
          {/* Toolbar: Search Bar & Status Filters */}
          <div className="flex flex-col gap-4 border-b border-line-trace bg-canvas-warm/40 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            {/* Search Input */}
            <div className="w-full max-w-sm">
              <Input
                type="text"
                placeholder="Cari judul, pemateri, atau lokasi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                endIcon={<Search className="size-4 text-muted-moss/60" strokeWidth={1.7} />}
                size="sm"
              />
            </div>

            {/* Status Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              {STATUS_TABS.map((tab) => {
                const active = statusFilter === tab.value;
                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setStatusFilter(tab.value)}
                    className={`rounded-sm px-3 py-1.5 text-xs font-bold transition ${
                      active
                        ? "bg-brand-forest text-white"
                        : "bg-canvas-pure border border-brand-black/15 text-brand-black hover:border-brand-forest"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Table View */}
          {filteredHistory.length === 0 ? (
            <div className="flex min-h-60 flex-col items-center justify-center px-6 py-12 text-center">
              <Search className="size-8 text-muted-moss/40" />
              <p className="mt-3 text-sm font-bold text-brand-black">
                Tidak ada workshop yang sesuai
              </p>
              <p className="mt-1 text-xs text-muted-moss">
                Coba sesuaikan kata kunci pencarian atau filter status Anda.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto muri-scrollbar w-full min-w-0">
                <Table className="min-w-[650px]">
                  <TableHeader className="bg-canvas-warm/60">
                    <TableRow className="border-line-trace">
                      <TableHead className="py-3.5 pl-6 text-xs font-bold uppercase tracking-wider text-muted-moss sm:pl-8">
                        Workshop & Pemateri
                      </TableHead>
                      <TableHead className="py-3.5 text-xs font-bold uppercase tracking-wider text-muted-moss">
                        Jadwal & Waktu
                      </TableHead>
                      <TableHead className="py-3.5 text-xs font-bold uppercase tracking-wider text-muted-moss">
                        Lokasi
                      </TableHead>
                      <TableHead className="py-3.5 text-xs font-bold uppercase tracking-wider text-muted-moss">
                        Biaya / Poin
                      </TableHead>
                      <TableHead className="py-3.5 text-xs font-bold uppercase tracking-wider text-muted-moss">
                        Status
                      </TableHead>
                      <TableHead className="py-3.5 pr-6 text-right text-xs font-bold uppercase tracking-wider text-muted-moss sm:pr-8">
                        Aksi
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody className="divide-y divide-line-trace">
                    {paginatedHistory.map((item) => {
                      const workshop = item.workshop;
                      const statusMeta = getStatusMeta(item.status);

                      return (
                        <TableRow
                          key={item.id}
                          className="border-line-trace transition-colors hover:bg-canvas-warm/40"
                        >
                          {/* Title & Speaker */}
                          <TableCell className="py-4 pl-6 sm:pl-8">
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
                          <TableCell className="py-4">
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
                          <TableCell className="py-4">
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
                          <TableCell className="py-4">
                            <div className="inline-flex items-center gap-1 text-xs font-bold text-brand-forest">
                              <Coins className="size-3.5" />
                              <span>
                                {item.pointsSpent === 0
                                  ? "Gratis"
                                  : `${item.pointsSpent} poin`}
                              </span>
                            </div>
                          </TableCell>

                          {/* Status */}
                          <TableCell className="py-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase ${statusMeta.className}`}
                            >
                              {statusMeta.label}
                            </span>
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="py-4 pr-6 text-right sm:pr-8">
                            <Button
                              variant="outline"
                              size="icon-sm"
                              onClick={() => setSelectedItem(item)}
                              title="Lihat Detail Workshop"
                            >
                              <Eye className="size-3.5 text-brand-emerald" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controls */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-line-trace bg-canvas-warm/30 px-6 py-4 sm:px-8">
                <p className="text-xs text-muted-moss">
                  Menampilkan{" "}
                  <span className="font-bold text-brand-black">
                    {Math.min(
                      (currentPage - 1) * PAGE_SIZE + 1,
                      filteredHistory.length,
                    )}
                  </span>
                  –
                  <span className="font-bold text-brand-black">
                    {Math.min(currentPage * PAGE_SIZE, filteredHistory.length)}
                  </span>{" "}
                  dari{" "}
                  <span className="font-bold text-brand-black">
                    {filteredHistory.length}
                  </span>{" "}
                  workshop
                </p>

                <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    className="inline-flex items-center gap-1 rounded-sm border border-brand-black/15 bg-canvas-pure px-3 py-1.5 text-xs font-bold text-brand-black transition hover:border-brand-forest disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft className="size-3.5" />
                    Sebelumnya
                  </button>

                  <span className="px-2 text-xs font-bold text-brand-black">
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    className="inline-flex items-center gap-1 rounded-sm border border-brand-black/15 bg-canvas-pure px-3 py-1.5 text-xs font-bold text-brand-black transition hover:border-brand-forest disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Berikutnya
                    <ChevronRight className="size-3.5" />
                  </button>
                </div>
              </div>
            </>
          )}

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
    <>
      <div className="flex flex-col gap-4 border-b border-line-trace bg-canvas-warm/40 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <Skeleton className="h-9 w-64 rounded-sm" />
        <div className="flex gap-2">
          <Skeleton className="h-7 w-16 rounded-sm" />
          <Skeleton className="h-7 w-20 rounded-sm" />
          <Skeleton className="h-7 w-16 rounded-sm" />
        </div>
      </div>

      <Table>
        <TableHeader className="bg-canvas-warm/60">
          <TableRow className="border-line-trace">
            <TableHead className="py-3.5 pl-6 text-xs font-bold uppercase tracking-wider text-muted-moss sm:pl-8">
              Workshop & Pemateri
            </TableHead>
            <TableHead className="py-3.5 text-xs font-bold uppercase tracking-wider text-muted-moss">
              Jadwal & Waktu
            </TableHead>
            <TableHead className="py-3.5 text-xs font-bold uppercase tracking-wider text-muted-moss">
              Lokasi
            </TableHead>
            <TableHead className="py-3.5 text-xs font-bold uppercase tracking-wider text-muted-moss">
              Biaya / Poin
            </TableHead>
            <TableHead className="py-3.5 text-xs font-bold uppercase tracking-wider text-muted-moss">
              Status
            </TableHead>
            <TableHead className="py-3.5 pr-6 text-right text-xs font-bold uppercase tracking-wider text-muted-moss sm:pr-8">
              Aksi
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-line-trace">
          <TableSkeleton columnsCount={6} rowsCount={5} />
        </TableBody>
      </Table>
    </>
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
        className="mt-6 rounded-sm bg-brand-forest px-5 py-3 text-xs font-bold text-white transition hover:bg-brand-black"
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
