import { Suspense } from "react";

import WasteProviderRegisterContent from "./WasteProviderRegisterContent";

export default function WasteProviderRegisterPage() {
  return (
    <Suspense fallback={<WasteProviderRegisterFallback />}>
      <WasteProviderRegisterContent />
    </Suspense>
  );
}

function WasteProviderRegisterFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas-pure px-4">
      <p className="text-sm text-muted-moss">
        Memuat halaman pendaftaran...
      </p>
    </div>
  );
}