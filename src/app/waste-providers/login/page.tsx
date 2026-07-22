import { Suspense } from "react";

import WasteProviderLoginContent from "./WasteProviderLoginContent";

function WasteProviderLoginFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas-pure px-4">
      <p className="text-sm text-muted-moss">Memuat halaman masuk...</p>
    </div>
  );
}

export default function WasteProviderLoginPage() {
  return (
    <Suspense fallback={<WasteProviderLoginFallback />}>
      <WasteProviderLoginContent />
    </Suspense>
  );
}