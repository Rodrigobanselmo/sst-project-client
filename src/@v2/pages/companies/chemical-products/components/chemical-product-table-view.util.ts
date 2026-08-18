import type { ChemicalProductListItem } from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';

export const UNLINKED_RISK_FACTOR_CHIP_LABEL = 'Sem FR';
export const UNLINKED_RISK_FACTOR_CHIP_TOOLTIP =
  'Sem fator de risco correlacionado';

export type ChemicalProductTableProductTypeFilter = 'all' | 'pure' | 'mixture';
export type ChemicalProductTableRiskLinkFilter = 'all' | 'linked' | 'unlinked';
export type ChemicalProductTableCompositionFilter = 'all' | 'incomplete';
export type ChemicalProductTableConfidentialFilter = 'all' | 'confidential';
export type ChemicalProductTableEmployeesFispqFilter =
  | 'all'
  | 'published'
  | 'unpublished';

export type ChemicalProductTableSortField =
  | 'tradeName'
  | 'manufacturer'
  | 'type'
  | 'fispq'
  | 'status';

export type ChemicalProductTableSort = {
  field: ChemicalProductTableSortField;
  order: 'asc' | 'desc';
};

export type ChemicalProductTableViewFilters = {
  search: string;
  productType: ChemicalProductTableProductTypeFilter;
  riskLink: ChemicalProductTableRiskLinkFilter;
  composition: ChemicalProductTableCompositionFilter;
  confidential: ChemicalProductTableConfidentialFilter;
  employeesFispq: ChemicalProductTableEmployeesFispqFilter;
  manufacturer: string;
};

export const EMPTY_CHEMICAL_PRODUCT_TABLE_VIEW_FILTERS: ChemicalProductTableViewFilters =
  {
    search: '',
    productType: 'all',
    riskLink: 'all',
    composition: 'all',
    confidential: 'all',
    employeesFispq: 'all',
    manufacturer: '',
  };

export function formatChemicalProductStatusLabel(
  status: ChemicalProductListItem['status'],
): string {
  if (status === 'ACTIVE') return 'Ativo';
  if (status === 'ARCHIVED') return 'Arquivado';
  return status;
}

export function formatIngredientRiskFactorSuffix(ingredient: {
  riskFactor?: { name?: string | null } | null;
}): string {
  return ingredient.riskFactor?.name
    ? ` · FR: ${ingredient.riskFactor.name}`
    : ` · ${UNLINKED_RISK_FACTOR_CHIP_LABEL}`;
}

export function productHasUnlinkedRiskFactor(
  product: ChemicalProductListItem,
): boolean {
  if (product.hasUnlinkedIngredient) return true;
  return (product.ingredients || []).some((ingredient) => !ingredient.riskFactorId);
}

export function isChemicalProductFispqPublishedForEmployees(
  product: ChemicalProductListItem,
): boolean {
  return product.activeFispq?.publishedForEmployees === true;
}

export function listChemicalProductManufacturers(
  products: ChemicalProductListItem[],
): string[] {
  const names = new Set<string>();
  for (const product of products) {
    const manufacturer = (product.manufacturer || '').trim();
    if (manufacturer) names.add(manufacturer);
  }
  return [...names].sort((left, right) =>
    left.localeCompare(right, 'pt-BR', { sensitivity: 'base' }),
  );
}

export function productMatchesLocalSearch(
  product: ChemicalProductListItem,
  rawSearch: string,
): boolean {
  const query = rawSearch.trim().toLowerCase();
  if (!query) return true;
  if (product.tradeName.toLowerCase().includes(query)) return true;
  if ((product.manufacturer || '').toLowerCase().includes(query)) return true;
  return (product.ingredients || []).some((ingredient) => {
    if ((ingredient.chemicalName || '').toLowerCase().includes(query)) {
      return true;
    }
    if ((ingredient.cas || '').toLowerCase().includes(query)) return true;
    return false;
  });
}

export function productMatchesChemicalProductTableFilters(
  product: ChemicalProductListItem,
  filters: ChemicalProductTableViewFilters,
): boolean {
  if (!productMatchesLocalSearch(product, filters.search)) return false;

  if (filters.productType === 'pure' && !product.isPureSubstance) return false;
  if (filters.productType === 'mixture' && product.isPureSubstance) {
    return false;
  }

  if (filters.riskLink === 'unlinked' && !productHasUnlinkedRiskFactor(product)) {
    return false;
  }
  if (filters.riskLink === 'linked' && productHasUnlinkedRiskFactor(product)) {
    return false;
  }

  if (filters.composition === 'incomplete' && !product.compositionIncomplete) {
    return false;
  }

  if (
    filters.confidential === 'confidential' &&
    !product.hasConfidentialIngredient
  ) {
    return false;
  }

  if (filters.employeesFispq === 'published') {
    if (!isChemicalProductFispqPublishedForEmployees(product)) return false;
  }
  if (filters.employeesFispq === 'unpublished') {
    if (isChemicalProductFispqPublishedForEmployees(product)) return false;
  }

  const manufacturer = filters.manufacturer.trim();
  if (manufacturer && (product.manufacturer || '') !== manufacturer) {
    return false;
  }

  return true;
}

export function nextChemicalProductTableSort(
  current: ChemicalProductTableSort | null,
  field: ChemicalProductTableSortField,
): ChemicalProductTableSort | null {
  if (!current || current.field !== field) {
    return { field, order: 'asc' };
  }
  if (current.order === 'asc') return { field, order: 'desc' };
  return null;
}

