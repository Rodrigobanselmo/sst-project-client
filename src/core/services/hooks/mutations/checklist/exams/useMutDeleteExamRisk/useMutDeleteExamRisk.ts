import { useQueryClient as useTanstackQueryClient } from '@tanstack/react-query';
import { companyExamRiskCoverageQueryKeys } from '@v2/services/medicine/company-exam-risk-coverage/hooks/company-exam-risk-coverage.query-keys';
import { refetchExamRiskLinkStatusQueries } from '@v2/services/medicine/company-exam-risk-link-status/hooks/refetch-exam-risk-link-status';
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
  const cache = useTanstackQueryClient();
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: { id: number; companyId: string }) =>
      deleteExam(data.id, getCompanyId(data.companyId)),
    {
      onSuccess: async (newExam) => {
        if (newExam) {
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
            enqueueSnackbar(
              'Vínculo removido, mas não foi possível atualizar todos os dados. Atualize a tela.',
              { variant: 'warning' },
            );
            return newExam;
          }
        }

        enqueueSnackbar('Removido com sucesso', {
          variant: 'success',
        });
        return newExam;
      },
      onError: (error: IErrorResp) => {
        enqueueSnackbar(
          error?.response?.data?.message ||
            'Não foi possível remover o vínculo.',
          { variant: 'error' },
        );
      },
    },
  );
}
