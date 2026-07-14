"use client";

import * as React from "react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
      toast.error("Email bisnis wajib diisi.");
      setIsLoading(false);
      return;
    }

    if (!password) {
      toast.error("Kata sandi wajib diisi.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await loginBrand({
        email: email.trim(),
        password,
      });

      if (!response.success) {
        setError(response.error || "Gagal masuk ke akun brand.");
        return;
      }

      toast.success(response.message || "Berhasil masuk!");

      setTimeout(() => {
        router.replace(getLoginDestination());
      }, 1000);
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
          <Link
            href={fromPath}
            className="group inline-flex items-center gap-2 text-xs font-bold text-brand-emerald transition-colors hover:text-brand-forest"
          >
            <ArrowLeft className="size-3.5 transition-transform duration-300 group-hover:-translate-x-0.5" />
            <span>
              {searchParams.get("from") ? "Kembali" : "Kembali ke Beranda"}
            </span>
          </Link>
        </div>

        {/* Form Container (No Card) */}
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
              Masuk ke Akun Brand
            </h1>
            <p className="mt-2 font-body text-sm text-muted-moss/90 leading-relaxed">
              Masuk kembali untuk mengelola rantai pasok sirkular, memantau dampak lingkungan, dan mengembangkan bisnis berkelanjutan Anda.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert
              variant="destructive"
              className="mb-6"
            >
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
                htmlFor="brand-email"
                className="text-xs font-bold text-brand-black"
              >
                Email Bisnis/Brand
              </label>
              <Input
                id="brand-email"
                type="email"
                placeholder="Masukkan email brand..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="brand-password"
                  className="text-xs font-bold text-brand-black"
                >
                  Kata Sandi
                </label>
              </div>
              <Input
                id="brand-password"
                type="password"
                placeholder="Masukkan kata sandi..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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
                <span>Masuk</span>
              </Button>
            </div>
          </form>

          {/* Footer Secondary Link */}
          <div className="mt-8 border-t border-line-trace/40 pt-6 text-center text-xs text-muted-moss">
            <span>Belum memiliki akun brand? </span>
            <Link
              href="/brand/register"
              className="font-bold text-brand-emerald transition-colors hover:text-brand-forest"
            >
              Daftar di sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
