import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';
import { StatusEnum } from 'project/enum/status.enum';

import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IPcmsoExaminingPhysician } from 'core/interfaces/api/IPcmsoExaminingPhysician';
import { api } from 'core/services/apiClient';
import { getPcmsoExaminingPhysiciansPath } from 'core/services/hooks/manager/pcmsoExaminingPhysician/pcmsoExaminingPhysician.routes';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export interface IUpdatePcmsoExaminingPhysician {
  id: string;
  companyId?: string;
  workspaceId?: string | null;
  professionalCouncilId?: number;
  notes?: string | null;
  sortOrder?: number;
  status?: StatusEnum;
}

export async function updatePcmsoExaminingPhysician(
  data: IUpdatePcmsoExaminingPhysician,
  companyId?: string,
) {
  if (!companyId) return null;

  const response = await api.patch<IPcmsoExaminingPhysician>(
    `${getPcmsoExaminingPhysiciansPath(companyId, data.workspaceId)}/${data.id}`,
    {
      ...data,
      companyId,
    },
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

export function useMutUpdatePcmsoExaminingPhysician() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: IUpdatePcmsoExaminingPhysician) =>
      updatePcmsoExaminingPhysician(data, getCompanyId(data)),
    {
      onSuccess: async (_resp, variables) => {
        const companyId = getCompanyId(variables);
        await invalidatePcmsoExaminingPhysicianQueries(
          companyId,
          variables.workspaceId,
        );
        enqueueSnackbar('Médico examinador atualizado com sucesso', {
          variant: 'success',
        });
      },
      onError: (error: IErrorResp) => {
        enqueueSnackbar(
          error.response?.data?.message || 'Erro ao atualizar médico examinador',
          { variant: 'error' },
        );
      },
    },
  );
}
