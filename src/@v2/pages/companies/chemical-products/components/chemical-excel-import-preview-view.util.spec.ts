/**
 * Executar: npx tsx src/@v2/pages/companies/chemical-products/components/chemical-excel-import-preview-view.util.spec.ts
 */
import type { ChemicalExcelImportPreview } from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';

import {
  chemicalExcelProductActionLabel,
  CHEMICAL_EXCEL_USE_SCENARIO_ACTION_LABEL,
  summarizeChemicalExcelImportPreview,
} from './chemical-excel-import-preview-view.util';

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

function preview(
  overrides: Partial<ChemicalExcelImportPreview> & {
    totals: ChemicalExcelImportPreview['totals'];
    canCommit: boolean;
  },
): ChemicalExcelImportPreview {
  return {
    layoutVersion: 'SIMPLESST_CHEMICAL_IMPORT_V2',
    fileName: 'teste.xlsx',
    persisted: false,
    products: [],
    issues: [],
    ...overrides,
  };
}

const oldWorkbook = preview({
  canCommit: true,
  totals: {
    products: 1,
    ingredients: 2,
    errors: 0,
    warnings: 0,
    autoLinkedByCas: 1,
    withoutRiskFactor: 0,
    possibleDuplicates: 0,
  },
});

assert(
  summarizeChemicalExcelImportPreview(oldWorkbook).hasUseScenarioSheet === false,
  'workbook antigo sem useScenarios continua aceito',
);
assert(
  summarizeChemicalExcelImportPreview(oldWorkbook).canCommit === true,
  'workbook antigo pode commitar',
);
assert(
  chemicalExcelProductActionLabel('CREATE_NEW') === 'NOVO PRODUTO',
  'label produto novo',
);

const mixed = preview({
  canCommit: true,
  totals: {
    products: 4,
    ingredients: 8,
    errors: 0,
    warnings: 1,
    autoLinkedByCas: 2,
    withoutRiskFactor: 0,
    possibleDuplicates: 0,
    newProducts: 2,
    reusedProducts: 3,
    ambiguousProducts: 0,
    newScenarios: 7,
    alreadyImportedScenarios: 2,
    blockedScenarios: 0,
  },
  useScenarios: {
    sheetPresent: true,
    sheetEmpty: false,
    sheetName: 'Cenários de uso',
    productGroups: [
      {
        productKey: 'a',
        tradeName: 'EZOLEM',
        manufacturer: 'BRASKEM',
        status: 'EXISTING',
        chemicalProductId: 'p1',
        candidates: [],
        message: 'Produto já existente — serão importados apenas cenários novos.',
      },
    ],
    scenarios: [
      {
        clusterKey: '1',
        productKey: 'a',
        tradeName: 'EZOLEM',
        manufacturer: 'BRASKEM',
        productStatus: 'EXISTING',
        action: 'ALREADY_IMPORTED',
        chemicalProductId: 'p1',
        activityName: 'Dosagem A',
        sectorSnapshot: null,
        exposureGroupSnapshot: '1014',
        sourceSheet: 'Cenários de uso',
        sourceRows: [2],
        message: 'JÁ IMPORTADO',
        blockers: [],
      },
    ],
  },
});

const mixedSummary = summarizeChemicalExcelImportPreview(mixed);
assert(mixedSummary.newProducts === 2, 'produtos novos');
assert(mixedSummary.reusedProducts === 3, 'reutilizados');
assert(mixedSummary.newScenarios === 7, 'cenários novos');
assert(mixedSummary.alreadyImportedScenarios === 2, 'já existentes');
assert(mixedSummary.blocked === 0, 'sem bloqueios');
assert(mixedSummary.canCommit === true, 'commit habilitado sem blocker');
assert(
  CHEMICAL_EXCEL_USE_SCENARIO_ACTION_LABEL.ALREADY_IMPORTED === 'JÁ IMPORTADO',
  'cenário já importado identificado',
);

const blocked = preview({
  canCommit: false,
  totals: {
    products: 1,
    ingredients: 1,
    errors: 1,
    warnings: 0,
    autoLinkedByCas: 0,
    withoutRiskFactor: 0,
    possibleDuplicates: 0,
    newProducts: 0,
    reusedProducts: 0,
    ambiguousProducts: 1,
    newScenarios: 0,
    alreadyImportedScenarios: 0,
    blockedScenarios: 1,
  },
  useScenarios: {
    sheetPresent: true,
    sheetEmpty: false,
    sheetName: 'Cenários de uso',
    productGroups: [
      {
        productKey: 'a',
        tradeName: 'EZOLEM',
        manufacturer: 'BRASKEM',
        status: 'AMBIGUOUS',
        chemicalProductId: null,
        candidates: [],
        message: 'Há mais de um produto ACTIVE',
      },
    ],
    scenarios: [
      {
        clusterKey: '1',
        productKey: 'a',
        tradeName: 'EZOLEM',
        manufacturer: 'BRASKEM',
        productStatus: 'AMBIGUOUS',
        action: 'BLOCKED',
        chemicalProductId: null,
        activityName: 'Dosagem A',
        sectorSnapshot: null,
        exposureGroupSnapshot: null,
        sourceSheet: 'Cenários de uso',
        sourceRows: [2],
        message: 'INVÁLIDO / BLOQUEADO',
        blockers: ['ambíguo'],
      },
    ],
  },
});

const blockedSummary = summarizeChemicalExcelImportPreview(blocked);
assert(blockedSummary.canCommit === false, 'commit desabilitado com blocker');
assert(blockedSummary.ambiguousProducts === 1, 'ambíguo visível');
assert(blockedSummary.blocked === 2, 'bloqueios somados');
assert(
  chemicalExcelProductActionLabel('AMBIGUOUS_BLOCKED') ===
    'AMBÍGUO / BLOQUEADO',
  'label ambíguo',
);
assert(
  chemicalExcelProductActionLabel('REUSE_EXISTING') === 'PRODUTO EXISTENTE',
  'label existente',
);

console.log('chemical-excel-import-preview-view.util.spec.ts ok');
