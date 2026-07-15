"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  Truck,
  Leaf,
  Factory,
  LogOut,
  History,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
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
  }
];

export function WasteProviderSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, fullName, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const displayName =
    fullName ||
    (typeof user?.user_metadata?.name === "string"
      ? user.user_metadata.name
      : "") ||
    user?.email ||
    "Penyedia Limbah";

  const initial = displayName.trim().charAt(0).toUpperCase() || "M";

  async function handleSignOut() {
    try {
      setIsSigningOut(true);
      await signOut();
      router.replace("/");
    } catch (error) {
      console.error("Gagal keluar:", error);
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <>
      {/* Desktop sidebar using shadcn component */}
      <Sidebar className="hidden lg:block border-r border-line-trace bg-canvas-pure">
        {/* Sidebar Header with Logo and Brand Name */}
        <SidebarHeader className="border-b border-line-trace/40 p-4">
          <Link
            href="/"
            aria-label="Muri"
            className=""
          >
            <Image
              src="/logo.svg"
              alt="Logo Muri"
              width={80}
              height={80}
            />
          </Link>
        </SidebarHeader>

        {/* Sidebar Navigation Options */}
        <SidebarContent className="p-4 flex-1">
          <SidebarGroup>
            <SidebarGroupLabel className="text-[11px] font-medium uppercase text-muted-moss mb-3 px-3">
              Penyedia Limbah
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1.5">
                {wasteProviderNavigation.map((item) => {
                  const Icon = item.icon;

                  const isActive =
                    item.href === "/waste-providers/dashboard"
                      ? pathname === item.href
                      : pathname.startsWith(item.href);

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={isActive}
                        render={<Link href={item.href} />}
                        className="w-full flex items-center gap-3 px-3 py-3 text-xs font-semibold text-muted-moss data-active:text-brand-black"
                      >
                        <Icon
                          className="size-4 shrink-0"
                          strokeWidth={1.8}
                        />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Sidebar Footer with User Avatar Profile and Sign-Out button */}
        <SidebarFooter className="border-t border-line-trace/40 p-4 mt-auto">
          <div className="flex items-center justify-between gap-3 w-full">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-lime font-display text-sm font-bold text-brand-black">
                {initial}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-brand-black leading-tight">
                  {displayName}
                </p>
                <p className="mt-0.5 truncate text-[10px] text-muted-moss leading-none">
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              type="button"
              disabled={isSigningOut}
              onClick={handleSignOut}
              className="text-error-rust hover:bg-error-rust/[0.06] p-2 rounded-md transition-colors disabled:opacity-50 shrink-0"
              title="Keluar"
            >
              <LogOut className="size-4.5" />
            </button>
          </div>
        </SidebarFooter>
      </Sidebar>

      {/* Mobile dashboard navigation (Always visible for easy access on mobile) */}
      <div className="border-b border-line-trace bg-canvas-pure px-4 py-3 lg:hidden w-full flex flex-col gap-3">
        {/* Brand Header on Mobile */}
        <div className="flex items-center justify-between w-full px-2">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Logo Muri"
              width={28}
              height={28}
              className="size-7 object-contain"
            />
            <span className="font-display text-md font-medium tracking-tight text-brand-black">
              Muri
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-full bg-brand-lime font-display text-xs font-bold text-brand-black">
              {initial}
            </div>
            <button
              type="button"
              disabled={isSigningOut}
              onClick={handleSignOut}
              className="text-error-rust hover:bg-error-rust/[0.06] p-1.5 rounded-md transition-colors disabled:opacity-50"
              title="Keluar"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>

        {/* Navigation Items Scroll Area */}
        <nav
          aria-label="Navigasi penyedia limbah mobile"
          className="flex gap-2 overflow-x-auto w-full pt-1 border-t border-line-trace/20"
        >
          {wasteProviderNavigation.map((item) => {
            const Icon = item.icon;

            const isActive =
              item.href === "/waste-providers/dashboard"
                ? pathname === item.href
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex shrink-0 items-center gap-2 rounded-sm px-4 py-3 text-xs font-semibold ${
                  isActive
                    ? "bg-brand-lime text-brand-black"
                    : "border border-line-trace text-muted-moss hover:bg-canvas-warm hover:text-brand-black"
                }`}
              >
                <Icon className="size-4" strokeWidth={1.8} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
