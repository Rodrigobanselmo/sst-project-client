/**
 * Executar:
 * npx tsx src/core/services/hooks/mutations/checklist/riskData/merge-risk-factor-data-cache.util.spec.ts
 */
import assert from 'node:assert/strict';

import {
  isSameRiskFactorDataCacheRow,
  mergeRiskFactorDataCacheList,
  riskFactorDataByGhoQueryKey,
  riskFactorDataByGhoQueryKeyPrefix,
} from './merge-risk-factor-data-cache.util';

const gse = 'gse-04';
const group = 'rfgd-1';
const risk = 'risk-1';
const mataripe = 'ws-mataripe';
const move = 'ws-move';

const shared = {
  id: 'rfd-shared',
  riskId: risk,
  homogeneousGroupId: gse,
  riskFactorGroupDataId: group,
  probability: 5,
  resolvedAbbreviation: 'A1',
};

assert.equal(
  isSameRiskFactorDataCacheRow(shared, {
    id: 'rfd-shared',
    riskId: risk,
    homogeneousGroupId: gse,
    riskFactorGroupDataId: group,
    probability: 2,
  }),
  true,
  'mesmo RFD compartilhado é a mesma linha, independente do workspace da query',
);

assert.equal(
  isSameRiskFactorDataCacheRow(shared, {
    id: 'rfd-other',
    riskId: 'risk-2',
    homogeneousGroupId: gse,
    riskFactorGroupDataId: group,
  }),
  false,
  'risco diferente não mescla',
);

const merged = mergeRiskFactorDataCacheList(
  [shared],
  { ...shared, probability: 2, resolvedAbbreviation: 'M' },
);
assert.equal(merged?.[0].id, 'rfd-shared');
assert.equal(merged?.[0].probability, 2);
assert.equal(merged?.[0].resolvedAbbreviation, 'M');

const mataripeKey = riskFactorDataByGhoQueryKey({
  companyId: 'c1',
  riskFactorGroupDataId: group,
  homogeneousGroupId: gse,
  workspaceId: mataripe,
});
const moveKey = riskFactorDataByGhoQueryKey({
  companyId: 'c1',
  riskFactorGroupDataId: group,
  homogeneousGroupId: gse,
  workspaceId: move,
});
assert.notDeepEqual(
  mataripeKey,
  moveKey,
  'overlay Mataripe e MOVE usam query keys distintas',
);

const prefix = riskFactorDataByGhoQueryKeyPrefix({
  companyId: 'c1',
  riskFactorGroupDataId: group,
  homogeneousGroupId: gse,
});
assert.equal(mataripeKey.slice(0, 4).join(','), prefix.join(','));
assert.equal(moveKey.slice(0, 4).join(','), prefix.join(','));
assert.equal(prefix.includes(mataripe), false);
assert.equal(prefix.includes(move), false);

console.log('merge-risk-factor-data-cache.util.spec.ts ok');
