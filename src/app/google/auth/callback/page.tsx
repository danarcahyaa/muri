"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, Leaf } from "lucide-react";

import { supabase } from "@/lib/supabaseClient";
import { Spinner } from "@/components/ui/spinner";
import { syncGoogleUser } from "@/services/common/userService";
import { translateSupabaseError } from "@/lib/supabaseError";

type AuthSource = "login" | "register";

export default function AuthCallbackPage() {
  const router = useRouter();

  const [statusText, setStatusText] = useState(
    "Menghubungkan akun Anda dengan Google...",
  );
  const [isError, setIsError] = useState(false);
  const [fromPage, setFromPage] = useState<AuthSource>("login");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const source: AuthSource =
      params.get("from") === "register" ? "register" : "login";

    setFromPage(source);

    let isActive = true;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let unsubscribeAuth: (() => void) | null = null;

    async function processAuthenticatedUser(
      user: NonNullable<
        Awaited<ReturnType<typeof supabase.auth.getUser>>["data"]["user"]
      >,
    ) {
      if (!isActive) return;

      setStatusText("Memverifikasi profil pengguna...");

      await syncGoogleUser(user);

      if (!isActive) return;

      setStatusText("Autentikasi berhasil. Mengalihkan ke beranda...");

      window.setTimeout(() => {
        window.location.assign("/");
      }, 500);
    }

    async function handleAuthCallback() {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (session?.user) {
          await processAuthenticatedUser(session.user);
          return;
        }

        setStatusText("Menunggu konfirmasi autentikasi...");

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, updatedSession) => {
          if (!updatedSession?.user || !isActive) return;

          try {
            await processAuthenticatedUser(updatedSession.user);
            subscription.unsubscribe();
          } catch (error: unknown) {
            console.error("Gagal menyinkronkan profil pengguna Google:", error);

            if (!isActive) return;

            setIsError(true);
            setStatusText(translateSupabaseError(error));
            subscription.unsubscribe();
          }
        });

        unsubscribeAuth = () => subscription.unsubscribe();

        timeoutId = setTimeout(() => {
          if (!isActive) return;

          subscription.unsubscribe();
          setIsError(true);
          setStatusText(
            "Sesi autentikasi kedaluwarsa atau tidak valid. Silakan coba kembali.",
          );
        }, 10000);
      } catch (error: unknown) {
        console.error("Kesalahan saat memproses callback autentikasi:", error);

        if (!isActive) return;

        setIsError(true);
        setStatusText(translateSupabaseError(error));
      }
    }

    void handleAuthCallback();

    return () => {
      isActive = false;

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      unsubscribeAuth?.();
    };
  }, []);

  const returnLabel =
    fromPage === "register"
      ? "Kembali ke Pendaftaran"
      : "Kembali ke Halaman Masuk";

  return (
    <main className="relative isolate flex min-h-svh items-center justify-center overflow-hidden bg-canvas-warm p-6 selection:bg-brand-lime/30">
      <CallbackBackground />

      <section className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-line-trace bg-canvas-pure">
        <div className="p-7 text-center sm:p-10">
          {/* Logo */}
          <button
            type="button"
            onClick={() => router.push("/")}
            aria-label="Kembali ke halaman utama Muri"
            className="mx-auto inline-flex items-center gap-2"
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
          </button>

          {/* Eyebrow */}
          <div
            className={`mt-10 flex items-center justify-center gap-3 ${
              isError ? "text-error-rust" : "text-brand-emerald"
            }`}
          >
            {isError ? (
              <AlertCircle className="size-4" strokeWidth={2} />
            ) : (
              <Leaf className="size-4" strokeWidth={2} />
            )}

            <span className="text-xs font-bold uppercase tracking-tight">
              {isError
                ? "Autentikasi Tidak Berhasil"
                : "Memverifikasi Akun Muri"}
            </span>
          </div>

          {/* Status icon */}
          <div className="my-8 flex justify-center">
            {isError ? (
              <div className="flex size-16 items-center justify-center rounded-full border border-error-rust/15 bg-error-rust/[0.06] text-error-rust">
                <AlertCircle className="size-7" strokeWidth={1.8} />
              </div>
            ) : (
              <div className="relative flex size-16 items-center justify-center rounded-full border border-brand-emerald/15 bg-brand-emerald/[0.05]">
                <Spinner className="size-7 text-brand-emerald" />

                <span className="absolute inset-1 animate-pulse rounded-full border border-brand-lime/20" />
              </div>
            )}
          </div>

          {/* Heading */}
          <h1 className="font-display text-3xl font-medium leading-tight tracking-[-0.04em] text-brand-black sm:text-4xl">
            {isError ? (
              <>
                Autentikasi
                <br />
                tidak berhasil.
              </>
            ) : (
              <>
                Sedang menghubungkan
                <br />
                akun Anda.
              </>
            )}
          </h1>

          {/* Status message */}
          <p
            aria-live="polite"
            className={`mx-auto mt-5 max-w-xs text-xs leading-relaxed sm:text-sm ${
              isError ? "text-error-rust" : "text-muted-moss"
            }`}
          >
            {statusText}
          </p>

          {/* Loading progress */}
          {!isError && (
            <div className="mx-auto mt-8 h-1 w-full max-w-xs overflow-hidden rounded-full bg-brand-emerald/10">
              <div className="h-full w-2/3 animate-pulse rounded-full bg-brand-lime" />
            </div>
          )}

          {/* Error action */}
          {isError && (
            <button
              type="button"
              onClick={() => router.push(`/${fromPage}`)}
              className="
                group mt-8 inline-flex w-full items-center justify-center gap-2
                rounded-sm bg-brand-black px-5 py-4
                text-xs font-bold text-canvas-pure
                transition duration-300
                hover:-translate-y-0.5
                hover:bg-brand-forest
              "
            >
              <ArrowLeft
                className="size-4 transition-transform duration-300 group-hover:-translate-x-1"
                strokeWidth={2}
              />

              {returnLabel}
            </button>
          )}
        </div>

        <div className="border-t border-line-trace bg-canvas-warm/40 px-7 py-4 text-center">
          <p className="text-[10px] leading-relaxed text-muted-moss/70">
            Jangan tutup halaman ini selama proses autentikasi berlangsung.
          </p>
        </div>
      </section>
    </main>
  );
}

function CallbackBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute -left-64 -top-64 size-[32rem] rounded-full bg-brand-lime/[0.08] blur-[140px]" />

      <div className="absolute -bottom-64 -right-64 size-[32rem] rounded-full bg-brand-emerald/[0.08] blur-[140px]" />

      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-canvas-warm/40 to-brand-emerald/[0.025]" />
    </div>
  );
}
