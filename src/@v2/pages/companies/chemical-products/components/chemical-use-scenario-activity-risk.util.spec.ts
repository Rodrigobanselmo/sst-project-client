/**
 * Executar: npx tsx src/@v2/pages/companies/chemical-products/components/chemical-use-scenario-activity-risk.util.spec.ts
 */
import type { ChemicalUseScenarioActivityRiskResolution } from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';

import {
  canReviewScenarioActivityCorrelation,
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

console.log('chemical-use-scenario-activity-risk.util.spec.ts: OK');
