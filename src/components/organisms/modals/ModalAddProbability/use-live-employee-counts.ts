import { useMemo } from 'react';
import { useQueryClient } from 'react-query';

import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { ICompany } from 'core/interfaces/api/ICompany';
import { useQueryHierarchy } from 'core/services/hooks/queries/useQueryHierarchy';

import { getEmbeddedWorkspaceIdFromTreeId } from 'components/organisms/main/Tree/OrgTree/utils/get-org-workspace-id';

import { ProbabilityCountSource } from './qualitative-probability.util';

type CountGho = {
  id?: string;
  employeeCount?: number;
  workspaceIds?: string[];
};

export function buildProbabilityCountSource(
  gho?: CountGho | null,
): ProbabilityCountSource | undefined {
  if (!gho?.id) return undefined;

  const isHierarchy = !('employeeCount' in gho);
  if (isHierarchy) {
    const workspaceId = getEmbeddedWorkspaceIdFromTreeId(gho.id);
    return {
      hierarchyId: String(gho.id).split('//')[0],
      workspaceIds: workspaceId ? [workspaceId] : [],
    };
  }

  return {
    workspaceIds: gho.workspaceIds ?? [],
    ghoEmployeeCount: gho.employeeCount ?? 0,
  };
}

export const allWorkspacesCountSource: ProbabilityCountSource = {
  allWorkspaces: true,
};

/** Contagens atuais. Enquanto a hierarquia carrega, gho fica null para não sugerir 0. */
export function useLiveEmployeeCounts(source?: ProbabilityCountSource) {
  const { companyId } = useGetCompanyId();
  const queryClient = useQueryClient();
  const hierarchyId = source?.hierarchyId || '';
  const { data: hierarchy, isLoading, isFetched } = useQueryHierarchy(hierarchyId);
  const company = queryClient.getQueryData<ICompany>([QueryEnum.COMPANY, companyId]);
  const workspaceKey = (source?.workspaceIds ?? []).join(',');

  return useMemo(() => {
    if (!source || !company) {
      return { total: null as number | null, gho: null as number | null, ready: false };
    }

    const ids = new Set(source.workspaceIds ?? []);
    const total = (company.workspace ?? []).reduce((acc, workspace) => {
      if (!source.allWorkspaces && !ids.has(workspace.id)) return acc;
      return acc + (workspace.employeeCount ?? 0);
    }, 0);

    if (source.hierarchyId) {
      if (isLoading || !isFetched) {
        return { total: null, gho: null, ready: false };
      }
      return {
        total,
        gho: hierarchy?.employeesCount ?? 0,
        ready: true,
      };
    }

    if (source.ghoEmployeeCount == null) {
      return { total, gho: null, ready: false };
    }

    return { total, gho: source.ghoEmployeeCount, ready: true };
  }, [
    source,
    company,
    hierarchy?.employeesCount,
    isLoading,
    isFetched,
    workspaceKey,
  ]);
}
