/**
 * Executar: npx tsx --tsconfig tsconfig.json src/components/organisms/main/Tree/OrgTree/components/RiskTool/hooks/useApplyResidualOneToAll.spec.ts
 */
import assert from 'node:assert/strict';

import { HomoTypeEnum } from 'core/enums/homo-type.enum';
import { IRiskData } from 'core/interfaces/api/IRiskData';

import { ViewsDataEnum } from '../utils/view-data-type.constant';
import { buildResidualOneUpsertPayload } from './build-residual-one-upsert-payload.util';
import { prepareWorkspaceProbabilityWrite } from 'core/utils/workspace-probability-evaluation.util';

const riskData = {
  id: 'rd-1',
  homogeneousGroupId: 'h1//ws-a',
  hierarchyId: 'h1//ws-a',
} as IRiskData;

const hierarchyPayload = buildResidualOneUpsertPayload(
  riskData,
  'risk-1',
  'group-1',
  ViewsDataEnum.HIERARCHY,
);

assert.equal(hierarchyPayload.workspaceId, 'ws-a');
assert.equal(hierarchyPayload.type, HomoTypeEnum.HIERARCHY);
assert.equal(hierarchyPayload.homogeneousGroupId, 'h1');

const gsePayload = buildResidualOneUpsertPayload(
  riskData,
  'risk-1',
  'group-1',
  ViewsDataEnum.GSE,
);
assert.equal(gsePayload.workspaceId, undefined);
assert.equal(gsePayload.type, undefined);

const gseForMoeve = prepareWorkspaceProbabilityWrite({
  values: gsePayload,
  headerWorkspaceId: 'moeve',
});
const gseForRefinaria = prepareWorkspaceProbabilityWrite({
  values: gsePayload,
  headerWorkspaceId: 'refinaria',
});
assert.equal(gseForMoeve.ok, true);
assert.equal(gseForRefinaria.ok, true);
if (gseForMoeve.ok && gseForRefinaria.ok) {
  assert.equal(gseForMoeve.values.workspaceId, 'moeve');
  assert.equal(gseForRefinaria.values.workspaceId, 'refinaria');
  assert.equal(gseForMoeve.values.probabilityAfter, 1);
  assert.equal('probability' in gseForMoeve.values, false);
}
const gseWithoutHeader = prepareWorkspaceProbabilityWrite({
  values: gsePayload,
  headerWorkspaceId: null,
});
assert.equal(gseWithoutHeader.ok, false);

const characterization = prepareWorkspaceProbabilityWrite({
  values: gsePayload,
  originKind: 'CHARACTERIZATION',
  headerWorkspaceId: null,
});
assert.equal(characterization.ok, true);

const quantitative = prepareWorkspaceProbabilityWrite({
  values: gsePayload,
  isQuantity: true,
  headerWorkspaceId: null,
});
assert.equal(quantitative.ok, true);

console.log('useApplyResidualOneToAll.spec.ts OK');
