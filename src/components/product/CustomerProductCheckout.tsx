"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Coins,
  Gift,
  LoaderCircle,
  MapPin,
  Package,
  QrCode,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react";

import { formatCoin, formatIdr } from "@/lib/product-detail";
import {
  createCustomerCheckoutOrder,
  getCustomerCheckoutPreview,
  getSecureCheckoutErrorMessage,
} from "@/services/customer";
import type {
  CreateCustomerCheckoutOrderResult,
  CustomerCheckoutPaymentMethod,
  CustomerCheckoutPreview,
} from "@/types/customerCheckout";

interface CustomerProductCheckoutProps {
  sku: string;
  requestedQuantity: number;
}

type CheckoutStep = "form" | "review" | "success";

export default function CustomerProductCheckout({
  sku,
  requestedQuantity,
}: CustomerProductCheckoutProps) {
  const router = useRouter();

  const checkoutTokenRef = useRef<string | null>(null);

  const [checkout, setCheckout] = useState<CustomerCheckoutPreview | null>(
    null,
  );

  const [step, setStep] = useState<CheckoutStep>("form");

  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<CustomerCheckoutPaymentMethod | null>(null);

  const [receiverName, setReceiverName] = useState("");

  const [phoneNumber, setPhoneNumber] = useState("");

  const [shippingAddress, setShippingAddress] = useState("");

  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  const [confirmationAccepted, setConfirmationAccepted] = useState(false);

  const [purchaseResult, setPurchaseResult] =
    useState<CreateCustomerCheckoutOrderResult | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [loadError, setLoadError] = useState<string | null>(null);

  const [formError, setFormError] = useState<string | null>(null);

  const checkoutPath = `/produk/${encodeURIComponent(
    sku,
  )}/checkout?quantity=${requestedQuantity}`;

  const loadCheckout = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    const result = await getCustomerCheckoutPreview({
      sku,
      quantity: requestedQuantity,
    });

    if (!result.success || !result.data) {
      const errorCode = String(result.error ?? "");

      if (errorCode.includes("UNAUTHENTICATED")) {
        router.replace(
          `/auth/login?redirect=${encodeURIComponent(checkoutPath)}`,
        );

        return;
      }

      setLoadError(getSecureCheckoutErrorMessage(result.error));

      setIsLoading(false);
      return;
    }

    const data = result.data;

    setCheckout(data);

    setReceiverName(data.profile.fullName);

    setPhoneNumber(data.profile.phoneNumber ?? "");

    setShippingAddress(data.profile.shippingAddress ?? "");

    setSelectedPaymentMethod(data.availablePaymentMethods[0] ?? null);

    setStep("form");
    setIsLoading(false);
  }, [checkoutPath, requestedQuantity, router, sku]);

  useEffect(() => {
    void loadCheckout();
  }, [loadCheckout]);

  useEffect(() => {
    if (!isConfirmationOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isConfirmationOpen]);

  function handleReview() {
    setFormError(null);

    const normalizedName = receiverName.trim();

    const normalizedPhone = phoneNumber.trim();

    const normalizedAddress = shippingAddress.trim();

    if (normalizedName.length < 2) {
      setFormError("Nama penerima minimal 2 karakter.");

      return;
    }

    if (normalizedName.length > 120) {
      setFormError("Nama penerima terlalu panjang.");

      return;
    }

    if (normalizedPhone.length > 30) {
      setFormError("Nomor telepon terlalu panjang.");

      return;
    }

    if (normalizedAddress.length < 10) {
      setFormError("Alamat pengiriman minimal 10 karakter.");

      return;
    }

    if (normalizedAddress.length > 1000) {
      setFormError("Alamat pengiriman terlalu panjang.");

      return;
    }

    if (!selectedPaymentMethod) {
      setFormError("Pilih metode pembayaran.");

      return;
    }

    if (selectedPaymentMethod === "coin" && !checkout?.hasEnoughCoinBalance) {
      setFormError("Saldo coin Anda tidak mencukupi.");

      return;
    }

    if (
      checkout?.reward?.productBonus &&
      !checkout.reward.productBonus.hasEnoughStock
    ) {
      setFormError("Stok produk bonus tidak mencukupi.");

      return;
    }

    setReceiverName(normalizedName);
    setPhoneNumber(normalizedPhone);
    setShippingAddress(normalizedAddress);

    setStep("review");
  }

  function openFinalConfirmation() {
    setFormError(null);
    setConfirmationAccepted(false);
    setIsConfirmationOpen(true);
  }

  async function handlePurchase() {
    if (!checkout || !selectedPaymentMethod || isSubmitting) {
      return;
    }

    if (!confirmationAccepted) {
      setFormError("Centang persetujuan transaksi sebelum melanjutkan.");

      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const checkoutToken =
        checkoutTokenRef.current ?? globalThis.crypto.randomUUID();

      checkoutTokenRef.current = checkoutToken;

      const result = await createCustomerCheckoutOrder({
        productId: checkout.product.id,

        quantity: checkout.quantity,

        receiverName,
        phoneNumber,
        shippingAddress,

        paymentMethod: selectedPaymentMethod,

        checkoutToken,

        confirmationAccepted: true,
      });

      if (!result.success || !result.data) {
        setFormError(getSecureCheckoutErrorMessage(result.error));

        return;
      }

      setPurchaseResult(result.data);
      setIsConfirmationOpen(false);
      setStep("success");

      router.refresh();
    } catch (error) {
      console.error("[CustomerProductCheckout] Purchase error:", error);

      setFormError("Checkout belum dapat diproses. Silakan coba kembali.");
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
        message={loadError ?? "Data checkout tidak tersedia."}
        onRetry={loadCheckout}
      />
    );
  }

  if (step === "success" && purchaseResult) {
    return <CheckoutSuccess result={purchaseResult} />;
  }

  return (
    <>
      <div
        className="
          grid gap-8
          lg:grid-cols-[minmax(0,1fr)_390px]
          lg:items-start
        "
      >
        <section className="rounded-3xl border border-line-trace bg-canvas-pure p-6 sm:p-8">
          {step === "form" ? (
            <CheckoutForm
              checkout={checkout}
              receiverName={receiverName}
              phoneNumber={phoneNumber}
              shippingAddress={shippingAddress}
              selectedPaymentMethod={selectedPaymentMethod}
              errorMessage={formError}
              onReceiverNameChange={setReceiverName}
              onPhoneNumberChange={setPhoneNumber}
              onShippingAddressChange={setShippingAddress}
              onPaymentMethodChange={setSelectedPaymentMethod}
              onReview={handleReview}
            />
          ) : (
            <CheckoutReview
              checkout={checkout}
              receiverName={receiverName}
              phoneNumber={phoneNumber}
              shippingAddress={shippingAddress}
              paymentMethod={selectedPaymentMethod}
              errorMessage={formError}
              onBack={() => {
                setFormError(null);
                setStep("form");
              }}
              onConfirm={openFinalConfirmation}
            />
          )}
        </section>

        <CheckoutSummary
          checkout={checkout}
          paymentMethod={selectedPaymentMethod}
        />
      </div>

      {isConfirmationOpen &&
        createPortal(
          <FinalConfirmationModal
            checkout={checkout}
            receiverName={receiverName}
            shippingAddress={shippingAddress}
            paymentMethod={selectedPaymentMethod}
            confirmationAccepted={confirmationAccepted}
            isSubmitting={isSubmitting}
            errorMessage={formError}
            onConfirmationChange={setConfirmationAccepted}
            onClose={() => {
              if (!isSubmitting) {
                setIsConfirmationOpen(false);
                setFormError(null);
              }
            }}
            onConfirm={() => {
              void handlePurchase();
            }}
          />,
          document.body,
        )}
    </>
  );
}

