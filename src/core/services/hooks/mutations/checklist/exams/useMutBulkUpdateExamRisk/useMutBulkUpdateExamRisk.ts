import { useQueryClient as useTanstackQueryClient } from '@tanstack/react-query';
import { companyExamRiskCoverageQueryKeys } from '@v2/services/medicine/company-exam-risk-coverage/hooks/company-exam-risk-coverage.query-keys';
import { refetchExamRiskLinkStatusQueries } from '@v2/services/medicine/company-exam-risk-link-status/hooks/refetch-exam-risk-link-status';
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

  const response = await api.post<{ count: number; warning?: string }>(
    `${ApiRoutesEnum.EXAM_RISK}/bulk/update/${companyId}`,
    { ids: data.ids, patch: data.patch, companyId },
  );

  return response.data;
}

export function useMutBulkUpdateExamRisk() {
  const cache = useTanstackQueryClient();
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: IBulkUpdateExamRisk) =>
      bulkUpdateExamRisk(data, getCompanyId(data.companyId)),
    {
      onSuccess: async (result) => {
        if (result) {
          let refreshFailed = false;
          try {
            await Promise.all([
              queryClient.invalidateQueries([QueryEnum.EXAMS_RISK]),
              queryClient.invalidateQueries([QueryEnum.EXAMS_RISK_DATA]),
              queryClient.invalidateQueries(['exam-risk-inline-links']),
              refetchExamRiskLinkStatusQueries(),
              cache.invalidateQueries(
                { queryKey: companyExamRiskCoverageQueryKeys.all() },
                { throwOnError: true },
              ),
              cache.invalidateQueries(
                { queryKey: ['exam-risk-parameter-reviews'] },
                { throwOnError: true },
              ),
            ]);
          } catch {
            refreshFailed = true;
            enqueueSnackbar(
              'Vínculos atualizados, mas não foi possível atualizar todos os dados da tela. Atualize a visualização.',
              { variant: 'warning' },
            );
          }
          if (result.warning || !refreshFailed)
            enqueueSnackbar(
              result.warning ||
                `${result.count} vínculo(s) atualizado(s) com sucesso`,
              { variant: result.warning ? 'warning' : 'success' },
            );
        }
        return result;
      },
      onError: (error: IErrorResp) => {
        enqueueSnackbar(
          error.response?.data?.message ||
            'Não foi possível atualizar os vínculos.',
          { variant: 'error' },
        );
      },
    },
  );
}
