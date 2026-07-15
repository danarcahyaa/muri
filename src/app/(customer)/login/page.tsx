"use client";

import * as React from "react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertCircle, Leaf, Mail, KeyRound, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  signInWithEmail,
  signInWithGoogle,
} from "@/services/customer/auth/authService";
import { translateSupabaseError } from "@/lib/supabaseError";

export default function LoginPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsLoading(true);
    setError(null);

    try {
      const response = await signInWithEmail({
        email,
        password,
      });

      if (!response.success) {
        setError(response.error || "Gagal masuk ke akun.");
        return;
      }

      toast.success(response.message || "Berhasil masuk!");

      setTimeout(() => {
        router.replace(getLoginDestination());
      }, 500);
    } catch (err: unknown) {
      setError(translateSupabaseError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await signInWithGoogle("login", getLoginDestination());
    } catch (err: unknown) {
      setError(translateSupabaseError(err));
      setIsLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 bg-canvas-warm md:grid-cols-2">
      {/* Left column */}
      <div className="flex min-h-screen flex-col justify-between bg-canvas-pure p-8 md:p-12 lg:p-16">
        <div className="mx-auto my-auto w-full max-w-sm py-8">
          {/* Logo */}
          <div className="mb-12 flex items-center justify-between gap-6">
            <Link
              href="/"
              aria-label="Muri"
              className="inline-flex shrink-0 items-center gap-2"
            >
              <Image
                src="/logo.png"
                alt="Logo Muri"
                width={40}
                height={40}
                priority
                className="size-10 object-contain"
              />

              <span className="font-display text-2xl font-medium tracking-tight text-brand-black">
                Muri
              </span>
            </Link>

            <Link
              href="/"
              className="
      group inline-flex items-center gap-2 whitespace-nowrap
      text-[11px] font-bold text-brand-emerald
      transition-colors hover:text-brand-forest
    "
            >
              <ArrowLeft
                className="size-3.5 transition-transform duration-300 group-hover:-translate-x-1"
                strokeWidth={2}
              />

              <span>Kembali ke beranda</span>
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-10">
            <div className="mb-4 flex items-center gap-3 text-brand-emerald">
              <Leaf className="size-4" strokeWidth={2} />

              <span className="text-xs font-bold uppercase tracking-tight">
                Selamat Datang Kembali
              </span>
            </div>

            <h1 className="font-display text-5xl font-medium leading-[1.08] tracking-[-0.045em] text-brand-black">
              <span className="block">Masuk ke Akun</span>
              <span className="block">Muri Anda.</span>
            </h1>

            <p className="mt-7 text-sm leading-relaxed text-muted-moss">
              Belum punya akun?{" "}
              <Link
                href="/register"
                className="font-bold text-brand-emerald transition-colors hover:text-brand-forest"
              >
                daftar di sini
              </Link>
            </p>
          </div>

          {/* Error */}
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
            <div className="space-y-2">
              <label
                htmlFor="login-email"
                className="text-xs font-bold text-brand-black"
              >
                Email
              </label>

              <div className="relative">
                <Input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="Masukkan alamat email Anda"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  disabled={isLoading}
                  className="
        rounded-sm border-line-trace bg-transparent
        px-5 py-6 pr-12
        font-body text-xs text-brand-black shadow-none
        placeholder:text-xs
        placeholder:font-normal
        placeholder:tracking-normal
        placeholder:text-muted-moss/60
        focus-visible:border-brand-emerald
        focus-visible:ring-2
        focus-visible:ring-brand-emerald/10
      "
                />

                <Mail
                  aria-hidden="true"
                  className="
        pointer-events-none absolute right-4 top-1/2 size-4
        -translate-y-1/2 text-muted-moss/60
      "
                  strokeWidth={1.7}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <label
                  htmlFor="login-password"
                  className="text-xs font-bold text-brand-black"
                >
                  Password
                </label>

                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-brand-emerald transition-colors hover:text-brand-forest"
                >
                  Lupa Password?
                </Link>
              </div>

              <div className="relative">
                <Input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Masukkan password Anda"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  disabled={isLoading}
                  className="
        rounded-sm border-line-trace bg-transparent
        px-5 py-6 pr-12
        font-body text-xs text-brand-black shadow-none
        placeholder:text-xs
        placeholder:font-normal
        placeholder:tracking-normal
        placeholder:text-muted-moss/60
        focus-visible:border-brand-emerald
        focus-visible:ring-2
        focus-visible:ring-brand-emerald/10
      "
                />

                <KeyRound
                  aria-hidden="true"
                  className="
        pointer-events-none absolute right-4 top-1/2 size-4
        -translate-y-1/2 text-muted-moss/60
      "
                  strokeWidth={1.7}
                />
              </div>
            </div>

            <Button
              variant="solid-black"
              type="submit"
              loading={isLoading}
              disabled={isLoading}
              className="
                w-full rounded-sm font-body text-xs font-bold py-6
                transition duration-300
                hover:-translate-y-0.5
                hover:bg-brand-forest
              "
            >
              Masuk Sekarang
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-line-trace" />
            </div>

            <div className="relative flex justify-center">
              <span className="bg-canvas-pure px-4 text-[11px] text-muted-moss">
                atau masuk dengan
              </span>
            </div>
          </div>

          {/* Google */}
          <Button
            variant="outline"
            type="button"
            className="
              w-full rounded-sm border-line-trace bg-transparent
              font-body text-xs font-semibold text-brand-black py-6
              shadow-none transition duration-300
              hover:-translate-y-0.5
              hover:border-brand-emerald
              hover:bg-canvas-warm
            "
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <GoogleIcon />

            <span className="font-bold">Lanjut dengan Google</span>
          </Button>
        </div>
      </div>

      {/* Right visual */}
      <div className="relative hidden min-h-screen overflow-hidden bg-brand-forest md:block">
        <Image
          src="/tree-bg.png"
          alt="Tree Background"
          fill
          priority
          className="object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-brand-black/80 via-brand-forest/25 to-brand-black/35" />

        <div className="absolute inset-0 flex flex-col justify-end p-12 text-canvas-pure lg:p-16">
          <div className="max-w-lg">
            <div className="mb-5 flex items-center gap-3 text-brand-lime">
              <Leaf className="size-4" strokeWidth={2} />

              <span className="text-xs font-bold uppercase tracking-tight">
                Kembali ke Alam
              </span>
            </div>

            <h2 className="font-display text-4xl font-light leading-[1.08] tracking-[-0.045em] text-canvas-pure lg:text-5xl">
              Setiap Langkah Kecilmu, Menyelamatkan Bumi Kita.
            </h2>

            <p className="mt-6 max-w-md text-sm leading-relaxed text-canvas-pure/65 lg:text-base">
              Masuk kembali ke ekosistem Muri dan lanjutkan kontribusimu dalam
              menekan emisi karbon, menghemat air bersih, serta memberi napas
              baru bagi material yang terbuang.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="mr-2 inline size-4" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />

      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />

      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />

      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function getLoginDestination() {
  const params = new URLSearchParams(window.location.search);
  const nextPath = params.get("next");

  if (nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")) {
    return nextPath;
  }

  return "/dashboard";
}