function compareText(
  left: string,
  right: string,
  order: 'asc' | 'desc',
): number {
  const result = left.localeCompare(right, 'pt-BR', { sensitivity: 'base' });
  return order === 'asc' ? result : -result;
}

function fispqSortKey(product: ChemicalProductListItem): string {
  const fispq = product.activeFispq;
  if (!fispq) return '';
  return `${fispq.issuedAt || ''}\t${fispq.versionLabel || ''}`;
}

export function compareChemicalProductTableRows(
  left: ChemicalProductListItem,
  right: ChemicalProductListItem,
  sort: ChemicalProductTableSort,
): number {
  const { field, order } = sort;
  switch (field) {
    case 'tradeName':
      return compareText(left.tradeName, right.tradeName, order);
    case 'manufacturer':
      return compareText(
        left.manufacturer || '',
        right.manufacturer || '',
        order,
      );
    case 'type':
      return compareText(
        left.isPureSubstance ? 'Puro' : 'Mistura',
        right.isPureSubstance ? 'Puro' : 'Mistura',
        order,
      );
    case 'fispq':
      return compareText(fispqSortKey(left), fispqSortKey(right), order);
    case 'status':
      return compareText(
        formatChemicalProductStatusLabel(left.status),
        formatChemicalProductStatusLabel(right.status),
        order,
      );
    default:
      return 0;
  }
}

export function hasActiveChemicalProductTableView(
  filters: ChemicalProductTableViewFilters,
  sort: ChemicalProductTableSort | null,
): boolean {
  if (sort) return true;
  if (filters.search.trim()) return true;
  if (filters.productType !== 'all') return true;
  if (filters.riskLink !== 'all') return true;
  if (filters.composition !== 'all') return true;
  if (filters.confidential !== 'all') return true;
  if (filters.employeesFispq !== 'all') return true;
  if (filters.manufacturer.trim()) return true;
  return false;
}

export type ChemicalProductTableFilterChip = {
  key: string;
  leftLabel: string;
  label: string;
};

const PRODUCT_TYPE_CHIP_LABEL: Record<
  Exclude<ChemicalProductTableProductTypeFilter, 'all'>,
  string
> = {
  pure: 'Produto puro',
  mixture: 'Mistura',
};

const RISK_LINK_CHIP_LABEL: Record<
  Exclude<ChemicalProductTableRiskLinkFilter, 'all'>,
  string
> = {
  linked: 'Com fatores correlacionados',
  unlinked: UNLINKED_RISK_FACTOR_CHIP_LABEL,
};

const EMPLOYEES_FISPQ_CHIP_LABEL: Record<
  Exclude<ChemicalProductTableEmployeesFispqFilter, 'all'>,
  string
> = {
  published: 'Publicada para empregados',
  unpublished: 'Não publicada',
};

const SORT_FIELD_CHIP_LABEL: Record<ChemicalProductTableSortField, string> = {
  tradeName: 'Nome comercial',
  manufacturer: 'Fabricante',
  type: 'Tipo',
  fispq: 'FISPQ vigente',
  status: 'Status',
};

export function listChemicalProductTableFilterChips(
  filters: ChemicalProductTableViewFilters,
  sort: ChemicalProductTableSort | null,
): ChemicalProductTableFilterChip[] {
  const chips: ChemicalProductTableFilterChip[] = [];

  if (filters.productType !== 'all') {
    chips.push({
      key: 'productType',
      leftLabel: 'Tipo',
      label: PRODUCT_TYPE_CHIP_LABEL[filters.productType],
    });
  }
  if (filters.riskLink !== 'all') {
    chips.push({
      key: 'riskLink',
      leftLabel: 'Correlação',
      label: RISK_LINK_CHIP_LABEL[filters.riskLink],
    });
  }
  if (filters.composition === 'incomplete') {
    chips.push({
      key: 'composition',
      leftLabel: 'Composição',
      label: '<100%',
    });
  }
  if (filters.confidential === 'confidential') {
    chips.push({
      key: 'confidential',
      leftLabel: 'Ingrediente',
      label: 'Confidencial',
    });
  }
  if (filters.employeesFispq !== 'all') {
    chips.push({
      key: 'employeesFispq',
      leftLabel: 'FISPQ',
      label: EMPLOYEES_FISPQ_CHIP_LABEL[filters.employeesFispq],
    });
  }
  if (filters.manufacturer.trim()) {
    chips.push({
      key: 'manufacturer',
      leftLabel: 'Fabricante',
      label: filters.manufacturer.trim(),
    });
  }
  if (sort) {
    chips.push({
      key: 'sort',
      leftLabel: 'Ordenação',
      label: `${SORT_FIELD_CHIP_LABEL[sort.field]} ${
        sort.order === 'asc' ? 'crescente' : 'decrescente'
      }`,
    });
  }

  return chips;
}

export function applyChemicalProductTableView(
  products: ChemicalProductListItem[],
  params: {
    filters?: ChemicalProductTableViewFilters;
    sort?: ChemicalProductTableSort | null;
  } = {},
): ChemicalProductListItem[] {
  const filters = params.filters || EMPTY_CHEMICAL_PRODUCT_TABLE_VIEW_FILTERS;
  const filtered = products.filter((product) =>
    productMatchesChemicalProductTableFilters(product, filters),
  );
  if (!params.sort) return filtered;

  return filtered
    .map((product, index) => ({ product, index }))
    .sort((left, right) => {
      const compared = compareChemicalProductTableRows(
        left.product,
        right.product,
        params.sort as ChemicalProductTableSort,
      );
      return compared !== 0 ? compared : left.index - right.index;
    })
    .map((item) => item.product);
}
