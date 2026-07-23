import type {
  FrpsAnalysisListItemType,
  FrpsExplanationItemType,
  ReadFrpsItemExplanationResponse,
} from '@v2/services/forms/form-questions-answers-analysis/frps-explainability';
import { FRPS_EXPLAINABILITY_UI_COPY } from './frps-explainability-ui-copy';

/** Espelha RiskCatalogKind sem acoplar o util a path aliases em testes tsx. */
export type FrpsRiskCatalogKind = 'GENERATE_SOURCE' | 'REC_MED';

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

/** itemKey estável a partir do catálogo local da análise. */
export function buildCatalogFrpsItemKey(
  itemType: FrpsExplanationItemType,
  catalogId: string,
): string {
  return `catalog:${itemType}:${catalogId}`;
}

export function mapFrpsItemTypeToRiskCatalogKind(
  itemType: FrpsExplanationItemType,
): FrpsRiskCatalogKind {
  return itemType === 'SOURCE' ? 'GENERATE_SOURCE' : 'REC_MED';
}

export type FrpsUnavailableUiPhase =
  | 'awaiting_master_generate'
  | 'awaiting_contextual_generate'
  | 'unavailable'
  | 'error';

/**
 * Resolve a fase de UI a partir de um read unavailable.
 * GLOBAL_CATALOG_LINK_REQUIRED → unavailable (sem picker / link-global).
 */
export function resolveFrpsUnavailableUiPhase(params: {
  reason: Extract<ReadFrpsItemExplanationResponse, { available: false }>['reason'];
  canGenerateConceptual?: boolean;
  canGenerateContextual?: boolean;
  isMaster: boolean;
}): FrpsUnavailableUiPhase {
  if (params.reason === 'ITEM_NOT_FOUND') return 'error';

  if (
    params.reason === 'CONTEXTUAL_NOT_GENERATED' &&
    params.canGenerateContextual
  ) {
    return 'awaiting_contextual_generate';
  }

  if (params.reason === 'GLOBAL_CATALOG_LINK_REQUIRED') {
    return 'unavailable';
  }

  if (
    params.isMaster &&
    params.canGenerateConceptual &&
    (params.reason === 'CONCEPTUAL_NOT_GENERATED' ||
      params.reason === 'NOT_GENERATED')
  ) {
    return 'awaiting_master_generate';
  }

  return 'unavailable';
}

export function getFrpsExplanationItemTypeLabel(
  itemType: FrpsExplanationItemType,
): string {
  return EXPLANATION_LABELS[itemType];
}

/** Título da seção de justificativa contextual no drawer (fonte vs recomendação). */
export function getFrpsContextualJustificationTitle(
  itemType: FrpsExplanationItemType,
): string {
  return itemType === 'SOURCE'
    ? FRPS_EXPLAINABILITY_UI_COPY.contextualJustificationTitleSource
    : FRPS_EXPLAINABILITY_UI_COPY.contextualJustificationTitleRecommendation;
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
