import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  Coins,
  Leaf,
  MapPin,
  PackageCheck,
  Signal,
  UserRound,
  UsersRound,
} from "lucide-react";

import {
  formatWorkshopDate,
  getWorkshopBySlug,
  workshops,
} from "@/data/workshops";

interface WorkshopDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export function generateStaticParams() {
  return workshops.map((workshop) => ({
    slug: workshop.slug,
  }));
}

export async function generateMetadata({
  params,
}: WorkshopDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const workshop = getWorkshopBySlug(slug);

  if (!workshop) {
    return {
      title: "Workshop Tidak Ditemukan",
    };
  }

  return {
    title: `${workshop.title} | Muri`,
    description: workshop.shortDescription,
  };
}

export default async function WorkshopDetailPage({
  params,
}: WorkshopDetailPageProps) {
  const { slug } = await params;
  const workshop = getWorkshopBySlug(slug);

  if (!workshop) {
    notFound();
  }

  const bookedSlots = workshop.capacity - workshop.remainingSlots;

  const bookingPercentage = (bookedSlots / workshop.capacity) * 100;

  return (
    <main>
      {/* Hero */}
      <section className="bg-brand-forest text-canvas-pure">
        <div
          className="
            mx-auto w-[min(1320px,calc(100%_-_48px))]
            pb-[clamp(72px,8vw,110px)]
            pt-[clamp(32px,4vw,56px)]
          "
        >
          <nav
            aria-label="Breadcrumb"
            className="
              flex flex-wrap items-center gap-4
              text-xs text-canvas-pure/55
            "
          >
            <Link href="/" className="transition-colors hover:text-brand-lime">
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

            <span className="line-clamp-1">{workshop.title}</span>
          </nav>

          <div
            className="
              mt-14 grid gap-12
              lg:grid-cols-[minmax(0,1fr)_340px]
              lg:items-end
            "
          >
            <div>
              <div className="flex items-center gap-3 text-brand-lime">
                <Leaf className="size-4" strokeWidth={2} />

                <span className="text-sm font-bold uppercase tracking-tight">
                  {workshop.organizer}
                </span>
              </div>

              <p className="mt-7 text-xs font-bold uppercase tracking-[0.14em] text-canvas-pure/55">
                {workshop.category}
              </p>

              <h1
                className="
                  mt-4 max-w-5xl font-display
                  text-[clamp(3.5rem,6.5vw,6.5rem)]
                  font-normal leading-[0.94]
                  tracking-[-0.06em]
                "
              >
                {workshop.title}
              </h1>

              <p className="mt-8 max-w-3xl text-sm leading-relaxed text-canvas-pure/65 sm:text-base">
                {workshop.shortDescription}
              </p>
            </div>

            {/* Hero quick facts */}
            <aside
              className="
                rounded-2xl border
                border-canvas-pure/15
                bg-canvas-pure/5 p-6
                backdrop-blur-sm
              "
            >
              <p className="text-[11px] font-bold uppercase tracking-wide text-brand-lime">
                Informasi Workshop
              </p>

              <div className="mt-6 space-y-5">
                <HeroFact
                  icon={CalendarDays}
                  label="Tanggal"
                  value={formatWorkshopDate(workshop.date)}
                />

                <HeroFact
                  icon={Clock3}
                  label="Waktu"
                  value={`${workshop.startTime}–${workshop.endTime} ${workshop.timezone}`}
                />

                <HeroFact
                  icon={MapPin}
                  label="Lokasi"
                  value={workshop.location}
                />

                <HeroFact
                  icon={Signal}
                  label="Format"
                  value={`${workshop.mode} · ${workshop.level}`}
                />
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Detail content */}
      <section className="bg-canvas-warm">
        <div
          className="
            mx-auto grid
            w-[min(1320px,calc(100%_-_48px))]
            gap-10 py-[clamp(64px,8vw,110px)]
            lg:grid-cols-[minmax(0,1fr)_380px]
            lg:items-start
          "
        >
          {/* Main content */}
          <article
            className="
              overflow-hidden rounded-2xl
              border border-line-trace
              bg-canvas-pure
            "
          >
            <div className="p-4 sm:p-7">
              <div className="relative aspect-[16/8] overflow-hidden rounded-xl bg-canvas-warm">
                <Image
                  src={workshop.image}
                  alt={workshop.title}
                  fill
                  priority
                  sizes="
                    (max-width: 1024px) 100vw,
                    65vw
                  "
                  className="object-cover"
                />
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <DetailTag icon={UserRound} value={workshop.organizer} />

                <DetailTag
                  icon={CalendarDays}
                  value={formatWorkshopDate(workshop.date)}
                />

                <DetailTag icon={MapPin} value={workshop.location} />

                <DetailTag icon={Clock3} value={workshop.duration} />
              </div>
            </div>

            <div className="border-t border-line-trace px-6 py-9 sm:px-10">
              <ContentSection title="Tentang Workshop">
                <p className="text-sm leading-7 text-muted-moss">
                  {workshop.description}
                </p>
              </ContentSection>

              <ContentSection title="Yang Akan Anda Pelajari">
                <div className="grid gap-5 sm:grid-cols-2">
                  {workshop.outcomes.map((outcome) => (
                    <div key={outcome} className="h-full">
                      <div
                        className="
            flex h-full min-h-[92px] items-center gap-4
            rounded-[28px] bg-canvas-warm px-7 py-6
          "
                      >
                        <span
                          className="
              flex size-11 shrink-0 items-center justify-center
              rounded-full bg-brand-lime text-brand-forest
            "
                        >
                          <Check className="size-5" />
                        </span>

                        <p className="text-sm leading-relaxed text-brand-black">
                          {outcome}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ContentSection>

              <ContentSection title="Profil Pembicara">
                <div
                  className="
                    grid items-start gap-5 rounded-2xl
                    border border-line-trace p-5
                    sm:grid-cols-[64px_minmax(0,1fr)]
                    sm:gap-6 sm:p-7
                  "
                >
                  <div
                    className="
                      flex size-16 shrink-0
                      items-center justify-center
                      rounded-full bg-brand-lime
                      font-display text-2xl font-bold
                      text-brand-forest sm:mt-1
                    "
                  >
                    {workshop.speaker.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-display text-2xl font-medium leading-tight text-brand-black">
                      {workshop.speaker.name}
                    </h3>

                    <p className="mt-2 text-xs font-bold text-brand-emerald">
                      {workshop.speaker.role}
                    </p>

                    <p className="mt-1 text-xs text-muted-moss">
                      {workshop.speaker.organization}
                    </p>

                    <p className="mt-5 text-sm leading-6 text-muted-moss">
                      {workshop.speaker.bio}
                    </p>
                  </div>
                </div>
              </ContentSection>

              <ContentSection title="Agenda Kelas">
                <div>
                  {workshop.agenda.map((agenda, index) => {
                    const isLast = index === workshop.agenda.length - 1;

                    return (
                      <div
                        key={`${agenda.time}-${agenda.title}`}
                        className="
                            grid
                            grid-cols-[64px_24px_minmax(0,1fr)]
                            gap-x-3
                            sm:grid-cols-[84px_28px_minmax(0,1fr)]
                            sm:gap-x-4
                          "
                      >
                        <p className="pt-0.5 text-xs font-bold tabular-nums text-brand-emerald sm:text-sm">
                          {agenda.time}
                        </p>

                        <div className="relative flex justify-center">
                          {!isLast && (
                            <span
                              aria-hidden="true"
                              className="
                                  absolute left-1/2 top-[11px]
                                  bottom-[-11px] w-px
                                  -translate-x-1/2
                                  bg-line-trace
                                "
                            />
                          )}

                          <span
                            aria-hidden="true"
                            className="
                                relative z-10 mt-1
                                size-3.5 rounded-full
                                border-[3px]
                                border-brand-emerald
                                bg-canvas-pure
                              "
                          />
                        </div>

                        <div
                          className={
                            isLast ? "min-w-0" : "min-w-0 pb-7 sm:pb-8"
                          }
                        >
                          <h3 className="text-sm font-bold leading-5 text-brand-black sm:text-base">
                            {agenda.title}
                          </h3>

                          {agenda.description && (
                            <p className="mt-2 text-xs leading-6 text-muted-moss sm:text-sm">
                              {agenda.description}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ContentSection>

              <div className="grid gap-8 sm:grid-cols-2">
                <ContentSection title="Sudah Termasuk" compact>
                  <InformationList
                    items={workshop.included}
                    icon={PackageCheck}
                  />
                </ContentSection>

                <ContentSection title="Persyaratan Peserta" compact>
                  <InformationList items={workshop.requirements} icon={Check} />
                </ContentSection>
              </div>

              <ContentSection title="Lokasi Workshop">
                <div className="rounded-xl bg-canvas-warm p-5">
                  <div className="flex gap-4">
                    <MapPin className="mt-0.5 size-5 shrink-0 text-brand-emerald" />

                    <div>
                      <p className="text-sm font-bold text-brand-black">
                        {workshop.location}
                      </p>

                      <p className="mt-2 text-xs leading-relaxed text-muted-moss">
                        {workshop.address}
                      </p>
                    </div>
                  </div>
                </div>
              </ContentSection>
            </div>
          </article>

          {/* Booking card */}
          <aside
            className="
              rounded-2xl border
              border-line-trace
              bg-canvas-pure p-6
              lg:sticky lg:top-24
              sm:p-7
            "
          >
            <div className="flex items-center gap-3 text-brand-emerald">
              <Leaf className="size-4" strokeWidth={2} />

              <h2 className="text-xs font-bold uppercase tracking-tight">
                Ringkasan Pendaftaran
              </h2>
            </div>

            <div className="mt-7 rounded-xl bg-canvas-warm p-5">
              <div className="flex items-center justify-between gap-4">
                <p className="text-[11px] text-muted-moss">Ketersediaan</p>

                <p className="text-[11px] font-bold text-brand-black">
                  {workshop.remainingSlots} dari {workshop.capacity} slot
                </p>
              </div>

              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-line-trace">
                <div
                  className="h-full rounded-full bg-brand-emerald"
                  style={{
                    width: `${bookingPercentage}%`,
                  }}
                />
              </div>
            </div>

            <div className="mt-5 rounded-xl bg-brand-lime p-6 text-brand-forest">
              <p className="text-[10px] uppercase tracking-wide opacity-70">
                Harga Workshop
              </p>

              <div className="mt-7 flex items-center gap-3">
                <Coins className="size-7" strokeWidth={1.7} />

                <p className="font-display text-5xl font-medium tracking-[-0.05em]">
                  {workshop.coinPrice}
                </p>

                <p className="mt-4 text-xl font-bold">KOIN</p>
              </div>

              <p className="mt-4 text-[11px] opacity-70">Untuk satu peserta</p>
            </div>

            <div className="mt-6 space-y-4">
              <BookingFact
                icon={CalendarDays}
                label="Tanggal"
                value={formatWorkshopDate(workshop.date)}
              />

              <BookingFact
                icon={Clock3}
                label="Waktu"
                value={`${workshop.startTime}–${workshop.endTime} ${workshop.timezone}`}
              />

              <BookingFact
                icon={MapPin}
                label="Lokasi"
                value={workshop.location}
              />

              <BookingFact
                icon={UsersRound}
                label="Sisa kuota"
                value={`${workshop.remainingSlots} slot`}
              />
            </div>

            <Link
              href="/auth/login"
              className="
                group mt-7 flex w-full
                items-center justify-center gap-3
                rounded-sm bg-brand-forest
                px-6 py-4 text-xs font-bold
                text-canvas-pure
                transition duration-300
                hover:bg-brand-black
              "
            >
              Daftar Workshop
              <ArrowRight
                className="
                  size-4 transition-transform
                  group-hover:translate-x-1
                "
              />
            </Link>

            <p className="mt-4 text-center text-[10px] leading-relaxed text-muted-moss">
              Masuk atau buat akun untuk melanjutkan pendaftaran.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}

interface HeroFactProps {
  icon: React.ComponentType<{
    className?: string;
    strokeWidth?: number;
  }>;
  label: string;
  value: string;
}

function HeroFact({ icon: Icon, label, value }: HeroFactProps) {
  return (
    <div className="flex gap-4">
      <Icon
        className="mt-0.5 size-4 shrink-0 text-brand-lime"
        strokeWidth={1.8}
      />

      <div>
        <p className="text-[9px] uppercase tracking-wide text-canvas-pure/45">
          {label}
        </p>

        <p className="mt-1 text-xs font-bold text-canvas-pure">{value}</p>
      </div>
    </div>
  );
}

interface DetailTagProps {
  icon: React.ComponentType<{
    className?: string;
    strokeWidth?: number;
  }>;
  value: string;
}

function DetailTag({ icon: Icon, value }: DetailTagProps) {
  return (
    <span
      className="
        inline-flex items-center gap-2
        rounded-full bg-canvas-warm
        px-4 py-2 text-[10px]
        font-bold text-brand-emerald
      "
    >
      <Icon className="size-3.5" strokeWidth={1.8} />

      {value}
    </span>
  );
}

interface ContentSectionProps {
  title: string;
  children: React.ReactNode;
  compact?: boolean;
}

function ContentSection({
  title,
  children,
  compact = false,
}: ContentSectionProps) {
  return (
    <section
      className={`
        ${
          compact
            ? ""
            : `
              border-b border-line-trace
              pb-10
            `
        }

        mb-10 last:mb-0
        last:border-b-0 last:pb-0
      `}
    >
      <h2 className="mb-6 font-display text-3xl font-medium tracking-[-0.035em] text-brand-black">
        {title}
      </h2>

      {children}
    </section>
  );
}

interface InformationListProps {
  items: string[];
  icon: React.ComponentType<{
    className?: string;
    strokeWidth?: number;
  }>;
}

function InformationList({ items, icon: Icon }: InformationListProps) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <Icon
            className="mt-0.5 size-4 shrink-0 text-brand-emerald"
            strokeWidth={1.8}
          />

          <span className="text-xs leading-relaxed text-muted-moss">
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}

interface BookingFactProps {
  icon: React.ComponentType<{
    className?: string;
    strokeWidth?: number;
  }>;
  label: string;
  value: string;
}

function BookingFact({ icon: Icon, label, value }: BookingFactProps) {
  return (
    <div className="flex gap-4">
      <div
        className="
          flex size-9 shrink-0
          items-center justify-center
          rounded-lg bg-canvas-warm
          text-brand-emerald
        "
      >
        <Icon className="size-4" strokeWidth={1.8} />
      </div>

      <div>
        <p className="text-[9px] uppercase tracking-wide text-muted-moss">
          {label}
        </p>

        <p className="mt-1 text-xs font-bold text-brand-black">{value}</p>
      </div>
    </div>
  );
}
