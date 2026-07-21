import type {
  FrpsAnalysisListItemType,
  FrpsExplanationItemType,
} from '@v2/services/forms/form-questions-answers-analysis/frps-explainability';
import { FRPS_EXPLAINABILITY_UI_COPY } from './frps-explainability-ui-copy';

const LIST_TO_EXPLANATION: Record<
  FrpsAnalysisListItemType,
  FrpsExplanationItemType
> = {
  fontesGeradoras: 'SOURCE',
  medidasEngenhariaRecomendadas: 'ENGINEERING_RECOMMENDATION',
  medidasAdministrativasRecomendadas: 'ADMINISTRATIVE_RECOMMENDATION',
};

const EXPLANATION_LABELS: Record<FrpsExplanationItemType, string> = {
  SOURCE: 'Fonte geradora',
  ENGINEERING_RECOMMENDATION: 'Recomendação de engenharia',
  ADMINISTRATIVE_RECOMMENDATION: 'Recomendação administrativa',
};

export function mapAnalysisListItemTypeToExplanationItemType(
  listItemType: FrpsAnalysisListItemType,
): FrpsExplanationItemType {
  return LIST_TO_EXPLANATION[listItemType];
}

export function getFrpsExplanationItemTypeLabel(
  itemType: FrpsExplanationItemType,
): string {
  return EXPLANATION_LABELS[itemType];
}

export function getConceptualValidationStatusLabel(
  status: 'DRAFT_AI' | 'VALIDATED' | 'REJECTED' | 'SUPERSEDED',
): string | null {
  if (status === 'VALIDATED') {
    return FRPS_EXPLAINABILITY_UI_COPY.conceptualValidatedLabel;
  }
  if (status === 'DRAFT_AI') {
    return 'Conhecimento conceitual gerado por IA — pendente de validação';
  }
  return null;
}

export function getContextualValidationStatusLabel(
  status: 'DRAFT_AI' | 'VALIDATED' | 'REJECTED' | 'SUPERSEDED',
): string | null {
  if (status === 'VALIDATED') return 'Justificativa desta análise validada';
  if (status === 'DRAFT_AI') {
    return FRPS_EXPLAINABILITY_UI_COPY.contextualGeneratedLabel;
  }
  return null;
}

/** @deprecated use getConceptualValidationStatusLabel / getContextualValidationStatusLabel */
export function getValidationStatusLabel(
  status: 'DRAFT_AI' | 'VALIDATED' | 'REJECTED' | 'SUPERSEDED',
): string | null {
  return getConceptualValidationStatusLabel(status);
}

/**
 * Chave de sessão para cache local.
 * Inclui company/application/analysis para não reutilizar entre contextos.
 * Prefere itemKey estável quando a API já o devolveu; senão usa nome + tipo.
 */
export function buildFrpsExplainabilityCacheKey(params: {
  companyId: string;
  applicationId: string;
  analysisId: string;
  itemType: FrpsExplanationItemType;
  itemKey?: string | null;
  itemName: string;
}): string {
  const identity =
    params.itemKey?.trim() ||
    `name:${params.itemName.trim().toLocaleLowerCase('pt-BR')}`;
  return `${params.companyId}|${params.applicationId}|${params.analysisId}|${params.itemType}|${identity}`;
}

export function buildFrpsExplainabilityCacheKeyPrefix(params: {
  companyId: string;
  applicationId: string;
  analysisId?: string;
}): string {
  if (params.analysisId) {
    return `${params.companyId}|${params.applicationId}|${params.analysisId}|`;
  }
  return `${params.companyId}|${params.applicationId}|`;
}
