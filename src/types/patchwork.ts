export type SourceMode = "upload" | "purchased";
export type AiStatus = "idle" | "processing" | "done";

export type FabricType =
  | "auto"
  | "denim"
  | "cotton-linen"
  | "knit"
  | "synthetic"
  | "mixed";

export type PieceFormat =
  | "large-panels"
  | "medium-pieces"
  | "small-scraps"
  | "strips";

export type MaterialCondition = "clean" | "mixed" | "damaged";

export type TargetProduct =
  | "auto"
  | "jacket"
  | "shirt"
  | "bag"
  | "accessory"
  | "home";

export type ProductionLevel = "basic" | "standard" | "advanced";

export type VisualDirection =
  | "commercial"
  | "minimal"
  | "graphic"
  | "heritage";

export interface CuttingPiece {
  name: string;
  qty: string;
  size: string;
  note: string;
}

export interface VisualPanelGuide {
  title: string;
  description: string;
}

export interface ExecutionPlan {
  recommendationTitle: string;
  productName: string;
  productCategory: string;
  fitReason: string;
  patternTechnique: string;
  difficulty: string;
  productionLevel: string;
  visualDirection: string;
  materialUsage: string;
  wasteTarget: string;
  needleSpec: string;
  threadSpec: string;
  stabilizerSpec: string;
  seamAllowance: string;
  estimatedYield: string;
  cuttingPieces: CuttingPiece[];
  assemblySteps: string[];
  riskNotes: string[];
  qualityChecks: string[];
  alternativeProducts: string[];
  visualPanelGuide: VisualPanelGuide[];
  impactDisclaimer: string;
}

export interface PatchworkGenerateResponse {
  success?: boolean;
  output?: string;
  error?: string;
  detail?: string;
  imageCount?: number;
  executionPlan?: ExecutionPlan;
  promptText?: string;
}

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}