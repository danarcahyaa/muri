"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Coins,
  Gift,
  LoaderCircle,
  MapPin,
  Package,
  RefreshCw,
  ShoppingBag,
  UserRound,
} from "lucide-react";

import { formatIdr } from "@/lib/product-detail";
import {
  getCheckoutPreparationErrorMessage,
  getCustomerCheckoutData,
  getProductPurchaseErrorMessage,
  purchaseCustomerProduct,
} from "@/services/customer";
import type {
  CustomerCheckoutData,
  PurchaseCustomerProductResult,
} from "@/types/customerCheckout";

interface CustomerProductCheckoutProps {
  sku: string;
  requestedQuantity: number;
}

type CheckoutStep =
  | "form"
  | "review"
  | "success";

export default function CustomerProductCheckout({
  sku,
  requestedQuantity,
}: CustomerProductCheckoutProps) {
  const router = useRouter();

  const [checkout, setCheckout] =
    useState<CustomerCheckoutData | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [loadError, setLoadError] =
    useState<string | null>(null);

  const [submitError, setSubmitError] =
    useState<string | null>(null);

  const [step, setStep] =
    useState<CheckoutStep>("form");

  const [receiverName, setReceiverName] =
    useState("");

  const [phoneNumber, setPhoneNumber] =
    useState("");

  const [
    shippingAddress,
    setShippingAddress,
  ] = useState("");

  const [claimBonus, setClaimBonus] =
    useState(false);

  const [purchaseResult, setPurchaseResult] =
    useState<PurchaseCustomerProductResult | null>(
      null,
    );

  const checkoutPath =
    `/produk/${encodeURIComponent(
      sku,
    )}/checkout?quantity=${requestedQuantity}`;

  const loadCheckout =
    useCallback(async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const result =
          await getCustomerCheckoutData({
            sku,
            quantity: requestedQuantity,
          });

        if (!result.success || !result.data) {
          const errorCode = String(
            result.error ?? "",
          );

          if (
            errorCode.includes(
              "UNAUTHENTICATED",
            )
          ) {
            router.replace(
              `/auth/login?redirect=${encodeURIComponent(
                checkoutPath,
              )}`,
            );

            return;
          }

          setLoadError(
            getCheckoutPreparationErrorMessage(
              result.error,
            ),
          );

          return;
        }

        const data = result.data;

        setCheckout(data);
        setReceiverName(
          data.profile.fullName,
        );
        setPhoneNumber(
          data.profile.phoneNumber ?? "",
        );
        setShippingAddress(
          data.profile.shippingAddress ?? "",
        );

        setClaimBonus(false);
        setStep("form");
      } catch {
        setLoadError(
          "Data checkout belum dapat dimuat.",
        );
      } finally {
        setIsLoading(false);
      }
    }, [
      checkoutPath,
      requestedQuantity,
      router,
      sku,
    ]);

  useEffect(() => {
    void loadCheckout();
  }, [loadCheckout]);

  function handleReview() {
    setSubmitError(null);

    const normalizedName =
      receiverName.trim();

    const normalizedPhone =
      phoneNumber.trim();

    const normalizedAddress =
      shippingAddress.trim();

    if (normalizedName.length < 2) {
      setSubmitError(
        "Nama penerima minimal 2 karakter.",
      );

      return;
    }

    if (normalizedName.length > 120) {
      setSubmitError(
        "Nama penerima terlalu panjang.",
      );

      return;
    }

    if (normalizedPhone.length > 30) {
      setSubmitError(
        "Nomor telepon terlalu panjang.",
      );

      return;
    }

    if (normalizedAddress.length < 10) {
      setSubmitError(
        "Alamat pengiriman minimal 10 karakter.",
      );

      return;
    }

    if (normalizedAddress.length > 1000) {
      setSubmitError(
        "Alamat pengiriman terlalu panjang.",
      );

      return;
    }

    setReceiverName(normalizedName);
    setPhoneNumber(normalizedPhone);
    setShippingAddress(
      normalizedAddress,
    );

    setStep("review");
  }

  async function handlePurchase() {
    if (!checkout || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result =
        await purchaseCustomerProduct({
          productId:
            checkout.product.id,

          quantity:
            checkout.quantity,

          receiverName,
          phoneNumber,
          shippingAddress,

          claimBonus:
            claimBonus &&
            Boolean(
              checkout.bonus?.canClaim,
            ),
        });

      if (!result.success || !result.data) {
        setSubmitError(
          getProductPurchaseErrorMessage(
            result.error,
          ),
        );

        return;
      }

      setPurchaseResult(result.data);
      setStep("success");

      router.refresh();
    } catch {
      setSubmitError(
        "Pembelian belum dapat diproses. Silakan coba kembali.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <CheckoutLoading />;
  }

  if (loadError || !checkout) {
    return (
      <CheckoutLoadError
        message={
          loadError ??
          "Data checkout tidak tersedia."
        }
        onRetry={loadCheckout}
      />
    );
  }

  if (
    step === "success" &&
    purchaseResult
  ) {
    return (
      <CheckoutSuccess
        result={purchaseResult}
      />
    );
  }

  return (
    <div
      className="
        grid gap-8
        lg:grid-cols-[minmax(0,1fr)_390px]
        lg:items-start
      "
    >
      <section className="rounded-3xl border border-line-trace bg-canvas-pure p-6 sm:p-8">
        {step === "form" ? (
          <>
            <div className="flex items-center gap-3 text-brand-emerald">
              <UserRound
                className="size-4"
                strokeWidth={2}
              />

              <p className="text-xs font-bold uppercase">
                Informasi Pengiriman
              </p>
            </div>

            <h1 className="mt-5 font-display text-4xl font-medium tracking-[-0.045em] text-brand-black sm:text-5xl">
              Selesaikan Pesanan
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-6 text-muted-moss">
              Pastikan nama penerima, nomor
              telepon, dan alamat pengiriman
              sudah benar.
            </p>

            <div className="mt-8 space-y-5">
              <CheckoutField
                label="Nama Penerima"
                value={receiverName}
                onChange={
                  setReceiverName
                }
                placeholder="Nama lengkap penerima"
                maxLength={120}
                required
              />

              <CheckoutField
                label="Nomor Telepon"
                value={phoneNumber}
                onChange={
                  setPhoneNumber
                }
                placeholder="Contoh: 081234567890"
                maxLength={30}
                type="tel"
              />

              <div>
                <label
                  htmlFor="shipping-address"
                  className="text-xs font-bold text-brand-black"
                >
                  Alamat Pengiriman
                </label>

                <textarea
                  id="shipping-address"
                  value={shippingAddress}
                  onChange={(event) => {
                    setShippingAddress(
                      event.target.value,
                    );
                  }}
                  rows={5}
                  maxLength={1000}
                  placeholder="Masukkan alamat lengkap pengiriman"
                  className="
                    mt-3 w-full resize-none
                    rounded-xl border
                    border-line-trace
                    bg-canvas-pure
                    px-4 py-3
                    text-sm text-brand-black
                    outline-none transition
                    placeholder:text-muted-moss/60
                    focus:border-brand-emerald
                    focus:ring-2
                    focus:ring-brand-emerald/10
                  "
                />

                <p className="mt-2 text-[10px] text-muted-moss">
                  Minimal 10 karakter.
                </p>
              </div>
            </div>

            {checkout.bonus && (
              <BonusClaimOption
                checkout={checkout}
                claimBonus={claimBonus}
                onChange={
                  setClaimBonus
                }
              />
            )}

            {submitError && (
              <CheckoutErrorMessage
                message={submitError}
              />
            )}

            <button
              type="button"
              onClick={handleReview}
              className="
                group mt-8 flex w-full
                items-center justify-center
                gap-3 rounded-md
                bg-brand-forest
                px-6 py-4
                text-xs font-bold
                text-white transition
                hover:bg-brand-black
              "
            >
              Review Pesanan

              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </button>
          </>
        ) : (
          <CheckoutReview
            checkout={checkout}
            receiverName={
              receiverName
            }
            phoneNumber={
              phoneNumber
            }
            shippingAddress={
              shippingAddress
            }
            claimBonus={
              claimBonus
            }
            isSubmitting={
              isSubmitting
            }
            errorMessage={
              submitError
            }
            onBack={() => {
              setSubmitError(null);
              setStep("form");
            }}
            onConfirm={() => {
              void handlePurchase();
            }}
          />
        )}
      </section>

      <CheckoutOrderSummary
        checkout={checkout}
        claimBonus={claimBonus}
      />
    </div>
  );
}

function CheckoutField({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  maxLength: number;
  type?: "text" | "tel";
  required?: boolean;
}) {
  const id = label
    .toLowerCase()
    .replaceAll(" ", "-");

  return (
    <div>
      <label
        htmlFor={id}
        className="text-xs font-bold text-brand-black"
      >
        {label}

        {required && (
          <span className="text-red-600">
            {" "}
            *
          </span>
        )}
      </label>

      <input
        id={id}
        type={type}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(event) => {
          onChange(event.target.value);
        }}
        className="
          mt-3 w-full rounded-xl
          border border-line-trace
          bg-canvas-pure px-4 py-3
          text-sm text-brand-black
          outline-none transition
          placeholder:text-muted-moss/60
          focus:border-brand-emerald
          focus:ring-2
          focus:ring-brand-emerald/10
        "
      />
    </div>
  );
}

