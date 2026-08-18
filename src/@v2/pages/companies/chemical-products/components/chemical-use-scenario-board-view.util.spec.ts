/**
 * Executar: npx tsx src/@v2/pages/companies/chemical-products/components/chemical-use-scenario-board-view.util.spec.ts
 */
import type { ChemicalUseScenarioBoardRow } from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';

import { UNINDIVIDUALIZED_COMPOSITION_LABEL } from './chemical-composition-disclosure.util';
import { PENDING_SURVEY_STATUS_LABEL } from './chemical-use-scenario-activity-risk.util';
import {
  applyUseScenarioBoardView,
  EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS,
  formatUseScenarioBoardExposureGroupCell,
  hasActiveUseScenarioBoardView,
  listUseScenarioBoardFilterChips,
  listUseScenarioBoardFilterOptions,
  nextUseScenarioBoardSort,
  USE_SCENARIO_BOARD_STATUS_FILTER_OPTIONS,
} from './chemical-use-scenario-board-view.util';

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

const rfNaoh = {
  id: 'rf-naoh',
  name: 'Hidróxido de sódio',
  cas: '1310-73-2',
  system: true,
  companyId: 'c1',
  type: 'QUI',
};

function baseRow(
  overrides: Partial<ChemicalUseScenarioBoardRow> & {
    id: string;
    kind: ChemicalUseScenarioBoardRow['kind'];
  },
): ChemicalUseScenarioBoardRow {
  return {
    chemicalProductId: 'p1',
    surveyStatus: 'LEVANTAMENTO_CONCLUIDO',
    presentationStatus: 'LEVANTAMENTO_CONCLUIDO',
    activityName: 'Limpeza',
    sectorSnapshot: 'Caldeira',
    exposureGroupSnapshot: null,
    exposedRolesSnapshot: null,
    frequencyCount: 1,
    frequencyPeriod: 'Diário',
    durationMinutes: 10,
    quantity: '1',
    quantityUnit: 'L',
    peakContactMoment: null,
    controlMeasures: null,
    linachHint: null,
    relevanceHint: null,
    sourceSheet: 'Elegebilidade',
    sourceRows: [6],
    sourceProductLabel: 'X',
    sourceRaw: { lines: [] },
    activityRiskOrigin: 'PRODUCT_COMPOSITION',
    activityRiskResolutions: [],
    activityRiskFactors: [rfNaoh],
    product: {
      id: 'p1',
      tradeName: 'BRASKEM EZOLEM 6/7',
      manufacturer: 'BRASKEM',
      isPureSubstance: false,
      status: 'ACTIVE',
      activeComposition: {
        id: 'c1',
        compositionDisclosure: 'DECLARED',
        ingredients: [],
      },
    },
    ...overrides,
  };
}

const ezolem1 = baseRow({
  id: 's-6',
  kind: 'SCENARIO',
  activityName: 'Dosagem A',
  exposureGroupSnapshot: '1014',
  sourceRows: [6],
});
const ezolem2 = baseRow({
  id: 's-7',
  kind: 'SCENARIO',
  activityName: 'Dosagem B',
  exposureGroupSnapshot: '10009',
  sourceRows: [7],
  frequencyCount: 2,
  durationMinutes: 20,
  quantity: '5',
});
const ezolem3 = baseRow({
  id: 's-8',
  kind: 'SCENARIO',
  activityName: 'Dosagem C',
  exposureGroupSnapshot: '10009',
  sourceRows: [8],
  frequencyCount: 3,
  durationMinutes: 5,
  quantity: '0.5',
});

const aqua651 = baseRow({
  id: 's-651',
  kind: 'SCENARIO',
  chemicalProductId: 'p-651',
  activityName: 'Dosagem',
  sourceRows: [9],
  product: {
    ...ezolem1.product,
    id: 'p-651',
    tradeName: 'CHEM-AQUA 651ST- 5790',
  },
});

const aqua910 = baseRow({
  id: 's-910',
  kind: 'SCENARIO',
  chemicalProductId: 'p-910',
  activityName: 'Dosagem',
  sourceRows: [10],
  activityRiskFactors: [
    {
      id: 'rf-so',
      name: 'Sulfito de Sódio',
      cas: '7757-83-7',
      system: true,
      companyId: 'c1',
      type: 'QUI',
    },
  ],
  product: {
    ...ezolem1.product,
    id: 'p-910',
    tradeName: 'CHEM-AQUA 910- 5471',
  },
});

