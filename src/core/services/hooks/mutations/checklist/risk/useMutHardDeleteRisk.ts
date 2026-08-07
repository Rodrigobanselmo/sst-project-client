import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { QueryEnum } from 'core/enums/query.enums';
import { queryClient } from 'core/services/queryClient';

import {
  fetchRiskDeletionImpact,
  hardDeleteRiskFactor,
  RiskDeletionImpactReport,
} from './riskHardDelete.service';

export function useMutFetchRiskDeletionImpact() {
  return useMutation((riskId: string) => fetchRiskDeletionImpact(riskId));
}

export function useMutHardDeleteRisk() {
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    ({
      riskId,
      confirmation,
    }: {
      riskId: string;
      confirmation: string;
    }) => hardDeleteRiskFactor(riskId, confirmation),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([QueryEnum.RISK]);
        enqueueSnackbar('Fator de risco excluído definitivamente.', {
          variant: 'success',
        });
      },
      onError: (err: any) => {
        const message =
          err?.response?.data?.message ||
          'Não foi possível excluir o fator de risco.';
        enqueueSnackbar(
          Array.isArray(message) ? message.join(' ') : String(message),
          { variant: 'error' },
        );
      },
    },
  );
}

export type { RiskDeletionImpactReport };
