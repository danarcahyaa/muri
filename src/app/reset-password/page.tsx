"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, KeyRound, Leaf } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/lib/supabaseClient";
import { translateSupabaseError } from "@/lib/supabaseError";
import { updatePassword } from "@/services/customer/auth/authService";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [isCheckingLink, setIsCheckingLink] = useState(true);
  const [isRecoveryReady, setIsRecoveryReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const hashParams = new URLSearchParams(
      window.location.hash.replace(/^#/, ""),
    );

    const queryParams = new URLSearchParams(window.location.search);

    const recoveryError =
      hashParams.get("error_description") ||
      queryParams.get("error_description");

    if (recoveryError) {
      setError(recoveryError);
      setIsCheckingLink(false);
      return;
    }

    function handleValidSession() {
      if (!isMounted) return;

      setIsRecoveryReady(true);
      setIsCheckingLink(false);
      setError(null);
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;

      if (
        event === "PASSWORD_RECOVERY" ||
        ((event === "INITIAL_SESSION" || event === "SIGNED_IN") && session)
      ) {
        handleValidSession();
      }
    });

    void supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!isMounted) return;

      if (sessionError) {
        setError(translateSupabaseError(sessionError));
        setIsCheckingLink(false);
        return;
      }

      if (data.session) {
        handleValidSession();
        return;
      }

      setError(
        "Tautan reset password tidak valid atau sudah kedaluwarsa. Silakan minta tautan baru.",
      );
      setIsCheckingLink(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);

    if (password.length < 8) {
      setError("Password baru harus minimal 8 karakter.");
      return;
    }

    if (password !== passwordConfirmation) {
      setError("Konfirmasi password tidak sama dengan password baru.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await updatePassword(password);

      if (!response.success) {
        setError(response.error || "Gagal memperbarui password.");
        return;
      }

      toast.success(
        response.message ||
          "Password berhasil diperbarui. Silakan masuk kembali.",
      );

      router.replace("/login");
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
                Password Baru
              </span>
            </div>

            <h1 className="font-display text-5xl font-medium leading-[1.08] tracking-[-0.045em] text-brand-black">
              Atur Ulang Password.
            </h1>

            <p className="mt-7 text-sm leading-relaxed text-muted-moss">
              Buat password baru dengan minimal delapan karakter.
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

          {isCheckingLink && (
            <div className="py-8 text-center text-sm text-muted-moss">
              Memeriksa tautan reset password...
            </div>
          )}

          {!isCheckingLink && !isRecoveryReady && (
            <div className="space-y-5">
              <p className="text-sm leading-relaxed text-muted-moss">
                Silakan minta tautan reset password yang baru.
              </p>

              <Link
                href="/forgot-password"
                className="block rounded-sm bg-brand-black px-5 py-4 text-center text-xs font-bold text-white transition hover:bg-brand-forest"
              >
                Minta Tautan Baru
              </Link>
            </div>
          )}

          {!isCheckingLink && isRecoveryReady && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <PasswordInput
                id="new-password"
                label="Password Baru"
                autoComplete="new-password"
                placeholder="Masukkan password baru"
                value={password}
                onChange={setPassword}
                disabled={isLoading}
              />

              <PasswordInput
                id="confirm-password"
                label="Konfirmasi Password"
                autoComplete="new-password"
                placeholder="Ulangi password baru"
                value={passwordConfirmation}
                onChange={setPasswordConfirmation}
                disabled={isLoading}
              />

              <Button
                variant="solid-black"
                type="submit"
                loading={isLoading}
                disabled={isLoading}
                className="w-full rounded-sm py-6 text-xs font-bold transition duration-300 hover:-translate-y-0.5 hover:bg-brand-forest"
              >
                Simpan Password Baru
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
                Lindungi Akun Anda
              </span>
            </div>

            <h2 className="font-display text-4xl font-light leading-[1.08] tracking-[-0.045em] text-canvas-pure lg:text-5xl">
              Gunakan Password yang Kuat dan Aman.
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}

type PasswordInputProps = {
  id: string;
  label: string;
  autoComplete: string;
  placeholder: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
};

function PasswordInput({
  id,
  label,
  autoComplete,
  placeholder,
  value,
  disabled,
  onChange,
}: PasswordInputProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-xs font-bold text-brand-black">
        {label}
      </label>

      <div className="relative">
        <Input
          id={id}
          type="password"
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          minLength={8}
          required
          disabled={disabled}
          className="rounded-sm border-line-trace bg-transparent px-5 py-6 pr-12 text-xs text-brand-black shadow-none focus-visible:border-brand-emerald focus-visible:ring-2 focus-visible:ring-brand-emerald/10"
        />

        <KeyRound
          aria-hidden="true"
          className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted-moss/60"
          strokeWidth={1.7}
        />
      </div>
    </div>
  );
}
