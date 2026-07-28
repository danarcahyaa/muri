/* eslint-disable @next/next/no-img-element */

"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  CalendarDays,
  CheckCircle2,
  FileImage,
  LoaderCircle,
  MapPin,
  Package,
  Phone,
  RefreshCw,
  ShieldCheck,
  X,
  XCircle,
} from "lucide-react";

import {
  getBrandPaymentProofSignedUrl,
  getBrandPaymentVerificationErrorMessage,
  getBrandQrisVerificationQueue,
  verifyBrandQrisPayment,
} from "@/services/brand";
import type {
  BrandPaymentVerificationDecision,
  BrandQrisVerificationQueueItem,
} from "@/types/brandPaymentVerification";

export default function BrandQrisVerificationSection() {
  const [queue, setQueue] = useState<
    BrandQrisVerificationQueueItem[]
  >([]);

  const [selectedOrder, setSelectedOrder] =
    useState<BrandQrisVerificationQueueItem | null>(
      null,
    );

  const [signedProofUrl, setSignedProofUrl] =
    useState<string | null>(null);

  const [verificationNote, setVerificationNote] =
    useState("");

  const [reviewConfirmed, setReviewConfirmed] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isProofLoading, setIsProofLoading] =
    useState(false);

  const [isVerifying, setIsVerifying] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [modalError, setModalError] =
    useState<string | null>(null);

  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);

  const loadQueue =
    useCallback(async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const result =
          await getBrandQrisVerificationQueue(
            50,
          );

        if (
          !result.success ||
          !result.data
        ) {
          setQueue([]);

          setErrorMessage(
            getBrandPaymentVerificationErrorMessage(
              result.error,
            ),
          );

          return;
        }

        setQueue(result.data);
      } catch (error) {
        console.error(
          "[BrandQrisVerificationSection] Queue error:",
          error,
        );

        setQueue([]);

        setErrorMessage(
          "Antrean verifikasi belum dapat dimuat.",
        );
      } finally {
        setIsLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadQueue();
  }, [loadQueue]);

  useEffect(() => {
    if (!selectedOrder) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [selectedOrder]);

  async function openVerification(
    order: BrandQrisVerificationQueueItem,
  ) {
    setSelectedOrder(order);
    setSignedProofUrl(null);
    setVerificationNote("");
    setReviewConfirmed(false);
    setModalError(null);
    setSuccessMessage(null);

    if (!order.proofPath) {
      setModalError(
        "Path bukti pembayaran tidak tersedia.",
      );

      return;
    }

    setIsProofLoading(true);

    try {
      const result =
        await getBrandPaymentProofSignedUrl(
          order.proofPath,
        );

      if (
        !result.success ||
        !result.data
      ) {
        setModalError(
          getBrandPaymentVerificationErrorMessage(
            result.error,
          ),
        );

        return;
      }

      setSignedProofUrl(
        result.data.signedUrl,
      );
    } finally {
      setIsProofLoading(false);
    }
  }

  function closeModal() {
    if (isVerifying) {
      return;
    }

    setSelectedOrder(null);
    setSignedProofUrl(null);
    setVerificationNote("");
    setReviewConfirmed(false);
    setModalError(null);
  }

  async function handleDecision(
    decision: BrandPaymentVerificationDecision,
  ) {
    if (
      !selectedOrder ||
      isVerifying
    ) {
      return;
    }

    setModalError(null);

    const normalizedNote =
      verificationNote.trim();

    if (
      decision === "approve" &&
      !reviewConfirmed
    ) {
      setModalError(
        "Centang konfirmasi bahwa bukti dan nominal sudah diperiksa.",
      );

      return;
    }

    if (
      decision === "reject" &&
      normalizedNote.length < 5
    ) {
      setModalError(
        "Tuliskan alasan penolakan minimal 5 karakter.",
      );

      return;
    }

    setIsVerifying(true);

    try {
      const result =
        await verifyBrandQrisPayment({
          orderId:
            selectedOrder.orderId,

          decision,

          note:
            normalizedNote || undefined,
        });

      if (
        !result.success ||
        !result.data
      ) {
        setModalError(
          getBrandPaymentVerificationErrorMessage(
            result.error,
          ),
        );

        return;
      }

      setSuccessMessage(
        decision === "approve"
          ? "Pembayaran berhasil disetujui."
          : "Pembayaran ditolak dan stok telah dikembalikan.",
      );

      setSelectedOrder(null);
      setSignedProofUrl(null);

      await loadQueue();
    } catch (error) {
      console.error(
        "[BrandQrisVerificationSection] Verification error:",
        error,
      );

      setModalError(
        "Keputusan verifikasi belum dapat disimpan.",
      );
    } finally {
      setIsVerifying(false);
    }
  }

  if (isLoading) {
    return <VerificationQueueSkeleton />;
  }

  return (
    <>
      <section className="mt-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-brand-emerald">
              Pembayaran QRIS
            </p>

            <h1 className="mt-3 font-display text-4xl font-medium tracking-[-0.045em] text-brand-black sm:text-5xl">
              Verifikasi Pembayaran
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-moss">
              Periksa bukti dan nominal
              pembayaran customer sebelum
              menerima pesanan.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              void loadQueue();
            }}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-line-trace px-5 py-3 text-xs font-bold text-brand-black transition hover:border-brand-forest"
          >
            <RefreshCw className="size-4" />
            Muat Ulang
          </button>
        </div>

        {successMessage && (
          <div
            role="status"
            className="mt-6 rounded-xl border border-brand-lime bg-brand-lime/15 px-5 py-4 text-xs font-medium text-brand-forest"
          >
            {successMessage}
          </div>
        )}

        {errorMessage ? (
          <VerificationQueueError
            message={errorMessage}
            onRetry={loadQueue}
          />
        ) : queue.length === 0 ? (
          <EmptyVerificationQueue />
        ) : (
          <div className="mt-8 space-y-5">
            {queue.map((order) => (
              <VerificationQueueCard
                key={order.orderId}
                order={order}
                onOpen={() => {
                  void openVerification(
                    order,
                  );
                }}
              />
            ))}
          </div>
        )}
      </section>

      {selectedOrder && (
        <VerificationModal
          order={selectedOrder}
          signedProofUrl={
            signedProofUrl
          }
          verificationNote={
            verificationNote
          }
          reviewConfirmed={
            reviewConfirmed
          }
          isProofLoading={
            isProofLoading
          }
          isVerifying={
            isVerifying
          }
          errorMessage={
            modalError
          }
          onNoteChange={
            setVerificationNote
          }
          onReviewConfirmedChange={
            setReviewConfirmed
          }
          onClose={
            closeModal
          }
          onApprove={() => {
            void handleDecision(
              "approve",
            );
          }}
          onReject={() => {
            void handleDecision(
              "reject",
            );
          }}
        />
      )}
    </>
  );
}

