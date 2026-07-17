import Link from "next/link";
import { Leaf } from "lucide-react";

interface WorkshopHeroProps {
  title: string;
}

export default function WorkshopHero({
  title,
}: WorkshopHeroProps) {
  return (
    <section className="bg-brand-forest text-canvas-pure">
      <div
        className="
          mx-auto
          w-[min(1320px,calc(100%_-_48px))]
          pb-[clamp(72px,8vw,110px)]
          pt-[clamp(42px,6vw,82px)]
        "
      >
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-4 text-xs text-canvas-pure/55"
        >
          <Link
            href="/"
            className="transition-colors hover:text-brand-lime"
          >
            Beranda
          </Link>

          <span aria-hidden="true">/</span>

          <Link
            href="/edukasi"
            className="transition-colors hover:text-brand-lime"
          >
            Workshop
          </Link>

          <span aria-hidden="true">/</span>

          <span className="line-clamp-1">{title}</span>
        </nav>

        <div className="mt-14 max-w-5xl">
          <div className="flex items-center gap-3 text-brand-lime">
            <Leaf className="size-4" strokeWidth={2} />

            <p className="text-sm font-bold uppercase tracking-tight">
              Workshop Muri
            </p>
          </div>

          <h1
            className="
              mt-7 font-display
              text-[clamp(3.5rem,6.5vw,6.5rem)]
              font-normal leading-[1]
              tracking-[-0.06em]
            "
          >
            {title}
          </h1>
        </div>
      </div>
    </section>
  );
}
