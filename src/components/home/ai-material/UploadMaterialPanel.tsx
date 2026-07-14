import { Upload } from "lucide-react";
import type { ChangeEvent } from "react";

type UploadMaterialPanelProps = {
  inputId: string;
  selectedFileName: string;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export default function UploadMaterialPanel({
  inputId,
  selectedFileName,
  onFileChange,
}: UploadMaterialPanelProps) {
  return (
    <label
      htmlFor={inputId}
      className="
        flex h-[320px] min-w-0 cursor-pointer
        flex-col justify-between rounded-2xl
        border border-dashed border-line-trace
        bg-canvas-warm/35 p-6
        transition duration-300
        hover:border-brand-emerald/40
        hover:bg-canvas-warm/55
        sm:h-[340px]
      "
    >
      <div className="flex size-16 items-center justify-center rounded-full bg-brand-lime text-brand-black">
        <Upload className="size-7" strokeWidth={2.1} />
      </div>

      <div className="min-w-0">
        <p className="font-display text-2xl font-medium leading-tight tracking-tight text-brand-black">
          Tarik atau Unggah foto material
        </p>

        <p className="mt-6 text-xs font-medium text-muted-moss">
          JPG, PNG, atau HEIC
        </p>

        {selectedFileName ? (
          <p className="mt-3 truncate text-xs font-bold text-brand-emerald">
            {selectedFileName}
          </p>
        ) : null}
      </div>

      <input
        id={inputId}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/heic"
        onChange={onFileChange}
        className="hidden"
      />
    </label>
  );
}