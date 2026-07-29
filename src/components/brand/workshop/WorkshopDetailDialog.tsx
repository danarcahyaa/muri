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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { useWorkshopEdit } from "@/hooks/brand/useWorkshopEdit";
import type { BrandWorkshopItem } from "@/types/brandWorkshop";

interface WorkshopDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workshop: BrandWorkshopItem | null;
  /** Called after a workshop is successfully updated so the list can refresh. */
  onUpdated: () => void;
}

export function WorkshopDetailDialog({
  open,
  onOpenChange,
  workshop,
  onUpdated,
}: WorkshopDetailDialogProps): ReactElement {
  const { form, setForm, isSubmitting, submitError, handleSubmit } =
    useWorkshopEdit(workshop, open);

  const handleClose = () => {
    if (isSubmitting) return;
    onOpenChange(false);
  };

  const onSubmit = (e: React.FormEvent) =>
    handleSubmit(e, () => {
      onOpenChange(false);
      onUpdated();
    });

  const descriptionLength = form.description.length;
  const pointCostNum = Number(form.pointCost) || 0;

  if (!workshop) return <></>;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md sm:max-w-3xl bg-canvas-pure border border-line-trace rounded-lg w-full max-h-[95vh] flex flex-col overflow-hidden sm:p-6 p-3 font-body">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-bold tracking-tight text-brand-black">
            Detail & Edit Workshop
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={onSubmit}
          className="flex flex-col flex-1 overflow-hidden mt-2 gap-0"
        >
          {/* Error Banner */}
          {submitError && (
            <div className="rounded bg-error-rust/[0.06] border border-error-rust/20 p-3 text-xs text-error-rust font-medium mb-4">
              {submitError}
            </div>
          )}

          {/* Scrollable Form Fields */}
          <div className="flex-1 overflow-y-auto space-y-4 px-1.5 pr-3 pb-4">
            {/* Judul & Status Publikasi */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-brand-black/70">
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

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-brand-black/70">
                  Status Workshop
                </label>
                <Select
                  value={form.isPublished ? "published" : "draft"}
                  onValueChange={(val) =>
                    val &&
                    setForm((prev) => ({
                      ...prev,
                      isPublished: val === "published",
                    }))
                  }
                >
                  <SelectTrigger className="w-full cursor-pointer">
                    <SelectValue placeholder="Pilih Status">
                      {(value) => (value === "published" ? "Dipublikasi" : "Draft")}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Publikasikan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Banner Upload */}
            <BannerUpload
              file={form.bannerFile}
              previewUrl={form.bannerPreviewUrl}
              onChange={(file, previewUrl) =>
                setForm((prev) => ({
                  ...prev,
                  bannerFile: file,
                  bannerPreviewUrl: previewUrl,
                }))
              }
            />

            {/* Nama Narasumber & Jabatan */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-brand-black/70">
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
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-brand-black/70">
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
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-brand-black/70">
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
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-brand-black/70">
                    Kuota Peserta
                  </label>
                  <span className="text-[10px] text-muted-moss font-medium">
                    Terdaftar: {workshop.registeredCount}
                  </span>
                </div>
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
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-brand-black/70">
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
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-brand-black/70">
                  Tanggal Pelaksanaan
                </label>
                <DatePickerInput
                  value={form.heldDate}
                  onChange={(date) =>
                    setForm((prev) => ({ ...prev, heldDate: date }))
                  }
                  placeholder="Pilih tanggal pelaksanaan"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-brand-black/70">
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
            <div className="space-y-1.5">
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
          <div className="pt-4 border-t border-line-trace/30 flex gap-2 justify-end bg-canvas-pure mt-auto pb-1 px-1">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              variant="solid-black"
              type="submit"
              disabled={isSubmitting || descriptionLength > 200}
              className="min-w-20 flex items-center justify-center"
            >
              {isSubmitting ? <Spinner /> : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
