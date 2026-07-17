"use client";

import * as React from "react";
import {
  AlertCircle,
  Factory,
  KeyRound,
  Mail,
  Phone,
} from "lucide-react";
import { INDONESIA_PROVINCES } from "@/data/indonesiaRegions";
import type { IndonesiaProvince } from "@/types/common";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { RegionSelect } from "@/components/ui/RegionSelect";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRegisterForm } from "@/hooks/waste-providers/useRegisterForm";

interface RegisterFormProps {
  nextPath: string;
}

/**
 * Full registration form for waste providers.
 * Consumes `useRegisterForm` for all state and submit logic.
 */
export function RegisterForm({ nextPath }: RegisterFormProps) {
  const {
    companyName,
    email,
    activeNumber,
    password,
    selectedProvince,
    selectedRegency,
    error,
    isLoading,
    setCompanyName,
    setEmail,
    setActiveNumber,
    setPassword,
    setSelectedProvince,
    setSelectedRegency,
    handleSubmit,
  } = useRegisterForm(nextPath);

  // Scroll to top whenever an error is set so the user sees the alert
  React.useEffect(() => {
    if (error) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [error]);

  // Derive regency list from the selected province
  const regencyOptions =
    INDONESIA_PROVINCES.find(
      (p: IndonesiaProvince) => p.province === selectedProvince,
    )?.regencies ?? [];

  const handleProvinceChange = (province: string) => {
    setSelectedProvince(province);
    // Reset regency whenever province changes
    setSelectedRegency("");
  };

  return (
    <>
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

        {/* Province */}
        <RegionSelect
          label="Provinsi"
          placeholder="Pilih Provinsi"
          value={selectedProvince}
          options={INDONESIA_PROVINCES.map((p: IndonesiaProvince) => p.province)}
          onChange={handleProvinceChange}
          disabled={isLoading}
          searchPlaceholder="Cari provinsi..."
        />

        {/* Regency — disabled until a province is selected */}
        <RegionSelect
          label="Kabupaten"
          placeholder={
            selectedProvince ? "Pilih Kabupaten/Kota" : "Pilih Provinsi terlebih dahulu"
          }
          value={selectedRegency}
          options={regencyOptions}
          onChange={setSelectedRegency}
          disabled={isLoading || !selectedProvince}
          searchPlaceholder="Cari kabupaten/kota..."
        />

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
    </>
  );
}
