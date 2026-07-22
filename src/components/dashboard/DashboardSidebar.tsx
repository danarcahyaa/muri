"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Coins,
  LayoutDashboard,
  ShoppingBag,
  UserRound,
} from "lucide-react";

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

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-[220px] shrink-0 border-r border-line-trace bg-canvas-pure lg:sticky lg:top-16 lg:block lg:h-[calc(100svh-4rem)]">
        <div className="p-6">
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
                  ? pathname === item.href
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

      {/* Mobile dashboard navigation */}
      <div className="border-b border-line-trace bg-canvas-pure px-4 py-3 lg:hidden">
        <nav
          aria-label="Navigasi dashboard mobile"
          className="flex gap-2 overflow-x-auto"
        >
          {dashboardNavigation.map((item) => {
            const Icon = item.icon;

            const isActive =
              item.href === "/dashboard"
                ? pathname === item.href
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex shrink-0 items-center gap-2 rounded-md px-4 py-3 text-xs font-semibold ${
                  isActive
                    ? "bg-brand-lime/65 text-brand-black"
                    : "border border-line-trace text-muted-moss"
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