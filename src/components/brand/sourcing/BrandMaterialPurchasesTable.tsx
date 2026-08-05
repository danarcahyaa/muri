"use client";

import type { ReactElement } from "react";
import Image from "next/image";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  CreditCard,
  Eye,
  Package,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { TableActionButton } from "@/components/ui/TableActionButton";
import { StatusBadge, type BadgeVariant } from "@/components/ui/StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { formatCurrencyIDR, formatWeightKg } from "@/lib/formatter";
import type { BrandWastePurchaseItem } from "@/services/sourcing.service";

interface BrandMaterialPurchasesTableProps {
  purchases: BrandWastePurchaseItem[];
  isLoading: boolean;
  searchQuery: string;
  onSelectOrder: (order: BrandWastePurchaseItem) => void;
}

export function BrandMaterialPurchasesTable({
  purchases,
  isLoading,
  searchQuery,
  onSelectOrder,
}: BrandMaterialPurchasesTableProps): ReactElement {
  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-brand-black/15 bg-canvas-pure">
      {!isLoading && purchases.length === 0 ? (
        <div className="flex min-h-[260px] flex-col items-center justify-center p-8 text-center space-y-3">
          <div className="size-12 rounded-full bg-canvas-warm flex items-center justify-center text-muted-moss">
            <CreditCard className="size-6" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-brand-black">
              Tidak Ada Pesanan Material
            </h3>
            <p className="mt-1 text-xs text-muted-moss max-w-md mx-auto">
              {searchQuery
                ? `Tidak ditemukan limbah kain dengan kata kunci "${searchQuery}". Coba kata kunci lain.`
                : "Belum ada pesanan aktif pada filter ini."}
            </p>
          </div>
        </div>
      ) : (
        <Table>
          <TableHeader className="bg-canvas-warm/60">
            <TableRow className="border-line-trace">
              <TableHead className="pl-6 sm:pl-8 text-xs font-semibold">PURCHASE ID / TANGGAL</TableHead>
              <TableHead className="text-xs font-semibold">NAMA LIMBAH MATERIAL</TableHead>
              <TableHead className="text-xs font-semibold">KUANTITAS (KG)</TableHead>
              <TableHead className="text-xs font-semibold">TOTAL HARGA</TableHead>
              <TableHead className="text-xs font-semibold">STATUS PESANAN</TableHead>
              <TableHead className="pr-6 text-right sm:pr-8 text-xs font-semibold">AKSI</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-line-trace">
            {isLoading ? (
              <TableSkeleton columnsCount={6} rowsCount={5} />
            ) : (
              purchases.map((purchase) => {
                const statusMeta = getStatusMeta(purchase.purchaseStatus);
                const thumbnail =
                  Array.isArray(purchase.mediaUrlsSnapshot) && purchase.mediaUrlsSnapshot[0]
                    ? typeof purchase.mediaUrlsSnapshot[0] === "string"
                      ? purchase.mediaUrlsSnapshot[0]
                      : purchase.mediaUrlsSnapshot[0].url
                    : null;

                return (
                  <TableRow
                    key={purchase.id}
                    className="border-line-trace transition-colors hover:bg-canvas-warm/40"
                  >
                    {/* Purchase ID & Tanggal Pesanan */}
                    <TableCell className="py-4 pl-6 sm:pl-8">
                      <span className="font-mono text-xs font-bold text-brand-black block">
                        {purchase.purchaseId}
                      </span>
                      <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-moss">
                        <CalendarDays className="size-3 shrink-0" />
                        {formatDate(purchase.createdAt)}
                      </p>
                    </TableCell>

                    {/* Nama Limbah & Thumbnail */}
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative size-10 rounded-md overflow-hidden bg-canvas-warm border border-brand-black/10 shrink-0">
                          {thumbnail ? (
                            <Image
                              src={thumbnail}
                              alt={purchase.fabricNameSnapshot}
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
                          <p className="text-xs font-bold text-brand-black truncate max-w-[220px]" title={purchase.fabricNameSnapshot}>
                            {purchase.fabricNameSnapshot}
                          </p>
                          <span className="text-[10px] font-semibold text-muted-moss block">
                            {purchase.categoryNameSnapshot}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Kuantitas (Kg) */}
                    <TableCell className="py-4 font-semibold text-xs text-brand-black">
                      {formatWeightKg(purchase.weightBoughtKg)}
                    </TableCell>

                    {/* Total Harga */}
                    <TableCell className="py-4">
                      <p className="font-bold text-xs text-brand-forest">
                        {formatCurrencyIDR(purchase.finalPriceIdr)}
                      </p>
                      <span className="text-[10px] text-muted-moss block">
                        @{formatCurrencyIDR(purchase.originalPricePerKg)}/Kg
                      </span>
                    </TableCell>

                    <TableCell className="py-4">
                      <StatusBadge variant={statusMeta.variant}>
                        <span className="inline-flex items-center gap-1">
                          <statusMeta.icon className="size-3" />
                          {statusMeta.label}
                        </span>
                      </StatusBadge>
                    </TableCell>

                    {/* Action: Standard TableActionButton */}
                    <TableCell className="py-4 pr-6 text-right sm:pr-8">
                      <TableActionButton
                        onClick={() => onSelectOrder(purchase)}
                        title="Lihat Detail Pesanan"
                        aria-label="Lihat Detail Pesanan"
                      >
                        <Eye className="size-4 text-brand-forest" />
                      </TableActionButton>
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

function getStatusMeta(status: string): { label: string; variant: BadgeVariant; icon: typeof CheckCircle2 } {
  switch (status) {
    case "completed":
    case "complete":
      return {
        label: "Selesai",
        variant: "success",
        icon: CheckCircle2,
      };
    case "shipped":
      return {
        label: "Dikirim",
        variant: "info",
        icon: Truck,
      };
    case "processing":
      return {
        label: "Diproses",
        variant: "warning",
        icon: Clock,
      };
    case "pending":
    default:
      return {
        label: "Menunggu Konfirmasi",
        variant: "neutral",
        icon: Clock,
      };
  }
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