const pendingActiclor = baseRow({
  id: 'pending:p-acticlor',
  kind: 'PENDING_SURVEY',
  chemicalProductId: 'p-acticlor',
  surveyStatus: null,
  presentationStatus: 'PENDENTE_DE_LEVANTAMENTO',
  activityName: null,
  sectorSnapshot: null,
  exposureGroupSnapshot: null,
  frequencyCount: null,
  durationMinutes: null,
  quantity: null,
  sourceRows: [],
  activityRiskFactors: [
    {
      id: 'rf-hypo',
      name: 'Hipoclorito de sódio',
      cas: '7681-52-9',
      system: true,
      companyId: 'c1',
      type: 'QUI',
    },
  ],
  product: {
    ...ezolem1.product,
    id: 'p-acticlor',
    tradeName: 'ACTICHLOR- 5270',
  },
});

const pendingUnindividualized = baseRow({
  id: 'pending:p-u',
  kind: 'PENDING_SURVEY',
  chemicalProductId: 'p-u',
  surveyStatus: null,
  presentationStatus: 'PENDENTE_DE_LEVANTAMENTO',
  activityName: null,
  sectorSnapshot: null,
  sourceRows: [],
  activityRiskFactors: [],
  product: {
    ...ezolem1.product,
    id: 'p-u',
    tradeName: 'ACRYLUX',
    activeComposition: {
      id: 'c-u',
      compositionDisclosure: 'UNINDIVIDUALIZED',
      ingredients: [],
    },
  },
});

const board = [
  ezolem1,
  ezolem2,
  ezolem3,
  aqua651,
  aqua910,
  pendingActiclor,
  pendingUnindividualized,
];

const ids = (rows: ChemicalUseScenarioBoardRow[]) => rows.map((row) => row.id);

assert(
  ids(
    applyUseScenarioBoardView(board, {
      filters: EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS,
    }),
  ).join() === ids(board).join(),
  'sem filtro/sort preserva identidade e ordem do board',
);

const ezolemFiltered = applyUseScenarioBoardView(board, {
  filters: {
    ...EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS,
    product: 'BRASKEM EZOLEM 6/7',
  },
});
assert(ezolemFiltered.length === 3, 'EZOLEM continua com 3 linhas após filtro');
assert(
  ids(ezolemFiltered).join() === 's-6,s-7,s-8',
  'EZOLEM não agrupa nem deduplica',
);

assert(
  applyUseScenarioBoardView(board, {
    filters: {
      ...EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS,
      product: 'CHEM-AQUA 651ST- 5790',
    },
  }).map((row) => row.id).join() === 's-651',
  '651ST permanece separado do 910',
);
assert(
  applyUseScenarioBoardView(board, {
    filters: {
      ...EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS,
      product: 'CHEM-AQUA 910- 5471',
    },
  }).map((row) => row.id).join() === 's-910',
  '910 permanece separado do 651ST',
);

const pendingOnly = applyUseScenarioBoardView(board, {
  filters: {
    ...EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS,
    status: 'PENDENTE_DE_LEVANTAMENTO',
  },
});
assert(
  pendingOnly.every((row) => row.kind === 'PENDING_SURVEY'),
  'filtro de status pending só traz PENDING_SURVEY',
);
assert(
  pendingOnly.some((row) => row.id === 'pending:p-acticlor'),
  'ACTICHLOR participa do filtro de pendente',
);

const concluded = applyUseScenarioBoardView(board, {
  filters: {
    ...EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS,
    status: 'LEVANTAMENTO_CONCLUIDO',
  },
});
assert(
  !concluded.some((row) => row.kind === 'PENDING_SURVEY'),
  'status real exclui pending',
);
assert(
  applyUseScenarioBoardView(board, {
    filters: {
      ...EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS,
      status: 'Levantamento concluído',
    },
  }).length === 0,
  'filtro de status continua pelo valor interno, não pelo label',
);

assert(
  applyUseScenarioBoardView(board, {
    filters: { ...EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS, activity: 'Dosagem A' },
  }).map((row) => row.id).join() === 's-6',
  'filtro de tarefa não pega pending vazio',
);

assert(
  applyUseScenarioBoardView(board, {
    filters: {
      ...EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS,
      riskFactor: 'rf-hypo',
    },
  }).map((row) => row.id).join() === 'pending:p-acticlor',
  'pending participa do filtro de fator',
);

