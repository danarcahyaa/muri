"use client";

import { useState, useEffect, type ReactElement } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TableActionButton } from "@/components/ui/TableActionButton";
import { Eye, Trash2, Users, ChevronLeft, ChevronRight } from "lucide-react";
import type { BrandWorkshopItem } from "@/types/brandWorkshop";
import { Button } from "@/components/ui/Button";

interface WorkshopTableProps {
  workshops: BrandWorkshopItem[];
  isLoading: boolean;
  onViewDetail?: (workshop: BrandWorkshopItem) => void;
  onDeleteClick?: (workshop: BrandWorkshopItem) => void;
}

export function WorkshopTable({
  workshops,
  isLoading,
  onViewDetail,
  onDeleteClick,
}: WorkshopTableProps): ReactElement {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Reset page when workshops list changes
  useEffect(() => {
    setCurrentPage(1);
  }, [workshops]);

  const totalPages = Math.ceil(workshops.length / itemsPerPage);
  const paginatedWorkshops = workshops.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const columnCount = 6;

  return (
    <div className="w-full bg-canvas-pure border border-line-trace rounded-xl overflow-hidden font-body">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-canvas-warm/50 border-b border-line-trace/60">
              <TableHead className="w-16 text-center px-4 py-3.5">No</TableHead>
              <TableHead className="px-4 py-3.5 min-w-[220px]">Judul Workshop</TableHead>
              <TableHead className="px-4 py-3.5 min-w-[160px]">Pembicara</TableHead>
              <TableHead className="px-4 py-3.5 min-w-[140px]">Kuota / Pendaftar</TableHead>
              <TableHead className="px-4 py-3.5 text-center min-w-[120px]">Status</TableHead>
              <TableHead className="w-24 text-right px-6 py-3.5">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-line-trace/40">
            {isLoading ? (
              <TableSkeleton columnsCount={columnCount} rowsCount={itemsPerPage} />
            ) : workshops.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columnCount}
                  className="text-center py-10 text-xs text-muted-moss"
                >
                  Belum ada workshop yang ditemukan cocok dengan kriteria pencarian.
                </TableCell>
              </TableRow>
            ) : (
              paginatedWorkshops.map((item, index) => (
                <TableRow
                  key={item.id}
                  className="hover:bg-canvas-warm/10 transition-colors"
                >
                  {/* Row Number */}
                  <TableCell className="w-16 text-center text-xs font-mono font-medium text-muted-moss px-4 py-3.5">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </TableCell>

                  {/* Title & Description */}
                  <TableCell className="px-4 py-3.5">
                    <div className="flex flex-col gap-0.5 max-w-[280px]">
                      <span className="font-semibold text-brand-black text-xs line-clamp-1">
                        {item.title}
                      </span>
                      <span className="text-[11px] text-muted-moss line-clamp-1">
                        {item.description || "Tanpa deskripsi"}
                      </span>
                    </div>
                  </TableCell>

                  {/* Speaker */}
                  <TableCell className="px-4 py-3.5">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-semibold text-brand-black">
                        {item.speakerName}
                      </span>
                      <span className="text-[11px] text-muted-moss">
                        {item.speakerRole}
                      </span>
                    </div>
                  </TableCell>

                  {/* Quota & Registered */}
                  <TableCell className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5 text-xs text-brand-black">
                      <Users className="size-3.5 text-brand-emerald shrink-0" />
                      <span className="font-medium">
                        {item.registeredCount} / {item.quota} peserta
                      </span>
                    </div>
                  </TableCell>

                  {/* Status (is_published) */}
                  <TableCell className="px-4 py-3.5 text-center">
                    <StatusBadge variant={item.isPublished ? "success" : "neutral"}>
                      {item.isPublished ? "Dipublikasi" : "Draft"}
                    </StatusBadge>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="w-24 text-right px-6 py-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      <TableActionButton
                        onClick={() => onViewDetail?.(item)}
                        aria-label="Lihat & Edit Detail Workshop"
                        title="Lihat & Edit Detail"
                      >
                        <Eye className="size-4" />
                      </TableActionButton>
                      <TableActionButton
                        variant="destructive"
                        onClick={() => onDeleteClick?.(item)}
                        aria-label="Hapus Workshop"
                        title="Hapus Workshop"
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

      {/* Pagination Footer */}
      {!isLoading && workshops.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-line-trace px-6 py-4 bg-canvas-warm/10">
          <div className="text-xs text-muted-moss">
            Menampilkan{" "}
            <span className="font-semibold text-brand-black">
              {(currentPage - 1) * itemsPerPage + 1}
            </span>{" "}
            -{" "}
            <span className="font-semibold text-brand-black">
              {Math.min(currentPage * itemsPerPage, workshops.length)}
            </span>{" "}
            dari{" "}
            <span className="font-semibold text-brand-black">
              {workshops.length}
            </span>{" "}
            workshop
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="inline-flex h-8 items-center justify-center rounded border border-line-trace bg-canvas-pure px-3 text-xs font-semibold text-brand-black hover:bg-canvas-warm disabled:opacity-50 disabled:hover:bg-canvas-pure transition-colors"
            >
              <ChevronLeft className="size-4 mr-1" />
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="inline-flex h-8 items-center justify-center rounded border border-line-trace bg-canvas-pure px-3 text-xs font-semibold text-brand-black hover:bg-canvas-warm disabled:opacity-50 disabled:hover:bg-canvas-pure transition-colors"
            >
              Selanjutnya
              <ChevronRight className="size-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
