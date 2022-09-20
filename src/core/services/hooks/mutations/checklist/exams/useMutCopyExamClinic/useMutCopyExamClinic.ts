import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export interface ICopyExamRisk {
  companyId?: string;
  fromCompanyId?: string;
}

export async function copyExam(data: ICopyExamRisk, companyId?: string) {
  if (!companyId) return null;

  const response = await api.post<void>(`${ApiRoutesEnum.CLINIC_EXAM}/copy`, {
    ...data,
    companyId,
  });

  return response.data;
}

export function useMutCopyExamClinic() {
  const { enqueueSnackbar } = useSnackbar();
  const { getCompanyId } = useGetCompanyId();

  return useMutation(
    async (data: ICopyExamRisk) => copyExam(data, getCompanyId(data.companyId)),
    {
      onSuccess: async () => {
        queryClient.invalidateQueries([QueryEnum.CLINIC_EXAMS]);

        enqueueSnackbar('Exames importados com sucesso', {
          variant: 'success',
        });
      },
      onError: (error: IErrorResp) => {
        enqueueSnackbar(error.response.data.message, { variant: 'error' });
      },
    },
  );
}
