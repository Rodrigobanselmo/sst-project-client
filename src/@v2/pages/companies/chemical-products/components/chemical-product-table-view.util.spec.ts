/**
 * Testes pontuais da view client-side da tabela de Produtos Químicos.
 * Executar: npx tsx src/@v2/pages/companies/chemical-products/components/chemical-product-table-view.util.spec.ts
 */
import type { ChemicalProductListItem } from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';

import {
  applyChemicalProductTableView,
  EMPTY_CHEMICAL_PRODUCT_TABLE_VIEW_FILTERS,
  formatChemicalProductStatusLabel,
  formatIngredientRiskFactorSuffix,
  hasActiveChemicalProductTableView,
  listChemicalProductManufacturers,
  nextChemicalProductTableSort,
  productHasUnlinkedRiskFactor,
  productMatchesLocalSearch,
  UNLINKED_RISK_FACTOR_CHIP_LABEL,
  UNLINKED_RISK_FACTOR_CHIP_TOOLTIP,
  type ChemicalProductTableViewFilters,
} from './chemical-product-table-view.util';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

function baseProduct(
  overrides: Partial<ChemicalProductListItem> & { id: string; tradeName: string },
): ChemicalProductListItem {
  return {
    companyId: 'c1',
    workspaceId: 'w1',
    manufacturer: 'BRASKEM',
    isPureSubstance: false,
    status: 'ACTIVE',
    ingredientCount: 0,
    ingredients: [],
    activeComposition: null,
    activeFispq: null,
    ...overrides,
  };
}

const linkedIngredient = {
  id: 'ing-1',
  chemicalName: 'Hidróxido de sódio',
  cas: '1310-73-2',
  concentrationKind: 'EXACT' as const,
  exactPercent: 40,
  minPercent: null,
  maxPercent: null,
  riskFactorId: 'rf-1',
  riskFactor: {
    id: 'rf-1',
    name: 'Hidróxido de sódio',
    cas: '1310-73-2',
    system: true,
    companyId: 'c1',
    type: 'QUI',
  },
};

const unlinkedIngredient = {
  id: 'ing-2',
  chemicalName: 'Irganox',
  cas: '6683-19-8',
  concentrationKind: 'EXACT' as const,
  exactPercent: 12,
  minPercent: null,
  maxPercent: null,
  riskFactorId: null,
  riskFactor: null,
};

const soda = baseProduct({
  id: 'p-soda',
  tradeName: 'Soda Cáustica',
  manufacturer: 'BRASKEM',
  isPureSubstance: true,
  ingredientCount: 1,
  ingredients: [linkedIngredient],
  hasUnlinkedIngredient: false,
  compositionIncomplete: false,
  hasConfidentialIngredient: false,
  activeFispq: {
    id: 'f1',
    versionLabel: 'v2',
    issuedAt: '2024-01-10T00:00:00.000Z',
    publishedForEmployees: true,
    publishedAt: '2024-01-11T00:00:00.000Z',
    file: null,
  },
});

const irganox = baseProduct({
  id: 'p-irganox',
  tradeName: 'Irganox 1010',
  manufacturer: 'BASF',
  isPureSubstance: false,
  ingredientCount: 1,
  ingredients: [unlinkedIngredient],
  hasUnlinkedIngredient: true,
  compositionIncomplete: true,
  hasConfidentialIngredient: true,
  activeFispq: {
    id: 'f2',
    versionLabel: 'v1',
    issuedAt: '2023-06-01T00:00:00.000Z',
    publishedForEmployees: false,
    publishedAt: null,
    file: null,
  },
});

const archived = baseProduct({
  id: 'p-archived',
  tradeName: 'Produto Arquivado',
  manufacturer: 'ACME',
  status: 'ARCHIVED',
  isPureSubstance: true,
  ingredientCount: 1,
  ingredients: [linkedIngredient],
});

const products = [soda, irganox, archived];

function withFilters(
  patch: Partial<ChemicalProductTableViewFilters>,
): ChemicalProductTableViewFilters {
  return { ...EMPTY_CHEMICAL_PRODUCT_TABLE_VIEW_FILTERS, ...patch };
}

