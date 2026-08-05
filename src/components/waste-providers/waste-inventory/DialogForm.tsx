import { useState, useEffect, type ReactElement } from "react";
import { Package, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  WastePostItem,
  FabricCategoryItem,
  WasteInput,
} from "@/types/wasteProvider";
import { WastePostStatus, MediaType } from "@/enums/enums";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { MediaUpload } from "@/components/ui/MediaUpload";
import type { MediaItem } from "@/types/common";
import { Spinner } from "@/components/ui/Spinner";

import { formatThousand, parseThousand } from "@/lib/formatter";

interface DialogFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: WastePostItem | null;
  categories: FabricCategoryItem[];
  onSubmit: (data: WasteInput) => Promise<void>;
}

export function WasteDialogForm({
  open,
  onOpenChange,
  post,
  categories,
  onSubmit,
}: DialogFormProps): ReactElement {
  const [fabricName, setFabricName] = useState("");
  const [categoryId, setCategoryId] = useState<number>(0);
  const [weightKg, setWeightKg] = useState<number>(0);
  const [pricePerKg, setPricePerKg] = useState<number>(0);
  const [priceInput, setPriceInput] = useState("");
  const [minimumOrderKg, setMinimumOrderKg] = useState<number>(0);
  const [details, setDetails] = useState("");
  const [status, setStatus] = useState<WastePostStatus>(WastePostStatus.ACTIVE);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [batchCode, setBatchCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!post;

  useEffect(() => {
    if (post) {
      setFabricName(post.custom_fabric_name || "");
      setCategoryId(post.fabric_category_id);
      setWeightKg(post.weight_kg);
      setPricePerKg(post.price_per_kg);
      setPriceInput(formatThousand(post.price_per_kg));
      setMinimumOrderKg(post.minimum_order_kg);
      setDetails(post.details_and_conditions || "");
      setStatus(post.status);
      setMedia(
        post.media_list && post.media_list.length > 0
          ? post.media_list.map((m, idx: number) => ({
              id: `existing-${idx}`,
              url: m.url,
              type: m.type,
              name: `Media Terunggah ${idx + 1}`,
            }))
          : post.media_url
            ? [
                {
                  id: "existing-1",
                  url: post.media_url,
                  type:
                    post.media_url.endsWith(".mp4") ||
                    post.media_url.includes("video")
                      ? MediaType.VIDEO
                      : MediaType.IMAGE,
                  name: "Media Terunggah",
                },
              ]
            : [],
      );
      setBatchCode(post.batch_code || "");
    } else {
      setFabricName("");
      setCategoryId(categories[0]?.id || 0);
      setWeightKg(0);
      setPricePerKg(0);
      setPriceInput("");
      setMinimumOrderKg(0);
      setDetails("");
      setStatus(WastePostStatus.ACTIVE);
      setMedia([]);
      setBatchCode("");
    }
    setError(null);
  }, [post, open, categories]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const formatted = formatThousand(rawVal);
    setPriceInput(formatted);
    const parsed = parseThousand(formatted);
    setPricePerKg(parsed);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fabricName.trim()) {
      setError("Nama kain tidak boleh kosong.");
      return;
    }
    if (categoryId === 0) {
      setError("Jenis kain harus dipilih.");
      return;
    }
    if (weightKg <= 0) {
      setError("Berat kain harus lebih besar dari 0 Kg.");
      return;
    }
    if (pricePerKg < 0) {
      setError("Harga per Kg tidak boleh negatif.");
      return;
    }
    if (minimumOrderKg < 0) {
      setError("Minimum order tidak boleh negatif.");
      return;
    }
    if (media.length === 0) {
      setError("Media tidak boleh kosong. Harap unggah minimal 1 media.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit({
        custom_fabric_name: fabricName,
        fabric_category_id: categoryId,
        fabric_category_name: categories.find((c) => c.id === categoryId)?.name ?? "",
        weight_kg: weightKg,
        price_per_kg: pricePerKg,
        minimum_order_kg: minimumOrderKg,
        details_and_conditions: details,
        status,
        media,
      });
      onOpenChange(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal menyimpan data limbah.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="max-w-md sm:max-w-3xl bg-canvas-pure border border-line-trace rounded-xl w-full max-h-[95vh] flex flex-col overflow-hidden p-0 font-body">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-line-trace px-6 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-brand-lime/40 text-brand-forest">
              <Package className="size-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-brand-black">
                {isEditMode
                  ? "Detail / Edit Limbah Kain"
                  : "Tambah Limbah Kain Baru"}
              </h3>
              <p className="text-xs text-muted-moss">
                {isEditMode
                  ? "Perbarui informasi dan spesifikasi limbah"
                  : "Daftarkan ketersediaan sisa kain perca garmen baru"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Tutup modal"
            className="flex size-8 items-center justify-center rounded-full bg-canvas-warm text-brand-black transition hover:bg-line-trace cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden"
        >
          {error && (
            <div className="mx-6 sm:mx-8 mt-4 rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs font-medium text-red-700">
              {error}
            </div>
          )}

          {/* Scrollable Form Fields */}
          <div className="flex-1 overflow-y-auto space-y-5 p-6 sm:p-8">
            {/* Nama Kain */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-brand-black">
                  Nama Kain{" "}
                </label>
                <span className="text-[10px] text-muted-moss font-medium">
                  {fabricName.length}/200
                </span>
              </div>
              <Input
                placeholder="Contoh: Katun Sisa Putih Bersih"
                value={fabricName}
                onChange={(e) => setFabricName(e.target.value)}
                maxLength={200}
                required
              />
            </div>

            {/* Jenis Kain & Status */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-brand-black">
                  Jenis Kain
                </label>
                <Select
                  value={categoryId.toString()}
                  onValueChange={(val) => val && setCategoryId(parseInt(val))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih Jenis Kain">
                      {(value) => {
                        const id = parseInt(value);
                        return (
                          categories.find((cat) => cat.id === id)?.name ||
                          "Pilih Jenis Kain"
                        );
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isEditMode && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-brand-black">
                    Status
                  </label>
                  <Select
                    value={status}
                    onValueChange={(val) =>
                      val && setStatus(val as WastePostStatus)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih Status">
                        {(value) => {
                          const labels: Record<string, string> = {
                            [WastePostStatus.ACTIVE]: "Aktif",
                            [WastePostStatus.INACTIVE]: "Diarsipkan",
                          };
                          return labels[value] || "Pilih Status";
                        }}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={WastePostStatus.ACTIVE}>
                        Aktif
                      </SelectItem>
                      <SelectItem value={WastePostStatus.INACTIVE}>
                        Diarsipkan
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Berat, Harga, Min Order */}
            <div className="grid gap-4 grid-cols-3">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-brand-black">
                  Berat (Kg)
                </label>
                <Input
                  type="number"
                  step="any"
                  min="0.1"
                  placeholder="25"
                  value={weightKg || ""}
                  onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-brand-black">
                  Harga / Kg
                </label>
                <Input
                  type="text"
                  placeholder="15.000"
                  value={priceInput}
                  onChange={handlePriceChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-brand-black">
                  Min Order (Kg)
                </label>
                <Input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="5"
                  value={minimumOrderKg || ""}
                  onChange={(e) =>
                    setMinimumOrderKg(parseFloat(e.target.value) || 0)
                  }
                  required
                />
              </div>
            </div>

            {/* Batch & Location (Only in Detail/Edit Mode) */}
            {isEditMode && (
              <div className="grid gap-4 sm:grid-cols-2 bg-canvas-warm/50 p-4 rounded-lg border border-line-trace">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-brand-black">
                    Kode Batch
                  </label>
                  <Input
                    value={batchCode}
                    disabled
                    className="bg-canvas-warm/50 cursor-not-allowed opacity-75 font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-brand-black">
                    Lokasi Asal
                  </label>
                  <Input
                    value="Bali, Denpasar"
                    disabled
                    className="bg-canvas-warm/50 cursor-not-allowed opacity-75"
                  />
                </div>
              </div>
            )}

            {/* Foto & Video Upload */}
            <MediaUpload value={media} onChange={setMedia} />

            {/* Deskripsi & Kondisi */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-brand-black">
                Deskripsi & Kondisi
              </label>
              <RichTextEditor
                value={details}
                onChange={setDetails}
                placeholder="Sebutkan detail kain, warna, kebersihan, dan kondisi sisa produksi lainnya..."
                className="min-h-[150px]"
              />
            </div>
          </div>

          {/* Sticky/Fixed Footer */}
          <div className="shrink-0 flex items-center justify-end gap-3 border-t border-line-trace bg-canvas-warm/55 px-6 py-4 sm:px-8">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              variant="default"
              size="md"
              type="submit"
              disabled={isSubmitting}
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
