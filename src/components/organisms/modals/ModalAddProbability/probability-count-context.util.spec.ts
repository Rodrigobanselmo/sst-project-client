/**
 * npx tsx src/components/organisms/modals/ModalAddProbability/probability-count-context.util.spec.ts
 */
import assert from 'node:assert/strict';

import { ViewsDataEnum } from 'components/organisms/main/Tree/OrgTree/components/RiskTool/utils/view-data-type.constant';

import {
  buildProbabilityCountSource,
  isProbabilityHierarchyContext,
  resolveProbabilityEntityContext,
} from './probability-count-context.util';

const GSE_ID = 'gse-04-medicos';
const CHAR_ID = 'el-caracterizado-1';
const HIERARCHY_ID = 'office-enfermeira//ws-altus';

// GSE sem employeeCount (findById) + viewData GSE → ainda é GSE
{
  const gho = { id: GSE_ID, workspaceIds: ['ws-altus'] };
  assert.equal(
    isProbabilityHierarchyContext({ viewData: ViewsDataEnum.GSE }),
    false,
  );
  const ctx = resolveProbabilityEntityContext({
    gho,
    viewData: ViewsDataEnum.GSE,
  });
  assert.ok(ctx);
  assert.equal(ctx!.isHierarchy, false);
  assert.equal(ctx!.homogeneousGroupId, GSE_ID);
  assert.equal(ctx!.hierarchyId, '');
  assert.deepEqual(ctx!.workspaceIds, ['ws-altus']);
  assert.equal(ctx!.employeeCountGho, 0);

  const source = buildProbabilityCountSource(gho, ViewsDataEnum.GSE);
  assert.equal(source?.homogeneousGroupId, GSE_ID);
  assert.equal(source?.hierarchyId, undefined);
}

// Absência de employeeCount NÃO classifica como hierarquia em GSE
{
  const gho = { id: GSE_ID };
  assert.equal('employeeCount' in gho, false);
  const ctx = resolveProbabilityEntityContext({
    gho,
    viewData: ViewsDataEnum.GSE,
  });
  assert.equal(ctx!.homogeneousGroupId, GSE_ID);
  assert.equal(ctx!.hierarchyId, '');
}

// Elemento Caracterizado continua GHO
{
  const gho = {
    id: CHAR_ID,
    employeeCount: 2,
    workspaceIds: ['ws-altus'],
  };
  const ctx = resolveProbabilityEntityContext({
    gho,
    viewData: ViewsDataEnum.CHARACTERIZATION,
  });
  assert.equal(ctx!.isHierarchy, false);
  assert.equal(ctx!.homogeneousGroupId, CHAR_ID);
  assert.equal(ctx!.hierarchyId, '');
  assert.equal(ctx!.employeeCountGho, 2);

  const source = buildProbabilityCountSource(
    gho,
    ViewsDataEnum.CHARACTERIZATION,
  );
  assert.equal(source?.homogeneousGroupId, CHAR_ID);
  assert.equal(source?.ghoEmployeeCount, 2);
}

// Hierarquia real (viewData HIERARCHY) — mesmo com employeeCount presente
{
  const gho = {
    id: HIERARCHY_ID,
    employeeCount: 99,
    workspaceIds: ['outro'],
    childrenIds: ['child-1'],
  };
  assert.equal(
    isProbabilityHierarchyContext({ viewData: ViewsDataEnum.HIERARCHY }),
    true,
  );
  const ctx = resolveProbabilityEntityContext({
    gho,
    viewData: ViewsDataEnum.HIERARCHY,
  });
  assert.equal(ctx!.isHierarchy, true);
  assert.equal(ctx!.hierarchyId, 'office-enfermeira');
  assert.equal(ctx!.homogeneousGroupId, '');
  assert.deepEqual(ctx!.workspaceIds, ['ws-altus']);
  assert.equal(ctx!.employeeCountGho, 0);

  const source = buildProbabilityCountSource(gho, ViewsDataEnum.HIERARCHY);
  assert.equal(source?.hierarchyId, 'office-enfermeira');
  assert.equal(source?.homogeneousGroupId, undefined);
}

// Caracterização com childrenIds injetado NÃO vira hierarquia
{
  const gho = {
    id: CHAR_ID,
    childrenIds: ['x'],
    workspaceIds: ['ws-altus'],
  };
  const ctx = resolveProbabilityEntityContext({
    gho,
    viewData: ViewsDataEnum.CHARACTERIZATION,
  });
  assert.equal(ctx!.isHierarchy, false);
  assert.equal(ctx!.homogeneousGroupId, CHAR_ID);
  assert.equal(ctx!.hierarchyId, '');
}

console.log('probability-count-context.util.spec: ok');