assert(
  formatChemicalProductStatusLabel('ACTIVE') === 'Ativo',
  'ACTIVE deve ser apresentado como Ativo',
);
assert(
  formatChemicalProductStatusLabel('ARCHIVED') === 'Arquivado',
  'ARCHIVED deve ser apresentado como Arquivado',
);
assert(
  UNLINKED_RISK_FACTOR_CHIP_LABEL === 'Sem FR',
  'chip de ausência de correlação deve ser Sem FR',
);
assert(
  UNLINKED_RISK_FACTOR_CHIP_TOOLTIP === 'Sem fator de risco correlacionado',
  'tooltip de Sem FR deve explicar fator de risco correlacionado',
);
assert(
  formatIngredientRiskFactorSuffix(linkedIngredient) ===
    ' · FR: Hidróxido de sódio',
  'tooltip de ingrediente com fator deve usar FR',
);
assert(
  formatIngredientRiskFactorSuffix(unlinkedIngredient) === ' · Sem FR',
  'tooltip de ingrediente sem fator deve usar Sem FR',
);

assert(
  productMatchesLocalSearch(soda, 'soda') === true,
  'busca por nome comercial',
);
assert(
  productMatchesLocalSearch(soda, 'braskem') === true,
  'busca por fabricante',
);
assert(
  productMatchesLocalSearch(soda, 'hidróxido') === true,
  'busca por ingrediente',
);
assert(
  productMatchesLocalSearch(soda, '1310-73-2') === true,
  'busca por CAS',
);
assert(
  productMatchesLocalSearch(soda, 'irganox') === false,
  'busca não deve casar produto sem o termo',
);

assert(productHasUnlinkedRiskFactor(irganox) === true, 'Irganox é Sem FR');
assert(productHasUnlinkedRiskFactor(soda) === false, 'Soda tem FR correlacionado');
assert(
  productHasUnlinkedRiskFactor(
    baseProduct({
      id: 'p-fallback',
      tradeName: 'Fallback',
      hasUnlinkedIngredient: false,
      ingredients: [{ ...unlinkedIngredient, id: 'ing-3' }],
    }),
  ) === true,
  'Sem FR também deriva de ingrediente sem riskFactorId',
);

assert(
  applyChemicalProductTableView(products, {
    filters: withFilters({ productType: 'pure' }),
  }).map((p) => p.id).join(',') === 'p-soda,p-archived',
  'filtro produto puro',
);
assert(
  applyChemicalProductTableView(products, {
    filters: withFilters({ productType: 'mixture' }),
  }).map((p) => p.id).join(',') === 'p-irganox',
  'filtro mistura',
);
assert(
  applyChemicalProductTableView(products, {
    filters: withFilters({ riskLink: 'unlinked' }),
  }).map((p) => p.id).join(',') === 'p-irganox',
  'filtro Sem FR',
);
assert(
  applyChemicalProductTableView(products, {
    filters: withFilters({ riskLink: 'linked' }),
  }).map((p) => p.id).join(',') === 'p-soda,p-archived',
  'filtro com fatores correlacionados',
);
assert(
  applyChemicalProductTableView(products, {
    filters: withFilters({ composition: 'incomplete' }),
  }).map((p) => p.id).join(',') === 'p-irganox',
  'filtro composição incompleta usa flag existente',
);
assert(
  applyChemicalProductTableView(products, {
    filters: withFilters({ confidential: 'confidential' }),
  }).map((p) => p.id).join(',') === 'p-irganox',
  'filtro confidencial usa flag existente',
);
assert(
  applyChemicalProductTableView(products, {
    filters: withFilters({ employeesFispq: 'published' }),
  }).map((p) => p.id).join(',') === 'p-soda',
  'filtro FISPQ publicada para empregados',
);
assert(
  applyChemicalProductTableView(products, {
    filters: withFilters({ employeesFispq: 'unpublished' }),
  }).map((p) => p.id).join(',') === 'p-irganox,p-archived',
  'filtro FISPQ não publicada inclui ausência de FISPQ',
);
assert(
  applyChemicalProductTableView(products, {
    filters: withFilters({ manufacturer: 'BASF' }),
  }).map((p) => p.id).join(',') === 'p-irganox',
  'filtro fabricante exato a partir do dataset',
);
assert(
  applyChemicalProductTableView(products).map((p) => p.id).join(',') ===
    'p-soda,p-irganox,p-archived',
  'view helper não filtra ARCHIVED — includeArchived permanece no GET',
);

assert(
  applyChemicalProductTableView(products, {
    filters: withFilters({
      search: 'irganox',
      productType: 'mixture',
      riskLink: 'unlinked',
      composition: 'incomplete',
      confidential: 'confidential',
      employeesFispq: 'unpublished',
      manufacturer: 'BASF',
    }),
  }).map((p) => p.id).join(',') === 'p-irganox',
  'filtros combinados',
);
assert(
  applyChemicalProductTableView(products, {
    filters: withFilters({
      search: 'soda',
      productType: 'mixture',
    }),
  }).length === 0,
  'filtros combinados podem zerar o recorte',
);

