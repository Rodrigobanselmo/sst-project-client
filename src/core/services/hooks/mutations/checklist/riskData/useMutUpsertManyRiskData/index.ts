import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { HomoTypeEnum } from 'core/enums/homo-type.enum';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IRiskData } from 'core/interfaces/api/IRiskData';
import { api } from 'core/services/apiClient';
import { sortRiskData } from 'core/services/hooks/queries/useQueryRiskData';
import { queryClient } from 'core/services/queryClient';
import { sortString } from 'core/utils/sorts/string.sort';

import { IErrorResp } from '../../../../../errors/types';
import { riskFactorDataByGhoQueryKey, riskFactorDataByGhoQueryKeyPrefix } from '../merge-risk-factor-data-cache.util';

export const isEmptyRiskData = (riskData: IRiskData) => {
  const isEmpty =
    !riskData.adms?.length &&
    !riskData.recs?.length &&
    !riskData.engs?.length &&
    !riskData.epis?.length &&
    !riskData.exams?.length &&
    !riskData.generateSources?.length &&
    !riskData.endDate &&
    !riskData.startDate &&
    !riskData.probability;

  return isEmpty;
};

const invalidateGho = (riskData: IRiskData[]) => {
  riskData.some((rd) => {
    const isEmpty = isEmptyRiskData(rd);
    if (!isEmpty) return;

    const riskDataGet = queryClient.getQueryData<IRiskData[]>(
      riskFactorDataByGhoQueryKey({
        companyId: rd.companyId,
        riskFactorGroupDataId: rd.riskFactorGroupDataId,
        homogeneousGroupId: rd.homogeneousGroupId,
        workspaceId: rd.workspaceId,
      }),
    );

    if (!riskDataGet || riskDataGet.length == 1) {
      queryClient.invalidateQueries([QueryEnum.GHO]);
      return true;
    }
  });
};

export interface IUpsertManyRiskData {
  id?: string;
  companyId?: string;
  riskFactorGroupDataId: string;
  riskId?: string;
  hierarchyIds?: string;
  workspaceId?: string;
  riskIds: string[];
  homogeneousGroupIds?: string[];
  probability?: number;
  type?: HomoTypeEnum;
  probabilityAfter?: number;
  adms?: string[];
  recs?: string[];
  engs?: string[];
  generateSources?: string[];
  epis?: number[];
  keepEmpty?: boolean;
}

export async function upsertManyRiskData(
  data: IUpsertManyRiskData,
  companyId?: string,
  routeWorkspaceId?: string,
) {
  if (!companyId) return null;

  const workspaceId = data.workspaceId || routeWorkspaceId;

  const response = await api.post<IRiskData[][]>(
    `${ApiRoutesEnum.RISK_DATA}/many`,
    {
      companyId,
      ...data,
      ...(workspaceId ? { workspaceId } : {}),
    },
  );

  return response.data.map((riskDataArray) => {
    return sortRiskData(riskDataArray);
  });
}

export function useMutUpsertManyRiskData() {
  const { getCompanyId, workspaceId, router } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();
  const operationWorkspaceId =
    workspaceId || (router.query.tabWorkspaceId as string | undefined);

  return useMutation(
    async (data: IUpsertManyRiskData) =>
      upsertManyRiskData(
        data,
        getCompanyId(data),
        data.workspaceId || operationWorkspaceId,
      ),
    {
      onSuccess: async (resp) => {
        if (resp && resp[0] && resp[0].length > 0) {
          queryClient.invalidateQueries([QueryEnum.ENVIRONMENT]);
          queryClient.invalidateQueries([QueryEnum.EXAMS_RISK_DATA]);
          queryClient.invalidateQueries([QueryEnum.CHARACTERIZATION]);
          const first = resp[0][0];
          const companyId = getCompanyId(resp);
          if (first?.riskFactorGroupDataId && first?.homogeneousGroupId) {
            queryClient.invalidateQueries(
              riskFactorDataByGhoQueryKeyPrefix({
                companyId,
                riskFactorGroupDataId: first.riskFactorGroupDataId,
                homogeneousGroupId: first.homogeneousGroupId,
              }),
            );
          } else if (first?.riskFactorGroupDataId) {
            queryClient.invalidateQueries([
              QueryEnum.RISK_DATA,
              companyId,
              first.riskFactorGroupDataId,
            ]);
          }

          return resp;
        }
      },
      onError: (error: IErrorResp) => {
        if (error.response?.data)
          enqueueSnackbar(error.response.data.message, { variant: 'error' });
      },
    },
  );
}
