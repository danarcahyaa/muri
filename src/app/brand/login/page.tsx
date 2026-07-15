"use client";

import * as React from "react";
import { useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, KeyRound, Leaf, Mail } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BackLink } from "@/components/ui/BackLink";
import { AuthFooterLink } from "@/components/ui/AuthFooterLink";

import { loginBrand } from "@/services/brand-fashion/auth/authService";
import { translateSupabaseError } from "@/lib/supabaseError";

export default function BrandLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const fromPath = searchParams.get("from") || "/";

  const [email, setEmail] = useState("");
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

  const getLoginDestination = (): string => {
    const nextPath = searchParams.get("next");

    if (nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")) {
      return nextPath;
    }

    return "/brand/dashboard";
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsLoading(true);
    setError(null);

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
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
      const response = await loginBrand({
        email: normalizedEmail,
        password,
      });

      if (!response.success) {
        setError(response.error || "Gagal masuk ke akun brand.");
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas-pure px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-8">
        {/* Back link */}
        <div className="flex justify-start">
          <BackLink
            href={fromPath}
            label={searchParams.get("from") ? "Kembali" : "Kembali ke Beranda"}
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
              <Leaf className="size-4" strokeWidth={2} />

              <span className="text-xs font-bold uppercase tracking-tight">
                Brand Partner
              </span>
            </div>

            <h1 className="font-display text-5xl font-medium leading-[1.08] tracking-[-0.045em] text-brand-black">
              <span className="block">Masuk ke Akun</span>

              <span className="block">Brand Anda.</span>
            </h1>

            <p className="mt-7 font-body text-sm leading-relaxed text-muted-moss">
              Kelola rantai pasok sirkular, pantau dampak lingkungan, dan
              kembangkan bisnis berkelanjutan bersama Muri.
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
            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="brand-email"
                className="text-xs font-bold text-brand-black"
              >
                Email Bisnis/Brand
              </label>

              <Input
                id="brand-email"
                type="email"
                variant="auth"
                size="auth"
                autoComplete="email"
                placeholder="Masukkan email bisnis Anda"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                disabled={isLoading}
                endIcon={<Mail strokeWidth={1.7} />}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label
                htmlFor="brand-password"
                className="text-xs font-bold text-brand-black"
              >
                Kata Sandi
              </label>

              <Input
                id="brand-password"
                type="password"
                variant="auth"
                size="auth"
                autoComplete="current-password"
                placeholder="Masukkan kata sandi Anda"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                disabled={isLoading}
                endIcon={<KeyRound strokeWidth={1.7} />}
              />
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              variant="auth-primary"
              size="auth"
              loading={isLoading}
              disabled={isLoading}
              className="w-full"
            >
              Masuk Sekarang
            </Button>
          </form>

          {/* Footer link */}
          <AuthFooterLink
            text="Belum memiliki akun brand?"
            linkText="Daftar di sini"
            href="/brand/register"
          />
        </div>
      </div>
    </div>
  );
}