const original = [...products];
const viewed = applyChemicalProductTableView(products, {
  filters: withFilters({ productType: 'pure' }),
  sort: { field: 'tradeName', order: 'desc' },
});
assert(products === products, 'referência de entrada permanece');
assert(
  products.map((p) => p.id).join(',') === original.map((p) => p.id).join(','),
  'array de entrada não é mutado pelo filtro',
);
assert(viewed !== products, 'view retorna um array novo');

const sortedAsc = applyChemicalProductTableView(products, {
  sort: { field: 'tradeName', order: 'asc' },
});
assert(
  sortedAsc.map((p) => p.tradeName).join('|') ===
    'Irganox 1010|Produto Arquivado|Soda Cáustica',
  'sort nome comercial asc',
);
assert(
  products[0].id === 'p-soda' && products[1].id === 'p-irganox',
  'sort não muta o array original',
);

const sortedManufacturer = applyChemicalProductTableView(products, {
  sort: { field: 'manufacturer', order: 'asc' },
});
assert(
  sortedManufacturer.map((p) => p.manufacturer).join('|') ===
    'ACME|BASF|BRASKEM',
  'sort fabricante asc',
);

const sortedType = applyChemicalProductTableView(products, {
  sort: { field: 'type', order: 'asc' },
});
assert(
  sortedType[0].isPureSubstance === false,
  'sort tipo asc coloca Mistura antes de Puro (ordem alfabética pt-BR)',
);

const sortedFispq = applyChemicalProductTableView(products, {
  sort: { field: 'fispq', order: 'asc' },
});
assert(
  sortedFispq[0].id === 'p-archived' && sortedFispq[2].id === 'p-soda',
  'sort FISPQ usa issuedAt/versão; sem FISPQ fica no início em asc',
);

const sortedStatus = applyChemicalProductTableView(products, {
  sort: { field: 'status', order: 'asc' },
});
assert(
  sortedStatus[0].status === 'ARCHIVED',
  'sort status asc usa label Arquivado antes de Ativo',
);

const stableSource = [
  baseProduct({ id: 'a', tradeName: 'Zeta', manufacturer: 'X' }),
  baseProduct({ id: 'b', tradeName: 'Zeta', manufacturer: 'Y' }),
  baseProduct({ id: 'c', tradeName: 'Alfa', manufacturer: 'Z' }),
];
const stableSorted = applyChemicalProductTableView(stableSource, {
  sort: { field: 'tradeName', order: 'asc' },
});
assert(
  stableSorted.map((p) => p.id).join(',') === 'c,a,b',
  'sort estável preserva ordem original em empate',
);

assert(
  nextChemicalProductTableSort(null, 'tradeName')?.order === 'asc',
  'ciclo sort none → asc',
);
assert(
  nextChemicalProductTableSort(
    { field: 'tradeName', order: 'asc' },
    'tradeName',
  )?.order === 'desc',
  'ciclo sort asc → desc',
);
assert(
  nextChemicalProductTableSort(
    { field: 'tradeName', order: 'desc' },
    'tradeName',
  ) === null,
  'ciclo sort desc → none',
);
assert(
  nextChemicalProductTableSort(
    { field: 'tradeName', order: 'desc' },
    'manufacturer',
  )?.field === 'manufacturer',
  'trocar campo recomeça em asc',
);

assert(
  listChemicalProductManufacturers(products).join(',') === 'ACME,BASF,BRASKEM',
  'fabricantes únicos do dataset, ordenados',
);
assert(
  hasActiveChemicalProductTableView(
    EMPTY_CHEMICAL_PRODUCT_TABLE_VIEW_FILTERS,
    null,
  ) === false,
  'view vazia não está ativa',
);
assert(
  hasActiveChemicalProductTableView(withFilters({ search: 'soda' }), null) ===
    true,
  'busca conta como view ativa',
);

const recorte = applyChemicalProductTableView(products, {
  filters: withFilters({
    search: 'soda',
    productType: 'pure',
    manufacturer: 'BRASKEM',
  }),
  sort: { field: 'tradeName', order: 'desc' },
});
assert(recorte.map((p) => p.id).join(',') === 'p-soda', 'recorte ativo');
const limpar = applyChemicalProductTableView(products, {
  filters: { ...EMPTY_CHEMICAL_PRODUCT_TABLE_VIEW_FILTERS },
  sort: null,
});
assert(
  limpar.map((p) => p.id).join(',') === products.map((p) => p.id).join(','),
  'Limpar com busca vazia, filtros default e sort none restaura o dataset original',
);

console.log('chemical-product-table-view.util.spec.ts ok');
