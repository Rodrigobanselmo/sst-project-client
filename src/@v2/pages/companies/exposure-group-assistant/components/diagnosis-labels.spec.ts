/**
 * Executar: npx tsx src/@v2/pages/companies/exposure-group-assistant/components/diagnosis-labels.spec.ts
 */
import assert from 'node:assert/strict';

import {
  ATTENTION_LEVEL_LABEL_PT,
  FINDING_CATEGORY_LABEL_PT,
  STANCE_LABEL_PT,
  maturityLabel,
} from './diagnosis-labels';

assert.equal(ATTENTION_LEVEL_LABEL_PT.INFORMATIONAL, 'Informativo');
assert.equal(ATTENTION_LEVEL_LABEL_PT.PRIORITY, 'Prioritário');
assert.equal(FINDING_CATEGORY_LABEL_PT.COVERAGE, 'Cobertura');
assert.equal(
  FINDING_CATEGORY_LABEL_PT.EXISTING_GSE_REVIEW,
  'Agrupamentos existentes',
);
assert.equal(STANCE_LABEL_PT.OPPORTUNITY, 'Oportunidade');
assert.equal(STANCE_LABEL_PT.EXPECTED_SITUATION, 'Situação esperada');
assert.equal(maturityLabel('MATURE'), 'Maduro');
assert.equal(maturityLabel('PARTIAL'), 'Parcial');

console.log('diagnosis-labels.spec.ts OK');
