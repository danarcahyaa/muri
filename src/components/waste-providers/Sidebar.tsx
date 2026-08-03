"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Layers,
  LayoutDashboard,
  Leaf,
  LogOut,
  Truck,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";

import { useAuth } from "@/components/auth/AuthProvider";
import { Sheet, SheetContent } from "@/components/ui/Sheet";

interface NavigationItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface NavigationGroup {
  groupName: string;
  items: NavigationItem[];
}

const wasteProviderNavigation: NavigationGroup[] = [
  {
    groupName: "Penyedia Limbah",
    items: [
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
    ],
  },
];

function isNavigationActive(pathname: string, href: string): boolean {
  if (href === "/waste-providers/dashboard") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function WasteProviderSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, fullName, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const displayName: string =
    fullName ||
    (typeof user?.user_metadata?.name === "string"
      ? user.user_metadata.name
      : "") ||
    user?.email ||
    "Penyedia Limbah";

  const initial: string =
    displayName.trim().charAt(0).toUpperCase() || "M";

  async function handleSignOut(): Promise<void> {
    try {
      setIsSigningOut(true);
      await signOut();
      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error("Gagal keluar:", error);
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <>
      {/* Desktop full-height sidebar — same structure as BrandSidebar */}
      <aside className="hidden w-[220px] shrink-0 border-r border-brand-black/15 bg-canvas-pure lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
        {/* Logo */}
        <div className="flex shrink-0 items-center gap-2.5 border-b border-brand-black/15 px-6 py-5">
          <Link href="/" aria-label="Kembali ke beranda Muri" className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="Logo Muri"
              width={36}
              height={36}
              priority
              className="size-9 object-contain"
            />
            <span className="font-display text-xl font-medium tracking-tight text-brand-black">
              Muri
            </span>
          </Link>
        </div>

        {/* Navigation — scrollable */}
        <div className="flex-1 overflow-y-auto muri-scrollbar p-6">
          {wasteProviderNavigation.map((group) => (
            <div key={group.groupName} className="mb-6 last:mb-0">
              <p className="mb-3 text-[11px] font-medium uppercase text-muted-moss">
                {group.groupName}
              </p>

              <nav aria-label={`Navigasi ${group.groupName}`} className="space-y-1.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = isNavigationActive(pathname, item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      className={`flex items-center gap-3 rounded-md px-3 py-3 text-xs font-semibold transition-colors ${
                        isActive
                          ? "bg-brand-lime/65 text-brand-black"
                          : "text-muted-moss hover:bg-canvas-warm hover:text-brand-black"
                      }`}
                    >
                      <Icon className="size-4 shrink-0" strokeWidth={1.8} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* User footer — always at bottom */}
        <div className="shrink-0 border-t border-brand-black/15 p-4">
          <div className="flex w-full items-center gap-3 rounded-xl bg-canvas-warm/55 p-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-lime font-display text-xs font-bold text-brand-black">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold leading-tight text-brand-black">
                {displayName}
              </p>
              <p className="mt-0.5 truncate text-[10px] leading-none text-muted-moss">
                {user?.email || "Penyedia Limbah"}
              </p>
            </div>
            <button
              type="button"
              title="Keluar"
              aria-label="Keluar dari akun"
              disabled={isSigningOut}
              onClick={handleSignOut}
              className="flex size-8 shrink-0 items-center justify-center rounded-md text-error-rust transition-colors hover:bg-error-rust/[0.08] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              <LogOut className="size-4" strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile header bar with menu toggle button */}
      <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-brand-black/15 bg-canvas-pure px-4 lg:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex size-10 items-center justify-center rounded-sm border border-brand-black/15 text-brand-black hover:bg-canvas-warm focus:outline-none focus:ring-2 focus:ring-brand-emerald/20 cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="size-5" />
          </button>

          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Logo Muri"
              width={28}
              height={28}
              priority
              className="size-7 object-contain"
            />
            <span className="font-display text-lg font-medium tracking-tight text-brand-black">
              Muri
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-full bg-brand-lime font-display text-[11px] font-bold text-brand-black">
            {initial}
          </div>
        </div>
      </div>

      {/* Slide-out mobile drawer Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" showCloseButton={false} className="w-[260px] p-0 bg-canvas-pure border-r border-brand-black/15">
          <div className="flex h-full flex-col">
            {/* Header / Logo inside drawer */}
            <div className="flex shrink-0 items-center justify-between border-b border-brand-black/15 px-6 py-5">
              <Link href="/" className="flex items-center gap-2.5" onClick={() => setIsOpen(false)}>
                <Image
                  src="/logo.png"
                  alt="Logo Muri"
                  width={32}
                  height={32}
                  priority
                  className="size-8 object-contain"
                />
                <span className="font-display text-lg font-medium tracking-tight text-brand-black">
                  Muri
                </span>
              </Link>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex size-8 items-center justify-center rounded-sm border border-brand-black/15 text-brand-black hover:bg-canvas-warm cursor-pointer"
                aria-label="Close navigation menu"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Scrollable Navigation inside drawer */}
            <div className="flex-1 overflow-y-auto muri-scrollbar p-6">
              {wasteProviderNavigation.map((group) => (
                <div key={group.groupName} className="mb-6 last:mb-0">
                  <p className="mb-3 text-[11px] font-medium uppercase text-muted-moss">
                    {group.groupName}
                  </p>

                  <nav aria-label={`Navigasi mobile ${group.groupName}`} className="space-y-1.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = isNavigationActive(pathname, item.href);

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          aria-current={isActive ? "page" : undefined}
                          className={`flex items-center gap-3 rounded-md px-3 py-3 text-xs font-semibold transition-colors ${
                            isActive
                              ? "bg-brand-lime/65 text-brand-black"
                              : "text-muted-moss hover:bg-canvas-warm hover:text-brand-black"
                          }`}
                        >
                          <Icon className="size-4 shrink-0" strokeWidth={1.8} />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              ))}
            </div>

            {/* User footer inside drawer */}
            <div className="shrink-0 border-t border-brand-black/15 p-4 bg-canvas-pure">
              <div className="flex w-full items-center gap-3 rounded-xl bg-canvas-warm/55 p-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-lime font-display text-xs font-bold text-brand-black">
                  {initial}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold leading-tight text-brand-black">
                    {displayName}
                  </p>
                  <p className="mt-0.5 truncate text-[10px] leading-none text-muted-moss">
                    {user?.email || "Penyedia Limbah"}
                  </p>
                </div>
                <button
                  type="button"
                  title="Keluar"
                  aria-label="Keluar dari akun"
                  disabled={isSigningOut}
                  onClick={handleSignOut}
                  className="flex size-8 shrink-0 items-center justify-center rounded-md text-error-rust transition-colors hover:bg-error-rust/[0.08] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                >
                  <LogOut className="size-4" strokeWidth={1.8} />
                </button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}