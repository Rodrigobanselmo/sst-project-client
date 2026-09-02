import { useQuery } from 'react-query';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IWorkspaceEmergencyPlan } from 'core/interfaces/api/IWorkspaceEmergencyPlan';
import { api } from 'core/services/apiClient';

export const queryWorkspaceEmergencyPlan = async (
  companyId: string,
  workspaceId: string,
) => {
  if (!companyId || !workspaceId) return null;

  const response = await api.get<IWorkspaceEmergencyPlan>(
    ApiRoutesEnum.WORKSPACE_EMERGENCY_PLAN.replace(
      ':companyId',
      companyId,
    ).replace(':workspaceId', workspaceId),
  );

  return response.data;
};

export function useQueryWorkspaceEmergencyPlan(
  workspaceId?: string,
  companyId?: string,
) {
  const { companyId: routeCompanyId } = useGetCompanyId();
  const effectiveCompanyId = companyId || routeCompanyId || '';

  const { data, isLoading, isFetching, isError, error, isSuccess, ...result } =
    useQuery(
      [QueryEnum.WORKSPACE_EMERGENCY_PLAN, effectiveCompanyId, workspaceId],
      () => queryWorkspaceEmergencyPlan(effectiveCompanyId, workspaceId || ''),
      {
        enabled: !!effectiveCompanyId && !!workspaceId,
        staleTime: 1000 * 60 * 5,
      },
    );

  return {
    data: isError ? null : data ?? null,
    isError: !!isError,
    error,
    isLoading: isLoading || isFetching,
    isFetching,
    isSuccess,
    ...result,
  };
}
