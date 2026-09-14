/**
 * Executar: npx tsx src/core/utils/org-workspace-query.spec.ts
 */
import assert from 'node:assert/strict';
import type { ParsedUrlQuery } from 'querystring';

import {
  applyOrgWorkspaceFilterToQuery,
  isOrgHierarquiaMultiWorkspace,
  isOrgMultiWorkspaceMode,
  parseOrgWorkspaceFilterIds,
} from './org-workspace-query';

assert.deepEqual(parseOrgWorkspaceFilterIds({}), []);
assert.deepEqual(parseOrgWorkspaceFilterIds({ tabWorkspaceId: 'ws-a' }), [
  'ws-a',
]);
assert.deepEqual(
  parseOrgWorkspaceFilterIds({ tabWorkspaceIds: 'ws-a,ws-b' }),
  ['ws-a', 'ws-b'],
);
assert.deepEqual(
  parseOrgWorkspaceFilterIds({
    tabWorkspaceId: 'ws-first',
    tabWorkspaceIds: 'ws-a,ws-b',
  }),
  ['ws-a', 'ws-b'],
);
assert.deepEqual(
  parseOrgWorkspaceFilterIds({ tabWorkspaceId: ['ws-a', 'ws-b'] }),
  [],
);

const none: ParsedUrlQuery = { companyId: 'co', tabWorkspaceId: 'ws-a' };
applyOrgWorkspaceFilterToQuery(none, []);
assert.equal(none.tabWorkspaceId, undefined);
assert.equal(none.tabWorkspaceIds, undefined);
assert.equal(none.companyId, 'co');

const one: ParsedUrlQuery = { companyId: 'co', tabWorkspaceIds: 'ws-a,ws-b' };
applyOrgWorkspaceFilterToQuery(one, ['ws-a']);
assert.equal(one.tabWorkspaceId, 'ws-a');
assert.equal(one.tabWorkspaceIds, undefined);

const two: ParsedUrlQuery = { companyId: 'co', tabWorkspaceId: 'ws-old' };
applyOrgWorkspaceFilterToQuery(two, ['ws-b', 'ws-a', 'ws-b']);
assert.equal(two.tabWorkspaceId, undefined);
assert.equal(two.tabWorkspaceIds, 'ws-b,ws-a');

assert.equal(isOrgMultiWorkspaceMode({}), false);
assert.equal(isOrgMultiWorkspaceMode({ tabWorkspaceId: 'ws-a' }), false);
assert.equal(
  isOrgMultiWorkspaceMode({ tabWorkspaceIds: 'ws-a,ws-b' }),
  true,
);
assert.equal(
  isOrgMultiWorkspaceMode({
    tabWorkspaceId: 'ws-first',
    tabWorkspaceIds: 'ws-a,ws-b',
  }),
  true,
);

assert.equal(
  isOrgHierarquiaMultiWorkspace('/dashboard/empresas/[companyId]/hierarquia', {
    tabWorkspaceIds: 'ws-a,ws-b',
  }),
  true,
);
assert.equal(
  isOrgHierarquiaMultiWorkspace('/dashboard/empresas/[companyId]/hierarquia', {
    tabWorkspaceId: 'ws-a',
  }),
  false,
);
assert.equal(
  isOrgHierarquiaMultiWorkspace(
    '/dashboard/empresas/[companyId]/caracterizacao',
    { tabWorkspaceIds: 'ws-a,ws-b' },
  ),
  false,
);

console.log('org-workspace-query.spec.ts OK');
