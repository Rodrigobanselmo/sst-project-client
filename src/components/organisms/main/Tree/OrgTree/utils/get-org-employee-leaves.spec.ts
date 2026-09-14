/**
 * Executar: npx tsx --tsconfig tsconfig.json src/components/organisms/main/Tree/OrgTree/utils/get-org-employee-leaves.spec.ts
 */
import assert from 'node:assert/strict';

import { TreeTypeEnum } from '../enums/tree-type.enums';
import { ITreeMapObject } from '../interfaces';
import {
  ORG_EMPLOYEE_LEAF_ACTIONS,
  buildEditEmployeeModalPayload,
  buildOrgEmployeeLeavesQuery,
  canExpandOrgNode,
  getOrgEmployeeHostHierarchyId,
  hasOrgEmployeeLeaves,
  isOrgEmployeeLeafHostType,
  isStructuralHierarchyChildId,
  overlayOrgEmployeeLeaves,
  toOrgEmployeeLeafCards,
} from './get-org-employee-leaves';

function node(
  partial: Pick<ITreeMapObject, 'id' | 'type' | 'childrenIds'> &
    Partial<Pick<ITreeMapObject, 'employeesCount' | 'label' | 'parentId'>>,
): ITreeMapObject {
  return {
    label: partial.label || 'n',
    parentId: partial.parentId ?? null,
    expand: false,
    ghos: [],
    employeesCount: partial.employeesCount,
    ...partial,
  };
}

const officeEmpty = node({
  id: 'office-1//ws-a',
  type: TreeTypeEnum.OFFICE,
  childrenIds: [],
  employeesCount: 0,
});

const officeOne = node({
  id: 'office-1//ws-a',
  type: TreeTypeEnum.OFFICE,
  childrenIds: [],
  employeesCount: 1,
});

const officeThree = node({
  id: 'office-1//ws-b',
  type: TreeTypeEnum.OFFICE,
  childrenIds: ['sub-1//ws-b'],
  employeesCount: 3,
});

const subOffice = node({
  id: 'sub-1//ws-a',
  type: TreeTypeEnum.SUB_OFFICE,
  childrenIds: [],
  employeesCount: 2,
});

const sector = node({
  id: 'sector-1//ws-a',
  type: TreeTypeEnum.SECTOR,
  childrenIds: ['office-1//ws-a'],
  employeesCount: 4,
});

assert.equal(hasOrgEmployeeLeaves(officeEmpty), false);
assert.equal(canExpandOrgNode(officeEmpty), false);

assert.equal(hasOrgEmployeeLeaves(officeOne), true);
assert.equal(canExpandOrgNode(officeOne), true);

const threeCards = toOrgEmployeeLeafCards([
  { id: 3, name: 'C', companyId: 'co' },
  { id: 1, name: 'A', companyId: 'co' },
  { id: 2, name: 'B', companyId: 'co' },
]);
assert.equal(threeCards.length, 3);
assert.deepEqual(
  threeCards.map((item) => item.id),
  [1, 2, 3],
);

const overlay = overlayOrgEmployeeLeaves(['sub-1//ws-a'], [10, 20, 30]);
assert.deepEqual(overlay.childrenIds, ['sub-1//ws-a']);
assert.equal(overlay.childrenIds.includes('employee:10'), false);
assert.deepEqual(overlay.overlayIds, ['employee:10', 'employee:20', 'employee:30']);
assert.equal(isStructuralHierarchyChildId('sub-1//ws-a'), true);
assert.equal(isStructuralHierarchyChildId('employee:10'), false);

const officeQuery = buildOrgEmployeeLeavesQuery(officeOne, { enabled: true });
assert.equal(officeQuery.disabled, false);
assert.equal(officeQuery.noPagination, true);
assert.equal(officeQuery.hierarchyId, 'office-1');
assert.equal('hierarchySubOfficeId' in officeQuery, false);
assert.equal('hierarchyWorkspaceId' in officeQuery, false);
assert.equal('workspacesIds' in officeQuery, false);

const subQuery = buildOrgEmployeeLeavesQuery(subOffice, { enabled: true });
assert.equal(subQuery.hierarchySubOfficeId, 'sub-1');
assert.equal('hierarchyId' in subQuery, false);
assert.equal(subQuery.noPagination, true);

assert.equal(isOrgEmployeeLeafHostType(TreeTypeEnum.SECTOR), false);
assert.equal(hasOrgEmployeeLeaves(sector), false);
assert.equal(buildOrgEmployeeLeavesQuery(sector, { enabled: true }).disabled, true);

const payload = buildEditEmployeeModalPayload({
  id: 91,
  name: 'Ana',
  companyId: 'company-1',
});
assert.deepEqual(payload, { id: 91, companyId: 'company-1' });
assert.equal(ORG_EMPLOYEE_LEAF_ACTIONS.canDrag, false);
assert.equal(ORG_EMPLOYEE_LEAF_ACTIONS.canDrop, false);
assert.equal(ORG_EMPLOYEE_LEAF_ACTIONS.canCopy, false);
assert.equal(ORG_EMPLOYEE_LEAF_ACTIONS.canMove, false);
assert.equal(ORG_EMPLOYEE_LEAF_ACTIONS.showStructuralMenu, false);
assert.equal(ORG_EMPLOYEE_LEAF_ACTIONS.showGho, false);
assert.equal(ORG_EMPLOYEE_LEAF_ACTIONS.canCreateChild, false);
assert.equal(ORG_EMPLOYEE_LEAF_ACTIONS.canDeleteHierarchy, false);

const sharedA = buildOrgEmployeeLeavesQuery(
  node({
    id: 'shared-office//ws-a',
    type: TreeTypeEnum.OFFICE,
    childrenIds: [],
    employeesCount: 2,
  }),
  { enabled: true },
);
const sharedB = buildOrgEmployeeLeavesQuery(
  node({
    id: 'shared-office//ws-b',
    type: TreeTypeEnum.OFFICE,
    childrenIds: [],
    employeesCount: 2,
  }),
  { enabled: true },
);
assert.equal(getOrgEmployeeHostHierarchyId('shared-office//ws-a'), 'shared-office');
assert.equal(getOrgEmployeeHostHierarchyId('shared-office//ws-b'), 'shared-office');
assert.equal(sharedA.hierarchyId, sharedB.hierarchyId);
assert.equal(sharedA.hierarchyId, 'shared-office');
assert.equal('hierarchyWorkspaceId' in sharedA, false);
assert.equal('hierarchyWorkspaceId' in sharedB, false);
assert.equal('workspacesIds' in sharedA, false);
assert.equal('workspacesIds' in sharedB, false);

assert.equal(canExpandOrgNode(officeThree), true);
assert.deepEqual(officeThree.childrenIds, ['sub-1//ws-b']);

console.log('get-org-employee-leaves.spec.ts ok');
