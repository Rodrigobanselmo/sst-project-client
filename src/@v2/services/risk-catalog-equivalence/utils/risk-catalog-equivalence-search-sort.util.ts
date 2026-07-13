import type { RiskCatalogSearchItem } from '../service/risk-catalog-equivalence.types';
import {
  canAddAsAlias,
  canAddAsGlobalAlias,
} from './risk-catalog-equivalence-scope.util';

function sortPriority(
  item: RiskCatalogSearchItem,
  filterCompanyId?: string,
  canonical?: RiskCatalogSearchItem | null,
): number {
  if (item.system) return 0;
  if (filterCompanyId && item.companyId === filterCompanyId) return 1;
  if (canonical && canAddAsAlias(canonical, item)) return 2;
  if (canonical && canAddAsGlobalAlias(canonical, item)) return 3;
  return 4;
}

/**
 * Ordena resultados: system → empresa do filtro → compatíveis normais →
 * elegíveis a alias global → demais → alfabético. Mantém todos visíveis.
 */
export function sortRiskCatalogSearchResults(
  items: RiskCatalogSearchItem[],
  filterCompanyId?: string,
  canonical?: RiskCatalogSearchItem | null,
): RiskCatalogSearchItem[] {
  return [...items].sort((a, b) => {
    const priorityDiff =
      sortPriority(a, filterCompanyId, canonical) -
      sortPriority(b, filterCompanyId, canonical);
    if (priorityDiff !== 0) return priorityDiff;

    const labelDiff = (a.label || '').localeCompare(b.label || '', 'pt-BR', {
      sensitivity: 'base',
    });
    if (labelDiff !== 0) return labelDiff;

    return (a.companyName || '').localeCompare(b.companyName || '', 'pt-BR', {
      sensitivity: 'base',
    });
  });
}
