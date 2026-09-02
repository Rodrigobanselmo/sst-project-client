import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { refreshToken } from 'core/contexts/AuthContext';
import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IWorkspaceEmergencyPlan } from 'core/interfaces/api/IWorkspaceEmergencyPlan';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export interface IUploadWorkspaceEmergencyMap {
  file: File;
  workspaceId: string;
  companyId?: string;
  title?: string;
  caption?: string;
  sortOrder?: number;
}

export async function uploadWorkspaceEmergencyMap(
  data: IUploadWorkspaceEmergencyMap,
  companyId: string,
) {
  const formData = new FormData();
  formData.append('file', data.file);
  if (data.title) formData.append('title', data.title);
  if (data.caption) formData.append('caption', data.caption);
  if (typeof data.sortOrder === 'number') {
    formData.append('sortOrder', String(data.sortOrder));
  }

  const { token, api } = await refreshToken();

  const path = ApiRoutesEnum.WORKSPACE_EMERGENCY_PLAN_MAPS.replace(
    ':companyId',
    companyId,
  ).replace(':workspaceId', data.workspaceId);

  const response = await api.post<IWorkspaceEmergencyPlan>(path, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export function useMutUploadWorkspaceEmergencyMap() {
  const { enqueueSnackbar } = useSnackbar();
  const { getCompanyId } = useGetCompanyId();

  return useMutation(
    async (data: IUploadWorkspaceEmergencyMap) =>
      uploadWorkspaceEmergencyMap(data, getCompanyId(data)),
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
        }

        enqueueSnackbar('Mapa de emergência enviado', {
          variant: 'success',
        });
        return resp;
      },
      onError: (error: IErrorResp) => {
        enqueueSnackbar(
          error.response?.data?.message ||
            'Erro ao enviar o mapa de emergência',
          { variant: 'error' },
        );
      },
    },
  );
}
