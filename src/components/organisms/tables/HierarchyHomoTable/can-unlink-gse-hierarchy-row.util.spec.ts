/**
 * npx tsx src/components/organisms/tables/HierarchyHomoTable/can-unlink-gse-hierarchy-row.util.spec.ts
 */
import assert from 'node:assert/strict';

import {
  canUnlinkGseHierarchyRow,
  formatGseUnlinkOtherWorkspaceTooltip,
} from './can-unlink-gse-hierarchy-row.util';
import { UNGROUPED_WORKSPACE_NAME } from './resolve-hierarchy-workspace-group.util';

assert.equal(
  canUnlinkGseHierarchyRow({
    groupByWorkspace: true,
    preferredWorkspaceId: 'ws-aparecida',
    rowWorkspaceGroupId: 'ws-aparecida',
  }),
  true,
);

assert.equal(
  canUnlinkGseHierarchyRow({
    groupByWorkspace: true,
    preferredWorkspaceId: 'ws-aparecida',
    rowWorkspaceGroupId: 'ws-planaltina',
  }),
  false,
);

assert.equal(
  canUnlinkGseHierarchyRow({
    groupByWorkspace: true,
    preferredWorkspaceId: 'ws-planaltina',
    rowWorkspaceGroupId: 'ws-planaltina',
  }),
  true,
  'o mesmo cargo passa a permitir exclusão ao trocar o header',
);

assert.equal(
  canUnlinkGseHierarchyRow({
    groupByWorkspace: false,
    preferredWorkspaceId: 'ws-aparecida',
    rowWorkspaceGroupId: 'ws-planaltina',
  }),
  true,
  'fora do groupByWorkspace a exclusão permanece igual',
);

assert.equal(
  formatGseUnlinkOtherWorkspaceTooltip('Corteva – (DF) Planaltina'),
  'Para excluir este cargo, troque para o estabelecimento Corteva – (DF) Planaltina.',
);
assert.equal(
  formatGseUnlinkOtherWorkspaceTooltip(UNGROUPED_WORKSPACE_NAME),
  'Para excluir este cargo, troque para o estabelecimento correspondente.',
);
assert.equal(
  formatGseUnlinkOtherWorkspaceTooltip(''),
  'Para excluir este cargo, troque para o estabelecimento correspondente.',
);

console.log('can-unlink-gse-hierarchy-row.util.spec.ts ok');