assert(
  !listUseScenarioBoardFilterOptions(board).riskFactors.some(
    (option) => option.label === UNINDIVIDUALIZED_COMPOSITION_LABEL,
  ),
  'opções de fator não usam o texto resumido da célula',
);
assert(
  applyUseScenarioBoardView(board, {
    filters: {
      ...EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS,
      riskFactor: UNINDIVIDUALIZED_COMPOSITION_LABEL,
    },
  }).length === 0,
  'filtro de fator não persiste texto arbitrário da célula',
);

assert(
  applyUseScenarioBoardView(board, {
    filters: { ...EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS, search: 'ACTICHLOR' },
  }).some((row) => row.id === 'pending:p-acticlor'),
  'busca existente encontra pending',
);

const sortedActivity = applyUseScenarioBoardView(board, {
  filters: { ...EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS, product: 'BRASKEM EZOLEM 6/7' },
  sort: { field: 'activity', order: 'desc' },
});
assert(
  ids(sortedActivity).join() === 's-8,s-7,s-6',
  'ordenar EZOLEM por tarefa mantém 3 linhas independentes',
);

const sortedQty = applyUseScenarioBoardView(
  [ezolem1, ezolem2, ezolem3],
  { sort: { field: 'quantity', order: 'asc' } },
);
assert(
  ids(sortedQty).join() === 's-8,s-6,s-7',
  'ordenar quantidade é numérico e estável',
);

assert(
  nextUseScenarioBoardSort(null, 'product')?.order === 'asc',
  'ciclo sort: none -> asc',
);
assert(
  nextUseScenarioBoardSort({ field: 'product', order: 'asc' }, 'product')
    ?.order === 'desc',
  'ciclo sort: asc -> desc',
);
assert(
  nextUseScenarioBoardSort({ field: 'product', order: 'desc' }, 'product') ===
    null,
  'ciclo sort: desc -> none',
);

const snapshot = ids(board).join();
applyUseScenarioBoardView(board, {
  filters: { ...EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS, product: 'BRASKEM EZOLEM 6/7' },
  sort: { field: 'status', order: 'asc' },
});
assert(ids(board).join() === snapshot, 'apply não muta rows originais');

assert(
  PENDING_SURVEY_STATUS_LABEL === 'Pendente de levantamento',
  'label pending estável',
);

const concludedOption = USE_SCENARIO_BOARD_STATUS_FILTER_OPTIONS.find(
  (option) => option.value === 'LEVANTAMENTO_CONCLUIDO',
);
assert(
  concludedOption?.value === 'LEVANTAMENTO_CONCLUIDO',
  'valor interno de status permanece o enum',
);
assert(
  concludedOption?.label === 'Levantamento concluído',
  'label de status no filtro é amigável',
);
assert(
  USE_SCENARIO_BOARD_STATUS_FILTER_OPTIONS.find(
    (option) => option.value === 'PENDENTE_DE_LEVANTAMENTO',
  )?.label === 'Pendente de levantamento',
  'pending no filtro usa label amigável',
);
assert(
  USE_SCENARIO_BOARD_STATUS_FILTER_OPTIONS.every((option) =>
    [
      'PENDENTE_DE_LEVANTAMENTO',
      'RASCUNHO',
      'LEVANTAMENTO_EM_ANDAMENTO',
      'LEVANTAMENTO_CONCLUIDO',
      'AGUARDANDO_ANALISE_TECNICA',
    ].includes(option.value),
  ),
  'opções do filtro mantêm valores internos',
);
assert(
  USE_SCENARIO_BOARD_STATUS_FILTER_OPTIONS.map((option) => option.label).join(
    '|',
  ) ===
    'Pendente de levantamento|Rascunho|Levantamento em andamento|Levantamento concluído|Aguardando análise técnica',
  'labels finais de status no filtro',
);

assert(
  !hasActiveUseScenarioBoardView(EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS, null),
  'view vazia não está ativa',
);
assert(
  hasActiveUseScenarioBoardView(
    { ...EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS, product: 'BRASKEM EZOLEM 6/7' },
    null,
  ),
  'filtro de produto ativa limpar',
);
assert(
  hasActiveUseScenarioBoardView(EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS, {
    field: 'activity',
    order: 'desc',
  }),
  'sort ativo também ativa limpar',
);

const filteredSorted = applyUseScenarioBoardView(board, {
  filters: { ...EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS, product: 'BRASKEM EZOLEM 6/7' },
  sort: { field: 'activity', order: 'desc' },
});
assert(ids(filteredSorted).join() === 's-8,s-7,s-6', 'recorte filtrado+ordenado');
const cleared = applyUseScenarioBoardView(board, {
  filters: EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS,
  sort: null,
});
assert(
  ids(cleared).join() === ids(board).join(),
  'limpar filtros/sort restaura ordem natural do board',
);