function BonusClaimOption({
  checkout,
  claimBonus,
  onChange,
}: {
  checkout: CustomerCheckoutData;
  claimBonus: boolean;
  onChange: (value: boolean) => void;
}) {
  const bonus = checkout.bonus;

  if (!bonus) {
    return null;
  }

  return (
    <div className="mt-8 rounded-2xl border border-brand-lime bg-brand-lime/15 p-5">
      <div className="flex items-start gap-4">
        <Gift className="mt-1 size-5 shrink-0 text-brand-emerald" />

        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase text-brand-emerald">
            Bonus Produk
          </p>

          <p className="mt-2 text-sm font-bold text-brand-black">
            {bonus.totalQuantity}×{" "}
            {bonus.productName}
          </p>

          <p className="mt-2 text-xs leading-5 text-muted-moss">
            Membutuhkan{" "}
            {bonus.totalCoinCost} coin.
            Saldo Anda{" "}
            {checkout.profile.totalPoints} coin.
          </p>

          {!bonus.hasEnoughStock && (
            <p className="mt-3 text-xs font-medium text-red-700">
              Stok produk bonus tidak
              mencukupi.
            </p>
          )}

          {bonus.hasEnoughStock &&
            !bonus.hasEnoughPoints && (
              <p className="mt-3 text-xs font-medium text-red-700">
                Coin Anda belum
                mencukupi.
              </p>
            )}

          <label
            className={`
              mt-5 flex items-center gap-3
              rounded-xl border
              px-4 py-3
              ${
                bonus.canClaim
                  ? `
                      cursor-pointer
                      border-line-trace
                      bg-canvas-pure
                    `
                  : `
                      cursor-not-allowed
                      border-line-trace
                      bg-canvas-warm
                      opacity-60
                    `
              }
            `}
          >
            <input
              type="checkbox"
              checked={
                claimBonus &&
                bonus.canClaim
              }
              disabled={
                !bonus.canClaim
              }
              onChange={(event) => {
                onChange(
                  event.target.checked,
                );
              }}
              className="size-4 accent-brand-forest"
            />

            <span className="text-xs font-bold text-brand-black">
              Klaim bonus dengan coin
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}

function CheckoutReview({
  checkout,
  receiverName,
  phoneNumber,
  shippingAddress,
  claimBonus,
  isSubmitting,
  errorMessage,
  onBack,
  onConfirm,
}: {
  checkout: CustomerCheckoutData;
  receiverName: string;
  phoneNumber: string;
  shippingAddress: string;
  claimBonus: boolean;
  isSubmitting: boolean;
  errorMessage: string | null;
  onBack: () => void;
  onConfirm: () => void;
}) {
  return (
    <>
      <div className="flex items-center gap-3 text-brand-emerald">
        <CheckCircle2
          className="size-4"
          strokeWidth={2}
        />

        <p className="text-xs font-bold uppercase">
          Konfirmasi Pesanan
        </p>
      </div>

      <h1 className="mt-5 font-display text-4xl font-medium tracking-[-0.045em] text-brand-black sm:text-5xl">
        Periksa Kembali
      </h1>

      <p className="mt-4 text-sm leading-6 text-muted-moss">
        Pembelian akan langsung membuat
        pesanan dan mengurangi stok produk.
      </p>

      <div className="mt-8 space-y-4">
        <ReviewFact
          icon={UserRound}
          label="Penerima"
          value={receiverName}
        />

        <ReviewFact
          icon={MapPin}
          label="Pengiriman"
          value={`${phoneNumber || "Tanpa nomor telepon"} — ${shippingAddress}`}
        />

        <ReviewFact
          icon={Package}
          label="Produk"
          value={`${checkout.quantity}× ${checkout.product.name}`}
        />

        {claimBonus &&
          checkout.bonus && (
            <ReviewFact
              icon={Gift}
              label="Bonus"
              value={`${checkout.bonus.totalQuantity}× ${checkout.bonus.productName} menggunakan ${checkout.bonus.totalCoinCost} coin`}
            />
          )}
      </div>

      {errorMessage && (
        <CheckoutErrorMessage
          message={errorMessage}
        />
      )}

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onBack}
          className="
            flex items-center
            justify-center gap-2
            rounded-md border
            border-line-trace
            px-6 py-4
            text-xs font-bold
            text-brand-black
            transition
            hover:border-brand-forest
            disabled:opacity-50
          "
        >
          <ArrowLeft className="size-4" />
          Ubah Data
        </button>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={onConfirm}
          className="
            flex items-center
            justify-center gap-2
            rounded-md
            bg-brand-forest
            px-6 py-4
            text-xs font-bold
            text-white transition
            hover:bg-brand-black
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          {isSubmitting ? (
            <>
              <LoaderCircle className="size-4 animate-spin" />
              Memproses...
            </>
          ) : (
            <>
              Konfirmasi Beli
              <ShoppingBag className="size-4" />
            </>
          )}
        </button>
      </div>
    </>
  );
}

