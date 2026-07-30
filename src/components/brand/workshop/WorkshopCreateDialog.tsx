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
import { DatePickerInput } from "@/components/ui/DatePickerInput";
import { BannerUpload } from "@/components/ui/BannerUpload";
import { Spinner } from "@/components/ui/Spinner";
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
          <DialogTitle className="font-display text-2xl font-bold tracking-tight text-brand-black">
            Buat Workshop Baru
          </DialogTitle>
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
          <div className="flex-1 overflow-y-auto space-y-4 p-6 sm:p-8">

            {/* Judul */}
            <div className="space-y-2.5">
              <label className="block mb-2 text-xs font-semibold text-brand-black/70">
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
              <div className="space-y-2.5">
                <label className="block mb-2 text-xs font-semibold text-brand-black/70">
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
              <div className="space-y-2.5">
                <label className="block mb-2 text-xs font-semibold text-brand-black/70">
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

            {/* Lokasi */}
            <div className="space-y-2.5">
              <label className="block mb-2 text-xs font-semibold text-brand-black/70">
                Lokasi
              </label>
              <Input
                placeholder="Contoh: Gedung MURI Hub, Jakarta Selatan"
                value={form.location}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, location: e.target.value }))
                }
                required
              />
            </div>

            {/* Kuota & Biaya Poin */}
            <div className="grid gap-4 grid-cols-2">
              <div className="space-y-2.5">
                <label className="block mb-2 text-xs font-semibold text-brand-black/70">
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
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block mb-2 text-xs font-semibold text-brand-black/70">
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
              <div className="space-y-2.5">
                <label className="block mb-2 text-xs font-semibold text-brand-black/70">
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
              <div className="space-y-2.5">
                <label className="block mb-2 text-xs font-semibold text-brand-black/70">
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
            <div className="space-y-2.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-brand-black/70">
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
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-brand-black/70">
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
