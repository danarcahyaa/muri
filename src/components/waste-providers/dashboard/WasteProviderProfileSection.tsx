"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  Leaf,
  Mail,
  Phone,
  RefreshCw,
  Save,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { toast } from "sonner";

import { LocationPicker, type AddressJSONB } from "@/components/shared/LocationPicker";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  getWasteProviderProfile,
  updateWasteProviderProfile,
  type WasteProviderProfileData,
} from "@/services/waste-providers/profileService";

export function WasteProviderProfileSection() {
  const [profile, setProfile] = useState<WasteProviderProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [companyName, setCompanyName] = useState("");
  const [activeNumber, setActiveNumber] = useState("");
  const [address, setAddress] = useState<AddressJSONB>({
    formatted_address: "",
    latitude: 0,
    longitude: 0,
    address_detail: "",
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await getWasteProviderProfile();
      if (res.success && res.data) {
        const p = res.data;
        setProfile(p);
        setCompanyName(p.companyName || "");
        setActiveNumber(p.activeNumber || "");

        if (p.address) {
          setAddress(p.address);
        } else if (p.addressString) {
          const parts = p.addressString.split(" — ");
          setAddress({
            formatted_address: parts.length > 1 ? parts[0] : "",
            latitude: 0,
            longitude: 0,
            address_detail: parts.length > 1 ? parts[1] : p.addressString,
          });
        }
      } else {
        setErrorMessage(res.error || "Gagal memuat profil penyedia limbah.");
      }
    } catch (error) {
      console.error("[WasteProviderProfileSection] Load error:", error);
      setErrorMessage("Terjadi kesalahan saat memuat data profil.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    if (!companyName.trim()) {
      setErrorMessage("Nama usaha/perusahaan tidak boleh kosong.");
      return;
    }
    if (!activeNumber.trim()) {
      setErrorMessage("Nomor telepon aktif tidak boleh kosong.");
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const result = await updateWasteProviderProfile({
        companyName: companyName.trim(),
        activeNumber: activeNumber.trim(),
        address,
      });

      if (!result.success || !result.data) {
        setErrorMessage(result.error || "Gagal memperbarui profil penyedia limbah.");
        toast.error(result.error || "Gagal menyimpan perubahan.");
        return;
      }

      setProfile(result.data);
      setSuccessMessage("Profil penyedia limbah berhasil diperbarui!");
      toast.success("Profil berhasil disimpan!");

      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (error) {
      console.error("[WasteProviderProfileSection] Save error:", error);
      setErrorMessage("Terjadi kesalahan saat menyimpan profil.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (errorMessage && !profile) {
    return <ProfileError message={errorMessage} onRetry={loadProfile} />;
  }

  const initial = (profile?.companyName ?? "P")
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <div className="space-y-8">
      {/* Overview Header Card */}
      <section className="overflow-hidden rounded-2xl border border-brand-black/15 bg-canvas-pure p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-brand-forest font-display text-2xl font-bold text-white sm:size-20 sm:text-3xl">
              {initial}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-2xl font-medium text-brand-black sm:text-3xl">
                  {profile?.companyName}
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-emerald/10 px-2.5 py-1 text-[9px] font-bold uppercase text-brand-emerald">
                  <ShieldCheck className="size-3" />
                  Waste Provider Partner
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
                    <span>Terdaftar sejak {formatDate(profile.createdAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Summary Metrics */}
      <section className="grid gap-4 sm:grid-cols-3">
        <StatBox
          icon={Leaf}
          label="Total Limbah Tersalurkan"
          value={`${profile?.totalDistributedWaste ?? 0} kg`}
        />
        <StatBox
          icon={Truck}
          label="Total Transaksi"
          value={`${profile?.totalTransaction ?? 0} transaksi`}
        />
        <StatBox
          icon={CheckCircle2}
          label="Total Pendapatan"
          value={formatRupiah(profile?.totalIncome ?? 0)}
        />
      </section>

      {/* Main Profile Form */}
      <section className="rounded-2xl border border-brand-black/15 bg-canvas-pure p-6 sm:p-8">
        <div className="flex items-center justify-between border-b border-line-trace pb-5">
          <div>
            <h3 className="font-display text-xl font-medium text-brand-black">
              Informasi Penyedia Limbah
            </h3>
            <p className="mt-1 text-xs text-muted-moss">
              Perbarui nama usaha, kontak telepon, dan lokasi gudang/pabrik penyedia limbah Anda.
            </p>
          </div>
        </div>

        <form onSubmit={(e) => void handleSave(e)} className="mt-6 space-y-6">
          {/* Messages */}
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

          <div className="grid gap-6 sm:grid-cols-2">
            {/* Email (Readonly) */}
            <div className="space-y-2">
              <label htmlFor="provider-email" className="block text-xs font-bold text-brand-black">
                Email Bisnis (Auth)
              </label>
              <Input
                id="provider-email"
                type="email"
                readOnly
                disabled
                value={profile?.email ?? ""}
                endIcon={<Mail className="size-4 text-muted-moss/60" />}
                className="bg-canvas-warm/50 text-brand-black"
              />
            </div>

            {/* Nama Usaha / Pabrik */}
            <div className="space-y-2">
              <label htmlFor="company-name" className="block text-xs font-bold text-brand-black">
                Nama Usaha / Perusahaan <span className="text-red-600">*</span>
              </label>
              <Input
                id="company-name"
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Contoh: PT Tekstil Jaya Limbah"
                disabled={isSaving}
                endIcon={<Building2 className="size-4 text-muted-moss/60" />}
              />
            </div>
          </div>

          {/* Nomor Telepon / WA */}
          <div className="space-y-2">
            <label htmlFor="active-number" className="block text-xs font-bold text-brand-black">
              Nomor Telepon / WhatsApp Aktif <span className="text-red-600">*</span>
            </label>
            <Input
              id="active-number"
              type="tel"
              required
              value={activeNumber}
              onChange={(e) => setActiveNumber(e.target.value)}
              placeholder="Contoh: 081234567890"
              disabled={isSaving}
              endIcon={<Phone className="size-4 text-muted-moss/60" />}
            />
          </div>

          {/* LocationPicker Alamat Penjemputan / Gudang Limbah */}
          <div className="pt-2">
            <LocationPicker
              value={address}
              onChange={setAddress}
              label="Cari Alamat Penjemputan / Gudang Limbah"
              detailLabel="Detail Alamat Lengkap & Catatan Gudang"
              placeholder="Ketik wilayah/kota gudang (misal: Denpasar Timur)..."
              detailPlaceholder="Jl. Industry No 45, Gudang B2, Kontak PJ (0812345678)..."
              disabled={isSaving}
              required={false}
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={isSaving}
              loading={isSaving}
              variant="default"
              size="md"
            >
              <Save className="size-4" />
              Simpan Perubahan Profile Provider
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}

function StatBox({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Leaf;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-brand-black/15 bg-canvas-pure p-5">
      <div className="flex size-11 items-center justify-center rounded-lg bg-brand-lime/35 text-brand-forest">
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
    <div className="space-y-8">
      <div className="flex items-center justify-between rounded-2xl border border-brand-black/15 bg-canvas-pure p-6 sm:p-8">
        <div className="flex items-center gap-5">
          <Skeleton className="size-16 rounded-xl sm:size-20" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-brand-black/15 bg-canvas-pure p-6 sm:p-8 space-y-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-11 w-full rounded-sm" />
        <Skeleton className="h-11 w-full rounded-sm" />
        <Skeleton className="h-28 w-full rounded-sm" />
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
    <section className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-brand-black/15 bg-canvas-pure px-6 py-12 text-center">
      <RefreshCw className="size-9 text-muted-moss/50" />
      <h2 className="mt-5 font-display text-2xl font-medium text-brand-black">
        Gagal Memuat Profil Penyedia Limbah
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

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}