function CheckoutForm({
  checkout,
  receiverName,
  phoneNumber,
  shippingAddress,
  selectedPaymentMethod,
  errorMessage,
  onReceiverNameChange,
  onPhoneNumberChange,
  onShippingAddressChange,
  onPaymentMethodChange,
  onReview,
}: {
  checkout: CustomerCheckoutPreview;
  receiverName: string;
  phoneNumber: string;
  shippingAddress: string;
  selectedPaymentMethod: CustomerCheckoutPaymentMethod | null;
  errorMessage: string | null;
  onReceiverNameChange: (value: string) => void;
  onPhoneNumberChange: (value: string) => void;
  onShippingAddressChange: (value: string) => void;
  onPaymentMethodChange: (value: CustomerCheckoutPaymentMethod) => void;
  onReview: () => void;
}) {
  return (
    <>
      <div className="flex items-center gap-3 text-brand-emerald">
        <ShieldCheck className="size-4" />

        <p className="text-xs font-bold uppercase">Secure Checkout</p>
      </div>

      <h1 className="mt-5 font-display text-4xl font-medium tracking-[-0.045em] text-brand-black sm:text-5xl">
        Informasi Pesanan
      </h1>

      <p className="mt-4 max-w-xl text-sm leading-6 text-muted-moss">
        Isi data pengiriman dan pilih metode pembayaran sebelum melakukan
        review.
      </p>

      <div className="mt-8 space-y-5">
        <CheckoutInput
          id="receiver-name"
          label="Nama Penerima"
          value={receiverName}
          maxLength={120}
          placeholder="Nama lengkap penerima"
          required
          onChange={onReceiverNameChange}
        />

        <CheckoutInput
          id="phone-number"
          label="Nomor Telepon"
          value={phoneNumber}
          maxLength={30}
          placeholder="Contoh: 081234567890"
          type="tel"
          onChange={onPhoneNumberChange}
        />

        <div>
          <label
            htmlFor="shipping-address"
            className="text-xs font-bold text-brand-black"
          >
            Alamat Pengiriman
            <span className="text-red-600"> *</span>
          </label>

          <textarea
            id="shipping-address"
            rows={5}
            maxLength={1000}
            value={shippingAddress}
            placeholder="Masukkan alamat lengkap pengiriman"
            onChange={(event) => {
              onShippingAddressChange(event.target.value);
            }}
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
        </div>
      </div>

      <div className="mt-9">
        <p className="text-xs font-bold text-brand-black">Metode Pembayaran</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {checkout.availablePaymentMethods.includes("qris") && (
            <PaymentMethodOption
              method="qris"
              selected={selectedPaymentMethod === "qris"}
              title="QRIS"
              description="Bayar menggunakan aplikasi bank atau dompet digital."
              amount={
                checkout.totalPriceIdr !== null
                  ? formatIdr(checkout.totalPriceIdr)
                  : "-"
              }
              onSelect={onPaymentMethodChange}
            />
          )}

          {checkout.availablePaymentMethods.includes("coin") && (
            <PaymentMethodOption
              method="coin"
              selected={selectedPaymentMethod === "coin"}
              disabled={!checkout.hasEnoughCoinBalance}
              title="Coin"
              description={`Saldo tersedia ${formatCoin(
                checkout.profile.totalPoints,
              )}.`}
              amount={
                checkout.totalPriceCoin !== null
                  ? formatCoin(checkout.totalPriceCoin)
                  : "-"
              }
              onSelect={onPaymentMethodChange}
            />
          )}
        </div>
      </div>

      <CheckoutRewardCard checkout={checkout} />

      {errorMessage && <CheckoutErrorMessage message={errorMessage} />}

      <button
        type="button"
        onClick={onReview}
        className="
          group mt-8 flex w-full
          items-center justify-center
          gap-3 rounded-md
          bg-brand-forest
          px-6 py-4
          text-xs font-bold text-white
          transition hover:bg-brand-black
        "
      >
        Review Pesanan
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
      </button>
    </>
  );
}

