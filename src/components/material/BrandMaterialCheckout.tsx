"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Factory,
  LoaderCircle,
  MapPin,
  Package,
  Phone,
  QrCode,
  ShieldCheck,
  User,
} from "lucide-react";

import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { formatIdr } from "@/lib/productDetail";
import { createMaterialOrder, getMaterialBatchByCode } from "@/services/material";
import type { MaterialDetailItem } from "@/types/material";

interface BrandMaterialCheckoutProps {
  batchCode: string;
  requestedWeightKg: number;
}

export default function BrandMaterialCheckout({
  batchCode,
  requestedWeightKg,
}: BrandMaterialCheckoutProps) {
  const router = useRouter();

  const [material, setMaterial] = useState<MaterialDetailItem | null>(null);
  const [isLoadingMaterial, setIsLoadingMaterial] = useState(true);
  const [materialError, setMaterialError] = useState<string | null>(null);

  const [weightKg, setWeightKg] = useState<number>(requestedWeightKg);
  const [receiverName, setReceiverName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"qris">("qris");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [orderCreatedSuccess, setOrderCreatedSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadMaterial() {
      setIsLoadingMaterial(true);
      setMaterialError(null);

      const res = await getMaterialBatchByCode(batchCode);
      if (!res.success || !res.data) {
        setMaterialError(
          typeof res.error === "string"
            ? res.error
            : "Material tidak ditemukan.",
        );
      } else {
        setMaterial(res.data);
        if (requestedWeightKg < res.data.minimumOrderKg) {
          setWeightKg(res.data.minimumOrderKg);
        }
      }

      setIsLoadingMaterial(false);
    }

    void loadMaterial();
  }, [batchCode, requestedWeightKg]);

  if (isLoadingMaterial) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center font-body">
        <LoaderCircle className="size-8 animate-spin text-brand-emerald" />
        <p className="mt-4 text-xs font-semibold text-muted-moss">
          Memuat rincian material sirkular...
        </p>
      </div>
    );
  }

  if (materialError || !material) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-brand-black/15 bg-canvas-pure p-8 text-center font-body shadow-sm">
        <h2 className="font-display text-xl font-bold text-brand-black">
          Batch Material Tidak Ditemukan
        </h2>
        <p className="mt-2 text-xs text-muted-moss">
          {materialError ?? "Material yang Anda cari tidak tersedia."}
        </p>
        <Link
          href="/material"
          className="mt-6 inline-flex items-center gap-2 rounded-sm bg-brand-forest px-5 py-3 text-xs font-bold text-white transition hover:bg-brand-black"
        >
          <ArrowLeft className="size-4" />
          Kembali ke Katalog Sourcing
        </Link>
      </div>
    );
  }

  const activeMaterial = material;
  const pricePerKg = activeMaterial.pricePerKg;
  const totalPriceIdr = weightKg * pricePerKg;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!receiverName.trim()) {
      setFormError("Nama penerima wajib diisi.");
      return;
    }

    if (!phoneNumber.trim()) {
      setFormError("Nomor telepon penerima wajib diisi.");
      return;
    }

    if (!shippingAddress.trim()) {
      setFormError("Alamat pengiriman wajib diisi.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await createMaterialOrder({
        batchCode: activeMaterial.batchCode,
        weightKg,
        receiverName,
        phoneNumber,
        shippingAddress,
        paymentMethod,
      });

      if (!res.success || !res.data) {
        setFormError(
          typeof res.error === "string"
            ? res.error
            : "Gagal membuat pesanan material.",
        );
        return;
      }

      setOrderCreatedSuccess(res.data.id);
      router.push("/brand/dashboard/sourcing/purchases");
    } catch {
      setFormError("Terjadi kesalahan saat memproses pesanan.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="font-body space-y-8">
      {/* Breadcrumb Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-muted-moss">
          <Link
            href="/material"
            className="transition hover:text-brand-black"
          >
            Sourcing Material
          </Link>
          <ChevronRight className="size-3" />
          <Link
            href={`/material/${activeMaterial.batchCode}`}
            className="transition hover:text-brand-black"
          >
            {activeMaterial.batchCode}
          </Link>
          <ChevronRight className="size-3" />
          <span className="font-bold text-brand-black">Checkout Material</span>
        </div>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-brand-black sm:text-4xl">
          Checkout Pembelian Material
        </h1>
        <p className="mt-2 text-xs text-muted-moss">
          Selesaikan pengajuan pembelian material kain sirkular dari Waste Provider.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Form Inputs Left (2 Cols) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Material Summary Card */}
          <section className="rounded-2xl border border-brand-black/15 bg-canvas-pure p-6 sm:p-8">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-brand-emerald">
              <Package className="size-4" />
              <span>Detail Batch Material</span>
            </div>

            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-brand-black/15 bg-canvas-warm/40 p-4">
              <div>
                <span className="inline-flex rounded-full bg-brand-lime/60 px-2.5 py-0.5 text-[9px] font-bold uppercase text-brand-forest">
                  {activeMaterial.categoryName}
                </span>
                <h3 className="mt-1 font-display text-base font-bold text-brand-black">
                  {activeMaterial.title}
                </h3>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-moss">
                  <Factory className="size-3.5" />
                  <span>Provider: {activeMaterial.providerName}</span>
                </p>
              </div>

              <div className="shrink-0 text-left sm:text-right">
                <p className="text-[10px] uppercase text-muted-moss">Harga / Kg</p>
                <p className="font-display text-lg font-bold text-brand-forest">
                  {formatIdr(activeMaterial.pricePerKg)}
                </p>
              </div>
            </div>

            {/* Volume Adjustment */}
            <div className="mt-5 space-y-2.5">
              <label className="block mb-2 text-xs font-bold text-brand-black">
                Volume Pembelian (Kilogram) <span className="text-error-rust">*</span>
              </label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min={activeMaterial.minimumOrderKg}
                  max={activeMaterial.availableWeightKg}
                  value={weightKg}
                  onChange={(e) => setWeightKg(Math.max(1, Number(e.target.value)))}
                  className="w-44"
                />
                <span className="text-xs text-muted-moss">
                  Min. {activeMaterial.minimumOrderKg} kg (Stok tersedia: {activeMaterial.availableWeightKg} kg)
                </span>
              </div>
            </div>
          </section>

          {/* Shipping & Recipient Details */}
          <section className="rounded-2xl border border-brand-black/15 bg-canvas-pure p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-brand-emerald">
              <MapPin className="size-4" />
              <span>Data Penerima & Alamat Pengiriman Brand</span>
            </div>

            {formError && (
              <div className="rounded-sm border border-error-rust/30 bg-error-rust/10 p-3 text-xs font-medium text-error-rust">
                {formError}
              </div>
            )}

            {/* Nama Penerima */}
            <div className="space-y-2.5">
              <label className="block mb-2 text-xs font-bold text-brand-black">
                Nama Penerima / Team Sourcing <span className="text-error-rust">*</span>
              </label>
              <Input
                type="text"
                required
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                placeholder="Contoh: Budi Prasetyo (Team Sourcing Brand)"
                startIcon={<User className="size-4 text-muted-moss/60" />}
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-2.5">
              <label className="block mb-2 text-xs font-bold text-brand-black">
                Nomor Telepon Penerima <span className="text-error-rust">*</span>
              </label>
              <Input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Contoh: 081234567890"
                startIcon={<Phone className="size-4 text-muted-moss/60" />}
              />
            </div>

            {/* Shipping Address */}
            <div className="space-y-2.5">
              <label className="block mb-2 text-xs font-bold text-brand-black">
                Alamat Pengiriman Gudang Brand <span className="text-error-rust">*</span>
              </label>
              <Textarea
                rows={3}
                required
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="Masukkan alamat lengkap gudang / workshop brand Anda..."
              />
            </div>
          </section>

          {/* Payment Method Selector */}
          <section className="rounded-2xl border border-brand-black/15 bg-canvas-pure p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-brand-emerald">
              <QrCode className="size-4" />
              <span>Metode Pembayaran</span>
            </div>

            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-brand-emerald bg-brand-lime/20 p-4 transition">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-brand-lime text-brand-forest font-bold">
                  <QrCode className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-brand-black">QRIS Standar MURI</p>
                  <p className="text-[10px] text-muted-moss">
                    Bayar cepat via GoPay, OVO, ShopeePay, DANA, atau M-Banking.
                  </p>
                </div>
              </div>
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === "qris"}
                onChange={() => setPaymentMethod("qris")}
                className="size-4 accent-brand-forest"
              />
            </label>
          </section>
        </div>

        {/* Order Summary Right (1 Col Sticky) */}
        <div className="space-y-6">
          <section className="sticky top-24 rounded-2xl border border-brand-black/15 bg-canvas-pure p-6 sm:p-8 space-y-6 shadow-sm">
            <h3 className="font-display text-lg font-bold text-brand-black border-b border-line-trace pb-4">
              Ringkasan Pembayaran
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-muted-moss">
                <span>Volume Material</span>
                <span className="font-bold text-brand-black">{weightKg} kg</span>
              </div>
              <div className="flex items-center justify-between text-muted-moss">
                <span>Harga per Kg</span>
                <span className="font-bold text-brand-black">{formatIdr(pricePerKg)}</span>
              </div>
              <div className="flex items-center justify-between text-muted-moss">
                <span>Estimasi Layanan</span>
                <span className="font-bold text-brand-forest">Gratis</span>
              </div>
              <div className="border-t border-line-trace pt-3 flex items-center justify-between">
                <span className="font-bold text-brand-black">Total Pembayaran</span>
                <span className="font-display text-xl font-bold text-brand-black">
                  {formatIdr(totalPriceIdr)}
                </span>
              </div>
            </div>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="flex w-full items-center justify-center gap-2 rounded-sm bg-brand-forest px-6 py-4 text-xs font-bold text-white transition hover:bg-brand-black disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4" />
                  Buat Pesanan & Bayar QRIS
                </>
              )}
            </button>

            <div className="flex items-center gap-2 rounded-xl bg-canvas-warm p-3 text-[10px] text-muted-moss">
              <ShieldCheck className="size-4 shrink-0 text-brand-emerald" />
              <span>Transaksi dilindungi oleh sistem sirkular aman MURI.</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
