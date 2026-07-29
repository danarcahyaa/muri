"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth/AuthProvider";
import { Spinner } from "@/components/ui/Spinner";

type GuestOnlyProps = {
  children: ReactNode;
  redirectTo?: string;
};

export default function GuestOnly({
  children,
  redirectTo = "/dashboard",
}: GuestOnlyProps) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(redirectTo);
    }
  }, [isLoading, user, router, redirectTo]);

  if (isLoading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas-pure">
        <Spinner className="size-7 text-brand-emerald" />
      </div>
    );
  }

  return children;
}