function PaymentMethodOption({
  method,
  selected,
  disabled = false,
  title,
  description,
  amount,
  onSelect,
}: {
  method: CustomerCheckoutPaymentMethod;
  selected: boolean;
  disabled?: boolean;
  title: string;
  description: string;
  amount: string;
  onSelect: (method: CustomerCheckoutPaymentMethod) => void;
}) {
  const Icon = method === "qris" ? QrCode : Coins;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        onSelect(method);
      }}
      className={`
        relative rounded-2xl border
        p-5 text-left transition
        ${
          selected
            ? `
                border-brand-forest
                bg-brand-lime/20
              `
            : `
                border-line-trace
                bg-canvas-pure
                hover:border-brand-emerald
              `
        }
        ${
          disabled
            ? `
                cursor-not-allowed
                opacity-45
              `
            : ""
        }
      `}
    >
      {selected && (
        <span className="absolute right-4 top-4 flex size-5 items-center justify-center rounded-full bg-brand-forest text-white">
          <Check className="size-3" />
        </span>
      )}

      <Icon className="size-5 text-brand-emerald" />

      <p className="mt-5 text-sm font-bold text-brand-black">{title}</p>

      <p className="mt-2 text-[10px] leading-4 text-muted-moss">
        {description}
      </p>

      <p className="mt-5 text-xs font-bold text-brand-forest">{amount}</p>
    </button>
  );
}

