import type { Result } from '@v2/services/security/characterization/characterization/ai-analyze-characterization/service/ai-analyze-characterization.types';
import type { AiTemporaryDocumentSource } from '@v2/services/security/characterization/characterization/ai-temporary-source/ai-temporary-document-source.types';

export type { Result as AiAnalyzeGseResult };
export type {
  DetailedRisk,
  ExistingRiskReview,
} from '@v2/services/security/characterization/characterization/ai-analyze-characterization/service/ai-analyze-characterization.types';

export interface AiAnalyzeGseParams {
  companyId: string;
  workspaceId: string;
  gseId: string;
  customPrompt?: string;
  userGuidance?: string;
  temporaryDocumentSources?: AiTemporaryDocumentSource[];
  model?: string;
  scope?: 'general' | 'risk' | 'field';
  riskId?: string;
  /** Somente scope risk; ausente mantém o comportamento legado. */
  selectedFields?: Array<'fonteGeradora' | 'medidasEngenhariaExistentes' | 'medidasAdministrativasExistentes' | 'medidasEngenhariaRecomendadas' | 'medidasAdministrativasRecomendadas' | 'probabilidade'>;
  field?:
    | 'fonteGeradora'
    | 'medidasEngenhariaExistentes'
    | 'medidasAdministrativasExistentes'
    | 'medidasEngenhariaRecomendadas'
    | 'medidasAdministrativasRecomendadas';
  /** Ausente preserva a análise completa. catalog-only = só catálogo + justificativa. */
  suggestionMode?: 'catalog-only';
  signal?: AbortSignal;
}