assert(
  EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS.exposureGroup === '',
  'estado vazio inclui filtro GSE limpo',
);

const gse10009 = applyUseScenarioBoardView(board, {
  filters: { ...EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS, exposureGroup: '10009' },
});
assert(gse10009.length === 2, 'filtro GSE 10009 retorna 2 linhas EZOLEM');
assert(
  ids(gse10009).join() === 's-7,s-8',
  'filtro GSE 10009 não colapsa as duas linhas',
);
assert(
  !gse10009.some((row) => row.id === 's-6'),
  'filtro GSE 10009 exclui a linha 1014',
);
assert(
  !gse10009.some((row) => row.kind === 'PENDING_SURVEY'),
  'pending com null não casa com filtro GSE preenchido',
);

const gse1014 = applyUseScenarioBoardView(board, {
  filters: { ...EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS, exposureGroup: '1014' },
});
assert(ids(gse1014).join() === 's-6', 'filtro GSE 1014 retorna a linha correspondente');

assert(
  applyUseScenarioBoardView(board, {
    filters: { ...EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS, search: '10009' },
  })
    .map((row) => row.id)
    .join() === 's-7,s-8',
  'busca geral continua encontrando por GSE',
);

const sortedGseAsc = applyUseScenarioBoardView([ezolem1, ezolem2, ezolem3], {
  sort: { field: 'exposureGroup', order: 'asc' },
});
assert(
  ids(sortedGseAsc).join() === 's-6,s-7,s-8',
  'sort GSE asc é textual/numérico e estável',
);
const sortedGseDesc = applyUseScenarioBoardView([ezolem1, ezolem2, ezolem3], {
  sort: { field: 'exposureGroup', order: 'desc' },
});
assert(
  ids(sortedGseDesc).join() === 's-7,s-8,s-6',
  'sort GSE desc é estável entre as duas linhas 10009',
);

assert(
  formatUseScenarioBoardExposureGroupCell(pendingActiclor) === '—',
  'pending renderiza —',
);
assert(
  formatUseScenarioBoardExposureGroupCell(ezolem1) === '1014',
  'cenário real mostra o snapshot textual',
);
assert(
  hasActiveUseScenarioBoardView(
    { ...EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS, exposureGroup: '10009' },
    null,
  ),
  'filtro GSE ativa Limpar filtros',
);
const clearedGse = applyUseScenarioBoardView(board, {
  filters: EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS,
  sort: null,
});
assert(
  ids(clearedGse).join() === ids(board).join(),
  'limpar filtros remove GSE e restaura a ordem natural',
);

assert(
  applyUseScenarioBoardView(board, {
    filters: { ...EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS, sector: 'Caldeira' },
  }).filter((row) => row.kind === 'SCENARIO').length === 5,
  'filtro de setor Caldeira casa os cenários reais',
);

assert(
  applyUseScenarioBoardView(board, {
    filters: { ...EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS, search: 'BRASKEM' },
  }).length === board.length,
  'busca geral encontra por fabricante',
);
assert(
  applyUseScenarioBoardView(board, {
    filters: { ...EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS, search: 'Dosagem A' },
  })
    .map((row) => row.id)
    .join() === 's-6',
  'busca geral encontra por tarefa',
);
assert(
  applyUseScenarioBoardView(board, {
    filters: { ...EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS, search: 'Caldeira' },
  }).some((row) => row.id === 's-6'),
  'busca geral encontra por setor',
);
assert(
  applyUseScenarioBoardView(board, {
    filters: {
      ...EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS,
      search: 'Pendente de levantamento',
    },
  }).every((row) => row.kind === 'PENDING_SURVEY'),
  'busca geral encontra por status amigável',
);

const combined = applyUseScenarioBoardView(board, {
  filters: {
    ...EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS,
    search: 'EZOLEM',
    product: 'BRASKEM EZOLEM 6/7',
    exposureGroup: '10009',
    sector: 'Caldeira',
  },
  sort: { field: 'activity', order: 'desc' },
});
assert(ids(combined).join() === 's-8,s-7', 'filtros combinados + sort');

