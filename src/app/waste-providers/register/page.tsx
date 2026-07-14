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
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { BackLink } from "@/components/ui/BackLink";
import { AuthFooterLink } from "@/components/ui/AuthFooterLink";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { registerWasteProvider } from "@/services/waste-providers/authService";

function getSafeInternalPath(
  value: string | null,
  fallback: string,
) {
  if (
    value &&
    value.startsWith("/") &&
    !value.startsWith("//")
  ) {
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

  const nextPath = getSafeInternalPath(
    searchParams.get("next"),
    "/dashboard",
  );

  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [activeNumber, setActiveNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (error) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [error]);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
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
      });

      if (!response.success) {
        setError(
          response.error || "Gagal melakukan pendaftaran.",
        );
        return;
      }

      toast.success(
        response.message ||
          "Pendaftaran waste provider berhasil!",
      );

      setCompanyName("");
      setEmail("");
      setActiveNumber("");
      setPassword("");

      const loginParams = new URLSearchParams({
        from: "/waste-providers/register",
        next: nextPath,
      });

      router.push(
        `/waste-providers/login?${loginParams.toString()}`,
      );
    } catch {
      setError(
        "Terjadi kesalahan. Silakan coba kembali beberapa saat lagi.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas-pure px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-8">
        {/* Back link */}
        <div className="flex justify-start">
          <BackLink
            href={fromPath}
            label="Kembali"
          />
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
              <Leaf
                className="size-4"
                strokeWidth={2}
              />

              <span className="text-xs font-bold uppercase tracking-tight">
                Bergabung sebagai Waste Provider
              </span>
            </div>

            <h1 className="font-display text-5xl font-medium leading-[1.08] tracking-[-0.045em] text-brand-black">
              <span className="block">
                Daftarkan Pabrik
              </span>

              <span className="block">
                atau Garmen Anda.
              </span>
            </h1>

            <p className="mt-7 font-body text-sm leading-relaxed text-muted-moss">
              Ubah sisa produksi tekstil Anda menjadi material
              bernilai dan hubungkan bisnis Anda dengan
              ekosistem sirkular Muri.
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
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
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
                onChange={(event) =>
                  setCompanyName(event.target.value)
                }
                required
                disabled={isLoading}
                endIcon={
                  <Factory strokeWidth={1.7} />
                }
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="provider-email"
                className="text-xs font-bold text-brand-black"
              >
                Email Bisnis/Pabrik
              </label>

              <Input
                id="provider-email"
                type="email"
                variant="auth"
                size="auth"
                autoComplete="email"
                placeholder="Masukkan email bisnis Anda"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
                disabled={isLoading}
                endIcon={
                  <Mail strokeWidth={1.7} />
                }
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
                onChange={(event) =>
                  setActiveNumber(event.target.value)
                }
                required
                disabled={isLoading}
                endIcon={
                  <Phone strokeWidth={1.7} />
                }
              />
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
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
                minLength={8}
                disabled={isLoading}
                endIcon={
                  <KeyRound strokeWidth={1.7} />
                }
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
            href={{
              pathname: "/waste-providers/login",
              query: {
                from: "/waste-providers/register",
                next: nextPath,
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}