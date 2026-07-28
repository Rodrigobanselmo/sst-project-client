import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IPcmsoExaminingPhysician } from 'core/interfaces/api/IPcmsoExaminingPhysician';
import { api } from 'core/services/apiClient';
import { getPcmsoExaminingPhysiciansPath } from 'core/services/hooks/manager/pcmsoExaminingPhysician/pcmsoExaminingPhysician.routes';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export async function deletePcmsoExaminingPhysician(
  id: string,
  workspaceId: string | null | undefined,
  companyId?: string,
) {
  if (!companyId) return null;

  const response = await api.delete<IPcmsoExaminingPhysician>(
    `${getPcmsoExaminingPhysiciansPath(companyId, workspaceId)}/${id}`,
  );

  return response.data;
}

async function invalidatePcmsoExaminingPhysicianQueries(
  companyId: string,
  workspaceId?: string | null,
) {
  await queryClient.invalidateQueries([
    QueryEnum.PCMSO_EXAMINING_PHYSICIANS,
    companyId,
    workspaceId ?? null,
  ]);

  if (workspaceId) {
    await queryClient.invalidateQueries([
      QueryEnum.PCMSO_EXAMINING_PHYSICIANS_RESOLVED,
      companyId,
      workspaceId,
    ]);
  }
}

export function useMutDeletePcmsoExaminingPhysician() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async ({
      id,
      workspaceId,
    }: {
      id: string;
      workspaceId?: string | null;
    }) => deletePcmsoExaminingPhysician(id, workspaceId, getCompanyId({ workspaceId })),
    {
      onSuccess: async (_resp, variables) => {
        const companyId = getCompanyId({ workspaceId: variables.workspaceId });
        await invalidatePcmsoExaminingPhysicianQueries(
          companyId,
          variables.workspaceId,
        );
        enqueueSnackbar('Médico examinador removido com sucesso', {
          variant: 'success',
        });
      },
      onError: (error: IErrorResp) => {
        enqueueSnackbar(
          error.response?.data?.message || 'Erro ao remover médico examinador',
          { variant: 'error' },
        );
      },
    },
  );
}
