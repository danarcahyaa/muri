"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import {
  LogOut,
  Menu,
  X,
} from "lucide-react";
import {
  usePathname,
  useRouter,
} from "next/navigation";

import { useAuth } from "@/components/auth/AuthProvider";
import { navigationItems } from "@/data/navigation";

function getHrefPath(href: string) {
  const [path] = href.split("#");

  return path || "/";
}

function getHrefHash(href: string) {
  const [, hash] = href.split("#");

  return hash ? `#${hash}` : "";
}

function isNavigationItemActive(
  href: string,
  pathname: string,
  currentHash: string,
) {
  const itemPath = getHrefPath(href);
  const itemHash = getHrefHash(href);

  if (itemHash) {
    return (
      pathname === itemPath &&
      currentHash === itemHash
    );
  }

  if (itemPath === "/") {
    return pathname === "/";
  }

  return (
    pathname === itemPath ||
    pathname.startsWith(`${itemPath}/`)
  );
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const accountMenuRef =
    useRef<HTMLDivElement>(null);

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [accountMenuOpen, setAccountMenuOpen] =
    useState(false);

  const [isSigningOut, setIsSigningOut] =
    useState(false);

  const [currentHash, setCurrentHash] =
    useState("");

  const {
    user,
    fullName,
    isLoading,
    signOut,
  } = useAuth();

  const currentPath =
    typeof window !== "undefined"
      ? `${pathname}${currentHash}`
      : pathname;

  const nextPath =
    pathname === "/"
      ? "/dashboard"
      : currentPath;

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

  const initial =
    displayName
      .trim()
      .charAt(0)
      .toUpperCase() || "M";

  /*
   * Membaca hash seperti #ekosistem agar menu aktif
   * hanya ketika section tersebut benar-benar dibuka.
   */
  useEffect(() => {
    const updateHash = () => {
      setCurrentHash(window.location.hash);
    };

    updateHash();

    window.addEventListener(
      "hashchange",
      updateHash,
    );

    return () => {
      window.removeEventListener(
        "hashchange",
        updateHash,
      );
    };
  }, [pathname]);

  /*
   * Tutup menu ketika berpindah halaman.
   */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileMenuOpen(false);
    setAccountMenuOpen(false);
  }, [pathname]);

  /*
   * Tutup account menu ketika klik di luar atau menekan Escape.
   */
  useEffect(() => {
    function handleOutsideClick(
      event: MouseEvent,
    ) {
      const target = event.target as Node;

      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(target)
      ) {
        setAccountMenuOpen(false);
      }
    }

    function handleEscape(
      event: KeyboardEvent,
    ) {
      if (event.key !== "Escape") {
        return;
      }

      setAccountMenuOpen(false);
      setMobileMenuOpen(false);
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );

    document.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );

      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, []);

  async function handleSignOut() {
    try {
      setIsSigningOut(true);

      await signOut();

      setAccountMenuOpen(false);
      setMobileMenuOpen(false);

      router.replace("/");
    } catch (error) {
      console.error(
        "Gagal keluar:",
        error,
      );
    } finally {
      setIsSigningOut(false);
    }
  }

  function toggleMobileMenu() {
    setMobileMenuOpen(
      (current) => !current,
    );

    setAccountMenuOpen(false);
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-brand-black/5 bg-canvas-pure">
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

        {/* Desktop navigation */}
        <nav
          aria-label="Navigasi utama"
          className="
            hidden items-center
            justify-center gap-7
            lg:flex
          "
        >
          {navigationItems.map((item) => {
            const isActive =
              isNavigationItemActive(
                item.href,
                pathname,
                currentHash,
              );

            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={
                  isActive
                    ? "page"
                    : undefined
                }
                className={`
                  group relative inline-flex
                  items-center whitespace-nowrap
                  py-3 text-xs font-semibold
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
                {item.label}

              </Link>
            );
          })}
        </nav>

        {/* Desktop authentication */}
        <div className="hidden items-center justify-end lg:flex">
          {isLoading ? (
            <div className="h-12 w-44 animate-pulse rounded-md bg-brand-black/5" />
          ) : user ? (
            <div
              ref={accountMenuRef}
              className="relative"
            >
              <div
                className="
                  flex items-center
                  rounded-full border
                  border-brand-black/15
                  bg-canvas-pure p-1
                "
              >
                <Link
                  href="/dashboard"
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

                <button
                  type="button"
                  aria-label="Buka menu akun"
                  aria-expanded={
                    accountMenuOpen
                  }
                  onClick={() =>
                    setAccountMenuOpen(
                      (current) => !current,
                    )
                  }
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
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={() =>
                      setAccountMenuOpen(false)
                    }
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

                  <button
                    type="button"
                    disabled={isSigningOut}
                    onClick={handleSignOut}
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

                    {isSigningOut
                      ? "Sedang keluar..."
                      : "Keluar"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
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
          )}
        </div>

        {/* Mobile button */}
        <button
          type="button"
          aria-label={
            mobileMenuOpen
              ? "Tutup menu navigasi"
              : "Buka menu navigasi"
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

      {/* Mobile navigation */}
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
        <div
          className="
            mx-auto
            w-[min(1320px,calc(100%_-_48px))]
            py-5
          "
        >
          <nav
            aria-label="Navigasi mobile"
            className="flex flex-col"
          >
            {navigationItems.map((item) => {
              const isActive =
                isNavigationItemActive(
                  item.href,
                  pathname,
                  currentHash,
                );

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={
                    isActive
                      ? "page"
                      : undefined
                  }
                  onClick={() =>
                    setMobileMenuOpen(false)
                  }
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

          {/* Mobile authentication */}
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
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-5">
                <Link
                  href="/dashboard"
                  onClick={() =>
                    setMobileMenuOpen(false)
                  }
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

                <button
                  type="button"
                  onClick={handleSignOut}
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

                  {isSigningOut
                    ? "Keluar..."
                    : "Keluar"}
                </button>
              </div>
            </div>
          ) : !isLoading ? (
            <div className="grid grid-cols-2 gap-3 pt-5">
              <Link
                href={loginHref}
                onClick={() =>
                  setMobileMenuOpen(false)
                }
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
                onClick={() =>
                  setMobileMenuOpen(false)
                }
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
    </header>
  );
}