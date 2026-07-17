import type { ComponentType } from "react";

import Link from "next/link";

import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Coins,
  Leaf,
  MapPin,
  Presentation,
  UserRound,
  UsersRound,
} from "lucide-react";

import RichTextContent from "@/components/ui/RichTextContent";
import {
  formatWorkshopDate,
  formatWorkshopTime,
} from "@/lib/workshop";
import { getWorkshops } from "@/services/workshop";
import type {
  WorkshopCatalogItem,
} from "@/types/workshop";

export default async function EducationWorkshopSection() {
  const response = await getWorkshops();

  const hasLoadError =
    !response.success;

  const workshops =
    response.success
      ? response.data ?? []
      : [];

  if (!response.success) {
    console.error(
      "[EducationWorkshopSection] Failed to fetch workshops:",
      response.error,
    );
  }

  return (
    <section
      id="program-workshop"
      className="scroll-mt-20 bg-canvas-pure"
    >
      <div
        className="
          mx-auto
          w-[min(1320px,calc(100%_-_48px))]
          py-[clamp(80px,9vw,130px)]
        "
      >
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
              <Leaf
                className="size-4"
                strokeWidth={2}
              />

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

          <div>
            <p className="max-w-lg text-sm leading-relaxed text-muted-moss 2xl:text-base">
              Pilih kelas sesuai minat
              Anda, mulai dari pengolahan
              material tekstil,
              pengembangan produk, hingga
              strategi bisnis fashion
              berkelanjutan.
            </p>

            {!hasLoadError && (
              <p className="mt-5 text-xs font-bold text-brand-emerald">
                {workshops.length} program
                tersedia
              </p>
            )}
          </div>
        </div>

        {workshops.length > 0 ? (
          <div className="mt-16 grid gap-6 lg:grid-cols-2">
            {workshops.map(
              (workshop) => (
                <WorkshopCard
                  key={workshop.id}
                  workshop={workshop}
                />
              ),
            )}
          </div>
        ) : (
          <EmptyWorkshopState
            hasLoadError={hasLoadError}
          />
        )}
      </div>
    </section>
  );
}

interface WorkshopCardProps {
  workshop: WorkshopCatalogItem;
}

