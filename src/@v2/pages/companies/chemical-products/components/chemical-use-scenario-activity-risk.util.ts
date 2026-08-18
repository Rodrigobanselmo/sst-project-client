import type {
  ChemicalUseScenarioActivityRiskFactor,
  ChemicalUseScenarioActivityRiskResolution,
  ChemicalUseScenarioListItem,
} from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';

import { UNINDIVIDUALIZED_COMPOSITION_LABEL } from './chemical-composition-disclosure.util';

export function getScenarioActivityRiskResolutions(
  row: ChemicalUseScenarioListItem,
): ChemicalUseScenarioActivityRiskResolution[] {
  return row.activityRiskResolutions || [];
}

export function getScenarioActivityRiskFactors(
  row: ChemicalUseScenarioListItem,
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
  row: ChemicalUseScenarioListItem,
): boolean {
  return (
    row.activityRiskOrigin === 'PRODUCT_COMPOSITION' &&
    row.product?.activeComposition?.compositionDisclosure === 'UNINDIVIDUALIZED'
  );
}

export function formatActivityRiskFactorsListCell(
  factors: ChemicalUseScenarioActivityRiskFactor[],
  row?: ChemicalUseScenarioListItem,
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
