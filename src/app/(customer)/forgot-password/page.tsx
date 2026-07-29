"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertCircle, ArrowLeft, CheckCircle2, Leaf, Mail } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { requestPasswordReset } from "@/services/customer/auth/authService";
import { translateSupabaseError } from "@/lib/supabaseError";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsLoading(true);
    setError(null);

    try {
      const response = await requestPasswordReset(email);

      if (!response.success) {
        setError(response.error || "Gagal mengirim tautan reset password.");
        return;
      }

      setIsSent(true);

      toast.success(response.message || "Tautan reset password telah dikirim.");
    } catch (err: unknown) {
      setError(translateSupabaseError(err));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 bg-canvas-warm md:grid-cols-2">
      <div className="flex min-h-screen flex-col bg-canvas-pure p-8 md:p-12 lg:p-16">
        <div className="mx-auto my-auto w-full max-w-sm py-8">
          <div className="mb-12 flex items-center justify-between gap-6">
            <Link
              href="/"
              aria-label="Muri"
              className="inline-flex items-center gap-2"
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
              href="/login"
              className="group inline-flex items-center gap-2 text-xs font-bold text-brand-emerald transition-colors hover:text-brand-forest"
            >
              <ArrowLeft
                className="size-3.5 transition-transform duration-300 group-hover:-translate-x-1"
                strokeWidth={2}
              />
              Kembali ke login
            </Link>
          </div>

          <div className="mb-10">
            <div className="mb-4 flex items-center gap-3 text-brand-emerald">
              <Leaf className="size-4" strokeWidth={2} />

              <span className="text-xs font-bold uppercase tracking-tight">
                Pemulihan Akun
              </span>
            </div>

            <h1 className="font-display text-5xl font-medium leading-[1.08] tracking-[-0.045em] text-brand-black">
              Lupa Password?
            </h1>

            <p className="mt-7 text-sm leading-relaxed text-muted-moss">
              Masukkan email akun Anda. Kami akan mengirimkan tautan untuk
              membuat password baru.
            </p>
          </div>

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

          {isSent ? (
            <div className="space-y-6">
              <Alert className="rounded-xl border-brand-emerald/20 bg-brand-emerald/[0.05]">
                <CheckCircle2 className="size-4 text-brand-emerald" />

                <AlertDescription className="text-sm leading-relaxed text-brand-black">
                  Jika email tersebut terdaftar, tautan reset password sudah
                  dikirim. Periksa inbox dan folder spam Anda.
                </AlertDescription>
              </Alert>

              <Button
                variant="outline"
                type="button"
                className="w-full rounded-sm py-6 text-xs font-bold"
                onClick={() => {
                  setIsSent(false);
                  setError(null);
                }}
              >
                Kirim Ulang Tautan
              </Button>

              <Link
                href="/login"
                className="block text-center text-xs font-bold text-brand-emerald hover:text-brand-forest"
              >
                Kembali ke halaman login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="forgot-email"
                  className="text-xs font-bold text-brand-black"
                >
                  Email
                </label>

                <div className="relative">
                  <Input
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    placeholder="Masukkan alamat email Anda"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    disabled={isLoading}
                    className="rounded-sm border-line-trace bg-transparent px-5 py-6 pr-12 text-xs text-brand-black shadow-none focus-visible:border-brand-emerald focus-visible:ring-2 focus-visible:ring-brand-emerald/10"
                  />

                  <Mail
                    aria-hidden="true"
                    className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted-moss/60"
                    strokeWidth={1.7}
                  />
                </div>
              </div>

              <Button
                variant="solid-black"
                type="submit"
                loading={isLoading}
                disabled={isLoading}
                className="w-full rounded-sm py-6 text-xs font-bold transition duration-300 hover:-translate-y-0.5 hover:bg-brand-forest"
              >
                Kirim Tautan Reset
              </Button>
            </form>
          )}
        </div>
      </div>

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
                Keamanan Akun
              </span>
            </div>

            <h2 className="font-display text-4xl font-light leading-[1.08] tracking-[-0.045em] text-canvas-pure lg:text-5xl">
              Pulihkan Akses ke Akun Muri Anda.
            </h2>

            <p className="mt-6 max-w-md text-sm leading-relaxed text-canvas-pure/65 lg:text-base">
              Gunakan tautan yang kami kirimkan untuk membuat password baru dan
              kembali melanjutkan kontribusi Anda.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
