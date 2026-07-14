import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

const exploreLinks = [
  {
    label: "Beranda",
    href: "/",
  },
  {
    label: "Ekosistem",
    href: "/#ekosistem",
  },
  {
    label: "Edukasi",
    href: "/edukasi",
  },
];

const marketplaceLinks = [
  {
    label: "Material Sirkular",
    href: "/material",
  },
  {
    label: "Produk Upcycled",
    href: "/produk",
  },
];

const platformLinks = [
  {
    label: "AI Material",
    href: "/#ai-material",
  },
  {
    label: "Traceability",
    href: "/#traceability",
  },
  {
    label: "Dampak",
    href: "/#dampak",
  },
];

const socialLinks = [
  {
    label: "Instagram",
    shortLabel: "ig",
    href: "#instagram",
  },
  {
    label: "LinkedIn",
    shortLabel: "in",
    href: "#linkedin",
  },
  {
    label: "YouTube",
    shortLabel: "yt",
    href: "#youtube",
  },
];

export default function Footer() {
  const currentYear =
    new Date().getFullYear();

  return (
    <footer className="bg-brand-black text-white">
      <div
        className="
          mx-auto
          w-[min(1320px,calc(100%_-_48px))]
          py-[clamp(64px,7vw,96px)]
        "
      >
        <div
          className="
            grid gap-14
            md:grid-cols-2
            lg:grid-cols-[1.3fr_0.65fr_0.7fr_0.7fr_1.1fr]
            lg:gap-10
          "
        >
          <FooterBrand />

          <FooterLinkColumn
            title="Jelajahi"
            links={exploreLinks}
          />

          <FooterLinkColumn
            title="Marketplace"
            links={marketplaceLinks}
          />

          <FooterLinkColumn
            title="Platform"
            links={platformLinks}
          />

          <Newsletter />
        </div>

        <div
          className="
            mt-20 flex flex-col gap-6
            border-t border-white/15
            pt-8 text-xs text-white/45

            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <p>
            © {currentYear} Muri Indonesia.
            All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-x-12 gap-y-4">
            <Link
              href="/privacy"
              className="
                transition-colors
                hover:text-brand-lime
              "
            >
              Privacy &amp; Policy
            </Link>

            <Link
              href="/terms"
              className="
                transition-colors
                hover:text-brand-lime
              "
            >
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterBrand() {
  return (
    <div className="max-w-sm">
      <Link
        href="/"
        aria-label="Muri"
        className="inline-flex items-center gap-2"
      >
        <Image
          src="/logo.png"
          alt="Logo Muri"
          width={40}
          height={40}
          className="size-10 object-contain"
        />

        <span className="font-display text-2xl font-normal tracking-tight text-white">
          Muri
        </span>
      </Link>

      <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/55">
        Mengubah sisa produksi tekstil menjadi
        solusi sirkular bernilai tinggi dengan
        kecerdasan buatan. Menuju masa depan
        fashion tanpa limbah.
      </p>

      <div className="mt-6 flex items-center gap-4">
        {socialLinks.map((item) => (
          <SocialLink
            key={item.label}
            label={item.label}
            shortLabel={item.shortLabel}
            href={item.href}
          />
        ))}
      </div>
    </div>
  );
}

interface FooterLink {
  label: string;
  href: string;
}

interface FooterLinkColumnProps {
  title: string;
  links: FooterLink[];
}

function FooterLinkColumn({
  title,
  links,
}: FooterLinkColumnProps) {
  return (
    <div>
      <h3 className="font-display text-sm font-bold text-white">
        {title}
      </h3>

      <nav
        aria-label={`Navigasi ${title}`}
        className="mt-7 flex flex-col items-start gap-5"
      >
        {links.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="
              text-sm text-white/55
              transition-colors
              hover:text-brand-lime
            "
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

interface SocialLinkProps {
  label: string;
  shortLabel: string;
  href: string;
}

function SocialLink({
  label,
  shortLabel,
  href,
}: SocialLinkProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="
        group flex size-12
        items-center justify-center
        rounded-full border
        border-white/15
        text-white
        transition duration-300

        hover:-translate-y-1
        hover:border-brand-lime
        hover:bg-brand-lime
        hover:text-brand-black

        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-brand-lime/30
      "
    >
      <span className="text-sm font-bold lowercase">
        {shortLabel}
      </span>
    </Link>
  );
}

function Newsletter() {
  return (
    <div>
      <h3 className="font-display text-sm font-bold text-white">
        Ikuti Perkembangan
      </h3>

      <p className="mt-7 max-w-xs text-sm leading-relaxed text-white/55">
        Ide bulanan, pembaruan produk, dan cerita
        dari komunitas sirkular.
      </p>

      <form
        className="mt-7"
        action="#"
      >
        <label
          htmlFor="footer-email"
          className="sr-only"
        >
          Alamat email
        </label>

        <div
          className="
            flex items-center
            border-b border-white/20
            transition-colors
            focus-within:border-brand-lime
          "
        >
          <input
            id="footer-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="Alamat Email"
            className="
              min-w-0 flex-1
              bg-transparent py-4
              text-sm text-white
              outline-none
              placeholder:text-white/50
            "
          />

          <button
            type="submit"
            aria-label="Berlangganan newsletter"
            className="
              group flex size-11
              items-center justify-center
              text-brand-lime
              transition-colors
              hover:text-white

              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-brand-lime/30
            "
          >
            <ArrowRight
              className="
                size-5
                transition-transform
                duration-300
                group-hover:translate-x-1
              "
            />
          </button>
        </div>
      </form>
    </div>
  );
}