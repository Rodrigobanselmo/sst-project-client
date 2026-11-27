import assert from 'node:assert/strict';
import type { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { recMedScopesIncludeRisk } from './rec-med-catalogue-scope.util';

const risk = { id: 'risk-erg', type: 'ERG', subTypes: [{ sub_type: { id: '7' } }] } as IRiskFactors;
const catalogue = [
  { id: 'general-erg', type: 'ERG', representAll: true },
  { id: 'general-qui', type: 'QUI', representAll: true },
  { id: 'general-all', type: 'OUTROS', representAll: true },
] as IRiskFactors[];

assert.equal(recMedScopesIncludeRisk([{ riskId: 'risk-erg', riskSubTypeId: null }], risk, catalogue), true);
assert.equal(recMedScopesIncludeRisk([{ riskId: 'other-risk', riskSubTypeId: null }], risk, catalogue), false);
assert.equal(recMedScopesIncludeRisk([{ riskId: 'general-erg', riskSubTypeId: 7 }], risk, catalogue), true);
assert.equal(recMedScopesIncludeRisk([{ riskId: 'general-erg', riskSubTypeId: 8 }], risk, catalogue), false);
assert.equal(recMedScopesIncludeRisk([{ riskId: 'general-qui', riskSubTypeId: null }], risk, catalogue), false);
assert.equal(recMedScopesIncludeRisk([{ riskId: 'general-all', riskSubTypeId: null }], risk, catalogue), true);
assert.equal(recMedScopesIncludeRisk([
  { riskId: 'general-qui', riskSubTypeId: null },
  { riskId: 'general-erg', riskSubTypeId: 7 },
], risk, catalogue), true);
assert.equal(recMedScopesIncludeRisk([], risk, catalogue), false);
console.log('rec-med catalogue scope attachment checks passed');
