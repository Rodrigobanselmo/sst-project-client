import type { AiTemporaryDocumentSource } from '../../ai-temporary-source/ai-temporary-document-source.types';

export type { AiTemporaryDocumentSource };

export interface AiAnalyzeCharacterizationParams {
  companyId: string;
  workspaceId: string;
  characterizationId: string;
  customPrompt?: string;
  userGuidance?: string;
  temporaryDocumentSources?: AiTemporaryDocumentSource[];
  model?: string; // Optional AI model to use (e.g., 'gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo')
  /** Optional abort signal to cancel an in-flight AI analysis request. */
  signal?: AbortSignal;
}

export type WorkProcessItem = {
  desc: string;
  type: 'PARAGRAPH' | 'BULLET_0' | 'BULLET_1' | 'BULLET_2';
};

export type DetailedRisk = {
  id: string;
  name: string;
  type: string;
  explanation: string;
  generateSource: string;
  probability: number; // 1-5 scale
  recommendedEngineeringMeasures: string[];
  recommendedAdministrativeMeasures: string[];
  existingEngineeringMeasures: string[];
  existingAdministrativeMeasures: string[];
  confidence: number;
};

export type AiRiskFieldSuggestionField =
  | 'generateSource'
  | 'existingEngineeringMeasures'
  | 'existingAdministrativeMeasures'
  | 'recommendedEngineeringMeasures'
  | 'recommendedAdministrativeMeasures'
  | 'probability'
  | 'observation';

export type AiRiskFieldSuggestion = {
  field: AiRiskFieldSuggestionField;
  currentValues?: string[] | number | null;
  suggestedValues: string[] | number;
  rationale?: string;
  applyMode: 'append' | 'replace-scalar';
};

export type ExistingRiskCurrent = {
  probability?: number | null;
  generateSources?: string[];
  existingEngineeringMeasures?: string[];
  existingAdministrativeMeasures?: string[];
  recommendedEngineeringMeasures?: string[];
  recommendedAdministrativeMeasures?: string[];
};

export type ExistingRiskReview = {
  riskId: string;
  riskFactorDataId?: string;
  name: string;
  type?: string;
  subtype?: string;
  current?: ExistingRiskCurrent;
  suggestions: AiRiskFieldSuggestion[];
  confidence?: number;
};

export type Result = {
  analysis: string;
  confidence: number;
  recommendedRisks: string[]; // Array of risk UUIDs recommended by AI
  detailedRisks: DetailedRisk[]; // Compat: novos riscos sugeridos
  newRiskSuggestions?: DetailedRisk[];
  existingRiskReviews?: ExistingRiskReview[];
  description: string; // Descrição extraída das fotos e informações
  workProcess: WorkProcessItem[]; // Processo de trabalho extraído
  metadata?: Record<string, any>;
  characterization: {
    id: string;
    name: string;
    type: string;
  };
};