function ReviewFact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UserRound;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-canvas-warm p-5">
      <div className="flex items-center gap-2 text-muted-moss">
        <Icon className="size-4" />

        <span className="text-[10px] font-medium uppercase">
          {label}
        </span>
      </div>

      <p className="mt-3 text-sm font-medium leading-6 text-brand-black">
        {value}
      </p>
    </div>
  );
}

function CheckoutOrderSummary({
  checkout,
  claimBonus,
}: {
  checkout: CustomerCheckoutData;
  claimBonus: boolean;
}) {
  return (
    <aside className="self-start rounded-2xl border border-line-trace bg-canvas-pure p-6 lg:sticky lg:top-24">
      <div className="flex items-center gap-3 text-brand-emerald">
        <ShoppingBag className="size-4" />

        <h2 className="text-xs font-bold uppercase">
          Ringkasan Pesanan
        </h2>
      </div>

      <div className="mt-7 rounded-xl bg-canvas-warm p-5">
        <p className="text-sm font-bold text-brand-black">
          {checkout.product.name}
        </p>

        <p className="mt-2 text-xs text-muted-moss">
          {checkout.product.brandName} ·{" "}
          {checkout.product.categoryName}
        </p>

        <div className="mt-5 flex items-center justify-between border-t border-line-trace pt-4 text-xs">
          <span className="text-muted-moss">
            Jumlah
          </span>

          <span className="font-bold text-brand-black">
            {checkout.quantity}
          </span>
        </div>
      </div>

      <div className="mt-5 rounded-xl bg-brand-lime p-6 text-brand-forest">
        <p className="text-[10px] uppercase opacity-70">
          Total Pembayaran
        </p>

        <p className="mt-7 font-display text-4xl font-medium tracking-[-0.05em]">
          {formatIdr(
            checkout.totalPriceIdr,
          )}
        </p>
      </div>

      <div className="mt-5 space-y-3 text-xs">
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-moss">
            Saldo coin
          </span>

          <span className="font-bold text-brand-black">
            {checkout.profile.totalPoints}
          </span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-moss">
            Coin digunakan
          </span>

          <span className="font-bold text-brand-black">
            {claimBonus
              ? checkout.bonus
                  ?.totalCoinCost ?? 0
              : 0}
          </span>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-line-trace pt-3">
          <span className="text-muted-moss">
            Sisa coin
          </span>

          <span className="font-bold text-brand-forest">
            {Math.max(
              0,
              checkout.profile.totalPoints -
                (claimBonus
                  ? checkout.bonus
                      ?.totalCoinCost ?? 0
                  : 0),
            )}
          </span>
        </div>
      </div>
    </aside>
  );
}

