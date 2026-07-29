"use client";

import Link from "next/link";
import { Coins, LogOut } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { navigationItems } from "@/data/navigation";
import { isNavigationItemActive } from "./HeaderDesktopNav";

interface HeaderMobileNavProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  pathname: string;
  currentHash: string;
  isLoading: boolean;
  user: User | null;
  displayName: string;
  initial: string;
  accountType: string | null;
  totalPoints: number;
  dashboardHref: string | null;
  loginHref: { pathname: string; query: { from: string; next: string } };
  registerHref: { pathname: string; query: { from: string; next: string } };
  isSigningOut: boolean;
  onSignOut: () => Promise<void>;
}

export function HeaderMobileNav({
  mobileMenuOpen,
  setMobileMenuOpen,
  pathname,
  currentHash,
  isLoading,
  user,
  displayName,
  initial,
  accountType,
  totalPoints,
  dashboardHref,
  loginHref,
  registerHref,
  isSigningOut,
  onSignOut,
}: HeaderMobileNavProps) {
  return (
    <div
      className={`
        absolute inset-x-0 top-full
        max-h-[calc(100vh-64px)]
        overflow-y-auto
        border-t border-brand-black/10
        bg-canvas-pure
        shadow-xl
        transition-all duration-300
        lg:hidden

        ${
          mobileMenuOpen
            ? `
              visible
              translate-y-0
              opacity-100
            `
            : `
              invisible
              -translate-y-2
              pointer-events-none
              opacity-0
            `
        }
      `}
    >
      <div className="mx-auto w-[min(1320px,calc(100%_-_48px))] py-5">
        <nav aria-label="Navigasi mobile" className="flex flex-col">
          {navigationItems.map((item) => {
            const isActive = isNavigationItemActive(
              item.href,
              pathname,
              currentHash,
            );

            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                onClick={() => setMobileMenuOpen(false)}
                className={`
                    flex items-center
                    justify-between
                    border-b
                    border-brand-black/10
                    py-4 text-sm
                    font-semibold
                    transition-colors

                    ${
                      isActive
                        ? "text-brand-emerald"
                        : `
                          text-brand-black
                          hover:text-brand-emerald
                        `
                    }
                  `}
              >
                <span>{item.label}</span>

                {isActive && (
                  <span className="size-1.5 rounded-full bg-brand-emerald" />
                )}
              </Link>
            );
          })}
        </nav>

        {!isLoading && user ? (
          <div className="pt-5">
            <div className="flex items-center gap-3 border-b border-line-trace pb-5">
              <div
                className="
                  flex size-11 items-center
                  justify-center rounded-full
                  bg-brand-lime
                  font-display text-sm
                  font-bold text-brand-black
                "
              >
                {initial}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-brand-black">
                  {displayName}
                </p>

                <p className="mt-1 truncate text-xs text-muted-moss">
                  {user.email}
                </p>

                {accountType === "customer" && (
                  <div
                    className="
                      mt-2 inline-flex items-center
                      gap-2 rounded-full
                      bg-brand-lime/25
                      px-3 py-1.5
                      text-xs font-bold
                      text-brand-black
                    "
                  >
                    <Coins className="size-4 text-brand-emerald" />
                    <span>{totalPoints.toLocaleString("id-ID")} Coin</span>
                  </div>
                )}
              </div>
            </div>

            <div
              className={
                dashboardHref
                  ? "grid grid-cols-2 gap-3 pt-5"
                  : "grid grid-cols-1 gap-3 pt-5"
              }
            >
              {dashboardHref && (
                <Link
                  href={dashboardHref}
                  onClick={() => setMobileMenuOpen(false)}
                  className="
                    inline-flex items-center
                    justify-center rounded-md
                    bg-brand-black
                    px-4 py-4
                    text-xs font-bold
                    text-white
                  "
                >
                  Dashboard
                </Link>
              )}

              <button
                type="button"
                onClick={onSignOut}
                disabled={isSigningOut}
                className="
                  inline-flex items-center
                  justify-center gap-2
                  rounded-md border
                  border-brand-black
                  px-4 py-4
                  text-xs font-bold
                  disabled:opacity-50
                "
              >
                <LogOut className="size-4" />
                {isSigningOut ? "Keluar..." : "Keluar"}
              </button>
            </div>
          </div>
        ) : !isLoading ? (
          <div className="grid grid-cols-2 gap-3 pt-5">
            <Link
              href={loginHref}
              onClick={() => setMobileMenuOpen(false)}
              className="
                inline-flex items-center
                justify-center rounded-md
                border border-brand-black
                px-4 py-4
                text-xs font-bold
                text-brand-black
              "
            >
              Masuk
            </Link>

            <Link
              href={registerHref}
              onClick={() => setMobileMenuOpen(false)}
              className="
                inline-flex items-center
                justify-center rounded-md
                bg-brand-black
                px-4 py-4
                text-center text-xs
                font-bold text-white
              "
            >
              Mulai Bergabung
            </Link>
          </div>
        ) : (
          <div className="mt-5 h-12 animate-pulse rounded-md bg-brand-black/5" />
        )}
      </div>
    </div>
  );
}
