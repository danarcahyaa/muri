"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Coins,
  LayoutDashboard,
  ShoppingBag,
  UserRound,
  Menu,
  X,
} from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/Sheet";

const dashboardNavigation = [
  {
    label: "Ringkasan",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Pesanan Saya",
    href: "/dashboard/orders",
    icon: ShoppingBag,
  },
  {
    label: "Workshop Saya",
    href: "/dashboard/workshops",
    icon: CalendarDays,
  },
  {
    label: "Poin & Dampak",
    href: "/dashboard/points",
    icon: Coins,
  },
  {
    label: "Profil",
    href: "/dashboard/profile",
    icon: UserRound,
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Sub-Header with Menu Toggle */}
      <div className="sticky top-16 z-30 flex h-12 items-center justify-between border-b border-brand-black/15 bg-canvas-pure px-4 lg:hidden">
        <span className="font-display text-xs font-bold uppercase tracking-wider text-brand-black">
          Menu Dashboard
        </span>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex size-9 items-center justify-center rounded-sm border border-brand-black/15 text-brand-black hover:bg-canvas-warm focus:outline-none focus:ring-2 focus:ring-brand-emerald/20 cursor-pointer"
          aria-label="Open dashboard menu"
        >
          <Menu className="size-4.5" />
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden w-[220px] shrink-0 border-r border-brand-black/15 bg-canvas-pure lg:sticky lg:top-16 lg:block lg:h-[calc(100svh-4rem)]">
        <div className="h-full overflow-y-auto muri-scrollbar p-6">
          <p className="mb-3 text-[11px] font-medium uppercase text-muted-moss">
            Dashboard
          </p>

          <nav
            aria-label="Navigasi dashboard"
            className="space-y-1.5"
          >
            {dashboardNavigation.map((item) => {
              const Icon = item.icon;

              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-md px-3 py-3 text-xs font-semibold transition-colors ${
                    isActive
                      ? "bg-brand-lime/65 text-brand-black"
                      : "text-muted-moss hover:bg-canvas-warm hover:text-brand-black"
                  }`}
                >
                  <Icon
                    className="size-4 shrink-0"
                    strokeWidth={1.8}
                  />

                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Slide-out mobile drawer Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" showCloseButton={false} className="w-[260px] p-0 bg-canvas-pure border-r border-brand-black/15">
          <div className="flex h-full flex-col">
            {/* Header inside drawer */}
            <div className="flex shrink-0 items-center justify-between border-b border-brand-black/15 px-6 py-5">
              <span className="font-display text-lg font-medium tracking-tight text-brand-black">
                Dashboard
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex size-8 items-center justify-center rounded-sm border border-brand-black/15 text-brand-black hover:bg-canvas-warm cursor-pointer"
                aria-label="Close dashboard menu"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Scrollable Navigation inside drawer */}
            <div className="flex-1 overflow-y-auto muri-scrollbar p-6">
              <nav aria-label="Navigasi dashboard mobile" className="space-y-1.5">
                {dashboardNavigation.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === "/dashboard"
                      ? pathname === "/dashboard"
                      : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
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
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}