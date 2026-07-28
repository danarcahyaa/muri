"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Coins,
  Leaf,
  LoaderCircle,
  MapPin,
  Package,
  PackageCheck,
  Phone,
  PlayCircle,
  RefreshCw,
  RotateCcw,
  Truck,
  X,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { formatCoin, formatIdr } from "@/lib/product-detail";
import {
  advanceBrandOrderFulfillment,
  cancelAndRefundBrandOrder,
  completeBrandOrder,
  getBrandFulfillmentErrorMessage,
  getBrandFulfillmentOrders,
} from "@/services/brand";
import type {
  BrandFulfillmentOrder,
  BrandOrderFulfillmentAction,
} from "@/types/brandOrderFulfillment";

type FulfillmentTab =
  | "pending"
  | "processing"
  | "shipped"
  | "complete"
  | "cancelled";

type FulfillmentUiAction =
  | BrandOrderFulfillmentAction
  | "complete_order"
  | "cancel_refund";

const TABS: Array<{
  value: FulfillmentTab;
  label: string;
  icon: LucideIcon;
}> = [
  { value: "pending", label: "Menunggu", icon: ClipboardList },
  { value: "processing", label: "Diproses", icon: Package },
  { value: "shipped", label: "Dikirim", icon: Truck },
  { value: "complete", label: "Selesai", icon: CheckCircle2 },
  { value: "cancelled", label: "Dibatalkan", icon: XCircle },
];

export default function BrandOrderFulfillmentSection() {
  const [orders, setOrders] = useState<BrandFulfillmentOrder[]>([]);
  const [activeTab, setActiveTab] = useState<FulfillmentTab>("pending");
  const [selectedOrder, setSelectedOrder] =
    useState<BrandFulfillmentOrder | null>(null);
  const [selectedAction, setSelectedAction] =
    useState<FulfillmentUiAction | null>(null);
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
    if (!selectedOrder) {
      return;
    }

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, [selectedOrder]);

  const counts = useMemo(() => {
    return {
      pending: orders.filter((order) => order.orderStatus === "pending").length,
      processing: orders.filter((order) => order.orderStatus === "processing")
        .length,
      shipped: orders.filter((order) => order.orderStatus === "shipped").length,
      complete: orders.filter((order) => order.orderStatus === "complete").length,
      cancelled: orders.filter(
        (order) =>
          order.orderStatus === "cancelled" || order.orderStatus === "rejected",
      ).length,
    };
  }, [orders]);

  const visibleOrders = useMemo(() => {
    if (activeTab === "cancelled") {
      return orders.filter(
        (order) =>
          order.orderStatus === "cancelled" || order.orderStatus === "rejected",
      );
    }

    return orders.filter((order) => order.orderStatus === activeTab);
  }, [activeTab, orders]);

  function openAction(order: BrandFulfillmentOrder, action: FulfillmentUiAction) {
    setSelectedOrder(order);
    setSelectedAction(action);
    setTrackingNumber(order.trackingNumber ?? "");
    setShippingNote(order.shippingNote ?? "");
    setCancellationReason("");
    setConfirmed(false);
    setModalError(null);
  }

  function closeModal() {
    if (isUpdating) {
      return;
    }

    setSelectedOrder(null);
    setSelectedAction(null);
    setTrackingNumber("");
    setShippingNote("");
    setCancellationReason("");
    setConfirmed(false);
    setModalError(null);
  }

  async function handleAction() {
    if (!selectedOrder || !selectedAction || isUpdating) {
      return;
    }

    if (!confirmed) {
      setModalError("Centang konfirmasi sebelum menyimpan perubahan.");
      return;
    }

    setIsUpdating(true);
    setModalError(null);

    try {
      if (selectedAction === "complete_order") {
        const result = await completeBrandOrder(selectedOrder.orderId);

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
        setActiveTab("complete");
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
          orderId: selectedOrder.orderId,
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
        setActiveTab("cancelled");
        closeAfterSuccess();
        await loadOrders();
        return;
      }

      const result = await advanceBrandOrderFulfillment({
        orderId: selectedOrder.orderId,
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

      if (
        result.data.orderStatus === "processing" ||
        result.data.orderStatus === "shipped"
      ) {
        setActiveTab(result.data.orderStatus);
      }

      closeAfterSuccess();
      await loadOrders();
    } finally {
      setIsUpdating(false);
    }
  }

  function closeAfterSuccess() {
    setSelectedOrder(null);
    setSelectedAction(null);
    setTrackingNumber("");
    setShippingNote("");
    setCancellationReason("");
    setConfirmed(false);
    setModalError(null);
  }

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <>
      <section className="mt-8">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-brand-emerald">
              Order Management
            </p>
            <h1 className="mt-3 font-display text-4xl font-medium tracking-[-0.045em] text-brand-black sm:text-5xl">
              Fulfillment Pesanan
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-moss">
              Proses order yang sudah dibayar, kelola pengiriman, selesaikan
              reward, atau lakukan pembatalan dan refund sebelum paket dikirim.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadOrders()}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-line-trace px-5 py-3 text-xs font-bold text-brand-black transition hover:border-brand-forest"
          >
            <RefreshCw className="size-4" />
            Muat Ulang
          </button>
        </header>

        {successMessage && (
          <div className="mt-6 rounded-xl border border-brand-lime bg-brand-lime/15 px-5 py-4 text-xs font-medium text-brand-forest">
            {successMessage}
          </div>
        )}

        <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.value;

            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
                  active
                    ? "border-brand-forest bg-brand-forest text-white"
                    : "border-line-trace bg-canvas-pure text-brand-black hover:border-brand-emerald"
                }`}
              >
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                    active
                      ? "bg-white/10 text-brand-lime"
                      : "bg-canvas-warm text-brand-emerald"
                  }`}
                >
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold">{tab.label}</p>
                  <p
                    className={`mt-1 text-[10px] ${
                      active ? "text-white/65" : "text-muted-moss"
                    }`}
                  >
                    {counts[tab.value]} pesanan
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {errorMessage ? (
          <ErrorState message={errorMessage} onRetry={loadOrders} />
        ) : visibleOrders.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="mt-7 space-y-5">
            {visibleOrders.map((order) => (
              <OrderCard key={order.orderId} order={order} onAction={openAction} />
            ))}
          </div>
        )}
      </section>

      {selectedOrder && selectedAction && (
        <ActionModal
          order={selectedOrder}
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
          onClose={closeModal}
          onSubmit={() => void handleAction()}
        />
      )}
    </>
  );
}