function CheckoutSuccess({
  result,
}: {
  result: PurchaseCustomerProductResult;
}) {
  const orderCode = result.orderId
    .replaceAll("-", "")
    .slice(0, 8)
    .toUpperCase();

  return (
    <section className="mx-auto max-w-2xl rounded-3xl border border-line-trace bg-canvas-pure px-6 py-14 text-center sm:px-10">
      <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-brand-lime text-brand-forest">
        <CheckCircle2 className="size-7" />
      </div>

      <p className="mt-7 text-xs font-bold uppercase text-brand-emerald">
        Pesanan Berhasil Dibuat
      </p>

      <h1 className="mt-4 font-display text-4xl font-medium tracking-[-0.045em] text-brand-black sm:text-5xl">
        Terima Kasih
      </h1>

      <p className="mt-5 text-sm leading-6 text-muted-moss">
        Pesanan{" "}
        <strong className="text-brand-black">
          ORD-{orderCode}
        </strong>{" "}
        berhasil dibuat dengan status
        menunggu proses.
      </p>

      <div className="mt-8 rounded-2xl bg-canvas-warm p-6">
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="text-muted-moss">
            Total pembayaran
          </span>

          <span className="font-bold text-brand-black">
            {formatIdr(
              result.totalPriceIdr,
            )}
          </span>
        </div>

        {result.totalCoinsRedeemed >
          0 && (
          <div className="mt-4 flex items-center justify-between gap-4 border-t border-line-trace pt-4 text-sm">
            <span className="flex items-center gap-2 text-muted-moss">
              <Coins className="size-4" />
              Coin digunakan
            </span>

            <span className="font-bold text-brand-black">
              {
                result.totalCoinsRedeemed
              }
            </span>
          </div>
        )}
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <Link
          href="/produk"
          className="flex items-center justify-center gap-2 rounded-md border border-line-trace px-6 py-4 text-xs font-bold text-brand-black transition hover:border-brand-forest"
        >
          Belanja Lagi
        </Link>

        <Link
          href="/dashboard/orders"
          className="flex items-center justify-center gap-2 rounded-md bg-brand-forest px-6 py-4 text-xs font-bold text-white transition hover:bg-brand-black"
        >
          Lihat Pesanan
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}

function CheckoutErrorMessage({
  message,
}: {
  message: string;
}) {
  return (
    <div
      role="alert"
      className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700"
    >
      {message}
    </div>
  );
}

function CheckoutLoading() {
  return (
    <div className="flex min-h-[480px] items-center justify-center rounded-3xl border border-line-trace bg-canvas-pure">
      <div className="text-center">
        <LoaderCircle className="mx-auto size-8 animate-spin text-brand-emerald" />

        <p className="mt-4 text-xs text-muted-moss">
          Menyiapkan checkout...
        </p>
      </div>
    </div>
  );
}

function CheckoutLoadError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => Promise<void>;
}) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-line-trace bg-canvas-pure px-6 text-center">
      <RefreshCw className="size-9 text-muted-moss/50" />

      <h1 className="mt-5 font-display text-3xl font-medium text-brand-black">
        Checkout tidak tersedia
      </h1>

      <p className="mt-3 text-xs text-muted-moss">
        {message}
      </p>

      <button
        type="button"
        onClick={() => {
          void onRetry();
        }}
        className="mt-6 rounded-md bg-brand-forest px-5 py-3 text-xs font-bold text-white"
      >
        Coba Lagi
      </button>
    </div>
  );
}