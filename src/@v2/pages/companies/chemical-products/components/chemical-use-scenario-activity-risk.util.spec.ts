/**
 * Executar: npx tsx src/@v2/pages/companies/chemical-products/components/chemical-use-scenario-activity-risk.util.spec.ts
 */
import type {
  ChemicalUseScenarioActivityRiskFactor,
  ChemicalUseScenarioActivityRiskResolution,
  ChemicalUseScenarioListItem,
} from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';

import { UNINDIVIDUALIZED_COMPOSITION_LABEL } from './chemical-composition-disclosure.util';
import {
  canReviewScenarioActivityCorrelation,
  formatActivityRiskFactorsListCell,
  formatScenarioActivityCorrelationStatus,
} from './chemical-use-scenario-activity-risk.util';

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

const rf = {
  id: 'rf-1',
  name: 'Acetona',
  cas: '67-64-1',
  system: true,
  companyId: 'c1',
  type: 'QUI',
};

const resolved: ChemicalUseScenarioActivityRiskResolution = {
  status: 'RESOLVED',
  resolution: 'SOURCE_ROW',
  sourceRow: 10,
  component: 'Acetona',
  componentOriginal: 'Acetona',
  ingredientId: 'ing-1',
  riskFactor: rf,
};

const unlinked: ChemicalUseScenarioActivityRiskResolution = {
  status: 'UNRESOLVED',
  resolution: 'UNLINKED',
  sourceRow: 340,
  component: 'Trans',
  componentOriginal: 'Trans',
  ingredientId: 'ing-340',
  riskFactor: null,
};

const ambiguous: ChemicalUseScenarioActivityRiskResolution = {
  status: 'UNRESOLVED',
  resolution: 'AMBIGUOUS',
  sourceRow: 2,
  component: 'Z',
  componentOriginal: 'Z',
  ingredientId: null,
  riskFactor: null,
};

const noMatch: ChemicalUseScenarioActivityRiskResolution = {
  status: 'UNRESOLVED',
  resolution: 'NO_MATCH',
  sourceRow: 99,
  component: 'X',
  componentOriginal: 'X',
  ingredientId: null,
  riskFactor: null,
};

assert(canReviewScenarioActivityCorrelation(resolved), 'RESOLVED pode revisar');
assert(canReviewScenarioActivityCorrelation(unlinked), 'UNLINKED pode revisar');
assert(
  !canReviewScenarioActivityCorrelation(ambiguous),
  'AMBIGUOUS não oferece PATCH',
);
assert(
  !canReviewScenarioActivityCorrelation(noMatch),
  'NO_MATCH não oferece PATCH',
);
assert(
  formatScenarioActivityCorrelationStatus(ambiguous).includes('ambíguo'),
  'mensagem ambígua',
);
assert(
  formatScenarioActivityCorrelationStatus(unlinked).includes(
    'Não correlacionado',
  ),
  'mensagem unlinked',
);

const rfNaoh: ChemicalUseScenarioActivityRiskFactor = {
  id: 'rf-naoh',
  name: 'Hidróxido de sódio',
  cas: '1310-73-2',
  system: true,
  companyId: 'c1',
  type: 'QUI',
};
const rfMaleate: ChemicalUseScenarioActivityRiskFactor = {
  id: 'rf-mal',
  name: 'Disodium maleate',
  cas: '371-47-1',
  system: true,
  companyId: 'c1',
  type: 'QUI',
};
const rfBronopol: ChemicalUseScenarioActivityRiskFactor = {
  id: 'rf-br',
  name: 'bronopol',
  cas: '52-51-7',
  system: true,
  companyId: 'c1',
  type: 'QUI',
};

function surveyRow(
  disclosure: 'DECLARED' | 'UNINDIVIDUALIZED',
): ChemicalUseScenarioListItem {
  return {
    id: 's1',
    chemicalProductId: 'p1',
    surveyStatus: 'LEVANTAMENTO_CONCLUIDO',
    activityName: 'Tarefa',
    sectorSnapshot: 'Caldeira',
    exposureGroupSnapshot: '10009',
    exposedRolesSnapshot: null,
    frequencyCount: 1,
    frequencyPeriod: 'Diário',
    durationMinutes: 10,
    quantity: '0.00333',
    quantityUnit: 'litros',
    peakContactMoment: null,
    controlMeasures: null,
    linachHint: null,
    relevanceHint: null,
    sourceSheet: 'Elegebilidade',
    sourceRows: [10],
    sourceProductLabel: 'X',
    sourceRaw: {
      lines: [
        {
          sourceRow: 10,
          component: null,
          percentRaw: null,
          tradeName: 'X',
          manufacturer: null,
        },
      ],
    },
    activityRiskOrigin: 'PRODUCT_COMPOSITION',
    activityRiskResolutions: [],
    activityRiskFactors: [],
    product: {
      id: 'p1',
      tradeName: 'X',
      manufacturer: null,
      isPureSubstance: false,
      status: 'ACTIVE',
      activeComposition: {
        id: 'c1',
        compositionDisclosure: disclosure,
        ingredients: [],
      },
    },
  };
}

assert(
  formatActivityRiskFactorsListCell([rfNaoh]) === 'Hidróxido de sódio',
  '13) 1 fator',
);
assert(
  formatActivityRiskFactorsListCell([rfNaoh, rfMaleate]) ===
    'Hidróxido de sódio; Disodium maleate',
  '14) 2 fatores',
);
assert(
  formatActivityRiskFactorsListCell([rfNaoh, rfMaleate, rfBronopol]).includes(
    '+1',
  ),
  '14) 3+ fatores',
);
assert(
  formatActivityRiskFactorsListCell([], surveyRow('UNINDIVIDUALIZED')) ===
    UNINDIVIDUALIZED_COMPOSITION_LABEL,
  '15) UNINDIVIDUALIZED',
);
assert(
  formatActivityRiskFactorsListCell([], surveyRow('DECLARED')) ===
    'Não correlacionado',
  '16) DECLARED sem RF',
);
assert(
  formatActivityRiskFactorsListCell([], {
    ...surveyRow('UNINDIVIDUALIZED'),
    activityRiskOrigin: 'TECHNICAL_PROVENANCE',
  }) === 'Não correlacionado',
  '17) TECHNICAL vazio permanece Não correlacionado',
);

console.log('chemical-use-scenario-activity-risk.util.spec.ts: OK');