function VerificationQueueCard({
  order,
  onOpen,
}: {
  order: BrandQrisVerificationQueueItem;
  onOpen: () => void;
}) {
  const mainItems =
    order.items.filter(
      (item) => !item.isBonus,
    );

  const bonusItems =
    order.items.filter(
      (item) => item.isBonus,
    );

  return (
    <article className="overflow-hidden rounded-3xl border border-line-trace bg-canvas-pure">
      <header className="border-b border-line-trace px-6 py-6 sm:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="font-display text-xl font-medium text-brand-black">
                {formatOrderCode(
                  order.orderId,
                )}
              </p>

              <span className="rounded-full bg-blue-100 px-3 py-2 text-[9px] font-bold uppercase text-blue-800">
                Menunggu Verifikasi
              </span>
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs text-muted-moss">
              <CalendarDays className="size-4" />

              <span>
                Dikirim{" "}
                {formatDateTime(
                  order.submittedAt,
                )}
              </span>
            </div>
          </div>

          <div className="sm:text-right">
            <p className="text-[9px] font-bold uppercase text-muted-moss">
              Nominal QRIS
            </p>

            <p className="mt-2 font-display text-2xl font-medium text-brand-black">
              {formatIdr(
                order.amountIdr,
              )}
            </p>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_330px]">
        <div className="border-b border-line-trace p-6 sm:p-8 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-3">
            <Package className="size-4 text-brand-emerald" />

            <h2 className="text-xs font-bold uppercase text-brand-black">
              Produk Pesanan
            </h2>
          </div>

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
                  {formatIdr(
                    item.priceIdr *
                      item.quantity,
                  )}
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
        </div>

        <aside className="p-6 sm:p-8">
          <VerificationFact
            icon={Package}
            label="Penerima"
            value={
              order.receiverName
            }
          />

          <VerificationFact
            icon={Phone}
            label="Nomor Telepon"
            value={
              order.phoneNumber ||
              "Belum tersedia"
            }
          />

          <VerificationFact
            icon={MapPin}
            label="Alamat"
            value={
              order.shippingAddress
            }
          />

          <button
            type="button"
            disabled={!order.proofPath}
            onClick={onOpen}
            className="mt-7 flex w-full items-center justify-center gap-2 rounded-md bg-brand-forest px-5 py-3.5 text-xs font-bold text-white transition hover:bg-brand-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FileImage className="size-4" />
            Periksa Bukti
          </button>
        </aside>
      </div>
    </article>
  );
}

