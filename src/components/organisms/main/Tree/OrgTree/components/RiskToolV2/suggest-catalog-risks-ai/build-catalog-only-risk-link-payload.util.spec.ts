import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  buildCatalogOnlyRiskLinkPayload,
  intersectSuggestedRiskIdsWithCatalog,
} from './build-catalog-only-risk-link-payload.util';

const payload = buildCatalogOnlyRiskLinkPayload({
  riskGroupId: 'rg1',
  entityId: 'gse-1',
  selectedRiskIds: ['r1', 'r1', 'r2'],
  workspaceId: 'ws-1',
});

assert.deepEqual(payload, {
  keepEmpty: true,
  homogeneousGroupIds: ['gse-1'],
  riskIds: ['r1', 'r2'],
  riskFactorGroupDataId: 'rg1',
  workspaceId: 'ws-1',
});

assert.equal(
  buildCatalogOnlyRiskLinkPayload({
    riskGroupId: 'rg1',
    entityId: 'gse-1',
    selectedRiskIds: [],
  }),
  null,
);

assert.deepEqual(
  intersectSuggestedRiskIdsWithCatalog({
    suggestedIds: ['a', 'b', 'c'],
    catalogIds: new Set(['a', 'c']),
  }),
  ['a', 'c'],
);

const dialogPath = join(
  process.cwd(),
  'src/components/organisms/main/Tree/OrgTree/components/RiskToolV2/suggest-catalog-risks-ai/SuggestCatalogRisksWithAiDialog.tsx',
);
const source = readFileSync(dialogPath, 'utf8');
assert.equal(source.includes('buildGseAddRiskPayload'), false);
assert.ok(source.includes('catalog-only'));
assert.equal(source.includes('apply-current-risk-matrix'), false);
assert.equal(source.includes('buildCatalogOnlyRiskLinkPayload'), true);
assert.equal(payload?.keepEmpty, true);
assert.ok(source.includes('queryRisk'));
assert.ok(source.includes('filterCatalogOnlyAiSuggestions'));
assert.ok(source.includes('resolveCatalogOnlyAiSuggestionFeedback'));
assert.equal(source.includes('getQueryData'), false);
assert.ok(source.includes('catalog === undefined'));
assert.ok(source.includes('CATALOG_LOAD_ERROR'));
assert.ok(source.includes('useQueryRiskDataByGho'));

console.log('build-catalog-only-risk-link-payload.util.spec.ts OK');
