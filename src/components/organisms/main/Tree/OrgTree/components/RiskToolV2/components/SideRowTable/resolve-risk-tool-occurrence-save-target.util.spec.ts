/**
 * Executar: npx tsx src/components/organisms/main/Tree/OrgTree/components/RiskToolV2/components/SideRowTable/resolve-risk-tool-occurrence-save-target.util.spec.ts
 */
import assert from 'node:assert/strict';

import { resolveRiskToolOccurrenceSaveTarget } from './resolve-risk-tool-occurrence-save-target.util';

const origin = resolveRiskToolOccurrenceSaveTarget({
  originHomogeneousGroupId: 'el-op',
  selectedGhoId: 'gse-deten-03',
  riskFactorDataId: 'rfd-origin',
});
assert.deepEqual(origin, {
  homogeneousGroupId: 'el-op',
  riskFactorDataId: 'rfd-origin',
});

assert.equal(
  resolveRiskToolOccurrenceSaveTarget({
    originHomogeneousGroupId: 'el-op',
    selectedGhoId: 'gse-deten-03',
  }),
  null,
);

const direct = resolveRiskToolOccurrenceSaveTarget({
  selectedGhoId: 'gse-deten-03//ws-1',
  riskFactorDataId: 'rfd-direct',
});
assert.deepEqual(direct, {
  homogeneousGroupId: 'gse-deten-03',
  riskFactorDataId: 'rfd-direct',
});

const createOnSelected = resolveRiskToolOccurrenceSaveTarget({
  selectedGhoId: 'gse-deten-03',
});
assert.deepEqual(createOnSelected, {
  homogeneousGroupId: 'gse-deten-03',
  riskFactorDataId: undefined,
});

assert.equal(
  resolveRiskToolOccurrenceSaveTarget({
    selectedGhoId: '',
  }),
  null,
);

console.log('resolve-risk-tool-occurrence-save-target.util.spec.ts ok');
