"use client";

import type { ReactElement } from "react";
import Image from "next/image";
import {
  CalendarDays,
  Eye,
  Package,
  Trash2,
  Layers,
} from "lucide-react";

import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { TableActionButton } from "@/components/ui/TableActionButton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { formatCurrencyIDR, formatWeightKg } from "@/lib/formatter";
import type { PurchasedInventoryItem } from "@/services/brand-fashion/purchasedInventoryService";

interface PurchasedMaterialTableProps {
  items: PurchasedInventoryItem[];
  isLoading: boolean;
  searchQuery: string;
  onOpenDetail: (item: PurchasedInventoryItem) => void;
  onOpenDelete: (item: PurchasedInventoryItem) => void;
}

export function PurchasedMaterialTable({
  items,
  isLoading,
  searchQuery,
  onOpenDetail,
  onOpenDelete,
}: PurchasedMaterialTableProps): ReactElement {
  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-brand-black/15 bg-canvas-pure">
      {!isLoading && items.length === 0 ? (
        <div className="flex min-h-[260px] flex-col items-center justify-center p-8 text-center space-y-3">
          <div className="size-12 rounded-full bg-canvas-warm flex items-center justify-center text-muted-moss">
            <Layers className="size-6 text-brand-emerald" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-brand-black">
              Tidak Ada Material Limbah Terbeli
            </h3>
            <p className="mt-1 text-xs text-muted-moss max-w-md mx-auto">
              {searchQuery
                ? `Tidak ditemukan limbah kain dengan kata kunci "${searchQuery}". Coba kata kunci lain.`
                : "Belum ada material limbah terbeli yang terdaftar pada inventaris Anda."}
            </p>
          </div>
        </div>
      ) : (
        <Table>
          <TableHeader className="bg-canvas-warm/60">
            <TableRow className="border-line-trace">
              <TableHead className="pl-6 sm:pl-8 text-xs font-semibold">PURCHASE ID / TANGGAL</TableHead>
              <TableHead className="text-xs font-semibold">NAMA LIMBAH MATERIAL</TableHead>
              <TableHead className="text-xs font-semibold">JENIS SERAT KAIN</TableHead>
              <TableHead className="text-xs font-semibold">SISA STOK (KG)</TableHead>
              <TableHead className="text-xs font-semibold">TOTAL HARGA</TableHead>
              <TableHead className="pr-6 text-right sm:pr-8 text-xs font-semibold">AKSI</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-line-trace">
            {isLoading ? (
              <TableSkeleton columnsCount={6} rowsCount={5} />
            ) : (
              items.map((item) => {
                const canDelete = item.weightBoughtKg <= 0;

                return (
                  <TableRow
                    key={item.id}
                    className="border-line-trace transition-colors hover:bg-canvas-warm/40"
                  >
                    {/* 1. Purchase ID & Tanggal Pembelian Selesai */}
                    <TableCell className="py-4 pl-6 sm:pl-8">
                      <span className="font-mono text-xs font-bold text-brand-black block">
                        {item.purchaseId}
                      </span>
                      <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-moss">
                        <CalendarDays className="size-3 shrink-0" />
                        {formatDate(item.completedAt)}
                      </p>
                    </TableCell>

                    {/* 2. Nama Limbah Material & Thumbnail */}
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative size-10 rounded-md overflow-hidden bg-canvas-warm border border-brand-black/10 shrink-0">
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt={item.fabricName}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="size-full flex items-center justify-center text-muted-moss">
                              <Package className="size-5" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-brand-black truncate max-w-[220px]" title={item.fabricName}>
                            {item.fabricName}
                          </p>
                          <span className="text-[10px] font-semibold text-muted-moss block">
                            {item.categoryName}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* 3. Jenis Serat Kain */}
                    <TableCell className="py-4 text-xs font-medium text-muted-moss">
                      {item.categoryName}
                    </TableCell>

                    {/* 4. Sisa Stok (Kg) */}
                    <TableCell className="py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          canDelete
                            ? "bg-error-rust/10 text-error-rust border border-error-rust/20"
                            : "bg-brand-forest/10 text-brand-forest border border-brand-forest/20"
                        }`}
                      >
                        {formatWeightKg(item.weightBoughtKg)}
                      </span>
                    </TableCell>

                    {/* 5. Total Harga */}
                    <TableCell className="py-4">
                      <p className="font-bold text-xs text-brand-forest">
                        {formatCurrencyIDR(item.finalPriceIdr)}
                      </p>
                      <span className="text-[10px] text-muted-moss block">
                        @{formatCurrencyIDR(item.originalPricePerKg)}/Kg
                      </span>
                    </TableCell>

                    {/* 6. Action Column: Icon-only buttons with Waste Provider Tooltips (NO TEXT) */}
                    <TableCell className="py-4 pr-6 text-right sm:pr-8">
                      <TooltipProvider>
                        <div className="flex items-center justify-end gap-2">
                          {/* Tombol Detail (Icon-only) */}
                          <Tooltip>
                            <TooltipTrigger
                              render={
                                <TableActionButton
                                  onClick={() => onOpenDetail(item)}
                                  aria-label="Lihat Detail Material"
                                >
                                  <Eye className="size-4 text-brand-forest" />
                                </TableActionButton>
                              }
                            />
                            <TooltipContent side="top">
                              Lihat Detail Material
                            </TooltipContent>
                          </Tooltip>

                          {/* Tombol Delete (Icon-only) */}
                          <Tooltip>
                            <TooltipTrigger
                              render={
                                <TableActionButton
                                  variant="destructive"
                                  disabled={!canDelete}
                                  onClick={() => canDelete && onOpenDelete(item)}
                                  aria-label={
                                    !canDelete
                                      ? "Material hanya dapat dihapus jika sisa stok sudah 0 kg"
                                      : "Hapus Material"
                                  }
                                >
                                  <Trash2 className="size-4" />
                                </TableActionButton>
                              }
                            />
                            <TooltipContent side="top">
                              {!canDelete
                                ? "Material hanya dapat dihapus jika sisa stok sudah habis"
                                : "Hapus Material"}
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

function formatDate(value: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
