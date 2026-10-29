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

const merged = mergeRiskFactorDataCacheList([shared], {
  ...shared,
  probability: 2,
  resolvedAbbreviation: 'M',
});
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

const historical = {
  ...shared,
  id: 'rfd-closed',
  endDate: '2020-01-01',
  probability: 1,
};
assert.equal(
  isSameRiskFactorDataCacheRow(shared, historical),
  false,
  'IDs persistidos diferentes nunca usam fallback por fator/proprietário',
);
const anotherOwner = {
  ...shared,
  id: 'rfd-owner-b',
  homogeneousGroupId: 'owner-b',
};
const list = [shared, historical, anotherOwner];
const exact = mergeRiskFactorDataCacheList(list, {
  ...shared,
  probability: 3,
})!;
assert.equal(exact[0].probability, 3);
assert.equal(exact[1], historical);
assert.equal(exact[1].probability, 1);
assert.equal(exact[2], anotherOwner);
const sharedMataripe = { ...shared, workspaceId: mataripe };
const sharedMove = { ...shared, workspaceId: move };
const historicalMove = { ...historical, workspaceId: move };
assert.equal(
  isSameRiskFactorDataCacheRow(sharedMataripe, sharedMove),
  true,
  'workspace não transforma o RFD compartilhado em outro registro',
);
assert.equal(
  isSameRiskFactorDataCacheRow(sharedMataripe, historicalMove),
  false,
);
assert.equal(
  isSameRiskFactorDataCacheRow({ ...shared, id: undefined }, shared),
  true,
  'fallback legado permanece quando falta ID',
);
assert.equal(
  isSameRiskFactorDataCacheRow(
    { ...shared, id: undefined },
    { ...shared, id: undefined },
  ),
  true,
);
assert.equal(
  isSameRiskFactorDataCacheRow(
    { ...shared, id: undefined },
    { ...shared, id: undefined, riskFactorGroupDataId: 'different-group' },
  ),
  false,
);
assert.notDeepEqual(mataripeKey, moveKey);
const workspaceA = mergeRiskFactorDataCacheList(list, {
  ...shared,
  probability: 4,
});
const workspaceB = [...list];
assert.equal(workspaceA?.[0].probability, 4);
assert.equal(
  workspaceB[0].probability,
  5,
  'atualização da query de um estabelecimento não modifica objetos de outra query',
);
console.log(
  'Identidade exata de cache: históricos, proprietários, compartilhamento e overlays preservados',
);
