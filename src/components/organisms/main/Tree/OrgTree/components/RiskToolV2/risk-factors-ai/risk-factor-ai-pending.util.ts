import type { ExistingRiskReview } from '@v2/services/security/characterization/characterization/ai-analyze-characterization/service/ai-analyze-characterization.types';
import type { IRiskData } from 'core/interfaces/api/IRiskData';
import type { IUpsertRiskData } from 'core/services/hooks/mutations/checklist/riskData/useMutUpsertRiskData';
import { RecTypeEnum } from 'project/enum/recType.enum';

import {
  buildModularSuggestionKey,
  getSuggestionValues,
} from 'components/organisms/modals/ModalAddCharacterization/components/ModalAiAnalysisContent/ai-risk-field-suggestion.util';
import { buildModularRiskUpsert } from 'components/organisms/modals/ModalAddCharacterization/components/ModalAiAnalysisContent/build-modular-risk-upsert.util';
import { planSuggestionApply } from 'components/organisms/modals/ModalAddCharacterization/components/ModalAiAnalysisContent/suggestion-apply-plan.util';

import { applyRecBulkResidualForWorkspace } from '../risk-catalog-bulk-add/with-residual-probability-after-rec-change.util';
import { implementationRecommendations } from '../utils/existing-control-correspondence.util';
import {
  RISK_FACTOR_AI_API_FIELD,
  riskDataAlreadyContainsFieldValue,
  RiskFactorAiField,
} from './risk-factors-ai-scope.util';

export type RiskFactorAiColumn = 'source' | 'eng' | 'adm' | 'rec';

export type RiskFactorAiPendingAction =
  | 'add'
  | 'confirm-existence'
  | 'accept-recommendation';

export type RiskFactorAiPendingSuggestion = {
  key: string;
  riskId: string;
  riskFactorDataId?: string;
  field: RiskFactorAiField;
  value: string;
  rationale?: string;
  action: RiskFactorAiPendingAction;
  recType?: RecTypeEnum;
};

export type RiskFactorAiPendingRiskData = Pick<
  IRiskData,
  'generateSources' | 'engs' | 'adms' | 'recs' | 'probability' | 'probabilityAfter'
> & { probabilityAuthority?: unknown };

const COLUMN_FIELDS: Record<RiskFactorAiColumn, RiskFactorAiField[]> = {
  source: ['generateSource'],
  eng: ['existingEngineeringMeasures'],
  adm: ['existingAdministrativeMeasures'],
  rec: ['recommendedEngineeringMeasures', 'recommendedAdministrativeMeasures'],
};

export function columnForAiField(field: string): RiskFactorAiColumn | null {
  const entry = (Object.keys(COLUMN_FIELDS) as RiskFactorAiColumn[]).find(
    (column) => (COLUMN_FIELDS[column] as string[]).includes(field),
  );
  return entry ?? null;
}

export function isExistingControlField(field: string): boolean {
  return (
    field === 'existingEngineeringMeasures' ||
    field === 'existingAdministrativeMeasures'
  );
}

/** Ação exigida por campo. Controle existente sempre pede confirmação, qualquer que seja o intent. */
export function pendingActionForField(
  field: RiskFactorAiField,
): RiskFactorAiPendingAction {
  if (isExistingControlField(field)) return 'confirm-existence';
  if (
    field === 'recommendedEngineeringMeasures' ||
    field === 'recommendedAdministrativeMeasures'
  ) {
    return 'accept-recommendation';
  }
  return 'add';
}

export function existingControlApiField(
  field: RiskFactorAiField,
): 'medidasAdministrativasExistentes' | 'medidasEngenhariaExistentes' | null {
  const apiField = RISK_FACTOR_AI_API_FIELD[field];
  return apiField === 'medidasAdministrativasExistentes' ||
    apiField === 'medidasEngenhariaExistentes'
    ? apiField
    : null;
}

const recTypeForField = (field: RiskFactorAiField): RecTypeEnum | undefined => {
  if (field === 'recommendedEngineeringMeasures') return RecTypeEnum.ENG;
  if (field === 'recommendedAdministrativeMeasures') return RecTypeEnum.ADM;
  return undefined;
};

/**
 * Sugestões ainda pendentes para uma coluna da linha.
 * Exclui aplicadas, descartadas, já cadastradas, instruções de verificação e repetidas.
 */
