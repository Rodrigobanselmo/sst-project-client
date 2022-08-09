import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IExam } from 'core/interfaces/api/IExam';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export interface ICreateClientExam {
  examId: number;
  companyId: string;
  dueInDays?: number;
  price?: number;
  isScheduled?: boolean;
  observation?: string;
  status?: string;
}

export async function createExam(data: ICreateClientExam, companyId?: string) {
  if (!companyId) return null;

  const response = await api.post<IExam>(`${ApiRoutesEnum.CLINIC_EXAM}`, {
    ...data,
    companyId,
  });

  return response.data;
}

export function useMutUpsertClientExam() {
  const { enqueueSnackbar } = useSnackbar();
  const { companyId } = useGetCompanyId();

  return useMutation(
    async (data: ICreateClientExam) =>
      createExam(data, data.companyId || companyId),
    {
      onSuccess: async (newExam) => {
        if (newExam) {
          queryClient.invalidateQueries([QueryEnum.EXAMS]);
        }

        enqueueSnackbar('Exames inseridos com sucesso', {
          variant: 'success',
        });
        return newExam;
      },
      onError: (error: IErrorResp) => {
        enqueueSnackbar(error.response.data.message, { variant: 'error' });
      },
    },
  );
}
