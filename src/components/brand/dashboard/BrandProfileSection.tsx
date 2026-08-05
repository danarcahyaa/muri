"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  Globe2,
  Link2,
  Mail,
  MapPin,
  Phone,
  Plus,
  RefreshCw,
  Save,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { LocationPicker, type AddressJSONB } from "@/components/shared/LocationPicker";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  getBrandProfile,
  updateBrandProfile,
  type BrandProfileData,
} from "@/services/brand/profileService";
import type { BrandLink } from "@/types/brandLink";

export function BrandProfileSection() {
  const [profile, setProfile] = useState<BrandProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [brandName, setBrandName] = useState("");
  const [activeNumber, setActiveNumber] = useState("");
  const [location, setLocation] = useState<AddressJSONB>({
    formatted_address: "",
    latitude: 0,
    longitude: 0,
    address_detail: "",
  });
  const [links, setLinks] = useState<BrandLink[]>([
    { label: "", url: "" },
  ]);
  const [shortStory, setShortStory] = useState("");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await getBrandProfile();
      if (res.success && res.data) {
        const p = res.data;
        setProfile(p);
        setBrandName(p.brandName || "");
        setActiveNumber(p.activeNumber || "");
        setShortStory(p.shortStory || "");

        if (p.warehouseAddress) {
          const parts = p.warehouseAddress.split(" — ");
          setLocation({
            formatted_address: parts.length > 1 ? parts[0] : "",
            latitude: 0,
            longitude: 0,
            address_detail: parts.length > 1 ? parts[1] : p.warehouseAddress,
          });
        }

        if (p.socialMediaLinks && p.socialMediaLinks.length > 0) {
          setLinks(p.socialMediaLinks);
        }
      } else {
        setErrorMessage(res.error || "Gagal memuat profil brand.");
      }
    } catch (error) {
      console.error("[BrandProfileSection] Load error:", error);
      setErrorMessage("Terjadi kesalahan saat memuat data profil brand.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const handleLinkChange = (
    index: number,
    field: keyof BrandLink,
    value: string,
  ) => {
    setLinks((current) =>
      current.map((link, i) => (i === index ? { ...link, [field]: value } : link)),
    );
  };

  const handleAddLink = () => {
    setLinks((current) => [...current, { label: "", url: "" }]);
  };

  const handleRemoveLink = (index: number) => {
    setLinks((current) =>
      current.length <= 1 ? current : current.filter((_, i) => i !== index),
    );
  };

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    if (!brandName.trim()) {
      setErrorMessage("Nama brand tidak boleh kosong.");
      return;
    }
    if (!activeNumber.trim()) {
      setErrorMessage("Nomor telepon tidak boleh kosong.");
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const fullAddressStr = location.formatted_address
      ? `${location.formatted_address} — ${location.address_detail.trim()}`
      : location.address_detail.trim();

    const mapsUrl = location.latitude && location.longitude
      ? `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`
      : fullAddressStr
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddressStr)}`
      : undefined;

    const filteredLinks = links.filter(
      (l) => l.label.trim() && l.url.trim(),
    );

    try {
      const result = await updateBrandProfile({
        brandName: brandName.trim(),
        activeNumber: activeNumber.trim(),
        warehouseAddress: fullAddressStr,
        warehouseMapsUrl: mapsUrl,
        socialMediaLinks: filteredLinks,
        shortStory: shortStory.trim(),
      });

      if (!result.success || !result.data) {
        setErrorMessage(result.error || "Gagal memperbarui profil brand.");
        toast.error(result.error || "Gagal menyimpan perubahan.");
        return;
      }

      setProfile(result.data);
      setSuccessMessage("Profil brand berhasil diperbarui!");
      toast.success("Profil brand berhasil disimpan!");

      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (error) {
      console.error("[BrandProfileSection] Save error:", error);
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

  const initial = (profile?.brandName ?? "B")
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
                  {profile?.brandName}
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-emerald/10 px-2.5 py-1 text-[9px] font-bold uppercase text-brand-emerald">
                  <ShieldCheck className="size-3" />
                  Brand Partner
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

      {/* Main Profile Form */}
      <section className="rounded-2xl border border-brand-black/15 bg-canvas-pure p-6 sm:p-8">
        <div className="flex items-center justify-between border-b border-line-trace pb-5">
          <div>
            <h3 className="font-display text-xl font-medium text-brand-black">
              Informasi Brand
            </h3>
            <p className="mt-1 text-xs text-muted-moss">
              Kelola nama, kontak, lokasi studio/gudang, dan tautan portofolio brand Anda.
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
              <label htmlFor="brand-email" className="block text-xs font-bold text-brand-black">
                Email Bisnis (Auth)
              </label>
              <Input
                id="brand-email"
                type="email"
                readOnly
                disabled
                value={profile?.email ?? ""}
                endIcon={<Mail className="size-4 text-muted-moss/60" />}
                className="bg-canvas-warm/50 text-brand-black"
              />
            </div>

            {/* Nama Brand */}
            <div className="space-y-2">
              <label htmlFor="brand-name" className="block text-xs font-bold text-brand-black">
                Nama Brand <span className="text-red-600">*</span>
              </label>
              <Input
                id="brand-name"
                type="text"
                required
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Masukkan nama brand Anda"
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

          {/* LocationPicker Alamat Workshop / Gudang */}
          <div className="pt-2">
            <LocationPicker
              value={location}
              onChange={setLocation}
              label="Lokasi Gudang / Workshop Brand"
              detailLabel="Detail Alamat Lengkap & Catatan Gudang"
              placeholder="Ketik wilayah/kota gudang (misal: Bandung Selatan)..."
              detailPlaceholder="Jl. Sukajadi No 120, Studio Fashion Lt. 2..."
              disabled={isSaving}
              required={false}
            />
          </div>

          {/* Links Pendukung */}
          <div className="space-y-3 pt-2">
            <div>
              <p className="text-xs font-bold text-brand-black">
                Link Media Sosial / Portofolio / Web
              </p>
              <p className="mt-0.5 text-[11px] text-muted-moss">
                Tambahkan link media sosial atau website brand Anda.
              </p>
            </div>

            <div className="space-y-3">
              {links.map((link, index) => (
                <div
                  key={index}
                  className="space-y-2 rounded-xl border border-brand-black/15 bg-canvas-warm/30 p-3"
                >
                  <Input
                    type="text"
                    placeholder="Platform, contoh: Instagram"
                    value={link.label}
                    onChange={(e) =>
                      handleLinkChange(index, "label", e.target.value)
                    }
                    disabled={isSaving}
                    endIcon={<Globe2 className="size-4 text-muted-moss/60" />}
                  />

                  <div className="flex items-center gap-2">
                    <Input
                      type="url"
                      placeholder="https://..."
                      value={link.url}
                      onChange={(e) =>
                        handleLinkChange(index, "url", e.target.value)
                      }
                      disabled={isSaving}
                      endIcon={<Link2 className="size-4 text-muted-moss/60" />}
                    />

                    {links.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveLink(index)}
                        disabled={isSaving}
                        className="size-10 shrink-0 text-error-rust hover:bg-error-rust/5"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddLink}
              disabled={isSaving}
              className="border-dashed text-muted-moss hover:text-brand-emerald"
            >
              <Plus className="size-4" />
              <span>Tambah Link</span>
            </Button>
          </div>

          {/* Cerita Brand */}
          <div className="space-y-2 pt-2">
            <label htmlFor="short-story" className="block text-xs font-bold text-brand-black">
              Visi & Cerita Brand (Short Story)
            </label>
            <Textarea
              id="short-story"
              rows={4}
              value={shortStory}
              onChange={(e) => setShortStory(e.target.value)}
              placeholder="Ceritakan visi sirkularitas dan keunggulan produk brand Anda..."
              disabled={isSaving}
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
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </section>
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
        Gagal Memuat Profil Brand
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
