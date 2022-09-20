import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IExam, IExamToRisk } from 'core/interfaces/api/IExam';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export interface ICopyExamRisk {
  companyId?: string;
  fromCompanyId?: string;
}

export async function copyExam(data: ICopyExamRisk, companyId?: string) {
  if (!companyId) return null;

  const response = await api.post<void>(`${ApiRoutesEnum.EXAM_RISK}/copy`, {
    ...data,
    companyId,
  });

  return response.data;
}

export function useMutCopyExamRisk() {
  const { enqueueSnackbar } = useSnackbar();
  const { getCompanyId } = useGetCompanyId();

  return useMutation(
    async (data: ICopyExamRisk) => copyExam(data, getCompanyId(data.companyId)),
    {
      onSuccess: async () => {
        queryClient.invalidateQueries([QueryEnum.EXAMS_RISK]);

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
