import { Suspense } from "react";

import WasteProviderLoginContent from "./WasteProviderLoginContent";

export default function WasteProviderLoginPage() {
  return (
    <Suspense fallback={<WasteProviderLoginFallback />}>
      <WasteProviderLoginContent />
    </Suspense>
  );
}

function WasteProviderLoginFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas-pure">
      <p className="text-sm text-muted-moss">Memuat halaman login...</p>
    </div>
  );
}