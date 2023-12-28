import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IExamToRisk } from 'core/interfaces/api/IExam';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export async function deleteExam(id: number, companyId?: string) {
  if (!companyId) return null;

  const response = await api.delete<IExamToRisk>(
    `${ApiRoutesEnum.EXAM_RISK}/${id}/${companyId}`,
  );

  return response.data;
}

export function useMutDeleteExamRisk() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: { id: number; companyId: string }) =>
      deleteExam(data.id, getCompanyId(data.companyId)),
    {
      onSuccess: async (newExam) => {
        if (newExam) {
          queryClient.invalidateQueries([QueryEnum.EXAMS_RISK]);
        }

        enqueueSnackbar('Removido com sucesso', {
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
