/**
 * Executar: npx tsx src/@v2/pages/companies/chemical-products/components/exportUseScenarioBoardPdfInBrowser.spec.ts
 */
import type { ChemicalUseScenarioBoardRow } from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';

import {
  applyUseScenarioBoardView,
  EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS,
} from './chemical-use-scenario-board-view.util';
import {
  buildUseScenarioBoardPdfDataset,
  USE_SCENARIO_BOARD_PDF_EMPTY_MESSAGE,
  USE_SCENARIO_BOARD_PDF_FILENAME,
} from './exportUseScenarioBoardPdfInBrowser';

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

const board = [ezolem1, ezolem2, ezolem3, aqua651, aqua910, pendingActiclor];

assert(
  USE_SCENARIO_BOARD_PDF_FILENAME === 'cenarios-de-uso.pdf',
  'nome do arquivo PDF',
);
assert(
  USE_SCENARIO_BOARD_PDF_EMPTY_MESSAGE ===
    'Nenhum cenário corresponde aos filtros atuais.',
  'mensagem de recorte vazio',
);

const allVisible = applyUseScenarioBoardView(board, {
  filters: EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS,
});
const allPdf = buildUseScenarioBoardPdfDataset(allVisible);
assert(
  allPdf.rows.filter((row) => row.product.includes('EZOLEM')).length === 3,
  'sem filtro, EZOLEM continua 3 linhas no dataset do PDF',
);
assert(
  allPdf.rows.map((row) => row.id).join() === allVisible.map((row) => row.id).join(),
  'ordem do PDF = ordem de visibleRows',
);

const gse10009Visible = applyUseScenarioBoardView(board, {
  filters: { ...EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS, exposureGroup: '10009' },
});
const gse10009Pdf = buildUseScenarioBoardPdfDataset(gse10009Visible, {
  filters: { ...EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS, exposureGroup: '10009' },
});
assert(gse10009Pdf.rows.length === 2, 'filtro GSE 10009 → 2 linhas no PDF');
assert(
  gse10009Pdf.rows.map((row) => row.id).join() === 's-7,s-8',
  'PDF 10009 não colapsa as duas linhas',
);
assert(
  gse10009Pdf.rows.every((row) => row.gse === '10009'),
  'GSE textual aparece no dataset',
);
assert(
  gse10009Pdf.filterSummary.some((item) => item === 'GSE: 10009'),
  'resumo do recorte inclui GSE 10009',
);

const gse1014Pdf = buildUseScenarioBoardPdfDataset(
  applyUseScenarioBoardView(board, {
    filters: { ...EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS, exposureGroup: '1014' },
  }),
);
assert(gse1014Pdf.rows.length === 1, 'filtro GSE 1014 → 1 linha no PDF');
assert(gse1014Pdf.rows[0]?.id === 's-6', 'PDF 1014 é a linha correspondente');
assert(gse1014Pdf.rows[0]?.gse === '1014', 'GSE 1014 no dataset');

const pendingPdf = buildUseScenarioBoardPdfDataset([pendingActiclor]);
assert(pendingPdf.rows.length === 1, 'PENDING_SURVEY entra no PDF');
assert(pendingPdf.rows[0]?.product === 'ACTICHLOR- 5270', 'pending mantém produto');
assert(
  pendingPdf.rows[0]?.riskFactors === 'Hipoclorito de sódio',
  'pending mantém fatores da composição',
);
assert(pendingPdf.rows[0]?.gse === '—', 'pending GSE —');
assert(pendingPdf.rows[0]?.activity === '—', 'pending tarefa —');
assert(pendingPdf.rows[0]?.sector === '—', 'pending setor —');
assert(pendingPdf.rows[0]?.frequency === '—', 'pending frequência —');
assert(pendingPdf.rows[0]?.duration === '—', 'pending duração —');
assert(pendingPdf.rows[0]?.quantity === '—', 'pending quantidade —');
assert(pendingPdf.rows[0]?.sourceRows === '—', 'pending linhas —');
assert(
  pendingPdf.rows[0]?.status === 'Pendente de levantamento',
  'pending status homologado',
);

const aquaVisible = applyUseScenarioBoardView(board, {
  filters: { ...EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS, product: '651ST' },
});
const aqua910Visible = applyUseScenarioBoardView(board, {
  filters: { ...EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS, product: '910' },
});
assert(aquaVisible.map((row) => row.id).join() === 's-651', '651ST ≠ 910 na tela');
assert(
  buildUseScenarioBoardPdfDataset(aquaVisible).rows.map((row) => row.id).join() ===
    's-651',
  '651ST permanece separado no PDF',
);
assert(
  buildUseScenarioBoardPdfDataset(aqua910Visible).rows.map((row) => row.id).join() ===
    's-910',
  '910 permanece separado no PDF',
);

const sortedVisible = applyUseScenarioBoardView(board, {
  filters: { ...EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS, product: 'EZOLEM' },
  sort: { field: 'activity', order: 'desc' },
});
const sortedPdf = buildUseScenarioBoardPdfDataset(sortedVisible, {
  sort: { field: 'activity', order: 'desc' },
});
assert(
  sortedPdf.rows.map((row) => row.id).join() === 's-8,s-7,s-6',
  'PDF segue a ordenação de visibleRows',
);
assert(
  sortedPdf.rows.length === 3,
  'nenhum agrupamento/deduplicação no dataset do PDF',
);

const snapshot = board.map((row) => row.id).join();
const visibleSnapshot = allVisible.map((row) => row.id).join();
buildUseScenarioBoardPdfDataset(allVisible);
assert(board.map((row) => row.id).join() === snapshot, 'board original não é mutado');
assert(
  allVisible.map((row) => row.id).join() === visibleSnapshot,
  'entrada visibleRows não é mutada',
);

const emptyPdf = buildUseScenarioBoardPdfDataset([]);
assert(emptyPdf.rows.length === 0, 'recorte vazio não inventa linhas');

console.log('exportUseScenarioBoardPdfInBrowser.spec.ts: OK');
