"use client";

import { useSearchParams } from "next/navigation";

import { BackLink } from "@/components/ui/BackLink";
import { AuthFooterLink } from "@/components/ui/AuthFooterLink";
import { RegisterPageHeader } from "@/components/waste-providers/auth/RegisterPageHeader";
import { RegisterForm } from "@/components/waste-providers/auth/RegisterForm";

function getSafeInternalPath(
  value: string | null,
  fallback: string,
): string {
  if (value && value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }

  return fallback;
}

/**
 * Waste provider hanya boleh diarahkan ke route
 * yang berada di bawah /waste-providers.
 */
function getWasteProviderRegisterDestination(
  nextPath: string | null,
): string {
  const fallback = "/waste-providers/dashboard";

  const safeNextPath = getSafeInternalPath(nextPath, fallback);

  const belongsToWasteProvider =
    safeNextPath === "/waste-providers" ||
    safeNextPath.startsWith("/waste-providers/");

  return belongsToWasteProvider ? safeNextPath : fallback;
}

export default function WasteProviderRegisterContent() {
  const searchParams = useSearchParams();

  const fromPath = getSafeInternalPath(
    searchParams.get("from"),
    "/auth/register",
  );

  const nextPath = getWasteProviderRegisterDestination(
    searchParams.get("next"),
  );

  const loginSearchParams = new URLSearchParams({
    from: "/waste-providers/register",
    next: nextPath,
  });

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
            href={`/waste-providers/login?${loginSearchParams.toString()}`}
          />
        </div>
      </div>
    </div>
  );
}