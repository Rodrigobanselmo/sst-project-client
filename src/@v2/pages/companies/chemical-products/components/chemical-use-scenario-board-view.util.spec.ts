/**
 * Executar: npx tsx src/@v2/pages/companies/chemical-products/components/chemical-use-scenario-board-view.util.spec.ts
 */
import type { ChemicalUseScenarioBoardRow } from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';

import { UNINDIVIDUALIZED_COMPOSITION_LABEL } from './chemical-composition-disclosure.util';
import { PENDING_SURVEY_STATUS_LABEL } from './chemical-use-scenario-activity-risk.util';
import {
  applyUseScenarioBoardView,
  EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS,
  hasActiveUseScenarioBoardView,
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
  sourceRows: [6],
});
const ezolem2 = baseRow({
  id: 's-7',
  kind: 'SCENARIO',
  activityName: 'Dosagem B',
  sourceRows: [7],
  frequencyCount: 2,
  durationMinutes: 20,
  quantity: '5',
});
const ezolem3 = baseRow({
  id: 's-8',
  kind: 'SCENARIO',
  activityName: 'Dosagem C',
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
  filters: { ...EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS, product: 'EZOLEM' },
});
assert(ezolemFiltered.length === 3, 'EZOLEM continua com 3 linhas após filtro');
assert(
  ids(ezolemFiltered).join() === 's-6,s-7,s-8',
  'EZOLEM não agrupa nem deduplica',
);

assert(
  applyUseScenarioBoardView(board, {
    filters: { ...EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS, product: '651ST' },
  }).map((row) => row.id).join() === 's-651',
  '651ST permanece separado do 910',
);
assert(
  applyUseScenarioBoardView(board, {
    filters: { ...EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS, product: '910' },
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
      riskFactor: 'Hipoclorito',
    },
  }).map((row) => row.id).join() === 'pending:p-acticlor',
  'pending participa do filtro de fator',
);

assert(
  applyUseScenarioBoardView(board, {
    filters: {
      ...EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS,
      riskFactor: UNINDIVIDUALIZED_COMPOSITION_LABEL,
    },
  }).some((row) => row.id === 'pending:p-u'),
  'UNINDIVIDUALIZED continua filtrável pelo texto homologado',
);

assert(
  applyUseScenarioBoardView(board, {
    filters: { ...EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS, search: 'ACTICHLOR' },
  }).some((row) => row.id === 'pending:p-acticlor'),
  'busca existente encontra pending',
);

const sortedActivity = applyUseScenarioBoardView(board, {
  filters: { ...EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS, product: 'EZOLEM' },
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
  filters: { ...EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS, product: 'EZOLEM' },
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
    { ...EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS, product: 'EZOLEM' },
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
  filters: { ...EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS, product: 'EZOLEM' },
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

console.log('chemical-use-scenario-board-view.util.spec.ts: OK');
