/**
 * Executar: npx tsx --tsconfig tsconfig.json src/components/organisms/main/Tree/OrgTree/components/RiskTool/hooks/useApplyResidualOneToAll.spec.ts
 */
import assert from 'node:assert/strict';

import { HomoTypeEnum } from 'core/enums/homo-type.enum';
import { IRiskData } from 'core/interfaces/api/IRiskData';

import { ViewsDataEnum } from '../utils/view-data-type.constant';
import { buildResidualOneUpsertPayload } from './build-residual-one-upsert-payload.util';

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

console.log('useApplyResidualOneToAll.spec.ts OK');
