"use client";

import { Factory, FileImage, Package, Upload, X } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatWeightKg } from "@/lib/formatter";
import { MAX_IMAGES, formatMegabytes } from "@/constants/patchwork.constants";
import { StepHeader } from "./PatchworkShared";
import type { UseBrandPatchworkReturn } from "@/hooks/brand/useBrandPatchwork";

type PatchworkSourceCardProps = Pick<
  UseBrandPatchworkReturn,
  | "fileInputRef"
  | "sourceMode"
  | "switchMode"
  | "materials"
  | "isLoadingMaterials"
  | "selectedMaterialId"
  | "selectMaterial"
  | "files"
  | "previews"
  | "totalBytes"
  | "dragActive"
  | "setDragActive"
  | "handleFileChange"
  | "handleDrop"
  | "clearImages"
>;

export function PatchworkSourceCard({
  fileInputRef,
  sourceMode,
  switchMode,
  materials,
  isLoadingMaterials,
  selectedMaterialId,
  selectMaterial,
  files,
  previews,
  totalBytes,
  dragActive,
  setDragActive,
  handleFileChange,
  handleDrop,
  clearImages,
}: PatchworkSourceCardProps) {
  return (
    <Card>
      <CardContent className="space-y-4 p-5 sm:p-6">
        <StepHeader
          number="1"
          title="Pilih sumber material"
          description="Gunakan batch yang sudah dibeli atau unggah foto kain nyata."
        />

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={sourceMode === "purchased" ? "solid-black" : "outline"}
            size="sm"
            onClick={() => switchMode("purchased")}
          >
            <Package className="size-3.5" />
            Batch Terbeli
          </Button>
          <Button
            type="button"
            variant={sourceMode === "upload" ? "solid-black" : "outline"}
            size="sm"
            onClick={() => switchMode("upload")}
          >
            <Upload className="size-3.5" />
            {`Unggah Foto, maks. ${MAX_IMAGES}`}
          </Button>
        </div>

        {sourceMode === "purchased" ? (
          <div>
            {isLoadingMaterials ? (
              <div className="space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : materials.length === 0 ? (
              <div className="rounded-lg border border-line-trace bg-canvas-warm/40 p-4 text-xs text-muted-moss">
                Belum ada transaksi material yang dapat digunakan.
              </div>
            ) : (
              <div className="muri-scrollbar max-h-52 space-y-2 overflow-y-auto pr-1">
                {materials.map((item) => {
                  const selected = selectedMaterialId === item.id;

                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => selectMaterial(item.id)}
                      className={`flex w-full items-center justify-between rounded-lg border p-3.5 text-left transition ${
                        selected
                          ? "border-brand-forest bg-canvas-warm/40 shadow-xs"
                          : "border-line-trace bg-canvas-pure hover:border-brand-forest"
                      }`}
                    >
                      <span className="min-w-0 pr-3">
                        <span className="block truncate text-xs font-bold text-brand-black">
                          {item.batchTitle}
                        </span>
                        <span className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-moss">
                          <Factory className="size-3 shrink-0" />
                          {item.providerName} • {formatWeightKg(item.weightKg)}
                        </span>
                      </span>

                      <Badge
                        variant="success"
                        className="shrink-0 rounded-full normal-case tracking-normal"
                      >
                        {item.orderCode}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div>
            <label
              htmlFor="fabric-upload"
              onDragEnter={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed text-center transition ${
                files.length > 0 ? "p-4" : "min-h-[132px] p-6"
              } ${
                dragActive
                  ? "border-brand-forest bg-brand-lime/10"
                  : "border-line-trace bg-canvas-warm/30 hover:border-brand-forest"
              }`}
            >
              <input
                ref={fileInputRef}
                id="fabric-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />

              {files.length === 0 ? (
                <>
                  <FileImage className="size-7 text-muted-moss" />
                  <p className="mt-2 text-xs font-bold text-brand-black">
                    Foto kain dari atas, cahaya netral, dan tekstur terlihat
                    jelas
                  </p>
                  <p className="mt-1 text-[10px] text-muted-moss">
                    1–4 gambar • minimal 240 px • total maks. 4 MB
                  </p>
                </>
              ) : (
                <div className="w-full">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-brand-black">
                      {files.length} file dipilih · {formatMegabytes(totalBytes)}
                    </p>
                    <span className="shrink-0 text-[10px] text-muted-moss">
                      Klik untuk ganti
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {previews.map((src, index) => (
                      <div
                        key={src}
                        className="relative aspect-square overflow-hidden rounded-md border border-line-trace bg-canvas-warm"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={src}
                          alt={`Referensi kain ${index + 1}`}
                          className="size-full object-cover"
                        />
                        <span className="absolute left-1 top-1 flex size-4 items-center justify-center rounded-full bg-brand-forest text-[8px] font-bold text-white">
                          {index + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </label>

            {files.length > 0 && (
              <Button
                type="button"
                variant="link"
                size="xs"
                onClick={(event) => {
                  event.preventDefault();
                  clearImages();
                }}
                className="mt-2 text-muted-moss hover:text-red-600"
              >
                <X className="size-3" /> Hapus semua gambar
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}