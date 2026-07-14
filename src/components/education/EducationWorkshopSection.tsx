import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Leaf,
  MapPin,
  UserRound,
} from "lucide-react";

const workshops: Workshop[] = [
  {
    slug: "teknik-upcycling-mengolah-perca",
    organizer: "Bali Bali Bersih",
    date: "12/07/2026",
    location: "Gianyar",
    title: "Teknik Upcycling: Mengolah Perca Menjadi Produk Bernilai",
    description:
      "Kelas praktis mendesain ulang kain sisa produksi menjadi produk siap pakai bernilai jual.",
    image: "/workshops/upcycling-workshop.png",
  },
  {
    slug: "membangun-sustainable-brand",
    organizer: "Bali Bali Bersih",
    date: "12/07/2026",
    location: "Gianyar",
    title: "Membangun Sustainable Brand dari Awal",
    description:
      "Kupas tuntas strategi pemasaran, pricing, dan sertifikasi produk ramah lingkungan.",
    image: "/workshops/sustainable-brand-workshop.png",
  },
];

export default function EducationWorkshopSection() {
  return (
    <section className="bg-canvas-pure">
      <div className="mx-auto w-[min(1320px,calc(100%_-_48px))] py-[clamp(80px,9vw,130px)]">
        {/* Section header */}
        <div
          className="
            grid gap-10
            lg:grid-cols-[1.35fr_0.85fr]
            lg:items-end
            lg:gap-20
          "
        >
          <div>
            <div className="mb-5 flex items-center gap-3 text-brand-emerald">
              <Leaf className="size-4" strokeWidth={2} />

              <span className="text-sm font-bold uppercase tracking-tight">
                Jadwal Kelas Terdekat
              </span>
            </div>

            <h2
              className="
                max-w-3xl font-display
                text-[clamp(3.5rem,6vw,5.8rem)]
                font-normal leading-[0.94]
                tracking-[-0.06em]
                text-brand-black
              "
            >
              Ragam Workshop Sirkular Muri.
            </h2>
          </div>

          <p className="max-w-lg text-sm leading-relaxed text-muted-moss sm:text-sm 2xl:text-base">
            Pilih kelas yang sesuai dengan minat Anda, mulai dari teknik dasar
            pemilahan kain hingga strategi bisnis fashion ramah lingkungan.
          </p>
        </div>

        {/* Workshop cards */}
        <div className="mt-16 grid gap-6 lg:grid-cols-2">
          {workshops.map((workshop) => (
            <WorkshopCard
              key={workshop.slug}
              workshop={workshop}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface Workshop {
  slug: string;
  organizer: string;
  date: string;
  location: string;
  title: string;
  description: string;
  image: string;
}

interface WorkshopCardProps {
  workshop: Workshop;
}

function WorkshopCard({
  workshop,
}: WorkshopCardProps) {
  return (
    <article
      className="
        group overflow-hidden rounded-2xl
        border border-line-trace
        bg-canvas-pure p-4
        transition duration-300
        hover:-translate-y-1
        hover:border-brand-emerald
        hover:shadow-2xl
        hover:shadow-brand-black/5
        sm:p-7
      "
    >
      {/* Image */}
      <Link
        href={`/edukasi/workshop/${workshop.slug}`}
        className="relative block aspect-[16/7.4] overflow-hidden rounded-lg bg-canvas-warm"
      >
        <Image
          src={workshop.image}
          alt={workshop.title}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="
            object-cover transition duration-500
            group-hover:scale-[1.025]
          "
        />
      </Link>

      {/* Metadata */}
      <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] font-bold text-brand-emerald">
        <WorkshopMeta
          icon={UserRound}
          value={workshop.organizer}
        />

        <span aria-hidden="true" className="text-muted-moss/40">
          ·
        </span>

        <WorkshopMeta
          icon={MapPin}
          value={workshop.date}
        />

        <span aria-hidden="true" className="text-muted-moss/40">
          ·
        </span>

        <WorkshopMeta
          icon={CalendarDays}
          value={workshop.location}
        />
      </div>

      {/* Content */}
      <div className="mt-7">
        <Link
          href={`/edukasi/workshop/${workshop.slug}`}
          className="block"
        >
          <h3
            className="
              truncate font-display text-3xl font-medium
              leading-tight tracking-[-0.035em]
              text-brand-black
              transition-colors
              group-hover:text-brand-emerald
              sm:text-4xl
            "
          >
            {workshop.title}
          </h3>
        </Link>

        <p className="mt-3 text-xs leading-relaxed text-muted-moss">
          {workshop.description}
        </p>
      </div>

      {/* Card footer */}
      <div className="mt-7 border-t border-line-trace pt-5">
        <Link
          href={`/edukasi/workshop/${workshop.slug}`}
          className="
            flex items-center justify-between
            text-xs font-bold uppercase
            text-brand-emerald
            transition-colors
            hover:text-brand-forest
          "
        >
          <span>Ikuti</span>

          <ArrowRight
            className="
              size-4 transition-transform duration-300
              group-hover:translate-x-1
            "
          />
        </Link>
      </div>
    </article>
  );
}

interface WorkshopMetaProps {
  icon: React.ComponentType<{
    className?: string;
    strokeWidth?: number;
  }>;
  value: string;
}

function WorkshopMeta({
  icon: Icon,
  value,
}: WorkshopMetaProps) {
  return (
    <span className="inline-flex items-center gap-2">
      <Icon className="size-3.5" strokeWidth={2} />
      <span>{value}</span>
    </span>
  );
}