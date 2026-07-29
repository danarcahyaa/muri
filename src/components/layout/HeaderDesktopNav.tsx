"use client";

import Link from "next/link";
import { navigationItems } from "@/data/navigation";

interface HeaderDesktopNavProps {
  pathname: string;
  currentHash: string;
}

function getHrefPath(href: string) {
  const [path] = href.split("#");
  return path || "/";
}

function getHrefHash(href: string) {
  const [, hash] = href.split("#");
  return hash ? `#${hash}` : "";
}

export function isNavigationItemActive(
  href: string,
  pathname: string,
  currentHash: string,
) {
  const itemPath = getHrefPath(href);
  const itemHash = getHrefHash(href);

  if (itemHash) {
    return pathname === itemPath && currentHash === itemHash;
  }

  if (itemPath === "/") {
    return pathname === "/";
  }

  return pathname === itemPath || pathname.startsWith(`${itemPath}/`);
}

export function HeaderDesktopNav({
  pathname,
  currentHash,
}: HeaderDesktopNavProps) {
  return (
    <nav
      aria-label="Navigasi utama"
      className="hidden items-center justify-center gap-7 lg:flex"
    >
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
  );
}
