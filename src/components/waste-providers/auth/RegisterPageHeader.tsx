import Image from "next/image";
import { Leaf } from "lucide-react";

/**
 * Static header block for the waste provider registration page:
 * logo, badge, headline, and tagline.
 */
export function RegisterPageHeader() {
  return (
    <>
      {/* Logo */}
      <div className="mb-12 flex items-center gap-2">
        <Image
          src="/logo.png"
          alt="Muri Logo"
          width={40}
          height={40}
          priority
          className="size-10 object-contain"
        />
        <span className="font-display text-2xl font-medium tracking-tight text-brand-black">
          Muri
        </span>
      </div>

      {/* Heading */}
      <div className="mb-10">
        <div className="mb-4 flex items-center gap-3 text-brand-emerald">
          <Leaf className="size-4" strokeWidth={2} />
          <span className="text-xs font-bold uppercase tracking-tight">
            Bergabung sebagai Waste Provider
          </span>
        </div>

        <h1 className="font-display text-5xl font-medium leading-[1.08] tracking-[-0.045em] text-brand-black">
          <span className="block">Daftarkan Pabrik</span>
          <span className="block">atau Garmen Anda.</span>
        </h1>

        <p className="mt-7 font-body text-sm leading-relaxed text-muted-moss">
          Ubah sisa produksi tekstil Anda menjadi material bernilai dan
          hubungkan bisnis Anda dengan ekosistem sirkular Muri.
        </p>
      </div>
    </>
  );
}
