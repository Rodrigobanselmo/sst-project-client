import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IRiskData } from 'core/interfaces/api/IRiskData';
import { IRiskDocInfo } from 'core/interfaces/api/IRiskFactors';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export interface IUpsertRiskDocInfo {
  id?: number;
  riskId: string;
  hierarchyId?: string;
  companyId?: string;
  isAso?: boolean;
  isPGR?: boolean;
  isPCMSO?: boolean;
  isPPP?: boolean;
}

export async function upsertRiskData(
  data: IUpsertRiskDocInfo,
  companyId?: string,
) {
  if (!companyId) return null;

  const response = await api.post<IRiskDocInfo>(
    `${ApiRoutesEnum.RISK_DOC_INFO}`,
    {
      companyId,
      ...data,
    },
  );

  return response.data;
}

export function useMutUpsertRiskDocInfo() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: IUpsertRiskDocInfo) =>
      upsertRiskData(data, getCompanyId(data)),
    {
      onSuccess: async (resp) => {
        if (resp) {
          editHierarchyRiskData(resp);
        }

        return resp;
      },
      onError: (error: IErrorResp) => {
        if (error.response?.data)
          enqueueSnackbar(error.response.data.message, { variant: 'error' });
      },
    },
  );
}

const editHierarchyRiskData = (riskDocInfo: IRiskDocInfo) => {
  // queryClient.invalidateQueries([QueryEnum.RISK, 'pagination']);
  if (!riskDocInfo.hierarchyId) return;

  const actualData = queryClient.getQueryData<IRiskData[]>([
    QueryEnum.RISK_DATA_PLAN,
    riskDocInfo.companyId,
    riskDocInfo.hierarchyId,
    QueryEnum.HIERARCHY,
  ]);

  if (actualData) {
    queryClient.setQueryData(
      [
        QueryEnum.RISK_DATA_PLAN,
        riskDocInfo.companyId,
        riskDocInfo.hierarchyId,
        QueryEnum.HIERARCHY,
      ],
      () => {
        const newData = actualData.map((riskData) => {
          if (riskData.riskId == riskDocInfo.riskId && riskData.riskFactor) {
            riskData.riskFactor.docInfo = [riskDocInfo];
          }

          return riskData;
        });

        return newData as IRiskData[];
      },
    );
  }
};
