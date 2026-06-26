import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export interface IBulkDeleteExamRisk {
  ids: number[];
  companyId?: string;
}

export async function bulkDeleteExamRisk(
  data: IBulkDeleteExamRisk,
  companyId?: string,
) {
  if (!companyId) return null;

  const response = await api.post<{ count: number }>(
    `${ApiRoutesEnum.EXAM_RISK}/bulk/delete/${companyId}`,
    { ids: data.ids, companyId },
  );

  return response.data;
}

export function useMutBulkDeleteExamRisk() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: IBulkDeleteExamRisk) =>
      bulkDeleteExamRisk(data, getCompanyId(data.companyId)),
    {
      onSuccess: async (result) => {
        if (result) {
          queryClient.invalidateQueries([QueryEnum.EXAMS_RISK]);
          queryClient.invalidateQueries([QueryEnum.EXAMS_RISK_DATA]);
          enqueueSnackbar(`${result.count} vínculo(s) removido(s) com sucesso`, {
            variant: 'success',
          });
        }
        return result;
      },
      onError: (error: IErrorResp) => {
        enqueueSnackbar(error.response?.data?.message, { variant: 'error' });
      },
    },
  );
}