function OrderCard({
  order,
  onAction,
}: {
  order: BrandFulfillmentOrder;
  onAction: (order: BrandFulfillmentOrder, action: FulfillmentUiAction) => void;
}) {
  const mainItems = order.items.filter((item) => !item.isBonus);
  const bonusItems = order.items.filter((item) => item.isBonus);
  const primaryAction = getPrimaryAction(order);
  const canCancel =
    order.orderStatus === "pending" || order.orderStatus === "processing";
  const paymentTotal =
    order.paymentMethod === "coin"
      ? formatCoin(order.amountCoin)
      : formatIdr(order.amountIdr);

  return (
    <article className="overflow-hidden rounded-3xl border border-line-trace bg-canvas-pure">
      <header className="border-b border-line-trace px-6 py-6 sm:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="font-display text-xl font-medium text-brand-black">
                {formatOrderCode(order.orderId)}
              </p>
              <StatusBadge status={order.orderStatus} />
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-moss">
              <CalendarDays className="size-4" />
              {formatDateTime(order.orderCreatedAt)}
            </div>
          </div>

          <div className="sm:text-right">
            <p className="text-[9px] font-bold uppercase text-muted-moss">
              Total Pembayaran
            </p>
            <p className="mt-2 font-display text-2xl font-medium text-brand-black">
              {paymentTotal}
            </p>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_350px]">
        <main className="border-b border-line-trace p-6 sm:p-8 lg:border-b-0 lg:border-r">
          <h2 className="text-xs font-bold uppercase text-brand-black">
            Produk Pesanan
          </h2>

          <div className="mt-5 divide-y divide-line-trace">
            {mainItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-5 py-4 first:pt-0"
              >
                <div>
                  <p className="text-sm font-medium text-brand-black">
                    {item.productName}
                  </p>
                  <p className="mt-1 text-xs text-muted-moss">
                    {item.quantity} produk
                  </p>
                </div>
                <p className="text-xs font-bold text-brand-black">
                  {order.paymentMethod === "coin"
                    ? formatCoin(item.coinsRedeemed)
                    : formatIdr(item.priceIdr * item.quantity)}
                </p>
              </div>
            ))}

            {bonusItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-5 py-4"
              >
                <div>
                  <p className="text-sm font-medium text-brand-black">
                    {item.productName}
                  </p>
                  <p className="mt-1 text-xs text-muted-moss">
                    {item.quantity} produk bonus
                  </p>
                </div>
                <span className="rounded-full bg-brand-lime/50 px-3 py-1.5 text-[9px] font-bold uppercase text-brand-forest">
                  Bonus
                </span>
              </div>
            ))}
          </div>

          <Timeline order={order} />

          {order.orderStatus === "complete" && (
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-brand-lime bg-brand-lime/15 p-5">
                <Coins className="size-5 text-brand-forest" />
                <p className="mt-3 text-[9px] font-bold uppercase text-muted-moss">
                  Coin Customer
                </p>
                <p className="mt-2 font-display text-2xl font-medium text-brand-forest">
                  + {formatCoin(order.pointsEarned)}
                </p>
              </div>
              <div className="rounded-2xl bg-canvas-warm p-5">
                <Leaf className="size-5 text-brand-emerald" />
                <p className="mt-3 text-[9px] font-bold uppercase text-muted-moss">
                  Dampak
                </p>
                <p className="mt-2 text-xs font-bold text-brand-black">
                  {formatDecimal(order.impactCarbonSavedKg)} kg karbon
                </p>
                <p className="mt-1 text-[10px] text-muted-moss">
                  {formatDecimal(order.impactWaterSavedLiters)} liter air
                </p>
              </div>
            </div>
          )}

          {(order.orderStatus === "cancelled" ||
            order.orderStatus === "rejected") && (
            <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5">
              <p className="text-xs font-bold text-red-900">Alasan</p>
              <p className="mt-2 text-xs leading-5 text-red-700">
                {order.cancellationReason ??
                  "Pembayaran ditolak atau pesanan dibatalkan."}
              </p>
            </div>
          )}
        </main>

        <aside className="p-6 sm:p-8">
          <h2 className="text-xs font-bold uppercase text-brand-black">
            Pengiriman
          </h2>
          <div className="mt-6 space-y-5">
            <Fact icon={PackageCheck} label="Penerima" value={order.receiverName} />
            <Fact
              icon={Phone}
              label="Telepon"
              value={order.phoneNumber ?? "Belum tersedia"}
            />
            <Fact icon={MapPin} label="Alamat" value={order.shippingAddress} />
            {order.trackingNumber && (
              <Fact icon={Truck} label="Nomor Resi" value={order.trackingNumber} />
            )}
          </div>

          {order.shippingNote && (
            <div className="mt-6 rounded-xl bg-canvas-warm p-4">
              <p className="text-[9px] font-bold uppercase text-muted-moss">
                Catatan
              </p>
              <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-brand-black">
                {order.shippingNote}
              </p>
            </div>
          )}

          {primaryAction && (
            <button
              type="button"
              onClick={() => onAction(order, primaryAction)}
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-md bg-brand-forest px-5 py-3.5 text-xs font-bold text-white transition hover:bg-brand-black"
            >
              <PrimaryActionIcon action={primaryAction} />
              {getActionLabel(primaryAction)}
            </button>
          )}

          {canCancel && (
            <button
              type="button"
              onClick={() => onAction(order, "cancel_refund")}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-red-200 bg-red-50 px-5 py-3.5 text-xs font-bold text-red-700 transition hover:bg-red-100"
            >
              <RotateCcw className="size-4" />
              Batalkan / Refund
            </button>
          )}
        </aside>
      </div>
    </article>
  );
}

