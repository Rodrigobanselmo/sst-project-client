import type {
  ChemicalUseScenarioActivityRiskFactor,
  ChemicalUseScenarioActivityRiskResolution,
  ChemicalUseScenarioBoardRow,
  ChemicalUseScenarioListItem,
} from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';

import { UNINDIVIDUALIZED_COMPOSITION_LABEL } from './chemical-composition-disclosure.util';

export const PENDING_SURVEY_STATUS_LABEL = 'Pendente de levantamento';

export const USE_SCENARIO_BOARD_STATUS_LABELS: Record<string, string> = {
  PENDENTE_DE_LEVANTAMENTO: PENDING_SURVEY_STATUS_LABEL,
  RASCUNHO: 'Rascunho',
  LEVANTAMENTO_EM_ANDAMENTO: 'Levantamento em andamento',
  LEVANTAMENTO_CONCLUIDO: 'Levantamento concluído',
  AGUARDANDO_ANALISE_TECNICA: 'Aguardando análise técnica',
};

export function formatUseScenarioBoardStatusLabel(
  status: string | null | undefined,
): string {
  if (!status) return '—';
  return USE_SCENARIO_BOARD_STATUS_LABELS[status] || status;
}

type ActivityRiskRow = Pick<
  ChemicalUseScenarioListItem,
  'activityRiskFactors' | 'activityRiskResolutions' | 'activityRiskOrigin'
> & {
  kind?: ChemicalUseScenarioBoardRow['kind'];
  id?: string;
  product?: ChemicalUseScenarioListItem['product'];
};

export function isPendingSurveyBoardRow(
  row: Pick<Partial<ChemicalUseScenarioBoardRow>, 'kind' | 'id'>,
): boolean {
  if (row.kind === 'PENDING_SURVEY') return true;
  return typeof row.id === 'string' && row.id.startsWith('pending:');
}

export function canOpenUseScenarioBoardRow(
  row: Pick<Partial<ChemicalUseScenarioBoardRow>, 'kind' | 'id'>,
): boolean {
  return !isPendingSurveyBoardRow(row);
}

export function formatUseScenarioBoardStatusChip(
  row: Pick<
    Partial<ChemicalUseScenarioBoardRow>,
    'kind' | 'id' | 'surveyStatus' | 'presentationStatus'
  >,
): string {
  if (isPendingSurveyBoardRow(row)) return PENDING_SURVEY_STATUS_LABEL;
  return formatUseScenarioBoardStatusLabel(
    row.surveyStatus || row.presentationStatus,
  );
}

export function getScenarioActivityRiskResolutions(
  row: ActivityRiskRow,
): ChemicalUseScenarioActivityRiskResolution[] {
  return row.activityRiskResolutions || [];
}

export function getScenarioActivityRiskFactors(
  row: ActivityRiskRow,
): ChemicalUseScenarioActivityRiskFactor[] {
  if (row.activityRiskFactors?.length) return row.activityRiskFactors;
  const byId = new Map<string, ChemicalUseScenarioActivityRiskFactor>();
  for (const item of getScenarioActivityRiskResolutions(row)) {
    if (item.status !== 'RESOLVED' || !item.riskFactor) continue;
    if (!byId.has(item.riskFactor.id)) {
      byId.set(item.riskFactor.id, item.riskFactor);
    }
  }
  return Array.from(byId.values());
}

export function isProductCompositionUnindividualized(
  row: ActivityRiskRow,
): boolean {
  return (
    row.activityRiskOrigin === 'PRODUCT_COMPOSITION' &&
    row.product?.activeComposition?.compositionDisclosure === 'UNINDIVIDUALIZED'
  );
}

export function formatActivityRiskFactorsListCell(
  factors: ChemicalUseScenarioActivityRiskFactor[],
  row?: ActivityRiskRow,
): string {
  if (!factors.length) {
    if (row && isProductCompositionUnindividualized(row)) {
      return UNINDIVIDUALIZED_COMPOSITION_LABEL;
    }
    return 'Não correlacionado';
  }
  if (factors.length === 1) return factors[0]!.name;
  if (factors.length === 2) {
    return `${factors[0]!.name}; ${factors[1]!.name}`;
  }
  return `${factors[0]!.name}; ${factors[1]!.name} +${factors.length - 2}`;
}

/**
 * Revisão manual só quando a API identificou exatamente 1 ChemicalIngredient
 * (RESOLVED ou UNLINKED com ingredientId). AMBIGUOUS / NO_MATCH → sem PATCH.
 */
export function canReviewScenarioActivityCorrelation(
  item: ChemicalUseScenarioActivityRiskResolution,
): boolean {
  if (!item.ingredientId) return false;
  if (item.resolution === 'AMBIGUOUS') return false;
  if (item.resolution === 'NO_MATCH') return false;
  return item.status === 'RESOLVED' || item.resolution === 'UNLINKED';
}

export function formatScenarioActivityCorrelationStatus(
  item: ChemicalUseScenarioActivityRiskResolution,
): string {
  if (item.status === 'RESOLVED' && item.riskFactor) {
    const cas = item.riskFactor.cas ? ` · CAS ${item.riskFactor.cas}` : '';
    return `${item.riskFactor.name}${cas}`;
  }
  if (item.resolution === 'AMBIGUOUS') {
    return 'Ingrediente ambíguo — revisão técnica necessária';
  }
  return 'Não correlacionado nesta linha';
}
