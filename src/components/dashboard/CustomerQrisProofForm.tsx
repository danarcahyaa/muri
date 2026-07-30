"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  CheckCircle2,
  FileImage,
  LoaderCircle,
  ShieldCheck,
  Upload,
  X,
} from "lucide-react";

import {
  getCustomerQrisPaymentErrorMessage,
  removeCustomerQrisProof,
  submitCustomerQrisPayment,
  uploadCustomerQrisProof,
  validateCustomerQrisProofFile,
} from "@/services/customer";
import type {
  CustomerOrderPaymentStatus,
} from "@/types/customerOrder";

interface CustomerQrisProofFormProps {
  orderId: string;
  disabled?: boolean;

  onSubmitted: (
    paymentStatus:
      CustomerOrderPaymentStatus,
  ) => Promise<void> | void;

  onMessage: (
    message: string | null,
  ) => void;
}

export default function CustomerQrisProofForm({
  orderId,
  disabled = false,
  onSubmitted,
  onMessage,
}: CustomerQrisProofFormProps) {
  const inputRef =
    useRef<HTMLInputElement | null>(
      null,
    );

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [previewUrl, setPreviewUrl] =
    useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl =
      URL.createObjectURL(
        selectedFile,
      );

    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(
        objectUrl,
      );
    };
  }, [selectedFile]);

  function handleFileChange(
    file: File | null,
  ) {
    onMessage(null);

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const validationError =
      validateCustomerQrisProofFile(
        file,
      );

    if (validationError) {
      setSelectedFile(null);

      if (inputRef.current) {
        inputRef.current.value =
          "";
      }

      onMessage(
        getCustomerQrisPaymentErrorMessage(
          validationError,
        ),
      );

      return;
    }

    setSelectedFile(file);
  }

  function clearSelectedFile() {
    setSelectedFile(null);
    onMessage(null);

    if (inputRef.current) {
      inputRef.current.value =
        "";
    }
  }

  async function handleSubmit() {
    if (
      !selectedFile ||
      isSubmitting ||
      disabled
    ) {
      if (!selectedFile) {
        onMessage(
          "Pilih foto bukti pembayaran terlebih dahulu.",
        );
      }

      return;
    }

    setIsSubmitting(true);
    onMessage(null);

    let uploadedPath:
      | string
      | null = null;

    try {
      const uploadResult =
        await uploadCustomerQrisProof(
          orderId,
          selectedFile,
        );

      if (
        !uploadResult.success ||
        !uploadResult.data
      ) {
        onMessage(
          getCustomerQrisPaymentErrorMessage(
            uploadResult.error,
          ),
        );

        return;
      }

      uploadedPath =
        uploadResult.data.path;

      const submitResult =
        await submitCustomerQrisPayment(
          orderId,
          uploadedPath,
        );

      if (
        !submitResult.success ||
        !submitResult.data
      ) {
        /*
         * Jangan otomatis menghapus file pada
         * error jaringan yang tidak pasti.
         *
         * Request RPC mungkin berhasil tetapi
         * response gagal diterima.
         */
        onMessage(
          getCustomerQrisPaymentErrorMessage(
            submitResult.error,
          ),
        );

        return;
      }

      if (
        submitResult.data
          .paymentStatus ===
        "expired"
      ) {
        /*
         * RPC memastikan proof tidak disimpan
         * pada payment yang expired.
         */
        await removeCustomerQrisProof(
          uploadedPath,
        );

        onMessage(
          "Waktu pembayaran telah berakhir dan pesanan dibatalkan.",
        );
      } else {
        onMessage(
          "Bukti pembayaran berhasil dikirim dan sedang menunggu verifikasi.",
        );
      }

      await onSubmitted(
        submitResult.data
          .paymentStatus,
      );
    } catch (error) {
      console.error(
        "[CustomerQrisProofForm] Submit error:",
        error,
      );

      onMessage(
        "Bukti pembayaran belum dapat dikirim.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mt-7">
      <div className="rounded-2xl border border-brand-black/15 bg-canvas-warm p-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-canvas-pure text-brand-emerald">
            <FileImage
              className="size-5"
              strokeWidth={1.8}
            />
          </div>

          <div>
            <p className="text-xs font-bold text-brand-black">
              Bukti Pembayaran
            </p>

            <p className="mt-1 text-[10px] leading-4 text-muted-moss">
              JPEG, PNG, atau WebP.
              Maksimal 5 MB.
            </p>
          </div>
        </div>

        {!selectedFile ? (
          <label
            className={`
              mt-5 flex cursor-pointer
              flex-col items-center
              justify-center
              rounded-2xl border
              border-dashed
              border-line-trace
              bg-canvas-pure
              px-5 py-8 text-center
              transition
              hover:border-brand-emerald
              ${
                disabled
                  ? "pointer-events-none opacity-50"
                  : ""
              }
            `}
          >
            <Upload className="size-7 text-brand-emerald" />

            <span className="mt-3 text-xs font-bold text-brand-black">
              Pilih Foto Bukti
            </span>

            <span className="mt-1 text-[10px] text-muted-moss">
              Klik untuk memilih file
            </span>

            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={disabled}
              onChange={(event) => {
                handleFileChange(
                  event.target
                    .files?.[0] ??
                    null,
                );
              }}
              className="sr-only"
            />
          </label>
        ) : (
          <div className="relative mt-5 overflow-hidden rounded-2xl border border-brand-black/15 bg-canvas-pure p-3">
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Preview bukti pembayaran"
                className="max-h-72 w-full rounded-xl object-contain"
              />
            )}

            <button
              type="button"
              disabled={isSubmitting}
              onClick={
                clearSelectedFile
              }
              aria-label="Hapus file"
              className="absolute right-5 top-5 flex size-9 items-center justify-center rounded-full bg-brand-black/70 text-white transition hover:bg-brand-black disabled:opacity-50"
            >
              <X className="size-4" />
            </button>

            <div className="mt-3 px-2 pb-1">
              <p className="truncate text-xs font-bold text-brand-black">
                {selectedFile.name}
              </p>

              <p className="mt-1 text-[10px] text-muted-moss">
                {formatFileSize(
                  selectedFile.size,
                )}
              </p>
            </div>
          </div>
        )}
      </div>

      <button
        type="button"
        disabled={
          disabled ||
          isSubmitting ||
          !selectedFile
        }
        onClick={() => {
          void handleSubmit();
        }}
        className="mt-4 flex w-full items-center justify-center gap-3 rounded-md bg-brand-forest px-6 py-4 text-xs font-bold text-white transition hover:bg-brand-black disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            <LoaderCircle className="size-4 animate-spin" />
            Mengunggah Bukti...
          </>
        ) : selectedFile ? (
          <>
            Kirim Bukti Pembayaran
            <ShieldCheck className="size-4" />
          </>
        ) : (
          <>
            Pilih Bukti Pembayaran
            <CheckCircle2 className="size-4" />
          </>
        )}
      </button>

      <p className="mt-3 text-center text-[10px] leading-4 text-muted-moss">
        Kirim bukti hanya setelah
        transaksi QRIS berhasil.
      </p>
    </div>
  );
}

function formatFileSize(
  bytes: number,
): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (
    bytes <
    1024 * 1024
  ) {
    return `${(
      bytes / 1024
    ).toFixed(1)} KB`;
  }

  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(1)} MB`;
}