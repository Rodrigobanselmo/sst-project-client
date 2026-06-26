import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export interface IBulkExamRiskPatch {
  isMale?: boolean;
  isFemale?: boolean;
  isPeriodic?: boolean;
  isChange?: boolean;
  isAdmission?: boolean;
  isReturn?: boolean;
  isDismissal?: boolean;
  validityInMonths?: number | null;
  considerBetweenDays?: number | null;
  fromAge?: number | null;
  toAge?: number | null;
  minRiskDegree?: number | null;
  minRiskDegreeQuantity?: number | null;
}

export interface IBulkUpdateExamRisk {
  ids: number[];
  patch: IBulkExamRiskPatch;
  companyId?: string;
}

export async function bulkUpdateExamRisk(
  data: IBulkUpdateExamRisk,
  companyId?: string,
) {
  if (!companyId) return null;

  const response = await api.post<{ count: number }>(
    `${ApiRoutesEnum.EXAM_RISK}/bulk/update/${companyId}`,
    { ids: data.ids, patch: data.patch, companyId },
  );

  return response.data;
}

export function useMutBulkUpdateExamRisk() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: IBulkUpdateExamRisk) =>
      bulkUpdateExamRisk(data, getCompanyId(data.companyId)),
    {
      onSuccess: async (result) => {
        if (result) {
          queryClient.invalidateQueries([QueryEnum.EXAMS_RISK]);
          queryClient.invalidateQueries([QueryEnum.EXAMS_RISK_DATA]);
          enqueueSnackbar(
            `${result.count} vínculo(s) atualizado(s) com sucesso`,
            { variant: 'success' },
          );
        }
        return result;
      },
      onError: (error: IErrorResp) => {
        if (error.response?.status == 400)
          enqueueSnackbar('Você não tem permissão para editar esses dados', {
            variant: 'error',
          });
        else enqueueSnackbar(error.response?.data?.message, { variant: 'error' });
      },
    },
  );
}
