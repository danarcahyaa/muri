"use client";

import { Leaf } from "lucide-react";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";

import AIMaterialInputPanel from "./ai-material/AIMaterialInputPanel";
import AIMaterialResult from "./ai-material/AIMaterialResult";

import {
  purchasedMaterials as fallbackMaterials,
  type AiStatus,
  type PurchasedMaterial,
  type SourceMode,
} from "@/data/aiMaterial";
import { getWastePosts } from "@/services/sourcing.service";

export default function AIMaterialSection() {
  const inputId = useId();

  const processingTimeoutRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  const [sourceMode, setSourceMode] =
    useState<SourceMode>("upload");

  const [status, setStatus] =
    useState<AiStatus>("idle");

  const [selectedFileName, setSelectedFileName] =
    useState("");

  const [uploadedPreviewUrl, setUploadedPreviewUrl] =
    useState<string | null>(null);

  const [materialsList, setMaterialsList] =
    useState<PurchasedMaterial[]>(fallbackMaterials);

  const [selectedPurchasedId, setSelectedPurchasedId] =
    useState(fallbackMaterials[0].id);

  // Load real waste posts from database
  useEffect(() => {
    let active = true;
    async function loadDbMaterials() {
      try {
        const res = await getWastePosts();
        if (active && res.success && res.data && res.data.length > 0) {
          const dbItems: PurchasedMaterial[] = res.data.map((item) => ({
            id: item.id,
            name: item.customFabricName || "Limbah Kain Perca",
            batchId: `BATCH-${item.id.slice(0, 6).toUpperCase()}`,
            description: `${item.categoryName} · ${item.providerName}`,
            image: item.imageUrl || "/product.png",
            alt: item.customFabricName || "Limbah kain",
          }));
          setMaterialsList(dbItems);
          setSelectedPurchasedId(dbItems[0].id);
        }
      } catch (err) {
        console.error("Gagal memuat waste posts real untuk AI material:", err);
      }
    }
    void loadDbMaterials();
    return () => {
      active = false;
    };
  }, []);

  const selectedPurchasedMaterial = useMemo(
    () =>
      materialsList.find(
        (material) => material.id === selectedPurchasedId,
      ) ?? materialsList[0] ?? fallbackMaterials[0],
    [selectedPurchasedId, materialsList],
  );

  const activePreview =
    sourceMode === "upload"
      ? uploadedPreviewUrl
      : selectedPurchasedMaterial.image;

  function resetResult() {
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
      processingTimeoutRef.current = null;
    }

    setStatus("idle");
  }

  function handleModeChange(mode: SourceMode) {
    setSourceMode(mode);
    resetResult();
  }

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (uploadedPreviewUrl) {
      URL.revokeObjectURL(uploadedPreviewUrl);
    }

    const nextPreviewUrl = URL.createObjectURL(file);

    setUploadedPreviewUrl(nextPreviewUrl);
    setSelectedFileName(file.name);
    setStatus("idle");
  }

  function handlePurchasedMaterialSelect(
    materialId: string,
  ) {
    setSelectedPurchasedId(materialId);
    setStatus("idle");
  }

  function handleGenerate() {
    if (
      status === "processing" ||
      !activePreview
    ) {
      return;
    }

    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
    }

    setStatus("processing");

    processingTimeoutRef.current = setTimeout(() => {
      setStatus("done");
    }, 2200);
  }

  useEffect(() => {
    return () => {
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }

      if (uploadedPreviewUrl) {
        URL.revokeObjectURL(uploadedPreviewUrl);
      }
    };
  }, [uploadedPreviewUrl]);

  const buttonDisabled =
    !activePreview || status === "processing";

  return (
    <section
      id="ai-material"
      className="overflow-hidden bg-canvas-warm text-brand-black"
    >
      <div className="mx-auto w-[min(1320px,calc(100%_-_48px))] py-[clamp(78px,9vw,135px)]">
        <SectionHeading />

        <div
          className="
            mt-16 overflow-hidden rounded-3xl
            border border-brand-black/15 bg-canvas-pure
            xl:grid
            xl:grid-cols-[minmax(0,3fr)_minmax(420px,2fr)]
          "
        >
          <AIMaterialInputPanel
            inputId={inputId}
            sourceMode={sourceMode}
            status={status}
            selectedFileName={selectedFileName}
            uploadedPreviewUrl={uploadedPreviewUrl}
            selectedPurchasedId={selectedPurchasedId}
            selectedPurchasedMaterial={selectedPurchasedMaterial}
            materials={materialsList}
            buttonDisabled={buttonDisabled}
            onModeChange={handleModeChange}
            onFileChange={handleFileChange}
            onPurchasedSelect={handlePurchasedMaterialSelect}
            onGenerate={handleGenerate}
          />

          <AIMaterialResult status={status} />
        </div>
      </div>
    </section>
  );
}

function SectionHeading() {
  return (
    <div className="grid gap-10 lg:grid-cols-5 lg:items-end lg:gap-12">
      <div className="lg:col-span-3">
        <div className="mb-5 flex items-center gap-3 text-brand-emerald">
          <Leaf className="size-4" strokeWidth={2} />

          <span className="text-sm font-bold uppercase">
            Re-Desain Berbasis AI
          </span>
        </div>

        <h2 className="font-display text-5xl font-normal leading-none tracking-tighter sm:text-6xl md:leading-[1.05] lg:text-7xl">
          <span className="block">
            Ubah Sisa Kain
          </span>

          <span className="block">
            Menjadi Pola Baru.
          </span>
        </h2>
      </div>

      <div className="lg:col-span-2">
        <p className="max-w-xl text-base leading-relaxed text-muted-moss sm:text-sm 2xl:text-base">
          Bingung sisa kainmu dibuat apa? Manfaatkan kecerdasan
          buatan Muri untuk menghasilkan rekomendasi pola fashion
          modern secara instan.
        </p>
      </div>
    </div>
  );
}