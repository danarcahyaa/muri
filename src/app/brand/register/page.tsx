import { Suspense } from "react";

import BrandRegisterContent from "./BrandRegisterContent";

export default function BrandRegisterPage() {
  return (
    <Suspense fallback={<BrandRegisterFallback />}>
      <BrandRegisterContent />
    </Suspense>
  );
}

function BrandRegisterFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas-pure px-4">
      <p className="text-sm text-muted-moss">
        Memuat halaman pendaftaran...
      </p>
    </div>
  );
}