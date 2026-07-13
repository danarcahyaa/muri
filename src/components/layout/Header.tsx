"use client";

import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { navigationItems } from "@/data/navigation";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-brand-black/5 bg-canvas-pure">
      <div className="mx-auto grid w-[min(1320px,calc(100%_-_48px))] grid-cols-2 items-center py-3 lg:grid-cols-3">
        {/* Logo */}
        <a
          href="#"
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
        </a>

        {/* Desktop navigation */}
        <nav
          aria-label="Navigasi utama"
          className="hidden items-center justify-center gap-8 lg:flex"
        >
          {navigationItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="whitespace-nowrap text-xs font-medium text-brand-black transition-colors hover:text-brand-emerald"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Desktop buttons */}
        <div className="hidden items-center justify-end gap-3 lg:flex">
          <a
            href="#masuk"
            className="inline-flex items-center justify-center rounded-md border border-brand-black px-6 py-4 text-xs font-bold transition-colors hover:bg-brand-black hover:text-white"
          >
            Masuk
          </a>

          <a
            href="#bergabung"
            className="inline-flex items-center justify-center rounded-md bg-brand-black px-6 py-4 text-xs font-bold text-white transition-colors hover:bg-brand-forest"
          >
            Mulai Bergabung
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          aria-label={
            mobileMenuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"
          }
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((current) => !current)}
          className="flex size-11 items-center justify-center justify-self-end rounded-xl border border-brand-black/15 lg:hidden"
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
        className={`absolute inset-x-0 top-full border-t border-brand-black/10 bg-canvas-pure shadow-xl transition-all duration-300 lg:hidden ${
          mobileMenuOpen
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-2 opacity-0"
        }`}
      >
        <div className="mx-auto w-[min(1320px,calc(100%_-_48px))] py-5">
          <nav className="flex flex-col">
            {navigationItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="border-b border-brand-black/10 py-4 text-sm font-medium"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="grid grid-cols-2 gap-3 pt-5">
            <a
              href="#masuk"
              className="inline-flex items-center justify-center rounded-md border border-brand-black px-6 py-4 text-xs font-bold"
            >
              Masuk
            </a>

            <a
              href="#bergabung"
              className="inline-flex items-center justify-center rounded-md bg-brand-black px-6 py-4 text-xs font-bold text-white"
            >
              Mulai Bergabung
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
