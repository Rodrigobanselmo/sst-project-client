import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export type ISyncDerivedMeasuresFromPlanPayload = {
  riskFactorGroupDataId: string;
  workspaceId: string;
  /** Deve ser a mesma empresa dos dados de risco (alinhado ao GET `/risk-group-data/:companyId`). */
  companyId?: string;
};

export type ISyncDerivedMeasuresFromPlanResponse = {
  created: number;
  skipped: number;
  processedRiskFactorDataRecIds: string[];
};

export async function syncDerivedMeasuresFromPlan(
  data: ISyncDerivedMeasuresFromPlanPayload,
) {
  const response = await api.post<ISyncDerivedMeasuresFromPlanResponse>(
    ApiRoutesEnum.RISK_DATA_SYNC_DERIVED_FROM_PLAN,
    data,
  );
  return response.data;
}

export function useMutSyncDerivedMeasuresFromPlan() {
  const { companyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    (data: ISyncDerivedMeasuresFromPlanPayload) =>
      syncDerivedMeasuresFromPlan(data),
    {
      onSuccess: (res) => {
        queryClient.invalidateQueries([QueryEnum.RISK_DATA, companyId]);
        queryClient.invalidateQueries([QueryEnum.RISK_DATA_PLAN]);
        queryClient.invalidateQueries([QueryEnum.CHARACTERIZATION]);
        enqueueSnackbar(
          `Sincronizado: ${res.created} medida(s) derivada(s) criada(s), ${res.skipped} ignorada(s).`,
          { variant: res.created > 0 ? 'success' : 'info' },
        );
      },
      onError: (error: IErrorResp) => {
        if (error.response?.data?.message)
          enqueueSnackbar(error.response.data.message, { variant: 'error' });
        else enqueueSnackbar('Não foi possível sincronizar com o plano.', {
          variant: 'error',
        });
      },
    },
  );
}
