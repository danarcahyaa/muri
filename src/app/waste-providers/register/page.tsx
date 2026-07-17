"use client";

import * as React from "react";
import { useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  Factory,
  KeyRound,
  Leaf,
  Mail,
  Phone,
  ChevronDown,
} from "lucide-react";
import { INDONESIA_PROVINCES } from "@/data/indonesiaRegions";
import type { IndonesiaProvince } from "@/types/common";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { BackLink } from "@/components/ui/BackLink";
import { AuthFooterLink } from "@/components/ui/AuthFooterLink";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { registerWasteProvider } from "@/services/waste-providers/authService";

function getSafeInternalPath(value: string | null, fallback: string) {
  if (value && value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }

  return fallback;
}

export default function WasteProviderRegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const fromPath = getSafeInternalPath(
    searchParams.get("from"),
    "/auth/register",
  );

  const nextPath = getSafeInternalPath(searchParams.get("next"), "/dashboard");

  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [activeNumber, setActiveNumber] = useState("");
  const [password, setPassword] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedRegency, setSelectedRegency] = useState("");
  const [provinceSearch, setProvinceSearch] = useState("");
  const [regencySearch, setRegencySearch] = useState("");
  const [isProvinceDropdownOpen, setIsProvinceDropdownOpen] = useState(false);
  const [isRegencyDropdownOpen, setIsRegencyDropdownOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const provinceRef = React.useRef<HTMLDivElement>(null);
  const regencyRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        provinceRef.current &&
        !provinceRef.current.contains(event.target as Node)
      ) {
        setIsProvinceDropdownOpen(false);
      }
      if (
        regencyRef.current &&
        !regencyRef.current.contains(event.target as Node)
      ) {
        setIsRegencyDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredProvinces = INDONESIA_PROVINCES.filter((p: IndonesiaProvince) =>
    p.province.toLowerCase().includes(provinceSearch.toLowerCase()),
  );

  const regencies =
    INDONESIA_PROVINCES.find(
      (p: IndonesiaProvince) => p.province === selectedProvince,
    )?.regencies || [];
  const filteredRegencies = regencies.filter((r: string) =>
    r.toLowerCase().includes(regencySearch.toLowerCase()),
  );

  React.useEffect(() => {
    if (error) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [error]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsLoading(true);
    setError(null);

    const normalizedCompanyName = companyName.trim();
    const normalizedEmail = email.trim();
    const normalizedActiveNumber = activeNumber.trim();

    if (!normalizedCompanyName) {
      setError("Nama pabrik/garmen wajib diisi.");
      setIsLoading(false);
      return;
    }

    if (!normalizedEmail) {
      setError("Email bisnis wajib diisi.");
      setIsLoading(false);
      return;
    }

    if (!normalizedActiveNumber) {
      setError("Nomor aktif wajib diisi.");
      setIsLoading(false);
      return;
    }

    if (!selectedProvince) {
      setError("Provinsi  wajib dipilih.");
      setIsLoading(false);
      return;
    }

    if (!selectedRegency) {
      setError("Kabupaten wajib dipilih.");
      setIsLoading(false);
      return;
    }

    if (!password) {
      setError("Kata sandi wajib diisi.");
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Kata sandi harus minimal 8 karakter.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await registerWasteProvider({
        companyName: normalizedCompanyName,
        email: normalizedEmail,
        activeNumber: normalizedActiveNumber,
        password,
        address: {
          province: selectedProvince,
          regency: selectedRegency,
        },
      });

      if (!response.success) {
        setError(response.error || "Gagal melakukan pendaftaran.");
        return;
      }

      toast.success(response.message || "Pendaftaran waste provider berhasil!");

      setCompanyName("");
      setEmail("");
      setActiveNumber("");
      setPassword("");
      setSelectedProvince("");
      setSelectedRegency("");

      const loginParams = new URLSearchParams({
        from: "/waste-providers/register",
        next: nextPath,
      });

      router.push(`/waste-providers/login?${loginParams.toString()}`);
    } catch {
      setError("Terjadi kesalahan. Silakan coba kembali beberapa saat lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas-pure px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-8">
        {/* Back link */}
        <div className="flex justify-start">
          <BackLink href={fromPath} label="Kembali" />
        </div>

        {/* Main content */}
        <div className="mx-auto w-full max-w-sm">
          {/* Logo */}
          <div className="mb-12 flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Muri Logo"
              width={40}
              height={40}
              priority
              className="size-10 object-contain"
            />

            <span className="font-display text-2xl font-medium tracking-tight text-brand-black">
              Muri
            </span>
          </div>

          {/* Header */}
          <div className="mb-10">
            <div className="mb-4 flex items-center gap-3 text-brand-emerald">
              <Leaf className="size-4" strokeWidth={2} />

              <span className="text-xs font-bold uppercase tracking-tight">
                Bergabung sebagai Waste Provider
              </span>
            </div>

            <h1 className="font-display text-5xl font-medium leading-[1.08] tracking-[-0.045em] text-brand-black">
              <span className="block">Daftarkan Pabrik</span>

              <span className="block">atau Garmen Anda.</span>
            </h1>

            <p className="mt-7 font-body text-sm leading-relaxed text-muted-moss">
              Ubah sisa produksi tekstil Anda menjadi material bernilai dan
              hubungkan bisnis Anda dengan ekosistem sirkular Muri.
            </p>
          </div>

          {/* Error alert */}
          {error && (
            <Alert
              variant="destructive"
              className="mb-6 rounded-xl border-error-rust/20 bg-error-rust/[0.05]"
            >
              <AlertCircle className="size-4" />

              <AlertDescription className="text-sm leading-relaxed">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Company name */}
            <div className="space-y-2">
              <label
                htmlFor="company-name"
                className="text-xs font-bold text-brand-black"
              >
                Nama Pabrik / Garmen
              </label>

              <Input
                id="company-name"
                type="text"
                variant="auth"
                size="auth"
                autoComplete="organization"
                placeholder="Masukkan nama pabrik atau garmen"
                value={companyName}
                onChange={(event) => setCompanyName(event.target.value)}
                required
                disabled={isLoading}
                endIcon={<Factory strokeWidth={1.7} />}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="provider-email"
                className="text-xs font-bold text-brand-black"
              >
                Email
              </label>

              <Input
                id="provider-email"
                type="email"
                variant="auth"
                size="auth"
                autoComplete="email"
                placeholder="Masukkan email untuk pabrik/garmen Anda"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                disabled={isLoading}
                endIcon={<Mail strokeWidth={1.7} />}
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label
                htmlFor="active-number"
                className="text-xs font-bold text-brand-black"
              >
                Nomor Aktif
              </label>

              <Input
                id="active-number"
                type="tel"
                variant="auth"
                size="auth"
                autoComplete="tel"
                inputMode="tel"
                placeholder="Contoh: 081234567890"
                value={activeNumber}
                onChange={(event) => setActiveNumber(event.target.value)}
                required
                disabled={isLoading}
                endIcon={<Phone strokeWidth={1.7} />}
              />
            </div>
            <div className="space-y-2 animate-fade-in" ref={provinceRef}>
              <label className="text-xs font-bold text-brand-black">
                Provinsi
              </label>
              <div className="relative">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() =>
                    setIsProvinceDropdownOpen(!isProvinceDropdownOpen)
                  }
                  className="flex w-full items-center justify-between rounded-sm border border-line-trace bg-transparent font-body text-brand-black shadow-none h-12 px-5 text-xs text-left outline-none focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 disabled:bg-canvas-warm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span
                    className={
                      selectedProvince
                        ? "text-brand-black"
                        : "text-muted-moss/60 font-normal"
                    }
                  >
                    {selectedProvince || "Pilih Provinsi"}
                  </span>
                  <ChevronDown className="size-4 text-muted-moss" />
                </button>

                {isProvinceDropdownOpen && (
                  <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-sm border border-line-trace bg-canvas-pure p-1 shadow-md">
                    <div className="p-1 border-b border-line-trace mb-1">
                      <input
                        type="text"
                        placeholder="Cari provinsi..."
                        value={provinceSearch}
                        onChange={(e) => setProvinceSearch(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-sm border border-line-trace bg-transparent outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald text-brand-black"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="max-h-40 overflow-y-auto">
                      {filteredProvinces.length > 0 ? (
                        filteredProvinces.map((prov: IndonesiaProvince) => (
                          <button
                            key={prov.province}
                            type="button"
                            onClick={() => {
                              setSelectedProvince(prov.province);
                              setSelectedRegency("");
                              setRegencySearch("");
                              setIsProvinceDropdownOpen(false);
                              setProvinceSearch("");
                            }}
                            className="flex w-full cursor-default items-center rounded-sm py-2 px-3 text-xs hover:bg-canvas-warm/50 text-left text-brand-black"
                          >
                            {prov.province}
                          </button>
                        ))
                      ) : (
                        <div className="py-2 px-3 text-xs text-muted-moss text-center">
                          Tidak ditemukan
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2 animate-fade-in" ref={regencyRef}>
              <label className="text-xs font-bold text-brand-black">
                Kabupaten
              </label>
              <div className="relative">
                <button
                  type="button"
                  disabled={isLoading || !selectedProvince}
                  onClick={() =>
                    setIsRegencyDropdownOpen(!isRegencyDropdownOpen)
                  }
                  className="flex w-full items-center justify-between rounded-sm border border-line-trace bg-transparent font-body text-brand-black shadow-none h-12 px-5 text-xs text-left outline-none focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 disabled:bg-canvas-warm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span
                    className={
                      selectedRegency
                        ? "text-brand-black"
                        : "text-muted-moss/60 font-normal"
                    }
                  >
                    {selectedRegency ||
                      (selectedProvince
                        ? "Pilih Kabupaten/Kota"
                        : "Pilih Provinsi terlebih dahulu")}
                  </span>
                  <ChevronDown className="size-4 text-muted-moss" />
                </button>

                {isRegencyDropdownOpen && selectedProvince && (
                  <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-sm border border-line-trace bg-canvas-pure p-1 shadow-md">
                    <div className="p-1 border-b border-line-trace mb-1">
                      <input
                        type="text"
                        placeholder="Cari kabupaten/kota..."
                        value={regencySearch}
                        onChange={(e) => setRegencySearch(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-sm border border-line-trace bg-transparent outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald text-brand-black"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="max-h-40 overflow-y-auto">
                      {filteredRegencies.length > 0 ? (
                        filteredRegencies.map((regency: string) => (
                          <button
                            key={regency}
                            type="button"
                            onClick={() => {
                              setSelectedRegency(regency);
                              setIsRegencyDropdownOpen(false);
                              setRegencySearch("");
                            }}
                            className="flex w-full cursor-default items-center rounded-sm py-2 px-3 text-xs hover:bg-canvas-warm/50 text-left text-brand-black"
                          >
                            {regency}
                          </button>
                        ))
                      ) : (
                        <div className="py-2 px-3 text-xs text-muted-moss text-center">
                          Tidak ditemukan
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label
                htmlFor="provider-password"
                className="text-xs font-bold text-brand-black"
              >
                Kata Sandi
              </label>

              <Input
                id="provider-password"
                type="password"
                variant="auth"
                size="auth"
                autoComplete="new-password"
                placeholder="Minimal 8 karakter"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={8}
                disabled={isLoading}
                endIcon={<KeyRound strokeWidth={1.7} />}
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="auth-primary"
              size="auth"
              loading={isLoading}
              disabled={isLoading}
              className="w-full"
            >
              Daftar Sekarang
            </Button>
          </form>

          {/* Footer */}
          <AuthFooterLink
            text="Sudah memiliki akun waste provider?"
            linkText="Masuk di sini"
            href={`/waste-providers/login?from=/waste-providers/register&next=${encodeURIComponent(nextPath)}`}
          />
        </div>
      </div>
    </div>
  );
}
