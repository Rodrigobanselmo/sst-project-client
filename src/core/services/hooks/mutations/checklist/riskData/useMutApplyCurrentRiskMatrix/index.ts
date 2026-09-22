import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export type IApplyCurrentRiskMatrixPayload = {
  riskFactorGroupDataId: string;
  homogeneousGroupId: string;
  companyId?: string;
};

export type IApplyCurrentRiskMatrixToGsePayload = {
  riskFactorGroupDataId: string;
  homogeneousGroupId: string;
  workspaceId: string;
  companyId?: string;
};

export type IApplyCurrentRiskMatrixResponse = {
  updated: number;
  skipped: number;
  items: Array<{
    riskFactorDataId: string;
    status: 'updated' | 'skipped';
    reason?: string;
  }>;
};

export async function applyCurrentRiskMatrix(
  data: IApplyCurrentRiskMatrixPayload,
) {
  const response = await api.post<IApplyCurrentRiskMatrixResponse>(
    ApiRoutesEnum.RISK_DATA_APPLY_CURRENT_MATRIX,
    data,
  );
  return response.data;
}

export async function applyCurrentRiskMatrixToGse(
  data: IApplyCurrentRiskMatrixToGsePayload,
) {
  const response = await api.post<IApplyCurrentRiskMatrixResponse>(
    ApiRoutesEnum.RISK_DATA_APPLY_CURRENT_MATRIX_GSE,
    data,
  );
  return response.data;
}

function useApplyMatrixSuccessHandler() {
  const { companyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return {
    companyId,
    onSuccess: (res: IApplyCurrentRiskMatrixResponse) => {
      queryClient.invalidateQueries([QueryEnum.RISK_DATA, companyId]);
      queryClient.invalidateQueries([QueryEnum.CHARACTERIZATION]);
      enqueueSnackbar(
        res.updated > 0
          ? `Matriz aplicada: ${res.updated} risco(s) atualizado(s), ${res.skipped} ignorado(s).`
          : `Nenhum risco precisou ser atualizado (${res.skipped} ignorado(s)).`,
        { variant: res.updated > 0 ? 'success' : 'info' },
      );
    },
    onError: (error: IErrorResp) => {
      if (error.response?.data?.message)
        enqueueSnackbar(error.response.data.message, { variant: 'error' });
      else
        enqueueSnackbar('Não foi possível aplicar a matriz de risco.', {
          variant: 'error',
        });
    },
  };
}

export function useMutApplyCurrentRiskMatrix() {
  const { onSuccess, onError } = useApplyMatrixSuccessHandler();

  return useMutation(
    (data: IApplyCurrentRiskMatrixPayload) => applyCurrentRiskMatrix(data),
    { onSuccess, onError },
  );
}

export function useMutApplyCurrentRiskMatrixToGse() {
  const { onSuccess, onError } = useApplyMatrixSuccessHandler();

  return useMutation(
    (data: IApplyCurrentRiskMatrixToGsePayload) =>
      applyCurrentRiskMatrixToGse(data),
    { onSuccess, onError },
  );
}
