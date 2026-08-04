"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";

import { supabase } from "@/lib/supabaseClient";
import { getBrandMaterialOrders } from "@/services/material";
import {
  deleteSavedBrandPattern,
  getMySavedPatterns,
  saveBrandPatchwork,
  type SavedBrandPattern,
} from "@/services/brand/patchworkService";
import type { MaterialOrder } from "@/types/materialOrder";
import type {
  AiStatus,
  ExecutionPlan,
  FabricType,
  MaterialCondition,
  PatchworkGenerateResponse,
  PieceFormat,
  ProductionLevel,
  SourceMode,
  TargetProduct,
  VisualDirection,
} from "@/types/patchwork";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGES,
  MAX_TOTAL_BYTES,
  formatMegabytes,
  validateCustomNote,
} from "@/constants/patchwork.constants";

export function useBrandPatchwork() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlsRef = useRef<string[]>([]);

  const [sourceMode, setSourceMode] = useState<SourceMode>("upload");
  const [status, setStatus] = useState<AiStatus>("idle");
  const [materials, setMaterials] = useState<MaterialOrder[]>([]);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(true);
  const [selectedMaterialId, setSelectedMaterialId] = useState("");

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);

  // Prompt State
  const [promptText, setPromptText] = useState("");

  const [fabricType, setFabricType] = useState<FabricType>("auto");
  const [pieceFormat, setPieceFormat] =
    useState<PieceFormat>("medium-pieces");
  const [materialCondition, setMaterialCondition] =
    useState<MaterialCondition>("clean");
  const [targetProduct, setTargetProduct] = useState<TargetProduct>("auto");
  const [productionLevel, setProductionLevel] =
    useState<ProductionLevel>("standard");
  const [visualDirection, setVisualDirection] =
    useState<VisualDirection>("commercial");

  const [aiImageUrl, setAiImageUrl] = useState<string | null>(null);
  const [executionPlan, setExecutionPlan] = useState<ExecutionPlan | null>(
    null,
  );
  const [savedPattern, setSavedPattern] = useState<SavedBrandPattern | null>(
    null,
  );
  const [generationPrompt, setGenerationPrompt] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Saved Patterns Gallery & Active Silhouette Selection
  const [savedPatterns, setSavedPatterns] = useState<SavedBrandPattern[]>([]);
  const [isLoadingSavedPatterns, setIsLoadingSavedPatterns] = useState(true);
  const [deletingPatternId, setDeletingPatternId] = useState<string | null>(null);
  const [activeSilhouettePattern, setActiveSilhouettePattern] =
    useState<SavedBrandPattern | null>(null);
  const [activeRightTab, setActiveRightTab] = useState<"pola" | "siluet">("pola");

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const loadMaterials = useCallback(async () => {
    setIsLoadingMaterials(true);
    const response = await getBrandMaterialOrders();

    if (response.success && response.data && response.data.length > 0) {
      setMaterials(response.data);
      setSelectedMaterialId(response.data[0].id);
    }

    setIsLoadingMaterials(false);
  }, []);

  const loadSavedPatterns = useCallback(async () => {
    setIsLoadingSavedPatterns(true);
    const response = await getMySavedPatterns();
    if (response.success && response.data) {
      setSavedPatterns(response.data);
      if (response.data.length > 0 && !activeSilhouettePattern) {
        setActiveSilhouettePattern(response.data[0]);
      }
    }
    setIsLoadingSavedPatterns(false);
  }, [activeSilhouettePattern]);

  useEffect(() => {
    void loadMaterials();
    void loadSavedPatterns();
  }, [loadMaterials, loadSavedPatterns]);

  const selectedMaterial = useMemo(() => {
    return (
      materials.find((item) => item.id === selectedMaterialId) ??
      materials[0]
    );
  }, [materials, selectedMaterialId]);

  const totalBytes = useMemo(
    () => files.reduce((total, file) => total + file.size, 0),
    [files],
  );

  const customNoteError = useMemo(
    () => validateCustomNote(promptText),
    [promptText],
  );

  const sourceReady =
    sourceMode === "purchased" ? Boolean(selectedMaterial) : files.length > 0;

  const canGenerate =
    status !== "processing" &&
    !isSaving &&
    sourceReady &&
    !customNoteError;

  function resetResult() {
    setStatus("idle");
    setAiImageUrl(null);
    setExecutionPlan(null);
    setSavedPattern(null);
    setGenerationPrompt("");
    setIsSaving(false);
    setErrorMsg(null);
  }

  function replaceFiles(selected: File[]) {
    if (selected.length === 0) return;

    if (selected.length > MAX_IMAGES) {
      setErrorMsg(`Maksimal ${MAX_IMAGES} gambar agar referensi tetap fokus.`);
      return;
    }

    const invalidFile = selected.find(
      (file) => !ALLOWED_IMAGE_TYPES.has(file.type.toLowerCase()),
    );

    if (invalidFile) {
      setErrorMsg(
        `Format "${invalidFile.name}" tidak didukung. Gunakan JPG, PNG, WebP, atau AVIF.`,
      );
      return;
    }

    const nextTotalBytes = selected.reduce(
      (total, file) => total + file.size,
      0,
    );

    if (nextTotalBytes > MAX_TOTAL_BYTES) {
      setErrorMsg(
        `Total gambar ${formatMegabytes(nextTotalBytes)}. Maksimal 4 MB.`,
      );
      return;
    }

    previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    const nextPreviews = selected.map((file) => URL.createObjectURL(file));
    previewUrlsRef.current = nextPreviews;

    setFiles(selected);
    setPreviews(nextPreviews);
    resetResult();
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    replaceFiles(Array.from(event.target.files ?? []));
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragActive(false);
    replaceFiles(Array.from(event.dataTransfer.files ?? []));
  }

  function clearImages() {
    previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    previewUrlsRef.current = [];
    setFiles([]);
    setPreviews([]);
    resetResult();

    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function switchMode(mode: SourceMode) {
    setSourceMode(mode);
    resetResult();
  }

  function selectMaterial(id: string) {
    setSelectedMaterialId(id);
    resetResult();
  }

  async function handleDeletePattern(patternId: string) {
    setDeletingPatternId(patternId);
    try {
      const res = await deleteSavedBrandPattern(patternId);
      if (res.success) {
        setSavedPatterns((prev) => prev.filter((p) => p.id !== patternId));
        if (activeSilhouettePattern?.id === patternId) {
          const remaining = savedPatterns.filter((p) => p.id !== patternId);
          setActiveSilhouettePattern(remaining[0] ?? null);
        }
      } else {
        setErrorMsg(res.error ?? "Gagal menghapus pola.");
      }
    } finally {
      setDeletingPatternId(null);
    }
  }

  function handleSelectPatternForSilhouette(pattern: SavedBrandPattern) {
    setActiveSilhouettePattern(pattern);
    setActiveRightTab("siluet");
  }

  async function handleGenerate() {
    if (!canGenerate) return;

    setStatus("processing");
    setErrorMsg(null);
    setAiImageUrl(null);
    setExecutionPlan(null);
    setSavedPattern(null);
    setGenerationPrompt("");
    setIsSaving(false);

    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (sessionError || !accessToken) {
        setErrorMsg("Sesi login brand tidak ditemukan. Silakan login ulang.");
        setStatus("idle");
        return;
      }

      const formData = new FormData();
      formData.append("sourceMode", sourceMode);
      formData.append("fabricType", fabricType);
      formData.append("pieceFormat", pieceFormat);
      formData.append("materialCondition", materialCondition);
      formData.append("targetProduct", targetProduct);
      formData.append("productionLevel", productionLevel);
      formData.append("visualDirection", visualDirection);
      formData.append("customNote", promptText.trim());

      if (sourceMode === "upload") {
        if (files.length === 0) {
          setErrorMsg("Upload minimal 1 foto kain terlebih dahulu.");
          setStatus("idle");
          return;
        }

        files.forEach((file) => formData.append("images", file));
        formData.append("materialTitle", "Uploaded Upcycled Textile Waste");
        formData.append("providerName", "MURI Brand Studio");
      } else {
        if (!selectedMaterial) {
          setErrorMsg("Pilih material yang sudah dibeli terlebih dahulu.");
          setStatus("idle");
          return;
        }

        formData.append("materialTitle", selectedMaterial.batchTitle);
        formData.append("providerName", selectedMaterial.providerName);
        formData.append("materialSourceId", selectedMaterial.id);
      }

      const response = await fetch("/api/patchwork/generate", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
        cache: "no-store",
      });

      const rawResponse = await response.text();
      let data: PatchworkGenerateResponse | null = null;

      try {
        data = rawResponse
          ? (JSON.parse(rawResponse) as PatchworkGenerateResponse)
          : null;
      } catch {
        data = null;
      }

      if (!response.ok) {
        setErrorMsg(
          data?.detail ??
            data?.error ??
            rawResponse.slice(0, 500) ??
            "Terjadi kesalahan saat generate.",
        );
        setStatus("idle");
        return;
      }

      if (
        !data?.success ||
        !data.output ||
        !data.executionPlan ||
        !data.promptText
      ) {
        setErrorMsg(
          "AI tidak mengembalikan gambar atau rekomendasi yang lengkap.",
        );
        setStatus("idle");
        return;
      }

      setAiImageUrl(data.output);
      setExecutionPlan(data.executionPlan);
      setGenerationPrompt(data.promptText);
      setStatus("done");

      // Auto save generated pattern to DB/storage
      setIsSaving(true);
      const saveRes = await saveBrandPatchwork({
        outputUrl: data.output,
        promptText: promptText.trim() || data.promptText,
        images: sourceMode === "upload" ? files : [],
        sourceMode,
        materialTitle:
          sourceMode === "upload"
            ? "Uploaded Upcycled Textile Waste"
            : selectedMaterial?.batchTitle,
        providerName:
          sourceMode === "upload"
            ? "MURI Brand Studio"
            : selectedMaterial?.providerName,
        materialSourceId:
          sourceMode === "purchased" ? selectedMaterial?.id : undefined,
        fabricType,
        pieceFormat,
        materialCondition,
        targetProduct,
        productionLevel,
        visualDirection,
        customNote: promptText.trim(),
      });

      setIsSaving(false);

      if (saveRes.success && saveRes.data) {
        setSavedPattern(saveRes.data);
        setActiveSilhouettePattern(saveRes.data);
        await loadSavedPatterns();
        setActiveRightTab("siluet");
      }
    } catch {
      setErrorMsg("Terjadi kesalahan jaringan. Silakan coba lagi.");
      setStatus("idle");
    }
  }

  return {
    fileInputRef,
    sourceMode,
    switchMode,
    materials,
    isLoadingMaterials,
    selectedMaterialId,
    selectedMaterial,
    selectMaterial,
    files,
    previews,
    totalBytes,
    dragActive,
    setDragActive,
    handleFileChange,
    handleDrop,
    clearImages,
    promptText,
    setPromptText,
    fabricType,
    setFabricType,
    pieceFormat,
    setPieceFormat,
    materialCondition,
    setMaterialCondition,
    targetProduct,
    setTargetProduct,
    productionLevel,
    setProductionLevel,
    visualDirection,
    setVisualDirection,
    customNoteError,
    status,
    sourceReady,
    canGenerate,
    isSaving,
    errorMsg,
    aiImageUrl,
    executionPlan,
    savedPattern,
    savedPatterns,
    isLoadingSavedPatterns,
    deletingPatternId,
    activeSilhouettePattern,
    activeRightTab,
    setActiveRightTab,
    handleGenerate,
    handleDeletePattern,
    handleSelectPatternForSilhouette,
    resetResult,
    // Legacy compatibility fields
    customNote: promptText,
    setCustomNote: setPromptText,
    briefConfirmed: true,
    setBriefConfirmed: (_val?: boolean) => {},
    invalidateBrief: () => {},
    activeTab: "image" as "image" | "plan",
    setActiveTab: (_val?: "image" | "plan") => {},
    handleSave: async () => {},
  };
}

export type UseBrandPatchworkReturn = ReturnType<typeof useBrandPatchwork>;