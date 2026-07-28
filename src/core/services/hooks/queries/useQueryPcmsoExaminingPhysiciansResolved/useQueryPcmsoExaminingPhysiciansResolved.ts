import { useQuery } from 'react-query';

import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IPcmsoExaminingPhysicianResolved } from 'core/interfaces/api/IPcmsoExaminingPhysician';
import { api } from 'core/services/apiClient';
import { getPcmsoExaminingPhysiciansResolvedPath } from 'core/services/hooks/manager/pcmsoExaminingPhysician/pcmsoExaminingPhysician.routes';

export const queryPcmsoExaminingPhysiciansResolved = async (
  companyId: string,
  workspaceId: string,
) => {
  if (!companyId || !workspaceId) {
    return { source: 'COMPANY' as const, items: [] };
  }

  const response = await api.get<IPcmsoExaminingPhysicianResolved>(
    getPcmsoExaminingPhysiciansResolvedPath(companyId, workspaceId),
  );

  return response.data;
};

export function useQueryPcmsoExaminingPhysiciansResolved(
  companyId?: string,
  workspaceId?: string,
) {
  const { companyId: routeCompanyId } = useGetCompanyId();
  const effectiveCompanyId = companyId || routeCompanyId || '';

  const { data, isLoading, isFetching, isError, error, ...result } = useQuery(
    [
      QueryEnum.PCMSO_EXAMINING_PHYSICIANS_RESOLVED,
      effectiveCompanyId,
      workspaceId,
    ],
    () =>
      queryPcmsoExaminingPhysiciansResolved(
        effectiveCompanyId,
        workspaceId || '',
      ),
    {
      enabled: !!effectiveCompanyId && !!workspaceId,
      staleTime: 1000 * 60 * 5,
    },
  );

  return {
    source: data?.source ?? 'COMPANY',
    items: isError ? [] : data?.items ?? [],
    isError: !!isError,
    error,
    isLoading: isLoading || isFetching,
    isFetching,
    ...result,
  };
}
