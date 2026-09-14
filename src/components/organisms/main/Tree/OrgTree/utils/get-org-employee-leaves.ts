import { TreeTypeEnum } from '../enums/tree-type.enums';
import { ITreeMapObject } from '../interfaces';

export const ORG_EMPLOYEE_LEAF_ACTIONS = {
  canDrag: false,
  canDrop: false,
  canCopy: false,
  canMove: false,
  canCreateChild: false,
  canDeleteHierarchy: false,
  showGho: false,
  showStructuralMenu: false,
} as const;

export type OrgEmployeeLeafCard = {
  id: number;
  name: string;
  companyId: string;
};

export type OrgEmployeeLeavesQuery = {
  disabled: boolean;
  noPagination: true;
  hierarchyId?: string;
  hierarchySubOfficeId?: string;
};

export function isOrgEmployeeLeafHostType(type: TreeTypeEnum) {
  return type === TreeTypeEnum.OFFICE || type === TreeTypeEnum.SUB_OFFICE;
}

export function hasOrgEmployeeLeaves(node: Pick<ITreeMapObject, 'type' | 'employeesCount'>) {
  return isOrgEmployeeLeafHostType(node.type) && (node.employeesCount ?? 0) > 0;
}

export function canExpandOrgNode(
  node: Pick<ITreeMapObject, 'type' | 'employeesCount' | 'childrenIds'>,
) {
  return (node.childrenIds?.length ?? 0) > 0 || hasOrgEmployeeLeaves(node);
}

export function getOrgEmployeeHostHierarchyId(nodeId: string | number) {
  return String(nodeId).split('//')[0] || '';
}

export function buildOrgEmployeeLeavesQuery(
  node: Pick<ITreeMapObject, 'id' | 'type' | 'employeesCount'>,
  options?: { enabled?: boolean },
): OrgEmployeeLeavesQuery {
  const enabled = options?.enabled !== false && hasOrgEmployeeLeaves(node);
  const hierarchyId = getOrgEmployeeHostHierarchyId(node.id);

  if (!enabled || !hierarchyId) {
    return { disabled: true, noPagination: true };
  }

  if (node.type === TreeTypeEnum.SUB_OFFICE) {
    return {
      disabled: false,
      noPagination: true,
      hierarchySubOfficeId: hierarchyId,
    };
  }

  if (node.type === TreeTypeEnum.OFFICE) {
    return {
      disabled: false,
      noPagination: true,
      hierarchyId,
    };
  }

  return { disabled: true, noPagination: true };
}

export function toOrgEmployeeLeafCards(
  employees: Array<{ id?: number; name?: string; companyId?: string }>,
): OrgEmployeeLeafCard[] {
  return employees
    .filter((employee): employee is { id: number; name?: string; companyId?: string } =>
      typeof employee.id === 'number',
    )
    .map((employee) => ({
      id: employee.id,
      name: employee.name || '',
      companyId: employee.companyId || '',
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}

export function buildEditEmployeeModalPayload(employee: OrgEmployeeLeafCard) {
  return {
    id: employee.id,
    companyId: employee.companyId,
  };
}

/**
 * Overlay visual: never merge employee ids into Hierarchy childrenIds.
 */
export function overlayOrgEmployeeLeaves(
  structuralChildrenIds: Array<string | number>,
  employeeIds: number[],
) {
  return {
    childrenIds: [...structuralChildrenIds],
    overlayIds: employeeIds.map((id) => `employee:${id}`),
  };
}

export function isStructuralHierarchyChildId(id: string | number) {
  return !String(id).startsWith('employee:');
}
