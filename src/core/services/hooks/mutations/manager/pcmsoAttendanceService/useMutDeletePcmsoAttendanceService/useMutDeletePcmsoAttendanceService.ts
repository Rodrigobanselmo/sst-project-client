import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IPcmsoAttendanceService } from 'core/interfaces/api/IPcmsoAttendanceService';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export async function deletePcmsoAttendanceService(
  id: string,
  workspaceId: string,
  companyId?: string,
) {
  if (!companyId) return null;

  const response = await api.delete<IPcmsoAttendanceService>(
    `${ApiRoutesEnum.PCMSO_ATTENDANCE_SERVICES.replace(':companyId', companyId).replace(
      ':workspaceId',
      workspaceId,
    )}/${id}`,
  );

  return response.data;
}

export function useMutDeletePcmsoAttendanceService() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async ({ id, workspaceId }: { id: string; workspaceId: string }) =>
      deletePcmsoAttendanceService(id, workspaceId, getCompanyId({ workspaceId })),
    {
      onSuccess: async (_resp, variables) => {
        const companyId = getCompanyId({ workspaceId: variables.workspaceId });
        await queryClient.invalidateQueries([
          QueryEnum.PCMSO_ATTENDANCE_SERVICES,
          companyId,
          variables.workspaceId,
        ]);
        enqueueSnackbar('Serviço de atendimento removido com sucesso', {
          variant: 'success',
        });
      },
      onError: (error: IErrorResp) => {
        enqueueSnackbar(error.response?.data?.message || 'Erro ao remover serviço', {
          variant: 'error',
        });
      },
    },
  );
}
