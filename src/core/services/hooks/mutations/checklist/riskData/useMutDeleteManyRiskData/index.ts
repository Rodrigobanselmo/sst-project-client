import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IRiskData } from 'core/interfaces/api/IRiskData';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export interface IDeleteManyRiskData {
  id?: string;
  companyId?: string;
  riskFactorGroupDataId: string;
  riskIds: string[];
  homogeneousGroupIds?: string[];
}

export async function deleteManyRiskData(
  data: IDeleteManyRiskData,
  companyId?: string,
) {
  if (!companyId) return null;

  data.homogeneousGroupIds = data.homogeneousGroupIds?.map(
    (h) => h.split('//')[0],
  );

  await api.post<IRiskData[][]>(
    `${ApiRoutesEnum.RISK_DATA}/${companyId}/${data.riskFactorGroupDataId}/delete/many`,
    data,
  );

  return {
    companyId,
    riskFactorGroupDataId: data.riskFactorGroupDataId,
    homogeneousGroupIds: data.homogeneousGroupIds,
  };
}

export function useMutDeleteManyRiskData() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: IDeleteManyRiskData) =>
      deleteManyRiskData(data, getCompanyId(data)),
    {
      onSuccess: async (resp) => {
        queryClient.invalidateQueries([QueryEnum.ENVIRONMENT]);
        queryClient.invalidateQueries([QueryEnum.EXAMS_RISK_DATA]);
        queryClient.invalidateQueries([QueryEnum.CHARACTERIZATION]);
        queryClient.invalidateQueries([
          QueryEnum.RISK_DATA,
          getCompanyId(resp?.companyId),
          resp?.riskFactorGroupDataId,
        ]);

        if (resp?.homogeneousGroupIds)
          resp.homogeneousGroupIds.forEach((id) =>
            queryClient.invalidateQueries([
              QueryEnum.RISK_DATA,
              getCompanyId(resp?.companyId),
              id,
            ]),
          );

        return resp;
      },
      onError: (error: IErrorResp) => {
        if (error.response?.data)
          enqueueSnackbar(error.response.data.message, { variant: 'error' });
      },
    },
  );
}
