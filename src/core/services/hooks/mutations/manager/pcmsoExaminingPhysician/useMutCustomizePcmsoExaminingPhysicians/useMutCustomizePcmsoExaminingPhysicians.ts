import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IPcmsoExaminingPhysicianResolved } from 'core/interfaces/api/IPcmsoExaminingPhysician';
import { api } from 'core/services/apiClient';
import { getPcmsoExaminingPhysiciansCustomizePath } from 'core/services/hooks/manager/pcmsoExaminingPhysician/pcmsoExaminingPhysician.routes';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export async function customizePcmsoExaminingPhysicians(
  workspaceId: string,
  companyId?: string,
) {
  if (!companyId) return null;

  const response = await api.post<IPcmsoExaminingPhysicianResolved>(
    getPcmsoExaminingPhysiciansCustomizePath(companyId, workspaceId),
  );

  return response.data;
}

export function useMutCustomizePcmsoExaminingPhysicians() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async ({ workspaceId }: { workspaceId: string; companyId?: string }) =>
      customizePcmsoExaminingPhysicians(workspaceId, getCompanyId({ workspaceId })),
    {
      onSuccess: async (_resp, variables) => {
        const companyId = getCompanyId({ workspaceId: variables.workspaceId });
        await queryClient.invalidateQueries([
          QueryEnum.PCMSO_EXAMINING_PHYSICIANS_RESOLVED,
          companyId,
          variables.workspaceId,
        ]);
        await queryClient.invalidateQueries([
          QueryEnum.PCMSO_EXAMINING_PHYSICIANS,
          companyId,
          variables.workspaceId,
        ]);
        enqueueSnackbar('Lista personalizada para este estabelecimento', {
          variant: 'success',
        });
      },
      onError: (error: IErrorResp) => {
        enqueueSnackbar(
          error.response?.data?.message || 'Erro ao personalizar lista',
          { variant: 'error' },
        );
      },
    },
  );
}
