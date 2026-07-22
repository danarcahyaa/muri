"use client";

import { useState, useCallback } from "react";
import { format } from "date-fns";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  createWorkshop,
  uploadWorkshopBanner,
  type CreateWorkshopPayload,
} from "@/services/brand-fashion/workshopService";
import { toast } from "sonner";

export interface WorkshopCreateForm {
  title: string;
  speakerName: string;
  speakerRole: string;
  location: string;
  description: string;
  pointCost: string;
  /** Selected date from the Calendar picker */
  heldDate: Date | undefined;
  heldTime: string;
  detail: string;
  quota: string;
  /** File object for banner image (only used locally; uploaded on submit) */
  bannerFile: File | null;
  /** Object URL for local preview of the banner image */
  bannerPreviewUrl: string | null;
}

const INITIAL_FORM: WorkshopCreateForm = {
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
  bannerFile: null,
  bannerPreviewUrl: null,
};

export interface UseWorkshopCreateReturn {
  form: WorkshopCreateForm;
  setForm: React.Dispatch<React.SetStateAction<WorkshopCreateForm>>;
  isSubmitting: boolean;
  submitError: string | null;
  resetForm: () => void;
  handleSubmit: (e: React.FormEvent, onSuccess: () => void) => Promise<void>;
}

export function useWorkshopCreate(): UseWorkshopCreateReturn {
  const { user } = useAuth();

  const [form, setForm] = useState<WorkshopCreateForm>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    // Revoke object URL to free memory before resetting
    if (form.bannerPreviewUrl && form.bannerFile) {
      URL.revokeObjectURL(form.bannerPreviewUrl);
    }
    setForm(INITIAL_FORM);
    setSubmitError(null);
  }, [form.bannerPreviewUrl, form.bannerFile]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent, onSuccess: () => void) => {
      e.preventDefault();

      if (!user?.id) return;

      // --- Manual validations ---
      if (!form.bannerFile) {
        setSubmitError("Banner workshop wajib diunggah.");
        return;
      }
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
        // Step 1: Upload banner to Supabase Storage
        const bannerUrl = await uploadWorkshopBanner(user.id, form.bannerFile);

        // Step 2: Compose ISO datetime string
        const dateStr = format(form.heldDate, "yyyy-MM-dd");
        const heldAt = `${dateStr}T${form.heldTime}:00`;

        const payload: CreateWorkshopPayload = {
          title: form.title.trim(),
          speakerName: form.speakerName.trim(),
          speakerRole: form.speakerRole.trim(),
          location: form.location.trim(),
          description: form.description.trim(),
          pointCost: Number(form.pointCost) || 0,
          heldAt,
          detail: form.detail.trim(),
          quota: Number(form.quota) || 30,
          bannerUrl,
        };

        // Step 3: Insert workshop record
        const res = await createWorkshop(user.id, payload);

        if (!res.success) {
          setSubmitError(res.error ?? "Gagal membuat workshop.");
          setIsSubmitting(false);
          return;
        }

        toast.success(`Workshop "${payload.title}" berhasil dibuat.`);
        setIsSubmitting(false);
        setForm(INITIAL_FORM);
        onSuccess();
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Terjadi kesalahan sistem.";
        setSubmitError(message);
        setIsSubmitting(false);
      }
    },
    [user?.id, form]
  );

  return { form, setForm, isSubmitting, submitError, resetForm, handleSubmit };
}
