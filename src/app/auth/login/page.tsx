import { Suspense } from "react";

import { AuthRoleSelector } from "@/components/auth/AuthRoleSelector";

export default function AuthLoginPage() {
  return (
    <Suspense fallback={<AuthSelectorSkeleton />}>
      <AuthRoleSelector mode="login" />
    </Suspense>
  );
}

function AuthSelectorSkeleton() {
  return (
    <div className="min-h-screen animate-pulse bg-canvas-pure" />
  );
}