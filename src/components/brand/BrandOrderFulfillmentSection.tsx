"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Package,
  RefreshCw,
  Search,
  Truck,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatusBadge, type BadgeVariant } from "@/components/ui/StatusBadge";
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
import { formatCoin, formatIdr } from "@/lib/productDetail";
import {
  advanceBrandOrderFulfillment,
  cancelAndRefundBrandOrder,
  completeBrandOrder,
  getBrandFulfillmentErrorMessage,
  getBrandFulfillmentOrders,
} from "@/services/brand";
import type { BrandFulfillmentOrder } from "@/types/brandOrderFulfillment";

import { useDebounce } from "@/hooks/useDebounce";
import { FulfillmentActionModal } from "./fulfillment/FulfillmentActionModal";
import { BrandOrderDetailModal } from "./fulfillment/BrandOrderDetailModal";
import { formatOrderCode, FulfillmentUiAction } from "./fulfillment/FulfillmentOrderCard";

type FulfillmentFilterTab = "all" | "pending" | "processing" | "shipped" | "complete" | "cancelled";

const ITEMS_PER_PAGE = 5;

export default function BrandOrderFulfillmentSection() {
  const [orders, setOrders] = useState<BrandFulfillmentOrder[]>([]);
  const [activeTab, setActiveTab] = useState<FulfillmentFilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedModalOrder, setSelectedModalOrder] = useState<BrandFulfillmentOrder | null>(null);
  const [selectedActionOrder, setSelectedActionOrder] = useState<BrandFulfillmentOrder | null>(null);
  const [selectedAction, setSelectedAction] = useState<FulfillmentUiAction | null>(null);

  const [trackingNumber, setTrackingNumber] = useState("");
  const [shippingNote, setShippingNote] = useState("");
  const [cancellationReason, setCancellationReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await getBrandFulfillmentOrders(200);

      if (!result.success || !result.data) {
        setOrders([]);
        setErrorMessage(getBrandFulfillmentErrorMessage(result.error));
        return;
      }

      setOrders(result.data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, activeTab]);

  const filteredOrders = useMemo(() => {
    let result = orders;

    // Filter by tab
    if (activeTab !== "all") {
      if (activeTab === "cancelled") {
        result = result.filter(
          (o) => o.orderStatus === "cancelled" || o.orderStatus === "rejected",
        );
      } else {
        result = result.filter((o) => o.orderStatus === activeTab);
      }
    }

    // Filter by search query
    const q = debouncedSearch.trim().toLowerCase();
    if (q) {
      result = result.filter((order) => {
        const orderCode = formatOrderCode(order.orderId).toLowerCase();
        const receiver = order.receiverName.toLowerCase();
        const phone = (order.phoneNumber ?? "").toLowerCase();
        const itemsText = order.items
          .map((item) => item.productName.toLowerCase())
          .join(" ");

        return (
          orderCode.includes(q) ||
          receiver.includes(q) ||
          phone.includes(q) ||
          itemsText.includes(q)
        );
      });
    }

    return result;
  }, [orders, activeTab, searchQuery]);

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedOrders = useMemo(() => {
    return filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredOrders, startIndex]);

  function openAction(order: BrandFulfillmentOrder, action: FulfillmentUiAction) {
    setSelectedActionOrder(order);
    setSelectedAction(action);
    setTrackingNumber(order.trackingNumber ?? "");
    setShippingNote(order.shippingNote ?? "");
    setCancellationReason("");
    setConfirmed(false);
    setModalError(null);
  }

  function closeActionModal() {
    if (isUpdating) return;
    setSelectedActionOrder(null);
    setSelectedAction(null);
    setTrackingNumber("");
    setShippingNote("");
    setCancellationReason("");
    setConfirmed(false);
    setModalError(null);
  }

  async function handleAction() {
    if (!selectedActionOrder || !selectedAction || isUpdating) return;

    if (!confirmed) {
      setModalError("Centang konfirmasi sebelum menyimpan perubahan.");
      return;
    }

    setIsUpdating(true);
    setModalError(null);

    try {
      if (selectedAction === "complete_order") {
        const result = await completeBrandOrder(selectedActionOrder.orderId);

        if (!result.success || !result.data) {
          setModalError(getBrandFulfillmentErrorMessage(result.error));
          return;
        }

        setSuccessMessage(
          result.data.pointsEarned > 0
            ? `Pesanan selesai dan ${formatCoin(
                result.data.pointsEarned,
              )} diberikan kepada customer.`
            : "Pesanan berhasil diselesaikan.",
        );
        closeAfterSuccess();
        await loadOrders();
        return;
      }

      if (selectedAction === "cancel_refund") {
        const reason = cancellationReason.trim();

        if (reason.length < 5) {
          setModalError("Alasan pembatalan minimal 5 karakter.");
          return;
        }

        const result = await cancelAndRefundBrandOrder({
          orderId: selectedActionOrder.orderId,
          reason,
        });

        if (!result.success || !result.data) {
          setModalError(getBrandFulfillmentErrorMessage(result.error));
          return;
        }

        setSuccessMessage(
          result.data.coinsRefunded > 0
            ? `Pesanan dibatalkan dan ${formatCoin(
                result.data.coinsRefunded,
              )} dikembalikan kepada customer.`
            : "Pesanan dibatalkan, pembayaran diperbarui, dan stok dikembalikan.",
        );
        closeAfterSuccess();
        await loadOrders();
        return;
      }

      const result = await advanceBrandOrderFulfillment({
        orderId: selectedActionOrder.orderId,
        action: selectedAction,
        trackingNumber: trackingNumber.trim() || undefined,
        shippingNote: shippingNote.trim() || undefined,
      });

      if (!result.success || !result.data) {
        setModalError(getBrandFulfillmentErrorMessage(result.error));
        return;
      }

      setSuccessMessage(
        selectedAction === "start_processing"
          ? "Pesanan mulai diproses."
          : "Pesanan ditandai sudah dikirim.",
      );

      closeAfterSuccess();
      await loadOrders();
    } finally {
      setIsUpdating(false);
    }
  }

  function closeAfterSuccess() {
    setSelectedActionOrder(null);
    setSelectedAction(null);
    setTrackingNumber("");
    setShippingNote("");
    setCancellationReason("");
    setConfirmed(false);
    setModalError(null);
  }

  return (
    <>
      <section className="mt-8">
        {/* Single Unified White Card Container (Matching Screenshot 2 Layout) */}
        <div className="rounded-2xl border border-brand-black/15 bg-canvas-pure p-6 sm:p-8">
          {/* Card Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-xl font-bold text-brand-black">
                Daftar Pesanan Brand ({orders.length})
              </h1>
              <p className="mt-1 text-xs text-muted-moss">
                Kelola dan cari transaksi pesanan produk toko Anda.
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

          {successMessage && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-brand-lime bg-brand-lime/15 px-4 py-3 text-xs font-medium text-brand-forest">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Card Toolbar: Search Input on Left, Filter Tabs on Right */}
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Search Input (Left) */}
            <div className="w-full sm:w-80">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari kode order atau nama customer..."
                endIcon={<Search className="size-4 text-muted-moss/60" strokeWidth={1.7} />}
              />
            </div>

            {/* Filter Tabs (Right) */}
            <div className="flex flex-wrap gap-2">
              <FilterTabButton
                label="Semua"
                active={activeTab === "all"}
                onClick={() => setActiveTab("all")}
              />
              <FilterTabButton
                label="Menunggu"
                active={activeTab === "pending"}
                onClick={() => setActiveTab("pending")}
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
                active={activeTab === "complete"}
                onClick={() => setActiveTab("complete")}
              />
              <FilterTabButton
                label="Dibatalkan"
                active={activeTab === "cancelled"}
                onClick={() => setActiveTab("cancelled")}
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="mt-6 overflow-hidden rounded-xl border border-brand-black/15 bg-canvas-pure">
            {errorMessage ? (
              <div className="flex min-h-[260px] flex-col items-center justify-center p-6 text-center">
                <RefreshCw className="size-7 text-muted-moss/40" />
                <p className="mt-3 text-xs font-medium text-brand-black">{errorMessage}</p>
                <button
                  type="button"
                  onClick={() => void loadOrders()}
                  className="mt-4 rounded-sm bg-brand-forest px-4 py-2.5 text-xs font-bold text-white transition hover:bg-brand-black"
                >
                  Coba Lagi
                </button>
              </div>
            ) : !isLoading && paginatedOrders.length === 0 ? (
              <div className="flex min-h-[260px] flex-col items-center justify-center p-6 text-center">
                <Package className="size-7 text-muted-moss/40" />
                <p className="mt-3 text-xs font-bold text-brand-black">Tidak Ada Pesanan</p>
                <p className="mt-1 text-[11px] text-muted-moss">
                  {searchQuery
                    ? "Tidak ada pesanan yang sesuai dengan pencarian Anda."
                    : "Belum ada pesanan pada status ini."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto muri-scrollbar w-full min-w-0">
                <Table className="min-w-[650px]">
                  <TableHeader className="bg-canvas-warm/60">
                    <TableRow className="border-line-trace">
                      <TableHead className="pl-6 sm:pl-8">KODE & TANGGAL</TableHead>
                      <TableHead>CUSTOMER</TableHead>
                      <TableHead>PRODUK PESANAN</TableHead>
                      <TableHead>TOTAL PEMBAYARAN</TableHead>
                      <TableHead>STATUS PESANAN</TableHead>
                      <TableHead className="pr-6 text-right sm:pr-8">AKSI</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-line-trace">
                    {isLoading ? (
                      <TableSkeleton columnsCount={6} rowsCount={5} />
                    ) : (
                      paginatedOrders.map((order) => {
                        const statusMeta = getFulfillmentStatusMeta(order.orderStatus);
                        const totalQuantity = order.items.reduce(
                          (sum, item) => sum + item.quantity,
                          0,
                        );
                        const paymentAmount =
                          order.paymentMethod === "coin"
                            ? formatCoin(order.amountCoin)
                            : formatIdr(order.amountIdr || order.totalPriceIdr);

                        return (
                          <TableRow
                            key={order.orderId}
                            className="border-line-trace transition-colors hover:bg-canvas-warm/40"
                          >
                            <TableCell className="py-4 pl-6 sm:pl-8">
                              <p className="font-display text-sm font-bold text-brand-black">
                                {formatOrderCode(order.orderId)}
                              </p>
                              <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-moss">
                                <CalendarDays className="size-3.5 shrink-0" />
                                {formatDate(order.orderCreatedAt)}
                              </p>
                            </TableCell>

                            <TableCell className="py-4">
                              <div>
                                <p className="text-xs font-bold text-brand-black">
                                  {order.receiverName}
                                </p>
                                <p className="mt-0.5 text-[11px] text-muted-moss">
                                  {order.phoneNumber || "-"}
                                </p>
                              </div>
                            </TableCell>

                            <TableCell className="py-4">
                              <div className="flex items-center gap-2">
                                <Package className="size-4 shrink-0 text-brand-emerald" />
                                <div>
                                  <p className="text-xs font-bold text-brand-black">
                                    {order.items[0]?.productName ?? "Produk"}
                                  </p>
                                  <p className="mt-0.5 text-[11px] text-muted-moss">
                                    {totalQuantity} produk
                                  </p>
                                </div>
                              </div>
                            </TableCell>

                            <TableCell className="py-4">
                              <div>
                                <p className="text-xs font-bold text-brand-black">
                                  {paymentAmount}
                                </p>
                                <p className="mt-0.5 text-[11px] uppercase text-muted-moss">
                                  Metode: {order.paymentMethod === "coin" ? "Coin" : "QRIS"}
                                </p>
                              </div>
                            </TableCell>

                            <TableCell className="py-4">
                              <StatusBadge variant={statusMeta.variant}>
                                {statusMeta.label}
                              </StatusBadge>
                            </TableCell>

                            <TableCell className="py-4 pr-6 text-right sm:pr-8">
                              <div className="flex items-center justify-end gap-2">
                                <TableActionButton
                                  onClick={() => setSelectedModalOrder(order)}
                                  title="Lihat Detail Pesanan"
                                  aria-label="Lihat Detail Pesanan"
                                >
                                  <Eye className="size-4 text-brand-forest" />
                                </TableActionButton>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Footer Pagination (Matching Screenshot 2) */}
          {!isLoading && !errorMessage && filteredOrders.length > 0 && (
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-moss">
                Menampilkan <span className="font-bold text-brand-black">{startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredOrders.length)}</span> dari{" "}
                <span className="font-bold text-brand-black">{filteredOrders.length}</span> pesanan
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
      </section>

      {/* Brand Order Detail Modal */}
      <BrandOrderDetailModal
        order={selectedModalOrder}
        isOpen={Boolean(selectedModalOrder)}
        onClose={() => setSelectedModalOrder(null)}
        onAction={openAction}
      />

      {/* Fulfillment Action Modal */}
      {selectedActionOrder && selectedAction && (
        <FulfillmentActionModal
          order={selectedActionOrder}
          action={selectedAction}
          trackingNumber={trackingNumber}
          shippingNote={shippingNote}
          cancellationReason={cancellationReason}
          confirmed={confirmed}
          isUpdating={isUpdating}
          errorMessage={modalError}
          onTrackingNumberChange={setTrackingNumber}
          onShippingNoteChange={setShippingNote}
          onCancellationReasonChange={setCancellationReason}
          onConfirmedChange={setConfirmed}
          onClose={closeActionModal}
          onSubmit={() => void handleAction()}
        />
      )}
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

function getFulfillmentStatusMeta(status: string): { label: string; variant: BadgeVariant } {
  switch (status) {
    case "complete":
      return {
        label: "SELESAI",
        variant: "success",
      };
    case "shipped":
      return {
        label: "DIKIRIM",
        variant: "info",
      };
    case "processing":
      return {
        label: "DIPROSES",
        variant: "warning",
      };
    case "cancelled":
    case "rejected":
      return {
        label: "DIBATALKAN",
        variant: "danger",
      };
    case "pending":
    default:
      return {
        label: "MENUNGGU",
        variant: "neutral",
      };
  }
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
