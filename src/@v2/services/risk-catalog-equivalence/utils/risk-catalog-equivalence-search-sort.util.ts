import type { RiskCatalogSearchItem } from '../service/risk-catalog-equivalence.types';

function sortPriority(
  item: RiskCatalogSearchItem,
  filterCompanyId?: string,
): number {
  if (item.system) return 0;
  if (filterCompanyId && item.companyId === filterCompanyId) return 1;
  return 2;
}

/** Ordena resultados: system → empresa do filtro → demais → alfabético. */
export function sortRiskCatalogSearchResults(
  items: RiskCatalogSearchItem[],
  filterCompanyId?: string,
): RiskCatalogSearchItem[] {
  return [...items].sort((a, b) => {
    const priorityDiff =
      sortPriority(a, filterCompanyId) - sortPriority(b, filterCompanyId);
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
