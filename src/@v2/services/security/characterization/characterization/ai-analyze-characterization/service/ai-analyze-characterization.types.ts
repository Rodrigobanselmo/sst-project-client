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
  /** Ausente mantém a análise geral. */
  scope?: 'general' | 'risk' | 'field';
  riskId?: string;
  field?:
    | 'fonteGeradora'
    | 'medidasEngenhariaExistentes'
    | 'medidasAdministrativasExistentes'
    | 'medidasEngenhariaRecomendadas'
    | 'medidasAdministrativasRecomendadas';
  /** Ausente preserva a análise completa. catalog-only = só catálogo + justificativa. */
  suggestionMode?: 'catalog-only';
  /** Optional abort signal to cancel an in-flight AI analysis request. */
  signal?: AbortSignal;
}

export type WorkProcessItem = {
  desc: string;
  type: 'PARAGRAPH' | 'BULLET_0' | 'BULLET_1' | 'BULLET_2';
};

/** Presente no modo catalog-only; ausente na análise completa. */
export type CatalogOnlySuggestionOrigin = 'AI_SUGGESTED' | 'USER_REQUESTED';

export type CatalogOnlyTechnicalConsideration =
  | 'PERTINENCE_IDENTIFIED'
  | 'PERTINENCE_NOT_DEMONSTRATED'
  | 'INCONCLUSIVE';

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
  /** Somente catalog-only. */
  suggestionOrigin?: CatalogOnlySuggestionOrigin;
  /** Somente catalog-only. */
  technicalConsideration?: CatalogOnlyTechnicalConsideration;
};

export type AiRiskFieldSuggestionField =
  | 'generateSource'
  | 'existingEngineeringMeasures'
  | 'existingAdministrativeMeasures'
  | 'recommendedEngineeringMeasures'
  | 'recommendedAdministrativeMeasures'
  | 'probability'
  | 'observation';

export type AiSuggestionIntent = 'identificado' | 'verificar' | 'implementar';

export type AiRiskFieldSuggestion = {
  field: AiRiskFieldSuggestionField;
  currentValues?: string[] | number | null;
  suggestedValues: string[] | number;
  rationale?: string;
  applyMode: 'append' | 'replace-scalar';
  /** Ausente na análise geral. Nos recortes, distingue controle identificado, verificação e recomendação. */
  intent?: AiSuggestionIntent;
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
  emptyReason?: 'missing_generate_source' | 'insufficient_context' | 'exhausted';
  characterization: {
    id: string;
    name: string;
    type: string;
  };
};
