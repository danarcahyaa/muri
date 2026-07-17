import {
  CalendarDays,
  Clock3,
  ExternalLink,
  MapPin,
  Presentation,
  UserRound,
  UsersRound,
} from "lucide-react";

import RichTextContent from "@/components/ui/RichTextContent";
import DetailCard from "@/components/ui/detail/DetailCard";
import DetailInfoItem from "@/components/ui/detail/DetailInfoItem";
import {
  formatWorkshopDate,
  formatWorkshopTime,
} from "@/lib/workshop";
import type { WorkshopCatalogItem } from "@/types/workshop";

interface WorkshopDetailContentProps {
  workshop: WorkshopCatalogItem;
  mapsUrl: string | null;
}

export default function WorkshopDetailContent({
  workshop,
  mapsUrl,
}: WorkshopDetailContentProps) {
  return (
    <div className="min-w-0 space-y-8">
      <WorkshopVisual />

      <DetailCard
        eyebrow="Detail Workshop"
        title="Tentang Workshop"
        icon={Presentation}
      >
        <RichTextContent
          html={workshop.descriptionHtml}
          mode="rich"
          className="text-sm leading-7 text-muted-moss"
        />
      </DetailCard>

      <DetailCard
        eyebrow="Pembicara"
        title="Profil Pembicara"
        icon={UserRound}
      >
        <div
          className="
            grid items-center gap-5 rounded-2xl
            border border-line-trace p-5
            sm:grid-cols-[72px_minmax(0,1fr)]
            sm:gap-6 sm:p-7
          "
        >
          <div
            className="
              flex size-[72px] items-center justify-center
              rounded-full bg-brand-lime
              font-display text-3xl font-semibold
              text-brand-forest
            "
          >
            {getInitial(workshop.speakerName)}
          </div>

          <div className="min-w-0">
            <h3 className="font-display text-2xl font-medium tracking-[-0.035em] text-brand-black">
              {workshop.speakerName}
            </h3>

            <p className="mt-2 text-xs font-bold text-brand-emerald">
              {workshop.speakerRole}
            </p>
          </div>
        </div>
      </DetailCard>

      <DetailCard
        eyebrow="Informasi Pelaksanaan"
        title="Jadwal & Lokasi"
        icon={CalendarDays}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <DetailInfoItem
            icon={CalendarDays}
            label="Tanggal"
            value={formatWorkshopDate(workshop.heldAt)}
          />

          <DetailInfoItem
            icon={Clock3}
            label="Waktu Mulai"
            value={formatWorkshopTime(workshop.heldAt)}
          />

          <DetailInfoItem
            icon={UsersRound}
            label="Kapasitas"
            value={`${workshop.quota} peserta`}
          />

          <DetailInfoItem
            icon={MapPin}
            label="Lokasi"
            value={workshop.location}
          />
        </div>

        <div className="mt-5 rounded-xl border border-line-trace p-5 sm:p-6">
          <div className="flex gap-4">
            <MapPin className="mt-0.5 size-5 shrink-0 text-brand-emerald" />

            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-brand-black">
                {workshop.location}
              </p>

              <p className="mt-2 text-xs leading-relaxed text-muted-moss">
                Datang lebih awal agar proses registrasi dapat selesai
                sebelum workshop dimulai.
              </p>

              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    mt-5 inline-flex items-center gap-2
                    text-xs font-bold text-brand-emerald
                    transition-colors hover:text-brand-forest
                  "
                >
                  Buka Google Maps
                  <ExternalLink className="size-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </DetailCard>
    </div>
  );
}

function WorkshopVisual() {
  return (
    <section className="rounded-2xl border border-line-trace bg-canvas-pure p-4 sm:p-7">
      <div
        className="
          relative flex aspect-[16/7.2]
          items-center justify-center overflow-hidden
          rounded-xl bg-brand-forest
        "
      >
        <div
          aria-hidden="true"
          className="absolute -right-16 -top-16 size-72 rounded-full border border-brand-lime/15"
        />

        <div
          aria-hidden="true"
          className="absolute -bottom-24 -left-16 size-80 rounded-full border border-brand-lime/10"
        />

        <div className="relative z-10 flex flex-col items-center text-brand-lime">
          <Presentation className="size-24" strokeWidth={1.1} />

          <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em]">
            Workshop Muri
          </p>
        </div>
      </div>
    </section>
  );
}

function getInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "M";
}
