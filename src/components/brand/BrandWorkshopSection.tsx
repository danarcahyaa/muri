"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Eye,
  Hammer,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TableActionButton } from "@/components/ui/TableActionButton";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { useBrandWorkshops } from "@/hooks/brand/useBrandWorkshops";
import type { BrandWorkshopItem } from "@/types/brandWorkshop";
import { WorkshopCreateDialog } from "@/components/brand/workshop/WorkshopCreateDialog";
import { WorkshopDetailDialog } from "@/components/brand/workshop/WorkshopDetailDialog";
import { WorkshopDeleteDialog } from "@/components/brand/workshop/WorkshopDeleteDialog";

type WorkshopFilterTab = "all" | "published" | "draft";

const ITEMS_PER_PAGE = 5;

export default function BrandWorkshopSection() {
  const {
    workshops,
    isLoading,
    error,
    refresh,
  } = useBrandWorkshops();

  const [activeTab, setActiveTab] = useState<WorkshopFilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedWorkshop, setSelectedWorkshop] =
    useState<BrandWorkshopItem | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState<boolean>(false);
  const [createDialogOpen, setCreateDialogOpen] = useState<boolean>(false);

  const [workshopToDelete, setWorkshopToDelete] =
    useState<BrandWorkshopItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab]);

  const filteredWorkshops = useMemo(() => {
    let result = workshops;

    if (activeTab === "published") {
      result = result.filter((w) => w.isPublished);
    } else if (activeTab === "draft") {
      result = result.filter((w) => !w.isPublished);
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (w) =>
          w.title.toLowerCase().includes(q) ||
          w.speakerName.toLowerCase().includes(q) ||
          (w.speakerRole ?? "").toLowerCase().includes(q) ||
          (w.location ?? "").toLowerCase().includes(q),
      );
    }

    return result;
  }, [workshops, activeTab, searchQuery]);

  const totalPages = Math.ceil(filteredWorkshops.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedWorkshops = useMemo(() => {
    return filteredWorkshops.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredWorkshops, startIndex]);

  const handleViewDetail = (workshop: BrandWorkshopItem) => {
    setSelectedWorkshop(workshop);
    setDetailDialogOpen(true);
  };

  const handleDeleteClick = (workshop: BrandWorkshopItem) => {
    setWorkshopToDelete(workshop);
    setDeleteDialogOpen(true);
  };

  return (
    <>
      <section className="mt-8 font-body">
        {/* Single Unified White Card Container */}
        <div className="rounded-2xl border border-brand-black/15 bg-canvas-pure p-6 sm:p-8">
          {/* Card Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-brand-black">
                Daftar Workshop Brand ({workshops.length})
              </h2>
              <p className="mt-1 text-xs text-muted-moss">
                Kelola workshop sirkular, narasumber, kuota pendaftaran, dan status publikasi.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => void refresh()}
                className="inline-flex items-center justify-center gap-2 rounded-sm border border-brand-black/15 bg-canvas-pure px-4 py-2 text-xs font-bold text-brand-black transition hover:border-brand-forest hover:bg-canvas-warm"
              >
                <RefreshCw className="size-3.5" />
                Muat Ulang
              </button>

              <button
                type="button"
                onClick={() => setCreateDialogOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-sm bg-brand-forest px-4 py-2 text-xs font-bold text-white transition hover:bg-brand-black"
              >
                <Plus className="size-4" />
                Buat Workshop Baru
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-sm border border-error-rust/30 bg-error-rust/10 p-4 text-xs font-medium text-error-rust">
              {error}
            </div>
          )}

          {/* Card Toolbar: Search Input on Left, Filter Tabs on Right */}
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full sm:w-80">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari judul, narasumber, lokasi..."
                endIcon={<Search className="size-4 text-muted-moss/60" strokeWidth={1.7} />}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <FilterTabButton
                label="Semua"
                active={activeTab === "all"}
                onClick={() => setActiveTab("all")}
              />
              <FilterTabButton
                label="Dipublikasi"
                active={activeTab === "published"}
                onClick={() => setActiveTab("published")}
              />
              <FilterTabButton
                label="Draft"
                active={activeTab === "draft"}
                onClick={() => setActiveTab("draft")}
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="mt-6 overflow-hidden rounded-xl border border-brand-black/15 bg-canvas-pure">
            {!isLoading && paginatedWorkshops.length === 0 ? (
              <div className="flex min-h-[260px] flex-col items-center justify-center p-6 text-center">
                <Hammer className="size-8 text-muted-moss/40" />
                <p className="mt-3 text-xs font-bold text-brand-black">Belum Ada Workshop</p>
                <p className="mt-1 text-[11px] text-muted-moss">
                  {searchQuery
                    ? "Tidak ada workshop yang sesuai dengan pencarian Anda."
                    : "Klik tombol Buat Workshop Baru untuk mendaftarkan agenda workshop sirkular."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto muri-scrollbar w-full min-w-0">
                <Table className="min-w-[650px]">
                  <TableHeader className="bg-canvas-warm/60">
                    <TableRow className="border-line-trace">
                      <TableHead className="w-14 pl-6 text-center sm:pl-8">NO</TableHead>
                      <TableHead>JUDUL WORKSHOP</TableHead>
                      <TableHead>PEMBICARA</TableHead>
                      <TableHead>KUOTA / PENDAFTAR</TableHead>
                      <TableHead>STATUS</TableHead>
                      <TableHead className="pr-6 text-right sm:pr-8">AKSI</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-line-trace">
                    {isLoading ? (
                      <TableSkeleton columnsCount={6} rowsCount={5} />
                    ) : (
                      paginatedWorkshops.map((item, index) => (
                        <TableRow
                          key={item.id}
                          className="border-line-trace transition-colors hover:bg-canvas-warm/40"
                        >
                          {/* No */}
                          <TableCell className="w-14 pl-6 text-center font-mono text-xs font-medium text-muted-moss sm:pl-8">
                            {startIndex + index + 1}
                          </TableCell>

                          {/* Title & Description */}
                          <TableCell className="py-4">
                            <div className="max-w-xs">
                              <p className="font-display text-xs font-bold text-brand-black line-clamp-1">
                                {item.title}
                              </p>
                              <p className="mt-0.5 text-[11px] text-muted-moss line-clamp-1">
                                {item.description || "Tanpa deskripsi"}
                              </p>
                            </div>
                          </TableCell>

                          {/* Speaker */}
                          <TableCell className="py-4">
                            <div>
                              <p className="text-xs font-bold text-brand-black">
                                {item.speakerName}
                              </p>
                              <p className="mt-0.5 text-[11px] text-muted-moss">
                                {item.speakerRole || "Pembicara"}
                              </p>
                            </div>
                          </TableCell>

                          {/* Quota */}
                          <TableCell className="py-4">
                            <div className="flex items-center gap-1.5 text-xs text-brand-black">
                              <Users className="size-3.5 text-brand-emerald shrink-0" />
                              <span className="font-bold">
                                {item.registeredCount} / {item.quota} peserta
                              </span>
                            </div>
                          </TableCell>

                          {/* Status */}
                          <TableCell className="py-4">
                            <StatusBadge variant={item.isPublished ? "success" : "neutral"}>
                              {item.isPublished ? "Dipublikasi" : "Draft"}
                            </StatusBadge>
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="py-4 pr-6 text-right sm:pr-8">
                            <div className="flex items-center justify-end gap-2">
                              <TableActionButton
                                onClick={() => handleViewDetail(item)}
                                title="Lihat & Edit Detail Workshop"
                                aria-label="Lihat & Edit Detail Workshop"
                              >
                                <Edit2 className="size-4 text-brand-emerald" />
                              </TableActionButton>

                              <TableActionButton
                                variant="destructive"
                                onClick={() => handleDeleteClick(item)}
                                title="Hapus Workshop"
                                aria-label="Hapus Workshop"
                              >
                                <Trash2 className="size-4" />
                              </TableActionButton>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Footer Pagination */}
          {!isLoading && !error && filteredWorkshops.length > 0 && (
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-moss">
                Menampilkan{" "}
                <span className="font-bold text-brand-black">
                  {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredWorkshops.length)}
                </span>{" "}
                dari{" "}
                <span className="font-bold text-brand-black">{filteredWorkshops.length}</span> workshop
              </p>

              <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  className="inline-flex items-center gap-1 rounded-sm border border-brand-black/15 bg-canvas-pure px-3 py-1.5 text-xs font-bold text-brand-black transition hover:border-brand-forest disabled:opacity-40"
                >
                  <ChevronLeft className="size-3.5" />
                  Sebelumnya
                </button>

                <span className="px-2 text-xs font-bold text-brand-black">
                  {currentPage}/{totalPages}
                </span>

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  className="inline-flex items-center gap-1 rounded-sm border border-brand-black/15 bg-canvas-pure px-3 py-1.5 text-xs font-bold text-brand-black transition hover:border-brand-forest disabled:opacity-40"
                >
                  Berikutnya
                  <ChevronRight className="size-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Detail / Edit Dialog */}
      <WorkshopDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        workshop={selectedWorkshop}
        onUpdated={refresh}
      />

      {/* Create Dialog */}
      <WorkshopCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreated={refresh}
      />

      {/* Delete Alert Dialog */}
      <WorkshopDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        workshop={workshopToDelete}
        onDeleted={refresh}
      />
    </>
  );
}

function FilterTabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        rounded-sm px-3.5 py-1.5 text-xs font-bold transition
        ${
          active
            ? "bg-brand-forest text-white"
            : "border border-brand-black/15 bg-canvas-pure text-brand-black hover:border-brand-forest hover:bg-canvas-warm"
        }
      `}
    >
      {label}
    </button>
  );
}
