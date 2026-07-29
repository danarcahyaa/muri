"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/components/auth/AuthProvider";
import { Spinner } from "@/components/ui/Spinner";

type RequireWasteProviderAuthProps = {
  children: ReactNode;
};

export default function RequireWasteProviderAuth({
  children,
}: RequireWasteProviderAuthProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      const loginUrl = `/waste-providers/login?next=${encodeURIComponent(pathname)}`;
      router.replace(loginUrl);
      return;
    }

    const role = user.user_metadata?.role;
    if (role !== "waste_provider") {
      const loginUrl = `/waste-providers/login?next=${encodeURIComponent(pathname)}`;
      router.replace(loginUrl);
    }
  }, [isLoading, user, pathname, router]);

  if (isLoading || !user || user.user_metadata?.role !== "waste_provider") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas-pure">
        <Spinner className="size-7 text-brand-emerald" />
      </div>
    );
  }

  return children;
}
