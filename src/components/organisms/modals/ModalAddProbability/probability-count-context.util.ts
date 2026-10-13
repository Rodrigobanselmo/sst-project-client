import { ViewsDataEnum } from 'components/organisms/main/Tree/OrgTree/components/RiskTool/utils/view-data-type.constant';
import { getEmbeddedWorkspaceIdFromTreeId } from 'components/organisms/main/Tree/OrgTree/utils/get-org-workspace-id';

import { ProbabilityCountSource } from './qualitative-probability.util';

export type ProbabilityEntityRef = {
  id?: string;
  employeeCount?: number;
  employeeCountByWorkspace?: Record<string, number>;
  workspaceIds?: string[];
};

export type ProbabilityEntityContext = {
  isHierarchy: boolean;
  hierarchyId: string;
  homogeneousGroupId: string;
  workspaceIds: string[];
  /** Null quando não há contagem confiável para o estabelecimento do cabeçalho. */
  employeeCountGho: number | null;
};

/**
 * Com estabelecimento no cabeçalho, o GSE conta só os trabalhadores daquele
 * estabelecimento. Sem contagem por estabelecimento, só o GSE de
 * estabelecimento único pode usar a contagem global; nos demais casos o
 * resultado é null para não sugerir nem gravar com dados de outro estabelecimento.
 */
function resolveGhoCountsForHeader(
  gho: ProbabilityEntityRef,
  headerWorkspaceId: string,
): { workspaceIds: string[]; employeeCountGho: number | null } {
  const ghoWorkspaceIds = Array.isArray(gho.workspaceIds)
    ? gho.workspaceIds
    : [];
  if (!ghoWorkspaceIds.includes(headerWorkspaceId)) {
    return { workspaceIds: [headerWorkspaceId], employeeCountGho: null };
  }

  const byWorkspace = gho.employeeCountByWorkspace?.[headerWorkspaceId];
  if (typeof byWorkspace === 'number') {
    return { workspaceIds: [headerWorkspaceId], employeeCountGho: byWorkspace };
  }

  const singleWorkspace = new Set(ghoWorkspaceIds).size === 1;
  return {
    workspaceIds: [headerWorkspaceId],
    employeeCountGho:
      singleWorkspace && typeof gho.employeeCount === 'number'
        ? gho.employeeCount
        : null,
  };
}

/**
 * Contexto de hierarquia no estimador segue o fluxo da tela (`riskAdd.viewData`),
 * igual ao upsert de risk-data. Não usar presença de `employeeCount` — GSE
 * embutido via findById pode omitir a chave e não é hierarquia.
 */
export function isProbabilityHierarchyContext(params: {
  viewData?: ViewsDataEnum | string | null;
}): boolean {
  return params.viewData === ViewsDataEnum.HIERARCHY;
}

export function resolveProbabilityEntityContext(params: {
  gho?: ProbabilityEntityRef | null;
  viewData?: ViewsDataEnum | string | null;
  headerWorkspaceId?: string | null;
}): ProbabilityEntityContext | null {
  if (!params.gho?.id) return null;

  const isHierarchy = isProbabilityHierarchyContext({
    viewData: params.viewData,
  });
  const baseId = String(params.gho.id).split('//')[0];

  if (isHierarchy) {
    const workspaceId = getEmbeddedWorkspaceIdFromTreeId(params.gho.id);
    return {
      isHierarchy: true,
      hierarchyId: baseId,
      homogeneousGroupId: '',
      workspaceIds: workspaceId ? [workspaceId] : [],
      employeeCountGho: 0,
    };
  }

  if (params.headerWorkspaceId) {
    return {
      isHierarchy: false,
      hierarchyId: '',
      homogeneousGroupId: baseId,
      ...resolveGhoCountsForHeader(params.gho, params.headerWorkspaceId),
    };
  }

  return {
    isHierarchy: false,
    hierarchyId: '',
    homogeneousGroupId: baseId,
    workspaceIds: Array.isArray(params.gho.workspaceIds)
      ? params.gho.workspaceIds
      : [],
    employeeCountGho: params.gho.employeeCount ?? 0,
  };
}

export function sumWorkspaceEmployees(params: {
  workspaces?: { id: string; employeeCount?: number | null }[] | null;
  workspaceIds?: string[] | null;
  allWorkspaces?: boolean;
}): number {
  const ids = new Set(params.workspaceIds ?? []);
  return (params.workspaces ?? []).reduce((acc, workspace) => {
    if (!params.allWorkspaces && !ids.has(workspace.id)) return acc;
    return acc + (workspace.employeeCount ?? 0);
  }, 0);
}

export function buildProbabilityCountSource(
  gho?: ProbabilityEntityRef | null,
  viewData?: ViewsDataEnum | string | null,
  headerWorkspaceId?: string | null,
): ProbabilityCountSource | undefined {
  const ctx = resolveProbabilityEntityContext({
    gho,
    viewData,
    headerWorkspaceId,
  });
  if (!ctx) return undefined;

  if (ctx.isHierarchy) {
    return {
      hierarchyId: ctx.hierarchyId,
      workspaceIds: ctx.workspaceIds,
    };
  }

  return {
    workspaceIds: ctx.workspaceIds,
    ghoEmployeeCount: ctx.employeeCountGho,
    homogeneousGroupId: ctx.homogeneousGroupId,
  };
}
