"use client";

import { type ReactElement } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { LocationPicker, type AddressJSONB } from "@/components/shared/LocationPicker";
import { DatePickerInput } from "@/components/ui/DatePickerInput";
import { BannerUpload } from "@/components/ui/BannerUpload";
import { Spinner } from "@/components/ui/Spinner";
import { Hammer } from "lucide-react";
import { useWorkshopCreate } from "@/hooks/brand/useWorkshopCreate";

interface WorkshopCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after a workshop is successfully created so the list can refresh. */
  onCreated: () => void;
}

export function WorkshopCreateDialog({
  open,
  onOpenChange,
  onCreated,
}: WorkshopCreateDialogProps): ReactElement {
  const { form, setForm, isSubmitting, submitError, resetForm, handleSubmit } =
    useWorkshopCreate();

  const handleClose = () => {
    if (isSubmitting) return;
    resetForm();
    onOpenChange(false);
  };

  const onSubmit = (e: React.FormEvent) =>
    handleSubmit(e, () => {
      onOpenChange(false);
      onCreated();
    });

  const descriptionLength = form.description.length;
  const pointCostNum = Number(form.pointCost) || 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md sm:max-w-3xl bg-canvas-pure border border-line-trace rounded-xl w-full max-h-[95vh] flex flex-col overflow-hidden p-0">
        <DialogHeader className="px-6 py-5 border-b border-line-trace">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-brand-forest/10 text-brand-forest">
              <Hammer className="size-5" />
            </div>
            <div>
              <DialogTitle className="font-display text-lg font-bold tracking-tight text-brand-black">
                Buat Workshop Baru
              </DialogTitle>
              <p className="text-xs text-muted-moss">
                Tambah agenda & materi edukasi workshop sirkular baru
              </p>
            </div>
          </div>
        </DialogHeader>

        <form
          onSubmit={onSubmit}
          className="flex flex-col flex-1 overflow-hidden"
        >
          {/* Error Banner */}
          {submitError && (
            <div className="mx-6 mt-4 rounded bg-error-rust/[0.06] border border-error-rust/20 p-3 text-xs text-error-rust font-medium">
              {submitError}
            </div>
          )}

          {/* Scrollable Form Fields */}
          <div className="flex-1 overflow-y-auto space-y-5 p-6 sm:p-8">

            {/* Judul */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-brand-black mb-2">
                Judul Workshop
              </label>
              <Input
                placeholder="Contoh: Workshop Daur Ulang Tekstil Bersama MURI"
                value={form.title}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, title: e.target.value }))
                }
                required
              />
            </div>

            {/* Banner Upload */}
            <BannerUpload
              file={form.bannerFile}
              previewUrl={form.bannerPreviewUrl}
              onChange={(file, previewUrl) =>
                setForm((prev) => ({ ...prev, bannerFile: file, bannerPreviewUrl: previewUrl }))
              }
            />

            {/* Nama Narasumber & Jabatan */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-brand-black mb-2">
                  Nama Narasumber
                </label>
                <Input
                  placeholder="Nama lengkap narasumber"
                  value={form.speakerName}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, speakerName: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-brand-black mb-2">
                  Jabatan Narasumber
                </label>
                <Input
                  placeholder="Contoh: Head of Sustainability"
                  value={form.speakerRole}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, speakerRole: e.target.value }))
                  }
                  required
                />
              </div>
            </div>

            {/* Lokasi dengan LocationPicker & GPS Coordinates */}
            <div className="pt-1">
              <LocationPicker
                value={{
                  formatted_address: form.location.includes(" — ")
                    ? form.location.split(" — ")[0]
                    : "",
                  latitude: 0,
                  longitude: 0,
                  address_detail: form.location.includes(" — ")
                    ? form.location.split(" — ")[1]
                    : form.location,
                }}
                onChange={(data: AddressJSONB) => {
                  const full = data.formatted_address
                    ? `${data.formatted_address} — ${data.address_detail}`
                    : data.address_detail;
                  setForm((prev) => ({ ...prev, location: full }));
                }}
                label="Cari Lokasi & Koordinat Workshop"
                detailLabel="Detail Lokasi & Petunjuk Ruangan / Gedung"
                placeholder="Ketik wilayah/kota workshop (misal: Denpasar Timur)..."
                detailPlaceholder="Gedung MURI Hub Lt. 2, Ruang Srikandi..."
                required
              />
            </div>

            {/* Kuota & Biaya Poin */}
            <div className="grid gap-4 grid-cols-2">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-brand-black mb-2">
                  Kuota Peserta
                </label>
                <Input
                  type="number"
                  min={1}
                  placeholder="30"
                  value={form.quota}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, quota: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-brand-black mb-2">
                    Biaya Poin
                  </label>
                  <span className="text-[10px] text-muted-moss font-medium">
                    {pointCostNum === 0 ? "Gratis" : `${pointCostNum} Poin`}
                  </span>
                </div>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={form.pointCost}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, pointCost: e.target.value }))
                  }
                />
              </div>
            </div>

            {/* Tanggal Pelaksanaan (shadcn Calendar) & Jam Mulai */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-brand-black mb-2">
                  Tanggal Pelaksanaan
                </label>
                <DatePickerInput
                  value={form.heldDate}
                  onChange={(date) =>
                    setForm((prev) => ({ ...prev, heldDate: date }))
                  }
                  placeholder="Pilih tanggal pelaksanaan"
                  fromDate={new Date()}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-brand-black mb-2">
                  Jam Mulai
                </label>
                <Input
                  type="time"
                  value={form.heldTime}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, heldTime: e.target.value }))
                  }
                  required
                />
              </div>
            </div>

            {/* Deskripsi Singkat */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold text-brand-black mb-2">
                  Deskripsi Singkat
                </label>
                <span
                  className={`text-[10px] font-medium ${
                    descriptionLength > 200
                      ? "text-error-rust"
                      : "text-muted-moss"
                  }`}
                >
                  {descriptionLength}/200
                </span>
              </div>
              <Textarea
                placeholder="Deskripsi singkat yang akan ditampilkan di halaman workshop..."
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
                maxLength={200}
                required
              />
            </div>

            {/* Detail Lengkap — Rich Text (Wajib) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-brand-black">
                Detail Lengkap
              </label>
              <RichTextEditor
                value={form.detail}
                onChange={(val) =>
                  setForm((prev) => ({ ...prev, detail: val }))
                }
                placeholder="Isi agenda, materi, syarat, dan informasi teknis workshop di sini..."
                className="min-h-[150px]"
              />
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="shrink-0 flex items-center justify-end gap-3 border-t border-line-trace bg-canvas-warm/55 px-6 py-4 sm:px-8">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              variant="default"
              size="md"
              type="submit"
              disabled={isSubmitting || descriptionLength > 200}
              loading={isSubmitting}
            >
              Simpan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
