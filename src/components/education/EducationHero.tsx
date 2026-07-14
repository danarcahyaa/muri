import Link from "next/link";
import { ArrowDownRight, Briefcase, Leaf } from "lucide-react";

export default function EducationHero() {
  return (
    <section className="relative overflow-hidden bg-canvas-warm">
      <div className="mx-auto w-[min(1320px,calc(100%_-_48px))] pt-[clamp(32px,4vw,56px)] pb-[clamp(72px,8vw,120px)]">
        {" "}
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-5 text-xs text-muted-moss"
        >
          <Link href="/" className="transition-colors hover:text-brand-emerald">
            Beranda
          </Link>

          <span aria-hidden="true" className="text-muted-moss/50">
            /
          </span>

          <span className="text-muted-moss">Edukasi</span>
        </nav>
        {/* Hero content */}
        <div className="mt-12 grid gap-14 lg:mt-14 lg:grid-cols-[minmax(0,1.7fr)_minmax(340px,1fr)] lg:items-center">
          {" "}
          {/* Left content */}
          <div>
            <div className="mb-5 flex items-center gap-3 text-brand-emerald">
              <Leaf className="size-4" strokeWidth={2} />

              <span className="text-sm font-bold uppercase tracking-tight">
                Program Pemberdayaan Muri
              </span>
            </div>

            <h1 className="max-w-4xl font-display text-[clamp(3.5rem,6.7vw,6.5rem)] font-normal leading-[0.94] tracking-[-0.06em] text-brand-black">
              <span className="block">Asah Pemahaman</span>

              <span className="block">Ikuti Workshop.</span>
            </h1>

            <p className="mt-9 max-w-3xl text-sm leading-relaxed text-muted-moss sm:text-base">
              Tingkatkan keterampilan Anda dalam mengolah limbah tekstil menjadi
              produk fashion bernilai tinggi langsung dari para mentor ahli.
            </p>

            <Link
              href="#program-workshop"
              className="
                group mt-9 inline-flex items-center gap-3
                text-xs font-bold text-brand-emerald
                transition-colors hover:text-brand-forest
              "
            >
              Jelajahi Program Workshop
              <ArrowDownRight
                className="
                  size-4 transition-transform duration-300
                  group-hover:translate-x-1
                  group-hover:translate-y-1
                "
              />
            </Link>
          </div>
          {/* Statistic card */}
          <aside
            className="
              rounded-2xl border border-line-trace
              bg-canvas-pure p-7
              sm:p-8
            "
          >
            <p className="text-xs font-bold uppercase tracking-tight text-brand-emerald">
              Belajar &amp; Berkreasi
            </p>

            <div className="flex min-h-48 items-center justify-center py-8">
              <Briefcase
                className="size-28 text-brand-black sm:size-32"
                strokeWidth={1.5}
              />
            </div>

            <div>
              <p className="font-display text-4xl font-medium tracking-[-0.04em] text-brand-black">
                84+ Workshop
              </p>

              <p className="mt-2 text-xs leading-relaxed text-muted-moss">
                Dapatkan modul intensif, alat praktik, dan sertifikat resmi
                ekosistem sirkular.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
