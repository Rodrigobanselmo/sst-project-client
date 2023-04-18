import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IExam } from 'core/interfaces/api/IExam';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export interface IDeleteClinicExam {
  id: number;
  companyId?: string;
}

export async function deleteClinicExam(
  data: IDeleteClinicExam,
  companyId?: string,
) {
  if (!companyId) return null;

  const response = await api.delete<IExam>(
    `${ApiRoutesEnum.CLINIC_EXAM}/${companyId}/${data.id}`,
  );

  return response.data;
}

export function useMutDeleteClinicExam() {
  const { enqueueSnackbar } = useSnackbar();
  const { companyId } = useGetCompanyId();

  return useMutation(
    async (data: IDeleteClinicExam) =>
      deleteClinicExam(data, data.companyId || companyId),
    {
      onSuccess: async (newExam) => {
        if (newExam) {
          queryClient.invalidateQueries([QueryEnum.CLINIC_EXAMS]);
        }

        enqueueSnackbar('Exame deletado com sucesso', {
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
