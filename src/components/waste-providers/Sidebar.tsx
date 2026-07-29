"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  usePathname,
  useRouter,
} from "next/navigation";
import {
  Layers,
  LayoutDashboard,
  Leaf,
  LogOut,
  Truck,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/Sidebar";
import { useAuth } from "@/components/auth/AuthProvider";

const wasteProviderNavigation = [
  {
    label: "Ringkasan",
    href: "/waste-providers/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Inventaris Limbah",
    href: "/waste-providers/dashboard/inventory",
    icon: Layers,
  },
  {
    label: "Pesanan",
    href: "/waste-providers/dashboard/order",
    icon: Truck,
  },
  {
    label: "Jejak Limbah",
    href: "/waste-providers/dashboard/footprint",
    icon: Leaf,
  },
];

function isNavigationActive(
  pathname: string,
  href: string,
) {
  if (href === "/waste-providers/dashboard") {
    return pathname === href;
  }

  return (
    pathname === href ||
    pathname.startsWith(`${href}/`)
  );
}

export function WasteProviderSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const {
    user,
    fullName,
    signOut,
  } = useAuth();

  const [
    isSigningOut,
    setIsSigningOut,
  ] = useState(false);

  const displayName =
    fullName ||
    (typeof user?.user_metadata?.name ===
    "string"
      ? user.user_metadata.name
      : "") ||
    user?.email ||
    "Penyedia Limbah";

  const initial =
    displayName
      .trim()
      .charAt(0)
      .toUpperCase() || "M";

  async function handleSignOut() {
    try {
      setIsSigningOut(true);

      await signOut();

      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error(
        "Gagal keluar:",
        error,
      );
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <>
      {/* Desktop full-height sidebar */}
      <Sidebar
        className="
          hidden
          border-r border-line-trace
          bg-canvas-pure
          [--sidebar-width:240px]
          lg:flex
        "
      >
        {/* Logo */}
        <SidebarHeader
          className="
            shrink-0
            border-b border-line-trace/70
            px-6 py-5
          "
        >
          <Link
            href="/"
            aria-label="Kembali ke beranda Muri"
            className="
              flex w-fit items-center gap-2.5
              rounded-md
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-brand-emerald/20
            "
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
        </SidebarHeader>

        {/* Navigation */}
        <SidebarContent className="flex-1 overflow-y-auto px-4 py-6">
          <SidebarGroup className="p-0">
            <SidebarGroupLabel
              className="
                mb-3 h-auto px-3 py-0
                text-[11px] font-medium
                uppercase tracking-normal
                text-muted-moss
              "
            >
              Penyedia Limbah
            </SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu className="space-y-1.5">
                {wasteProviderNavigation.map(
                  (item) => {
                    const Icon = item.icon;

                    const isActive =
                      isNavigationActive(
                        pathname,
                        item.href,
                      );

                    return (
                      <SidebarMenuItem
                        key={item.href}
                      >
                        <SidebarMenuButton
                          isActive={isActive}
                          render={
                            <Link
                              href={item.href}
                              aria-current={
                                isActive
                                  ? "page"
                                  : undefined
                              }
                            />
                          }
                          className={`
                            h-auto w-full
                            justify-start gap-3
                            rounded-md px-3 py-3
                            text-xs font-semibold
                            transition-colors

                            ${
                              isActive
                                ? `
                                  bg-brand-lime/65
                                  text-brand-black
                                  hover:bg-brand-lime/75
                                  hover:text-brand-black
                                `
                                : `
                                  text-muted-moss
                                  hover:bg-canvas-warm
                                  hover:text-brand-black
                                `
                            }
                          `}
                        >
                          <Icon
                            className="size-4 shrink-0"
                            strokeWidth={1.8}
                          />

                          <span className="truncate">
                            {item.label}
                          </span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  },
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Logged-in user */}
        <SidebarFooter
          className="
            mt-auto shrink-0
            border-t border-line-trace/70
            p-4
          "
        >
          <div
            className="
              flex w-full items-center gap-3
              rounded-xl
              bg-canvas-warm/55
              p-3
            "
          >
            <div
              className="
                flex size-10 shrink-0
                items-center justify-center
                rounded-full
                bg-brand-lime
                font-display text-sm
                font-bold text-brand-black
              "
            >
              {initial}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold leading-tight text-brand-black">
                {displayName}
              </p>

              <p className="mt-1 truncate text-[10px] leading-none text-muted-moss">
                {user?.email}
              </p>
            </div>

            <button
              type="button"
              title="Keluar"
              aria-label="Keluar dari akun"
              disabled={isSigningOut}
              onClick={handleSignOut}
              className="
                flex size-9 shrink-0
                items-center justify-center
                rounded-md
                text-error-rust
                transition-colors

                hover:bg-error-rust/[0.08]

                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-error-rust/20

                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <LogOut
                className="size-4"
                strokeWidth={1.8}
              />
            </button>
          </div>
        </SidebarFooter>
      </Sidebar>

      {/* Mobile header and navigation */}
      <div
        className="
          sticky top-0 z-40
          border-b border-line-trace
          bg-canvas-pure
          lg:hidden
        "
      >
        {/* Mobile brand and account */}
        <div className="flex items-center justify-between px-4 py-3">
          <Link
            href="/"
            aria-label="Kembali ke beranda Muri"
            className="flex items-center gap-2"
          >
            <Image
              src="/logo.png"
              alt="Logo Muri"
              width={32}
              height={32}
              priority
              className="size-8 object-contain"
            />

            <span className="font-display text-xl font-medium tracking-tight text-brand-black">
              Muri
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <div
              className="
                flex size-9 items-center
                justify-center rounded-full
                bg-brand-lime
                font-display text-xs
                font-bold text-brand-black
              "
              title={displayName}
            >
              {initial}
            </div>

            <button
              type="button"
              title="Keluar"
              aria-label="Keluar dari akun"
              disabled={isSigningOut}
              onClick={handleSignOut}
              className="
                flex size-9 items-center
                justify-center rounded-md
                text-error-rust
                transition-colors

                hover:bg-error-rust/[0.08]

                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-error-rust/20

                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <LogOut
                className="size-4"
                strokeWidth={1.8}
              />
            </button>
          </div>
        </div>

        {/* Mobile horizontal navigation */}
        <nav
          aria-label="Navigasi dashboard penyedia limbah mobile"
          className="
            flex gap-2 overflow-x-auto
            border-t border-line-trace/60
            px-4 py-3
          "
        >
          {wasteProviderNavigation.map(
            (item) => {
              const Icon = item.icon;

              const isActive =
                isNavigationActive(
                  pathname,
                  item.href,
                );

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={
                    isActive
                      ? "page"
                      : undefined
                  }
                  className={`
                    inline-flex shrink-0
                    items-center gap-2
                    rounded-md px-4 py-3
                    text-xs font-semibold
                    transition-colors

                    ${
                      isActive
                        ? `
                          bg-brand-lime/65
                          text-brand-black
                        `
                        : `
                          border border-line-trace
                          text-muted-moss
                          hover:bg-canvas-warm
                          hover:text-brand-black
                        `
                    }
                  `}
                >
                  <Icon
                    className="size-4 shrink-0"
                    strokeWidth={1.8}
                  />

                  <span>
                    {item.label}
                  </span>
                </Link>
              );
            },
          )}
        </nav>
      </div>
    </>
  );
}