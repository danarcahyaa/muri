"use client";

import { useState, useEffect, useCallback } from "react";
import { format, parseISO } from "date-fns";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  updateWorkshop,
  uploadWorkshopBanner,
  type UpdateWorkshopPayload,
} from "@/services/brand-fashion/workshopService";
import type { BrandWorkshopItem } from "@/types/brandWorkshop";
import { toast } from "sonner";

export interface WorkshopEditForm {
  title: string;
  speakerName: string;
  speakerRole: string;
  location: string;
  description: string;
  pointCost: string;
  heldDate: Date | undefined;
  heldTime: string;
  detail: string;
  quota: string;
  isPublished: boolean;
  bannerFile: File | null;
  bannerPreviewUrl: string | null;
  existingBannerUrl: string | null;
}

export interface UseWorkshopEditReturn {
  form: WorkshopEditForm;
  setForm: React.Dispatch<React.SetStateAction<WorkshopEditForm>>;
  isSubmitting: boolean;
  submitError: string | null;
  handleSubmit: (e: React.FormEvent, onSuccess: () => void) => Promise<void>;
}

export function useWorkshopEdit(
  workshop: BrandWorkshopItem | null,
  open: boolean
): UseWorkshopEditReturn {
  const { user } = useAuth();

  const [form, setForm] = useState<WorkshopEditForm>({
    title: "",
    speakerName: "",
    speakerRole: "",
    location: "",
    description: "",
    pointCost: "0",
    heldDate: undefined,
    heldTime: "09:00",
    detail: "",
    quota: "30",
    isPublished: false,
    bannerFile: null,
    bannerPreviewUrl: null,
    existingBannerUrl: null,
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (workshop && open) {
      let parsedDate: Date | undefined = undefined;
      let parsedTime = "09:00";

      if (workshop.heldAt) {
        try {
          const d = parseISO(workshop.heldAt);
          if (!isNaN(d.getTime())) {
            parsedDate = d;
            parsedTime = format(d, "HH:mm");
          }
        } catch {
          // fallback
        }
      }

      setForm({
        title: workshop.title || "",
        speakerName: workshop.speakerName || "",
        speakerRole: workshop.speakerRole || "",
        location: workshop.location || "",
        description: workshop.description || "",
        pointCost: String(workshop.pointCost ?? 0),
        heldDate: parsedDate,
        heldTime: parsedTime,
        detail: workshop.detail || "",
        quota: String(workshop.quota ?? 30),
        isPublished: Boolean(workshop.isPublished),
        bannerFile: null,
        bannerPreviewUrl: workshop.bannerUrl || null,
        existingBannerUrl: workshop.bannerUrl || null,
      });
      setSubmitError(null);
    }
  }, [workshop, open]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent, onSuccess: () => void) => {
      e.preventDefault();

      if (!user?.id || !workshop?.id) return;

      if (!form.heldDate) {
        setSubmitError("Tanggal pelaksanaan wajib dipilih.");
        return;
      }
      if (!form.detail.trim()) {
        setSubmitError("Detail lengkap wajib diisi.");
        return;
      }
      if (form.description.length > 200) {
        setSubmitError("Deskripsi singkat tidak boleh melebihi 200 karakter.");
        return;
      }

      setIsSubmitting(true);
      setSubmitError(null);

      try {
        let finalBannerUrl = form.existingBannerUrl;

        // If a new banner file was uploaded, upload it to storage
        if (form.bannerFile) {
          finalBannerUrl = await uploadWorkshopBanner(user.id, form.bannerFile);
        } else if (!form.bannerPreviewUrl) {
          // Banner was cleared by user
          finalBannerUrl = null;
        }

        const dateStr = format(form.heldDate, "yyyy-MM-dd");
        const heldAt = `${dateStr}T${form.heldTime}:00`;

        const payload: UpdateWorkshopPayload = {
          title: form.title.trim(),
          speakerName: form.speakerName.trim(),
          speakerRole: form.speakerRole.trim(),
          location: form.location.trim(),
          description: form.description.trim(),
          pointCost: Number(form.pointCost) || 0,
          heldAt,
          detail: form.detail.trim(),
          quota: Number(form.quota) || 30,
          bannerUrl: finalBannerUrl,
          isPublished: form.isPublished,
        };

        const res = await updateWorkshop(workshop.id, payload);

        if (!res.success) {
          setSubmitError(res.error ?? "Gagal memperbarui workshop.");
          setIsSubmitting(false);
          return;
        }

        toast.success(`Workshop "${payload.title}" berhasil diperbarui.`);
        setIsSubmitting(false);
        onSuccess();
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Terjadi kesalahan sistem.";
        setSubmitError(message);
        setIsSubmitting(false);
      }
    },
    [user?.id, workshop?.id, form]
  );

  return { form, setForm, isSubmitting, submitError, handleSubmit };
}
