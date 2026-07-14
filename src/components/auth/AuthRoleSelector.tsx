"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Factory,
  Leaf,
  UserRound,
} from "lucide-react";

type AuthMode = "login" | "register";

interface AuthRoleSelectorProps {
  mode: AuthMode;
}

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

export function AuthRoleSelector({
  mode,
}: AuthRoleSelectorProps) {
  const searchParams = useSearchParams();

  const fromPath = getSafeInternalPath(
    searchParams.get("from"),
    "/",
  );

  const nextPath = getSafeInternalPath(
    searchParams.get("next"),
    "/dashboard",
  );

  const isLogin = mode === "login";

  const customerPath = isLogin
    ? "/login"
    : "/register";

  const brandPath = isLogin
    ? "/brand/login"
    : "/brand/register";

  const wasteProviderPath = isLogin
    ? "/waste-providers/login"
    : "/waste-providers/register";

  /*
   * Saat user berada di halaman login/register role tertentu,
   * tombol kembali akan mengarah ke portal role ini.
   */
  const portalPath = isLogin
    ? "/auth/login"
    : "/auth/register";

  const portalParams = new URLSearchParams({
    from: fromPath,
    next: nextPath,
  });

  const returnToPortalPath =
    `${portalPath}?${portalParams.toString()}`;

  const commonQuery = {
    from: returnToPortalPath,
    next: nextPath,
  };

  return (
    <main className="min-h-screen bg-canvas-pure px-6 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl flex-col">
        {/* Top navigation */}
        <div className="flex items-center justify-between">
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
            href={fromPath}
            className="
              group inline-flex items-center gap-2
              text-[11px] font-bold
              text-brand-emerald
              transition-colors
              hover:text-brand-forest
            "
          >
            <ArrowLeft
              className="
                size-3.5 transition-transform
                group-hover:-translate-x-1
              "
              strokeWidth={2}
            />

            Kembali
          </Link>
        </div>

        {/* Content */}
        <div className="my-auto py-16">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 flex items-center justify-center gap-3 text-brand-emerald">
              <Leaf className="size-4" strokeWidth={2} />

              <span className="text-xs font-bold uppercase tracking-tight">
                {isLogin
                  ? "Selamat Datang Kembali"
                  : "Bergabung dengan Muri"}
              </span>
            </div>

            <h1 className="font-display text-4xl font-medium leading-[1.08] tracking-[-0.045em] text-brand-black sm:text-5xl">
              {isLogin
                ? "Anda ingin masuk sebagai apa?"
                : "Pilih cara Anda bergabung."}
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-muted-moss">
              {isLogin
                ? "Pilih jenis akun agar kami dapat mengarahkan Anda ke pengalaman yang sesuai."
                : "Customer, brand, dan waste provider memiliki proses pendaftaran serta fitur yang berbeda."}
            </p>
          </div>

          {/* Role cards */}
          <div className="mx-auto mt-12 grid max-w-6xl gap-5 md:grid-cols-2 lg:grid-cols-3">
            <RoleCard
              href={{
                pathname: customerPath,
                query: commonQuery,
              }}
              icon={<UserRound className="size-6" />}
              eyebrow="Untuk Pengguna"
              title="Customer"
              description={
                isLogin
                  ? "Masuk untuk melihat aktivitas, dampak, dan kontribusi sirkular Anda."
                  : "Buat akun pribadi untuk mulai berpartisipasi dalam ekosistem Muri."
              }
              action={
                isLogin
                  ? "Masuk sebagai Customer"
                  : "Daftar sebagai Customer"
              }
            />

            <RoleCard
              href={{
                pathname: brandPath,
                query: commonQuery,
              }}
              icon={<Building2 className="size-6" />}
              eyebrow="Untuk Bisnis"
              title="Brand"
              description={
                isLogin
                  ? "Masuk untuk mengelola data brand, rantai pasok, material, dan dampak."
                  : "Daftarkan bisnis Anda sebagai bagian dari ekosistem fesyen sirkular."
              }
              action={
                isLogin
                  ? "Masuk sebagai Brand"
                  : "Daftar sebagai Brand"
              }
            />

            <RoleCard
              href={{
                pathname: wasteProviderPath,
                query: commonQuery,
              }}
              icon={<Factory className="size-6" />}
              eyebrow="Untuk Pabrik & Garmen"
              title="Waste Provider"
              description={
                isLogin
                  ? "Masuk untuk mengelola limbah produksi, material tersedia, dan proses penyaluran."
                  : "Daftarkan pabrik atau garmen Anda untuk mengubah sisa produksi menjadi material bernilai."
              }
              action={
                isLogin
                  ? "Masuk sebagai Waste Provider"
                  : "Daftar sebagai Waste Provider"
              }
            />
          </div>
        </div>
      </div>
    </main>
  );
}

interface RoleCardProps {
  href: {
    pathname: string;
    query: {
      from: string;
      next: string;
    };
  };
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  action: string;
}

function RoleCard({
  href,
  icon,
  eyebrow,
  title,
  description,
  action,
}: RoleCardProps) {
  return (
    <Link
      href={href}
      className="
        group flex min-h-72 flex-col
        rounded-sm border border-line-trace
        bg-canvas-pure p-7
        transition duration-300

        hover:-translate-y-1
        hover:border-brand-emerald
        hover:shadow-xl
        hover:shadow-brand-black/5

        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-brand-emerald/20
      "
    >
      <div
        className="
          flex size-12 items-center justify-center
          rounded-full bg-canvas-warm
          text-brand-emerald
          transition-colors
          group-hover:bg-brand-emerald
          group-hover:text-canvas-pure
        "
      >
        {icon}
      </div>

      <div className="mt-8">
        <p className="text-[11px] font-bold uppercase tracking-wide text-brand-emerald">
          {eyebrow}
        </p>

        <h2 className="mt-2 font-display text-3xl font-medium tracking-tight text-brand-black">
          {title}
        </h2>

        <p className="mt-4 text-sm leading-relaxed text-muted-moss">
          {description}
        </p>
      </div>

      <div className="mt-auto flex items-center justify-between gap-4 pt-8 text-xs font-bold text-brand-black">
        <span>{action}</span>

        <ArrowRight
          className="
            size-4 shrink-0 transition-transform
            group-hover:translate-x-1
          "
        />
      </div>
    </Link>
  );
}