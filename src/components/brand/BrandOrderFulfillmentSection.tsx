"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { LoaderCircle, RefreshCw } from "lucide-react";

import { formatCoin } from "@/lib/productDetail";
import {
  advanceBrandOrderFulfillment,
  cancelAndRefundBrandOrder,
  completeBrandOrder,
  getBrandFulfillmentErrorMessage,
  getBrandFulfillmentOrders,
} from "@/services/brand";
import type { BrandFulfillmentOrder } from "@/types/brandOrderFulfillment";

import { FulfillmentTabs, FulfillmentTab } from "./fulfillment/FulfillmentTabs";
import {
  FulfillmentOrderCard,
  FulfillmentUiAction,
} from "./fulfillment/FulfillmentOrderCard";
import { FulfillmentActionModal } from "./fulfillment/FulfillmentActionModal";

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
    if (!selectedOrder) return;
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
    if (isUpdating) return;
    setSelectedOrder(null);
    setSelectedAction(null);
    setTrackingNumber("");
    setShippingNote("");
    setCancellationReason("");
    setConfirmed(false);
    setModalError(null);
  }

  async function handleAction() {
    if (!selectedOrder || !selectedAction || isUpdating) return;

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
    return (
      <div className="flex min-h-[480px] items-center justify-center rounded-3xl border border-line-trace bg-canvas-pure">
        <div className="text-center">
          <LoaderCircle className="mx-auto size-8 animate-spin text-brand-emerald" />
          <p className="mt-4 text-xs text-muted-moss">Memuat data fulfillment pesanan...</p>
        </div>
      </div>
    );
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

        <FulfillmentTabs
          activeTab={activeTab}
          counts={counts}
          onTabChange={setActiveTab}
        />

        {errorMessage ? (
          <div className="mt-8 flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-line-trace bg-canvas-pure p-6 text-center">
            <RefreshCw className="size-8 text-muted-moss/40" />
            <p className="mt-4 text-sm font-medium text-brand-black">{errorMessage}</p>
            <button
              type="button"
              onClick={() => void loadOrders()}
              className="mt-5 rounded-md bg-brand-forest px-5 py-3 text-xs font-bold text-white"
            >
              Coba Lagi
            </button>
          </div>
        ) : visibleOrders.length === 0 ? (
          <div className="mt-8 flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-line-trace bg-canvas-pure p-6 text-center">
            <p className="text-sm font-medium text-brand-black">Tidak Ada Pesanan</p>
            <p className="mt-2 text-xs text-muted-moss">
              Belum ada pesanan pada kategori tab ini.
            </p>
          </div>
        ) : (
          <div className="mt-7 space-y-5">
            {visibleOrders.map((order) => (
              <FulfillmentOrderCard key={order.orderId} order={order} onAction={openAction} />
            ))}
          </div>
        )}
      </section>

      {selectedOrder && selectedAction && (
        <FulfillmentActionModal
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
