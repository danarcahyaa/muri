"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/components/auth/AuthProvider";
import { Spinner } from "@/components/ui/Spinner";

type RequireBrandAuthProps = {
  children: ReactNode;
};

export default function RequireBrandAuth({
  children,
}: RequireBrandAuthProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      const loginUrl = `/brand/login?next=${encodeURIComponent(pathname)}`;
      router.replace(loginUrl);
      return;
    }

    const role = user.user_metadata?.role;
    if (role !== "brand") {
      const loginUrl = `/brand/login?next=${encodeURIComponent(pathname)}`;
      router.replace(loginUrl);
    }
  }, [isLoading, user, pathname, router]);

  if (isLoading || !user || user.user_metadata?.role !== "brand") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas-pure">
        <Spinner className="size-7 text-brand-emerald" />
      </div>
    );
  }

  return children;
}
