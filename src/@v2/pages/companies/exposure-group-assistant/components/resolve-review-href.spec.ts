/**
 * Executar: npx tsx src/@v2/pages/companies/exposure-group-assistant/components/resolve-review-href.spec.ts
 */
import assert from 'node:assert/strict';

import { resolveReviewHref } from './resolve-review-href';

const deep = resolveReviewHref({
  companyId: 'comp-1',
  workspaceId: 'ws-1',
  recommendation: {
    ctaTarget: 'HIERARCHY',
    primaryEntityId: 'hier-sub-1',
    primaryEntityType: 'HIERARCHY',
    kind: 'ROLE_WITHOUT_CHARACTERIZATION_COVERAGE',
  },
});

assert.ok(deep?.includes('/hierarquia'));
assert.ok(deep?.includes('tabWorkspaceId=ws-1'));
assert.ok(deep?.includes('hierarchyId=hier-sub-1'));
assert.ok(deep?.includes('openCard=1'));

const bare = resolveReviewHref({
  companyId: 'comp-1',
  recommendation: {
    ctaTarget: 'HIERARCHY',
    primaryEntityId: 'hier-sub-1',
    primaryEntityType: 'HIERARCHY',
    kind: 'ROLE_WITHOUT_CHARACTERIZATION_COVERAGE',
  },
});
assert.ok(bare?.includes('hierarquia'));
assert.ok(!bare?.includes('hierarchyId='));

console.log('resolve-review-href.spec.ts OK');