function WorkshopCard({
  workshop,
}: WorkshopCardProps) {
  const workshopHref =
    `/edukasi/workshop/${workshop.id}`;

  return (
    <article
      className="
        group flex flex-col
        overflow-hidden rounded-2xl
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
      {/* Placeholder image */}
      <Link
        href={workshopHref}
        className="
          relative block
          aspect-[16/7.4]
          overflow-hidden rounded-lg
          bg-brand-forest
        "
      >
        <div className="flex h-full w-full items-center justify-center">
          <Presentation
            className="
              size-20 text-brand-lime
              transition duration-500
              group-hover:scale-105
            "
            strokeWidth={1.2}
          />
        </div>

        <span
          className="
            absolute left-4 top-4
            rounded-full
            bg-canvas-pure/95
            px-4 py-2
            text-[10px] font-bold
            text-brand-forest
            shadow-sm
            backdrop-blur-sm
          "
        >
          Workshop
        </span>

        {workshop.isFull && (
          <span
            className="
              absolute right-4 top-4
              rounded-full
              bg-brand-black
              px-4 py-2
              text-[10px] font-bold
              text-canvas-pure
            "
          >
            Kuota Penuh
          </span>
        )}
      </Link>

      {/* Metadata */}
      <div
        className="
          mt-6 flex flex-wrap
          items-center
          gap-x-3 gap-y-2
          text-[11px] font-bold
          text-brand-emerald
        "
      >
        <WorkshopMeta
          icon={UserRound}
          value={workshop.speakerName}
        />

        <MetadataSeparator />

        <WorkshopMeta
          icon={CalendarDays}
          value={formatWorkshopDate(
            workshop.heldAt,
          )}
        />

        <MetadataSeparator />

        <WorkshopMeta
          icon={MapPin}
          value={workshop.location}
        />
      </div>

      {/* Content */}
      <div className="mt-7 flex-1">
        <Link
          href={workshopHref}
          className="block"
        >
          <h3
            className="
              line-clamp-2
              min-h-[4.7rem]
              font-display
              text-3xl font-medium
              leading-tight
              tracking-[-0.035em]
              text-brand-black
              transition-colors

              group-hover:text-brand-emerald

              sm:min-h-[5.4rem]
              sm:text-4xl
            "
          >
            {workshop.title}
          </h3>
        </Link>

        <RichTextContent
          html={workshop.descriptionHtml}
          mode="plain"
          className="
            mt-4 line-clamp-2
            min-h-10 text-xs
            leading-relaxed
            text-muted-moss
          "
        />
      </div>

      {/* Quick information */}
      <div className="mt-7 grid gap-2 sm:grid-cols-3">
        <WorkshopFact
          icon={Clock3}
          label="Waktu"
          value={formatWorkshopTime(
            workshop.heldAt,
          )}
        />

        <WorkshopFact
          icon={UserRound}
          label="Pembicara"
          value={workshop.speakerRole}
        />

        <WorkshopFact
          icon={UsersRound}
          label="Ketersediaan"
          value={
            workshop.isFull
              ? "Kuota penuh"
              : `${workshop.remainingSlots} slot tersisa`
          }
        />
      </div>

      {/* Footer */}
      <div
        className="
          mt-7 flex items-end
          justify-between gap-5
          border-t border-line-trace
          pt-5
        "
      >
        <div>
          <p className="text-[10px] uppercase tracking-wide text-muted-moss">
            Biaya Workshop
          </p>

          <p
            className="
              mt-1 inline-flex
              items-center gap-2
              font-display text-2xl
              font-bold tracking-tight
              text-brand-black
            "
          >
            <Coins
              className="size-4 text-brand-emerald"
              strokeWidth={1.8}
            />

            {workshop.pointCost} POIN
          </p>
        </div>

        <Link
          href={workshopHref}
          className="
            group/action
            inline-flex items-center gap-3
            text-xs font-bold
            text-brand-emerald
            transition-colors
            hover:text-brand-forest
          "
        >
          <span>Lihat Detail</span>

          <ArrowRight
            className="
              size-4 transition-transform
              duration-300
              group-hover/action:translate-x-1
            "
          />
        </Link>
      </div>
    </article>
  );
}

interface WorkshopMetaProps {
  icon: ComponentType<{
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
      <Icon
        className="size-3.5"
        strokeWidth={2}
      />

      <span>{value}</span>
    </span>
  );
}

function MetadataSeparator() {
  return (
    <span
      aria-hidden="true"
      className="text-muted-moss/40"
    >
      ·
    </span>
  );
}

interface WorkshopFactProps {
  icon: ComponentType<{
    className?: string;
    strokeWidth?: number;
  }>;

  label: string;
  value: string;
}

function WorkshopFact({
  icon: Icon,
  label,
  value,
}: WorkshopFactProps) {
  return (
    <div className="rounded-lg bg-canvas-warm px-4 py-3">
      <div className="flex items-center gap-2 text-muted-moss">
        <Icon
          className="size-3.5"
          strokeWidth={1.8}
        />

        <span className="text-[9px] uppercase tracking-wide">
          {label}
        </span>
      </div>

      <p className="mt-2 truncate text-[11px] font-bold text-brand-black">
        {value}
      </p>
    </div>
  );
}

function EmptyWorkshopState({
  hasLoadError,
}: {
  hasLoadError: boolean;
}) {
  return (
    <div
      className="
        mt-16 flex min-h-72
        flex-col items-center
        justify-center
        rounded-2xl
        border border-dashed
        border-line-trace
        bg-canvas-warm/30
        px-6 text-center
      "
    >
      <CalendarDays
        className="size-10 text-muted-moss/50"
        strokeWidth={1.5}
      />

      <h3 className="mt-5 font-display text-2xl font-medium text-brand-black">
        {hasLoadError
          ? "Workshop gagal dimuat"
          : "Belum ada workshop tersedia"}
      </h3>

      <p className="mt-2 max-w-md text-xs leading-relaxed text-muted-moss">
        {hasLoadError
          ? "Data workshop belum dapat diambil. Silakan muat ulang halaman."
          : "Jadwal workshop terbaru akan segera ditampilkan di halaman ini."}
      </p>
    </div>
  );
}