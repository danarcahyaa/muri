"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Eye,
  Factory,
  Package,
  QrCode,
  RefreshCw,
  Search,
  Truck,
} from "lucide-react";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { formatIdr } from "@/lib/productDetail";
import { getBrandMaterialOrders } from "@/services/material";
import type { MaterialOrder, MaterialOrderStatus } from "@/types/materialOrder";
import MaterialPurchaseDetailModal from "./MaterialPurchaseDetailModal";

type FilterTab = "all" | "processing" | "shipped" | "completed";

const ITEMS_PER_PAGE = 5;

export default function BrandMaterialPurchasesSection() {
  const [orders, setOrders] = useState<MaterialOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<MaterialOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getBrandMaterialOrders();
      if (res.success && res.data) {
        setOrders(res.data);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab]);

  const filteredOrders = useMemo(() => {
    let result = orders;

    if (activeTab !== "all") {
      result = result.filter((o) => o.status === activeTab);
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (o) =>
          o.orderCode.toLowerCase().includes(q) ||
          o.batchTitle.toLowerCase().includes(q) ||
          o.providerName.toLowerCase().includes(q) ||
          (o.trackingNumber ?? "").toLowerCase().includes(q),
      );
    }

    return result;
  }, [orders, activeTab, searchQuery]);

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedOrders = useMemo(() => {
    return filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredOrders, startIndex]);

  return (
    <section className="mt-8 font-body">
      <div className="rounded-2xl border border-brand-black/15 bg-canvas-pure p-6 sm:p-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-brand-black">
              Riwayat Pembelian Material ({orders.length})
            </h2>
            <p className="mt-1 text-xs text-muted-moss">
              Pantau transaksi pembelian limbah kain dari Waste Provider, nomor resi, dan status pengiriman.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadOrders()}
            className="inline-flex items-center justify-center gap-2 rounded-sm border border-brand-black/15 bg-canvas-pure px-4 py-2 text-xs font-bold text-brand-black transition hover:border-brand-forest hover:bg-canvas-warm"
          >
            <RefreshCw className="size-3.5" />
            Muat Ulang
          </button>
        </div>

        {/* Toolbar */}
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:w-80">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kode pesanan, batch, provider..."
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
              label="Diproses"
              active={activeTab === "processing"}
              onClick={() => setActiveTab("processing")}
            />
            <FilterTabButton
              label="Dikirim"
              active={activeTab === "shipped"}
              onClick={() => setActiveTab("shipped")}
            />
            <FilterTabButton
              label="Selesai"
              active={activeTab === "completed"}
              onClick={() => setActiveTab("completed")}
            />
          </div>
        </div>

        {/* Table Container */}
        <div className="mt-6 overflow-hidden rounded-xl border border-brand-black/15 bg-canvas-pure">
          {!isLoading && paginatedOrders.length === 0 ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center p-6 text-center">
              <CreditCard className="size-8 text-muted-moss/40" />
              <p className="mt-3 text-xs font-bold text-brand-black">Belum Ada Transaksi Material</p>
              <p className="mt-1 text-[11px] text-muted-moss">
                {searchQuery
                  ? "Tidak ada pesanan yang sesuai dengan kata kunci Anda."
                  : "Anda belum pernah melakukan transaksi pembelian limbah kain dari Waste Provider."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-canvas-warm/60">
                <TableRow className="border-line-trace">
                  <TableHead className="pl-6 sm:pl-8">KODE & TANGGAL</TableHead>
                  <TableHead>MATERIAL & PROVIDER</TableHead>
                  <TableHead>VOLUME & HARGA</TableHead>
                  <TableHead>STATUS PESANAN</TableHead>
                  <TableHead className="pr-6 text-right sm:pr-8">AKSI & RESI</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-line-trace">
                {isLoading ? (
                  <TableSkeleton columnsCount={5} rowsCount={5} />
                ) : (
                  paginatedOrders.map((order) => {
                    const statusMeta = getMaterialStatusMeta(order.status);

                    return (
                      <TableRow
                        key={order.id}
                        className="border-line-trace transition-colors hover:bg-canvas-warm/40"
                      >
                        {/* Kode & Tanggal */}
                        <TableCell className="py-4 pl-6 sm:pl-8">
                          <p className="font-display text-sm font-bold text-brand-black">
                            {order.orderCode}
                          </p>
                          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-moss">
                            <CalendarDays className="size-3.5 shrink-0" />
                            {formatDate(order.createdAt)}
                          </p>
                        </TableCell>

                        {/* Material & Provider */}
                        <TableCell className="py-4">
                          <div className="flex items-center gap-2">
                            <Package className="size-4 shrink-0 text-brand-emerald" />
                            <div>
                              <p className="text-xs font-bold text-brand-black">
                                {order.batchTitle}
                              </p>
                              <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-moss">
                                <Factory className="size-3 shrink-0" />
                                {order.providerName}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Volume & Harga */}
                        <TableCell className="py-4">
                          <div>
                            <p className="text-xs font-bold text-brand-black">
                              {formatIdr(order.totalPriceIdr)}
                            </p>
                            <p className="mt-0.5 text-[11px] text-muted-moss">
                              {order.weightKg} kg × {formatIdr(order.pricePerKg)}
                            </p>
                          </div>
                        </TableCell>

                        {/* Status */}
                        <TableCell className="py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-wide ${statusMeta.className}`}
                          >
                            {statusMeta.label}
                          </span>
                        </TableCell>

                        {/* Resi & Action */}
                        <TableCell className="py-4 pr-6 text-right sm:pr-8">
                          <div className="flex items-center justify-end gap-2">
                            {order.trackingNumber && (
                              <p className="hidden sm:flex items-center gap-1 font-mono text-xs font-bold text-brand-forest">
                                <Truck className="size-3.5" />
                                {order.trackingNumber}
                              </p>
                            )}
                            <Button
                              variant="outline"
                              size="icon-sm"
                              onClick={() => setSelectedOrder(order)}
                              title="Lihat Detail Pembelian Material"
                            >
                              <Eye className="size-3.5 text-brand-emerald" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Footer Pagination */}
        {!isLoading && filteredOrders.length > 0 && (
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-moss">
              Menampilkan{" "}
              <span className="font-bold text-brand-black">
                {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredOrders.length)}
              </span>{" "}
              dari <span className="font-bold text-brand-black">{filteredOrders.length}</span> pesanan
            </p>

            <div className="flex items-center gap-2">
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

      <MaterialPurchaseDetailModal
        order={selectedOrder}
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
      />
    </section>
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

function getMaterialStatusMeta(status: MaterialOrderStatus) {
  switch (status) {
    case "completed":
      return {
        label: "Selesai",
        className: "bg-brand-lime/50 text-brand-forest",
      };
    case "shipped":
      return {
        label: "Dikirim",
        className: "bg-blue-50 text-blue-700 border border-blue-200",
      };
    case "processing":
      return {
        label: "Diproses",
        className: "bg-amber-50 text-amber-800 border border-amber-200",
      };
    case "paid_waiting_verification":
      return {
        label: "Menunggu Verifikasi QRIS",
        className: "bg-purple-50 text-purple-700 border border-purple-200",
      };
    case "cancelled":
      return {
        label: "Dibatalkan",
        className: "bg-red-50 text-red-700",
      };
    case "pending_payment":
    default:
      return {
        label: "Menunggu Pembayaran",
        className: "bg-brand-emerald/10 text-brand-emerald",
      };
  }
}

function formatDate(value: string | null): string {
  if (!value) return "Tanggal tidak tersedia";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Tanggal tidak tersedia";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