const recortePdf = applyUseScenarioBoardView(board, {
  filters: { ...EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS, exposureGroup: '10009' },
  sort: { field: 'activity', order: 'desc' },
});
assert(
  ids(recortePdf).join() === 's-8,s-7',
  'visibleRows/PDF: GSE 10009 + sort tarefa desc = as 2 linhas na mesma ordem',
);

const dirty = applyUseScenarioBoardView(board, {
  filters: {
    ...EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS,
    search: 'EZOLEM',
    product: 'BRASKEM EZOLEM 6/7',
    status: 'LEVANTAMENTO_CONCLUIDO',
  },
  sort: { field: 'product', order: 'asc' },
});
assert(dirty.length === 3, 'recorte sujo com busca+filtros+sort');
const limpar = applyUseScenarioBoardView(board, {
  filters: { ...EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS },
  sort: null,
});
assert(
  ids(limpar).join() === ids(board).join(),
  'Limpar com busca vazia, filtros default e sort none restaura o board',
);

const chips = listUseScenarioBoardFilterChips(
  {
    ...EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS,
    search: 'EZOLEM',
    exposureGroup: '10009',
    status: 'PENDENTE_DE_LEVANTAMENTO',
  },
  { field: 'activity', order: 'desc' },
);
assert(
  chips.map((chip) => chip.key).join() === 'search,exposureGroup,status,sort',
  'chips de Limpar cobrem busca, filtros e sort',
);
assert(
  chips.find((chip) => chip.key === 'status')?.label ===
    'Pendente de levantamento',
  'chip de status usa label amigável e valor interno permanece no filtro',
);

const filterOptions = listUseScenarioBoardFilterOptions(board);
assert(
  filterOptions.products.join('|') ===
    'ACRYLUX|ACTICHLOR- 5270|BRASKEM EZOLEM 6/7|CHEM-AQUA 651ST- 5790|CHEM-AQUA 910- 5471',
  'opções de Produto são únicas, não vazias e ordenadas',
);
assert(
  filterOptions.products.filter((name) => name === 'BRASKEM EZOLEM 6/7')
    .length === 1,
  'EZOLEM vira uma opção mesmo com 3 linhas',
);
assert(
  filterOptions.activities.join('|') === 'Dosagem|Dosagem A|Dosagem B|Dosagem C',
  'opções de Tarefa são únicas e não incluem pending vazio',
);
assert(filterOptions.sectors.join('|') === 'Caldeira', 'opções de Setor deduplicadas');
assert(
  filterOptions.exposureGroups.join('|') === '1014|10009',
  'opções de GSE são únicas, não vazias e ordenadas',
);
assert(
  !filterOptions.products.includes('') &&
    !filterOptions.activities.includes('') &&
    !filterOptions.sectors.includes('') &&
    !filterOptions.exposureGroups.includes(''),
  'valor vazio não vira opção',
);

const naoh = filterOptions.riskFactors.find((option) => option.id === 'rf-naoh');
const hypo = filterOptions.riskFactors.find((option) => option.id === 'rf-hypo');
const sulfito = filterOptions.riskFactors.find((option) => option.id === 'rf-so');
assert(Boolean(naoh && hypo && sulfito), 'fator de risco usa fatores individuais reais');
assert(
  filterOptions.riskFactors.filter((option) => option.id === 'rf-naoh').length ===
    1,
  'fator repetido em várias linhas aparece uma vez',
);
assert(
  !filterOptions.riskFactors.some((option) => option.label.includes('+')),
  'opções de fator não usam resumo da célula com +N',
);

assert(
  applyUseScenarioBoardView(board, {
    filters: { ...EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS, riskFactor: 'rf-naoh' },
  }).every((row) =>
    (row.activityRiskFactors || []).some((factor) => factor.id === 'rf-naoh'),
  ),
  'seleção de fator filtra linhas que contêm aquele fator',
);

const optionsSnapshot = JSON.stringify(filterOptions);
listUseScenarioBoardFilterOptions(board);
assert(
  ids(board).join() === snapshot,
  'listar opções não muta rows',
);
assert(
  JSON.stringify(listUseScenarioBoardFilterOptions(board)) === optionsSnapshot,
  'listar opções é determinístico',
);

const riskChip = listUseScenarioBoardFilterChips(
  { ...EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS, riskFactor: 'rf-hypo' },
  null,
  filterOptions,
).find((chip) => chip.key === 'riskFactor');
assert(
  riskChip?.label === 'Hipoclorito de sódio · CAS 7681-52-9',
  'chip de fator mostra o nome, não o id',
);

console.log('chemical-use-scenario-board-view.util.spec.ts: OK');
