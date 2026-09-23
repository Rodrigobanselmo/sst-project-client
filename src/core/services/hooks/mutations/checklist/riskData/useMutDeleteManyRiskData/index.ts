import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IRiskData } from 'core/interfaces/api/IRiskData';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';
import { riskFactorDataByGhoQueryKey } from '../merge-risk-factor-data-cache.util';

export interface IDeleteManyRiskData {
  id?: string;
  companyId?: string;
  riskFactorGroupDataId?: string;
  riskIds?: string[];
  homogeneousGroupIds?: string[];
  ids?: string[];
  workspaceId?: string;
}

export async function deleteManyRiskData(
  data: IDeleteManyRiskData,
  companyId?: string,
  workspaceId?: string,
) {
  if (!companyId) return null;

  data.homogeneousGroupIds = data.homogeneousGroupIds?.map(
    (h) => h.split('//')[0],
  );

  await api.post<IRiskData[][]>(
    `${ApiRoutesEnum.RISK_DATA}/${companyId}/${data.riskFactorGroupDataId}/delete/many`,
    {
      ...data,
      workspaceId: data.workspaceId || workspaceId,
    },
  );

  return {
    companyId,
    riskFactorGroupDataId: data.riskFactorGroupDataId,
    homogeneousGroupIds: data.homogeneousGroupIds,
  };
}

export function useMutDeleteManyRiskData() {
  const { getCompanyId, workspaceId, router } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();
  const operationWorkspaceId =
    workspaceId || (router.query.tabWorkspaceId as string | undefined);

  return useMutation(
    async (data: IDeleteManyRiskData) =>
      deleteManyRiskData(
        data,
        getCompanyId(data),
        data.workspaceId || operationWorkspaceId,
      ),
    {
      onSuccess: async (resp) => {
        queryClient.invalidateQueries([QueryEnum.ENVIRONMENT]);
        queryClient.invalidateQueries([QueryEnum.EXAMS_RISK_DATA]);
        queryClient.invalidateQueries([QueryEnum.CHARACTERIZATION]);
        queryClient.invalidateQueries([QueryEnum.RISK]);

        const companyId = getCompanyId(resp?.companyId);
        if (resp?.homogeneousGroupIds?.length) {
          resp.homogeneousGroupIds.forEach((id) => {
            queryClient.invalidateQueries(
              riskFactorDataByGhoQueryKey({
                companyId,
                riskFactorGroupDataId: resp.riskFactorGroupDataId,
                homogeneousGroupId: id,
                workspaceId: operationWorkspaceId,
              }),
            );
            queryClient.invalidateQueries(
              riskFactorDataByGhoQueryKey({
                companyId,
                riskFactorGroupDataId: resp.riskFactorGroupDataId,
                homogeneousGroupId: id,
                workspaceId: operationWorkspaceId,
                effective: true,
              }),
            );
          });
        } else {
          queryClient.invalidateQueries([QueryEnum.RISK_DATA, companyId], {
            predicate: (query) =>
              !operationWorkspaceId ||
              query.queryKey[query.queryKey.length - 1] ===
                operationWorkspaceId,
          });
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
