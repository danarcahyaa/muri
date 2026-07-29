"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  Coins,
  KeyRound,
  Leaf,
  LoaderCircle,
  LogOut,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Save,
  ShieldCheck,
  User,
} from "lucide-react";
import { formatCoin } from "@/lib/productDetail";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/Input";
import {
  getCustomerDashboardSummary,
} from "@/services/customer/dashboardService";
import {
  getCustomerProfile,
  updateCustomerProfile,
} from "@/services/customer/profileService";
import type { CustomerDashboardSummary } from "@/types/customerDashboard";
import type { CustomerProfileData } from "@/types/customerProfile";

export default function CustomerProfileSection() {
  const router = useRouter();

  const [profile, setProfile] = useState<CustomerProfileData | null>(null);
  const [summary, setSummary] = useState<CustomerDashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Form state
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");

  // Feedback states
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [profileRes, summaryRes] = await Promise.all([
        getCustomerProfile(),
        getCustomerDashboardSummary(),
      ]);

      if (!profileRes.success || !profileRes.data) {
        setErrorMessage("Gagal memuat profil customer. Silakan coba lagi.");
        return;
      }

      const pData = profileRes.data;
      setProfile(pData);
      setFullName(pData.fullName ?? "");
      setPhoneNumber(pData.phoneNumber ?? "");
      setShippingAddress(pData.shippingAddress ?? "");

      if (summaryRes.success && summaryRes.data) {
        setSummary(summaryRes.data);
      }
    } catch (error) {
      console.error("[CustomerProfileSection] Error loading profile:", error);
      setErrorMessage("Terjadi kesalahan saat memuat data profil.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();

    if (!fullName.trim()) {
      setErrorMessage("Nama lengkap tidak boleh kosong.");
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const result = await updateCustomerProfile({
        fullName,
        phoneNumber,
        shippingAddress,
      });

      if (!result.success || !result.data) {
        setErrorMessage(result.error ?? "Gagal memperbarui profil.");
        return;
      }

      setProfile(result.data);
      setSuccessMessage("Profil berhasil diperbarui!");

      setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);
    } catch (error) {
      console.error("[CustomerProfileSection] Error saving profile:", error);
      setErrorMessage("Terjadi kesalahan saat menyimpan perubahan.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("[CustomerProfileSection] Logout error:", error);
      setIsLoggingOut(false);
    }
  }

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (errorMessage && !profile) {
    return <ProfileError message={errorMessage} onRetry={loadProfile} />;
  }

  const initials = (profile?.fullName ?? "P")
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="mt-8 space-y-8">
      {/* Profile Overview Header Card */}
      <section className="overflow-hidden rounded-2xl border border-line-trace bg-canvas-pure p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            {/* Avatar Initials */}
            <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-brand-forest font-display text-2xl font-bold text-white sm:size-20 sm:text-3xl">
              {initials}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-2xl font-medium text-brand-black sm:text-3xl">
                  {profile?.fullName}
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-emerald/10 px-2.5 py-1 text-[9px] font-bold uppercase text-brand-emerald">
                  <ShieldCheck className="size-3" />
                  Customer
                </span>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-moss">
                <div className="flex items-center gap-1.5">
                  <Mail className="size-3.5" />
                  <span>{profile?.email}</span>
                </div>
                {profile?.createdAt && (
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="size-3.5" />
                    <span>Anggota sejak {formatDate(profile.createdAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Coin Balance Shortcut Card */}
          <Link
            href="/dashboard/points"
            className="flex items-center gap-4 rounded-xl border border-line-trace bg-canvas-warm p-4 transition hover:border-brand-emerald hover:bg-canvas-warm/80 sm:w-auto"
          >
            <div className="flex size-11 items-center justify-center rounded-lg bg-brand-lime/50 text-brand-forest">
              <Coins className="size-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-moss">
                Saldo Coin MURI
              </p>
              <p className="font-display text-2xl font-medium text-brand-forest">
                {formatCoin(profile?.totalPoints ?? 0)}
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* Impact & Activity Quick Stats */}
      {summary && (
        <section className="grid gap-4 sm:grid-cols-3">
          <StatBox
            icon={Coins}
            label="Total Poin Digunakan"
            value={`${summary.totalPoints} poin`}
          />
          <StatBox
            icon={Leaf}
            label="Karbon Diselamatkan"
            value={`${summary.carbonSavedKg} kg`}
          />
          <StatBox
            icon={CheckCircle2}
            label="Total Pesanan"
            value={`${summary.totalOrders} pesanan`}
          />
        </section>
      )}

      {/* Profile Form & Settings Section */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Edit Form */}
        <section className="rounded-2xl border border-line-trace bg-canvas-pure p-6 sm:p-8 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-line-trace pb-5">
            <div>
              <h3 className="font-display text-xl font-medium text-brand-black">
                Informasi Pengguna
              </h3>
              <p className="mt-1 text-xs text-muted-moss">
                Perbarui informasi nama, kontak, dan alamat pengiriman default Anda.
              </p>
            </div>
          </div>

          <form onSubmit={(e) => void handleSave(e)} className="mt-6 space-y-5">
            {/* Feedback Alerts */}
            {successMessage && (
              <div className="flex items-center gap-2 rounded-xl border border-brand-lime bg-brand-lime/20 px-4 py-3 text-xs font-medium text-brand-forest">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                {errorMessage}
              </div>
            )}

            {/* Email (Readonly Auth Input) */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-bold text-brand-black">
                Alamat Email
              </label>
              <Input
                id="email"
                type="email"
                readOnly
                disabled
                value={profile?.email ?? ""}
                endIcon={<Mail className="size-4 text-muted-moss/60" strokeWidth={1.7} />}
                className="bg-canvas-warm/50 text-brand-black"
              />
              <p className="text-[10px] text-muted-moss">
                Alamat email terikat dengan akun Supabase Auth dan tidak dapat diubah di sini.
              </p>
            </div>

            {/* Full Name (Auth-styled Input) */}
            <div className="space-y-2">
              <label htmlFor="full-name" className="text-xs font-bold text-brand-black">
                Nama Lengkap<span className="text-red-600"> *</span>
              </label>
              <Input
                id="full-name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Masukkan nama lengkap Anda"
                endIcon={<User className="size-4 text-muted-moss/60" strokeWidth={1.7} />}
                disabled={isSaving}
              />
            </div>

            {/* Phone Number (Auth-styled Input) */}
            <div className="space-y-2">
              <label htmlFor="phone-number" className="text-xs font-bold text-brand-black">
                Nomor Telepon
              </label>
              <Input
                id="phone-number"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Masukkan nomor telepon Anda"
                endIcon={<Phone className="size-4 text-muted-moss/60" strokeWidth={1.7} />}
                disabled={isSaving}
              />
            </div>

            {/* Default Shipping Address */}
            <div className="space-y-2">
              <label htmlFor="shipping-address" className="text-xs font-bold text-brand-black">
                Alamat Pengiriman Utama
              </label>
              <div className="relative">
                <textarea
                  id="shipping-address"
                  rows={4}
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Masukkan alamat pengiriman lengkap Anda"
                  disabled={isSaving}
                  className="
                    w-full resize-none rounded-xl
                    border border-line-trace bg-transparent
                    px-4 py-3 pr-11
                    font-body text-xs text-brand-black shadow-none
                    outline-none transition
                    placeholder:text-xs placeholder:text-muted-moss/60
                    focus-visible:border-brand-emerald
                    focus-visible:ring-2 focus-visible:ring-brand-emerald/10
                    disabled:cursor-not-allowed disabled:bg-canvas-warm/50
                  "
                />
                <MapPin
                  aria-hidden="true"
                  className="pointer-events-none absolute right-4 top-4 size-4 text-muted-moss/60"
                  strokeWidth={1.7}
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-forest px-6 py-3.5 text-xs font-bold text-white transition hover:bg-brand-black disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="size-4" />
                    Simpan Perubahan
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Side Panel: Security & Account Actions */}
        <div className="space-y-6">
          {/* Security Card */}
          <section className="rounded-2xl border border-line-trace bg-canvas-pure p-6 sm:p-8">
            <h3 className="font-display text-xl font-medium text-brand-black">
              Keamanan Akun
            </h3>
            <p className="mt-1 text-xs text-muted-moss">
              Pengaturan kata sandi dan autentikasi.
            </p>

            <div className="mt-5 space-y-3">
              <Link
                href="/forgot-password"
                className="flex items-center gap-3 rounded-xl border border-line-trace bg-canvas-warm p-4 text-xs font-bold text-brand-black transition hover:border-brand-forest hover:bg-canvas-warm/80"
              >
                <KeyRound className="size-4 text-brand-emerald" />
                <span>Atur Ulang Kata Sandi</span>
              </Link>
            </div>
          </section>

          {/* Account Actions Card */}
          <section className="rounded-2xl border border-line-trace bg-canvas-pure p-6 sm:p-8">
            <h3 className="font-display text-xl font-medium text-brand-black">
              Aksi Akun
            </h3>
            <p className="mt-1 text-xs text-muted-moss">
              Keluar dari sesi dashboard customer ini.
            </p>

            <div className="mt-5">
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={() => void handleLogout()}
                className="flex w-full items-center justify-center gap-2 rounded-md border border-red-200 bg-red-50 px-5 py-3.5 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
              >
                {isLoggingOut ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <LogOut className="size-4" />
                )}
                Keluar dari Akun
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function StatBox({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Coins;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-line-trace bg-canvas-pure p-5">
      <div className="flex size-11 items-center justify-center rounded-lg bg-canvas-warm text-brand-emerald">
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase text-muted-moss">{label}</p>
        <p className="font-display text-xl font-bold text-brand-black">{value}</p>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="mt-8 space-y-8">
      <div className="h-32 animate-pulse rounded-2xl bg-canvas-warm" />
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="h-96 animate-pulse rounded-2xl bg-canvas-warm lg:col-span-2" />
        <div className="h-64 animate-pulse rounded-2xl bg-canvas-warm" />
      </div>
    </div>
  );
}

function ProfileError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => Promise<void>;
}) {
  return (
    <section className="mt-8 flex min-h-72 flex-col items-center justify-center rounded-2xl border border-line-trace bg-canvas-pure px-6 py-12 text-center">
      <RefreshCw className="size-9 text-muted-moss/50" />
      <h2 className="mt-5 font-display text-2xl font-medium text-brand-black">
        Gagal Memuat Profil
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

function formatDate(value: string | null): string {
  if (!value) return "Tanggal tidak tersedia";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Tanggal tidak tersedia";
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(date);
}
