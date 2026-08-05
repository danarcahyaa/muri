import {
  CalendarDays,
  ExternalLink,
  Images,
  MapPin,
  PackageCheck,
  Recycle,
  Scale,
  Tag,
  UserRound,
} from "lucide-react";

import MaterialVisualCard from "@/components/material/MaterialVisualCard";
import RichTextContent from "@/components/ui/RichTextContent";
import DetailCard from "@/components/ui/detail/DetailCard";
import DetailInfoItem from "@/components/ui/detail/DetailInfoItem";
import { formatDate, formatWeight } from "@/lib/materialDetail";
import type { MaterialDetailItem } from "@/types/material";

interface MaterialDetailContentProps {
  material: MaterialDetailItem;
}

export default function MaterialDetailContent({
  material,
}: MaterialDetailContentProps) {
  const galleryMedia = material.media.filter((item) => {
    const type = String(item.type).toLowerCase();
    const isImage =
      type === "image" ||
      type === "photo" ||
      type === "picture";

    return isImage && item.url !== material.primaryImageUrl;
  });

  return (
    <div className="min-w-0 space-y-8">
      <MaterialVisualCard material={material} />

      <DetailCard
        eyebrow="Detail Material"
        title="Detail & Kondisi"
        icon={PackageCheck}
      >
        <RichTextContent
          html={material.descriptionHtml}
          mode="rich"
          className="text-sm leading-7 text-muted-moss"
        />
      </DetailCard>

      <DetailCard
        eyebrow="Informasi Material"
        title="Informasi Batch"
        icon={Recycle}
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <DetailInfoItem
            icon={Tag}
            label="Kategori"
            value={material.categoryName}
          />

          <DetailInfoItem
            icon={Scale}
            label="Berat Awal Batch"
            value={`${formatWeight(material.initialWeightKg)} kg`}
          />

          <DetailInfoItem
            icon={Recycle}
            label="Berat Waste Post"
            value={`${formatWeight(material.postWeightKg)} kg`}
          />

          <DetailInfoItem
            icon={PackageCheck}
            label="Kode Batch"
            value={material.batchCode}
          />

          <DetailInfoItem
            icon={CalendarDays}
            label="Batch Dibuat"
            value={formatDate(material.batchCreatedAt)}
          />

          <DetailInfoItem
            icon={MapPin}
            label="Kota Asal"
            value={material.originCity}
          />
        </div>
      </DetailCard>

      {galleryMedia.length > 0 && (
        <DetailCard
          eyebrow="Dokumentasi"
          title="Galeri Material"
          icon={Images}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {galleryMedia.map((media) => (
              <div
                key={media.id}
                className="aspect-[4/3] overflow-hidden rounded-xl bg-canvas-warm"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={media.url}
                  alt={`${material.title} - dokumentasi`}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 hover:scale-[1.02]"
                />
              </div>
            ))}
          </div>
        </DetailCard>
      )}

      <DetailCard
        eyebrow="Mitra Penyedia"
        title="Profil Penyedia Material"
        icon={UserRound}
      >
        <div
          className="
            grid items-center gap-6 rounded-2xl
            border border-brand-black/15 p-6
            sm:grid-cols-[72px_minmax(0,1fr)] sm:p-7
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
            {getInitial(material.providerName)}
          </div>

          <div className="min-w-0">
            <h3 className="font-display text-2xl font-medium tracking-[-0.035em] text-brand-black">
              {material.providerName}
            </h3>

            <p className="mt-2 text-xs font-bold text-brand-emerald">
              Penyedia Material Sirkular
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-x-7 gap-y-2 text-xs leading-6 text-muted-moss">
              <span>Material berasal dari {material.originCity}</span>

              {material.providerCreatedAt && (
                <span>
                  Terdaftar sejak {formatDate(material.providerCreatedAt)}
                </span>
              )}

              {material.originCity && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(material.originCity)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-bold text-brand-emerald transition-colors hover:text-brand-forest"
                >
                  <span>Buka peta lokasi {material.originCity}</span>
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

function getInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "M";
}
