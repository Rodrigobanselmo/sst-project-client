import dayjs from 'dayjs';
import { EmployeeHierarchyMotiveTypeEnum } from 'project/enum/employee-hierarchy-motive.enum';

import { HierarchyEnum } from 'core/enums/hierarchy.enum';

export type ResolvedWorkspaceLink = { id: string; name: string };

export type CurrentEmployeeAllocation = {
  hierarchyId?: string;
  officeName?: string;
  sectorName?: string;
  developedRoleNames: string[];
  workspaces: ResolvedWorkspaceLink[];
  isSharedAcrossWorkspaces: boolean;
  lastStartDate?: Date | string | null;
};

type HierarchyLike = {
  id?: string;
  name?: string;
  type?: string;
  parentId?: string | null;
  workspaceIds?: string[] | null;
  workspaces?: Array<{ id?: string; name?: string }> | null;
  parents?: Array<{ id?: string; name?: string; type?: string }> | null;
};

type EmployeeLike = {
  hierarchyId?: string | null;
  hierarchy?: HierarchyLike | null;
  sectorHierarchy?: HierarchyLike | null;
  subOffices?: Array<{ name?: string }> | null;
  hierarchyHistory?: Array<{
    startDate?: Date | string | null;
    motive?: string;
  }> | null;
};

export type EmployeeHierarchyTransferPayload = {
  employeeId: number;
  hierarchyId: string;
  startDate: string;
  motive: EmployeeHierarchyMotiveTypeEnum;
  workspaceId: string;
  subOfficeId?: string;
};

const TRANSFER_ERROR_FALLBACK = 'Não foi possível alterar a lotação';

function findSectorName(
  node: HierarchyLike | undefined,
  hierarchyTree?: Record<string, HierarchyLike> | null,
  sectorHierarchy?: HierarchyLike | null,
) {
  if (sectorHierarchy?.name) return sectorHierarchy.name;

  const fromParents = node?.parents?.find(
    (parent) => parent.type === HierarchyEnum.SECTOR,
  )?.name;
  if (fromParents) return fromParents;

  if (!hierarchyTree) return undefined;

  let current = node;
  const visited = new Set<string>();
  while (current?.parentId && !visited.has(current.parentId)) {
    visited.add(current.parentId);
    current = hierarchyTree[current.parentId];
    if (current?.type === HierarchyEnum.SECTOR) return current.name;
  }

  return undefined;
}

function resolveWorkspaceLinks(
  node: HierarchyLike | undefined,
  companyWorkspaces?: Array<{ id: string; name: string }> | null,
): ResolvedWorkspaceLink[] {
  const fromIds = Array.isArray(node?.workspaceIds) ? node.workspaceIds : [];
  const fromRelation = Array.isArray(node?.workspaces)
    ? node.workspaces.map((workspace) => workspace?.id).filter(Boolean)
    : [];
  const ids = [...new Set([...(fromIds as string[]), ...(fromRelation as string[])])];
  const companyById = new Map(
    (companyWorkspaces || []).map((workspace) => [workspace.id, workspace.name]),
  );
  const nodeById = new Map(
    (node?.workspaces || [])
      .filter((workspace) => workspace?.id)
      .map((workspace) => [workspace.id as string, workspace.name || '']),
  );

  return ids.map((id) => ({
    id,
    name: companyById.get(id) || nodeById.get(id) || id,
  }));
}

export function getLatestHierarchyMovementStartDate(
  history?: Array<{ startDate?: Date | string | null }> | null,
): Date | string | null {
  if (!Array.isArray(history) || history.length === 0) return null;

  return history.reduce<Date | string | null>((latest, item) => {
    if (!item?.startDate) return latest;
    if (!latest) return item.startDate;
    return dayjs(item.startDate).isAfter(dayjs(latest)) ? item.startDate : latest;
  }, null);
}

export function resolveCurrentEmployeeAllocation(params: {
  employee?: EmployeeLike | null;
  hierarchyTree?: Record<string, HierarchyLike> | null;
  companyWorkspaces?: Array<{ id: string; name: string }> | null;
  lastStartDate?: Date | string | null;
}): CurrentEmployeeAllocation {
  const hierarchyId =
    params.employee?.hierarchyId || params.employee?.hierarchy?.id || undefined;
  const node =
    (hierarchyId && params.hierarchyTree?.[hierarchyId]) ||
    params.employee?.hierarchy ||
    undefined;
  const workspaces = resolveWorkspaceLinks(node, params.companyWorkspaces);

  return {
    hierarchyId,
    officeName: node?.name,
    sectorName: findSectorName(
      node,
      params.hierarchyTree,
      params.employee?.sectorHierarchy,
    ),
    developedRoleNames: (params.employee?.subOffices || [])
      .map((office) => office?.name)
      .filter((name): name is string => Boolean(name)),
    workspaces,
    isSharedAcrossWorkspaces: workspaces.length > 1,
    lastStartDate:
      params.lastStartDate ||
      getLatestHierarchyMovementStartDate(params.employee?.hierarchyHistory),
  };
}

export function suggestDestinationWorkspaceId(params: {
  currentWorkspaces: Array<{ id: string }>;
  companyWorkspaces: Array<{ id: string }>;
}) {
  if (params.companyWorkspaces.length === 1) {
    return params.companyWorkspaces[0].id;
  }
  if (params.currentWorkspaces.length === 1) {
    return params.currentWorkspaces[0].id;
  }
  return undefined;
}

export function buildEmployeeHierarchyTransferPayload(input: {
  employeeId?: number;
  hierarchyId?: string;
  subOfficeId?: string;
  startDate?: Date | string | null;
  motive?: string;
  workspaceId?: string;
}): EmployeeHierarchyTransferPayload | null {
  if (!input.employeeId || !input.hierarchyId || !input.startDate) return null;
  if (!input.workspaceId || !input.motive) return null;

  const payload: EmployeeHierarchyTransferPayload = {
    employeeId: input.employeeId,
    hierarchyId: input.hierarchyId,
    startDate: dayjs(input.startDate).format('DD/MM/YYYY'),
    motive: input.motive as EmployeeHierarchyMotiveTypeEnum,
    workspaceId: input.workspaceId,
  };

  if (input.subOfficeId) payload.subOfficeId = input.subOfficeId;
  return payload;
}

export function getEmployeeTransferErrorMessage(error: unknown): string {
  const responseMessage = (error as { response?: { data?: { message?: unknown } } })
    ?.response?.data?.message;
  const message = Array.isArray(responseMessage)
    ? responseMessage.filter(Boolean).join(' ')
    : responseMessage;

  if (typeof message !== 'string' || !message.trim()) {
    return TRANSFER_ERROR_FALLBACK;
  }
  if (/histórico bagunçado/i.test(message)) {
    return TRANSFER_ERROR_FALLBACK;
  }
  return message;
}
