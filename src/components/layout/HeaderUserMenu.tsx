"use client";

import Link from "next/link";
import { Coins, LogOut, ShoppingCart } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { useCart } from "@/hooks/customer/useCart";

interface HeaderUserMenuProps {
  isLoading: boolean;
  user: User | null;
  displayName: string;
  initial: string;
  accountType: string | null;
  totalPoints: number;
  dashboardHref: string | null;
  loginHref: { pathname: string; query: { from: string; next: string } };
  registerHref: { pathname: string; query: { from: string; next: string } };
  accountMenuOpen: boolean;
  setAccountMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  accountMenuRef: React.RefObject<HTMLDivElement | null>;
  isSigningOut: boolean;
  onSignOut: () => Promise<void>;
}

export function HeaderUserMenu({
  isLoading,
  user,
  displayName,
  initial,
  accountType,
  totalPoints,
  dashboardHref,
  loginHref,
  registerHref,
  accountMenuOpen,
  setAccountMenuOpen,
  accountMenuRef,
  isSigningOut,
  onSignOut,
}: HeaderUserMenuProps) {
  const { itemCount, openCart } = useCart();

  if (isLoading) {
    return <div className="h-12 w-44 animate-pulse rounded-md bg-brand-black/5" />;
  }

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={openCart}
          aria-label="Keranjang Belanja"
          className="
            relative flex size-10 items-center justify-center
            rounded-full border border-brand-black/15
            text-brand-black transition duration-200
            hover:border-brand-emerald hover:text-brand-emerald
          "
        >
          <ShoppingCart className="size-4" />
          {itemCount > 0 && (
            <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-brand-forest text-[10px] font-bold text-white">
              {itemCount}
            </span>
          )}
        </button>

        <Link
          href={loginHref}
          className="
            inline-flex items-center
            justify-center rounded-md
            border border-brand-black
            px-6 py-4
            text-xs font-bold
            text-brand-black
            transition duration-300
            hover:-translate-y-0.5
            hover:bg-brand-black
            hover:text-white
          "
        >
          Masuk
        </Link>

        <Link
          href={registerHref}
          className="
            inline-flex items-center
            justify-center rounded-md
            bg-brand-black
            px-6 py-4
            text-xs font-bold
            text-white
            transition duration-300
            hover:-translate-y-0.5
            hover:bg-brand-forest
          "
        >
          Mulai Bergabung
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Cart Button */}
      <button
        type="button"
        onClick={openCart}
        aria-label="Keranjang Belanja"
        className="
          relative flex size-10 items-center justify-center
          rounded-full border border-brand-black/15 bg-canvas-pure
          text-brand-black transition duration-200
          hover:border-brand-emerald hover:text-brand-emerald
        "
      >
        <ShoppingCart className="size-4.5" />
        {itemCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-brand-forest text-[10px] font-bold text-white shadow-sm">
            {itemCount}
          </span>
        )}
      </button>

      <div ref={accountMenuRef} className="relative">
        <div
          className="
            flex items-center
            rounded-full border
            border-brand-black/15
            bg-canvas-pure p-1
          "
        >
        {accountType === "customer" && (
          <div
            title={`${totalPoints} coin`}
            className="
              inline-flex items-center
              gap-2 rounded-full
              bg-brand-lime/25
              px-4 py-3
              text-xs font-bold
              text-brand-black
            "
          >
            <Coins className="size-4 text-brand-emerald" />
            <span>{totalPoints.toLocaleString("id-ID")}</span>
            <span className="hidden xl:inline">Coin</span>
          </div>
        )}

        {dashboardHref && (
          <Link
            href={dashboardHref}
            className="
              inline-flex items-center
              justify-center px-5 py-3
              text-xs font-bold
              text-brand-black
              transition-colors
              hover:text-brand-emerald
            "
          >
            Dashboard
          </Link>
        )}

        <button
          type="button"
          aria-label="Buka menu akun"
          aria-expanded={accountMenuOpen}
          onClick={() => setAccountMenuOpen((current) => !current)}
          className="
            flex size-10 items-center
            justify-center rounded-full
            bg-brand-lime
            font-display text-sm
            font-bold text-brand-black
            transition
            hover:bg-brand-lime/80
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-brand-emerald/20
          "
        >
          {initial}
        </button>
      </div>

      {accountMenuOpen && (
        <div
          className="
            absolute right-0
            top-[calc(100%+1.25rem)]
            w-64 overflow-hidden
            rounded-2xl border
            border-line-trace
            bg-canvas-pure p-2
            shadow-2xl
            shadow-brand-black/10
          "
        >
          <div className="border-b border-line-trace px-4 py-3">
            <p className="truncate text-xs font-bold text-brand-black">
              {displayName}
            </p>
            <p className="mt-1 truncate text-[11px] text-muted-moss">
              {user.email}
            </p>

            {accountType === "customer" && (
              <div
                className="
                  mt-3 inline-flex items-center
                  gap-2 rounded-full
                  bg-brand-lime/25
                  px-3 py-2
                  text-xs font-bold
                  text-brand-black
                "
              >
                <Coins className="size-4 text-brand-emerald" />
                <span>{totalPoints.toLocaleString("id-ID")} Coin</span>
              </div>
            )}
          </div>

          {dashboardHref && (
            <Link
              href={dashboardHref}
              onClick={() => setAccountMenuOpen(false)}
              className="
                mt-2 flex items-center
                rounded-xl px-4 py-3
                text-xs font-semibold
                text-brand-black
                transition-colors
                hover:bg-canvas-warm
                hover:text-brand-emerald
              "
            >
              Buka Dashboard
            </Link>
          )}

          <button
            type="button"
            disabled={isSigningOut}
            onClick={onSignOut}
            className="
              flex w-full items-center
              gap-2 rounded-xl
              px-4 py-3 text-left
              text-xs font-semibold
              text-error-rust
              transition-colors
              hover:bg-error-rust/[0.06]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <LogOut className="size-4" />
            {isSigningOut ? "Sedang keluar..." : "Keluar"}
          </button>
        </div>
      )}
    </div>
    </div>
  );
}
