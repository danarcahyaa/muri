import { Suspense } from "react";

import BrandLoginContent from "./BrandLoginContent";

export default function BrandLoginPage() {
  return (
    <Suspense fallback={<BrandLoginFallback />}>
      <BrandLoginContent />
    </Suspense>
  );
}

function BrandLoginFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas-pure">
      <p className="text-sm text-muted-moss">Memuat halaman login...</p>
    </div>
  );
}