"use client";

import { useSearchParams } from "next/navigation";

import { BackLink } from "@/components/ui/BackLink";
import { AuthFooterLink } from "@/components/ui/AuthFooterLink";
import { RegisterPageHeader } from "@/components/waste-providers/auth/RegisterPageHeader";
import { RegisterForm } from "@/components/waste-providers/auth/RegisterForm";

/** Returns the value only if it is a safe internal path (starts with / but not //). */
function getSafeInternalPath(value: string | null, fallback: string): string {
  if (value && value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return fallback;
}

export default function WasteProviderRegisterPage() {
  const searchParams = useSearchParams();

  const fromPath = getSafeInternalPath(
    searchParams.get("from"),
    "/auth/register",
  );

  const nextPath = getSafeInternalPath(searchParams.get("next"), "/dashboard");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas-pure px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-8">
        {/* Back link */}
        <div className="flex justify-start">
          <BackLink href={fromPath} label="Kembali" />
        </div>

        {/* Main content */}
        <div className="mx-auto w-full max-w-sm">
          <RegisterPageHeader />
          <RegisterForm nextPath={nextPath} />

          {/* Footer */}
          <AuthFooterLink
            text="Sudah memiliki akun waste provider?"
            linkText="Masuk di sini"
            href={`/waste-providers/login?from=/waste-providers/register&next=${encodeURIComponent(nextPath)}`}
          />
        </div>
      </div>
    </div>
  );
}