function VerificationModal({
  order,
  signedProofUrl,
  verificationNote,
  reviewConfirmed,
  isProofLoading,
  isVerifying,
  errorMessage,
  onNoteChange,
  onReviewConfirmedChange,
  onClose,
  onApprove,
  onReject,
}: {
  order: BrandQrisVerificationQueueItem;
  signedProofUrl: string | null;
  verificationNote: string;
  reviewConfirmed: boolean;
  isProofLoading: boolean;
  isVerifying: boolean;
  errorMessage: string | null;
  onNoteChange: (value: string) => void;
  onReviewConfirmedChange: (
    value: boolean,
  ) => void;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-brand-black/70 px-4 py-8 backdrop-blur-sm">
      <div className="max-h-full w-full max-w-5xl overflow-y-auto rounded-3xl bg-canvas-pure shadow-2xl">
        <header className="sticky top-0 z-10 flex items-start justify-between gap-5 border-b border-line-trace bg-canvas-pure px-6 py-6 sm:px-8">
          <div>
            <p className="text-xs font-bold uppercase text-brand-emerald">
              Verifikasi QRIS
            </p>

            <h2 className="mt-2 font-display text-3xl font-medium text-brand-black">
              {formatOrderCode(
                order.orderId,
              )}
            </h2>
          </div>

          <button
            type="button"
            disabled={isVerifying}
            onClick={onClose}
            className="flex size-10 items-center justify-center rounded-full bg-canvas-warm text-brand-black"
          >
            <X className="size-4" />
          </button>
        </header>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_380px]">
          <main className="border-b border-line-trace p-6 sm:p-8 lg:border-b-0 lg:border-r">
            <p className="text-xs font-bold uppercase text-brand-black">
              Bukti Pembayaran
            </p>

            {isProofLoading ? (
              <div className="mt-5 flex min-h-96 items-center justify-center rounded-2xl bg-canvas-warm">
                <LoaderCircle className="size-8 animate-spin text-brand-emerald" />
              </div>
            ) : signedProofUrl ? (
              <div className="mt-5 rounded-2xl border border-line-trace bg-white p-4">
                <img
                  src={signedProofUrl}
                  alt="Bukti pembayaran QRIS customer"
                  className="mx-auto max-h-[650px] w-full object-contain"
                />
              </div>
            ) : (
              <div className="mt-5 flex min-h-80 items-center justify-center rounded-2xl bg-red-50 px-6 text-center">
                <p className="text-xs text-red-700">
                  Bukti pembayaran belum dapat ditampilkan.
                </p>
              </div>
            )}
          </main>

          <aside className="p-6 sm:p-8">
            <div className="rounded-2xl bg-brand-lime p-5 text-brand-forest">
              <p className="text-[9px] font-bold uppercase opacity-65">
                Nominal yang harus cocok
              </p>

              <p className="mt-4 font-display text-3xl font-medium">
                {formatIdr(
                  order.amountIdr,
                )}
              </p>
            </div>

            <div className="mt-6">
              <p className="text-[10px] font-bold uppercase text-muted-moss">
                Customer
              </p>

              <p className="mt-2 text-sm font-bold text-brand-black">
                {order.receiverName}
              </p>

              <p className="mt-1 text-xs text-muted-moss">
                {order.phoneNumber ||
                  "Nomor telepon tidak tersedia"}
              </p>
            </div>

            <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-line-trace p-4">
              <input
                type="checkbox"
                checked={
                  reviewConfirmed
                }
                disabled={
                  isVerifying
                }
                onChange={(event) => {
                  onReviewConfirmedChange(
                    event.target.checked,
                  );
                }}
                className="mt-0.5 size-4 accent-brand-forest"
              />

              <span className="text-xs leading-5 text-brand-black">
                Saya sudah memeriksa nama,
                nominal, dan bukti pembayaran.
              </span>
            </label>

            <div className="mt-6">
              <label
                htmlFor="verification-note"
                className="text-xs font-bold text-brand-black"
              >
                Catatan Verifikasi
              </label>

              <textarea
                id="verification-note"
                value={
                  verificationNote
                }
                disabled={
                  isVerifying
                }
                maxLength={1000}
                rows={5}
                placeholder="Opsional untuk persetujuan, wajib untuk penolakan."
                onChange={(event) => {
                  onNoteChange(
                    event.target.value,
                  );
                }}
                className="mt-3 w-full resize-none rounded-xl border border-line-trace bg-canvas-pure px-4 py-3 text-sm text-brand-black outline-none focus:border-brand-emerald"
              />

              <p className="mt-2 text-right text-[9px] text-muted-moss">
                {
                  verificationNote.length
                }
                /1000
              </p>
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700"
              >
                {errorMessage}
              </div>
            )}

            <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <button
                type="button"
                disabled={
                  isVerifying ||
                  !signedProofUrl ||
                  !reviewConfirmed
                }
                onClick={onApprove}
                className="flex items-center justify-center gap-2 rounded-md bg-brand-forest px-5 py-4 text-xs font-bold text-white transition hover:bg-brand-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isVerifying ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="size-4" />
                )}

                Terima Pembayaran
              </button>

              <button
                type="button"
                disabled={
                  isVerifying ||
                  verificationNote.trim()
                    .length < 5
                }
                onClick={onReject}
                className="flex items-center justify-center gap-2 rounded-md border border-red-200 bg-red-50 px-5 py-4 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <XCircle className="size-4" />
                Tolak Pembayaran
              </button>
            </div>

            <div className="mt-5 flex gap-3 rounded-xl bg-canvas-warm p-4">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-emerald" />

              <p className="text-[10px] leading-5 text-muted-moss">
                Persetujuan membuat pembayaran
                berstatus paid. Penolakan
                mengembalikan seluruh stok pesanan.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function VerificationFact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Package;
  label: string;
  value: string;
}) {
  return (
    <div className="mb-5 flex items-start gap-3 last:mb-0">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-canvas-warm text-muted-moss">
        <Icon className="size-4" />
      </div>

      <div className="min-w-0">
        <p className="text-[9px] font-bold uppercase text-muted-moss">
          {label}
        </p>

        <p className="mt-1 break-words text-xs font-medium leading-5 text-brand-black">
          {value}
        </p>
      </div>
    </div>
  );
}

