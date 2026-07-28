import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IPcmsoExaminingPhysician } from 'core/interfaces/api/IPcmsoExaminingPhysician';
import { api } from 'core/services/apiClient';
import { getPcmsoExaminingPhysiciansPath } from 'core/services/hooks/manager/pcmsoExaminingPhysician/pcmsoExaminingPhysician.routes';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export interface ICreatePcmsoExaminingPhysician {
  companyId?: string;
  workspaceId?: string | null;
  professionalCouncilId: number;
  notes?: string | null;
  sortOrder?: number;
}

export async function createPcmsoExaminingPhysician(
  data: ICreatePcmsoExaminingPhysician,
  companyId?: string,
) {
  if (!companyId) return null;

  const response = await api.post<IPcmsoExaminingPhysician>(
    getPcmsoExaminingPhysiciansPath(companyId, data.workspaceId),
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

export function useMutCreatePcmsoExaminingPhysician() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: ICreatePcmsoExaminingPhysician) =>
      createPcmsoExaminingPhysician(data, getCompanyId(data)),
    {
      onSuccess: async (_resp, variables) => {
        const companyId = getCompanyId(variables);
        await invalidatePcmsoExaminingPhysicianQueries(
          companyId,
          variables.workspaceId,
        );
        enqueueSnackbar('Médico examinador criado com sucesso', {
          variant: 'success',
        });
      },
      onError: (error: IErrorResp) => {
        enqueueSnackbar(
          error.response?.data?.message || 'Erro ao criar médico examinador',
          { variant: 'error' },
        );
      },
    },
  );
}
