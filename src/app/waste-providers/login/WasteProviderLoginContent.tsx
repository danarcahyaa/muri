"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, KeyRound, Leaf, Mail } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { BackLink } from "@/components/ui/BackLink";
import { AuthFooterLink } from "@/components/ui/AuthFooterLink";

import { translateSupabaseError } from "@/lib/supabaseError";
import { loginWasteProvider } from "@/services/waste-providers/authService";

function getSafeInternalPath(
  value: string | null,
  fallback: string,
): string {
  if (value && value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }

  return fallback;
}

/**
 * Waste provider hanya boleh diarahkan ke route
 * yang berada di bawah /waste-providers.
 */
function getWasteProviderLoginDestination(
  nextPath: string | null,
): string {
  const fallback = "/waste-providers/dashboard";

  const safeNextPath = getSafeInternalPath(nextPath, fallback);

  const belongsToWasteProvider =
    safeNextPath === "/waste-providers" ||
    safeNextPath.startsWith("/waste-providers/");

  return belongsToWasteProvider ? safeNextPath : fallback;
}

export default function WasteProviderLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const fromPath = getSafeInternalPath(
    searchParams.get("from"),
    "/",
  );

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (!error) {
      return;
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [error]);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
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
      const response = await loginWasteProvider({
        email: normalizedEmail,
        password,
      });

      if (!response.success) {
        setError(
          response.error ||
            "Gagal masuk ke akun penyedia limbah.",
        );

        return;
      }

      const destination = getWasteProviderLoginDestination(
        searchParams.get("next"),
      );

      toast.success(response.message || "Berhasil masuk!");

      router.replace(destination);
      router.refresh();
    } catch (err: unknown) {
      setError(translateSupabaseError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas-pure px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-8">
        <div className="flex justify-start">
          <BackLink
            href={fromPath}
            label={
              searchParams.get("from")
                ? "Kembali"
                : "Kembali ke Beranda"
            }
          />
        </div>

        <div className="mx-auto w-full max-w-sm">
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

          <div className="mb-10">
            <div className="mb-4 flex items-center gap-3 text-brand-emerald">
              <Leaf
                aria-hidden="true"
                className="size-4"
                strokeWidth={2}
              />

              <span className="text-xs font-bold uppercase tracking-tight">
                Mitra Penyedia Limbah
              </span>
            </div>

            <h1 className="font-display text-5xl font-medium leading-[1.08] tracking-[-0.045em] text-brand-black">
              <span className="block">Masuk ke Akun</span>
              <span className="block">Mitra Anda.</span>
            </h1>

            <p className="mt-7 font-body text-sm leading-relaxed text-muted-moss">
              Kelola sisa tekstil, pantau dampak lingkungan, dan
              berkolaborasi dalam ekosistem sirkular bersama Muri.
            </p>
          </div>

          {error && (
            <Alert
              variant="destructive"
              className="mb-6 rounded-2xl"
            >
              <AlertCircle
                className="size-4"
                strokeWidth={2.1}
              />

              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
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
                endIcon={<Mail strokeWidth={1.7} />}
              />
            </div>

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
                autoComplete="current-password"
                placeholder="Masukkan kata sandi Anda"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
                disabled={isLoading}
                endIcon={<KeyRound strokeWidth={1.7} />}
              />
            </div>

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