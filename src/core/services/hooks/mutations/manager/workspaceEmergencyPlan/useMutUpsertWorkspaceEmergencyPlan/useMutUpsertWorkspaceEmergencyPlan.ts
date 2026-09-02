import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import {
  IUpsertWorkspaceEmergencyPlan,
  IWorkspaceEmergencyPlan,
} from 'core/interfaces/api/IWorkspaceEmergencyPlan';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export interface IUpsertWorkspaceEmergencyPlanMutation
  extends IUpsertWorkspaceEmergencyPlan {
  workspaceId: string;
  companyId?: string;
}

export async function upsertWorkspaceEmergencyPlan(
  data: IUpsertWorkspaceEmergencyPlanMutation,
  companyId?: string,
) {
  if (!companyId) return null;

  const { workspaceId, companyId: _companyId, ...payload } = data;

  const response = await api.put<IWorkspaceEmergencyPlan>(
    ApiRoutesEnum.WORKSPACE_EMERGENCY_PLAN.replace(
      ':companyId',
      companyId,
    ).replace(':workspaceId', workspaceId),
    payload,
  );

  return response.data;
}

export function useMutUpsertWorkspaceEmergencyPlan() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: IUpsertWorkspaceEmergencyPlanMutation) =>
      upsertWorkspaceEmergencyPlan(data, getCompanyId(data)),
    {
      onSuccess: async (resp, variables) => {
        const companyId = getCompanyId(variables);

        if (resp) {
          queryClient.setQueryData(
            [
              QueryEnum.WORKSPACE_EMERGENCY_PLAN,
              companyId,
              variables.workspaceId,
            ],
            resp,
          );
        } else {
          await queryClient.invalidateQueries([
            QueryEnum.WORKSPACE_EMERGENCY_PLAN,
            companyId,
            variables.workspaceId,
          ]);
        }

        enqueueSnackbar('Plano de atendimento a emergência salvo', {
          variant: 'success',
        });
      },
      onError: (error: IErrorResp) => {
        enqueueSnackbar(
          error.response?.data?.message ||
            'Erro ao salvar o plano de atendimento a emergência',
          { variant: 'error' },
        );
      },
    },
  );
}
