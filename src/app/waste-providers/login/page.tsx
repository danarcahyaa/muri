"use client";

import * as React from "react";
import { useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { loginWasteProvider } from "@/services/waste-providers/authService";
import { translateSupabaseError } from "@/lib/supabaseError";
import { BackLink } from "@/components/ui/BackLink";
import { AuthFooterLink } from "@/components/ui/AuthFooterLink";

export default function WasteProviderLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromPath = searchParams.get("from") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (error) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [error]);

  const getLoginDestination = (): string => {
    const nextPath = searchParams.get("next");
    if (nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")) {
      return nextPath;
    }
    return "/dashboard";
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!email.trim()) {
      setError("Email bisnis wajib diisi.");
      setIsLoading(false);
      return;
    }

    if (!password) {
      setError("Kata sandi wajib diisi.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await loginWasteProvider({
        email: email.trim(),
        password,
      });

      if (!response.success) {
        setError(response.error || "Gagal masuk ke akun penyedia limbah.");
        return;
      }

      toast.success(response.message || "Berhasil masuk!");
      router.replace(getLoginDestination());
    } catch (err: unknown) {
      setError(translateSupabaseError(err));
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
              Masuk Akun Penyedia Limbah
            </h1>
            <p className="mt-2 font-body text-sm text-muted-moss/90 leading-relaxed">
              Masuk kembali untuk mengelola sisa tekstil, memantau dampak lingkungan, dan berkolaborasi dalam ekosistem sirkular MURI.
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
                placeholder="Masukkan email bisnis..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                placeholder="Masukkan kata sandi Anda..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2">
              <Button
                variant="solid-black"
                type="submit"
                loading={isLoading}
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2"
              >
                <span>Masuk</span>
              </Button>
            </div>
          </form>

          {/* Footer Secondary Link */}
          <AuthFooterLink
            text="Belum memiliki akun penyedia limbah?"
            linkText="Daftar di sini"
            href="/waste-providers/register"
          />
        </div>
      </div>
    </div>
  );
}
