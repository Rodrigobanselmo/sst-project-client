import { ViewsDataEnum } from 'components/organisms/main/Tree/OrgTree/components/RiskTool/utils/view-data-type.constant';
import { getEmbeddedWorkspaceIdFromTreeId } from 'components/organisms/main/Tree/OrgTree/utils/get-org-workspace-id';

import { ProbabilityCountSource } from './qualitative-probability.util';

export type ProbabilityEntityRef = {
  id?: string;
  employeeCount?: number;
  workspaceIds?: string[];
};

export type ProbabilityEntityContext = {
  isHierarchy: boolean;
  hierarchyId: string;
  homogeneousGroupId: string;
  workspaceIds: string[];
  employeeCountGho: number;
};

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

export function buildProbabilityCountSource(
  gho?: ProbabilityEntityRef | null,
  viewData?: ViewsDataEnum | string | null,
): ProbabilityCountSource | undefined {
  const ctx = resolveProbabilityEntityContext({ gho, viewData });
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
