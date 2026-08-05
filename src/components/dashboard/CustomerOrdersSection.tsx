"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Eye,
  Package,
  QrCode,
  RefreshCw,
  Search,
  ShoppingBag,
} from "lucide-react";
import { Table } from "@/components/ui/Table";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { StatusBadge, type BadgeVariant } from "@/components/ui/StatusBadge";
import { TableActionButton } from "@/components/ui/TableActionButton";
import { Button } from "@/components/ui/Button";
import { getMyOrders } from "@/services/customer";
import type { CustomerOrder, CustomerOrderStatus } from "@/types/customerOrder";
import CustomerOrderDetailModal from "./orders/CustomerOrderDetailModal";

const PAGE_SIZE = 5;

type OrderStatusFilter = "all" | "pending" | "complete" | "cancelled";

const STATUS_TABS: Array<{ value: OrderStatusFilter; label: string }> = [
  { value: "all", label: "Semua" },
  { value: "pending", label: "Diproses" },
  { value: "complete", label: "Selesai" },
  { value: "cancelled", label: "Dibatalkan / Ditolak" },
];

export default function CustomerOrdersSection() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);

  // Search, Filter & Pagination states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await getMyOrders();

      if (!result.success) {
        setOrders([]);
        setErrorMessage("Pesanan belum dapat dimuat.");
        return;
      }

      setOrders(result.data ?? []);
    } catch (error) {
      console.error("[CustomerOrdersSection] Failed to load orders:", error);
      setOrders([]);
      setErrorMessage("Terjadi kesalahan saat memuat pesanan.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  // Filter orders by search query and status filter
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const orderCode = formatOrderCode(order.id).toLowerCase();
      const query = searchQuery.trim().toLowerCase();

      const matchesSearch =
        !query ||
        orderCode.includes(query) ||
        order.id.toLowerCase().includes(query) ||
        order.items.some((item) => item.productName.toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "pending" && order.status === "pending") ||
        (statusFilter === "complete" && order.status === "complete") ||
        (statusFilter === "cancelled" &&
          (order.status === "cancelled" || order.status === "rejected"));

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  // Reset page to 1 whenever search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredOrders.slice(start, start + PAGE_SIZE);
  }, [currentPage, filteredOrders]);

  if (isLoading) {
    return <OrdersSkeleton />;
  }

  if (errorMessage) {
    return <OrdersError message={errorMessage} onRetry={loadOrders} />;
  }

  if (orders.length === 0) {
    return <EmptyOrders />;
  }

  return (
    <>
      <section className="mt-8 overflow-hidden rounded-2xl border border-brand-black/15 bg-canvas-pure">
        {/* Section Header */}
        <div className="flex flex-col gap-4 border-b border-line-trace px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <h2 className="font-display text-xl font-bold text-brand-black">
              Daftar Pesanan ({orders.length})
            </h2>
            <p className="mt-1 text-xs text-muted-moss">
              Kelola dan cari transaksi pesanan produk Anda.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadOrders()}
            className="inline-flex items-center justify-center gap-1.5 rounded-sm border border-brand-black/15 px-3.5 py-2 text-xs font-bold text-brand-black transition hover:border-brand-forest"
          >
            <RefreshCw className="size-3.5" />
            Muat Ulang
          </button>
        </div>

        {/* Toolbar: Search Bar & Status Filters */}
        <div className="flex flex-col gap-4 border-b border-line-trace bg-canvas-warm/40 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          {/* Search Input */}
          <div className="w-full max-w-sm">
            <Input
              type="text"
              placeholder="Cari kode order atau nama produk..."
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
        {filteredOrders.length === 0 ? (
          <div className="flex min-h-60 flex-col items-center justify-center px-6 py-12 text-center">
            <Search className="size-8 text-muted-moss/40" />
            <p className="mt-3 text-sm font-bold text-brand-black">
              Tidak ada pesanan yang sesuai
            </p>
            <p className="mt-1 text-xs text-muted-moss">
              Coba sesuaikan kata kunci pencarian atau filter status Anda.
            </p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader className="bg-canvas-warm/60">
                <TableRow className="border-line-trace">
                  <TableHead className="py-3.5 pl-6 text-xs font-bold uppercase tracking-wider text-muted-moss sm:pl-8">
                    Kode & Tanggal
                  </TableHead>
                  <TableHead className="py-3.5 text-xs font-bold uppercase tracking-wider text-muted-moss">
                    Produk Pesanan
                  </TableHead>
                  <TableHead className="py-3.5 text-xs font-bold uppercase tracking-wider text-muted-moss">
                    Total Pembayaran
                  </TableHead>
                  <TableHead className="py-3.5 text-xs font-bold uppercase tracking-wider text-muted-moss">
                    Status Pesanan
                  </TableHead>
                  <TableHead className="py-3.5 pr-6 text-right text-xs font-bold uppercase tracking-wider text-muted-moss sm:pr-8">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-line-trace">
                {paginatedOrders.map((order) => {
                  const statusMeta = getOrderStatusMeta(order.status);
                  const firstItem = order.items[0];
                  const remainingCount = order.items.length - 1;
                  const paymentTotal =
                    order.payment?.method === "coin"
                      ? `${formatNumber(order.payment.amountCoin)} coin`
                      : formatCurrency(
                          order.payment?.amountIdr ?? order.totalPriceIdr,
                        );

                  return (
                    <TableRow
                      key={order.id}
                      className="border-line-trace transition-colors hover:bg-canvas-warm/40"
                    >
                      {/* Order ID & Date */}
                      <TableCell className="py-4 pl-6 sm:pl-8">
                        <div>
                          <span className="font-display text-sm font-bold text-brand-black">
                            {formatOrderCode(order.id)}
                          </span>
                          <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-moss">
                            <CalendarDays className="size-3.5 shrink-0" />
                            <span>{formatDate(order.createdAt)}</span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Product Summary */}
                      <TableCell className="py-4">
                        {firstItem ? (
                          <div>
                            <div className="flex items-center gap-2">
                              <Package className="size-4 shrink-0 text-brand-emerald" />
                              <span className="text-xs font-bold text-brand-black line-clamp-1">
                                {firstItem.productName}
                              </span>
                            </div>
                            <p className="mt-1 text-[11px] text-muted-moss">
                              {firstItem.quantity} produk
                              {remainingCount > 0 && (
                                <span className="ml-1 font-semibold text-brand-forest">
                                  +{remainingCount} produk lainnya
                                </span>
                              )}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-moss">
                            Tanpa detail item
                          </span>
                        )}
                      </TableCell>

                      {/* Total Payment */}
                      <TableCell className="py-4">
                        <div>
                          <span className="font-display text-sm font-bold text-brand-black">
                            {paymentTotal}
                          </span>
                          <p className="mt-0.5 text-[10px] text-muted-moss">
                            Metode: {order.payment?.method === "coin" ? "Coin" : "QRIS"}
                          </p>
                        </div>
                      </TableCell>

                      {/* Status Badge */}
                      <TableCell className="py-4">
                        <StatusBadge variant={statusMeta.variant}>
                          {statusMeta.label}
                        </StatusBadge>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="py-4 pr-6 text-right sm:pr-8">
                        <div className="flex items-center justify-end gap-2">
                          {order.payment?.status === "waiting_payment" && (
                            <TableActionButton
                              variant="primary"
                              title="Bayar QRIS Sekarang"
                              aria-label="Bayar QRIS Sekarang"
                              onClick={() => window.location.href = `/dashboard/orders/${order.id}/payment`}
                            >
                              <QrCode className="size-4" />
                            </TableActionButton>
                          )}

                          <TableActionButton
                            onClick={() => setSelectedOrder(order)}
                            title="Lihat Detail Pesanan"
                            aria-label="Lihat Detail Pesanan"
                          >
                            <Eye className="size-4 text-brand-forest" />
                          </TableActionButton>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {/* Pagination Controls */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-line-trace bg-canvas-warm/30 px-6 py-4 sm:px-8">
              <p className="text-xs text-muted-moss">
                Menampilkan{" "}
                <span className="font-bold text-brand-black">
                  {Math.min(
                    (currentPage - 1) * PAGE_SIZE + 1,
                    filteredOrders.length,
                  )}
                </span>
                –
                <span className="font-bold text-brand-black">
                  {Math.min(currentPage * PAGE_SIZE, filteredOrders.length)}
                </span>{" "}
                dari{" "}
                <span className="font-bold text-brand-black">
                  {filteredOrders.length}
                </span>{" "}
                pesanan
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
      </section>

      {/* Detail Modal */}
      <CustomerOrderDetailModal
        order={selectedOrder}
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        onOrderUpdated={loadOrders}
      />
    </>
  );
}

function getOrderStatusMeta(status: CustomerOrderStatus): { label: string; variant: BadgeVariant } {
  switch (status) {
    case "complete":
      return {
        label: "Selesai",
        variant: "success",
      };
    case "shipped":
      return {
        label: "Dikirim",
        variant: "info",
      };
    case "cancelled":
      return {
        label: "Dibatalkan",
        variant: "danger",
      };
    case "rejected":
      return {
        label: "Ditolak",
        variant: "danger",
      };
    case "pending":
    default:
      return {
        label: "Diproses",
        variant: "warning",
      };
  }
}

function OrdersSkeleton() {
  return (
    <section className="mt-8 overflow-hidden rounded-2xl border border-brand-black/15 bg-canvas-pure">
      <div className="flex items-center justify-between border-b border-line-trace px-6 py-5 sm:px-8">
        <div>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="mt-2 h-3.5 w-64" />
        </div>
        <Skeleton className="h-9 w-28 rounded-sm" />
      </div>

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
              Kode & Tanggal
            </TableHead>
            <TableHead className="py-3.5 text-xs font-bold uppercase tracking-wider text-muted-moss">
              Produk Pesanan
            </TableHead>
            <TableHead className="py-3.5 text-xs font-bold uppercase tracking-wider text-muted-moss">
              Total Pembayaran
            </TableHead>
            <TableHead className="py-3.5 text-xs font-bold uppercase tracking-wider text-muted-moss">
              Status Pesanan
            </TableHead>
            <TableHead className="py-3.5 pr-6 text-right text-xs font-bold uppercase tracking-wider text-muted-moss sm:pr-8">
              Aksi
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-line-trace">
          <TableSkeleton columnsCount={5} rowsCount={5} />
        </TableBody>
      </Table>
    </section>
  );
}

function OrdersError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => Promise<void>;
}) {
  return (
    <section className="mt-8 flex min-h-72 flex-col items-center justify-center rounded-2xl border border-brand-black/15 bg-canvas-pure px-6 py-12 text-center">
      <RefreshCw className="size-9 text-muted-moss/50" />
      <h2 className="mt-5 font-display text-2xl font-medium text-brand-black">
        Pesanan gagal dimuat
      </h2>
      <p className="mt-2 text-xs text-muted-moss">{message}</p>
      <button
        type="button"
        onClick={() => void onRetry()}
        className="mt-6 inline-flex items-center gap-2 rounded-sm bg-brand-forest px-5 py-3 text-xs font-bold text-white transition hover:bg-brand-black"
      >
        <RefreshCw className="size-4" />
        Coba Lagi
      </button>
    </section>
  );
}

function EmptyOrders() {
  return (
    <section className="mt-8 flex min-h-72 flex-col items-center justify-center rounded-2xl border border-brand-black/15 bg-canvas-pure px-6 py-12 text-center">
      <div className="flex size-14 items-center justify-center rounded-xl bg-brand-lime/40 text-brand-forest">
        <ShoppingBag className="size-6" />
      </div>
      <h2 className="mt-6 font-display text-2xl font-medium text-brand-black">
        Belum ada pesanan
      </h2>
      <p className="mt-2 max-w-md text-xs leading-5 text-muted-moss">
        Pesanan produk yang Anda buat akan muncul dan dapat dipantau melalui halaman ini.
      </p>
    </section>
  );
}

function formatOrderCode(orderId: string): string {
  const shortId = orderId.replaceAll("-", "").slice(0, 8).toUpperCase();
  return `ORD-${shortId}`;
}

function formatDate(value: string | null): string {
  if (!value) return "Tanggal tidak tersedia";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Tanggal tidak tersedia";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(value);
}
