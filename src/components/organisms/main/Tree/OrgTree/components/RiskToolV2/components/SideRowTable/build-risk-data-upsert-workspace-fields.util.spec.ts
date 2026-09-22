/**
 * Executar: npx tsx src/components/organisms/main/Tree/OrgTree/components/RiskToolV2/components/SideRowTable/build-risk-data-upsert-workspace-fields.util.spec.ts
 */
import assert from 'node:assert/strict';

import { HomoTypeEnum } from 'core/enums/homo-type.enum';

import { buildRiskDataUpsertWorkspaceFields } from './build-risk-data-upsert-workspace-fields.util';

// Caracterização homologada: só tabWorkspaceId na rota
assert.deepEqual(
  buildRiskDataUpsertWorkspaceFields({
    isHierarchy: false,
    tabWorkspaceId: 'wsNR15',
  }),
  { workspaceId: 'wsNR15' },
);

// workspaceId explícito tem prioridade sobre tab
assert.deepEqual(
  buildRiskDataUpsertWorkspaceFields({
    isHierarchy: false,
    explicitWorkspaceId: 'ws-explicit',
    tabWorkspaceId: 'wsNR15',
  }),
  { workspaceId: 'ws-explicit' },
);

// path workspaceId (rota de edição) antes de tabWorkspaceId
assert.deepEqual(
  buildRiskDataUpsertWorkspaceFields({
    isHierarchy: false,
    routeWorkspaceId: 'ws-path',
    tabWorkspaceId: 'wsNR15',
  }),
  { workspaceId: 'ws-path' },
);

// HIERARCHY: preserva type + workspace embutido; ignora tab
assert.deepEqual(
  buildRiskDataUpsertWorkspaceFields({
    isHierarchy: true,
    hierarchyWorkspaceId: 'ws-hier',
    tabWorkspaceId: 'wsNR15',
    explicitWorkspaceId: 'ws-should-not-win',
  }),
  {
    type: HomoTypeEnum.HIERARCHY,
    workspaceId: 'ws-hier',
  },
);

// HIERARCHY sem embutido: mantém chave undefined (legado); não inventa tab
assert.deepEqual(
  buildRiskDataUpsertWorkspaceFields({
    isHierarchy: true,
    hierarchyWorkspaceId: undefined,
    tabWorkspaceId: 'wsNR15',
  }),
  {
    type: HomoTypeEnum.HIERARCHY,
    workspaceId: undefined,
  },
);

// Sem contexto: não inventa workspaceId
assert.deepEqual(
  buildRiskDataUpsertWorkspaceFields({
    isHierarchy: false,
  }),
  {},
);

assert.deepEqual(
  buildRiskDataUpsertWorkspaceFields({
    isHierarchy: false,
    explicitWorkspaceId: '',
    tabWorkspaceId: '',
  }),
  {},
);

console.log('build-risk-data-upsert-workspace-fields.util.spec.ts: ok');