export function pendingSuggestionsForColumn(params: {
  reviews: ExistingRiskReview[];
  riskId: string;
  column: RiskFactorAiColumn;
  riskData?: RiskFactorAiPendingRiskData | null;
  appliedKeys: Set<string>;
  dismissedKeys: Set<string>;
}): RiskFactorAiPendingSuggestion[] {
  const fields = COLUMN_FIELDS[params.column];
  const reviews = params.reviews.filter((review) => review.riskId === params.riskId);

  const seen = new Set<string>();
  const result: RiskFactorAiPendingSuggestion[] = [];

  for (const review of reviews) {
    for (const suggestion of review.suggestions || []) {
      const field = suggestion.field as RiskFactorAiField;
      if (!fields.includes(field)) continue;

      for (const rawValue of getSuggestionValues(suggestion)) {
        const plan = planSuggestionApply({ value: String(rawValue) });
        if (plan.action === 'reject') continue;
        const value = String(plan.value);
        const key = buildModularSuggestionKey(review.riskId, field, value);
        if (seen.has(key)) continue;
        if (params.appliedKeys.has(key) || params.dismissedKeys.has(key)) continue;
        if (
          params.riskData &&
          riskDataAlreadyContainsFieldValue(field, value, params.riskData)
        ) {
          continue;
        }
        seen.add(key);
        result.push({
          key,
          riskId: review.riskId,
          riskFactorDataId: review.riskFactorDataId,
          field,
          value,
          rationale: suggestion.rationale,
          action: pendingActionForField(field),
          recType: recTypeForField(field),
        });
      }
    }
  }

  return result;
}

/** Contagem por coluna para o resumo da análise geral. */
export function countPendingSuggestionsByColumn(params: {
  review: ExistingRiskReview;
  riskData?: RiskFactorAiPendingRiskData | null;
  appliedKeys: Set<string>;
  dismissedKeys: Set<string>;
}): Record<RiskFactorAiColumn, number> {
  const columns: RiskFactorAiColumn[] = ['source', 'eng', 'adm', 'rec'];
  return columns.reduce(
    (acc, column) => {
      acc[column] = pendingSuggestionsForColumn({
        reviews: [params.review],
        riskId: params.review.riskId,
        column,
        riskData: params.riskData,
        appliedKeys: params.appliedKeys,
        dismissedKeys: params.dismissedKeys,
      }).length;
      return acc;
    },
    { source: 0, eng: 0, adm: 0, rec: 0 } as Record<RiskFactorAiColumn, number>,
  );
}

/** Mantém no modal apenas o que não tem coluna (probabilidade e observação). */
export function withoutColumnSuggestions(
  reviews: ExistingRiskReview[],
): ExistingRiskReview[] {
  return reviews
    .map((review) => ({
      ...review,
      suggestions: (review.suggestions || []).filter(
        (suggestion) => !columnForAiField(suggestion.field),
      ),
    }))
    .filter((review) => review.suggestions.length > 0);
}

const ADD_ONLY_KEYS = [
  'generateSourcesAddOnly',
  'engsAddOnly',
  'admsAddOnly',
  'recAddOnly',
] as const;

/**
 * Payload add-only para o handleSelect da linha. Identidade da linha fica com o handleSelect.
 * Recomendação segue a regra de residual da coluna Recomendações.
 */
export function buildPendingAcceptPayload(params: {
  suggestion: RiskFactorAiPendingSuggestion;
  riskData: RiskFactorAiPendingRiskData & { id?: string; riskId?: string };
  companyId: string;
  headerWorkspaceId?: string | null;
}): Partial<IUpsertRiskData> | null {
  const modular = buildModularRiskUpsert({
    field: params.suggestion.field,
    value: params.suggestion.value,
    riskData: params.riskData as IRiskData,
    riskGroupId: '',
    companyId: params.companyId,
    homogeneousGroupId: '',
  });
  if (!modular) return null;

  const payload: Partial<IUpsertRiskData> = {};
  for (const key of ADD_ONLY_KEYS) {
    if (modular[key]?.length) (payload as Record<string, unknown>)[key] = modular[key];
  }
  if (!Object.keys(payload).length) return null;

  if (params.suggestion.action !== 'accept-recommendation') return payload;

  return applyRecBulkResidualForWorkspace({
    payload,
    currentRecs: implementationRecommendations(params.riskData.recs),
    catalogMatches: [],
    namesToCreate: [params.suggestion.value],
    recType: params.suggestion.recType,
    realProbability: params.riskData.probability,
    currentResidual: params.riskData.probabilityAfter,
    headerWorkspaceId: params.headerWorkspaceId,
    riskData: params.riskData,
  });
}
