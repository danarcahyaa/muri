"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/components/auth/AuthProvider";
import { Spinner } from "@/components/ui/spinner";

type RequireAuthProps = {
  children: ReactNode;
};

export default function RequireAuth({ children }: RequireAuthProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading || user) return;

    const loginUrl = `/login?next=${encodeURIComponent(pathname)}`;

    router.replace(loginUrl);
  }, [isLoading, user, pathname, router]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas-pure">
        <Spinner className="size-7 text-brand-emerald" />
      </div>
    );
  }

  return children;
}