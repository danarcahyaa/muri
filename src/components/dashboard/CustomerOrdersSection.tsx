"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Eye,
  Package,
  QrCode,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { getMyOrders } from "@/services/customer";
import type { CustomerOrder, CustomerOrderStatus } from "@/types/customerOrder";
import CustomerOrderDetailModal from "./orders/CustomerOrderDetailModal";

export default function CustomerOrdersSection() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);

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
      <section className="mt-8 overflow-hidden rounded-3xl border border-line-trace bg-canvas-pure">
        <div className="flex items-center justify-between border-b border-line-trace px-6 py-5 sm:px-8">
          <div>
            <h2 className="font-display text-xl font-medium text-brand-black">
              Daftar Pesanan ({orders.length})
            </h2>
            <p className="mt-1 text-xs text-muted-moss">
              Klik pada tombol detail untuk melihat rincian lengkap pesanan.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadOrders()}
            className="inline-flex items-center justify-center gap-1.5 rounded-md border border-line-trace px-3.5 py-2 text-xs font-bold text-brand-black transition hover:border-brand-forest"
          >
            <RefreshCw className="size-3.5" />
            Muat Ulang
          </button>
        </div>

        <Table>
          <TableHeader className="bg-canvas-warm/60">
            <TableRow className="border-line-trace">
              <TableHead className="py-4 pl-6 text-xs font-bold uppercase tracking-wider text-muted-moss sm:pl-8">
                Kode & Tanggal
              </TableHead>
              <TableHead className="py-4 text-xs font-bold uppercase tracking-wider text-muted-moss">
                Produk Pesanan
              </TableHead>
              <TableHead className="py-4 text-xs font-bold uppercase tracking-wider text-muted-moss">
                Total Pembayaran
              </TableHead>
              <TableHead className="py-4 text-xs font-bold uppercase tracking-wider text-muted-moss">
                Status Pesanan
              </TableHead>
              <TableHead className="py-4 pr-6 text-right text-xs font-bold uppercase tracking-wider text-muted-moss sm:pr-8">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-line-trace">
            {orders.map((order) => {
              const statusMeta = getOrderStatusMeta(order.status);
              const firstItem = order.items[0];
              const remainingCount = order.items.length - 1;
              const paymentTotal =
                order.payment?.method === "coin"
                  ? `${formatNumber(order.payment.amountCoin)} coin`
                  : formatCurrency(order.payment?.amountIdr ?? order.totalPriceIdr);

              return (
                <TableRow
                  key={order.id}
                  className="border-line-trace transition-colors hover:bg-canvas-warm/40"
                >
                  {/* Order ID & Date */}
                  <TableCell className="py-5 pl-6 sm:pl-8">
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
                  <TableCell className="py-5">
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
                  <TableCell className="py-5">
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
                  <TableCell className="py-5">
                    <span
                      className={`inline-flex rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide ${statusMeta.className}`}
                    >
                      {statusMeta.label}
                    </span>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="py-5 pr-6 text-right sm:pr-8">
                    <div className="flex items-center justify-end gap-2">
                      {order.payment?.status === "waiting_payment" && (
                        <Link
                          href={`/dashboard/orders/${order.id}/payment`}
                          className="inline-flex items-center gap-1.5 rounded-md bg-brand-forest px-3 py-2 text-xs font-bold text-white transition hover:bg-brand-black"
                        >
                          <QrCode className="size-3.5" />
                          Bayar
                        </Link>
                      )}

                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-line-trace bg-canvas-pure px-3 py-2 text-xs font-bold text-brand-black transition hover:border-brand-forest hover:bg-canvas-warm"
                      >
                        <Eye className="size-3.5 text-brand-emerald" />
                        Detail
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </section>

      {/* Detail Modal */}
      <CustomerOrderDetailModal
        order={selectedOrder}
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
      />
    </>
  );
}

function getOrderStatusMeta(status: CustomerOrderStatus) {
  switch (status) {
    case "complete":
      return {
        label: "Selesai",
        className: "bg-brand-lime/50 text-brand-forest",
      };
    case "cancelled":
      return {
        label: "Dibatalkan",
        className: "bg-red-50 text-red-700",
      };
    case "rejected":
      return {
        label: "Ditolak",
        className: "bg-orange-50 text-orange-700",
      };
    case "pending":
    default:
      return {
        label: "Diproses",
        className: "bg-brand-emerald/10 text-brand-emerald",
      };
  }
}

function OrdersSkeleton() {
  return (
    <section className="mt-8 rounded-3xl border border-line-trace bg-canvas-pure p-6">
      <div className="h-6 w-48 animate-pulse rounded-md bg-canvas-warm" />
      <div className="mt-6 space-y-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-canvas-warm" />
        ))}
      </div>
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
    <section className="mt-8 flex min-h-72 flex-col items-center justify-center rounded-3xl border border-line-trace bg-canvas-pure px-6 py-12 text-center">
      <RefreshCw className="size-9 text-muted-moss/50" />
      <h2 className="mt-5 font-display text-2xl font-medium text-brand-black">
        Pesanan gagal dimuat
      </h2>
      <p className="mt-2 text-xs text-muted-moss">{message}</p>
      <button
        type="button"
        onClick={() => void onRetry()}
        className="mt-6 inline-flex items-center gap-2 rounded-md bg-brand-forest px-5 py-3 text-xs font-bold text-white transition hover:bg-brand-black"
      >
        <RefreshCw className="size-4" />
        Coba Lagi
      </button>
    </section>
  );
}

function EmptyOrders() {
  return (
    <section className="mt-8 flex min-h-72 flex-col items-center justify-center rounded-3xl border border-line-trace bg-canvas-pure px-6 py-12 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-lime/40 text-brand-forest">
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