function CheckoutReview({
  checkout,
  receiverName,
  phoneNumber,
  shippingAddress,
  paymentMethod,
  errorMessage,
  onBack,
  onConfirm,
}: {
  checkout: CustomerCheckoutPreview;
  receiverName: string;
  phoneNumber: string;
  shippingAddress: string;
  paymentMethod: CustomerCheckoutPaymentMethod | null;
  errorMessage: string | null;
  onBack: () => void;
  onConfirm: () => void;
}) {
  return (
    <>
      <div className="flex items-center gap-3 text-brand-emerald">
        <CheckCircle2 className="size-4" />

        <p className="text-xs font-bold uppercase">Review Pesanan</p>
      </div>

      <h1 className="mt-5 font-display text-4xl font-medium tracking-[-0.045em] text-brand-black sm:text-5xl">
        Periksa Kembali
      </h1>

      <p className="mt-4 text-sm leading-6 text-muted-moss">
        Periksa seluruh detail sebelum membuka konfirmasi transaksi akhir.
      </p>

      <div className="mt-8 space-y-4">
        <ReviewFact icon={UserRound} label="Penerima" value={receiverName} />

        <ReviewFact
          icon={MapPin}
          label="Alamat Pengiriman"
          value={`${phoneNumber || "Tanpa nomor telepon"} — ${shippingAddress}`}
        />

        <ReviewFact
          icon={Package}
          label="Produk"
          value={`${checkout.quantity}× ${checkout.product.name}`}
        />

        <ReviewFact
          icon={paymentMethod === "coin" ? Coins : QrCode}
          label="Pembayaran"
          value={
            paymentMethod === "coin"
              ? `Coin — ${formatCoin(checkout.totalPriceCoin ?? 0)}`
              : `QRIS — ${formatIdr(checkout.totalPriceIdr ?? 0)}`
          }
        />
      </div>

      <CheckoutRewardCard checkout={checkout} />

      {errorMessage && <CheckoutErrorMessage message={errorMessage} />}

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
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
          "
        >
          <ArrowLeft className="size-4" />
          Ubah Data
        </button>

        <button
          type="button"
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
          "
        >
          Konfirmasi Akhir
          <ShieldCheck className="size-4" />
        </button>
      </div>
    </>
  );
}