function VerificationQueueSkeleton() {
  return (
    <section className="mt-8 space-y-5">
      {[0, 1].map((item) => (
        <div
          key={item}
          className="min-h-96 animate-pulse rounded-3xl border border-line-trace bg-canvas-warm"
        />
      ))}
    </section>
  );
}

function VerificationQueueError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => Promise<void>;
}) {
  return (
    <div className="mt-8 flex min-h-72 flex-col items-center justify-center rounded-3xl border border-line-trace bg-canvas-pure px-6 text-center">
      <RefreshCw className="size-9 text-muted-moss/50" />

      <p className="mt-4 text-sm font-bold text-brand-black">
        Antrean gagal dimuat
      </p>

      <p className="mt-2 text-xs text-muted-moss">
        {message}
      </p>

      <button
        type="button"
        onClick={() => {
          void onRetry();
        }}
        className="mt-5 rounded-md bg-brand-forest px-5 py-3 text-xs font-bold text-white"
      >
        Coba Lagi
      </button>
    </div>
  );
}

function EmptyVerificationQueue() {
  return (
    <div className="mt-8 flex min-h-72 flex-col items-center justify-center rounded-3xl border border-line-trace bg-canvas-pure px-6 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-lime/40 text-brand-forest">
        <CheckCircle2 className="size-6" />
      </div>

      <p className="mt-5 font-display text-2xl font-medium text-brand-black">
        Tidak ada pembayaran menunggu
      </p>

      <p className="mt-2 text-xs text-muted-moss">
        Seluruh bukti pembayaran sudah diproses.
      </p>
    </div>
  );
}

function formatOrderCode(
  orderId: string,
): string {
  const shortId = orderId
    .replaceAll("-", "")
    .slice(0, 8)
    .toUpperCase();

  return `ORD-${shortId}`;
}

function formatIdr(
  value: number,
): string {
  return new Intl.NumberFormat(
    "id-ID",
    {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    },
  ).format(value);
}

function formatDateTime(
  value: string | null,
): string {
  if (!value) {
    return "Waktu tidak tersedia";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Waktu tidak tersedia";
  }

  return new Intl.DateTimeFormat(
    "id-ID",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(date);
}