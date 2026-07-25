import { IEmployee } from 'core/interfaces/api/IEmployee';

import { nodeTypesConstant } from '../constants/node-type.constant';
import { TreeTypeEnum } from '../enums/tree-type.enums';
import { ITreeMap, ITreeMapObject } from '../interfaces';

export type EmployeeTooltipGroup = {
  key: string;
  title: string;
  count: number;
  employees: IEmployee[];
};

const UNKNOWN_GROUP_KEY = '__unknown__';
const UNKNOWN_GROUP_TITLE = 'OUTROS / SEM GRUPO IDENTIFICADO';

const typeLabel = (type?: TreeTypeEnum) =>
  (type && nodeTypesConstant[type]?.name?.toUpperCase()) || 'GRUPO';

/**
 * Agrupa funcionários pelo descendente imediato do nó visualizado no caminho
 * da lotação (OFFICE) até a raiz — respeita níveis opcionais da árvore real.
 */
export function groupEmployeesByHierarchy(params: {
  employees: IEmployee[];
  viewerNode: ITreeMapObject;
  treeMap: ITreeMap;
  getPathById: (id: string | number) => Array<string | number>;
}): EmployeeTooltipGroup[] {
  const { employees, viewerNode, treeMap, getPathById } = params;
  const isLeafOffice =
    viewerNode.type === TreeTypeEnum.OFFICE ||
    viewerNode.type === TreeTypeEnum.SUB_OFFICE;

  if (isLeafOffice) {
    return [
      {
        key: 'flat',
        title: '',
        count: employees.length,
        employees: [...employees].sort((a, b) =>
          (a.name || '').localeCompare(b.name || '', 'pt-BR'),
        ),
      },
    ];
  }

  const groupsMap = new Map<
    string,
    { title: string; order: number; employees: IEmployee[] }
  >();

  const viewerWorkspaceId =
    viewerNode.type === TreeTypeEnum.WORKSPACE
      ? String(viewerNode.id)
      : String(viewerNode.id).includes('//')
        ? String(viewerNode.id).split('//')[1]
        : '';

  employees.forEach((employee) => {
    const officeId = employee.hierarchyId || employee.hierarchy?.id;
    if (!officeId) {
      pushToGroup(groupsMap, UNKNOWN_GROUP_KEY, UNKNOWN_GROUP_TITLE, 9999, employee);
      return;
    }

    const workspaceId =
      viewerWorkspaceId ||
      findWorkspaceIdForOffice(officeId, treeMap) ||
      '';

    const officeTreeId = workspaceId
      ? `${officeId}//${workspaceId}`
      : findTreeIdByHierarchyId(officeId, treeMap);

    if (!officeTreeId || !treeMap[officeTreeId]) {
      pushToGroup(groupsMap, UNKNOWN_GROUP_KEY, UNKNOWN_GROUP_TITLE, 9999, employee);
      return;
    }

    const path = getPathById(officeTreeId);
    const viewerIndex = path.findIndex(
      (id) => String(id) === String(viewerNode.id),
    );

    if (viewerIndex < 0 || viewerIndex >= path.length - 1) {
      pushToGroup(groupsMap, UNKNOWN_GROUP_KEY, UNKNOWN_GROUP_TITLE, 9999, employee);
      return;
    }

    const groupNodeId = path[viewerIndex + 1];
    const groupNode = treeMap[groupNodeId];
    if (!groupNode) {
      pushToGroup(groupsMap, UNKNOWN_GROUP_KEY, UNKNOWN_GROUP_TITLE, 9999, employee);
      return;
    }

    const order = getSiblingOrder(viewerNode, groupNodeId, treeMap);
    const title = `${typeLabel(groupNode.type)} — ${groupNode.label}`;
    pushToGroup(groupsMap, String(groupNodeId), title, order, employee);
  });

  return [...groupsMap.entries()]
    .map(([key, value]) => ({
      key,
      title: value.title,
      count: value.employees.length,
      employees: value.employees.sort((a, b) =>
        (a.name || '').localeCompare(b.name || '', 'pt-BR'),
      ),
      order: value.order,
    }))
    .sort((a, b) => {
      if (a.key === UNKNOWN_GROUP_KEY) return 1;
      if (b.key === UNKNOWN_GROUP_KEY) return -1;
      if (a.order !== b.order) return a.order - b.order;
      return a.title.localeCompare(b.title, 'pt-BR');
    })
    .map(({ order: _order, ...group }) => group);
}

function pushToGroup(
  groupsMap: Map<string, { title: string; order: number; employees: IEmployee[] }>,
  key: string,
  title: string,
  order: number,
  employee: IEmployee,
) {
  const existing = groupsMap.get(key);
  if (existing) {
    if (!existing.employees.some((item) => item.id === employee.id)) {
      existing.employees.push(employee);
    }
    return;
  }
  groupsMap.set(key, { title, order, employees: [employee] });
}

function getSiblingOrder(
  viewerNode: ITreeMapObject,
  groupNodeId: string | number,
  treeMap: ITreeMap,
) {
  const children = viewerNode.childrenIds || [];
  const index = children.findIndex((id) => String(id) === String(groupNodeId));
  if (index >= 0) return index;

  // Fallback: posição entre irmãos do pai do grupo
  const groupNode = treeMap[groupNodeId];
  if (groupNode?.parentId && treeMap[groupNode.parentId]) {
    const siblings = treeMap[groupNode.parentId].childrenIds || [];
    const siblingIndex = siblings.findIndex(
      (id) => String(id) === String(groupNodeId),
    );
    if (siblingIndex >= 0) return siblingIndex;
  }
  return 500;
}

function findWorkspaceIdForOffice(officeId: string, treeMap: ITreeMap) {
  const match = Object.values(treeMap).find(
    (node) =>
      String(node.id).startsWith(`${officeId}//`) &&
      (node.type === TreeTypeEnum.OFFICE ||
        node.type === TreeTypeEnum.SUB_OFFICE),
  );
  return match ? String(match.id).split('//')[1] : '';
}

function findTreeIdByHierarchyId(hierarchyId: string, treeMap: ITreeMap) {
  const match = Object.values(treeMap).find(
    (node) => String(node.id).split('//')[0] === hierarchyId,
  );
  return match ? String(match.id) : '';
}
