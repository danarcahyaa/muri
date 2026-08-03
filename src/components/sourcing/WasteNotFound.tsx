import { type ReactElement } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { PackageSearch, ArrowLeft } from "lucide-react";

export function WasteNotFound(): ReactElement {
  return (
    <div className="mx-auto w-full max-w-[1320px] px-5 py-16 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center space-y-6 min-h-[60vh]">
      <div className="size-20 rounded-full bg-brand-forest/10 flex items-center justify-center text-brand-forest">
        <PackageSearch className="size-10 stroke-[1.5]" />
      </div>

      <div className="space-y-2 max-w-md">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-brand-black">
          Material Limbah Tidak Ditemukan
        </h1>
        <p className="text-sm text-muted-moss leading-relaxed">
          Material limbah yang Anda cari tidak tersedia, telah habis terjual, atau telah dihapus oleh penyuplai.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Link href="/brand/dashboard/sourcing/search">
          <Button className="bg-brand-lime text-brand-black hover:bg-brand-lime/90 font-bold gap-2">
            <ArrowLeft className="size-4" />
            <span>Kembali ke Pencarian Material</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
