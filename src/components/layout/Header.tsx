"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/components/auth/AuthProvider";
import { HeaderDesktopNav } from "./HeaderDesktopNav";
import { HeaderUserMenu } from "./HeaderUserMenu";
import { HeaderMobileNav } from "./HeaderMobileNav";
import { CartDrawer } from "@/components/cart/CartDrawer";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const accountMenuRef = useRef<HTMLDivElement>(null);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [currentHash, setCurrentHash] = useState("");

  const {
    user,
    fullName,
    dashboardHref,
    accountType,
    totalPoints,
    isLoading,
    signOut,
  } = useAuth();

  const currentPath =
    typeof window !== "undefined" ? `${pathname}${currentHash}` : pathname;

  const nextPath = pathname === "/" ? "/dashboard" : currentPath;

  const loginHref = {
    pathname: "/auth/login",
    query: {
      from: currentPath,
      next: nextPath,
    },
  };

  const registerHref = {
    pathname: "/auth/register",
    query: {
      from: currentPath,
      next: nextPath,
    },
  };

  const displayName =
    fullName ||
    (typeof user?.user_metadata?.name === "string"
      ? user.user_metadata.name
      : "") ||
    user?.email ||
    "Pengguna";

  const initial = displayName.trim().charAt(0).toUpperCase() || "M";

  useEffect(() => {
    const updateHash = () => {
      setCurrentHash(window.location.hash);
    };

    updateHash();
    window.addEventListener("hashchange", updateHash);

    return () => {
      window.removeEventListener("hashchange", updateHash);
    };
  }, [pathname]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setAccountMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as Node;
      if (accountMenuRef.current && !accountMenuRef.current.contains(target)) {
        setAccountMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setAccountMenuOpen(false);
      setMobileMenuOpen(false);
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  async function handleSignOut() {
    try {
      setIsSigningOut(true);
      await signOut();
      setAccountMenuOpen(false);
      setMobileMenuOpen(false);
      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error("Gagal keluar:", error);
    } finally {
      setIsSigningOut(false);
    }
  }

  function toggleMobileMenu() {
    setMobileMenuOpen((current) => !current);
    setAccountMenuOpen(false);
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-brand-black/15 bg-canvas-pure">
      <div
        className="
          mx-auto grid
          w-[min(1320px,calc(100%_-_48px))]
          grid-cols-2 items-center
          py-3
          lg:grid-cols-[auto_1fr_auto]
          lg:gap-8
        "
      >
        {/* Logo */}
        <Link
          href="/"
          aria-label="Muri"
          className="flex items-center gap-2 justify-self-start"
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

        {/* Desktop Navigation */}
        <HeaderDesktopNav pathname={pathname} currentHash={currentHash} />

        {/* Desktop Authentication Menu */}
        <div className="hidden items-center justify-end lg:flex">
          <HeaderUserMenu
            isLoading={isLoading}
            user={user}
            displayName={displayName}
            initial={initial}
            accountType={accountType}
            totalPoints={totalPoints}
            dashboardHref={dashboardHref}
            loginHref={loginHref}
            registerHref={registerHref}
            accountMenuOpen={accountMenuOpen}
            setAccountMenuOpen={setAccountMenuOpen}
            accountMenuRef={accountMenuRef}
            isSigningOut={isSigningOut}
            onSignOut={handleSignOut}
          />
        </div>

        {/* Mobile menu toggle button */}
        <button
          type="button"
          aria-label={
            mobileMenuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"
          }
          aria-expanded={mobileMenuOpen}
          onClick={toggleMobileMenu}
          className="
            flex size-11 items-center
            justify-center justify-self-end
            rounded-xl border
            border-brand-black/15
            text-brand-black
            transition-colors
            hover:border-brand-emerald
            hover:text-brand-emerald
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-brand-emerald/20
            lg:hidden
          "
        >
          {mobileMenuOpen ? (
            <X className="size-5" />
          ) : (
            <Menu className="size-5" />
          )}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      <HeaderMobileNav
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        pathname={pathname}
        currentHash={currentHash}
        isLoading={isLoading}
        user={user}
        displayName={displayName}
        initial={initial}
        accountType={accountType}
        totalPoints={totalPoints}
        dashboardHref={dashboardHref}
        loginHref={loginHref}
        registerHref={registerHref}
        isSigningOut={isSigningOut}
        onSignOut={handleSignOut}
      />

      <CartDrawer />
    </header>
  );
}