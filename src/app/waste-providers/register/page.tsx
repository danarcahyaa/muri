"use client";

import * as React from "react";
import { useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { registerWasteProvider } from "@/services/waste-providers/authService";
import { BackLink } from "@/components/ui/BackLink";
import { AuthFooterLink } from "@/components/ui/AuthFooterLink";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function WasteProviderRegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromPath = searchParams.get("from") || "/";

  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [activeNumber, setActiveNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (error) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!companyName.trim()) {
      setError("Nama pabrik/garmen wajib diisi.");
      setIsLoading(false);
      return;
    }

    if (!email.trim()) {
      setError("Email bisnis wajib diisi.");
      setIsLoading(false);
      return;
    }

    if (!activeNumber.trim()) {
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
        companyName: companyName.trim(),
        email: email.trim(),
        activeNumber: activeNumber.trim(),
        password,
      });

      if (!response.success) {
        setError(response.error || "Gagal melakukan pendaftaran.");
        return;
      }

      toast.success(response.message || "Pendaftaran pabrik berhasil!");

      setCompanyName("");
      setEmail("");
      setActiveNumber("");
      setPassword("");

      router.push("/waste-providers/login");
    } catch {
      setError("Terjadi kesalahan. Silakan coba kembali beberapa saat lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-6">
        {/* Back Link */}
        <div className="flex justify-start">
          <BackLink
            href={fromPath}
            label={searchParams.get("from") ? "Kembali" : "Kembali ke Beranda"}
          />
        </div>

        {/* Form Container */}
        <div className="w-full">
          {/* Header */}
          <div className="mb-8 flex flex-col items-center text-center">
            <Image
              src="/logo.svg"
              alt="Muri Logo"
              width={48}
              height={48}
              priority
              className="mb-4 size-12 object-contain"
            />
            <h1 className="font-display text-2xl font-bold tracking-tight text-brand-black sm:text-3xl">
              Daftarkan Pabrik / Garmen
            </h1>
            <p className="mt-2 font-body text-sm text-muted-moss/90 leading-relaxed">
              Ubah sisa produksi tekstil Anda menjadi bahan baku bernilai bagi industri sirkular MURI.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="size-4" />
              <AlertDescription className="text-sm leading-relaxed">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nama Pabrik / Garmen */}
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
                placeholder="Masukkan nama pabrik atau garmen..."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {/* Email Bisnis */}
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
                placeholder="Masukkan email bisnis..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {/* Nomor Aktif */}
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
                placeholder="Contoh: 081234567890"
                value={activeNumber}
                onChange={(e) => setActiveNumber(e.target.value)}
                required
                disabled={isLoading}
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
                placeholder="Minimal 8 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                disabled={isLoading}
              />
            </div>

            {/* Action Button */}
            <div className="pt-2">
              <Button
                variant="solid-black"
                type="submit"
                loading={isLoading}
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2"
              >
                <span>Daftar</span>
              </Button>
            </div>
          </form>

          {/* Footer Secondary Link */}
          <AuthFooterLink
            text="Sudah memiliki akun penyedia limbah?"
            linkText="Masuk di sini"
            href="/waste-providers/login"
          />
        </div>
      </div>
    </div>
  );
}
