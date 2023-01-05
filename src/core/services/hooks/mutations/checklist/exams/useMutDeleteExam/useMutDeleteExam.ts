import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IExam } from 'core/interfaces/api/IExam';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export async function deleteExam(id: number, companyId?: string) {
  const response = await api.delete<IExam>(
    `${ApiRoutesEnum.EXAM}/${id}/${companyId}`,
  );

  return response.data;
}

export function useMutDeleteExam() {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useGetCompanyId();

  return useMutation(async (id: number) => deleteExam(id, user?.companyId), {
    onSuccess: async (newExam) => {
      queryClient.invalidateQueries([QueryEnum.EXAMS]);

      enqueueSnackbar('Exame deletada com sucesso', {
        variant: 'success',
      });
      return newExam;
    },
    onError: (error: IErrorResp) => {
      if (error.response.status == 400)
        enqueueSnackbar('Você não tem permissão para deletar esse dado', {
          variant: 'error',
        });
      else {
        enqueueSnackbar(error.response.data.message, { variant: 'error' });
      }
    },
  });
}
