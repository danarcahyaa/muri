import { Suspense } from "react";

import { AuthRoleSelector } from "@/components/auth/AuthRoleSelector";

export default function AuthRegisterPage() {
  return (
    <Suspense fallback={<AuthSelectorSkeleton />}>
      <AuthRoleSelector mode="register" />
    </Suspense>
  );
}

function AuthSelectorSkeleton() {
  return (
    <div className="min-h-screen animate-pulse bg-canvas-pure" />
  );
}