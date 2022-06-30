import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { HomoTypeEnum } from 'core/enums/homo-type.enum';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IRiskData } from 'core/interfaces/api/IRiskData';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

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
) {
  if (!companyId) return null;

  const response = await api.post<IRiskData[][]>(
    `${ApiRoutesEnum.RISK_DATA}/many`,
    {
      companyId,
      ...data,
    },
  );

  return response.data;
}

export function useMutUpsertManyRiskData() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: IUpsertManyRiskData) =>
      upsertManyRiskData(data, getCompanyId(data)),
    {
      onSuccess: async (resp) => {
        if (resp && resp[0] && resp[0].length > 0) {
          queryClient.invalidateQueries([
            QueryEnum.RISK_DATA,
            getCompanyId(resp),
            resp[0][0].riskFactorGroupDataId,
          ]);
          if (resp[0][0].riskFactorGroupDataId)
            queryClient.invalidateQueries([
              QueryEnum.RISK_DATA,
              getCompanyId(resp),
              resp[0][0].riskFactorGroupDataId,
            ]);

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