function Timeline({ order }: { order: BrandFulfillmentOrder }) {
  const steps = [
    { label: "Pembayaran", value: order.paidAt },
    { label: "Diproses", value: order.processingAt },
    { label: "Dikirim", value: order.shippedAt },
    { label: "Selesai", value: order.completedAt },
  ];

  return (
    <div className="mt-8 border-t border-line-trace pt-8">
      <p className="text-xs font-bold uppercase text-brand-black">Timeline</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {steps.map((step) => (
          <div key={step.label} className="rounded-xl bg-canvas-warm p-4">
            <p className="text-[9px] font-bold uppercase text-muted-moss">
              {step.label}
            </p>
            <p className="mt-2 text-[10px] font-medium text-brand-black">
              {step.value ? formatDateTime(step.value) : "Belum"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActionModal({
  order,
  action,
  trackingNumber,
  shippingNote,
  cancellationReason,
  confirmed,
  isUpdating,
  errorMessage,
  onTrackingNumberChange,
  onShippingNoteChange,
  onCancellationReasonChange,
  onConfirmedChange,
  onClose,
  onSubmit,
}: {
  order: BrandFulfillmentOrder;
  action: FulfillmentUiAction;
  trackingNumber: string;
  shippingNote: string;
  cancellationReason: string;
  confirmed: boolean;
  isUpdating: boolean;
  errorMessage: string | null;
  onTrackingNumberChange: (value: string) => void;
  onShippingNoteChange: (value: string) => void;
  onCancellationReasonChange: (value: string) => void;
  onConfirmedChange: (value: boolean) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const isShipping = action === "mark_shipped";
  const isComplete = action === "complete_order";
  const isCancel = action === "cancel_refund";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-brand-black/70 px-4 py-8 backdrop-blur-sm">
      <section className="max-h-full w-full max-w-xl overflow-y-auto rounded-3xl bg-canvas-pure shadow-2xl">
        <header className="flex items-start justify-between gap-5 border-b border-line-trace px-6 py-6 sm:px-8">
          <div>
            <p className="text-xs font-bold uppercase text-brand-emerald">
              {getActionLabel(action)}
            </p>
            <h2 className="mt-2 font-display text-3xl font-medium text-brand-black">
              {formatOrderCode(order.orderId)}
            </h2>
          </div>
          <button
            type="button"
            disabled={isUpdating}
            onClick={onClose}
            className="flex size-10 items-center justify-center rounded-full bg-canvas-warm text-brand-black"
          >
            <X className="size-4" />
          </button>
        </header>

        <div className="p-6 sm:p-8">
          <div className="rounded-2xl bg-canvas-warm p-5">
            <SummaryRow label="Penerima" value={order.receiverName} />
            <SummaryRow
              label="Pembayaran"
              value={
                order.paymentMethod === "coin"
                  ? formatCoin(order.amountCoin)
                  : formatIdr(order.amountIdr)
              }
            />
            {isComplete && (
              <SummaryRow
                label="Bonus Coin"
                value={`+ ${formatCoin(order.pointsEarned)}`}
              />
            )}
          </div>

          {isShipping && (
            <Field label="Nomor Resi" count={`${trackingNumber.length}/120`}>
              <input
                value={trackingNumber}
                maxLength={120}
                disabled={isUpdating}
                onChange={(event) => onTrackingNumberChange(event.target.value)}
                className="mt-3 w-full rounded-xl border border-line-trace bg-white px-4 py-3 text-sm text-brand-black outline-none focus:border-brand-emerald"
              />
            </Field>
          )}

          {!isComplete && !isCancel && (
            <Field label="Catatan" count={`${shippingNote.length}/1000`}>
              <textarea
                value={shippingNote}
                maxLength={1000}
                rows={5}
                disabled={isUpdating}
                onChange={(event) => onShippingNoteChange(event.target.value)}
                className="mt-3 w-full resize-none rounded-xl border border-line-trace bg-white px-4 py-3 text-sm text-brand-black outline-none focus:border-brand-emerald"
              />
            </Field>
          )}

          {isCancel && (
            <>
              <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900">
                Untuk pembayaran QRIS yang sudah paid, lakukan pengembalian dana
                kepada customer terlebih dahulu. Aksi ini kemudian menandai
                pembayaran sebagai refunded dan mengembalikan stok. Pembayaran
                coin dikembalikan otomatis.
              </div>
              <Field
                label="Alasan pembatalan / refund"
                count={`${cancellationReason.length}/1000`}
              >
                <textarea
                  value={cancellationReason}
                  maxLength={1000}
                  rows={5}
                  disabled={isUpdating}
                  onChange={(event) =>
                    onCancellationReasonChange(event.target.value)
                  }
                  className="mt-3 w-full resize-none rounded-xl border border-red-200 bg-white px-4 py-3 text-sm text-brand-black outline-none focus:border-red-500"
                />
              </Field>
            </>
          )}

          <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-line-trace p-4">
            <input
              type="checkbox"
              checked={confirmed}
              disabled={isUpdating}
              onChange={(event) => onConfirmedChange(event.target.checked)}
              className="mt-0.5 size-4 accent-brand-forest"
            />
            <span className="text-xs leading-5 text-brand-black">
              {getConfirmationText(action)}
            </span>
          </label>

          {errorMessage && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700">
              {errorMessage}
            </div>
          )}

          <button
            type="button"
            disabled={isUpdating || !confirmed}
            onClick={onSubmit}
            className={`mt-7 flex w-full items-center justify-center gap-3 rounded-md px-6 py-4 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 ${
              isCancel ? "bg-red-700 hover:bg-red-800" : "bg-brand-forest hover:bg-brand-black"
            }`}
          >
            {isUpdating ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <PrimaryActionIcon action={action} />
            )}
            {isUpdating ? "Menyimpan..." : getActionLabel(action)}
          </button>
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  count,
  children,
}: {
  label: string;
  count: string;
  children: ReactNode;
}) {
  return (
    <div className="mt-6">
      <div className="flex items-center justify-between gap-4">
        <label className="text-xs font-bold text-brand-black">{label}</label>
        <span className="text-[9px] text-muted-moss">{count}</span>
      </div>
      {children}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-5 border-b border-line-trace py-3 first:pt-0 last:border-b-0 last:pb-0">
      <span className="text-xs text-muted-moss">{label}</span>
      <span className="text-right text-xs font-bold text-brand-black">
        {value}
      </span>
    </div>
  );
}

function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-canvas-warm text-muted-moss">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[9px] font-bold uppercase text-muted-moss">{label}</p>
        <p className="mt-1 break-words text-xs font-medium leading-5 text-brand-black">
          {value}
        </p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: BrandFulfillmentOrder["orderStatus"] }) {
  const meta: Record<string, { label: string; className: string }> = {
    pending: { label: "Menunggu", className: "bg-amber-100 text-amber-800" },
    processing: { label: "Diproses", className: "bg-blue-100 text-blue-800" },
    shipped: { label: "Dikirim", className: "bg-purple-100 text-purple-800" },
    complete: {
      label: "Selesai",
      className: "bg-brand-lime/50 text-brand-forest",
    },
    cancelled: { label: "Dibatalkan", className: "bg-red-100 text-red-700" },
    rejected: { label: "Ditolak", className: "bg-orange-100 text-orange-700" },
  };
  const value = meta[status] ?? meta.pending;

  return (
    <span
      className={`rounded-full px-3 py-2 text-[9px] font-bold uppercase ${value.className}`}
    >
      {value.label}
    </span>
  );
}

function PrimaryActionIcon({ action }: { action: FulfillmentUiAction }) {
  if (action === "start_processing") return <PlayCircle className="size-4" />;
  if (action === "mark_shipped") return <Truck className="size-4" />;
  if (action === "complete_order") return <PackageCheck className="size-4" />;
  return <RotateCcw className="size-4" />;
}

function getPrimaryAction(order: BrandFulfillmentOrder): FulfillmentUiAction | null {
  if (order.orderStatus === "pending") return "start_processing";
  if (order.orderStatus === "processing") return "mark_shipped";
  if (order.orderStatus === "shipped") return "complete_order";
  return null;
}

function getActionLabel(action: FulfillmentUiAction): string {
  if (action === "start_processing") return "Mulai Proses";
  if (action === "mark_shipped") return "Tandai Dikirim";
  if (action === "complete_order") return "Selesaikan dan Berikan Coin";
  return "Batalkan dan Refund";
}

function getConfirmationText(action: FulfillmentUiAction): string {
  if (action === "start_processing") {
    return "Saya memastikan pembayaran sudah diterima dan pesanan siap diproses.";
  }
  if (action === "mark_shipped") {
    return "Saya memastikan pesanan sudah diserahkan kepada kurir atau layanan pengiriman.";
  }
  if (action === "complete_order") {
    return "Saya memastikan pengiriman telah selesai. Bonus coin dan dampak lingkungan akan dicatat satu kali.";
  }
  return "Saya memastikan refund QRIS telah dilakukan bila diperlukan. Sistem akan mengembalikan stok dan coin secara aman.";
}

function LoadingState() {
  return (
    <section className="mt-8">
      <div className="h-32 animate-pulse rounded-3xl bg-canvas-warm" />
      <div className="mt-7 h-96 animate-pulse rounded-3xl bg-canvas-warm" />
    </section>
  );
}

function EmptyState() {
  return (
    <div className="mt-7 flex min-h-72 flex-col items-center justify-center rounded-3xl border border-line-trace bg-canvas-pure px-6 text-center">
      <CheckCircle2 className="size-8 text-brand-forest" />
      <p className="mt-4 font-display text-2xl font-medium text-brand-black">
        Tidak ada pesanan pada status ini
      </p>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => Promise<void>;
}) {
  return (
    <div className="mt-7 flex min-h-72 flex-col items-center justify-center rounded-3xl border border-line-trace bg-canvas-pure px-6 text-center">
      <RefreshCw className="size-8 text-muted-moss" />
      <p className="mt-4 text-xs text-muted-moss">{message}</p>
      <button
        type="button"
        onClick={() => void onRetry()}
        className="mt-5 rounded-md bg-brand-forest px-5 py-3 text-xs font-bold text-white"
      >
        Coba Lagi
      </button>
    </div>
  );
}

function formatOrderCode(orderId: string): string {
  return `ORD-${orderId.replaceAll("-", "").slice(0, 8).toUpperCase()}`;
}

function formatDateTime(value: string | null): string {
  if (!value) return "Waktu tidak tersedia";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Waktu tidak tersedia";

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatDecimal(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2,
  }).format(value);
}