function FinalConfirmationModal({
  checkout,
  receiverName,
  shippingAddress,
  paymentMethod,
  confirmationAccepted,
  isSubmitting,
  errorMessage,
  onConfirmationChange,
  onClose,
  onConfirm,
}: {
  checkout: CustomerCheckoutPreview;
  receiverName: string;
  shippingAddress: string;
  paymentMethod: CustomerCheckoutPaymentMethod | null;
  confirmationAccepted: boolean;
  isSubmitting: boolean;
  errorMessage: string | null;
  onConfirmationChange: (value: boolean) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const paymentText =
    paymentMethod === "coin"
      ? formatCoin(checkout.totalPriceCoin ?? 0)
      : formatIdr(checkout.totalPriceIdr ?? 0);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-brand-black/65 px-4 py-8 backdrop-blur-sm">
      <div className="max-h-full w-full max-w-xl overflow-y-auto rounded-3xl bg-canvas-pure p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-xs font-bold uppercase text-brand-emerald">
              Konfirmasi Transaksi
            </p>

            <h2 className="mt-3 font-display text-3xl font-medium tracking-[-0.04em] text-brand-black">
              Buat Pesanan Ini?
            </h2>
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            aria-label="Tutup konfirmasi"
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-canvas-warm text-brand-black transition hover:bg-line-trace"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-7 rounded-2xl bg-canvas-warm p-5">
          <ConfirmationRow
            label="Produk"
            value={`${checkout.quantity}× ${checkout.product.name}`}
          />

          <ConfirmationRow label="Penerima" value={receiverName} />

          <ConfirmationRow label="Alamat" value={shippingAddress} />

          <ConfirmationRow
            label="Metode"
            value={paymentMethod === "coin" ? "Coin" : "QRIS"}
          />

          <ConfirmationRow label="Total" value={paymentText} last />
        </div>

        {paymentMethod === "qris" && (
          <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">
            Pesanan akan dibuat dengan status menunggu pembayaran. Stok akan
            direservasi selama 30 menit.
          </p>
        )}

        {paymentMethod === "coin" && (
          <p className="mt-5 rounded-xl border border-brand-lime bg-brand-lime/15 px-4 py-3 text-xs leading-5 text-brand-forest">
            Coin akan langsung dipotong setelah transaksi dikonfirmasi.
          </p>
        )}

        <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-line-trace p-4">
          <input
            type="checkbox"
            checked={confirmationAccepted}
            disabled={isSubmitting}
            onChange={(event) => {
              onConfirmationChange(event.target.checked);
            }}
            className="mt-0.5 size-4 accent-brand-forest"
          />

          <span className="text-xs leading-5 text-brand-black">
            Saya sudah memeriksa produk, jumlah, alamat, metode pembayaran, dan
            total transaksi. Saya menyetujui pembuatan pesanan ini.
          </span>
        </label>

        {errorMessage && <CheckoutErrorMessage message={errorMessage} />}

        <button
          type="button"
          disabled={isSubmitting || !confirmationAccepted}
          onClick={onConfirm}
          className="
            mt-6 flex w-full
            items-center justify-center
            gap-3 rounded-md
            bg-brand-forest
            px-6 py-4
            text-xs font-bold
            text-white transition
            hover:bg-brand-black
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {isSubmitting ? (
            <>
              <LoaderCircle className="size-4 animate-spin" />
              Memproses Transaksi...
            </>
          ) : paymentMethod === "coin" ? (
            <>
              Bayar dengan Coin
              <Coins className="size-4" />
            </>
          ) : (
            <>
              Buat Pesanan QRIS
              <QrCode className="size-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function CheckoutSummary({
  checkout,
  paymentMethod,
}: {
  checkout: CustomerCheckoutPreview;
  paymentMethod: CustomerCheckoutPaymentMethod | null;
}) {
  const totalPayment =
    paymentMethod === "coin"
      ? formatCoin(checkout.totalPriceCoin ?? 0)
      : formatIdr(checkout.totalPriceIdr ?? 0);

  return (
    <aside className="self-start rounded-2xl border border-line-trace bg-canvas-pure p-6 lg:sticky lg:top-24">
      <div className="flex items-center gap-3 text-brand-emerald">
        <ShoppingBag className="size-4" />

        <h2 className="text-xs font-bold uppercase">Ringkasan Pesanan</h2>
      </div>

      <div className="mt-7 rounded-xl bg-canvas-warm p-5">
        <p className="text-sm font-bold text-brand-black">
          {checkout.product.name}
        </p>

        <p className="mt-2 text-xs text-muted-moss">
          {checkout.product.brandName} · {checkout.product.categoryName}
        </p>

        <div className="mt-5 flex items-center justify-between border-t border-line-trace pt-4 text-xs">
          <span className="text-muted-moss">Jumlah</span>

          <span className="font-bold text-brand-black">
            {checkout.quantity}
          </span>
        </div>
      </div>

      <div className="mt-5 rounded-xl bg-brand-lime p-6 text-brand-forest">
        <p className="text-[10px] uppercase opacity-70">Total Pembayaran</p>

        <p className="mt-7 font-display text-4xl font-medium tracking-[-0.05em]">
          {totalPayment}
        </p>
      </div>

      {paymentMethod === "coin" && (
        <div className="mt-5 space-y-3 text-xs">
          <SummaryRow
            label="Saldo coin"
            value={formatCoin(checkout.profile.totalPoints)}
          />

          <SummaryRow
            label="Coin digunakan"
            value={formatCoin(checkout.totalPriceCoin ?? 0)}
          />

          <SummaryRow
            label="Sisa coin"
            value={formatCoin(
              Math.max(
                0,
                checkout.profile.totalPoints - (checkout.totalPriceCoin ?? 0),
              ),
            )}
            strong
          />
        </div>
      )}

      <CheckoutRewardCard checkout={checkout} compact />
    </aside>
  );
}

function CheckoutRewardCard({
  checkout,
  compact = false,
}: {
  checkout: CustomerCheckoutPreview;
  compact?: boolean;
}) {
  const reward = checkout.reward;

  if (!reward) {
    return null;
  }

  const hasProductBonus = Boolean(reward.productBonus);

  const hasCoinReward = reward.totalCoinReward > 0;

  return (
    <div
      className={`
        rounded-2xl border
        border-brand-lime
        bg-brand-lime/15
        ${compact ? "mt-5 p-5" : "mt-8 p-5"}
      `}
    >
      <div className="flex gap-3">
        <Gift className="mt-0.5 size-4 shrink-0 text-brand-emerald" />

        <div>
          <p className="text-[10px] font-bold uppercase text-brand-emerald">
            Bonus Pembelian
          </p>

          <div className="mt-3 space-y-2">
            {hasProductBonus && reward.productBonus && (
              <p className="text-xs font-bold text-brand-black">
                {reward.productBonus.totalQuantity}×{" "}
                {reward.productBonus.productName}
              </p>
            )}

            {hasCoinReward && (
              <p className="text-xs font-bold text-brand-black">
                + {formatCoin(reward.totalCoinReward)}
              </p>
            )}
          </div>

          <p className="mt-3 text-[10px] leading-4 text-muted-moss">
            Produk bonus otomatis masuk pesanan. Bonus coin diberikan setelah
            pesanan selesai.
          </p>
        </div>
      </div>
    </div>
  );
}

function CheckoutSuccess({
  result,
}: {
  result: CreateCustomerCheckoutOrderResult;
}) {
  const orderCode = result.orderId
    .replaceAll("-", "")
    .slice(0, 8)
    .toUpperCase();

  const isCoinPayment = result.paymentMethod === "coin";

  return (
    <section className="mx-auto max-w-2xl rounded-3xl border border-line-trace bg-canvas-pure px-6 py-14 text-center sm:px-10">
      <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-brand-lime text-brand-forest">
        <CheckCircle2 className="size-7" />
      </div>

      <p className="mt-7 text-xs font-bold uppercase text-brand-emerald">
        {isCoinPayment ? "Pembayaran Coin Berhasil" : "Pesanan Berhasil Dibuat"}
      </p>

      <h1 className="mt-4 font-display text-4xl font-medium tracking-[-0.045em] text-brand-black sm:text-5xl">
        ORD-{orderCode}
      </h1>

      <p className="mt-5 text-sm leading-6 text-muted-moss">
        {isCoinPayment
          ? "Coin telah dipotong dan pesanan akan segera diproses."
          : "Pesanan menunggu pembayaran QRIS. Stok telah direservasi sementara."}
      </p>

      <div className="mt-8 rounded-2xl bg-canvas-warm p-6">
        <SummaryRow
          label="Metode pembayaran"
          value={isCoinPayment ? "Coin" : "QRIS"}
        />

        <SummaryRow
          label="Total"
          value={
            isCoinPayment
              ? formatCoin(result.amountCoin)
              : formatIdr(result.amountIdr)
          }
        />

        <SummaryRow
          label="Bonus coin setelah selesai"
          value={formatCoin(result.pointsEarned)}
          strong
        />
      </div>

      {!isCoinPayment && result.expiresAt && (
        <p className="mt-5 text-xs text-amber-700">
          Batas pembayaran: {formatDateTime(result.expiresAt)}
        </p>
      )}

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <Link
          href="/produk"
          className="flex items-center justify-center rounded-md border border-line-trace px-6 py-4 text-xs font-bold text-brand-black transition hover:border-brand-forest"
        >
          Belanja Lagi
        </Link>

        <Link
          href={
            isCoinPayment
              ? "/dashboard/orders"
              : `/dashboard/orders/${result.orderId}/payment`
          }
          className="flex items-center justify-center gap-2 rounded-md bg-brand-forest px-6 py-4 text-xs font-bold text-white transition hover:bg-brand-black"
        >
          {isCoinPayment ? "Lihat Pesanan" : "Bayar Sekarang"}

          <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}

function CheckoutInput({
  id,
  label,
  value,
  placeholder,
  maxLength,
  type = "text",
  required = false,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  maxLength: number;
  type?: "text" | "tel";
  required?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-xs font-bold text-brand-black">
        {label}

        {required && <span className="text-red-600"> *</span>}
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

        <span className="text-[10px] font-medium uppercase">{label}</span>
      </div>

      <p className="mt-3 text-sm font-medium leading-6 text-brand-black">
        {value}
      </p>
    </div>
  );
}

function ConfirmationRow({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className={`
        flex items-start
        justify-between gap-5 py-3
        ${last ? "" : "border-b border-line-trace"}
      `}
    >
      <span className="text-xs text-muted-moss">{label}</span>

      <span className="max-w-[65%] text-right text-xs font-bold text-brand-black">
        {value}
      </span>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line-trace py-3 last:border-b-0">
      <span className="text-xs text-muted-moss">{label}</span>

      <span
        className={
          strong
            ? "text-xs font-bold text-brand-forest"
            : "text-xs font-bold text-brand-black"
        }
      >
        {value}
      </span>
    </div>
  );
}

function CheckoutErrorMessage({ message }: { message: string }) {
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
          Menyiapkan secure checkout...
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

      <p className="mt-3 text-xs text-muted-moss">{message}</p>

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

function formatDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Tidak tersedia";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
